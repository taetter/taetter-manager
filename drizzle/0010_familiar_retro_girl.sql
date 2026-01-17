ALTER TABLE `vaccines` ADD `nomeFantasia` varchar(255);--> statement-breakpoint
ALTER TABLE `vaccines` ADD `marca` varchar(255);--> statement-breakpoint
ALTER TABLE `vaccines` ADD `estoqueMinimo` int DEFAULT 10;