const { createCrudRouter, prepare } = require('./prismaCrud');

const config = {
    model: 'fornecedor',
    collection: 'fornecedores',
    singular: 'fornecedor',
    idField: 'id_fornecedor',
    responseId: 'id_fornecedor',
    notFoundMessage: 'Fornecedor não encontrado.',
    required: ['nome'],
    requiredMessage: 'Nome é obrigatório.',
    createdMessage: 'Fornecedor cadastrado com sucesso.',
    updatedMessage: 'Fornecedor atualizado com sucesso.',
    deletedMessage: 'Fornecedor removido com sucesso.',
    fields: ['nome', 'empresa', 'email', 'telefone', 'cidade', 'estado', 'ativo'],
    booleanFields: ['ativo'],
    types: {
        nome: 'string', empresa: 'string', email: 'string', telefone: 'string',
        cidade: 'string', estado: 'string', ativo: 'boolean'
    },
    prepareCreate(body) {
        const data = prepare(this, body);
        for (const field of ['empresa', 'email', 'telefone', 'cidade', 'estado']) {
            if (!data[field]) data[field] = null;
        }
        data.ativo = body.ativo !== undefined ? body.ativo === true || body.ativo === 1 || body.ativo === '1' : true;
        return data;
    },
    prepareUpdate(body) {
        return prepare(this, body);
    }
};

module.exports = createCrudRouter(config);
