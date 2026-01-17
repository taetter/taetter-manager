CREATE TABLE `appointment_routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`dataRota` date NOT NULL,
	`employeeId` int NOT NULL,
	`appointmentIds` json NOT NULL,
	`distanciaTotal` decimal(10,2),
	`tempoTotal` int,
	`rotaOtimizada` json,
	`status` enum('planejada','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'planejada',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointment_routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `home_care_addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`cep` varchar(9) NOT NULL,
	`logradouro` varchar(255) NOT NULL,
	`numero` varchar(20) NOT NULL,
	`complemento` varchar(100),
	`bairro` varchar(100) NOT NULL,
	`cidade` varchar(100) NOT NULL,
	`estado` varchar(2) NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`regiao` enum('grande_campinas','regiao_entorno','outra') NOT NULL DEFAULT 'grande_campinas',
	`pontoReferencia` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `home_care_addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccine_reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`appointmentId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`lote` varchar(50) NOT NULL,
	`quantidade` int NOT NULL DEFAULT 1,
	`refrigeratorId` int NOT NULL,
	`status` enum('reservada','aplicada','cancelada','expirada') NOT NULL DEFAULT 'reservada',
	`dataReserva` timestamp NOT NULL DEFAULT (now()),
	`dataExpiracao` timestamp NOT NULL,
	`dataAplicacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccine_reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `appointments` ADD `duracao` int DEFAULT 30;--> statement-breakpoint
ALTER TABLE `appointments` ADD `homeCareAddressId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `valorTotal` decimal(12,2);--> statement-breakpoint
ALTER TABLE `appointments` ADD `taxaDomiciliar` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `appointments` ADD `descontoAntecipado` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `appointments` ADD `valorFinal` decimal(12,2);--> statement-breakpoint
ALTER TABLE `appointments` ADD `motivoCancelamento` text;--> statement-breakpoint
ALTER TABLE `appointments` ADD `pagamentoAntecipado` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `appointments` ADD `paymentLinkId` varchar(255);--> statement-breakpoint
ALTER TABLE `appointments` ADD `notificacaoEnviada` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `appointments` ADD `dataNotificacao` timestamp;--> statement-breakpoint
ALTER TABLE `appointments` ADD `employeeId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `routeId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `ordemNaRota` int;--> statement-breakpoint
CREATE INDEX `route_tenant_idx` ON `appointment_routes` (`tenantId`);--> statement-breakpoint
CREATE INDEX `route_data_idx` ON `appointment_routes` (`dataRota`);--> statement-breakpoint
CREATE INDEX `route_employee_idx` ON `appointment_routes` (`employeeId`);--> statement-breakpoint
CREATE INDEX `route_status_idx` ON `appointment_routes` (`status`);--> statement-breakpoint
CREATE INDEX `hca_tenant_idx` ON `home_care_addresses` (`tenantId`);--> statement-breakpoint
CREATE INDEX `hca_patient_idx` ON `home_care_addresses` (`patientId`);--> statement-breakpoint
CREATE INDEX `hca_regiao_idx` ON `home_care_addresses` (`regiao`);--> statement-breakpoint
CREATE INDEX `hca_ativo_idx` ON `home_care_addresses` (`ativo`);--> statement-breakpoint
CREATE INDEX `vres_tenant_idx` ON `vaccine_reservations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `vres_appt_idx` ON `vaccine_reservations` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `vres_vaccine_idx` ON `vaccine_reservations` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `vres_status_idx` ON `vaccine_reservations` (`status`);--> statement-breakpoint
CREATE INDEX `vres_expiracao_idx` ON `vaccine_reservations` (`dataExpiracao`);