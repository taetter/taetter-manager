CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`patientName` varchar(255) NOT NULL,
	`patientPhone` varchar(20),
	`dataHora` timestamp NOT NULL,
	`tipo` enum('unidade','domiciliar') NOT NULL,
	`unitId` int,
	`endereco` text,
	`vaccineIds` json,
	`vaccineNames` text,
	`status` enum('pendente','confirmado','realizado','cancelado') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`numero` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`dataNascimento` timestamp,
	`email` varchar(320),
	`celular` varchar(20),
	`vaccineIds` json NOT NULL,
	`vaccineNames` text NOT NULL,
	`vaccineQuantities` json,
	`vaccinePrices` json,
	`valorTotal` int NOT NULL,
	`desconto` int DEFAULT 0,
	`valorFinal` int NOT NULL,
	`dataValidade` timestamp NOT NULL,
	`status` enum('pendente','aprovado','convertido','expirado','cancelado') NOT NULL DEFAULT 'pendente',
	`applicationId` int,
	`dataConversao` timestamp,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `budgets_numero_unique` UNIQUE(`numero`)
);
--> statement-breakpoint
CREATE INDEX `appt_tenant_idx` ON `appointments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `appt_patient_idx` ON `appointments` (`patientId`);--> statement-breakpoint
CREATE INDEX `appt_data_idx` ON `appointments` (`dataHora`);--> statement-breakpoint
CREATE INDEX `appt_status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `budget_tenant_idx` ON `budgets` (`tenantId`);--> statement-breakpoint
CREATE INDEX `budget_numero_idx` ON `budgets` (`numero`);--> statement-breakpoint
CREATE INDEX `budget_cpf_idx` ON `budgets` (`cpf`);--> statement-breakpoint
CREATE INDEX `budget_status_idx` ON `budgets` (`status`);--> statement-breakpoint
CREATE INDEX `budget_validade_idx` ON `budgets` (`dataValidade`);