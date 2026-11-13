const { createCrudRouter, prepare } = require('./prismaCrud');

const config = {
    model: 'produto',
    collection: 'produtos',
    singular: 'produto',
    idField: 'id_produto',
    responseId: 'id_produto',
    notFoundMessage: 'Produto não encontrado.',
    required: ['nome', 'descricao', 'preco', 'imagem_produto'],
    requiredMessage: 'Nome, descrição, preço e imagem_produto são obrigatórios.',
    createdMessage: 'Produto cadastrado com sucesso.',
    updatedMessage: 'Produto atualizado com sucesso.',
    deletedMessage: 'Produto removido com sucesso.',
    fields: ['nome', 'descricao', 'preco', 'imagem_produto'],
    types: { nome: 'string', descricao: 'string', preco: 'float', imagem_produto: 'string' },
    prepareCreate(body) {
        return prepare(this, body);
    },
    prepareUpdate(body) {
        return prepare(this, body);
    }
};

module.exports = createCrudRouter(config);
