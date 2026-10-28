const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM entradas ORDER BY id_entrada', (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            res.status(200).send({ entradas: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_entrada inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM entradas WHERE id_entrada = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.length === 0) return res.status(404).send({ error: 'Entrada não encontrada.' });
            res.status(200).send({ entrada: resultado[0] });
        });
    });
});

router.post('/', (req, res) => {
    const { id_produto, id_fornecedor, quantidade, valor_unitario, data_entrada, observacao } = req.body;

    if (!id_produto || !id_fornecedor || !quantidade || !valor_unitario) {
        return res.status(400).send({ error: 'id_produto, id_fornecedor, quantidade e valor_unitario são obrigatórios.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(
            'INSERT INTO entradas (id_produto, id_fornecedor, quantidade, valor_unitario, data_entrada, observacao) VALUES (?, ?, ?, ?, ?, ?)',
            [id_produto, id_fornecedor, quantidade, valor_unitario, data_entrada || null, observacao || null],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error: error.message || error });
                res.status(201).send({
                    mensagem: 'Entrada cadastrada com sucesso.',
                    id_entrada: resultado.insertId
                });
            }
        );
    });
});

router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_entrada inválido.' });
    }

    const camposPermitidos = ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario', 'data_entrada', 'observacao'];
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

        conn.query(`UPDATE entradas SET ${setClause} WHERE id_entrada = ?`, [...valores, id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Entrada não encontrada.' });
            res.status(200).send({ mensagem: 'Entrada atualizada com sucesso.' });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_entrada inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('DELETE FROM entradas WHERE id_entrada = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Entrada não encontrada.' });
            res.status(200).send({ mensagem: 'Entrada removida com sucesso.' });
        });
    });
});

module.exports = router;
