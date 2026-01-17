ALTER TABLE `applications` ADD `tipoEtiqueta` enum('fisica_virtual','somente_virtual');--> statement-breakpoint
ALTER TABLE `applications` ADD `etiquetaFisicaGerada` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `applications` ADD `etiquetaVirtualGerada` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `applications` ADD `etiquetaZPL` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `etiquetaVirtualUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `applications` ADD `pagadorMesmoPaciente` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `applications` ADD `pagadorId` int;--> statement-breakpoint
ALTER TABLE `applications` ADD `pagadorNome` varchar(255);--> statement-breakpoint
ALTER TABLE `applications` ADD `pagadorCPF` varchar(14);