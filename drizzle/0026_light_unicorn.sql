ALTER TABLE `tenants` ADD `databaseName` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `databaseHost` varchar(255);--> statement-breakpoint
ALTER TABLE `tenants` ADD `databasePort` int DEFAULT 3306;--> statement-breakpoint
ALTER TABLE `tenants` ADD `subdomain` varchar(100);--> statement-breakpoint
ALTER TABLE `tenants` ADD `environment` enum('homologation','production') DEFAULT 'homologation' NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `homologationStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tenants` ADD `productionActivatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tenants` ADD `version` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `cnes` varchar(15);--> statement-breakpoint
ALTER TABLE `tenants` ADD `inscricaoEstadual` varchar(20);--> statement-breakpoint
ALTER TABLE `tenants` ADD `inscricaoMunicipal` varchar(20);--> statement-breakpoint
ALTER TABLE `tenants` ADD `logoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `tenants` ADD `faviconUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `tenants` ADD `primaryColor` varchar(7);--> statement-breakpoint
ALTER TABLE `tenants` ADD `secondaryColor` varchar(7);--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_databaseName_unique` UNIQUE(`databaseName`);--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_subdomain_unique` UNIQUE(`subdomain`);