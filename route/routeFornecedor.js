const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM fornecedores ORDER BY id_fornecedor', (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            res.status(200).send({ fornecedores: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_fornecedor inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM fornecedores WHERE id_fornecedor = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.length === 0) return res.status(404).send({ error: 'Fornecedor não encontrado.' });
            res.status(200).send({ fornecedor: resultado[0] });
        });
    });
});

router.post('/', (req, res) => {
    const { nome, empresa, email, telefone, cidade, estado, ativo } = req.body;

    if (!nome) {
        return res.status(400).send({ error: 'Nome é obrigatório.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(
            'INSERT INTO fornecedores (nome, empresa, email, telefone, cidade, estado, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, empresa || null, email || null, telefone || null, cidade || null, estado || null, ativo !== undefined ? ativo : 1],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error: error.message || error });
                res.status(201).send({
                    mensagem: 'Fornecedor cadastrado com sucesso.',
                    id_fornecedor: resultado.insertId
                });
            }
        );
    });
});

router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_fornecedor inválido.' });
    }

    const camposPermitidos = ['nome', 'empresa', 'email', 'telefone', 'cidade', 'estado', 'ativo'];
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

        conn.query(`UPDATE fornecedores SET ${setClause} WHERE id_fornecedor = ?`, [...valores, id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Fornecedor não encontrado.' });
            res.status(200).send({ mensagem: 'Fornecedor atualizado com sucesso.' });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_fornecedor inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('DELETE FROM fornecedores WHERE id_fornecedor = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Fornecedor não encontrado.' });
            res.status(200).send({ mensagem: 'Fornecedor removido com sucesso.' });
        });
    });
});

module.exports = router;
