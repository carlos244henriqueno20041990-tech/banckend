-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql-carloshenriquenogueira.alwaysdata.net
-- Generation Time: Oct 28, 2026 at 05:40 PM
-- Server version: 11.4.13-MariaDB
-- PHP Version: 8.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `carloshenriquenogueira_loja_oficial`
--

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contato` varchar(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `nome`, `email`, `contato`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'Ana Silva', 'ana.silva@email.com', '(11) 98765-4321', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(2, 'Bruno Oliveira', 'bruno.oliveira@email.com', '(21) 97654-3210', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(3, 'Carla Souza', 'carla.souza@email.com', '(31) 96543-2109', 0, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(4, 'Diego Santos', 'diego.santos@email.com', '(41) 95432-1098', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(5, 'Elena Martins', 'elena.martins@email.com', '(51) 94321-0987', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(6, 'Fábio Lima', 'fabio.lima@email.com', '(61) 93210-9876', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(7, 'Giovanna Rocha', 'giovanna.rocha@email.com', '(71) 92109-8765', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(8, 'Henrique Almeida', 'henrique.almeida@email.com', '(81) 91098-7654', 0, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(9, 'Isabela Costa', 'isabela.costa@email.com', '(91) 90987-6543', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(10, 'João Pereira', 'joao.pereira@email.com', '(11) 99876-5432', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39');

-- --------------------------------------------------------

--
-- Table structure for table `entradas`
--

CREATE TABLE `entradas` (
  `id_entrada` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `id_fornecedor` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `valor_unitario` double(10,2) NOT NULL,
  `data_entrada` date DEFAULT NULL,
  `observacao` varchar(200) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `entradas`
--

INSERT INTO `entradas` (`id_entrada`, `id_produto`, `id_fornecedor`, `quantidade`, `valor_unitario`, `data_entrada`, `observacao`, `criado_em`, `atualizado_em`) VALUES
(1, 10, 9, 50, 9.50, '2026-01-10', 'Compra Mensal', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(2, 2, 7, 30, 12.90, '2026-01-12', 'Reposição', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(3, 9, 3, 40, 2.00, '2026-01-15', 'Estoque inicial', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(4, 7, 4, 25, 6.50, '2026-02-01', 'Promoção', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(5, 5, 10, 60, 2.50, '2026-02-05', 'Compra atacado', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(6, 6, 6, 20, 15.00, '2026-02-10', 'Reposição', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(7, 4, 2, 35, 5.80, '2026-02-15', 'Compra semanal', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(8, 8, 8, 45, 8.90, '2026-03-01', 'Novo lote', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(9, 3, 1, 70, 4.20, '2026-03-08', 'Compra extra', '2026-05-29 17:22:21', '2026-05-29 17:22:21'),
(10, 1, 5, 15, 3.50, '2026-03-15', 'Reposição estoque', '2026-05-29 17:22:21', '2026-05-29 17:22:21');

-- --------------------------------------------------------

--
-- Table structure for table `estoque`
--

CREATE TABLE `estoque` (
  `id_estoque` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `estoque_minimo` int(11) DEFAULT NULL,
  `estoque_maximo` int(11) DEFAULT NULL,
  `localizacao` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fornecedores`
--

