CREATE TABLE `patientGuardians` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`minorPatientId` int NOT NULL,
	`guardianPatientId` int NOT NULL,
	`relacao` enum('mae','pai','tutor','outro') NOT NULL,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientGuardians_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `patients` ADD `telefoneResponsavel` varchar(20);--> statement-breakpoint
CREATE INDEX `guardian_tenant_idx` ON `patientGuardians` (`tenantId`);--> statement-breakpoint
CREATE INDEX `guardian_minor_idx` ON `patientGuardians` (`minorPatientId`);--> statement-breakpoint
CREATE INDEX `guardian_guardian_idx` ON `patientGuardians` (`guardianPatientId`);