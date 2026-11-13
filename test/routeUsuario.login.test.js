const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, test } = require('node:test');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-bytes';
process.env.CORS_ORIGIN = 'http://localhost:5173,https://frontend.example';

let currentFixture;

function selectFields(record, select) {
    if (!select) return record;
    return Object.fromEntries(Object.keys(select).filter((field) => select[field]).map((field) => [field, record[field]]));
}

const prismaModulePath = require.resolve('../db/prisma');
require.cache[prismaModulePath] = {
    id: prismaModulePath,
    filename: prismaModulePath,
    loaded: true,
    exports: {
        user: {
            findUnique({ where, select }) {
                currentFixture.findCount += 1;
                const user = currentFixture.users.find((item) =>
                    where.id !== undefined ? item.id === where.id : item.email === where.email
                );
                return Promise.resolve(user ? selectFields(user, select) : null);
            },
            findMany({ select }) {
                return Promise.resolve(currentFixture.users.map((user) => selectFields(user, select)));
            },
            create(args) {
                currentFixture.createArgs = args;
                if (currentFixture.createHandler) return currentFixture.createHandler(args);
                return Promise.resolve({ id: 42 });
            },
            update({ where, data }) {
                const user = currentFixture.users.find((item) => item.id === where.id);
                if (!user) return Promise.reject(new Error('User not found'));
                Object.assign(user, data);
                currentFixture.updateCount += 1;
                currentFixture.updatedPassword = data.senha;
                return Promise.resolve(user);
            },
            updateMany({ where, data }) {
                const user = currentFixture.users.find((item) => item.id === where.id);
                if (!user) return Promise.resolve({ count: 0 });
                Object.assign(user, data);
                return Promise.resolve({ count: 1 });
            },
            deleteMany({ where }) {
                const index = currentFixture.users.findIndex((item) => item.id === where.id);
                if (index < 0) return Promise.resolve({ count: 0 });
                currentFixture.users.splice(index, 1);
                return Promise.resolve({ count: 1 });
            }
        }
    }
};

const app = require('../app');
let server;
let baseUrl;

function setupDatabase({ user, createHandler } = {}) {
    currentFixture = {
        users: user ? [{ ...user }] : [],
        findCount: 0,
        updateCount: 0,
        createHandler
    };
    return currentFixture;
}

async function postJson(path, body, token) {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });

    return {
        status: response.status,
        body: await response.json()
    };
}

function postLogin(body) {
    return postJson('/usuario/login', body);
}

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    delete require.cache[prismaModulePath];
});

test('autentica usuário ativo com senha hash e não retorna a senha', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    const fixture = setupDatabase({
        user: {
            id: 1,
            nome: 'Ana',
            email: 'ana@example.com',
            senha: senhaHash,
            ativo: true
        }
    });

    const response = await postLogin({ email: 'ana@example.com', senha: 'senha-correta' });

    assert.equal(response.status, 200);
    assert.equal(response.body.mensagem, 'Login realizado com sucesso.');
    assert.equal(response.body.usuario.email, 'ana@example.com');
    assert.equal(response.body.usuario.id_usu, 1);
    assert.equal('senha' in response.body.usuario, false);
    const token = jwt.verify(response.body.token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'loja-api',
        audience: 'loja-api'
    });
    assert.equal(token.sub, '1');
    assert.equal(fixture.findCount, 1);
});

test('rejeita senha incorreta', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    setupDatabase({
        user: { id: 1, email: 'ana@example.com', senha: senhaHash, ativo: true }
    });

    const response = await postLogin({ email: 'ana@example.com', senha: 'senha-incorreta' });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'Email ou senha inválidos.' });
});

test('rejeita usuário inativo mesmo com a senha correta', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    setupDatabase({
        user: { id: 1, email: 'ana@example.com', senha: senhaHash, ativo: false }
    });

    const response = await postLogin({ email: 'ana@example.com', senha: 'senha-correta' });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'Email ou senha inválidos.' });
});

test('rejeita credenciais ausentes sem consultar o Prisma', async () => {
    const fixture = setupDatabase();

    const response = await postLogin({ email: '', senha: '' });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Email e senha são obrigatórios.' });
    assert.equal(fixture.findCount, 0);
});

