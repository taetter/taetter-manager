CREATE TABLE `patientSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patientSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `patientSessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `patients` ADD `senhaHash` varchar(255);--> statement-breakpoint
ALTER TABLE `patients` ADD `primeiroAcesso` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `tenants` ADD `patientPortalUrl` varchar(500);--> statement-breakpoint
CREATE INDEX `patient_session_tenant_idx` ON `patientSessions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `patient_session_patient_idx` ON `patientSessions` (`patientId`);--> statement-breakpoint
CREATE INDEX `patient_session_token_idx` ON `patientSessions` (`token`);