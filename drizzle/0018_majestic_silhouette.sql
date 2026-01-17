ALTER TABLE `tenants` ADD `plan` enum('basic','intermediate','full') DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `enabledModules` json;--> statement-breakpoint
ALTER TABLE `tenants` DROP COLUMN `plano`;