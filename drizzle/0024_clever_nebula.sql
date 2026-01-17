CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`banco` varchar(100) NOT NULL,
	`agencia` varchar(20) NOT NULL,
	`conta` varchar(20) NOT NULL,
	`tipoConta` enum('corrente','poupanca','pagamento') NOT NULL,
	`apelido` varchar(100) NOT NULL,
	`descricao` text,
	`saldoInicial` decimal(12,2) NOT NULL DEFAULT '0.00',
	`saldoAtual` decimal(12,2) NOT NULL DEFAULT '0.00',
	`ativa` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bank_account_tenant_idx` ON `bank_accounts` (`tenantId`);--> statement-breakpoint
CREATE INDEX `bank_account_ativa_idx` ON `bank_accounts` (`ativa`);