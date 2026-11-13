require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('../db/prisma');

async function criarAdministradorInicial() {
    const nome = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!nome || !email || !senha) {
        throw new Error('Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD para criar o administrador inicial.');
    }
    if (bcrypt.truncates(senha)) {
        throw new Error('ADMIN_PASSWORD não pode exceder 72 bytes.');
    }

    const totalUsuarios = await prisma.user.count();
    if (totalUsuarios > 0) {
        throw new Error('O administrador inicial só pode ser criado quando ainda não existem usuários.');
    }

    const usuario = await prisma.user.create({
        data: { nome, email, senha: await bcrypt.hash(senha, 10), ativo: true },
        select: { id: true }
    });

    console.log(`Administrador inicial criado (id_usu=${usuario.id}).`);
}

criarAdministradorInicial()
    .catch((error) => {
        console.error('Não foi possível criar o administrador inicial:', error.message);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
