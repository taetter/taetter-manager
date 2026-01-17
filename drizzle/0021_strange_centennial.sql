CREATE TABLE `price_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`padrao` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vaccine_prices` ADD `priceTableId` int NOT NULL;--> statement-breakpoint
CREATE INDEX `ptable_tenant_idx` ON `price_tables` (`tenantId`);--> statement-breakpoint
CREATE INDEX `ptable_ativo_idx` ON `price_tables` (`ativo`);--> statement-breakpoint
CREATE INDEX `vprice_pricetable_idx` ON `vaccine_prices` (`priceTableId`);