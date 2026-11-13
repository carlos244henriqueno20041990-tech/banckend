const express = require('express');
const prisma = require('../db/prisma');

const router = express.Router();

router.post('/', async (req, res) => {
    const body = req.body;
    const allowedFields = ['id_produto', 'quantidade', 'estoque_minimo', 'estoque_maximo', 'localizacao'];

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).send({ error: 'Envie um objeto JSON.' });
    }
    if (Object.keys(body).some((field) => !allowedFields.includes(field))) {
        return res.status(400).send({ error: 'A requisição contém campos não permitidos.' });
    }
    if (body.id_produto === undefined || body.quantidade === undefined) {
        return res.status(400).send({ error: 'Informe o produto e a quantidade inicial.' });
    }

    const idProduto = Number(body.id_produto);
    const quantidade = Number(body.quantidade);
    if (!Number.isInteger(idProduto) || idProduto < 1) {
        return res.status(400).send({ error: 'id_produto deve ser um inteiro positivo.' });
    }
    if (!Number.isInteger(quantidade) || quantidade < 0) {
        return res.status(400).send({ error: 'quantidade deve ser um inteiro não negativo.' });
    }

    for (const field of ['estoque_minimo', 'estoque_maximo']) {
        if (body[field] !== undefined && body[field] !== null &&
            (!Number.isInteger(Number(body[field])) || Number(body[field]) < 0)) {
            return res.status(400).send({ error: `${field} deve ser um inteiro não negativo.` });
        }
    }
    if (body.estoque_minimo != null && body.estoque_maximo != null &&
        Number(body.estoque_minimo) > Number(body.estoque_maximo)) {
        return res.status(400).send({ error: 'estoque_minimo não pode ser maior que estoque_maximo.' });
    }
    if (body.localizacao !== undefined && body.localizacao !== null &&
        (typeof body.localizacao !== 'string' || body.localizacao.length > 100)) {
        return res.status(400).send({ error: 'localizacao deve ser um texto de até 100 caracteres.' });
    }

    try {
        const estoque = await prisma.$transaction(async (transaction) => {
            const produtos = await transaction.$queryRaw`
                SELECT id_produto FROM produtos WHERE id_produto = ${idProduto} FOR UPDATE
            `;
            if (produtos.length === 0) {
                const error = new Error('Produto não encontrado.');
                error.status = 404;
                throw error;
            }

            const existente = await transaction.estoque.findFirst({ where: { id_produto: idProduto } });
            if (existente) {
                const error = new Error('Já existe um registro de estoque para esse produto.');
                error.status = 409;
                throw error;
            }

            return transaction.estoque.create({
                data: {
                    id_produto: idProduto,
                    quantidade,
                    estoque_minimo: body.estoque_minimo == null ? null : Number(body.estoque_minimo),
                    estoque_maximo: body.estoque_maximo == null ? null : Number(body.estoque_maximo),
                    localizacao: body.localizacao || null
                },
                select: { id_estoque: true }
            });
        });

        return res.status(201).send({
            mensagem: 'Estoque cadastrado com sucesso.',
            id: estoque.id_estoque
        });
    } catch (error) {
        if (error.status) return res.status(error.status).send({ error: error.message });
        console.error('Erro ao cadastrar estoque com Prisma:', error);
        return res.status(500).send({ error: 'Erro ao cadastrar estoque.' });
    }
});

router.delete('/:id', async (req, res) => {
    const idEstoque = Number(req.params.id);
    if (!Number.isInteger(idEstoque) || idEstoque < 1) {
        return res.status(400).send({ error: 'id_estoque deve ser um inteiro positivo.' });
    }

    try {
        const result = await prisma.estoque.deleteMany({
            where: { id_estoque: idEstoque, quantidade: 0 }
        });
        if (result.count > 0) {
            return res.status(200).send({ mensagem: 'Registro de estoque removido com sucesso.' });
        }

        const estoque = await prisma.estoque.findUnique({ where: { id_estoque: idEstoque } });
        if (!estoque) {
            return res.status(404).send({ error: 'Registro de estoque não encontrado.' });
        }
        return res.status(409).send({ error: 'Não é possível remover um estoque com saldo disponível.' });
    } catch (error) {
        console.error('Erro ao remover estoque com Prisma:', error);
        return res.status(500).send({ error: 'Erro ao remover estoque.' });
    }
});

module.exports = router;
