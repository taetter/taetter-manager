CREATE TABLE `price_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`tipoDesconto` enum('percentual','valor_fixo') NOT NULL,
	`valorDesconto` int NOT NULL,
	`vaccineIds` json,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccine_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`preco` int NOT NULL,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccine_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `campaign_tenant_idx` ON `price_campaigns` (`tenantId`);--> statement-breakpoint
CREATE INDEX `campaign_ativo_idx` ON `price_campaigns` (`ativo`);--> statement-breakpoint
CREATE INDEX `campaign_inicio_idx` ON `price_campaigns` (`dataInicio`);--> statement-breakpoint
CREATE INDEX `vprice_tenant_idx` ON `vaccine_prices` (`tenantId`);--> statement-breakpoint
CREATE INDEX `vprice_vaccine_idx` ON `vaccine_prices` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `vprice_ativo_idx` ON `vaccine_prices` (`ativo`);