# API de gerenciamento de loja

## Objetivo e problema resolvido

A API de gerenciamento de loja oferece uma interface HTTP para o painel web e outros clientes administrarem os dados operacionais de uma loja. Ela centraliza o cadastro, a consulta, a atualização e a remoção de usuários, clientes, fornecedores, produtos, pedidos, entradas, saídas e registros de estoque, evitando que os clientes precisem acessar o banco de dados diretamente.

## Tecnologias

- **Backend:** Node.js, Express, `body-parser` e Morgan.
- **ORM:** Prisma Client, usado pelas rotas para consultar e persistir dados por meio dos modelos definidos no schema.
- **Adapter de banco:** `@prisma/adapter-mariadb`.
- **Banco de dados:** MySQL/MariaDB.
- **Senhas:** `bcryptjs` gera e verifica hashes de senha.
- **CORS:** limitado às origens configuradas em `CORS_ORIGIN`.

## Instalação e execução

Requisitos: Node.js/npm e um banco MySQL/MariaDB criado e compatível com `prisma/schema.prisma`.

1. Instale as dependências na raiz do projeto:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e configure as variáveis descritas abaixo. Gere um `JWT_SECRET` aleatório antes de iniciar.
3. Inicie o backend:

   ```bash
   npm start
   ```

O servidor escuta na porta `5002` por padrão. Para desenvolvimento com reinicialização automática, use `npm run dev`. Para executar os testes automatizados, use `npm test`.

### Variáveis de ambiente

Configure estes nomes no `.env` local ou no ambiente de hospedagem. Não publique valores reais de credenciais:

| Variável | Obrigatória | Finalidade |
|---|---|---|
| `DB_HOST` | Sim | Host do MySQL/MariaDB usado pela API. |
| `DB_USER` | Sim | Usuário do banco. |
| `DB_PASSWORD` | Sim | Senha do usuário do banco. |
| `DB_NAME` | Sim | Nome do banco de dados. |
| `DB_PORT` | Não | Porta do banco; padrão `3306`. |
| `PORT` | Não | Porta HTTP da API; padrão `5002`. |
| `IP` | Não | Endereço de escuta fornecido pela hospedagem; padrão `::`. |
| `API_BASE_PATH` | Não | Prefixo de URL opcional para montar todas as rotas, por exemplo `/api` quando a hospedagem encaminha o prefixo à aplicação. |
| `DATABASE_URL` | Para comandos da CLI Prisma | URL de conexão usada pela configuração da CLI, não pelas rotas em execução. |
| `JWT_SECRET` | Sim | Chave aleatória de pelo menos 32 bytes para assinar tokens JWT. |
| `CORS_ORIGIN` | Não | Origens web autorizadas, separadas por vírgula; padrão `http://localhost:5173,http://127.0.0.1:5173`. Configure o domínio exato do frontend em produção. |

Gere uma chave JWT com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Use o resultado como `JWT_SECRET`. Exemplo de `.env` com valores ilustrativos:

```env
PORT=5002
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
JWT_SECRET=cole_aqui_a_chave_aleatoria_gerada
CORS_ORIGIN=https://seu-frontend.example
DATABASE_URL="mysql://seu_usuario:sua_senha@localhost:3306/seu_banco"
```

