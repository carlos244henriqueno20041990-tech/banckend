# API de gerenciamento de loja

## Objetivo

Esta API fornece operações HTTP para gerenciar dados de uma loja: usuários, clientes, fornecedores, produtos, pedidos, entradas e saídas de mercadorias e registros de estoque. Ela foi desenvolvida com Node.js e Express, usa MySQL/MariaDB para persistência e recebe e responde dados em JSON.

## Tecnologias

- Node.js e Express
- MySQL/MariaDB, usando o driver `mysql`
- `bcryptjs` para armazenar senhas de usuários com hash
- CORS habilitado para todas as origens

## Execução

Instale as dependências e inicie o servidor:

```bash
npm install
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

O servidor usa a porta `5002` por padrão. É possível alterá-la com a variável `PORT`. Configure as credenciais do banco pelas variáveis de ambiente abaixo, por exemplo em um arquivo `.env` na raiz:

```env
PORT=5002
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
```

O banco precisa ter as tabelas compatíveis com o esquema SQL fornecido no projeto. Mantenha credenciais reais fora do controle de versão.

## Uso geral

- Os prefixos das rotas são `/usuario`, `/clientes`, `/fornecedores`, `/produtos`, `/pedidos`, `/entradas`, `/saidas` e `/estoque`.
- Envie corpos de requisição como JSON com `Content-Type: application/json`.
- Rotas de atualização usam `PATCH` e aceitam somente os campos indicados para cada recurso.
- Nas rotas com `:id`, informe o identificador numérico positivo do registro.
- As respostas de sucesso normalmente incluem os dados do recurso ou uma mensagem e o identificador criado.
- Erros das rotas normalmente usam `{ "error": "..." }`. Para caminhos inexistentes, o formato é `{ "erro": { "mensagem": "Não encontrado!" } }`.

## Endpoints

### Usuários — `/usuario`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/usuario` | Lista usuários sem retornar senhas. |
| `GET` | `/usuario/:id` | Consulta um usuário pelo `id_usu`, sem retornar a senha. |
| `POST` | `/usuario` | Cadastra usuário. Requer `nome`, `email` e `senha`; aceita também `contato`, `genero` e `ativo`. |
| `PATCH` | `/usuario/:id` | Atualiza um ou mais campos entre `nome`, `email`, `senha`, `contato`, `genero` e `ativo`. |
| `DELETE` | `/usuario/:id` | Remove usuário. |
| `POST` | `/usuario/login` | Valida credenciais usando `email` e `senha`. |

O cadastro e a atualização de senha armazenam hash bcrypt. Para compatibilidade com registros anteriores, o login também aceita senhas legadas em texto e as converte para hash quando a autenticação é bem-sucedida. Usuários inativos não podem entrar. O login responde com os dados do usuário, sem a senha.

**Limitação da autenticação:** o login valida as credenciais, mas não gera token ou sessão. As demais rotas não exigem autenticação; portanto, o login, por si só, não protege o acesso aos endpoints.

### Clientes — `/clientes`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/clientes` | Lista clientes. |
| `GET` | `/clientes/:id` | Consulta cliente pelo `id_cliente`. |
| `POST` | `/clientes` | Cadastra cliente. Requer `nome` e `email`; aceita `contato` e `ativo`. |
| `PATCH` | `/clientes/:id` | Atualiza `nome`, `email`, `contato` e/ou `ativo`. |
| `DELETE` | `/clientes/:id` | Remove cliente. |

### Fornecedores — `/fornecedores`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/fornecedores` | Lista fornecedores. |
| `GET` | `/fornecedores/:id` | Consulta fornecedor pelo `id_fornecedor`. |
| `POST` | `/fornecedores` | Cadastra fornecedor. Requer `nome`; aceita `empresa`, `email`, `telefone`, `cidade`, `estado` e `ativo`. |
| `PATCH` | `/fornecedores/:id` | Atualiza `nome`, `empresa`, `email`, `telefone`, `cidade`, `estado` e/ou `ativo`. |
| `DELETE` | `/fornecedores/:id` | Remove fornecedor. |

### Produtos — `/produtos`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/produtos` | Lista produtos. |
| `GET` | `/produtos/:id` | Consulta produto pelo `id_produto`. |
| `POST` | `/produtos` | Cadastra produto. Requer `nome`, `descricao`, `preco` e `imagem_produto`. |
| `PATCH` | `/produtos/:id` | Atualiza `nome`, `descricao`, `preco` e/ou `imagem_produto`. |
| `DELETE` | `/produtos/:id` | Remove produto. |

### Pedidos — `/pedidos`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/pedidos` | Lista pedidos. |
| `GET` | `/pedidos/:id` | Consulta pedido pelo `id_pedido`. |
| `POST` | `/pedidos` | Cadastra pedido. Requer `id_cliente`; aceita `status` e `data_pedido` (o status padrão é `1`). |
| `PATCH` | `/pedidos/:id` | Atualiza `status`, `data_pedido` e/ou `id_cliente`. |
| `DELETE` | `/pedidos/:id` | Remove pedido. |

### Entradas de mercadoria — `/entradas`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/entradas` | Lista entradas. |
| `GET` | `/entradas/:id` | Consulta entrada pelo `id_entrada`. |
| `POST` | `/entradas` | Cadastra entrada. Requer `id_produto`, `id_fornecedor`, `quantidade` e `valor_unitario`; aceita `data_entrada` e `observacao`. |
| `PATCH` | `/entradas/:id` | Atualiza `id_produto`, `id_fornecedor`, `quantidade`, `valor_unitario`, `data_entrada` e/ou `observacao`. |
| `DELETE` | `/entradas/:id` | Remove entrada. |

### Saídas de mercadoria — `/saidas`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `GET` | `/saidas` | Lista saídas. |
| `GET` | `/saidas/:id` | Consulta saída pelo `id_saida`. |
| `POST` | `/saidas` | Cadastra saída. Requer `id_produto`, `id_funcionario`, `quantidade` e `valor_unitario`; aceita `data_saida` e `destino`. |
| `PATCH` | `/saidas/:id` | Atualiza `id_produto`, `id_funcionario`, `quantidade`, `valor_unitario`, `data_saida` e/ou `destino`. |
| `DELETE` | `/saidas/:id` | Remove saída. |

No esquema SQL fornecido, um trigger reduz a quantidade em estoque após a inserção de uma saída, quando há registro de estoque para o produto.

### Estoque — `/estoque`

| Método | Caminho | Funcionalidade |
|---|---|---|
| `POST` | `/estoque` | Cria o registro de estoque inicial de um produto. Requer `id_produto` e `quantidade`; aceita `estoque_minimo`, `estoque_maximo` e `localizacao`. |
| `DELETE` | `/estoque/:id` | Remove o registro identificado por `id_estoque`, somente quando a quantidade disponível é zero. |

O cadastro valida quantidades inteiras não negativas, impede que o mínimo ultrapasse o máximo e rejeita um segundo registro de estoque para o mesmo produto. Atualmente, não há endpoints de listagem, consulta ou atualização de estoque.

## Códigos de resposta

- `200`: consulta, atualização, remoção ou login concluído.
- `201`: registro criado.
- `400`: requisição inválida, campo obrigatório ausente ou identificador inválido.
- `401`: credenciais inválidas ou usuário inativo no login.
- `404`: recurso não encontrado.
- `409`: conflito com o estado do estoque, como tentar removê-lo com saldo disponível.
- `500`: erro interno ou falha ao acessar o banco de dados.
