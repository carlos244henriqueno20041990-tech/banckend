require('dotenv').config();

//1. Dependências e Middlewares
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const routerUser = require('./route/routeUsuario');
const routerCliente = require('./route/routeCliente');
const routerFornecedor = require('./route/routeFornecedor');
const routerProduto = require('./route/routeProduto');
const routerEntrada = require('./route/routeEntrada');
const routerSaida = require('./route/routeSaida');
const routerPedido = require('./route/routePedido');
const routerEstoque = require('./route/routeEstoque');

//2. Controle de CORS (Headers & OPTIONS)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

//3. Definição de Rotas
app.use('/usuario', routerUser);
app.use('/clientes', routerCliente);
app.use('/fornecedores', routerFornecedor);
app.use('/produtos', routerProduto);
app.use('/entradas', routerEntrada);
app.use('/saidas', routerSaida);
app.use('/pedidos', routerPedido);
app.use('/estoque', routerEstoque);


//4. Tratamento de Erros (Fallback & Handler)



app.use((req,res,next)=>{
      const erro = new Error("Não encontrado!");
      erro.status = 404;
      next(erro);
});

app.use((error,req,res,next)=>{
    const status = Number.isInteger(error.status) ? error.status : 500;
  console.error(error);
    res.status(status);
        return res.json({
            erro:{
         mensagem: status === 500 ? 'Erro interno do servidor' : error.message
            }
        })
})

module.exports = app