O cliente Prisma é gerado pelo script `postinstall` durante `npm install`. `DATABASE_URL` é lida pela configuração da CLI Prisma; a API conecta ao banco usando `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.

O CORS aceita as origens exatas listadas em `CORS_ORIGIN` (separadas por vírgula), sem curingas. Para produção, configure o domínio do frontend; em desenvolvimento, localhost e 127.0.0.1 na porta 5173 são permitidos por padrão. O cabeçalho `Authorization` é permitido para chamadas autenticadas e preflight `OPTIONS`.

O servidor só começa a escutar depois que o Prisma confirma a conexão com o banco. Se a conexão falhar, a inicialização termina com erro; ao receber `SIGINT` ou `SIGTERM`, o servidor fecha o HTTP e desconecta o Prisma.

### Permissões do usuário do banco

Use um usuário próprio da aplicação, limitado ao banco da loja e às operações de leitura e gravação. Exemplo para MySQL/MariaDB local (troque o banco, a senha e o host pelo valor adequado ao ambiente):

```sql
CREATE USER 'loja_api'@'localhost' IDENTIFIED BY 'defina-uma-senha-forte';
GRANT SELECT, INSERT, UPDATE, DELETE ON `seu_banco`.* TO 'loja_api'@'localhost';
```

Configure esse usuário nas variáveis `DB_USER` e `DB_PASSWORD`. Em hospedagem remota, substitua `localhost` pelo host/IP de origem autorizado pelo provedor. Use uma conta administrativa separada para criar/importar o schema; a conta da API não precisa de privilégios para criar ou alterar tabelas.

## Uso da API

Envie objetos JSON com `Content-Type: application/json`. Corpos `application/x-www-form-urlencoded` também são aceitos. Identificadores `:id` são números inteiros positivos. Datas devem ser strings reconhecidas pelo JavaScript, normalmente no formato `YYYY-MM-DD`.

As respostas são JSON:

- Listagem: `{ "clientes": [...] }` (a propriedade corresponde à coleção solicitada).
- Consulta de um registro: `{ "cliente": {...} }` (a propriedade corresponde ao recurso solicitado).
- Criação: `{ "mensagem": "...", "<campo_id>": 1 }`.
- Atualização ou remoção: `{ "mensagem": "..." }`.
- Erro de rota/recurso: `{ "error": "..." }`. Para um caminho sem rota, a resposta é `{ "erro": { "mensagem": "Não encontrado!" } }`.

## Rotas disponíveis

### Usuários — prefixo `/usuario`

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/usuario` | Lista usuários sem incluir senhas. |
| `GET` | `/usuario/:id` | Consulta usuário por `id_usu`, sem incluir a senha. |
| `POST` | `/usuario` | Cadastra usuário; requer `nome`, `email` e `senha`; aceita também `contato`, `genero` e `ativo`. |
| `POST` | `/usuario/login` | Valida credenciais recebidas em `email` e `senha`. |
| `PATCH` | `/usuario/:id` | Atualiza um ou mais campos: `nome`, `email`, `senha`, `contato`, `genero` ou `ativo`. |
| `DELETE` | `/usuario/:id` | Remove usuário. |

Senhas novas são armazenadas com hash bcrypt. O login de usuários inativos falha; senhas legadas em texto são convertidas para hash depois de um login válido. A senha nunca é incluída nas respostas.

### Clientes — prefixo `/clientes`

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/clientes` | Lista clientes. |
| `GET` | `/clientes/:id` | Consulta por `id_cliente`. |
| `POST` | `/clientes` | Cadastra cliente; requer `nome` e `email`; aceita `contato` e `ativo`. |
| `PATCH` | `/clientes/:id` | Atualiza `nome`, `email`, `contato` e/ou `ativo`. |
| `DELETE` | `/clientes/:id` | Remove cliente. |

### Fornecedores — prefixo `/fornecedores`

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/fornecedores` | Lista fornecedores. |
| `GET` | `/fornecedores/:id` | Consulta por `id_fornecedor`. |
| `POST` | `/fornecedores` | Cadastra fornecedor; requer `nome`; aceita `empresa`, `email`, `telefone`, `cidade`, `estado` e `ativo`. |
| `PATCH` | `/fornecedores/:id` | Atualiza `nome`, `empresa`, `email`, `telefone`, `cidade`, `estado` e/ou `ativo`. |
| `DELETE` | `/fornecedores/:id` | Remove fornecedor. |

### Produtos — prefixo `/produtos`

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/produtos` | Lista produtos. |
| `GET` | `/produtos/:id` | Consulta por `id_produto`. |
| `POST` | `/produtos` | Cadastra produto; requer `nome`, `descricao`, `preco` e `imagem_produto`. |
| `PATCH` | `/produtos/:id` | Atualiza `nome`, `descricao`, `preco` e/ou `imagem_produto`. |
| `DELETE` | `/produtos/:id` | Remove produto. |

### Pedidos — prefixo `/pedidos`

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/pedidos` | Lista pedidos. |
| `GET` | `/pedidos/:id` | Consulta por `id_pedido`. |
| `POST` | `/pedidos` | Cadastra pedido; requer `id_cliente`; aceita `status` e `data_pedido`. |
| `PATCH` | `/pedidos/:id` | Atualiza `status`, `data_pedido` e/ou `id_cliente`. |
| `DELETE` | `/pedidos/:id` | Remove pedido. |

