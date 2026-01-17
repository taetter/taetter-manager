CREATE TABLE `absenceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`dataInicio` date NOT NULL,
	`dataFim` date NOT NULL,
	`totalDias` int NOT NULL,
	`tipo` enum('ferias','atestado','licenca_maternidade','licenca_paternidade','falta_justificada','falta_injustificada','outro') NOT NULL,
	`motivo` text,
	`documentoUrl` text,
	`status` enum('pendente','aprovada','reprovada') DEFAULT 'pendente',
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `absenceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeBenefits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`tipo` enum('vale_transporte','vale_refeicao','vale_alimentacao','plano_saude','plano_odontologico','seguro_vida','outro') NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`valorEmpresa` decimal(10,2),
	`valorColaborador` decimal(10,2),
	`dataInicio` date,
	`dataFim` date,
	`status` enum('ativo','inativo','suspenso') DEFAULT 'ativo',
	`fornecedor` varchar(255),
	`numeroCartao` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeBenefits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hrEmployees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`rg` varchar(20),
	`dataNascimento` date,
	`sexo` enum('masculino','feminino','outro'),
	`estadoCivil` enum('solteiro','casado','divorciado','viuvo','outro'),
	`email` varchar(255),
	`telefone` varchar(20),
	`celular` varchar(20),
	`cep` varchar(10),
	`endereco` text,
	`numero` varchar(20),
	`complemento` varchar(100),
	`bairro` varchar(100),
	`cidade` varchar(100),
	`estado` varchar(2),
	`cargo` varchar(255),
	`setor` varchar(100),
	`dataAdmissao` date,
	`dataDemissao` date,
	`tipoContrato` enum('clt','pj','estagio','temporario','autonomo'),
	`salario` decimal(10,2),
	`cargaHoraria` int DEFAULT 40,
	`perfil` enum('gestor','aplicador','global','suporte','administrativo','financeiro'),
	`ctps` varchar(50),
	`pis` varchar(20),
	`tituloEleitor` varchar(20),
	`carteiraMotorista` varchar(20),
	`categoriaHabilitacao` varchar(5),
	`registroProfissional` varchar(50),
	`orgaoRegistro` varchar(50),
	`status` enum('ativo','ferias','afastado','demitido') DEFAULT 'ativo',
	`observacoes` text,
	`fotoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hrEmployees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mileageRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`data` date NOT NULL,
	`origem` varchar(255) NOT NULL,
	`destino` varchar(255) NOT NULL,
	`kmInicial` decimal(10,2),
	`kmFinal` decimal(10,2),
	`kmPercorrido` decimal(10,2) NOT NULL,
	`motivo` text,
	`cliente` varchar(255),
	`veiculo` varchar(100),
	`placa` varchar(10),
	`valorKm` decimal(10,2),
	`valorTotal` decimal(10,2),
	`status` enum('pendente','aprovado','reprovado','pago') DEFAULT 'pendente',
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`comprovanteUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mileageRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `overtimeRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`data` date NOT NULL,
	`horaInicio` varchar(5) NOT NULL,
	`horaFim` varchar(5) NOT NULL,
	`totalHoras` decimal(5,2) NOT NULL,
	`motivo` text NOT NULL,
	`atividades` text,
	`tipo` enum('normal','noturna','feriado','domingo') DEFAULT 'normal',
	`status` enum('pendente','aprovada','reprovada') DEFAULT 'pendente',
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`motivoReprovacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `overtimeRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payrolls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`mesReferencia` int NOT NULL,
	`anoReferencia` int NOT NULL,
	`salarioBase` decimal(10,2) NOT NULL,
	`horasExtras` decimal(10,2) DEFAULT '0',
	`adicionalNoturno` decimal(10,2) DEFAULT '0',
	`comissoes` decimal(10,2) DEFAULT '0',
	`bonificacoes` decimal(10,2) DEFAULT '0',
	`outrosVencimentos` decimal(10,2) DEFAULT '0',
	`inss` decimal(10,2) DEFAULT '0',
	`irrf` decimal(10,2) DEFAULT '0',
	`fgts` decimal(10,2) DEFAULT '0',
	`valeTransporte` decimal(10,2) DEFAULT '0',
	`valeRefeicao` decimal(10,2) DEFAULT '0',
	`planoSaude` decimal(10,2) DEFAULT '0',
	`outrosDescontos` decimal(10,2) DEFAULT '0',
	`totalVencimentos` decimal(10,2) NOT NULL,
	`totalDescontos` decimal(10,2) NOT NULL,
	`salarioLiquido` decimal(10,2) NOT NULL,
	`status` enum('rascunho','calculado','aprovado','pago') DEFAULT 'rascunho',
	`dataPagamento` date,
	`holeriteUrl` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrolls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profilePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`perfil` enum('gestor','aplicador','global','suporte','administrativo','financeiro') NOT NULL,
	`moduloPacientes` boolean DEFAULT false,
	`moduloEstoque` boolean DEFAULT false,
	`moduloAplicacao` boolean DEFAULT false,
	`moduloFinanceiro` boolean DEFAULT false,
	`moduloQualidade` boolean DEFAULT false,
	`moduloIndicadores` boolean DEFAULT false,
	`moduloRH` boolean DEFAULT false,
	`podeEditar` boolean DEFAULT false,
	`podeDeletar` boolean DEFAULT false,
	`podeAprovar` boolean DEFAULT false,
	`podeExportar` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profilePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeClocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`data` date NOT NULL,
	`horaEntrada` varchar(5),
	`horaSaidaAlmoco` varchar(5),
	`horaRetornoAlmoco` varchar(5),
	`horaSaida` varchar(5),
	`latitudeEntrada` decimal(10,7),
	`longitudeEntrada` decimal(10,7),
	`latitudeSaida` decimal(10,7),
	`longitudeSaida` decimal(10,7),
	`horasTrabalhadas` decimal(5,2),
	`horasExtras` decimal(5,2),
	`status` enum('normal','falta','atestado','ferias','folga') DEFAULT 'normal',
	`justificativa` text,
	`atestadoUrl` text,
	`aprovado` boolean,
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeClocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workAccidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`employeeId` int NOT NULL,
	`dataAcidente` date NOT NULL,
	`horaAcidente` varchar(5),
	`localAcidente` text NOT NULL,
	`descricaoAcidente` text NOT NULL,
	`parteCorpoAtingida` varchar(255),
	`naturezaLesao` varchar(255),
	`testemunhas` text,
	`houveSocorro` boolean DEFAULT false,
	`localSocorro` varchar(255),
	`houveAfastamento` boolean DEFAULT false,
	`diasAfastamento` int,
	`atestadoUrl` text,
	`fotosUrl` text,
	`catUrl` text,
	`status` enum('registrado','em_analise','encerrado') DEFAULT 'registrado',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workAccidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `abs_tenant_idx` ON `absenceRecords` (`tenantId`);--> statement-breakpoint
CREATE INDEX `abs_employee_idx` ON `absenceRecords` (`employeeId`);--> statement-breakpoint
CREATE INDEX `abs_data_idx` ON `absenceRecords` (`dataInicio`);--> statement-breakpoint
CREATE INDEX `abs_status_idx` ON `absenceRecords` (`status`);--> statement-breakpoint
CREATE INDEX `ben_tenant_idx` ON `employeeBenefits` (`tenantId`);--> statement-breakpoint
CREATE INDEX `ben_employee_idx` ON `employeeBenefits` (`employeeId`);--> statement-breakpoint
CREATE INDEX `ben_tipo_idx` ON `employeeBenefits` (`tipo`);--> statement-breakpoint
CREATE INDEX `ben_status_idx` ON `employeeBenefits` (`status`);--> statement-breakpoint
CREATE INDEX `emp_tenant_idx` ON `hrEmployees` (`tenantId`);--> statement-breakpoint
CREATE INDEX `emp_cpf_idx` ON `hrEmployees` (`cpf`);--> statement-breakpoint
CREATE INDEX `emp_status_idx` ON `hrEmployees` (`status`);--> statement-breakpoint
CREATE INDEX `emp_perfil_idx` ON `hrEmployees` (`perfil`);--> statement-breakpoint
CREATE INDEX `mile_tenant_idx` ON `mileageRecords` (`tenantId`);--> statement-breakpoint
CREATE INDEX `mile_employee_idx` ON `mileageRecords` (`employeeId`);--> statement-breakpoint
CREATE INDEX `mile_data_idx` ON `mileageRecords` (`data`);--> statement-breakpoint
CREATE INDEX `mile_status_idx` ON `mileageRecords` (`status`);--> statement-breakpoint
CREATE INDEX `over_tenant_idx` ON `overtimeRequests` (`tenantId`);--> statement-breakpoint
CREATE INDEX `over_employee_idx` ON `overtimeRequests` (`employeeId`);--> statement-breakpoint
CREATE INDEX `over_data_idx` ON `overtimeRequests` (`data`);--> statement-breakpoint
CREATE INDEX `over_status_idx` ON `overtimeRequests` (`status`);--> statement-breakpoint
CREATE INDEX `pay_tenant_idx` ON `payrolls` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pay_employee_idx` ON `payrolls` (`employeeId`);--> statement-breakpoint
CREATE INDEX `pay_referencia_idx` ON `payrolls` (`anoReferencia`,`mesReferencia`);--> statement-breakpoint
CREATE INDEX `pay_status_idx` ON `payrolls` (`status`);--> statement-breakpoint
CREATE INDEX `perm_tenant_perfil_idx` ON `profilePermissions` (`tenantId`,`perfil`);--> statement-breakpoint
CREATE INDEX `time_tenant_idx` ON `timeClocks` (`tenantId`);--> statement-breakpoint
CREATE INDEX `time_employee_idx` ON `timeClocks` (`employeeId`);--> statement-breakpoint
CREATE INDEX `time_data_idx` ON `timeClocks` (`data`);--> statement-breakpoint
CREATE INDEX `time_status_idx` ON `timeClocks` (`status`);--> statement-breakpoint
CREATE INDEX `cat_tenant_idx` ON `workAccidents` (`tenantId`);--> statement-breakpoint
CREATE INDEX `cat_employee_idx` ON `workAccidents` (`employeeId`);--> statement-breakpoint
CREATE INDEX `cat_data_idx` ON `workAccidents` (`dataAcidente`);--> statement-breakpoint
CREATE INDEX `cat_status_idx` ON `workAccidents` (`status`);