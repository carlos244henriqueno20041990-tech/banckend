const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { autenticar, criarToken } = require('../middleware/authenticate');

const camposPublicos = {
    id: true,
    nome: true,
    email: true,
    contato: true,
    genero: true,
    ativo: true,
    criado_em: true,
    atualizado_em: true
};

function compararSenhaLegada(senha, senhaArmazenada) {
    const senhaBuffer = Buffer.from(senha, 'utf8');
    const armazenadaBuffer = Buffer.from(senhaArmazenada, 'utf8');

    return senhaBuffer.length === armazenadaBuffer.length &&
        crypto.timingSafeEqual(senhaBuffer, armazenadaBuffer);
}

function converterUsuario(usuario) {
    if (!usuario) return usuario;
    const { id, ...dados } = usuario;
    if (dados.ativo !== null && dados.ativo !== undefined) dados.ativo = Number(dados.ativo);
    return { id_usu: id, ...dados };
}

function enviarErro(res, mensagem, error) {
    console.error(mensagem, error);
    return res.status(500).send({ error: error.message || error });
}

router.post('/login', async (req, res) => {
    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
        return res.status(400).send({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const usuario = await prisma.user.findUnique({ where: { email: email.trim() } });
        if (!usuario) return res.status(401).send({ error: 'Email ou senha inválidos.' });

        const senhaJaHash = /^\$2[aby]\$/.test(usuario.senha);
        const senhaValida = senhaJaHash
            ? await bcrypt.compare(senha, usuario.senha)
            : compararSenhaLegada(senha, usuario.senha);

        if (!senhaValida || !usuario.ativo) {
            return res.status(401).send({ error: 'Email ou senha inválidos.' });
        }

        let usuarioAutenticado = usuario;
        if (!senhaJaHash) {
            const senhaHash = await bcrypt.hash(senha, 10);
            usuarioAutenticado = await prisma.user.update({
                where: { id: usuario.id },
                data: { senha: senhaHash }
            });
        }

        const usuarioPublico = converterUsuario(usuarioAutenticado);
        delete usuarioPublico.senha;
        return res.status(200).send({
            mensagem: 'Login realizado com sucesso.',
            token: criarToken(usuarioAutenticado.id),
            usuario: usuarioPublico
        });
    } catch (error) {
        return enviarErro(res, 'Erro ao autenticar usuário com Prisma:', error);
    }
});

router.use(autenticar);

router.get('/', async (req, res) => {
    try {
        const usuarios = await prisma.user.findMany({
            select: camposPublicos,
            orderBy: { id: 'asc' }
        });
        return res.status(200).send({ usuarios: usuarios.map(converterUsuario) });
    } catch (error) {
        return enviarErro(res, 'Erro ao listar usuários com Prisma:', error);
    }
});

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_usu inválido.' });
    }

    try {
        const usuario = await prisma.user.findUnique({
            where: { id },
            select: camposPublicos
        });
        if (!usuario) return res.status(404).send({ error: 'Usuário não encontrado.' });
        return res.status(200).send({ usuario: converterUsuario(usuario) });
    } catch (error) {
        return enviarErro(res, 'Erro ao consultar usuário com Prisma:', error);
    }
});

router.post('/', async (req, res) => {
    const { nome, email, senha, contato, genero, ativo } = req.body || {};
    if (!nome || !email || !senha) {
        return res.status(400).send({ error: 'Nome, email e senha são obrigatórios.' });
    }
    if (typeof senha !== 'string') {
        return res.status(400).send({ error: 'A senha deve ser um texto.' });
    }
    if (bcrypt.truncates(senha)) {
        return res.status(400).send({ error: 'A senha não pode exceder 72 bytes.' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const usuario = await prisma.user.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                contato: contato || null,
                genero: genero || null,
                ativo: ativo !== undefined ? ativo === true || ativo === 1 || ativo === '1' : true
            },
            select: { id: true }
        });

        return res.status(201).send({
            mensagem: 'Usuário criado com sucesso!',
            id_usu: usuario.id
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).send({ error: 'Já existe um usuário com esse email.' });
        }
        return enviarErro(res, 'Erro ao criar usuário com Prisma:', error);
    }
});

router.patch('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_usu inválido.' });
    }

    const camposPermitidos = ['nome', 'email', 'senha', 'contato', 'genero', 'ativo'];
    const body = req.body || {};
    const campos = Object.keys(body);
    const invalidFields = campos.filter((campo) => !camposPermitidos.includes(campo));
    if (invalidFields.length > 0) {
        return res.status(400).send({ error: 'Campos inválidos: ' + invalidFields.join(', ') });
    }
    if (campos.length === 0) {
        return res.status(400).send({ error: 'Informe pelo menos um campo para atualizar.' });
    }
    if (campos.includes('senha') && (typeof body.senha !== 'string' || !body.senha)) {
        return res.status(400).send({ error: 'A senha deve ser um texto não vazio.' });
    }
    if (campos.includes('senha') && bcrypt.truncates(body.senha)) {
        return res.status(400).send({ error: 'A senha não pode exceder 72 bytes.' });
    }

    try {
        const data = { ...body };
        if (campos.includes('senha')) data.senha = await bcrypt.hash(body.senha, 10);
        if (campos.includes('ativo')) {
            data.ativo = body.ativo === true || body.ativo === 1 || body.ativo === '1';
        }
        const result = await prisma.user.updateMany({ where: { id }, data });
        if (result.count === 0) return res.status(404).send({ error: 'Usuário não encontrado.' });
        return res.status(200).send({ mensagem: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        return enviarErro(res, 'Erro ao atualizar usuário com Prisma:', error);
    }
});

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_usu inválido.' });
    }

    try {
        const result = await prisma.user.deleteMany({ where: { id } });
        if (result.count === 0) return res.status(404).send({ error: 'Usuário não encontrado.' });
        return res.status(200).send({ mensagem: 'Usuário removido com sucesso!' });
    } catch (error) {
        return enviarErro(res, 'Erro ao remover usuário com Prisma:', error);
    }
});

module.exports = router;
