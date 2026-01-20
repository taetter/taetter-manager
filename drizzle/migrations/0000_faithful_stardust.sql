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
	`tipoEtiqueta` enum('fisica_virtual','somente_virtual'),
	`etiquetaFisicaGerada` boolean DEFAULT false,
	`etiquetaVirtualGerada` boolean DEFAULT false,
	`etiquetaZPL` text,
	`etiquetaVirtualUrl` varchar(500),
	`pagadorMesmoPaciente` boolean DEFAULT true,
	`pagadorId` int,
	`pagadorNome` varchar(255),
	`pagadorCPF` varchar(14),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointment_routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`dataRota` date NOT NULL,
	`employeeId` int NOT NULL,
	`appointmentIds` json NOT NULL,
	`distanciaTotal` decimal(10,2),
	`tempoTotal` int,
	`rotaOtimizada` json,
	`status` enum('planejada','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'planejada',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointment_routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`patientName` varchar(255) NOT NULL,
	`patientPhone` varchar(20),
	`dataHora` timestamp NOT NULL,
	`tipo` enum('unidade','domiciliar') NOT NULL,
	`unitId` int,
	`endereco` text,
	`vaccineIds` json,
	`vaccineNames` text,
	`duracao` int DEFAULT 30,
	`homeCareAddressId` int,
	`valorTotal` decimal(12,2),
	`taxaDomiciliar` decimal(12,2) DEFAULT '0.00',
	`descontoAntecipado` decimal(12,2) DEFAULT '0.00',
	`valorFinal` decimal(12,2),
	`status` enum('pendente','confirmado','realizado','cancelado') NOT NULL DEFAULT 'pendente',
	`motivoCancelamento` text,
	`pagamentoAntecipado` boolean DEFAULT false,
	`paymentLinkId` varchar(255),
	`notificacaoEnviada` boolean DEFAULT false,
	`dataNotificacao` timestamp,
	`employeeId` int,
	`routeId` int,
	`ordemNaRota` int,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entity` varchar(100) NOT NULL,
	`entityId` int,
	`changes` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`banco` varchar(100) NOT NULL,
	`agencia` varchar(20) NOT NULL,
	`conta` varchar(20) NOT NULL,
	`tipoConta` enum('corrente','poupanca','pagamento') NOT NULL,
	`apelido` varchar(100) NOT NULL,
	`descricao` text,
	`saldoInicial` decimal(12,2) NOT NULL DEFAULT '0.00',
	`saldoAtual` decimal(12,2) NOT NULL DEFAULT '0.00',
	`ativa` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bankReconciliations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`dataMovimento` date NOT NULL,
	`descricao` text NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`tipo` enum('credito','debito') NOT NULL,
	`conciliado` boolean NOT NULL DEFAULT false,
	`transactionId` int,
	`dataConciliacao` timestamp,
	`conciladoPor` int,
	`banco` varchar(100),
	`agencia` varchar(20),
	`conta` varchar(20),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bankReconciliations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`numero` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`dataNascimento` timestamp,
	`email` varchar(320),
	`celular` varchar(20),
	`vaccineIds` json NOT NULL,
	`vaccineNames` text NOT NULL,
	`vaccineQuantities` json,
	`vaccinePrices` json,
	`valorTotal` int NOT NULL,
	`desconto` int DEFAULT 0,
	`valorFinal` int NOT NULL,
	`dataValidade` timestamp NOT NULL,
	`status` enum('pendente','aprovado','recusado','convertido','expirado','cancelado') NOT NULL DEFAULT 'pendente',
	`applicationId` int,
	`dataConversao` timestamp,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `budgets_numero_unique` UNIQUE(`numero`)
);
--> statement-breakpoint
CREATE TABLE `electronicInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`numero` varchar(50) NOT NULL,
	`serie` varchar(10) NOT NULL,
	`chaveAcesso` varchar(44),
	`dataEmissao` timestamp NOT NULL,
	`dataSaida` timestamp,
	`pacienteId` int,
	`nomeCliente` varchar(255) NOT NULL,
	`cpfCnpjCliente` varchar(18) NOT NULL,
	`valorTotal` decimal(12,2) NOT NULL,
	`valorDesconto` decimal(12,2),
	`valorLiquido` decimal(12,2) NOT NULL,
	`status` enum('rascunho','emitida','autorizada','cancelada','denegada') NOT NULL DEFAULT 'rascunho',
	`xmlUrl` text,
	`pdfUrl` text,
	`protocoloAutorizacao` varchar(50),
	`dataAutorizacao` timestamp,
	`motivoCancelamento` text,
	`dataCancelamento` timestamp,
	`transactionId` int,
	`vaccineApplicationId` int,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `electronicInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `electronicInvoices_numero_unique` UNIQUE(`numero`),
	CONSTRAINT `electronicInvoices_chaveAcesso_unique` UNIQUE(`chaveAcesso`)
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
CREATE TABLE `financialTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`metodoPagamento` enum('dinheiro','pix','debito','credito','boleto') NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`valorPago` decimal(12,2),
	`dataTransacao` date NOT NULL,
	`dataVencimento` date,
	`dataPagamento` date,
	`status` enum('pendente','pago','cancelado','estornado') NOT NULL DEFAULT 'pendente',
	`conciliado` boolean NOT NULL DEFAULT false,
	`dataConciliacao` timestamp,
	`pacienteId` int,
	`vaccineApplicationId` int,
	`nfeId` int,
	`descricao` text,
	`observacoes` text,
	`parcelado` boolean NOT NULL DEFAULT false,
	`numeroParcelas` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `home_care_addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`cep` varchar(9) NOT NULL,
	`logradouro` varchar(255) NOT NULL,
	`numero` varchar(20) NOT NULL,
	`complemento` varchar(100),
	`bairro` varchar(100) NOT NULL,
	`cidade` varchar(100) NOT NULL,
	`estado` varchar(2) NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`regiao` enum('grande_campinas','regiao_entorno','outra') NOT NULL DEFAULT 'grande_campinas',
	`pontoReferencia` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `home_care_addresses_id` PRIMARY KEY(`id`)
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
	`senha` varchar(255),
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
CREATE TABLE `installments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`transactionId` int NOT NULL,
	`numeroParcela` int NOT NULL,
	`totalParcelas` int NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`dataVencimento` date NOT NULL,
	`dataPagamento` date,
	`status` enum('pendente','pago','atrasado','cancelado') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installments_id` PRIMARY KEY(`id`)
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
CREATE TABLE `patientVaccinationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`pacienteId` int NOT NULL,
	`vaccineApplicationId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`nomeVacina` varchar(255) NOT NULL,
	`lote` varchar(100) NOT NULL,
	`dataValidade` date NOT NULL,
	`dataAplicacao` date NOT NULL,
	`unidadeId` int NOT NULL,
	`nomeUnidade` varchar(255) NOT NULL,
	`refrigeratorId` int NOT NULL,
	`nomeGeladeira` varchar(255) NOT NULL,
	`profissionalId` int,
	`nomeProfissional` varchar(255),
	`etiquetaFisicaUrl` text,
	`etiquetaVirtualUrl` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientVaccinationHistory_id` PRIMARY KEY(`id`)
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
	`telefoneResponsavel` varchar(20),
	`endereco` text,
	`numero` varchar(20),
	`complemento` varchar(100),
	`bairro` varchar(100),
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`cartaoSus` varchar(15),
	`fotoUrl` varchar(500),
	`fotoKey` varchar(255),
	`senhaHash` varchar(255),
	`primeiroAcesso` boolean DEFAULT true,
	`observacoes` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`applicationId` int NOT NULL,
	`tipo` enum('pix','credito','debito','dinheiro') NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`pixQrCode` text,
	`pixChave` varchar(255),
	`pixTxId` varchar(255),
	`cartaoBandeira` varchar(50),
	`cartaoUltimosDigitos` varchar(4),
	`cartaoNsu` varchar(50),
	`comprovanteUrl` text,
	`comprovanteKey` varchar(255),
	`status` enum('pendente','aprovado','recusado','cancelado') NOT NULL DEFAULT 'pendente',
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
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
CREATE TABLE `price_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`tipoDesconto` enum('percentual','valor_fixo') NOT NULL,
	`valorDesconto` int NOT NULL,
	`vaccineIds` json,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`padrao` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_tables_id` PRIMARY KEY(`id`)
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
CREATE TABLE `quotationItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotationId` int NOT NULL,
	`nomeVacina` varchar(255) NOT NULL,
	`fabricante` varchar(255),
	`quantidade` int NOT NULL,
	`precoUnitario` decimal(10,2),
	`precoTotal` decimal(12,2),
	`lote` varchar(100),
	`dataValidade` date,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotationItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`numero` varchar(50) NOT NULL,
	`fornecedor` varchar(255) NOT NULL,
	`contatoFornecedor` varchar(255),
	`emailFornecedor` varchar(255),
	`telefoneFornecedor` varchar(20),
	`dataSolicitacao` date NOT NULL,
	`dataValidade` date,
	`dataResposta` date,
	`status` varchar(20) NOT NULL DEFAULT 'pendente',
	`valorTotal` decimal(12,2),
	`observacoes` text,
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refrigeratorMaintenances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`refrigeratorId` int NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`descricao` text,
	`dataManutencao` date NOT NULL,
	`proximaManutencao` date,
	`tecnicoResponsavel` varchar(255),
	`empresaManutencao` varchar(255),
	`custoManutencao` decimal(10,2),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `refrigeratorMaintenances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refrigerators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`unitId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`modelo` varchar(100),
	`marca` varchar(100),
	`numeroSerie` varchar(100),
	`temperaturaMin` decimal(4,1),
	`temperaturaMax` decimal(4,1),
	`temperaturaAtual` decimal(4,1),
	`capacidadeLitros` int,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `refrigerators_id` PRIMARY KEY(`id`)
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
CREATE TABLE `temperatureLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`refrigeratorId` int NOT NULL,
	`temperatura` decimal(4,1) NOT NULL,
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`foraDoLimite` boolean NOT NULL DEFAULT false,
	`alertaEnviado` boolean NOT NULL DEFAULT false,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `temperatureLogs_id` PRIMARY KEY(`id`)
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
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(18) NOT NULL,
	`razaoSocial` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telefone` varchar(20),
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`responsavelNome` varchar(255),
	`responsavelCpf` varchar(14),
	`responsavelEmail` varchar(320),
	`responsavelTelefone` varchar(20),
	`status` enum('ativo','inativo','suspenso') NOT NULL DEFAULT 'ativo',
	`plan` enum('basic','intermediate','full') NOT NULL DEFAULT 'basic',
	`enabledModules` json,
	`dataExpiracao` timestamp,
	`configuracoes` text,
	`patientPortalUrl` varchar(500),
	`databaseName` varchar(100),
	`databaseHost` varchar(255),
	`databasePort` int DEFAULT 3306,
	`subdomain` varchar(100),
	`environment` enum('homologation','production') NOT NULL DEFAULT 'homologation',
	`homologationStartedAt` timestamp,
	`productionActivatedAt` timestamp,
	`version` int NOT NULL DEFAULT 1,
	`cnes` varchar(15),
	`inscricaoEstadual` varchar(20),
	`inscricaoMunicipal` varchar(20),
	`logoUrl` varchar(500),
	`faviconUrl` varchar(500),
	`primaryColor` varchar(7),
	`secondaryColor` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_cnpj_unique` UNIQUE(`cnpj`),
	CONSTRAINT `tenants_databaseName_unique` UNIQUE(`databaseName`),
	CONSTRAINT `tenants_subdomain_unique` UNIQUE(`subdomain`)
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
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`telefone` varchar(20),
	`responsavel` varchar(255),
	`responsavelTecnico` varchar(255),
	`crmResponsavel` varchar(20),
	`imagemUrl` text,
	`cnpj` varchar(18),
	`email` varchar(255),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supabaseUserId` varchar(36),
	`openId` varchar(64),
	`username` varchar(64),
	`passwordHash` varchar(255),
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','super_admin') NOT NULL DEFAULT 'user',
	`tenantId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_supabaseUserId_unique` UNIQUE(`supabaseUserId`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `vaccineApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`patientId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`unitId` int NOT NULL,
	`refrigeratorId` int NOT NULL,
	`employeeId` int,
	`dataAplicacao` timestamp NOT NULL,
	`lote` varchar(100) NOT NULL,
	`dose` varchar(50),
	`localAplicacao` varchar(100),
	`viaAdministracao` varchar(50),
	`etiquetaZebraUrl` text,
	`etiquetaVirtual` boolean DEFAULT false,
	`observacoes` text,
	`status` enum('pendente','aplicada','cancelada') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccineApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccine_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`priceTableId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`preco` int NOT NULL,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccine_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccine_reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`appointmentId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`lote` varchar(50) NOT NULL,
	`quantidade` int NOT NULL DEFAULT 1,
	`refrigeratorId` int NOT NULL,
	`status` enum('reservada','aplicada','cancelada','expirada') NOT NULL DEFAULT 'reservada',
	`dataReserva` timestamp NOT NULL DEFAULT (now()),
	`dataExpiracao` timestamp NOT NULL,
	`dataAplicacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccine_reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`refrigeratorId` int,
	`nome` varchar(255) NOT NULL,
	`nomeFantasia` varchar(255),
	`fabricante` varchar(255),
	`marca` varchar(255),
	`lote` varchar(100) NOT NULL,
	`codigoBarras` varchar(100),
	`validade` timestamp NOT NULL,
	`categoria` varchar(100),
	`doencas` text,
	`quantidadeTotal` int NOT NULL DEFAULT 0,
	`quantidadeDisponivel` int NOT NULL DEFAULT 0,
	`quantidadeReservada` int DEFAULT 0,
	`estoqueMinimo` int DEFAULT 10,
	`precoCompra` int,
	`precoVenda` int,
	`temperaturaMin` int,
	`temperaturaMax` int,
	`localizacao` varchar(100),
	`observacoes` text,
	`bula` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vaccines_id` PRIMARY KEY(`id`)
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
CREATE INDEX `adverse_tenant_idx` ON `adverseEvents` (`tenantId`);--> statement-breakpoint
CREATE INDEX `adverse_app_idx` ON `adverseEvents` (`applicationId`);--> statement-breakpoint
CREATE INDEX `adverse_patient_idx` ON `adverseEvents` (`patientId`);--> statement-breakpoint
CREATE INDEX `app_tenant_idx` ON `applications` (`tenantId`);--> statement-breakpoint
CREATE INDEX `app_patient_idx` ON `applications` (`patientId`);--> statement-breakpoint
CREATE INDEX `app_vaccine_idx` ON `applications` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `app_data_idx` ON `applications` (`dataAplicacao`);--> statement-breakpoint
CREATE INDEX `route_tenant_idx` ON `appointment_routes` (`tenantId`);--> statement-breakpoint
CREATE INDEX `route_data_idx` ON `appointment_routes` (`dataRota`);--> statement-breakpoint
CREATE INDEX `route_employee_idx` ON `appointment_routes` (`employeeId`);--> statement-breakpoint
CREATE INDEX `route_status_idx` ON `appointment_routes` (`status`);--> statement-breakpoint
CREATE INDEX `appt_tenant_idx` ON `appointments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `appt_patient_idx` ON `appointments` (`patientId`);--> statement-breakpoint
CREATE INDEX `appt_data_idx` ON `appointments` (`dataHora`);--> statement-breakpoint
CREATE INDEX `appt_status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `audititem_checklist_idx` ON `auditChecklistItems` (`checklistId`);--> statement-breakpoint
CREATE INDEX `audit_tenant_idx` ON `auditChecklists` (`tenantId`);--> statement-breakpoint
CREATE INDEX `audit_tipo_idx` ON `auditChecklists` (`tipo`);--> statement-breakpoint
CREATE INDEX `audit_status_idx` ON `auditChecklists` (`status`);--> statement-breakpoint
CREATE INDEX `audit_data_idx` ON `auditChecklists` (`dataPrevista`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `auditLogs` (`tenantId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `auditLogs` (`action`);--> statement-breakpoint
CREATE INDEX `bank_account_tenant_idx` ON `bank_accounts` (`tenantId`);--> statement-breakpoint
CREATE INDEX `bank_account_ativa_idx` ON `bank_accounts` (`ativa`);--> statement-breakpoint
CREATE INDEX `bankrec_tenant_idx` ON `bankReconciliations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `bankrec_conciliado_idx` ON `bankReconciliations` (`conciliado`);--> statement-breakpoint
CREATE INDEX `bankrec_data_idx` ON `bankReconciliations` (`dataMovimento`);--> statement-breakpoint
CREATE INDEX `budget_tenant_idx` ON `budgets` (`tenantId`);--> statement-breakpoint
CREATE INDEX `budget_numero_idx` ON `budgets` (`numero`);--> statement-breakpoint
CREATE INDEX `budget_cpf_idx` ON `budgets` (`cpf`);--> statement-breakpoint
CREATE INDEX `budget_status_idx` ON `budgets` (`status`);--> statement-breakpoint
CREATE INDEX `budget_validade_idx` ON `budgets` (`dataValidade`);--> statement-breakpoint
CREATE INDEX `nfe_tenant_idx` ON `electronicInvoices` (`tenantId`);--> statement-breakpoint
CREATE INDEX `nfe_numero_idx` ON `electronicInvoices` (`numero`);--> statement-breakpoint
CREATE INDEX `nfe_status_idx` ON `electronicInvoices` (`status`);--> statement-breakpoint
CREATE INDEX `nfe_data_idx` ON `electronicInvoices` (`dataEmissao`);--> statement-breakpoint
CREATE INDEX `ben_tenant_idx` ON `employeeBenefits` (`tenantId`);--> statement-breakpoint
CREATE INDEX `ben_employee_idx` ON `employeeBenefits` (`employeeId`);--> statement-breakpoint
CREATE INDEX `ben_tipo_idx` ON `employeeBenefits` (`tipo`);--> statement-breakpoint
CREATE INDEX `ben_status_idx` ON `employeeBenefits` (`status`);--> statement-breakpoint
CREATE INDEX `cert_tenant_idx` ON `employeeCertifications` (`tenantId`);--> statement-breakpoint
CREATE INDEX `cert_employee_idx` ON `employeeCertifications` (`employeeId`);--> statement-breakpoint
CREATE INDEX `emp_tenant_idx` ON `employees` (`tenantId`);--> statement-breakpoint
CREATE INDEX `emp_cpf_idx` ON `employees` (`cpf`);--> statement-breakpoint
CREATE INDEX `emp_cargo_idx` ON `employees` (`cargo`);--> statement-breakpoint
CREATE INDEX `fintrans_tenant_idx` ON `financialTransactions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `fintrans_tipo_idx` ON `financialTransactions` (`tipo`);--> statement-breakpoint
CREATE INDEX `fintrans_status_idx` ON `financialTransactions` (`status`);--> statement-breakpoint
CREATE INDEX `fintrans_data_idx` ON `financialTransactions` (`dataTransacao`);--> statement-breakpoint
CREATE INDEX `fintrans_conciliado_idx` ON `financialTransactions` (`conciliado`);--> statement-breakpoint
CREATE INDEX `fiscal_config_tenant_idx` ON `fiscal_configurations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `fiscal_config_est_idx` ON `fiscal_configurations` (`establishmentId`);--> statement-breakpoint
CREATE INDEX `fiscal_config_tipo_idx` ON `fiscal_configurations` (`tipoNota`);--> statement-breakpoint
CREATE INDEX `health_est_tenant_idx` ON `health_establishments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `health_est_cnes_idx` ON `health_establishments` (`cnes`);--> statement-breakpoint
CREATE INDEX `hca_tenant_idx` ON `home_care_addresses` (`tenantId`);--> statement-breakpoint
CREATE INDEX `hca_patient_idx` ON `home_care_addresses` (`patientId`);--> statement-breakpoint
CREATE INDEX `hca_regiao_idx` ON `home_care_addresses` (`regiao`);--> statement-breakpoint
CREATE INDEX `hca_ativo_idx` ON `home_care_addresses` (`ativo`);--> statement-breakpoint
CREATE INDEX `emp_tenant_idx` ON `hrEmployees` (`tenantId`);--> statement-breakpoint
CREATE INDEX `emp_cpf_idx` ON `hrEmployees` (`cpf`);--> statement-breakpoint
CREATE INDEX `emp_status_idx` ON `hrEmployees` (`status`);--> statement-breakpoint
CREATE INDEX `emp_perfil_idx` ON `hrEmployees` (`perfil`);--> statement-breakpoint
CREATE INDEX `inst_tenant_idx` ON `installments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `inst_trans_idx` ON `installments` (`transactionId`);--> statement-breakpoint
CREATE INDEX `inst_status_idx` ON `installments` (`status`);--> statement-breakpoint
CREATE INDEX `inst_venc_idx` ON `installments` (`dataVencimento`);--> statement-breakpoint
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
CREATE INDEX `maint_tenant_idx` ON `maintenanceRecords` (`tenantId`);--> statement-breakpoint
CREATE INDEX `maint_equipamento_idx` ON `maintenanceRecords` (`equipamentoId`);--> statement-breakpoint
CREATE INDEX `maint_tipo_idx` ON `maintenanceRecords` (`tipoManutencao`);--> statement-breakpoint
CREATE INDEX `maint_status_idx` ON `maintenanceRecords` (`status`);--> statement-breakpoint
CREATE INDEX `maint_data_idx` ON `maintenanceRecords` (`dataPrevista`);--> statement-breakpoint
CREATE INDEX `mile_tenant_idx` ON `mileageRecords` (`tenantId`);--> statement-breakpoint
CREATE INDEX `mile_employee_idx` ON `mileageRecords` (`employeeId`);--> statement-breakpoint
CREATE INDEX `mile_data_idx` ON `mileageRecords` (`data`);--> statement-breakpoint
CREATE INDEX `mile_status_idx` ON `mileageRecords` (`status`);--> statement-breakpoint
CREATE INDEX `occ_tenant_idx` ON `occurrences` (`tenantId`);--> statement-breakpoint
CREATE INDEX `occ_paciente_idx` ON `occurrences` (`pacienteId`);--> statement-breakpoint
CREATE INDEX `occ_tipo_idx` ON `occurrences` (`tipo`);--> statement-breakpoint
CREATE INDEX `occ_status_idx` ON `occurrences` (`status`);--> statement-breakpoint
CREATE INDEX `occ_gravidade_idx` ON `occurrences` (`gravidade`);--> statement-breakpoint
CREATE INDEX `over_tenant_idx` ON `overtimeRequests` (`tenantId`);--> statement-breakpoint
CREATE INDEX `over_employee_idx` ON `overtimeRequests` (`employeeId`);--> statement-breakpoint
CREATE INDEX `over_data_idx` ON `overtimeRequests` (`data`);--> statement-breakpoint
CREATE INDEX `over_status_idx` ON `overtimeRequests` (`status`);--> statement-breakpoint
CREATE INDEX `patient_doc_tenant_idx` ON `patientDocuments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `patient_doc_patient_idx` ON `patientDocuments` (`patientId`);--> statement-breakpoint
CREATE INDEX `guardian_tenant_idx` ON `patientGuardians` (`tenantId`);--> statement-breakpoint
CREATE INDEX `guardian_minor_idx` ON `patientGuardians` (`minorPatientId`);--> statement-breakpoint
CREATE INDEX `guardian_guardian_idx` ON `patientGuardians` (`guardianPatientId`);--> statement-breakpoint
CREATE INDEX `patient_session_tenant_idx` ON `patientSessions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `patient_session_patient_idx` ON `patientSessions` (`patientId`);--> statement-breakpoint
CREATE INDEX `patient_session_token_idx` ON `patientSessions` (`token`);--> statement-breakpoint
CREATE INDEX `pvh_tenant_idx` ON `patientVaccinationHistory` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pvh_paciente_idx` ON `patientVaccinationHistory` (`pacienteId`);--> statement-breakpoint
CREATE INDEX `pvh_data_idx` ON `patientVaccinationHistory` (`dataAplicacao`);--> statement-breakpoint
CREATE INDEX `patient_tenant_idx` ON `patients` (`tenantId`);--> statement-breakpoint
CREATE INDEX `patient_cpf_idx` ON `patients` (`cpf`);--> statement-breakpoint
CREATE INDEX `patient_nome_idx` ON `patients` (`nome`);--> statement-breakpoint
CREATE INDEX `pay_tenant_idx` ON `payments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pay_application_idx` ON `payments` (`applicationId`);--> statement-breakpoint
CREATE INDEX `pay_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `pay_tenant_idx` ON `payrolls` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pay_employee_idx` ON `payrolls` (`employeeId`);--> statement-breakpoint
CREATE INDEX `pay_referencia_idx` ON `payrolls` (`anoReferencia`,`mesReferencia`);--> statement-breakpoint
CREATE INDEX `pay_status_idx` ON `payrolls` (`status`);--> statement-breakpoint
CREATE INDEX `pops_tenant_idx` ON `pops` (`tenantId`);--> statement-breakpoint
CREATE INDEX `pops_codigo_idx` ON `pops` (`codigo`);--> statement-breakpoint
CREATE INDEX `pops_status_idx` ON `pops` (`status`);--> statement-breakpoint
CREATE INDEX `campaign_tenant_idx` ON `price_campaigns` (`tenantId`);--> statement-breakpoint
CREATE INDEX `campaign_ativo_idx` ON `price_campaigns` (`ativo`);--> statement-breakpoint
CREATE INDEX `campaign_inicio_idx` ON `price_campaigns` (`dataInicio`);--> statement-breakpoint
CREATE INDEX `ptable_tenant_idx` ON `price_tables` (`tenantId`);--> statement-breakpoint
CREATE INDEX `ptable_ativo_idx` ON `price_tables` (`ativo`);--> statement-breakpoint
CREATE INDEX `perm_tenant_perfil_idx` ON `profilePermissions` (`tenantId`,`perfil`);--> statement-breakpoint
CREATE INDEX `quotitem_quot_idx` ON `quotationItems` (`quotationId`);--> statement-breakpoint
CREATE INDEX `quot_tenant_idx` ON `quotations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `quot_status_idx` ON `quotations` (`status`);--> statement-breakpoint
CREATE INDEX `quot_numero_idx` ON `quotations` (`numero`);--> statement-breakpoint
CREATE INDEX `maint_tenant_idx` ON `refrigeratorMaintenances` (`tenantId`);--> statement-breakpoint
CREATE INDEX `maint_refrig_idx` ON `refrigeratorMaintenances` (`refrigeratorId`);--> statement-breakpoint
CREATE INDEX `maint_data_idx` ON `refrigeratorMaintenances` (`dataManutencao`);--> statement-breakpoint
CREATE INDEX `refrig_tenant_idx` ON `refrigerators` (`tenantId`);--> statement-breakpoint
CREATE INDEX `refrig_unit_idx` ON `refrigerators` (`unitId`);--> statement-breakpoint
CREATE INDEX `regdoc_tenant_idx` ON `regulatoryDocuments` (`tenantId`);--> statement-breakpoint
CREATE INDEX `regdoc_tipo_idx` ON `regulatoryDocuments` (`tipo`);--> statement-breakpoint
CREATE INDEX `regdoc_status_idx` ON `regulatoryDocuments` (`status`);--> statement-breakpoint
CREATE INDEX `regdoc_validade_idx` ON `regulatoryDocuments` (`dataValidade`);--> statement-breakpoint
CREATE INDEX `rnds_cred_tenant_idx` ON `rnds_credentials` (`tenantId`);--> statement-breakpoint
CREATE INDEX `rnds_cred_est_idx` ON `rnds_credentials` (`establishmentId`);--> statement-breakpoint
CREATE INDEX `rnds_cred_ambiente_idx` ON `rnds_credentials` (`ambiente`);--> statement-breakpoint
CREATE INDEX `stock_mov_tenant_idx` ON `stockMovements` (`tenantId`);--> statement-breakpoint
CREATE INDEX `stock_mov_vaccine_idx` ON `stockMovements` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `stock_mov_tipo_idx` ON `stockMovements` (`tipo`);--> statement-breakpoint
CREATE INDEX `temp_tenant_idx` ON `temperatureLogs` (`tenantId`);--> statement-breakpoint
CREATE INDEX `temp_refrig_idx` ON `temperatureLogs` (`refrigeratorId`);--> statement-breakpoint
CREATE INDEX `temp_data_idx` ON `temperatureLogs` (`dataHora`);--> statement-breakpoint
CREATE INDEX `tempmon_tenant_idx` ON `temperatureMonitoring` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tempmon_equipamento_idx` ON `temperatureMonitoring` (`equipamentoId`);--> statement-breakpoint
CREATE INDEX `tempmon_tipo_idx` ON `temperatureMonitoring` (`tipoEquipamento`);--> statement-breakpoint
CREATE INDEX `tempmon_data_idx` ON `temperatureMonitoring` (`dataHoraRegistro`);--> statement-breakpoint
CREATE INDEX `tempmon_conformidade_idx` ON `temperatureMonitoring` (`dentroDoLimite`);--> statement-breakpoint
CREATE INDEX `cnpj_idx` ON `tenants` (`cnpj`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tenants` (`status`);--> statement-breakpoint
CREATE INDEX `time_tenant_idx` ON `timeClocks` (`tenantId`);--> statement-breakpoint
CREATE INDEX `time_employee_idx` ON `timeClocks` (`employeeId`);--> statement-breakpoint
CREATE INDEX `time_data_idx` ON `timeClocks` (`data`);--> statement-breakpoint
CREATE INDEX `time_status_idx` ON `timeClocks` (`status`);--> statement-breakpoint
CREATE INDEX `trainpart_training_idx` ON `trainingParticipants` (`trainingId`);--> statement-breakpoint
CREATE INDEX `trainpart_employee_idx` ON `trainingParticipants` (`employeeId`);--> statement-breakpoint
CREATE INDEX `train_tenant_idx` ON `trainingRecords` (`tenantId`);--> statement-breakpoint
CREATE INDEX `train_tipo_idx` ON `trainingRecords` (`tipo`);--> statement-breakpoint
CREATE INDEX `train_status_idx` ON `trainingRecords` (`status`);--> statement-breakpoint
CREATE INDEX `train_data_idx` ON `trainingRecords` (`dataRealizacao`);--> statement-breakpoint
CREATE INDEX `trans_tenant_idx` ON `transactions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `trans_tipo_idx` ON `transactions` (`tipo`);--> statement-breakpoint
CREATE INDEX `trans_status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `trans_patient_idx` ON `transactions` (`patientId`);--> statement-breakpoint
CREATE INDEX `unit_tenant_idx` ON `units` (`tenantId`);--> statement-breakpoint
CREATE INDEX `app_tenant_idx` ON `vaccineApplications` (`tenantId`);--> statement-breakpoint
CREATE INDEX `app_patient_idx` ON `vaccineApplications` (`patientId`);--> statement-breakpoint
CREATE INDEX `app_vaccine_idx` ON `vaccineApplications` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `app_data_idx` ON `vaccineApplications` (`dataAplicacao`);--> statement-breakpoint
CREATE INDEX `vprice_tenant_idx` ON `vaccine_prices` (`tenantId`);--> statement-breakpoint
CREATE INDEX `vprice_pricetable_idx` ON `vaccine_prices` (`priceTableId`);--> statement-breakpoint
CREATE INDEX `vprice_vaccine_idx` ON `vaccine_prices` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `vprice_ativo_idx` ON `vaccine_prices` (`ativo`);--> statement-breakpoint
CREATE INDEX `vres_tenant_idx` ON `vaccine_reservations` (`tenantId`);--> statement-breakpoint
CREATE INDEX `vres_appt_idx` ON `vaccine_reservations` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `vres_vaccine_idx` ON `vaccine_reservations` (`vaccineId`);--> statement-breakpoint
CREATE INDEX `vres_status_idx` ON `vaccine_reservations` (`status`);--> statement-breakpoint
CREATE INDEX `vres_expiracao_idx` ON `vaccine_reservations` (`dataExpiracao`);--> statement-breakpoint
CREATE INDEX `vaccine_tenant_idx` ON `vaccines` (`tenantId`);--> statement-breakpoint
CREATE INDEX `vaccine_lote_idx` ON `vaccines` (`lote`);--> statement-breakpoint
CREATE INDEX `vaccine_validade_idx` ON `vaccines` (`validade`);--> statement-breakpoint
CREATE INDEX `cat_tenant_idx` ON `workAccidents` (`tenantId`);--> statement-breakpoint
CREATE INDEX `cat_employee_idx` ON `workAccidents` (`employeeId`);--> statement-breakpoint
CREATE INDEX `cat_data_idx` ON `workAccidents` (`dataAcidente`);--> statement-breakpoint
CREATE INDEX `cat_status_idx` ON `workAccidents` (`status`);