### Entradas — prefixo `/entradas`

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/entradas` | Lista entradas de mercadoria. |
| `GET` | `/entradas/:id` | Consulta por `id_entrada`. |
| `POST` | `/entradas` | Cadastra entrada; requer `id_produto`, `id_fornecedor`, `quantidade` e `valor_unitario`; aceita `data_entrada` e `observacao`. |
| `PATCH` | `/entradas/:id` | Atualiza `id_produto`, `id_fornecedor`, `quantidade`, `valor_unitario`, `data_entrada` e/ou `observacao`. |
| `DELETE` | `/entradas/:id` | Remove entrada. |

### Saídas — prefixo `/saidas`

| Método | Caminho | Finalidade |
|---|---|---|
| `GET` | `/saidas` | Lista saídas de mercadoria. |
| `GET` | `/saidas/:id` | Consulta por `id_saida`. |
| `POST` | `/saidas` | Cadastra saída; requer `id_produto`, `id_funcionario`, `quantidade` e `valor_unitario`; aceita `data_saida` e `destino`. |
| `PATCH` | `/saidas/:id` | Atualiza `id_produto`, `id_funcionario`, `quantidade`, `valor_unitario`, `data_saida` e/ou `destino`. |
| `DELETE` | `/saidas/:id` | Remove saída. |

O schema SQL fornecido pode reduzir o estoque por trigger após a inclusão de uma saída, se houver registro para o produto. A API não verifica se o saldo é suficiente.

### Estoque — prefixo `/estoque`

| Método | Caminho | Finalidade |
|---|---|---|
| `POST` | `/estoque` | Cria o saldo inicial; requer `id_produto` e `quantidade`; aceita `estoque_minimo`, `estoque_maximo` e `localizacao`. |
| `DELETE` | `/estoque/:id` | Remove registro por `id_estoque`, somente quando a quantidade é zero. |

O cadastro de estoque exige quantidades inteiras não negativas, impede que o mínimo ultrapasse o máximo e não permite mais de um registro por produto. Não há endpoints de listagem, consulta ou atualização de estoque.

## Cadastrar usuário e testar login

O cadastro pela rota `POST /usuario` requer `nome`, `email` e `senha` e exige um token de acesso. Para criar o primeiro administrador em uma instalação vazia, defina `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` temporariamente no ambiente e execute o comando administrativo local:

```bash
npm run create-admin
```

O comando conecta ao banco configurado, grava a senha como hash e só funciona quando ainda não existem usuários. Remova as variáveis `ADMIN_*` do ambiente após a execução.

Use o mesmo email e senha para testar o login:

```bash
curl -X POST http://localhost:5002/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","senha":"uma-senha"}'
```

Resposta de sucesso (`200`, com campos pessoais e datas ilustrativos):

```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "<jwt>",
  "usuario": {
    "id_usu": 1,
    "nome": "Nome do usuário",
    "email": "usuario@exemplo.com",
    "contato": null,
    "genero": null,
    "ativo": 1,
    "criado_em": "2026-01-01T00:00:00.000Z",
    "atualizado_em": "2026-01-01T00:00:00.000Z"
  }
}
```

Envie o token nas chamadas às rotas protegidas:

```bash
curl http://localhost:5002/usuario \
  -H "Authorization: Bearer <jwt>"
```

## Autenticação e acesso

Todas as rotas, exceto `POST /usuario/login`, exigem um JWT assinado com `JWT_SECRET`, enviado como `Authorization: Bearer <token>`. O token expira em 8 horas; cada chamada também verifica se a conta continua ativa. O frontend mantém a sessão na aba atual e envia o token automaticamente; ao expirar, solicita novo login. Não há níveis de permissão: qualquer usuário ativo autenticado tem acesso administrativo às rotas disponíveis.

Em uma instalação nova, crie o primeiro usuário com `npm run create-admin` antes de expor a API. Esse comando não cria contas por HTTP público.

## Endereço público

O endereço local padrão da API é `http://localhost:5002`; o frontend está configurado para usar a API publicada em `https://carloshenriquenogueira.alwaysdata.net/api`. Em desenvolvimento, o Vite encaminha `/api` a esse endereço público para evitar limitações de CORS do localhost. A hospedagem da API usa `API_BASE_PATH=/api`. Para publicar o frontend em outra origem, defina `VITE_API_URL` com a URL base pública da API; consulte `frontend/.env.example`. O frontend em `frontend/` pode ser iniciado com `cd frontend`, `npm install` e `npm run dev`.

## Códigos de resposta

- `200`: consulta, atualização, remoção ou login concluído.
- `201`: registro criado.
- `400`: requisição inválida, campo obrigatório ausente ou identificador inválido.
- `401`: credenciais inválidas, token ausente/inválido/expirado ou usuário inativo.
- `404`: recurso ou caminho não encontrado.
- `409`: email de usuário duplicado ou conflito ao remover/cadastrar estoque.
- `500`: erro interno ou falha ao acessar o banco de dados.
