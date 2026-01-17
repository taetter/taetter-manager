CREATE TABLE `auditChecklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`categoria` varchar(100),
	`item` text NOT NULL,
	`criterio` text,
	`conforme` boolean,
	`naoConforme` boolean,
	`naoAplicavel` boolean,
	`observacao` text,
	`evidencia` text,
	`peso` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auditChecklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditChecklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipo` enum('vigilancia_sanitaria','acreditacao','interna','fornecedor','outro') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataPrevista` date,
	`dataRealizacao` date,
	`auditor` varchar(255),
	`status` enum('pendente','em_andamento','concluida','aprovada','reprovada') NOT NULL DEFAULT 'pendente',
	`pontuacao` int,
	`pontuacaoMaxima` int,
	`observacoes` text,
	`naoConformidades` text,
	`planosAcao` text,
	`relatorioUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auditChecklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenanceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipoEquipamento` enum('geladeira','freezer','ar_condicionado','gerador','computador','impressora','outro') NOT NULL,
	`equipamentoId` int,
	`nomeEquipamento` varchar(255) NOT NULL,
	`tipoManutencao` enum('preventiva','corretiva','preditiva') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`dataPrevista` date,
	`dataRealizacao` date,
	`proximaManutencao` date,
	`responsavel` varchar(255),
	`empresa` varchar(255),
	`custo` decimal(10,2),
	`status` enum('agendada','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'agendada',
	`observacoes` text,
	`pecasTrocadas` text,
	`notaFiscalUrl` text,
	`relatorioUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `occurrences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipo` enum('reacao_pos_vacinal','efeito_adverso','reclamacao','sugestao','elogio','outro') NOT NULL,
	`pacienteId` int,
	`vaccineApplicationId` int,
	`nomeContato` varchar(255),
	`telefoneContato` varchar(20),
	`emailContato` varchar(255),
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`gravidade` enum('baixa','media','alta','critica') DEFAULT 'media',
	`dataOcorrencia` timestamp NOT NULL,
	`dataRegistro` timestamp NOT NULL DEFAULT (now()),
	`status` enum('aberta','em_analise','em_tratamento','resolvida','fechada') NOT NULL DEFAULT 'aberta',
	`responsavel` varchar(255),
	`acaoTomada` text,
	`dataResolucao` timestamp,
	`notificadoVigilancia` boolean DEFAULT false,
	`protocoloNotificacao` varchar(100),
	`anexoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `occurrences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`versao` varchar(20) NOT NULL,
	`objetivo` text NOT NULL,
	`aplicacao` text,
	`responsavel` varchar(255),
	`procedimento` text NOT NULL,
	`dataElaboracao` date NOT NULL,
	`dataRevisao` date,
	`proximaRevisao` date,
	`status` enum('ativo','revisao','obsoleto') NOT NULL DEFAULT 'ativo',
	`arquivoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulatoryDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipo` enum('alvara','licenca','certificado','laudo','protocolo','outro') NOT NULL,
	`numero` varchar(100) NOT NULL,
	`orgaoEmissor` varchar(255) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataEmissao` date NOT NULL,
	`dataValidade` date,
	`status` enum('valido','vencido','em_renovacao','suspenso') NOT NULL DEFAULT 'valido',
	`arquivoUrl` text,
	`diasAntesAlerta` int DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regulatoryDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temperatureMonitoring` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipoEquipamento` enum('geladeira','caixa_transporte','freezer','camara_fria') NOT NULL,
	`equipamentoId` int,
	`nomeEquipamento` varchar(255) NOT NULL,
	`temperatura` decimal(5,2) NOT NULL,
	`temperaturaMinima` decimal(5,2),
	`temperaturaMaxima` decimal(5,2),
	`dentroDoLimite` boolean NOT NULL,
	`limiteInferior` decimal(5,2) DEFAULT '2.00',
	`limiteSuperior` decimal(5,2) DEFAULT '8.00',
	`responsavel` varchar(255),
	`acaoCorretiva` text,
	`dataHoraRegistro` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `temperatureMonitoring_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainingId` int NOT NULL,
	`employeeId` int NOT NULL,
	`presente` boolean DEFAULT true,
	`aprovado` boolean,
	`nota` decimal(5,2),
	`certificadoEmitido` boolean DEFAULT false,
	`certificadoUrl` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`tipo` enum('admissao','reciclagem','capacitacao','workshop','palestra','curso','outro') NOT NULL,
	`categoria` varchar(100),
	`descricao` text,
	`objetivo` text,
	`conteudoProgramatico` text,
	`instrutor` varchar(255),
	`empresaInstrutora` varchar(255),
	`dataRealizacao` date NOT NULL,
	`cargaHoraria` int,
	`status` enum('planejado','realizado','cancelado') NOT NULL DEFAULT 'planejado',
	`certificado` boolean DEFAULT false,
	`validadeCertificado` date,
	`materialUrl` text,
	`listaPresencaUrl` text,
	`certificadoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audititem_checklist_idx` ON `auditChecklistItems` (`checklistId`);--> statement-breakpoint
CREATE INDEX `audit_tenant_idx` ON `auditChecklists` (`tenantId`);--> statement-breakpoint
CREATE INDEX `audit_tipo_idx` ON `auditChecklists` (`tipo`);--> statement-breakpoint
CREATE INDEX `audit_status_idx` ON `auditChecklists` (`status`);--> statement-breakpoint
CREATE INDEX `audit_data_idx` ON `auditChecklists` (`dataPrevista`);--> statement-breakpoint
CREATE INDEX `maint_tenant_idx` ON `maintenanceRecords` (`tenantId`);--> statement-breakpoint
CREATE INDEX `maint_equipamento_idx` ON `maintenanceRecords` (`equipamentoId`);--> statement-breakpoint
CREATE INDEX `maint_tipo_idx` ON `maintenanceRecords` (`tipoManutencao`);--> statement-breakpoint
CREATE INDEX `maint_status_idx` ON `maintenanceRecords` (`status`);--> statement-breakpoint
CREATE INDEX `maint_data_idx` ON `maintenanceRecords` (`dataPrevista`);--> statement-breakpoint
CREATE INDEX `occ_tenant_idx` ON `occurrences` (`tenantId`);--> statement-breakpoint
CREATE INDEX `occ_paciente_idx` ON `occurrences` (`pacienteId`);--> statement-breakpoint
CREATE INDEX `occ_tipo_idx` ON `occurrences` (`tipo`);--> statement-breakpoint
CREATE INDEX `occ_status_idx` ON `occurrences` (`status`);--> statement-breakpoint
CREATE INDEX `occ_gravidade_idx` ON `occurrences` (`gravidade`);--> statement-breakpoint
CREATE INDEX `pops_tenant_idx` ON `pops` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pops_codigo_idx` ON `pops` (`codigo`);--> statement-breakpoint
CREATE INDEX `pops_status_idx` ON `pops` (`status`);--> statement-breakpoint
CREATE INDEX `regdoc_tenant_idx` ON `regulatoryDocuments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `regdoc_tipo_idx` ON `regulatoryDocuments` (`tipo`);--> statement-breakpoint
CREATE INDEX `regdoc_status_idx` ON `regulatoryDocuments` (`status`);--> statement-breakpoint
CREATE INDEX `regdoc_validade_idx` ON `regulatoryDocuments` (`dataValidade`);--> statement-breakpoint
CREATE INDEX `tempmon_tenant_idx` ON `temperatureMonitoring` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tempmon_equipamento_idx` ON `temperatureMonitoring` (`equipamentoId`);--> statement-breakpoint
CREATE INDEX `tempmon_tipo_idx` ON `temperatureMonitoring` (`tipoEquipamento`);--> statement-breakpoint
CREATE INDEX `tempmon_data_idx` ON `temperatureMonitoring` (`dataHoraRegistro`);--> statement-breakpoint
CREATE INDEX `tempmon_conformidade_idx` ON `temperatureMonitoring` (`dentroDoLimite`);--> statement-breakpoint
CREATE INDEX `trainpart_training_idx` ON `trainingParticipants` (`trainingId`);--> statement-breakpoint
CREATE INDEX `trainpart_employee_idx` ON `trainingParticipants` (`employeeId`);--> statement-breakpoint
CREATE INDEX `train_tenant_idx` ON `trainingRecords` (`tenantId`);--> statement-breakpoint
CREATE INDEX `train_tipo_idx` ON `trainingRecords` (`tipo`);--> statement-breakpoint
CREATE INDEX `train_status_idx` ON `trainingRecords` (`status`);--> statement-breakpoint
CREATE INDEX `train_data_idx` ON `trainingRecords` (`dataRealizacao`);