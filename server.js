require('dotenv').config();
const express = require('express');
const http = require('http');

const app = require('./app');
const prisma = require('./db/prisma');

const port = Number(process.env.PORT || 5002);
const host = process.env.IP || '::';
const apiBasePath = process.env.API_BASE_PATH;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
}
if (apiBasePath && (!apiBasePath.startsWith('/') || apiBasePath.endsWith('/'))) {
    throw new Error('API_BASE_PATH must start with "/" and must not end with "/".');
}

async function startServer() {
    await prisma.$connect();

    const serverApp = express();
    serverApp.use(apiBasePath || '/', app);
    const server = http.createServer(serverApp);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, host, () => {
            server.off('error', reject);
            resolve();
        });
    });

    console.log(`Servidor rodando na porta ${port}`);

    let shuttingDown = false;
    const shutdown = (signal) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`Sinal ${signal} recebido; encerrando o servidor.`);

        server.close(async (error) => {
            if (error) {
                console.error('Erro ao encerrar o servidor HTTP:', error);
                process.exitCode = 1;
            }

            try {
                await prisma.$disconnect();
            } catch (disconnectError) {
                console.error('Erro ao encerrar a conexão com o banco:', disconnectError);
                process.exitCode = 1;
            }
        });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch(async (error) => {
    console.error('Falha ao iniciar o servidor ou conectar ao banco:', error);
    try {
        await prisma.$disconnect();
    } catch (disconnectError) {
        console.error('Erro ao encerrar a conexão com o banco:', disconnectError);
    }
    process.exitCode = 1;
});