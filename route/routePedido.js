const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM pedidos ORDER BY id_pedido', (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            res.status(200).send({ pedidos: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_pedido inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.length === 0) return res.status(404).send({ error: 'Pedido não encontrado.' });
            res.status(200).send({ pedido: resultado[0] });
        });
    });
});

router.post('/', (req, res) => {
    const { status, data_pedido, id_cliente } = req.body;

    if (!id_cliente) {
        return res.status(400).send({ error: 'id_cliente é obrigatório.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(
            'INSERT INTO pedidos (status, data_pedido, id_cliente) VALUES (?, ?, ?)',
            [status !== undefined ? status : 1, data_pedido || null, id_cliente],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error: error.message || error });
                res.status(201).send({
                    mensagem: 'Pedido cadastrado com sucesso.',
                    id_pedido: resultado.insertId
                });
            }
        );
    });
});

router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_pedido inválido.' });
    }

    const camposPermitidos = ['status', 'data_pedido', 'id_cliente'];
    const campos = Object.keys(req.body || {});
    const invalidFields = campos.filter((campo) => !camposPermitidos.includes(campo));

    if (invalidFields.length > 0) {
        return res.status(400).send({ error: 'Campos inválidos: ' + invalidFields.join(', ') });
    }

    if (campos.length === 0) {
        return res.status(400).send({ error: 'Informe pelo menos um campo para atualizar.' });
    }

    const valores = campos.map((campo) => req.body[campo]);
    const setClause = campos.map((campo) => `${campo} = ?`).join(', ');

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(`UPDATE pedidos SET ${setClause} WHERE id_pedido = ?`, [...valores, id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Pedido não encontrado.' });
            res.status(200).send({ mensagem: 'Pedido atualizado com sucesso.' });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_pedido inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('DELETE FROM pedidos WHERE id_pedido = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Pedido não encontrado.' });
            res.status(200).send({ mensagem: 'Pedido removido com sucesso.' });
        });
    });
});

module.exports = router;