CREATE TABLE `fornecedores` (
  `id_fornecedor` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `empresa` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cidade` varchar(50) DEFAULT NULL,
  `estado` char(2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fornecedores`
--

INSERT INTO `fornecedores` (`id_fornecedor`, `nome`, `empresa`, `email`, `telefone`, `cidade`, `estado`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'João Silva', 'Limpeza Total Ltda', 'joao@limpezatotal.com', '63991112222', 'Araguaína', 'TO', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(2, 'Maria Souza', 'Casa Limpa ME', 'maria@casalimpa.com', '63992223333', 'Palmas', 'TO', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(3, 'Pedro Santos', 'Brilho Fácil', 'pedro@brilhofacil.com', '63993334444', 'Imperatriz', 'MA', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(4, 'Ana Oliveira', 'Limpeza Rápida', 'ana@limpezarapida.com', '63994445555', 'Gurupi', 'TO', 0, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(5, 'Carlos Pereira', 'Super Clean', 'carlos@superclean.com', '63995556666', 'Colinas', 'TO', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(6, 'Juliana Costa', 'Top Higiene', 'juliana@tophigiene.com', '63996667777', 'Araguaína', 'TO', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(7, 'Marcos Lima', 'Forte Limpeza', 'marcos@fortelimpeza.com', '63997778888', 'Palmas', 'TO', 0, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(8, 'Fernanda Alves', 'Limpa Tudo', 'fernanda@limpatudo.com', '63998889999', 'Paraíso', 'TO', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(9, 'Ricardo Mendes', 'Brilho Máximo', 'ricardo@brilhomaximo.com', '63999990000', 'Araguaína', 'TO', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06'),
(10, 'Paula Fernandes', 'Higiene Total', 'paula@higienetotal.com', '63990001111', 'Gurupi', 'TO', 1, '2026-08-21 17:41:06', '2026-08-21 17:41:06');

-- --------------------------------------------------------

--
-- Table structure for table `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id_funcionario` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cargo` varchar(50) NOT NULL,
  `salario` double(10,2) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `data_admissao` date DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `funcionarios`
--

INSERT INTO `funcionarios` (`id_funcionario`, `nome`, `cargo`, `salario`, `telefone`, `email`, `data_admissao`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'Lucas Ferreira', 'Vendedor', 2800.00, '63991110001', 'lucas@empresa.com', '2025-01-10', 1, '2026-05-13 18:46:37', '2026-05-20 18:47:26'),
(2, 'Mariana Souza', 'Caixa', 1900.00, '63991110002', 'mariana@empresa.com', '2025-01-15', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37'),
(3, 'Pedro Henrique', 'Estoquista', 2100.00, '63991110003', 'pedro@empresa.com', '2025-02-01', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37'),
(4, 'Juliana Alves', 'Gerente', 4500.00, '63991110004', 'juliana@empresa.com', '2024-11-20', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37'),
(5, 'Carlos Mendes', 'Supervisor', 3800.00, '63991110005', 'carlos@empresa.com', '2025-03-05', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37'),
(7, 'Rafael Oliveira', 'Auxiliar Administrativo', 2200.00, '63991110007', 'rafael@empresa.com', '2025-02-18', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37'),
(8, 'Amanda Costa', 'Analista Financeiro', 5200.00, '63991110008', 'amanda@empresa.com', '2024-12-12', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37'),
(9, 'Bruno Martins', 'Técnico de TI', 4100.00, '63991110009', 'bruno@empresa.com', '2025-01-25', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37'),
(10, 'Patrícia Gomes', 'Serviços Gerais', 1600.00, '63991110010', 'patricia@empresa.com', '2025-04-01', 1, '2026-05-13 18:46:37', '2026-05-13 18:46:37');

-- --------------------------------------------------------

--
-- Table structure for table `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `data_pedido` date DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `status`, `data_pedido`, `id_cliente`, `criado_em`, `atualizado_em`) VALUES
(1, 1, '2026-01-10', 3, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(2, 1, '2026-01-12', 5, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(3, 0, '2026-01-15', 2, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(4, 1, '2026-02-01', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(5, 1, '2026-02-05', 4, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(6, 0, '2026-02-10', 6, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(7, 1, '2026-02-18', 3, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(8, 1, '2026-03-02', 2, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(9, 0, '2026-03-10', 5, '2026-05-29 17:21:39', '2026-05-29 17:21:39'),
(10, 1, '2026-03-15', 1, '2026-05-29 17:21:39', '2026-05-29 17:21:39');

-- --------------------------------------------------------

--
-- Table structure for table `produtos`
--

CREATE TABLE `produtos` (
  `id_produto` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `descricao` varchar(200) NOT NULL,
  `preco` double(10,2) NOT NULL,
  `imagem_produto` varchar(255) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produtos`
--

INSERT INTO `produtos` (`id_produto`, `nome`, `descricao`, `preco`, `imagem_produto`, `criado_em`, `atualizado_em`) VALUES
(1, 'Detergente', 'Detergente líquido 500ml', 3.50, 'https://images.tcdn.com.br/img/img_prod/1028719/detergente_ype_500ml_637_1_3ad87948aa8eabe38f077fbdcaf191d9.png', '2026-05-29 17:21:39', '2026-06-15 02:56:17'),
(2, 'Sabão em pó', 'Sabão em pó 1kg', 12.90, 'https://m.media-amazon.com/images/I/71JZpQqtFbL._AC_UF1000,1000_QL80_.jpg', '2026-05-29 17:21:39', '2026-06-15 02:57:46'),
(3, 'Água sanitária', 'Água sanitária 1L', 4.20, 'https://cdn.awsli.com.br/600x600/515/515184/produto/295549394/site--12--6psegjc9bc-wgpry4h98g.png', '2026-05-29 17:21:39', '2026-06-15 03:00:26'),
(4, 'Desinfetante', 'Desinfetante lavanda 500ml', 5.80, 'https://www.jnfraldas.com.br/wp-content/uploads/2024/03/uauperfumefloressonhos.webp', '2026-05-29 17:21:39', '2026-06-15 03:13:50'),
(5, 'Esponja', 'Esponja multiuso', 2.50, 'https://cdn.awsli.com.br/600x1000/1027/1027618/produto/73327222/9a46f61368.jpg', '2026-05-29 17:21:39', '2026-06-15 03:14:53'),
(6, 'Amaciante', 'Amaciante de roupas 2L', 15.00, 'https://images.tcdn.com.br/img/img_prod/1028719/amaciante_ype_2l_741_1_2a9c89cf77a20f6a40031f20891a2539.png', '2026-05-29 17:21:39', '2026-06-15 03:15:41'),
(7, 'Limpador', 'Limpador perfumado 750ml', 6.70, 'https://cdn.awsli.com.br/600x450/2358/2358153/produto/152813408/alvexdoceinspiracao-57a6cd658b.jpg', '2026-05-29 17:21:39', '2026-06-15 03:16:45'),
(8, 'Álcool', 'Álcool 70% 1L', 8.90, 'https://images.tcdn.com.br/img/img_prod/1014612/alcool_liquido_etilico_70_1_litro_12_unidades_4509_2_162fee58aa6054d0805ed3e19b3d85ef.jpeg', '2026-05-29 17:21:39', '2026-06-15 03:17:22'),
(9, 'Sabonete', 'Sabonete em barra 90g', 2.00, 'https://d3fwclp93k8y7o.cloudfront.net/Custom/Content/Products/64/28/6428_sabonete-granado-glicerina-tradicional-barra-90g-p9468_m1_638212962496610136.webp', '2026-05-29 17:21:39', '2026-06-15 03:43:13'),
(10, 'Lustra móveis', 'Lustra móveis 200ml', 9.50, 'https://cdn.awsli.com.br/600x450/63/63356/produto/51102900534c87c91e.jpg', '2026-05-29 17:21:39', '2026-06-15 03:44:24');

-- --------------------------------------------------------

--
-- Table structure for table `saidas`
--

CREATE TABLE `saidas` (
  `id_saida` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `id_funcionario` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `valor_unitario` double(10,2) NOT NULL,
  `data_saida` date DEFAULT NULL,
  `destino` varchar(100) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saidas`
--

INSERT INTO `saidas` (`id_saida`, `id_produto`, `id_funcionario`, `quantidade`, `valor_unitario`, `data_saida`, `destino`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 1, 10, 4.50, '2026-01-11', 'Julio Cesar', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(2, 2, 2, 5, 14.90, '2026-01-13', 'Pedro Alcantara', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(3, 3, 3, 8, 5.20, '2026-01-16', 'Amada Queiroz', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(4, 4, 4, 6, 7.50, '2026-02-02', 'Bruna Silva', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(5, 5, 5, 12, 3.90, '2026-02-06', 'Rubens Alves', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(6, 6, 6, 4, 18.00, '2026-02-11', 'Humberto Carlos ', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(7, 7, 7, 9, 8.20, '2026-02-18', 'Alvaro da Silva', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(8, 8, 8, 7, 10.50, '2026-03-03', 'João Paulo Aquino', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(9, 9, 9, 15, 3.20, '2026-03-10', 'Ricardo Modesto', '2026-05-13 15:11:22', '2026-05-13 15:11:22'),
(10, 10, 10, 3, 12.90, '2026-03-18', 'Zelio Bezerra', '2026-05-13 15:11:22', '2026-05-13 15:11:22');

--
-- Triggers `saidas`
--
DELIMITER $$
CREATE TRIGGER `trg_entrada_estoque` AFTER INSERT ON `saidas` FOR EACH ROW BEGIN
    UPDATE estoque
    SET quantidade = quantidade - NEW.QUANTIDADE
    WHERE id_produto = NEW.id_produto;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usu` int(11) NOT NULL,
  `nome` varchar(80) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `contato` varchar(20) DEFAULT NULL,
  `genero` char(1) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id_usu`, `nome`, `email`, `senha`, `contato`, `genero`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'Carlos', 'carlos@gmail.com', '$2y$10$iSM80sFF9VIRKdZzSJ6WmeVl9r/2QA6COc01V2tiqxV8JLvuDmgoK', '84000000', 'M', 1, '2026-04-24 16:21:44', '2026-06-15 02:35:40'),
(2, 'Ricardo Mendes', 'ricardo.mendes@email.com', '123456', '(11) 91234-5678', 'M', 1, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(3, 'Beatriz Lopes', 'beatriz.lopes@email.com', 'abc123', '(21) 92345-6789', 'F', 1, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(4, 'Carlos Eduardo da Silva', 'cadu.ferreira@email.com', 'senha10', '(31) 93456-7890', 'M', 1, '2026-04-29 14:37:28', '2026-06-12 18:55:56'),
(5, 'Mariana Luz', 'mari.luz@email.com', 'marianal', '(41) 94567-8901', 'F', 0, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(6, 'Fernando Souza', 'fernando.souza@email.com', 'admin78', '(51) 95678-9012', 'M', 1, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(7, 'Patrícia Amaral', 'paty.amaral@email.com', 'paty99', '(61) 96789-0123', 'F', 1, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(8, 'Roberto Junior', 'roberto.jr@email.com', 'bob123', '(71) 97890-1234', 'M', 1, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(9, 'Juliana Paes', 'ju.paes@email.com', 'ju2024', '(81) 98901-2345', 'F', 1, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(11, 'Camila Pitanga', 'camila.pit@email.com', 'pit123', '(11) 90123-4567', 'F', 1, '2026-04-29 14:37:28', '2026-04-29 14:37:28'),
(12, 'teste', 'teste@gmail.com', '$2y$10$TmzFrvNlxtAoZhMr06ME3ePLSdfddKPYo6vLGETnQNMHfl.fFqYoq', '6340028922', 'M', 1, '2026-06-11 17:35:10', '2026-06-11 17:35:10'),
(13, 'Estou fazendo testes', 'teste2@gmail.com', '$2y$10$gK3w3vNZJQ2tGy6a1dXS7..wNhy4Ql2NAy5H7aZf8Mq6sJPIrZu0S', '6340028922', 'M', 1, '2026-06-11 18:41:26', '2026-06-12 18:56:20'),
(16, 'Carlos Henrique', 'carlos244@gmail.com', '$2y$10$D00rbbp2DPkDOZRlznrLkejn/3PanrIsZ9DPb9NmtRX6joGRP80LS', '63918179374', 'm', 1, '2026-06-18 16:46:40', '2026-06-18 16:46:40'),
(17, 'Pedro Alvares Cabral', 'pedr@gmail.com', '123', NULL, NULL, 1, '2026-09-24 19:05:19', '2026-09-24 19:05:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `entradas`
--
ALTER TABLE `entradas`
  ADD PRIMARY KEY (`id_entrada`),
  ADD KEY `fk_entradas_produtos` (`id_produto`),
  ADD KEY `fk_entradas_fornecedores` (`id_fornecedor`);

--
-- Indexes for table `estoque`
--
ALTER TABLE `estoque`
  ADD PRIMARY KEY (`id_estoque`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Indexes for table `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD PRIMARY KEY (`id_fornecedor`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id_funcionario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`);

--
-- Indexes for table `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id_produto`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usu`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `entradas`
--
ALTER TABLE `entradas`
  MODIFY `id_entrada` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `estoque`
--
ALTER TABLE `estoque`
  MODIFY `id_estoque` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id_fornecedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `funcionarios`
--
ALTER TABLE `funcionarios`
  MODIFY `id_funcionario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id_produto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `entradas`
--
ALTER TABLE `entradas`
  ADD CONSTRAINT `fk_entradas_fornecedores` FOREIGN KEY (`id_fornecedor`) REFERENCES `fornecedores` (`id_fornecedor`),
  ADD CONSTRAINT `fk_entradas_produtos` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`);

--
-- Constraints for table `estoque`
--
ALTER TABLE `estoque`
  ADD CONSTRAINT `estoque_ibfk_1` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
