const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { after, before, test } = require('node:test');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-bytes';

const routeCases = [
    {
        model: 'cliente', path: '/clientes', collection: 'clientes', singular: 'cliente', idField: 'id_cliente',
        body: { nome: 'Cliente novo', email: 'novo@example.com' }, update: { nome: 'Cliente atualizado' }
    },
    {
        model: 'fornecedor', path: '/fornecedores', collection: 'fornecedores', singular: 'fornecedor', idField: 'id_fornecedor',
        body: { nome: 'Fornecedor novo' }, update: { nome: 'Fornecedor atualizado' }
    },
    {
        model: 'produto', path: '/produtos', collection: 'produtos', singular: 'produto', idField: 'id_produto',
        body: { nome: 'Produto novo', descricao: 'Descrição', preco: 12.5, imagem_produto: 'imagem.png' },
        update: { preco: 15 }
    },
    {
        model: 'pedido', path: '/pedidos', collection: 'pedidos', singular: 'pedido', idField: 'id_pedido',
        body: { id_cliente: 1 }, update: { status: 0 }
    },
    {
        model: 'entrada', path: '/entradas', collection: 'entradas', singular: 'entrada', idField: 'id_entrada',
        body: { id_produto: 1, id_fornecedor: 1, quantidade: 2, valor_unitario: 3.5 },
        update: { observacao: 'Atualizada' }
    },
    {
        model: 'saida', path: '/saidas', collection: 'saidas', singular: 'saida', idField: 'id_saida',
        body: { id_produto: 1, id_funcionario: 1, quantidade: 2, valor_unitario: 3.5 },
        update: { destino: 'Atualizado' }
    },
    {
        model: 'user', path: '/usuario', collection: 'usuarios', singular: 'usuario', idField: 'id_usu',
        body: { nome: 'Usuário novo', email: 'novo@example.com', senha: 'senha-segura' },
        update: { nome: 'Usuário atualizado' }
    }
];

const definitions = Object.fromEntries(routeCases.map((item) => [item.model, item]));
let fixture;

function getId(record, model) {
    return model === 'user' ? record.id : record[definitions[model].idField];
}

function selectRecord(record, select) {
    if (!select) return { ...record };
    return Object.fromEntries(Object.keys(select)
        .filter((field) => select[field])
        .map((field) => [field, record[field]]));
}

function createModel(model) {
    return {
        findMany() {
            return Promise.resolve(fixture[model].map((record) => ({ ...record })));
        },
        findUnique({ where, select }) {
            const id = model === 'user' ? where.id : where[definitions[model].idField];
            const record = fixture[model].find((item) => getId(item, model) === id);
            return Promise.resolve(record ? selectRecord(record, select) : null);
        },
        create({ data, select }) {
            const id = Math.max(0, ...fixture[model].map((record) => getId(record, model))) + 1;
            const record = model === 'user' ? { id, ...data } : { ...data, [definitions[model].idField]: id };
            fixture[model].push(record);
            return Promise.resolve(selectRecord(record, select));
        },
        update({ where, data }) {
            const record = fixture[model].find((item) => getId(item, model) === where.id);
            if (!record) return Promise.reject(new Error('Record not found'));
            Object.assign(record, data);
            return Promise.resolve({ ...record });
        },
        updateMany({ where, data }) {
            const id = model === 'user' ? where.id : where[definitions[model].idField];
            const record = fixture[model].find((item) => getId(item, model) === id);
            if (!record) return Promise.resolve({ count: 0 });
            Object.assign(record, data);
            return Promise.resolve({ count: 1 });
        },
        deleteMany({ where }) {
            const id = model === 'user' ? where.id : where[definitions[model].idField];
            const index = fixture[model].findIndex((item) => getId(item, model) === id);
            if (index < 0) return Promise.resolve({ count: 0 });
            fixture[model].splice(index, 1);
            return Promise.resolve({ count: 1 });
        }
    };
}

