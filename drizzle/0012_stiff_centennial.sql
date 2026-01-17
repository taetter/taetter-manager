CREATE TABLE `patientVaccinationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`pacienteId` int NOT NULL,
	`vaccineApplicationId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`nomeVacina` varchar(255) NOT NULL,
	`lote` varchar(100) NOT NULL,
	`dataValidade` date NOT NULL,
	`dataAplicacao` date NOT NULL,
	`unidadeId` int NOT NULL,
	`nomeUnidade` varchar(255) NOT NULL,
	`refrigeratorId` int NOT NULL,
	`nomeGeladeira` varchar(255) NOT NULL,
	`profissionalId` int,
	`nomeProfissional` varchar(255),
	`etiquetaFisicaUrl` text,
	`etiquetaVirtualUrl` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientVaccinationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `pvh_tenant_idx` ON `patientVaccinationHistory` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pvh_paciente_idx` ON `patientVaccinationHistory` (`pacienteId`);--> statement-breakpoint
CREATE INDEX `pvh_data_idx` ON `patientVaccinationHistory` (`dataAplicacao`);