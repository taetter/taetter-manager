CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`applicationId` int NOT NULL,
	`tipo` enum('pix','credito','debito','dinheiro') NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`pixQrCode` text,
	`pixChave` varchar(255),
	`pixTxId` varchar(255),
	`cartaoBandeira` varchar(50),
	`cartaoUltimosDigitos` varchar(4),
	`cartaoNsu` varchar(50),
	`comprovanteUrl` text,
	`comprovanteKey` varchar(255),
	`status` enum('pendente','aprovado','recusado','cancelado') NOT NULL DEFAULT 'pendente',
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refrigerators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`unitId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`modelo` varchar(100),
	`numeroSerie` varchar(100),
	`temperaturaMin` decimal(4,1),
	`temperaturaMax` decimal(4,1),
	`temperaturaAtual` decimal(4,1),
	`capacidadeLitros` int,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `refrigerators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`telefone` varchar(20),
	`responsavel` varchar(255),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccineApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`unitId` int NOT NULL,
	`refrigeratorId` int NOT NULL,
	`employeeId` int,
	`dataAplicacao` timestamp NOT NULL,
	`lote` varchar(100) NOT NULL,
	`dose` varchar(50),
	`localAplicacao` varchar(100),
	`viaAdministracao` varchar(50),
	`etiquetaZebraUrl` text,
	`etiquetaVirtual` boolean DEFAULT false,
	`observacoes` text,
	`status` enum('pendente','aplicada','cancelada') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccineApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `pay_tenant_idx` ON `payments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pay_application_idx` ON `payments` (`applicationId`);--> statement-breakpoint
CREATE INDEX `pay_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `refrig_tenant_idx` ON `refrigerators` (`tenantId`);--> statement-breakpoint
CREATE INDEX `refrig_unit_idx` ON `refrigerators` (`unitId`);--> statement-breakpoint
CREATE INDEX `unit_tenant_idx` ON `units` (`tenantId`);--> statement-breakpoint
CREATE INDEX `app_tenant_idx` ON `vaccineApplications` (`tenantId`);--> statement-breakpoint
CREATE INDEX `app_patient_idx` ON `vaccineApplications` (`patientId`);--> statement-breakpoint
CREATE INDEX `app_vaccine_idx` ON `vaccineApplications` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `app_data_idx` ON `vaccineApplications` (`dataAplicacao`);