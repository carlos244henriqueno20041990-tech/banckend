const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const camposPublicos = 'id_usu, nome, email, contato, genero, ativo, criado_em, atualizado_em';

function compararSenhaLegada(senha, senhaArmazenada) {
    const senhaBuffer = Buffer.from(senha, 'utf8');
    const armazenadaBuffer = Buffer.from(senhaArmazenada, 'utf8');

    return senhaBuffer.length === armazenadaBuffer.length &&
        crypto.timingSafeEqual(senhaBuffer, armazenadaBuffer);
}

router.post('/login', (req, res) => {
    const { email, senha } = req.body || {};

    if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
        return res.status(400).send({ error: 'Email e senha são obrigatórios.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(
            'SELECT id_usu, nome, email, senha, contato, genero, ativo, criado_em, atualizado_em FROM usuarios WHERE email = ? LIMIT 1',
            [email.trim()],
            async (queryError, resultado) => {
                if (queryError) {
                    conn.release();
                    return res.status(500).send({ error: queryError.message || queryError });
                }

                if (resultado.length === 0) {
                    conn.release();
                    return res.status(401).send({ error: 'Email ou senha inválidos.' });
                }

                const usuario = resultado[0];
                const senhaJaHash = /^\$2[aby]\$/.test(usuario.senha);
                let senhaValida;

                try {
                    senhaValida = senhaJaHash
                        ? await bcrypt.compare(senha, usuario.senha)
                        : compararSenhaLegada(senha, usuario.senha);
                } catch (compareError) {
                    console.error('Erro ao verificar senha do usuário:', compareError);
                    conn.release();
                    return res.status(500).send({ error: 'Erro ao autenticar usuário.' });
                }

                if (!senhaValida || Number(usuario.ativo) !== 1) {
                    conn.release();
                    return res.status(401).send({ error: 'Email ou senha inválidos.' });
                }

                const responderLogin = () => {
                    const usuarioPublico = { ...usuario };
                    delete usuarioPublico.senha;
                    conn.release();
                    return res.status(200).send({
                        mensagem: 'Login realizado com sucesso.',
                        usuario: usuarioPublico
                    });
                };

                if (senhaJaHash) return responderLogin();

                let senhaHash;
                try {
                    senhaHash = await bcrypt.hash(senha, 10);
                } catch (hashError) {
                    console.error('Erro ao atualizar hash de senha do usuário:', hashError);
                    conn.release();
                    return res.status(500).send({ error: 'Erro ao autenticar usuário.' });
                }

                conn.query(
                    'UPDATE usuarios SET senha = ? WHERE id_usu = ?',
                    [senhaHash, usuario.id_usu],
                    (updateError) => {
                        if (updateError) {
                            conn.release();
                            return res.status(500).send({ error: updateError.message || updateError });
                        }
                        responderLogin();
                    }
                );
            }
        );
    });
});

router.get('/', (req, res) => {
    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(`SELECT ${camposPublicos} FROM usuarios ORDER BY id_usu`, (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            res.status(200).send({ usuarios: resultado });
        });
    });
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_usu inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query(`SELECT ${camposPublicos} FROM usuarios WHERE id_usu = ?`, [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.length === 0) return res.status(404).send({ error: 'Usuário não encontrado.' });
            res.status(200).send({ usuario: resultado[0] });
        });
    });
});

router.post('/', (req, res) => {
    const { nome, email, senha, contato, genero, ativo } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).send({ error: 'Nome, email e senha são obrigatórios.' });
    }

    if (typeof senha !== 'string') {
        return res.status(400).send({ error: 'A senha deve ser um texto.' });
    }
    if (bcrypt.truncates(senha)) {
        return res.status(400).send({ error: 'A senha não pode exceder 72 bytes.' });
    }

    bcrypt.hash(senha, 10, (hashError, senhaHash) => {
        if (hashError) {
            console.error('Erro ao gerar hash de senha:', hashError);
            return res.status(500).send({ error: 'Erro ao criar usuário.' });
        }

        mysql.getConnection((error, conn) => {
            if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

            conn.query(
                'INSERT INTO usuarios (nome, email, senha, contato, genero, ativo) VALUES (?, ?, ?, ?, ?, ?)',
                [nome, email, senhaHash, contato || null, genero || null, ativo !== undefined ? ativo : 1],
                (error, resultado) => {
                    conn.release();
                    if (error) return res.status(500).send({ error: error.message || error });
                    res.status(201).send({
                        mensagem: 'Usuário criado com sucesso!',
                        id_usu: resultado.insertId
                    });
                }
            );
        });
    });
});

router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_usu inválido.' });
    }

    const camposPermitidos = ['nome', 'email', 'senha', 'contato', 'genero', 'ativo'];
    const campos = Object.keys(req.body || {});
    const invalidFields = campos.filter((campo) => !camposPermitidos.includes(campo));

    if (invalidFields.length > 0) {
        return res.status(400).send({ error: 'Campos inválidos: ' + invalidFields.join(', ') });
    }

    if (campos.length === 0) {
        return res.status(400).send({ error: 'Informe pelo menos um campo para atualizar.' });
    }

    const atualizarUsuario = (senhaHash) => {
        const valores = campos.map((campo) => campo === 'senha' ? senhaHash : req.body[campo]);
        const setClause = campos.map((campo) => `${campo} = ?`).join(', ');

        mysql.getConnection((error, conn) => {
            if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

            conn.query(`UPDATE usuarios SET ${setClause} WHERE id_usu = ?`, [...valores, id], (error, resultado) => {
                conn.release();
                if (error) return res.status(500).send({ error: error.message || error });
                if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Usuário não encontrado.' });
                res.status(200).send({ mensagem: 'Usuário atualizado com sucesso!' });
            });
        });
    };

    if (!campos.includes('senha')) return atualizarUsuario();
    if (typeof req.body.senha !== 'string' || !req.body.senha) {
        return res.status(400).send({ error: 'A senha deve ser um texto não vazio.' });
    }
    if (bcrypt.truncates(req.body.senha)) {
        return res.status(400).send({ error: 'A senha não pode exceder 72 bytes.' });
    }

    bcrypt.hash(req.body.senha, 10, (hashError, senhaHash) => {
        if (hashError) {
            console.error('Erro ao gerar hash de senha:', hashError);
            return res.status(500).send({ error: 'Erro ao atualizar usuário.' });
        }
        atualizarUsuario(senhaHash);
    });
});

router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).send({ error: 'id_usu inválido.' });
    }

    mysql.getConnection((error, conn) => {
        if (error) return res.status(500).send({ error: 'Erro ao conectar ao banco de dados.' });

        conn.query('DELETE FROM usuarios WHERE id_usu = ?', [id], (error, resultado) => {
            conn.release();
            if (error) return res.status(500).send({ error: error.message || error });
            if (resultado.affectedRows === 0) return res.status(404).send({ error: 'Usuário não encontrado.' });
            res.status(200).send({ mensagem: 'Usuário removido com sucesso!' });
        });
    });
});

module.exports = router;
