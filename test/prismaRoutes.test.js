const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { after, before, test } = require('node:test');

let fixture;

const prismaModulePath = require.resolve('../db/prisma');
require.cache[prismaModulePath] = {
    id: prismaModulePath,
    filename: prismaModulePath,
    loaded: true,
    exports: {
        cliente: {
            findMany(args) {
                fixture.findManyArgs = args;
                return Promise.resolve(fixture.clientes);
            },
            findUnique({ where }) {
                return Promise.resolve(fixture.clientes.find((item) => item.id_cliente === where.id_cliente) || null);
            },
            create({ data, select }) {
                fixture.createArgs = { data, select };
                return Promise.resolve({ id_cliente: 19 });
            },
            updateMany({ where, data }) {
                fixture.updateArgs = { where, data };
                return Promise.resolve({ count: fixture.clientes.some((item) => item.id_cliente === where.id_cliente) ? 1 : 0 });
            },
            deleteMany({ where }) {
                fixture.deleteArgs = { where };
                return Promise.resolve({ count: fixture.clientes.some((item) => item.id_cliente === where.id_cliente) ? 1 : 0 });
            }
        },
        $transaction: async (callback) => callback(fixture.transaction)
    }
};

const app = express();
app.use(express.json());
app.use('/clientes', require('../route/routeCliente'));
app.use('/estoque', require('../route/routeEstoque'));
let server;
let baseUrl;

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    delete require.cache[require.resolve('../route/routeCliente')];
    delete require.cache[require.resolve('../route/routeEstoque')];
    delete require.cache[require.resolve('../route/prismaCrud')];
    delete require.cache[prismaModulePath];
});

function resetFixture() {
    fixture = {
        clientes: [{ id_cliente: 3, nome: 'Ana', email: 'ana@example.com', ativo: true }],
        transaction: {
            $queryRaw: async () => [{ id_produto: 7 }],
            estoque: {
                findFirst: async () => null,
                create: async ({ data, select }) => {
                    fixture.stockCreateArgs = { data, select };
                    return { id_estoque: 12 };
                }
            }
        }
    };
    return fixture;
}

async function send(path, { method = 'GET', body } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
}

test('Prisma CRUD conserva o formato e normaliza os campos booleanos da API', async () => {
    const state = resetFixture();

    const list = await send('/clientes');
    assert.equal(list.status, 200);
    assert.equal(list.body.clientes[0].ativo, 1);
    assert.deepEqual(state.findManyArgs, { orderBy: { id_cliente: 'asc' } });

    const detail = await send('/clientes/3');
    assert.equal(detail.status, 200);
    assert.equal(detail.body.cliente.id_cliente, 3);
    assert.equal((await send('/clientes/invalid')).status, 400);
    assert.equal((await send('/clientes/99')).status, 404);
});

test('Prisma CRUD valida e mapeia criação, atualização e remoção', async () => {
    const state = resetFixture();

    assert.equal((await send('/clientes', { method: 'POST', body: { nome: 'Ana' } })).status, 400);
    const created = await send('/clientes', {
        method: 'POST',
        body: { nome: 'Bia', email: 'bia@example.com' }
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.id_cliente, 19);
    assert.equal(state.createArgs.data.ativo, true);

    assert.equal((await send('/clientes/3', { method: 'PATCH', body: { senha: 'inválido' } })).status, 400);
    assert.equal((await send('/clientes/99', { method: 'PATCH', body: { nome: 'Ausente' } })).status, 404);
    const updated = await send('/clientes/3', { method: 'PATCH', body: { ativo: 0 } });
    assert.equal(updated.status, 200);
    assert.equal(state.updateArgs.data.ativo, false);

    assert.equal((await send('/clientes/99', { method: 'DELETE' })).status, 404);
    assert.equal((await send('/clientes/3', { method: 'DELETE' })).status, 200);
});

test('cadastro de estoque usa transação Prisma e mantém validações e resposta existentes', async () => {
    const state = resetFixture();

    const invalid = await send('/estoque', {
        method: 'POST',
        body: { id_produto: 7, quantidade: -1 }
    });
    assert.equal(invalid.status, 400);

    const created = await send('/estoque', {
        method: 'POST',
        body: { id_produto: 7, quantidade: 0, estoque_minimo: 0, estoque_maximo: 10 }
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.id, 12);
    assert.deepEqual(state.stockCreateArgs.data, {
        id_produto: 7,
        quantidade: 0,
        estoque_minimo: 0,
        estoque_maximo: 10,
        localizacao: null
    });
});
