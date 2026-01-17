CREATE TABLE `fiscal_configurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`establishmentId` int NOT NULL,
	`tipoNota` enum('nfse','nfe','nfce') NOT NULL,
	`inscricaoMunicipal` varchar(50),
	`inscricaoEstadual` varchar(50),
	`regimeTributario` enum('simples_nacional','lucro_presumido','lucro_real'),
	`cnae` varchar(10),
	`aliquotaISS` decimal(5,2),
	`aliquotaPIS` decimal(5,2),
	`aliquotaCOFINS` decimal(5,2),
	`certificadoA1` text,
	`senhaCertificado` text,
	`validadeCertificado` date,
	`ambiente` enum('homologacao','producao') NOT NULL,
	`endpointEmissao` varchar(500),
	`endpointConsulta` varchar(500),
	`ativo` boolean DEFAULT true,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fiscal_configurations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_establishments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`cnes` varchar(7) NOT NULL,
	`nomeFantasia` varchar(255) NOT NULL,
	`razaoSocial` varchar(255) NOT NULL,
	`cnpj` varchar(14) NOT NULL,
	`logradouro` varchar(255) NOT NULL,
	`numero` varchar(20) NOT NULL,
	`complemento` varchar(100),
	`bairro` varchar(100) NOT NULL,
	`municipio` varchar(100) NOT NULL,
	`uf` varchar(2) NOT NULL,
	`cep` varchar(8) NOT NULL,
	`responsavelNome` varchar(255),
	`responsavelCPF` varchar(11),
	`responsavelCNS` varchar(15),
	`responsavelEmail` varchar(255),
	`responsavelTelefone` varchar(20),
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_establishments_id` PRIMARY KEY(`id`),
	CONSTRAINT `health_establishments_cnes_unique` UNIQUE(`cnes`)
);
--> statement-breakpoint
CREATE TABLE `integration_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`outboxId` int NOT NULL,
	`requestUrl` varchar(500),
	`requestMethod` varchar(10),
	`requestHeaders` json,
	`requestBody` json,
	`responseStatus` int,
	`responseHeaders` json,
	`responseBody` json,
	`latenciaMs` int,
	`erro` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_outbox` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`establishmentId` int NOT NULL,
	`tipoIntegracao` enum('rnds_ria','nfse','nfe','nfce') NOT NULL,
	`referenciaId` int NOT NULL,
	`referenciaTabela` varchar(100) NOT NULL,
	`payload` json NOT NULL,
	`status` enum('pendente','enviando','enviado','aceito','rejeitado','erro') DEFAULT 'pendente',
	`tentativas` int DEFAULT 0,
	`maxTentativas` int DEFAULT 5,
	`protocolo` varchar(100),
	`chave` varchar(100),
	`mensagemRetorno` text,
	`codigoErro` varchar(50),
	`dataEnvio` timestamp,
	`dataResposta` timestamp,
	`proximaTentativa` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_outbox_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`establishmentId` int NOT NULL,
	`data` date NOT NULL,
	`tipoIntegracao` enum('rnds_ria','nfse','nfe','nfce') NOT NULL,
	`totalEnviados` int DEFAULT 0,
	`totalAceitos` int DEFAULT 0,
	`totalRejeitados` int DEFAULT 0,
	`totalErros` int DEFAULT 0,
	`latenciaMediaMs` int,
	`latenciaP50Ms` int,
	`latenciaP95Ms` int,
	`latenciaP99Ms` int,
	`taxaSucessoPercent` decimal(5,2),
	`icInferiorPercent` decimal(5,2),
	`icSuperiorPercent` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rnds_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`establishmentId` int NOT NULL,
	`ambiente` enum('homologacao','producao') NOT NULL,
	`clientId` text NOT NULL,
	`clientSecret` text NOT NULL,
	`authUrl` varchar(500),
	`apiUrl` varchar(500),
	`ativo` boolean DEFAULT true,
	`dataHomologacao` date,
	`dataProducao` date,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rnds_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `fiscal_config_tenant_idx` ON `fiscal_configurations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `fiscal_config_est_idx` ON `fiscal_configurations` (`establishmentId`);--> statement-breakpoint
CREATE INDEX `fiscal_config_tipo_idx` ON `fiscal_configurations` (`tipoNota`);--> statement-breakpoint
CREATE INDEX `health_est_tenant_idx` ON `health_establishments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `health_est_cnes_idx` ON `health_establishments` (`cnes`);--> statement-breakpoint
CREATE INDEX `logs_tenant_idx` ON `integration_logs` (`tenantId`);--> statement-breakpoint
CREATE INDEX `logs_outbox_idx` ON `integration_logs` (`outboxId`);--> statement-breakpoint
CREATE INDEX `logs_created_idx` ON `integration_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `outbox_tenant_idx` ON `integration_outbox` (`tenantId`);--> statement-breakpoint
CREATE INDEX `outbox_status_idx` ON `integration_outbox` (`status`);--> statement-breakpoint
CREATE INDEX `outbox_tipo_idx` ON `integration_outbox` (`tipoIntegracao`);--> statement-breakpoint
CREATE INDEX `outbox_proxima_idx` ON `integration_outbox` (`proximaTentativa`);--> statement-breakpoint
CREATE INDEX `stats_tenant_idx` ON `integration_stats` (`tenantId`);--> statement-breakpoint
CREATE INDEX `stats_data_idx` ON `integration_stats` (`data`);--> statement-breakpoint
CREATE INDEX `stats_tipo_idx` ON `integration_stats` (`tipoIntegracao`);--> statement-breakpoint
CREATE INDEX `rnds_cred_tenant_idx` ON `rnds_credentials` (`tenantId`);--> statement-breakpoint
CREATE INDEX `rnds_cred_est_idx` ON `rnds_credentials` (`establishmentId`);--> statement-breakpoint
CREATE INDEX `rnds_cred_ambiente_idx` ON `rnds_credentials` (`ambiente`);