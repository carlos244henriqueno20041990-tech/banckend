const { createCrudRouter, prepare } = require('./prismaCrud');

const config = {
    model: 'pedido',
    collection: 'pedidos',
    singular: 'pedido',
    idField: 'id_pedido',
    responseId: 'id_pedido',
    notFoundMessage: 'Pedido não encontrado.',
    required: ['id_cliente'],
    requiredMessage: 'id_cliente é obrigatório.',
    createdMessage: 'Pedido cadastrado com sucesso.',
    updatedMessage: 'Pedido atualizado com sucesso.',
    deletedMessage: 'Pedido removido com sucesso.',
    fields: ['status', 'data_pedido', 'id_cliente'],
    booleanFields: ['status'],
    types: { status: 'boolean', data_pedido: 'date', id_cliente: 'int' },
    prepareCreate(body) {
        return {
            status: body.status !== undefined ? body.status === true || body.status === 1 || body.status === '1' : true,
            data_pedido: body.data_pedido ? prepare(this, body).data_pedido : null,
            id_cliente: Number(body.id_cliente)
        };
    },
    prepareUpdate(body) {
        return prepare(this, body);
    }
};

module.exports = createCrudRouter(config);
