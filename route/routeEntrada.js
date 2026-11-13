const { createCrudRouter, prepare } = require('./prismaCrud');

const config = {
    model: 'entrada',
    collection: 'entradas',
    singular: 'entrada',
    idField: 'id_entrada',
    responseId: 'id_entrada',
    notFoundMessage: 'Entrada não encontrada.',
    required: ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario'],
    requiredMessage: 'id_produto, id_fornecedor, quantidade e valor_unitario são obrigatórios.',
    createdMessage: 'Entrada cadastrada com sucesso.',
    updatedMessage: 'Entrada atualizada com sucesso.',
    deletedMessage: 'Entrada removida com sucesso.',
    fields: ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario', 'data_entrada', 'observacao'],
    types: {
        id_produto: 'int', id_fornecedor: 'int', quantidade: 'int',
        valor_unitario: 'float', data_entrada: 'date', observacao: 'string'
    },
    prepareCreate(body) {
        const data = prepare(this, body);
        data.data_entrada = body.data_entrada ? data.data_entrada : null;
        data.observacao = body.observacao || null;
        return data;
    },
    prepareUpdate(body) {
        return prepare(this, body);
    }
};

module.exports = createCrudRouter(config);
