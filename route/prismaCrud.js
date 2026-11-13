const express = require('express');

function convertValue(type, value) {
    if (value === '' && type !== 'string') return null;
    if (value == null) return value;
    if (type === 'int') return Number(value);
    if (type === 'float') return Number(value);
    if (type === 'boolean') return value === true || value === 1 || value === '1';
    if (type === 'date') return value instanceof Date ? value : new Date(`${value}T00:00:00.000Z`);
    return value;
}

function formatRecord(config, record) {
    if (!record) return record;
    const formatted = { ...record };
    for (const field of config.booleanFields || []) {
        if (formatted[field] !== null && formatted[field] !== undefined) {
            formatted[field] = Number(formatted[field]);
        }
    }
    return formatted;
}

function createCrudRouter(config) {
    const router = express.Router();
    const prisma = require('../db/prisma');
    const model = prisma[config.model];

    router.get('/', async (req, res) => {
        try {
            const records = await model.findMany({ orderBy: { [config.idField]: 'asc' } });
            res.status(200).send({ [config.collection]: records.map((record) => formatRecord(config, record)) });
        } catch (error) {
            console.error(`Erro ao listar ${config.collection} com Prisma:`, error);
            res.status(500).send({ error: error.message || error });
        }
    });

    router.get('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).send({ error: `${config.idField} inválido.` });
        }

        try {
            const record = await model.findUnique({ where: { [config.idField]: id } });
            if (!record) return res.status(404).send({ error: config.notFoundMessage });
            res.status(200).send({ [config.singular]: formatRecord(config, record) });
        } catch (error) {
            console.error(`Erro ao consultar ${config.singular} com Prisma:`, error);
            res.status(500).send({ error: error.message || error });
        }
    });

    router.post('/', async (req, res) => {
        const body = req.body || {};
        const missing = config.required.filter((field) => !body[field]);
        if (missing.length) {
            return res.status(400).send({ error: config.requiredMessage });
        }

        try {
            const data = config.prepareCreate(body);
            const record = await model.create({ data, select: { [config.idField]: true } });
            res.status(201).send({
                mensagem: config.createdMessage,
                [config.responseId]: record[config.idField]
            });
        } catch (error) {
            console.error(`Erro ao cadastrar ${config.singular} com Prisma:`, error);
            res.status(500).send({ error: error.message || error });
        }
    });

    router.patch('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).send({ error: `${config.idField} inválido.` });
        }

        const body = req.body || {};
        const fields = Object.keys(body);
        const invalidFields = fields.filter((field) => !config.fields.includes(field));
        if (invalidFields.length) {
            return res.status(400).send({ error: `Campos inválidos: ${invalidFields.join(', ')}` });
        }
        if (fields.length === 0) {
            return res.status(400).send({ error: 'Informe pelo menos um campo para atualizar.' });
        }

        try {
            const result = await model.updateMany({
                where: { [config.idField]: id },
                data: config.prepareUpdate(body)
            });
            if (result.count === 0) {
                return res.status(404).send({ error: config.notFoundMessage });
            }
            res.status(200).send({ mensagem: config.updatedMessage });
        } catch (error) {
            console.error(`Erro ao atualizar ${config.singular} com Prisma:`, error);
            res.status(500).send({ error: error.message || error });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).send({ error: `${config.idField} inválido.` });
        }

        try {
            const result = await model.deleteMany({ where: { [config.idField]: id } });
            if (result.count === 0) {
                return res.status(404).send({ error: config.notFoundMessage });
            }
            res.status(200).send({ mensagem: config.deletedMessage });
        } catch (error) {
            console.error(`Erro ao remover ${config.singular} com Prisma:`, error);
            res.status(500).send({ error: error.message || error });
        }
    });

    return router;
}

function prepare(config, body) {
    const data = {};
    for (const [field, type] of Object.entries(config.types || {})) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            data[field] = convertValue(type, body[field]);
        }
    }
    return data;
}

module.exports = { createCrudRouter, prepare };