test('migra senha legada para hash após login válido', async () => {
    const fixture = setupDatabase({
        user: { id: 1, email: 'ana@example.com', senha: 'senha-legada', ativo: true }
    });

    const response = await postLogin({ email: 'ana@example.com', senha: 'senha-legada' });

    assert.equal(response.status, 200);
    assert.equal(fixture.updateCount, 1);
    assert.match(fixture.updatedPassword, /^\$2[aby]\$/);
    assert.equal(await bcrypt.compare('senha-legada', fixture.updatedPassword), true);
});

test('exige token para cadastrar usuário', async () => {
    const fixture = setupDatabase();

    const response = await postJson('/usuario', {
        nome: 'Maria',
        email: 'maria@exemplo.com',
        senha: 'senha-segura'
    });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'Autenticação obrigatória.' });
    assert.equal(fixture.findCount, 0);
});

test('exige token também nas rotas dos demais recursos', async () => {
    setupDatabase();
    const response = await fetch(`${baseUrl}/clientes`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, { error: 'Autenticação obrigatória.' });
});

test('permite preflight somente para origens configuradas e cabeçalhos da API', async () => {
    const allowedResponse = await fetch(`${baseUrl}/clientes`, {
        method: 'OPTIONS',
        headers: {
            Origin: 'https://frontend.example',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'authorization,content-type'
        }
    });

    assert.equal(allowedResponse.status, 204);
    assert.equal(allowedResponse.headers.get('access-control-allow-origin'), 'https://frontend.example');
    assert.match(allowedResponse.headers.get('access-control-allow-headers'), /Authorization/i);
    assert.match(allowedResponse.headers.get('access-control-allow-headers'), /Content-Type/i);

    const deniedResponse = await fetch(`${baseUrl}/clientes`, {
        method: 'OPTIONS',
        headers: {
            Origin: 'https://untrusted.example',
            'Access-Control-Request-Method': 'GET'
        }
    });
    assert.equal(deniedResponse.headers.get('access-control-allow-origin'), null);
});

test('cria usuário pelo Prisma e armazena somente o hash da senha', async () => {
    const senhaAdmin = await bcrypt.hash('senha-admin', 4);
    const fixture = setupDatabase({
        user: { id: 1, nome: 'Admin', email: 'admin@example.com', senha: senhaAdmin, ativo: true }
    });
    const login = await postLogin({ email: 'admin@example.com', senha: 'senha-admin' });
    const token = login.body.token;
    fixture.users[0].ativo = false;

    const revokedResponse = await postJson('/usuario', {
        nome: 'Maria',
        email: 'maria@exemplo.com',
        senha: 'senha-segura'
    }, token);

    assert.equal(revokedResponse.status, 401);
    fixture.users[0].ativo = true;

    const response = await postJson('/usuario', {
        nome: 'Maria',
        email: 'maria@exemplo.com',
        senha: 'senha-segura'
    }, token);

    assert.equal(response.status, 201);
    assert.equal(response.body.id_usu, 42);
    assert.equal(fixture.createArgs.data.nome, 'Maria');
    assert.equal(fixture.createArgs.data.email, 'maria@exemplo.com');
    assert.equal(await bcrypt.compare('senha-segura', fixture.createArgs.data.senha), true);
    assert.deepEqual(fixture.createArgs.select, { id: true });
});

test('retorna conflito quando o email já está cadastrado', async () => {
    const senhaAdmin = await bcrypt.hash('senha-admin', 4);
    setupDatabase({
        user: { id: 1, nome: 'Admin', email: 'admin@example.com', senha: senhaAdmin, ativo: true },
        createHandler: async () => {
            const error = new Error('Unique constraint failed');
            error.code = 'P2002';
            throw error;
        }
    });
    const login = await postLogin({ email: 'admin@example.com', senha: 'senha-admin' });

    const response = await postJson('/usuario', {
        nome: 'Maria',
        email: 'maria@exemplo.com',
        senha: 'senha-segura'
    }, login.body.token);

    assert.equal(response.status, 409);
    assert.deepEqual(response.body, { error: 'Já existe um usuário com esse email.' });
});
