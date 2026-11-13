const { createCrudRouter, prepare } = require('./prismaCrud');

const config = {
    model: 'saida',
    collection: 'saidas',
    singular: 'saida',
    idField: 'id_saida',
    responseId: 'id_saida',
    notFoundMessage: 'Saída não encontrada.',
    required: ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario'],
    requiredMessage: 'id_produto, id_funcionario, quantidade e valor_unitario são obrigatórios.',
    createdMessage: 'Saída cadastrada com sucesso.',
    updatedMessage: 'Saída atualizada com sucesso.',
    deletedMessage: 'Saída removida com sucesso.',
    fields: ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario', 'data_saida', 'destino'],
    types: {
        id_produto: 'int', id_funcionario: 'int', quantidade: 'int',
        valor_unitario: 'float', data_saida: 'date', destino: 'string'
    },
    prepareCreate(body) {
        const data = prepare(this, body);
        data.data_saida = body.data_saida ? data.data_saida : null;
        data.destino = body.destino || null;
        return data;
    },
    prepareUpdate(body) {
        return prepare(this, body);
    }
};

module.exports = createCrudRouter(config);
