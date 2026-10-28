const express = require('express');
const pool = require('../mysql').pool;

const router = express.Router();

function sendError(res, connection, status, message) {
    connection.rollback(() => {
        connection.release();
        res.status(status).send({ error: message });
    });
}

router.post('/', (req, res) => {
    const allowedFields = ['id_produto', 'quantidade', 'estoque_minimo', 'estoque_maximo', 'localizacao'];
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).send({ error: 'Envie um objeto JSON.' });
    }
    if (Object.keys(body).some((field) => !allowedFields.includes(field))) {
        return res.status(400).send({ error: 'A requisição contém campos não permitidos.' });
    }
    if (body.id_produto === undefined || body.quantidade === undefined) {
        return res.status(400).send({ error: 'Informe o produto e a quantidade inicial.' });
    }

    const productId = Number(body.id_produto);
    const quantity = Number(body.quantidade);
    if (!Number.isInteger(productId) || productId < 1) {
        return res.status(400).send({ error: 'id_produto deve ser um inteiro positivo.' });
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
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

    pool.getConnection((connectionError, connection) => {
        if (connectionError) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });
        connection.beginTransaction((transactionError) => {
            if (transactionError) {
                connection.release();
                return res.status(500).send({ error: 'Não foi possível iniciar a operação.' });
            }

            connection.query('SELECT id_produto FROM produtos WHERE id_produto = ? FOR UPDATE', [productId], (productError, products) => {
                if (productError) return sendError(res, connection, 500, 'Erro ao consultar produto.');
                if (products.length === 0) return sendError(res, connection, 404, 'Produto não encontrado.');

                connection.query('SELECT id_estoque FROM estoque WHERE id_produto = ? FOR UPDATE', [productId], (stockError, stocks) => {
                    if (stockError) return sendError(res, connection, 500, 'Erro ao consultar estoque.');
                    if (stocks.length > 0) return sendError(res, connection, 409, 'Já existe um registro de estoque para esse produto.');

                    const fields = allowedFields.filter((field) => body[field] !== undefined);
                    const columns = fields.map((field) => `\`${field}\``).join(', ');
                    const placeholders = fields.map(() => '?').join(', ');
                    const values = fields.map((field) => body[field]);
                    connection.query(`INSERT INTO estoque (${columns}) VALUES (${placeholders})`, values, (insertError, result) => {
                        if (insertError) return sendError(res, connection, 500, 'Erro ao cadastrar estoque.');
                        connection.commit((commitError) => {
                            if (commitError) return sendError(res, connection, 500, 'Não foi possível confirmar a operação.');
                            connection.release();
                            res.status(201).send({ mensagem: 'Estoque cadastrado com sucesso.', id: result.insertId });
                        });
                    });
                });
            });
        });
    });
});

router.delete('/:id', (req, res) => {
    const stockId = Number(req.params.id);
    if (!Number.isInteger(stockId) || stockId < 1) {
        return res.status(400).send({ error: 'id_estoque deve ser um inteiro positivo.' });
    }

    pool.getConnection((connectionError, connection) => {
        if (connectionError) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });
        connection.beginTransaction((transactionError) => {
            if (transactionError) {
                connection.release();
                return res.status(500).send({ error: 'Não foi possível iniciar a operação.' });
            }

            connection.query('SELECT quantidade FROM estoque WHERE id_estoque = ? FOR UPDATE', [stockId], (stockError, stocks) => {
                if (stockError) return sendError(res, connection, 500, 'Erro ao consultar estoque.');
                if (stocks.length === 0) return sendError(res, connection, 404, 'Registro de estoque não encontrado.');
                if (Number(stocks[0].quantidade) !== 0) {
                    return sendError(res, connection, 409, 'Não é possível remover um estoque com saldo disponível.');
                }

                connection.query('DELETE FROM estoque WHERE id_estoque = ?', [stockId], (deleteError) => {
                    if (deleteError) return sendError(res, connection, 500, 'Erro ao remover estoque.');
                    connection.commit((commitError) => {
                        if (commitError) return sendError(res, connection, 500, 'Não foi possível confirmar a operação.');
                        connection.release();
                        res.status(200).send({ mensagem: 'Registro de estoque removido com sucesso.' });
                    });
                });
            });
        });
    });
});

module.exports = router;
