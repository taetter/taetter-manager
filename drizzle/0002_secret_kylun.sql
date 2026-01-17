CREATE TABLE `adverseEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`applicationId` int NOT NULL,
	`patientId` int NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`gravidade` enum('leve','moderada','grave') NOT NULL,
	`descricao` text NOT NULL,
	`dataOcorrencia` timestamp NOT NULL,
	`dataResolucao` timestamp,
	`conduta` text,
	`notificado` boolean DEFAULT false,
	`protocoloNotificacao` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adverseEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`dataAplicacao` timestamp NOT NULL,
	`profissionalId` int NOT NULL,
	`profissionalNome` varchar(255) NOT NULL,
	`profissionalRegistro` varchar(50),
	`dose` varchar(50),
	`via` varchar(50),
	`local` varchar(100),
	`proximaDose` timestamp,
	`rndsEnviado` boolean DEFAULT false,
	`rndsProtocolo` varchar(100),
	`rndsDataEnvio` timestamp,
	`rndsErro` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeCertifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`instituicao` varchar(255),
	`dataEmissao` timestamp,
	`dataValidade` timestamp,
	`documentoUrl` text,
	`documentoKey` varchar(255),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employeeCertifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`rg` varchar(20),
	`dataNascimento` timestamp,
	`email` varchar(320),
	`telefone` varchar(20),
	`cargo` varchar(100) NOT NULL,
	`registroProfissional` varchar(50),
	`especialidade` varchar(100),
	`dataAdmissao` timestamp,
	`dataDemissao` timestamp,
	`tipoContrato` varchar(50),
	`ativo` boolean NOT NULL DEFAULT true,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`descricao` varchar(255),
	`fileUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patientDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`rg` varchar(20),
	`dataNascimento` timestamp NOT NULL,
	`sexo` enum('M','F','Outro'),
	`nomeMae` varchar(255),
	`nomePai` varchar(255),
	`email` varchar(320),
	`telefone` varchar(20),
	`celular` varchar(20),
	`endereco` text,
	`numero` varchar(20),
	`complemento` varchar(100),
	`bairro` varchar(100),
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`cartaoSus` varchar(15),
	`observacoes` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`tipo` enum('entrada','saida','ajuste','perda') NOT NULL,
	`quantidade` int NOT NULL,
	`quantidadeAnterior` int NOT NULL,
	`quantidadeNova` int NOT NULL,
	`motivo` varchar(255),
	`observacoes` text,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`descricao` varchar(255) NOT NULL,
	`valor` int NOT NULL,
	`patientId` int,
	`applicationId` int,
	`formaPagamento` varchar(50),
	`status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`dataPagamento` timestamp,
	`nfeNumero` varchar(50),
	`nfeChave` varchar(44),
	`nfeDataEmissao` timestamp,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`fabricante` varchar(255),
	`lote` varchar(100) NOT NULL,
	`validade` timestamp NOT NULL,
	`categoria` varchar(100),
	`doencas` text,
	`quantidadeTotal` int NOT NULL DEFAULT 0,
	`quantidadeDisponivel` int NOT NULL DEFAULT 0,
	`quantidadeReservada` int DEFAULT 0,
	`precoCompra` int,
	`precoVenda` int,
	`temperaturaMin` int,
	`temperaturaMax` int,
	`localizacao` varchar(100),
	`observacoes` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `adverse_tenant_idx` ON `adverseEvents` (`tenantId`);--> statement-breakpoint
CREATE INDEX `adverse_app_idx` ON `adverseEvents` (`applicationId`);--> statement-breakpoint
CREATE INDEX `adverse_patient_idx` ON `adverseEvents` (`patientId`);--> statement-breakpoint
CREATE INDEX `app_tenant_idx` ON `applications` (`tenantId`);--> statement-breakpoint
CREATE INDEX `app_patient_idx` ON `applications` (`patientId`);--> statement-breakpoint
CREATE INDEX `app_vaccine_idx` ON `applications` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `app_data_idx` ON `applications` (`dataAplicacao`);--> statement-breakpoint
CREATE INDEX `cert_tenant_idx` ON `employeeCertifications` (`tenantId`);--> statement-breakpoint
CREATE INDEX `cert_employee_idx` ON `employeeCertifications` (`employeeId`);--> statement-breakpoint
CREATE INDEX `emp_tenant_idx` ON `employees` (`tenantId`);--> statement-breakpoint
CREATE INDEX `emp_cpf_idx` ON `employees` (`cpf`);--> statement-breakpoint
CREATE INDEX `emp_cargo_idx` ON `employees` (`cargo`);--> statement-breakpoint
CREATE INDEX `patient_doc_tenant_idx` ON `patientDocuments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `patient_doc_patient_idx` ON `patientDocuments` (`patientId`);--> statement-breakpoint
CREATE INDEX `patient_tenant_idx` ON `patients` (`tenantId`);--> statement-breakpoint
CREATE INDEX `patient_cpf_idx` ON `patients` (`cpf`);--> statement-breakpoint
CREATE INDEX `patient_nome_idx` ON `patients` (`nome`);--> statement-breakpoint
CREATE INDEX `stock_mov_tenant_idx` ON `stockMovements` (`tenantId`);--> statement-breakpoint
CREATE INDEX `stock_mov_vaccine_idx` ON `stockMovements` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `stock_mov_tipo_idx` ON `stockMovements` (`tipo`);--> statement-breakpoint
CREATE INDEX `trans_tenant_idx` ON `transactions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `trans_tipo_idx` ON `transactions` (`tipo`);--> statement-breakpoint
CREATE INDEX `trans_status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `trans_patient_idx` ON `transactions` (`patientId`);--> statement-breakpoint
CREATE INDEX `vaccine_tenant_idx` ON `vaccines` (`tenantId`);--> statement-breakpoint
CREATE INDEX `vaccine_lote_idx` ON `vaccines` (`lote`);--> statement-breakpoint
CREATE INDEX `vaccine_validade_idx` ON `vaccines` (`validade`);