const prisma = Object.fromEntries([
    ...routeCases.map(({ model }) => [model, createModel(model)]),
    ['estoque', {
        findFirst({ where }) {
            return Promise.resolve(fixture.estoque.find((item) => item.id_produto === where.id_produto) || null);
        },
        findUnique({ where }) {
            return Promise.resolve(fixture.estoque.find((item) => item.id_estoque === where.id_estoque) || null);
        },
        deleteMany({ where }) {
            const index = fixture.estoque.findIndex((item) =>
                item.id_estoque === where.id_estoque && item.quantidade === where.quantidade
            );
            if (index < 0) return Promise.resolve({ count: 0 });
            fixture.estoque.splice(index, 1);
            return Promise.resolve({ count: 1 });
        }
    }],
    ['$transaction', (callback) => callback({
        $queryRaw: async () => [{ id_produto: 1 }],
        estoque: {
            findFirst({ where }) {
                return Promise.resolve(fixture.estoque.find((item) => item.id_produto === where.id_produto) || null);
            },
            create({ data }) {
                const id_estoque = Math.max(0, ...fixture.estoque.map((item) => item.id_estoque)) + 1;
                fixture.estoque.push({ id_estoque, ...data });
                return Promise.resolve({ id_estoque });
            }
        }
    })]
]);

const prismaModulePath = require.resolve('../db/prisma');
require.cache[prismaModulePath] = {
    id: prismaModulePath,
    filename: prismaModulePath,
    loaded: true,
    exports: prisma
};

const app = express();
app.use(express.json());
for (const { path, model } of routeCases) {
    app.use(path, require(`../route/route${model === 'user' ? 'Usuario' : {
        cliente: 'Cliente',
        fornecedor: 'Fornecedor',
        produto: 'Produto',
        pedido: 'Pedido',
        entrada: 'Entrada',
        saida: 'Saida'
    }[model]}`));
}
app.use('/estoque', require('../route/routeEstoque'));

let server;
let baseUrl;

function resetFixture() {
    fixture = { estoque: [] };
    for (const { model, idField } of routeCases) {
        fixture[model] = [model === 'user'
            ? { id: 1, nome: 'Registro existente', email: 'existente@example.com', senha: 'hash', ativo: true }
            : { [idField]: 1, nome: 'Registro existente', ativo: true }];
    }
}

async function send(path, { method = 'GET', body } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            Authorization: `Bearer ${jwt.sign({ sub: '1' }, process.env.JWT_SECRET, {
                algorithm: 'HS256',
                issuer: 'loja-api',
                audience: 'loja-api',
                expiresIn: '1h'
            })}`
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const contentType = response.headers.get('content-type') || '';
    return {
        status: response.status,
        body: contentType.includes('application/json') ? await response.json() : await response.text()
    };
}

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    delete require.cache[prismaModulePath];
});

test('consultas, cadastros, atualizações e exclusões funcionam em todos os recursos CRUD', async () => {
    for (const resource of routeCases) {
        resetFixture();

        const list = await send(resource.path);
        assert.equal(list.status, 200, `${resource.path} lista registros`);
        assert.equal(list.body[resource.collection].length, 1);

        const detail = await send(`${resource.path}/1`);
        assert.equal(detail.status, 200, `${resource.path}/1 consulta o registro`);
        assert.equal(detail.body[resource.singular][resource.idField], 1);
        if (resource.model === 'user') {
            assert.equal('senha' in detail.body.usuario, false, 'a consulta de usuário não expõe a senha');
        }

        const created = await send(resource.path, { method: 'POST', body: resource.body });
        assert.equal(created.status, 201, `${resource.path} cadastra o registro`);
        assert.ok(created.body[resource.idField] > 1);

        const updated = await send(`${resource.path}/${created.body[resource.idField]}`, {
            method: 'PATCH',
            body: resource.update
        });
        assert.equal(updated.status, 200, `${resource.path} atualiza o registro`);

        const deleted = await send(`${resource.path}/${created.body[resource.idField]}`, { method: 'DELETE' });
        assert.equal(deleted.status, 200, `${resource.path} exclui o registro`);
    }
});

test('consultas, criação e exclusão de estoque respeitam os estados do registro', async () => {
    resetFixture();

    const invalid = await send('/estoque', {
        method: 'POST',
        body: { id_produto: 1, quantidade: -1 }
    });
    assert.equal(invalid.status, 400);

    const created = await send('/estoque', {
        method: 'POST',
        body: { id_produto: 1, quantidade: 0 }
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.id, 1);

    const duplicate = await send('/estoque', {
        method: 'POST',
        body: { id_produto: 1, quantidade: 3 }
    });
    assert.equal(duplicate.status, 409);

    const deleted = await send('/estoque/1', { method: 'DELETE' });
    assert.equal(deleted.status, 200);

    fixture.estoque.push({ id_estoque: 2, id_produto: 1, quantidade: 3 });
    const nonEmptyDelete = await send('/estoque/2', { method: 'DELETE' });
    assert.equal(nonEmptyDelete.status, 409);
});
