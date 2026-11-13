const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const secret = process.env.JWT_SECRET;
if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes.');
}

const tokenOptions = {
    algorithm: 'HS256',
    issuer: 'loja-api',
    audience: 'loja-api',
    expiresIn: '8h'
};

function criarToken(usuarioId) {
    return jwt.sign({ sub: String(usuarioId) }, secret, tokenOptions);
}

function autenticar(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
        return res.status(401).send({ error: 'Autenticação obrigatória.' });
    }

    let payload;
    try {
        payload = jwt.verify(match[1], secret, {
            algorithms: ['HS256'],
            issuer: tokenOptions.issuer,
            audience: tokenOptions.audience
        });
    } catch {
        return res.status(401).send({ error: 'Token inválido ou expirado.' });
    }

    const usuarioId = Number(payload.sub);
    if (!Number.isInteger(usuarioId) || usuarioId < 1) {
        return res.status(401).send({ error: 'Token inválido ou expirado.' });
    }

    prisma.user.findUnique({
        where: { id: usuarioId },
        select: { id: true, ativo: true }
    }).then((usuario) => {
        if (!usuario || !usuario.ativo) {
            return res.status(401).send({ error: 'Usuário inválido ou inativo.' });
        }

        req.usuarioId = usuario.id;
        return next();
    }).catch((error) => {
        console.error('Erro ao validar autenticação:', error);
        return res.status(500).send({ error: 'Erro ao validar autenticação.' });
    });
}

module.exports = { autenticar, criarToken };
