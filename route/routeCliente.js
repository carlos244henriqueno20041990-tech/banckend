const { createCrudRouter, prepare } = require('./prismaCrud');

const config = {
    model: 'cliente',
    collection: 'clientes',
    singular: 'cliente',
    idField: 'id_cliente',
    responseId: 'id_cliente',
    notFoundMessage: 'Cliente não encontrado.',
    required: ['nome', 'email'],
    requiredMessage: 'Nome e email são obrigatórios.',
    createdMessage: 'Cliente cadastrado com sucesso.',
    updatedMessage: 'Cliente atualizado com sucesso.',
    deletedMessage: 'Cliente removido com sucesso.',
    fields: ['nome', 'email', 'contato', 'ativo'],
    booleanFields: ['ativo'],
    types: { nome: 'string', email: 'string', contato: 'string', ativo: 'boolean' },
    prepareCreate(body) {
        return { ...prepare(this, body), ativo: body.ativo !== undefined ? body.ativo === true || body.ativo === 1 || body.ativo === '1' : true };
    },
    prepareUpdate(body) {
        return prepare(this, body);
    }
};

module.exports = createCrudRouter(config);
