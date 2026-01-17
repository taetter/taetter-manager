CREATE TABLE `bankReconciliations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`dataMovimento` date NOT NULL,
	`descricao` text NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`tipo` enum('credito','debito') NOT NULL,
	`conciliado` boolean NOT NULL DEFAULT false,
	`transactionId` int,
	`dataConciliacao` timestamp,
	`conciladoPor` int,
	`banco` varchar(100),
	`agencia` varchar(20),
	`conta` varchar(20),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankReconciliations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `electronicInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`numero` varchar(50) NOT NULL,
	`serie` varchar(10) NOT NULL,
	`chaveAcesso` varchar(44),
	`dataEmissao` timestamp NOT NULL,
	`dataSaida` timestamp,
	`pacienteId` int,
	`nomeCliente` varchar(255) NOT NULL,
	`cpfCnpjCliente` varchar(18) NOT NULL,
	`valorTotal` decimal(12,2) NOT NULL,
	`valorDesconto` decimal(12,2),
	`valorLiquido` decimal(12,2) NOT NULL,
	`status` enum('rascunho','emitida','autorizada','cancelada','denegada') NOT NULL DEFAULT 'rascunho',
	`xmlUrl` text,
	`pdfUrl` text,
	`protocoloAutorizacao` varchar(50),
	`dataAutorizacao` timestamp,
	`motivoCancelamento` text,
	`dataCancelamento` timestamp,
	`transactionId` int,
	`vaccineApplicationId` int,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `electronicInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `electronicInvoices_numero_unique` UNIQUE(`numero`),
	CONSTRAINT `electronicInvoices_chaveAcesso_unique` UNIQUE(`chaveAcesso`)
);
--> statement-breakpoint
CREATE TABLE `financialTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`metodoPagamento` enum('dinheiro','pix','debito','credito','boleto') NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`valorPago` decimal(12,2),
	`dataTransacao` date NOT NULL,
	`dataVencimento` date,
	`dataPagamento` date,
	`status` enum('pendente','pago','cancelado','estornado') NOT NULL DEFAULT 'pendente',
	`conciliado` boolean NOT NULL DEFAULT false,
	`dataConciliacao` timestamp,
	`pacienteId` int,
	`vaccineApplicationId` int,
	`nfeId` int,
	`descricao` text,
	`observacoes` text,
	`parcelado` boolean NOT NULL DEFAULT false,
	`numeroParcelas` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`transactionId` int NOT NULL,
	`numeroParcela` int NOT NULL,
	`totalParcelas` int NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`dataVencimento` date NOT NULL,
	`dataPagamento` date,
	`status` enum('pendente','pago','atrasado','cancelado') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bankrec_tenant_idx` ON `bankReconciliations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `bankrec_conciliado_idx` ON `bankReconciliations` (`conciliado`);--> statement-breakpoint
CREATE INDEX `bankrec_data_idx` ON `bankReconciliations` (`dataMovimento`);--> statement-breakpoint
CREATE INDEX `nfe_tenant_idx` ON `electronicInvoices` (`tenantId`);--> statement-breakpoint
CREATE INDEX `nfe_numero_idx` ON `electronicInvoices` (`numero`);--> statement-breakpoint
CREATE INDEX `nfe_status_idx` ON `electronicInvoices` (`status`);--> statement-breakpoint
CREATE INDEX `nfe_data_idx` ON `electronicInvoices` (`dataEmissao`);--> statement-breakpoint
CREATE INDEX `fintrans_tenant_idx` ON `financialTransactions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `fintrans_tipo_idx` ON `financialTransactions` (`tipo`);--> statement-breakpoint
CREATE INDEX `fintrans_status_idx` ON `financialTransactions` (`status`);--> statement-breakpoint
CREATE INDEX `fintrans_data_idx` ON `financialTransactions` (`dataTransacao`);--> statement-breakpoint
CREATE INDEX `fintrans_conciliado_idx` ON `financialTransactions` (`conciliado`);--> statement-breakpoint
CREATE INDEX `inst_tenant_idx` ON `installments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `inst_trans_idx` ON `installments` (`transactionId`);--> statement-breakpoint
CREATE INDEX `inst_status_idx` ON `installments` (`status`);--> statement-breakpoint
CREATE INDEX `inst_venc_idx` ON `installments` (`dataVencimento`);