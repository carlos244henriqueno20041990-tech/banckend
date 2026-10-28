const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM saidas ORDER BY id_saida', (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            res.status(200).send({ saidas: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_saida inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('SELECT * FROM saidas WHERE id_saida = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.length === 0) return res.status(404).send({ error: 'Saída não encontrada.' });
            res.status(200).send({ saida: resultado[0] });
        });
    });
});

router.post('/', (req, res) => {
    const { id_produto, id_funcionario, quantidade, valor_unitario, data_saida, destino } = req.body;

    if (!id_produto || !id_funcionario || !quantidade || !valor_unitario) {
        return res.status(400).send({ error: 'id_produto, id_funcionario, quantidade e valor_unitario são obrigatórios.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(
            'INSERT INTO saidas (id_produto, id_funcionario, quantidade, valor_unitario, data_saida, destino) VALUES (?, ?, ?, ?, ?, ?)',
            [id_produto, id_funcionario, quantidade, valor_unitario, data_saida || null, destino || null],
            (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error: error.message || error });
                res.status(201).send({
                    mensagem: 'Saída cadastrada com sucesso.',
                    id_saida: resultado.insertId
                });
            }
        );
    });
});

router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_saida inválido.' });
    }

    const camposPermitidos = ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario', 'data_saida', 'destino'];
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

        conn.query(`UPDATE saidas SET ${setClause} WHERE id_saida = ?`, [...valores, id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Saída não encontrada.' });
            res.status(200).send({ mensagem: 'Saída atualizada com sucesso.' });
        });
    });
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_saida inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('DELETE FROM saidas WHERE id_saida = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Saída não encontrada.' });
            res.status(200).send({ mensagem: 'Saída removida com sucesso.' });
        });
    });
});

module.exports = router;
