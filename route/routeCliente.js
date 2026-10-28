const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM clientes ORDER BY id_cliente', (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            res.status(200).send({ clientes: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_cliente inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM clientes WHERE id_cliente = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.length === 0) return res.status(404).send({ error: 'Cliente não encontrado.' });
            res.status(200).send({ cliente: resultado[0] });
        });
    });
});

router.post('/', (req, res) => {
    const { nome, email, contato, ativo } = req.body;

    if (!nome || !email) {
        return res.status(400).send({ error: 'Nome e email são obrigatórios.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(
            'INSERT INTO clientes (nome, email, contato, ativo) VALUES (?, ?, ?, ?)',
            [nome, email, contato || null, ativo !== undefined ? ativo : 1],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error: error.message || error });
                res.status(201).send({
                    mensagem: 'Cliente cadastrado com sucesso.',
                    id_cliente: resultado.insertId
                });
            }
        );
    });
});

router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_cliente inválido.' });
    }

    const camposPermitidos = ['nome', 'email', 'contato', 'ativo'];
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

        conn.query(`UPDATE clientes SET ${setClause} WHERE id_cliente = ?`, [...valores, id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Cliente não encontrado.' });
            res.status(200).send({ mensagem: 'Cliente atualizado com sucesso.' });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_cliente inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('DELETE FROM clientes WHERE id_cliente = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Cliente não encontrado.' });
            res.status(200).send({ mensagem: 'Cliente removido com sucesso.' });
        });
    });
});

module.exports = router;
