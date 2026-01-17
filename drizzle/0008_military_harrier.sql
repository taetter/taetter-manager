CREATE TABLE `quotationItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotationId` int NOT NULL,
	`nomeVacina` varchar(255) NOT NULL,
	`fabricante` varchar(255),
	`quantidade` int NOT NULL,
	`precoUnitario` decimal(10,2),
	`precoTotal` decimal(12,2),
	`lote` varchar(100),
	`dataValidade` date,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotationItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`numero` varchar(50) NOT NULL,
	`fornecedor` varchar(255) NOT NULL,
	`contatoFornecedor` varchar(255),
	`emailFornecedor` varchar(255),
	`telefoneFornecedor` varchar(20),
	`dataSolicitacao` date NOT NULL,
	`dataValidade` date,
	`dataResposta` date,
	`status` varchar(20) NOT NULL DEFAULT 'pendente',
	`valorTotal` decimal(12,2),
	`observacoes` text,
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refrigeratorMaintenances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`refrigeratorId` int NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`descricao` text,
	`dataManutencao` date NOT NULL,
	`proximaManutencao` date,
	`tecnicoResponsavel` varchar(255),
	`empresaManutencao` varchar(255),
	`custoManutencao` decimal(10,2),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `refrigeratorMaintenances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temperatureLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`refrigeratorId` int NOT NULL,
	`temperatura` decimal(4,1) NOT NULL,
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`foraDoLimite` boolean NOT NULL DEFAULT false,
	`alertaEnviado` boolean NOT NULL DEFAULT false,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `temperatureLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `refrigerators` ADD `marca` varchar(100);--> statement-breakpoint
ALTER TABLE `units` ADD `responsavelTecnico` varchar(255);--> statement-breakpoint
ALTER TABLE `units` ADD `crmResponsavel` varchar(20);--> statement-breakpoint
ALTER TABLE `units` ADD `imagemUrl` text;--> statement-breakpoint
ALTER TABLE `units` ADD `cnpj` varchar(18);--> statement-breakpoint
ALTER TABLE `units` ADD `email` varchar(255);--> statement-breakpoint
CREATE INDEX `quotitem_quot_idx` ON `quotationItems` (`quotationId`);--> statement-breakpoint
CREATE INDEX `quot_tenant_idx` ON `quotations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `quot_status_idx` ON `quotations` (`status`);--> statement-breakpoint
CREATE INDEX `quot_numero_idx` ON `quotations` (`numero`);--> statement-breakpoint
CREATE INDEX `maint_tenant_idx` ON `refrigeratorMaintenances` (`tenantId`);--> statement-breakpoint
CREATE INDEX `maint_refrig_idx` ON `refrigeratorMaintenances` (`refrigeratorId`);--> statement-breakpoint
CREATE INDEX `maint_data_idx` ON `refrigeratorMaintenances` (`dataManutencao`);--> statement-breakpoint
CREATE INDEX `temp_tenant_idx` ON `temperatureLogs` (`tenantId`);--> statement-breakpoint
CREATE INDEX `temp_refrig_idx` ON `temperatureLogs` (`refrigeratorId`);--> statement-breakpoint
CREATE INDEX `temp_data_idx` ON `temperatureLogs` (`dataHora`);