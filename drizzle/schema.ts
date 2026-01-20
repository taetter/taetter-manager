import { int, serial, pgEnum, pgTable, text, timestamp, varchar, boolean, index, decimal, date, json } from "drizzle-orm/pg-core";




// Enum declarations (PostgreSQL requires these before table definitions)
export const ambienteEnum = pgEnum("ambiente", ["homologacao", "producao"]);
export const environmentEnum = pgEnum("environment", ["homologation", "production"]);
export const estadoCivilEnum = pgEnum("estadoCivil", ["solteiro", "casado", "divorciado", "viuvo", "outro"]);
export const gravidadeEnum = pgEnum("gravidade", ["baixa", "media", "alta", "critica"]);
export const gravidadeEnum1 = pgEnum("gravidade", ["leve", "moderada", "grave"]);
export const metodoPagamentoEnum = pgEnum("metodoPagamento", ["dinheiro", "pix", "debito", "credito", "boleto"]);
export const perfilEnum = pgEnum("perfil", ["gestor", "aplicador", "global", "suporte", "administrativo", "financeiro"]);
export const planEnum = pgEnum("plan", ["basic", "intermediate", "full"]);
export const regiaoEnum = pgEnum("regiao", ["grande_campinas", "regiao_entorno", "outra"]);
export const regimeTributarioEnum = pgEnum("regimeTributario", ["simples_nacional", "lucro_presumido", "lucro_real"]);
export const relacaoEnum = pgEnum("relacao", ["mae", "pai", "tutor", "outro"]);
export const roleEnum = pgEnum("role", ["user", "admin", "super_admin"]);
export const sexoEnum = pgEnum("sexo", ["masculino", "feminino", "outro"]);
export const sexoEnum1 = pgEnum("sexo", ["M", "F", "Outro"]);
export const statusEnum = pgEnum("status", ["reservada", "aplicada", "cancelada", "expirada"]);
export const statusEnum1 = pgEnum("status", ["ativo", "inativo", "suspenso"]);
export const statusEnum10 = pgEnum("status", ["pendente", "em_andamento", "concluida", "aprovada", "reprovada"]);
export const statusEnum11 = pgEnum("status", ["aberta", "em_analise", "em_tratamento", "resolvida", "fechada"]);
export const statusEnum12 = pgEnum("status", ["agendada", "em_andamento", "concluida", "cancelada"]);
export const statusEnum13 = pgEnum("status", ["planejado", "realizado", "cancelado"]);
export const statusEnum14 = pgEnum("status", ["ativo", "ferias", "afastado", "demitido"]);
export const statusEnum15 = pgEnum("status", ["rascunho", "calculado", "aprovado", "pago"]);
export const statusEnum16 = pgEnum("status", ["normal", "falta", "atestado", "ferias", "folga"]);
export const statusEnum17 = pgEnum("status", ["pendente", "aprovado", "reprovado", "pago"]);
export const statusEnum18 = pgEnum("status", ["pendente", "aprovada", "reprovada"]);
export const statusEnum19 = pgEnum("status", ["registrado", "em_analise", "encerrado"]);
export const statusEnum2 = pgEnum("status", ["pendente", "pago", "cancelado"]);
export const statusEnum20 = pgEnum("status", ["pendente", "enviando", "enviado", "aceito", "rejeitado", "erro"]);
export const statusEnum21 = pgEnum("status", ["pendente", "confirmado", "realizado", "cancelado"]);
export const statusEnum22 = pgEnum("status", ["pendente", "aprovado", "recusado", "convertido", "expirado", "cancelado"]);
export const statusEnum23 = pgEnum("status", ["planejada", "em_andamento", "concluida", "cancelada"]);
export const statusEnum3 = pgEnum("status", ["pendente", "aplicada", "cancelada"]);
export const statusEnum4 = pgEnum("status", ["pendente", "aprovado", "recusado", "cancelado"]);
export const statusEnum5 = pgEnum("status", ["pendente", "pago", "cancelado", "estornado"]);
export const statusEnum6 = pgEnum("status", ["pendente", "pago", "atrasado", "cancelado"]);
export const statusEnum7 = pgEnum("status", ["rascunho", "emitida", "autorizada", "cancelada", "denegada"]);
export const statusEnum8 = pgEnum("status", ["ativo", "revisao", "obsoleto"]);
export const statusEnum9 = pgEnum("status", ["valido", "vencido", "em_renovacao", "suspenso"]);
export const tipoContaEnum = pgEnum("tipoConta", ["corrente", "poupanca", "pagamento"]);
export const tipoContratoEnum = pgEnum("tipoContrato", ["clt", "pj", "estagio", "temporario", "autonomo"]);
export const tipoDescontoEnum = pgEnum("tipoDesconto", ["percentual", "valor_fixo"]);
export const tipoEnum = pgEnum("tipo", ["unidade", "domiciliar"]);
export const tipoEnum1 = pgEnum("tipo", ["entrada", "saida", "ajuste", "perda"]);
export const tipoEnum10 = pgEnum("tipo", ["normal", "noturna", "feriado", "domingo"]);
export const tipoEnum11 = pgEnum("tipo", ["ferias", "atestado", "licenca_maternidade", "licenca_paternidade", "falta_justificada", "falta_injustificada", "outro"]);
export const tipoEnum2 = pgEnum("tipo", ["receita", "despesa"]);
export const tipoEnum3 = pgEnum("tipo", ["pix", "credito", "debito", "dinheiro"]);
export const tipoEnum4 = pgEnum("tipo", ["credito", "debito"]);
export const tipoEnum5 = pgEnum("tipo", ["alvara", "licenca", "certificado", "laudo", "protocolo", "outro"]);
export const tipoEnum6 = pgEnum("tipo", ["vigilancia_sanitaria", "acreditacao", "interna", "fornecedor", "outro"]);
export const tipoEnum7 = pgEnum("tipo", ["reacao_pos_vacinal", "efeito_adverso", "reclamacao", "sugestao", "elogio", "outro"]);
export const tipoEnum8 = pgEnum("tipo", ["admissao", "reciclagem", "capacitacao", "workshop", "palestra", "curso", "outro"]);
export const tipoEnum9 = pgEnum("tipo", ["vale_transporte", "vale_refeicao", "vale_alimentacao", "plano_saude", "plano_odontologico", "seguro_vida", "outro"]);
export const tipoEquipamentoEnum = pgEnum("tipoEquipamento", ["geladeira", "freezer", "ar_condicionado", "gerador", "computador", "impressora", "outro"]);
export const tipoEquipamentoEnum1 = pgEnum("tipoEquipamento", ["geladeira", "caixa_transporte", "freezer", "camara_fria"]);
export const tipoEtiquetaEnum = pgEnum("tipoEtiqueta", ["fisica_virtual", "somente_virtual"]);
export const tipoIntegracaoEnum = pgEnum("tipoIntegracao", ["rnds_ria", "nfse", "nfe", "nfce"]);
export const tipoManutencaoEnum = pgEnum("tipoManutencao", ["preventiva", "corretiva", "preditiva"]);
export const tipoNotaEnum = pgEnum("tipoNota", ["nfse", "nfe", "nfce"]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tenants table - Represents each clinic in the multi-tenant system
 */
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  razaoSocial: varchar("razaoSocial", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),
  
  // Endereço
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  
  // Responsável técnico
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  responsavelCpf: varchar("responsavelCpf", { length: 14 }),
  responsavelEmail: varchar("responsavelEmail", { length: 320 }),
  responsavelTelefone: varchar("responsavelTelefone", { length: 20 }),
  
  // Status e controle
  status: statusEnum1.default("ativo").notNull(),
  plan: planEnum.default("basic").notNull(),
  enabledModules: json("enabledModules").$type<string[]>(), // Array de IDs dos módulos habilitados
  dataExpiracao: timestamp("dataExpiracao"),
  
  // Configurações
  configuracoes: text("configuracoes"), // JSON com configurações específicas do tenant
  patientPortalUrl: varchar("patientPortalUrl", { length: 500 }), // URL customizada para área do paciente
  
  // Multi-tenant enterprise (CRITICAL)
  databaseName: varchar("databaseName", { length: 100 }).unique(), // Nome do banco isolado (ex: vis_imunevida)
  databaseHost: varchar("databaseHost", { length: 255 }), // Host do banco isolado
  databasePort: int("databasePort").default(3306), // Porta do banco isolado
  subdomain: varchar("subdomain", { length: 100 }).unique(), // Subdomínio dedicado (ex: imunevida)
  environment: environmentEnum.default("homologation").notNull(),
  homologationStartedAt: timestamp("homologationStartedAt"), // Início da homologação
  productionActivatedAt: timestamp("productionActivatedAt"), // Ativação em produção
  version: int("version").default(1).notNull(), // Versionamento do tenant
  
  // Dados imutáveis (CNPJ, CNES)
  cnes: varchar("cnes", { length: 15 }), // Código Nacional de Estabelecimento de Saúde
  inscricaoEstadual: varchar("inscricaoEstadual", { length: 20 }),
  inscricaoMunicipal: varchar("inscricaoMunicipal", { length: 20 }),
  
  // Customização visual
  logoUrl: varchar("logoUrl", { length: 500 }),
  faviconUrl: varchar("faviconUrl", { length: 500 }),
  primaryColor: varchar("primaryColor", { length: 7 }), // Hex color
  secondaryColor: varchar("secondaryColor", { length: 7 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"), // Soft delete
}, (table) => ({
  cnpjIdx: index("cnpj_idx").on(table.cnpj),
  statusIdx: index("status_idx").on(table.status),
}));

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Audit logs table - Track all tenant management actions
 */
export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId"),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // create, update, delete, activate, deactivate
  entity: varchar("entity", { length: 100 }).notNull(), // tenant, user, patient, etc
  entityId: int("entityId"),
  changes: text("changes"), // JSON com detalhes das mudanças
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  userIdx: index("user_idx").on(table.userId),
  actionIdx: index("action_idx").on(table.action),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * =============================================================================
 * TENANT TEMPLATE MODULES
 * Todas as tabelas abaixo incluem tenantId para isolamento multi-tenant
 * =============================================================================
 */

// ============= MÓDULO DE PACIENTES =============

/**
 * Patients table - Main patient registry
 */
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Dados pessoais
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(),
  rg: varchar("rg", { length: 20 }),
  dataNascimento: timestamp("dataNascimento").notNull(),
  sexo: sexoEnum1,
  nomeMae: varchar("nomeMae", { length: 255 }),
  nomePai: varchar("nomePai", { length: 255 }),
  
  // Contato
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  celular: varchar("celular", { length: 20 }),
  telefoneResponsavel: varchar("telefoneResponsavel", { length: 20 }), // Telefone do responsável (para menores)
  
  // Endereço
  endereco: text("endereco"),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  
  // Cartão SUS
  cartaoSus: varchar("cartaoSus", { length: 15 }),
  
  // Foto
  fotoUrl: varchar("fotoUrl", { length: 500 }),
  fotoKey: varchar("fotoKey", { length: 255 }),
  
  // Autenticação (para área do paciente)
  senhaHash: varchar("senhaHash", { length: 255 }), // Hash da senha para login
  primeiroAcesso: boolean("primeiroAcesso").default(true), // Se é o primeiro acesso
  
  // Observações
  observacoes: text("observacoes"),
  
  // Status
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  tenantIdx: index("patient_tenant_idx").on(table.tenantId),
  cpfIdx: index("patient_cpf_idx").on(table.cpf),
  nomeIdx: index("patient_nome_idx").on(table.nome),
}));

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Patient documents table - Store patient document references
 */
export const patientDocuments = pgTable("patientDocuments", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  patientId: int("patientId").notNull(),
  
  tipo: varchar("tipo", { length: 50 }).notNull(), // RG, CPF, Comprovante, etc
  descricao: varchar("descricao", { length: 255 }),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("patient_doc_tenant_idx").on(table.tenantId),
  patientIdx: index("patient_doc_patient_idx").on(table.patientId),
}));

export type PatientDocument = typeof patientDocuments.$inferSelect;
export type InsertPatientDocument = typeof patientDocuments.$inferInsert;

/**
 * Patient sessions table - Track patient portal authentication
 */
export const patientSessions = pgTable("patientSessions", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  patientId: int("patientId").notNull(),
  
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("patient_session_tenant_idx").on(table.tenantId),
  patientIdx: index("patient_session_patient_idx").on(table.patientId),
  tokenIdx: index("patient_session_token_idx").on(table.token),
}));

export type PatientSession = typeof patientSessions.$inferSelect;
export type InsertPatientSession = typeof patientSessions.$inferInsert;

/**
 * Patient guardians table - Relationship between minors and their legal guardians
 * Both minor and guardian must be registered as patients
 */
export const patientGuardians = pgTable("patientGuardians", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  minorPatientId: int("minorPatientId").notNull(), // ID do paciente menor de idade
  guardianPatientId: int("guardianPatientId").notNull(), // ID do paciente responsável
  
  relacao: relacaoEnum.notNull(), // Tipo de relacionamento
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("guardian_tenant_idx").on(table.tenantId),
  minorIdx: index("guardian_minor_idx").on(table.minorPatientId),
  guardianIdx: index("guardian_guardian_idx").on(table.guardianPatientId),
}));

export type PatientGuardian = typeof patientGuardians.$inferSelect;
export type InsertPatientGuardian = typeof patientGuardians.$inferInsert;

// ============= MÓDULO DE ESTOQUE =============

/**
 * Vaccines table - Vaccine catalog
 */
export const vaccines = pgTable("vaccines", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  refrigeratorId: int("refrigeratorId"), // Opcional: qual geladeira armazena
  
  nome: varchar("nome", { length: 255 }).notNull(),
  nomeFantasia: varchar("nomeFantasia", { length: 255 }),
  fabricante: varchar("fabricante", { length: 255 }),
  marca: varchar("marca", { length: 255 }),
  lote: varchar("lote", { length: 100 }).notNull(),
  codigoBarras: varchar("codigoBarras", { length: 100 }), // Para leitura por scanner
  validade: timestamp("validade").notNull(),
  
  // Classificação
  categoria: varchar("categoria", { length: 100 }), // Rotina, Viagem, Ocupacional
  doencas: text("doencas"), // JSON array de doenças prevenidas
  
  // Estoque
  quantidadeTotal: int("quantidadeTotal").default(0).notNull(),
  quantidadeDisponivel: int("quantidadeDisponivel").default(0).notNull(),
  quantidadeReservada: int("quantidadeReservada").default(0),
  estoqueMinimo: int("estoqueMinimo").default(10),
  
  // Preço
  precoCompra: int("precoCompra"), // em centavos
  precoVenda: int("precoVenda"), // em centavos
  
  // Armazenamento
  temperaturaMin: int("temperaturaMin"), // em décimos de grau (ex: 20 = 2.0°C)
  temperaturaMax: int("temperaturaMax"),
  localizacao: varchar("localizacao", { length: 100 }), // Geladeira A, Freezer B, etc
  
  // Observações
  observacoes: text("observacoes"),
  bula: text("bula"),
  
  // Status
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("vaccine_tenant_idx").on(table.tenantId),
  loteIdx: index("vaccine_lote_idx").on(table.lote),
  validadeIdx: index("vaccine_validade_idx").on(table.validade),
}));

export type Vaccine = typeof vaccines.$inferSelect;
export type InsertVaccine = typeof vaccines.$inferInsert;

/**
 * Stock movements table - Track vaccine stock changes
 */
export const stockMovements = pgTable("stockMovements", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  vaccineId: int("vaccineId").notNull(),
  
  tipo: tipoEnum1.notNull(),
  quantidade: int("quantidade").notNull(),
  quantidadeAnterior: int("quantidadeAnterior").notNull(),
  quantidadeNova: int("quantidadeNova").notNull(),
  
  motivo: varchar("motivo", { length: 255 }),
  observacoes: text("observacoes"),
  
  userId: int("userId").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("stock_mov_tenant_idx").on(table.tenantId),
  vaccineIdx: index("stock_mov_vaccine_idx").on(table.vaccineId),
  tipoIdx: index("stock_mov_tipo_idx").on(table.tipo),
}));

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

// ============= MÓDULO DE APLICAÇÃO =============

/**
 * Applications table - Vaccine applications registry
 */
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  patientId: int("patientId").notNull(),
  vaccineId: int("vaccineId").notNull(),
  
  // Data e hora da aplicação
  dataAplicacao: timestamp("dataAplicacao").notNull(),
  
  // Profissional responsável
  profissionalId: int("profissionalId").notNull(),
  profissionalNome: varchar("profissionalNome", { length: 255 }).notNull(),
  profissionalRegistro: varchar("profissionalRegistro", { length: 50 }),
  
  // Detalhes da aplicação
  dose: varchar("dose", { length: 50 }), // 1ª dose, 2ª dose, reforço, etc
  via: varchar("via", { length: 50 }), // Intramuscular, subcutânea, oral, etc
  local: varchar("local", { length: 100 }), // Braço direito, coxa esquerda, etc
  
  // Próxima dose
  proximaDose: timestamp("proximaDose"),
  
  // Integração RNDS
  rndsEnviado: boolean("rndsEnviado").default(false),
  rndsProtocolo: varchar("rndsProtocolo", { length: 100 }),
  rndsDataEnvio: timestamp("rndsDataEnvio"),
  rndsErro: text("rndsErro"),
  
  // Etiquetas
  tipoEtiqueta: tipoEtiquetaEnum,
  etiquetaFisicaGerada: boolean("etiquetaFisicaGerada").default(false),
  etiquetaVirtualGerada: boolean("etiquetaVirtualGerada").default(false),
  etiquetaZPL: text("etiquetaZPL"), // Código ZPL para impressão Zebra
  etiquetaVirtualUrl: varchar("etiquetaVirtualUrl", { length: 500 }),
  
  // Pagador (responsável financeiro)
  pagadorMesmoPaciente: boolean("pagadorMesmoPaciente").default(true),
  pagadorId: int("pagadorId"), // ID do paciente responsável (se diferente)
  pagadorNome: varchar("pagadorNome", { length: 255 }),
  pagadorCPF: varchar("pagadorCPF", { length: 14 }),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("app_tenant_idx").on(table.tenantId),
  patientIdx: index("app_patient_idx").on(table.patientId),
  vaccineIdx: index("app_vaccine_idx").on(table.vaccineId),
  dataIdx: index("app_data_idx").on(table.dataAplicacao),
}));

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Adverse events table - Track vaccine adverse reactions
 */
export const adverseEvents = pgTable("adverseEvents", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  applicationId: int("applicationId").notNull(),
  patientId: int("patientId").notNull(),
  
  tipo: varchar("tipo", { length: 100 }).notNull(), // Febre, dor local, alergia, etc
  gravidade: gravidadeEnum1.notNull(),
  descricao: text("descricao").notNull(),
  
  dataOcorrencia: timestamp("dataOcorrencia").notNull(),
  dataResolucao: timestamp("dataResolucao"),
  
  conduta: text("conduta"), // Ações tomadas
  
  // Notificação
  notificado: boolean("notificado").default(false),
  protocoloNotificacao: varchar("protocoloNotificacao", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("adverse_tenant_idx").on(table.tenantId),
  applicationIdx: index("adverse_app_idx").on(table.applicationId),
  patientIdx: index("adverse_patient_idx").on(table.patientId),
}));

export type AdverseEvent = typeof adverseEvents.$inferSelect;
export type InsertAdverseEvent = typeof adverseEvents.$inferInsert;

// ============= MÓDULO FINANCEIRO =============

/**
 * Transactions table - Financial transactions
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  tipo: tipoEnum2.notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  
  valor: int("valor").notNull(), // em centavos
  
  // Relacionamentos
  patientId: int("patientId"),
  applicationId: int("applicationId"),
  
  // Pagamento
  formaPagamento: varchar("formaPagamento", { length: 50 }), // Dinheiro, cartão, PIX, etc
  status: statusEnum2.default("pendente").notNull(),
  dataPagamento: timestamp("dataPagamento"),
  
  // Nota Fiscal
  nfeNumero: varchar("nfeNumero", { length: 50 }),
  nfeChave: varchar("nfeChave", { length: 44 }),
  nfeDataEmissao: timestamp("nfeDataEmissao"),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("trans_tenant_idx").on(table.tenantId),
  tipoIdx: index("trans_tipo_idx").on(table.tipo),
  statusIdx: index("trans_status_idx").on(table.status),
  patientIdx: index("trans_patient_idx").on(table.patientId),
}));

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ============= MÓDULO DE RH =============

/**
 * Employees table - Staff registry
 */
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId"), // Link para users se tiver acesso ao sistema
  
  // Dados pessoais
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(),
  rg: varchar("rg", { length: 20 }),
  dataNascimento: timestamp("dataNascimento"),
  
  // Contato
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  
  // Profissional
  cargo: varchar("cargo", { length: 100 }).notNull(),
  registroProfissional: varchar("registroProfissional", { length: 50 }), // COREN, CRM, etc
  especialidade: varchar("especialidade", { length: 100 }),
  
  // Contrato
  dataAdmissao: timestamp("dataAdmissao"),
  dataDemissao: timestamp("dataDemissao"),
  tipoContrato: varchar("tipoContrato", { length: 50 }), // CLT, PJ, Estágio, etc
  
  // Status
  ativo: boolean("ativo").default(true).notNull(),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("emp_tenant_idx").on(table.tenantId),
  cpfIdx: index("emp_cpf_idx").on(table.cpf),
  cargoIdx: index("emp_cargo_idx").on(table.cargo),
}));

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * Employee certifications table - Professional certifications
 */
export const employeeCertifications = pgTable("employeeCertifications", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  tipo: varchar("tipo", { length: 100 }).notNull(),
  instituicao: varchar("instituicao", { length: 255 }),
  dataEmissao: timestamp("dataEmissao"),
  dataValidade: timestamp("dataValidade"),
  
  documentoUrl: text("documentoUrl"),
  documentoKey: varchar("documentoKey", { length: 255 }),
  
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("cert_tenant_idx").on(table.tenantId),
  employeeIdx: index("cert_employee_idx").on(table.employeeId),
}));

export type EmployeeCertification = typeof employeeCertifications.$inferSelect;
export type InsertEmployeeCertification = typeof employeeCertifications.$inferInsert;

/**
 * Units table - Physical locations where vaccines are applied
 */
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  telefone: varchar("telefone", { length: 20 }),
  
  responsavel: varchar("responsavel", { length: 255 }),
  responsavelTecnico: varchar("responsavelTecnico", { length: 255 }),
  crmResponsavel: varchar("crmResponsavel", { length: 20 }),
  imagemUrl: text("imagemUrl"),
  cnpj: varchar("cnpj", { length: 18 }),
  email: varchar("email", { length: 255 }),
  
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("unit_tenant_idx").on(table.tenantId),
}));

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

/**
 * Refrigerators table - Vaccine storage units
 */
export const refrigerators = pgTable("refrigerators", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  unitId: int("unitId").notNull(),
  
  nome: varchar("nome", { length: 255 }).notNull(),
  modelo: varchar("modelo", { length: 100 }),
  marca: varchar("marca", { length: 100 }),
  numeroSerie: varchar("numeroSerie", { length: 100 }),
  
  temperaturaMin: decimal("temperaturaMin", { precision: 4, scale: 1 }),
  temperaturaMax: decimal("temperaturaMax", { precision: 4, scale: 1 }),
  temperaturaAtual: decimal("temperaturaAtual", { precision: 4, scale: 1 }),
  
  capacidadeLitros: int("capacidadeLitros"),
  
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("refrig_tenant_idx").on(table.tenantId),
  unitIdx: index("refrig_unit_idx").on(table.unitId),
}));

export type Refrigerator = typeof refrigerators.$inferSelect;
export type InsertRefrigerator = typeof refrigerators.$inferInsert;



/**
 * Vaccine applications table - Records of vaccine applications
 */
export const vaccineApplications = pgTable("vaccineApplications", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  patientId: int("patientId").notNull(),
  vaccineId: int("vaccineId").notNull(),
  unitId: int("unitId").notNull(),
  refrigeratorId: int("refrigeratorId").notNull(),
  employeeId: int("employeeId"), // Profissional que aplicou
  
  dataAplicacao: timestamp("dataAplicacao").notNull(),
  lote: varchar("lote", { length: 100 }).notNull(),
  dose: varchar("dose", { length: 50 }), // 1ª dose, 2ª dose, reforço, etc
  
  localAplicacao: varchar("localAplicacao", { length: 100 }), // Braço direito, coxa, etc
  viaAdministracao: varchar("viaAdministracao", { length: 50 }), // Intramuscular, subcutânea, etc
  
  etiquetaZebraUrl: text("etiquetaZebraUrl"), // URL da etiqueta física
  etiquetaVirtual: boolean("etiquetaVirtual").default(false), // Se foi adicionada à ADP
  
  observacoes: text("observacoes"),
  
  status: statusEnum3.default("pendente").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("app_tenant_idx").on(table.tenantId),
  patientIdx: index("app_patient_idx").on(table.patientId),
  vaccineIdx: index("app_vaccine_idx").on(table.vaccineId),
  dataIdx: index("app_data_idx").on(table.dataAplicacao),
}));

export type VaccineApplication = typeof vaccineApplications.$inferSelect;
export type InsertVaccineApplication = typeof vaccineApplications.$inferInsert;

/**
 * Payments table - Payment records for vaccine applications
 */
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  applicationId: int("applicationId").notNull(),
  
  tipo: tipoEnum3.notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  
  // PIX
  pixQrCode: text("pixQrCode"),
  pixChave: varchar("pixChave", { length: 255 }),
  pixTxId: varchar("pixTxId", { length: 255 }),
  
  // Cartão
  cartaoBandeira: varchar("cartaoBandeira", { length: 50 }),
  cartaoUltimosDigitos: varchar("cartaoUltimosDigitos", { length: 4 }),
  cartaoNsu: varchar("cartaoNsu", { length: 50 }),
  
  comprovanteUrl: text("comprovanteUrl"),
  comprovanteKey: varchar("comprovanteKey", { length: 255 }),
  
  status: statusEnum4.default("pendente").notNull(),
  
  dataHora: timestamp("dataHora").defaultNow().notNull(),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("pay_tenant_idx").on(table.tenantId),
  applicationIdx: index("pay_application_idx").on(table.applicationId),
  statusIdx: index("pay_status_idx").on(table.status),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;


/**
 * Refrigerator maintenances table - Maintenance records
 */
export const refrigeratorMaintenances = pgTable("refrigeratorMaintenances", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  refrigeratorId: int("refrigeratorId").notNull(),
  
  tipo: varchar("tipo", { length: 50 }).notNull(), // preventiva, corretiva, calibracao
  descricao: text("descricao"),
  dataManutencao: date("dataManutencao").notNull(),
  proximaManutencao: date("proximaManutencao"),
  
  tecnicoResponsavel: varchar("tecnicoResponsavel", { length: 255 }),
  empresaManutencao: varchar("empresaManutencao", { length: 255 }),
  custoManutencao: decimal("custoManutencao", { precision: 10, scale: 2 }),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("maint_tenant_idx").on(table.tenantId),
  refrigIdx: index("maint_refrig_idx").on(table.refrigeratorId),
  dataIdx: index("maint_data_idx").on(table.dataManutencao),
}));

export type RefrigeratorMaintenance = typeof refrigeratorMaintenances.$inferSelect;
export type InsertRefrigeratorMaintenance = typeof refrigeratorMaintenances.$inferInsert;

/**
 * Temperature logs table - Temperature monitoring
 */
export const temperatureLogs = pgTable("temperatureLogs", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  refrigeratorId: int("refrigeratorId").notNull(),
  
  temperatura: decimal("temperatura", { precision: 4, scale: 1 }).notNull(),
  dataHora: timestamp("dataHora").defaultNow().notNull(),
  
  foraDoLimite: boolean("foraDoLimite").default(false).notNull(),
  alertaEnviado: boolean("alertaEnviado").default(false).notNull(),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("temp_tenant_idx").on(table.tenantId),
  refrigIdx: index("temp_refrig_idx").on(table.refrigeratorId),
  dataIdx: index("temp_data_idx").on(table.dataHora),
}));

export type TemperatureLog = typeof temperatureLogs.$inferSelect;
export type InsertTemperatureLog = typeof temperatureLogs.$inferInsert;

/**
 * Quotations table - Price quotations from suppliers
 */
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  numero: varchar("numero", { length: 50 }).notNull(),
  fornecedor: varchar("fornecedor", { length: 255 }).notNull(),
  contatoFornecedor: varchar("contatoFornecedor", { length: 255 }),
  emailFornecedor: varchar("emailFornecedor", { length: 255 }),
  telefoneFornecedor: varchar("telefoneFornecedor", { length: 20 }),
  
  dataSolicitacao: date("dataSolicitacao").notNull(),
  dataValidade: date("dataValidade"),
  dataResposta: date("dataResposta"),
  
  status: varchar("status", { length: 20 }).notNull().default("pendente"), // pendente, respondido, aprovado, recusado, expirado
  
  valorTotal: decimal("valorTotal", { precision: 12, scale: 2 }),
  observacoes: text("observacoes"),
  
  aprovadoPor: int("aprovadoPor"),
  dataAprovacao: timestamp("dataAprovacao"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("quot_tenant_idx").on(table.tenantId),
  statusIdx: index("quot_status_idx").on(table.status),
  numeroIdx: index("quot_numero_idx").on(table.numero),
}));

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

/**
 * Quotation items table - Items in a quotation
 */
export const quotationItems = pgTable("quotationItems", {
  id: serial("id").primaryKey(),
  quotationId: int("quotationId").notNull(),
  
  nomeVacina: varchar("nomeVacina", { length: 255 }).notNull(),
  fabricante: varchar("fabricante", { length: 255 }),
  quantidade: int("quantidade").notNull(),
  
  precoUnitario: decimal("precoUnitario", { precision: 10, scale: 2 }),
  precoTotal: decimal("precoTotal", { precision: 12, scale: 2 }),
  
  lote: varchar("lote", { length: 100 }),
  dataValidade: date("dataValidade"),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  quotIdx: index("quotitem_quot_idx").on(table.quotationId),
}));

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;


/**
 * Financial transactions table - All financial movements
 */
export const financialTransactions = pgTable("financialTransactions", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Tipo de transação
  tipo: tipoEnum2.notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(), // aplicacao_vacina, venda_produto, pagamento_fornecedor, etc
  
  // Método de pagamento
  metodoPagamento: metodoPagamentoEnum.notNull(),
  
  // Valores
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  valorPago: decimal("valorPago", { precision: 12, scale: 2 }),
  
  // Datas
  dataTransacao: date("dataTransacao").notNull(),
  dataVencimento: date("dataVencimento"),
  dataPagamento: date("dataPagamento"),
  
  // Status
  status: statusEnum5.default("pendente").notNull(),
  conciliado: boolean("conciliado").default(false).notNull(),
  dataConciliacao: timestamp("dataConciliacao"),
  
  // Referências
  pacienteId: int("pacienteId"),
  vaccineApplicationId: int("vaccineApplicationId"),
  nfeId: int("nfeId"),
  
  // Informações adicionais
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  
  // Parcelamento
  parcelado: boolean("parcelado").default(false).notNull(),
  numeroParcelas: int("numeroParcelas"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("fintrans_tenant_idx").on(table.tenantId),
  tipoIdx: index("fintrans_tipo_idx").on(table.tipo),
  statusIdx: index("fintrans_status_idx").on(table.status),
  dataIdx: index("fintrans_data_idx").on(table.dataTransacao),
  conciliadoIdx: index("fintrans_conciliado_idx").on(table.conciliado),
}));

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

/**
 * Installments table - Installment payments (credit card)
 */
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  transactionId: int("transactionId").notNull(),
  
  numeroParcela: int("numeroParcela").notNull(), // 1, 2, 3...
  totalParcelas: int("totalParcelas").notNull(),
  
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  
  dataVencimento: date("dataVencimento").notNull(),
  dataPagamento: date("dataPagamento"),
  
  status: statusEnum6.default("pendente").notNull(),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("inst_tenant_idx").on(table.tenantId),
  transIdx: index("inst_trans_idx").on(table.transactionId),
  statusIdx: index("inst_status_idx").on(table.status),
  vencIdx: index("inst_venc_idx").on(table.dataVencimento),
}));

export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = typeof installments.$inferInsert;

/**
 * Bank reconciliation table - Bank statement reconciliation
 */
export const bankReconciliations = pgTable("bankReconciliations", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Dados do extrato bancário
  dataMovimento: date("dataMovimento").notNull(),
  descricao: text("descricao").notNull(),
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  tipo: tipoEnum4.notNull(),
  
  // Conciliação
  conciliado: boolean("conciliado").default(false).notNull(),
  transactionId: int("transactionId"), // Referência para a transação conciliada
  dataConciliacao: timestamp("dataConciliacao"),
  conciladoPor: int("conciladoPor"), // userId
  
  // Informações do banco
  banco: varchar("banco", { length: 100 }),
  agencia: varchar("agencia", { length: 20 }),
  conta: varchar("conta", { length: 20 }),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("bankrec_tenant_idx").on(table.tenantId),
  conciliadoIdx: index("bankrec_conciliado_idx").on(table.conciliado),
  dataIdx: index("bankrec_data_idx").on(table.dataMovimento),
}));

export type BankReconciliation = typeof bankReconciliations.$inferSelect;
export type InsertBankReconciliation = typeof bankReconciliations.$inferInsert;

/**
 * Electronic invoices table - NFe (Nota Fiscal Eletrônica)
 */
export const electronicInvoices = pgTable("electronicInvoices", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Dados da NFe
  numero: varchar("numero", { length: 50 }).notNull().unique(),
  serie: varchar("serie", { length: 10 }).notNull(),
  chaveAcesso: varchar("chaveAcesso", { length: 44 }).unique(),
  
  // Datas
  dataEmissao: timestamp("dataEmissao").notNull(),
  dataSaida: timestamp("dataSaida"),
  
  // Cliente
  pacienteId: int("pacienteId"),
  nomeCliente: varchar("nomeCliente", { length: 255 }).notNull(),
  cpfCnpjCliente: varchar("cpfCnpjCliente", { length: 18 }).notNull(),
  
  // Valores
  valorTotal: decimal("valorTotal", { precision: 12, scale: 2 }).notNull(),
  valorDesconto: decimal("valorDesconto", { precision: 12, scale: 2 }),
  valorLiquido: decimal("valorLiquido", { precision: 12, scale: 2 }).notNull(),
  
  // Status
  status: statusEnum7.default("rascunho").notNull(),
  
  // Arquivos
  xmlUrl: text("xmlUrl"),
  pdfUrl: text("pdfUrl"),
  
  // Protocolo SEFAZ
  protocoloAutorizacao: varchar("protocoloAutorizacao", { length: 50 }),
  dataAutorizacao: timestamp("dataAutorizacao"),
  
  // Cancelamento
  motivoCancelamento: text("motivoCancelamento"),
  dataCancelamento: timestamp("dataCancelamento"),
  
  // Referências
  transactionId: int("transactionId"),
  vaccineApplicationId: int("vaccineApplicationId"),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("nfe_tenant_idx").on(table.tenantId),
  numeroIdx: index("nfe_numero_idx").on(table.numero),
  statusIdx: index("nfe_status_idx").on(table.status),
  dataIdx: index("nfe_data_idx").on(table.dataEmissao),
}));

export type ElectronicInvoice = typeof electronicInvoices.$inferSelect;
export type InsertElectronicInvoice = typeof electronicInvoices.$inferInsert;


/**
 * Patient vaccination history - Histórico de vacinações na área do paciente
 */
export const patientVaccinationHistory = pgTable("patientVaccinationHistory", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Referências
  pacienteId: int("pacienteId").notNull(),
  vaccineApplicationId: int("vaccineApplicationId").notNull(),
  vaccineId: int("vaccineId").notNull(),
  
  // Dados da aplicação
  nomeVacina: varchar("nomeVacina", { length: 255 }).notNull(),
  lote: varchar("lote", { length: 100 }).notNull(),
  dataValidade: date("dataValidade").notNull(),
  dataAplicacao: date("dataAplicacao").notNull(),
  
  // Local da aplicação
  unidadeId: int("unidadeId").notNull(),
  nomeUnidade: varchar("nomeUnidade", { length: 255 }).notNull(),
  refrigeratorId: int("refrigeratorId").notNull(),
  nomeGeladeira: varchar("nomeGeladeira", { length: 255 }).notNull(),
  
  // Profissional
  profissionalId: int("profissionalId"),
  nomeProfissional: varchar("nomeProfissional", { length: 255 }),
  
  // Etiquetas
  etiquetaFisicaUrl: text("etiquetaFisicaUrl"),
  etiquetaVirtualUrl: text("etiquetaVirtualUrl"),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("pvh_tenant_idx").on(table.tenantId),
  pacienteIdx: index("pvh_paciente_idx").on(table.pacienteId),
  dataIdx: index("pvh_data_idx").on(table.dataAplicacao),
}));

export type PatientVaccinationHistory = typeof patientVaccinationHistory.$inferSelect;
export type InsertPatientVaccinationHistory = typeof patientVaccinationHistory.$inferInsert;


/**
 * ============================================
 * MÓDULO DE QUALIDADE
 * ============================================
 */

/**
 * POPs - Procedimentos Operacionais Padrão
 */
export const pops = pgTable("pops", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Identificação do POP
  codigo: varchar("codigo", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  versao: varchar("versao", { length: 20 }).notNull(),
  
  // Conteúdo
  objetivo: text("objetivo").notNull(),
  aplicacao: text("aplicacao"),
  responsavel: varchar("responsavel", { length: 255 }),
  procedimento: text("procedimento").notNull(),
  
  // Controle
  dataElaboracao: date("dataElaboracao").notNull(),
  dataRevisao: date("dataRevisao"),
  proximaRevisao: date("proximaRevisao"),
  status: statusEnum8.default("ativo").notNull(),
  
  // Documentos
  arquivoUrl: text("arquivoUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("pops_tenant_idx").on(table.tenantId),
  codigoIdx: index("pops_codigo_idx").on(table.codigo),
  statusIdx: index("pops_status_idx").on(table.status),
}));

export type Pop = typeof pops.$inferSelect;
export type InsertPop = typeof pops.$inferInsert;

/**
 * Documentação Regulatória
 */
export const regulatoryDocuments = pgTable("regulatoryDocuments", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Identificação
  tipo: tipoEnum5.notNull(),
  numero: varchar("numero", { length: 100 }).notNull(),
  orgaoEmissor: varchar("orgaoEmissor", { length: 255 }).notNull(),
  
  // Descrição
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Datas
  dataEmissao: date("dataEmissao").notNull(),
  dataValidade: date("dataValidade"),
  
  // Status
  status: statusEnum9.default("valido").notNull(),
  
  // Documentos
  arquivoUrl: text("arquivoUrl"),
  
  // Alertas
  diasAntesAlerta: int("diasAntesAlerta").default(30),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("regdoc_tenant_idx").on(table.tenantId),
  tipoIdx: index("regdoc_tipo_idx").on(table.tipo),
  statusIdx: index("regdoc_status_idx").on(table.status),
  validadeIdx: index("regdoc_validade_idx").on(table.dataValidade),
}));

export type RegulatoryDocument = typeof regulatoryDocuments.$inferSelect;
export type InsertRegulatoryDocument = typeof regulatoryDocuments.$inferInsert;

/**
 * Checklists de Auditoria
 */
export const auditChecklists = pgTable("auditChecklists", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Identificação da Auditoria
  tipo: tipoEnum6.notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Datas
  dataPrevista: date("dataPrevista"),
  dataRealizacao: date("dataRealizacao"),
  
  // Responsável
  auditor: varchar("auditor", { length: 255 }),
  
  // Resultado
  status: statusEnum10.default("pendente").notNull(),
  pontuacao: int("pontuacao"),
  pontuacaoMaxima: int("pontuacaoMaxima"),
  
  // Observações
  observacoes: text("observacoes"),
  naoConformidades: text("naoConformidades"),
  planosAcao: text("planosAcao"),
  
  // Documentos
  relatorioUrl: text("relatorioUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("audit_tenant_idx").on(table.tenantId),
  tipoIdx: index("audit_tipo_idx").on(table.tipo),
  statusIdx: index("audit_status_idx").on(table.status),
  dataIdx: index("audit_data_idx").on(table.dataPrevista),
}));

export type AuditChecklist = typeof auditChecklists.$inferSelect;
export type InsertAuditChecklist = typeof auditChecklists.$inferInsert;

/**
 * Itens de Checklist de Auditoria
 */
export const auditChecklistItems = pgTable("auditChecklistItems", {
  id: serial("id").primaryKey(),
  checklistId: int("checklistId").notNull(),
  
  // Item
  categoria: varchar("categoria", { length: 100 }),
  item: text("item").notNull(),
  criterio: text("criterio"),
  
  // Avaliação
  conforme: boolean("conforme"),
  naoConforme: boolean("naoConforme"),
  naoAplicavel: boolean("naoAplicavel"),
  
  // Observações
  observacao: text("observacao"),
  evidencia: text("evidencia"),
  
  // Pontuação
  peso: int("peso").default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  checklistIdx: index("audititem_checklist_idx").on(table.checklistId),
}));

export type AuditChecklistItem = typeof auditChecklistItems.$inferSelect;
export type InsertAuditChecklistItem = typeof auditChecklistItems.$inferInsert;

/**
 * Registro de Ocorrências / Contatos
 * Ligado aos pacientes via Área do Paciente - Reação pós Vacinal, Efeito Adverso
 */
export const occurrences = pgTable("occurrences", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Tipo de Ocorrência
  tipo: tipoEnum7.notNull(),
  
  // Relacionamento com Paciente e Aplicação
  pacienteId: int("pacienteId"),
  vaccineApplicationId: int("vaccineApplicationId"),
  
  // Dados do Contato
  nomeContato: varchar("nomeContato", { length: 255 }),
  telefoneContato: varchar("telefoneContato", { length: 20 }),
  emailContato: varchar("emailContato", { length: 255 }),
  
  // Descrição da Ocorrência
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  gravidade: gravidadeEnum.default("media"),
  
  // Datas
  dataOcorrencia: timestamp("dataOcorrencia").notNull(),
  dataRegistro: timestamp("dataRegistro").defaultNow().notNull(),
  
  // Tratamento
  status: statusEnum11.default("aberta").notNull(),
  responsavel: varchar("responsavel", { length: 255 }),
  acaoTomada: text("acaoTomada"),
  dataResolucao: timestamp("dataResolucao"),
  
  // Notificação
  notificadoVigilancia: boolean("notificadoVigilancia").default(false),
  protocoloNotificacao: varchar("protocoloNotificacao", { length: 100 }),
  
  // Documentos
  anexoUrl: text("anexoUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("occ_tenant_idx").on(table.tenantId),
  pacienteIdx: index("occ_paciente_idx").on(table.pacienteId),
  tipoIdx: index("occ_tipo_idx").on(table.tipo),
  statusIdx: index("occ_status_idx").on(table.status),
  gravidadeIdx: index("occ_gravidade_idx").on(table.gravidade),
}));

export type Occurrence = typeof occurrences.$inferSelect;
export type InsertOccurrence = typeof occurrences.$inferInsert;

/**
 * Registro de Temperaturas (Geladeiras e Caixas de Transporte)
 * Nota: Já existe temperatureLogs, vamos estender para incluir caixas de transporte
 */
export const temperatureMonitoring = pgTable("temperatureMonitoring", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Equipamento
  tipoEquipamento: tipoEquipamentoEnum1.notNull(),
  equipamentoId: int("equipamentoId"), // refrigeratorId se for geladeira
  nomeEquipamento: varchar("nomeEquipamento", { length: 255 }).notNull(),
  
  // Medição
  temperatura: decimal("temperatura", { precision: 5, scale: 2 }).notNull(),
  temperaturaMinima: decimal("temperaturaMinima", { precision: 5, scale: 2 }),
  temperaturaMaxima: decimal("temperaturaMaxima", { precision: 5, scale: 2 }),
  
  // Conformidade
  dentroDoLimite: boolean("dentroDoLimite").notNull(),
  limiteInferior: decimal("limiteInferior", { precision: 5, scale: 2 }).default("2.00"),
  limiteSuperior: decimal("limiteSuperior", { precision: 5, scale: 2 }).default("8.00"),
  
  // Responsável
  responsavel: varchar("responsavel", { length: 255 }),
  
  // Ação em caso de não conformidade
  acaoCorretiva: text("acaoCorretiva"),
  
  // Data e Hora
  dataHoraRegistro: timestamp("dataHoraRegistro").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tempmon_tenant_idx").on(table.tenantId),
  equipamentoIdx: index("tempmon_equipamento_idx").on(table.equipamentoId),
  tipoIdx: index("tempmon_tipo_idx").on(table.tipoEquipamento),
  dataIdx: index("tempmon_data_idx").on(table.dataHoraRegistro),
  conformidadeIdx: index("tempmon_conformidade_idx").on(table.dentroDoLimite),
}));

export type TemperatureMonitoring = typeof temperatureMonitoring.$inferSelect;
export type InsertTemperatureMonitoring = typeof temperatureMonitoring.$inferInsert;

/**
 * Registro de Manutenções (Corretivas e Preventivas)
 * Nota: Já existe refrigeratorMaintenances, vamos criar uma tabela mais genérica
 */
export const maintenanceRecords = pgTable("maintenanceRecords", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Equipamento
  tipoEquipamento: tipoEquipamentoEnum.notNull(),
  equipamentoId: int("equipamentoId"),
  nomeEquipamento: varchar("nomeEquipamento", { length: 255 }).notNull(),
  
  // Tipo de Manutenção
  tipoManutencao: tipoManutencaoEnum.notNull(),
  
  // Descrição
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  
  // Datas
  dataPrevista: date("dataPrevista"),
  dataRealizacao: date("dataRealizacao"),
  proximaManutencao: date("proximaManutencao"),
  
  // Responsável
  responsavel: varchar("responsavel", { length: 255 }),
  empresa: varchar("empresa", { length: 255 }),
  
  // Custo
  custo: decimal("custo", { precision: 10, scale: 2 }),
  
  // Status
  status: statusEnum12.default("agendada").notNull(),
  
  // Observações
  observacoes: text("observacoes"),
  pecasTrocadas: text("pecasTrocadas"),
  
  // Documentos
  notaFiscalUrl: text("notaFiscalUrl"),
  relatorioUrl: text("relatorioUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("maint_tenant_idx").on(table.tenantId),
  equipamentoIdx: index("maint_equipamento_idx").on(table.equipamentoId),
  tipoIdx: index("maint_tipo_idx").on(table.tipoManutencao),
  statusIdx: index("maint_status_idx").on(table.status),
  dataIdx: index("maint_data_idx").on(table.dataPrevista),
}));

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = typeof maintenanceRecords.$inferInsert;

/**
 * Registro de Treinamentos do RH
 */
export const trainingRecords = pgTable("trainingRecords", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Identificação do Treinamento
  titulo: varchar("titulo", { length: 255 }).notNull(),
  tipo: tipoEnum8.notNull(),
  categoria: varchar("categoria", { length: 100 }),
  
  // Descrição
  descricao: text("descricao"),
  objetivo: text("objetivo"),
  conteudoProgramatico: text("conteudoProgramatico"),
  
  // Instrutor
  instrutor: varchar("instrutor", { length: 255 }),
  empresaInstrutora: varchar("empresaInstrutora", { length: 255 }),
  
  // Datas
  dataRealizacao: date("dataRealizacao").notNull(),
  cargaHoraria: int("cargaHoraria"),
  
  // Status
  status: statusEnum13.default("planejado").notNull(),
  
  // Certificação
  certificado: boolean("certificado").default(false),
  validadeCertificado: date("validadeCertificado"),
  
  // Documentos
  materialUrl: text("materialUrl"),
  listaPresencaUrl: text("listaPresencaUrl"),
  certificadoUrl: text("certificadoUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("train_tenant_idx").on(table.tenantId),
  tipoIdx: index("train_tipo_idx").on(table.tipo),
  statusIdx: index("train_status_idx").on(table.status),
  dataIdx: index("train_data_idx").on(table.dataRealizacao),
}));

export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type InsertTrainingRecord = typeof trainingRecords.$inferInsert;

/**
 * Participantes de Treinamento
 */
export const trainingParticipants = pgTable("trainingParticipants", {
  id: serial("id").primaryKey(),
  trainingId: int("trainingId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Participação
  presente: boolean("presente").default(true),
  aprovado: boolean("aprovado"),
  nota: decimal("nota", { precision: 5, scale: 2 }),
  
  // Certificado
  certificadoEmitido: boolean("certificadoEmitido").default(false),
  certificadoUrl: text("certificadoUrl"),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  trainingIdx: index("trainpart_training_idx").on(table.trainingId),
  employeeIdx: index("trainpart_employee_idx").on(table.employeeId),
}));

export type TrainingParticipant = typeof trainingParticipants.$inferSelect;
export type InsertTrainingParticipant = typeof trainingParticipants.$inferInsert;


// ============================================================================
// MÓDULO DE RH (RECURSOS HUMANOS)
// ============================================================================

/**
 * Colaboradores (RH)
 */
export const hrEmployees = pgTable("hrEmployees", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId"), // Link com tabela users se tiver acesso ao sistema
  
  // Dados Pessoais
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(),
  rg: varchar("rg", { length: 20 }),
  dataNascimento: date("dataNascimento"),
  sexo: sexoEnum,
  estadoCivil: estadoCivilEnum,
  
  // Contato
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  celular: varchar("celular", { length: 20 }),
  
  // Endereço
  cep: varchar("cep", { length: 10 }),
  endereco: text("endereco"),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  
  // Dados Profissionais
  cargo: varchar("cargo", { length: 255 }),
  setor: varchar("setor", { length: 100 }),
  dataAdmissao: date("dataAdmissao"),
  dataDemissao: date("dataDemissao"),
  tipoContrato: tipoContratoEnum,
  salario: decimal("salario", { precision: 10, scale: 2 }),
  cargaHoraria: int("cargaHoraria").default(40), // horas semanais
  
  // Perfil de Acesso
  perfil: perfilEnum,
  senha: varchar("senha", { length: 255 }), // Hash da senha para login na ADC
  
  // Documentos Profissionais
  ctps: varchar("ctps", { length: 50 }),
  pis: varchar("pis", { length: 20 }),
  tituloEleitor: varchar("tituloEleitor", { length: 20 }),
  carteiraMotorista: varchar("carteiraMotorista", { length: 20 }),
  categoriaHabilitacao: varchar("categoriaHabilitacao", { length: 5 }),
  
  // Registro Profissional (para enfermeiros, etc)
  registroProfissional: varchar("registroProfissional", { length: 50 }),
  orgaoRegistro: varchar("orgaoRegistro", { length: 50 }), // COREN, CRM, etc
  
  // Status
  status: statusEnum14.default("ativo"),
  
  // Observações
  observacoes: text("observacoes"),
  
  // Foto
  fotoUrl: text("fotoUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("emp_tenant_idx").on(table.tenantId),
  cpfIdx: index("emp_cpf_idx").on(table.cpf),
  statusIdx: index("emp_status_idx").on(table.status),
  perfilIdx: index("emp_perfil_idx").on(table.perfil),
}));

export type HREmployee = typeof hrEmployees.$inferSelect;
export type InsertHREmployee = typeof hrEmployees.$inferInsert;

/**
 * Permissões por Perfil
 */
export const profilePermissions = pgTable("profilePermissions", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  perfil: perfilEnum.notNull(),
  
  // Módulos
  moduloPacientes: boolean("moduloPacientes").default(false),
  moduloEstoque: boolean("moduloEstoque").default(false),
  moduloAplicacao: boolean("moduloAplicacao").default(false),
  moduloFinanceiro: boolean("moduloFinanceiro").default(false),
  moduloQualidade: boolean("moduloQualidade").default(false),
  moduloIndicadores: boolean("moduloIndicadores").default(false),
  moduloRH: boolean("moduloRH").default(false),
  
  // Permissões específicas
  podeEditar: boolean("podeEditar").default(false),
  podeDeletar: boolean("podeDeletar").default(false),
  podeAprovar: boolean("podeAprovar").default(false),
  podeExportar: boolean("podeExportar").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantPerfilIdx: index("perm_tenant_perfil_idx").on(table.tenantId, table.perfil),
}));

export type ProfilePermission = typeof profilePermissions.$inferSelect;
export type InsertProfilePermission = typeof profilePermissions.$inferInsert;

/**
 * Folha de Pagamento
 */
export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Período
  mesReferencia: int("mesReferencia").notNull(), // 1-12
  anoReferencia: int("anoReferencia").notNull(),
  
  // Vencimentos
  salarioBase: decimal("salarioBase", { precision: 10, scale: 2 }).notNull(),
  horasExtras: decimal("horasExtras", { precision: 10, scale: 2 }).default("0"),
  adicionalNoturno: decimal("adicionalNoturno", { precision: 10, scale: 2 }).default("0"),
  comissoes: decimal("comissoes", { precision: 10, scale: 2 }).default("0"),
  bonificacoes: decimal("bonificacoes", { precision: 10, scale: 2 }).default("0"),
  outrosVencimentos: decimal("outrosVencimentos", { precision: 10, scale: 2 }).default("0"),
  
  // Descontos
  inss: decimal("inss", { precision: 10, scale: 2 }).default("0"),
  irrf: decimal("irrf", { precision: 10, scale: 2 }).default("0"),
  fgts: decimal("fgts", { precision: 10, scale: 2 }).default("0"),
  valeTransporte: decimal("valeTransporte", { precision: 10, scale: 2 }).default("0"),
  valeRefeicao: decimal("valeRefeicao", { precision: 10, scale: 2 }).default("0"),
  planoSaude: decimal("planoSaude", { precision: 10, scale: 2 }).default("0"),
  outrosDescontos: decimal("outrosDescontos", { precision: 10, scale: 2 }).default("0"),
  
  // Totais
  totalVencimentos: decimal("totalVencimentos", { precision: 10, scale: 2 }).notNull(),
  totalDescontos: decimal("totalDescontos", { precision: 10, scale: 2 }).notNull(),
  salarioLiquido: decimal("salarioLiquido", { precision: 10, scale: 2 }).notNull(),
  
  // Status
  status: statusEnum15.default("rascunho"),
  dataPagamento: date("dataPagamento"),
  
  // Holerite
  holeriteUrl: text("holeriteUrl"),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("pay_tenant_idx").on(table.tenantId),
  employeeIdx: index("pay_employee_idx").on(table.employeeId),
  referenciaIdx: index("pay_referencia_idx").on(table.anoReferencia, table.mesReferencia),
  statusIdx: index("pay_status_idx").on(table.status),
}));

export type Payroll = typeof payrolls.$inferSelect;
export type InsertPayroll = typeof payrolls.$inferInsert;

/**
 * Benefícios
 */
export const employeeBenefits = pgTable("employeeBenefits", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Tipo de Benefício
  tipo: tipoEnum9.notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Valores
  valorEmpresa: decimal("valorEmpresa", { precision: 10, scale: 2 }),
  valorColaborador: decimal("valorColaborador", { precision: 10, scale: 2 }),
  
  // Vigência
  dataInicio: date("dataInicio"),
  dataFim: date("dataFim"),
  
  // Status
  status: statusEnum1.default("ativo"),
  
  // Fornecedor
  fornecedor: varchar("fornecedor", { length: 255 }),
  numeroCartao: varchar("numeroCartao", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("ben_tenant_idx").on(table.tenantId),
  employeeIdx: index("ben_employee_idx").on(table.employeeId),
  tipoIdx: index("ben_tipo_idx").on(table.tipo),
  statusIdx: index("ben_status_idx").on(table.status),
}));

export type EmployeeBenefit = typeof employeeBenefits.$inferSelect;
export type InsertEmployeeBenefit = typeof employeeBenefits.$inferInsert;

/**
 * Ponto Eletrônico
 */
export const timeClocks = pgTable("timeClocks", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Data e Hora
  data: date("data").notNull(),
  horaEntrada: varchar("horaEntrada", { length: 5 }), // HH:MM
  horaSaidaAlmoco: varchar("horaSaidaAlmoco", { length: 5 }),
  horaRetornoAlmoco: varchar("horaRetornoAlmoco", { length: 5 }),
  horaSaida: varchar("horaSaida", { length: 5 }),
  
  // Localização (GPS)
  latitudeEntrada: decimal("latitudeEntrada", { precision: 10, scale: 7 }),
  longitudeEntrada: decimal("longitudeEntrada", { precision: 10, scale: 7 }),
  latitudeSaida: decimal("latitudeSaida", { precision: 10, scale: 7 }),
  longitudeSaida: decimal("longitudeSaida", { precision: 10, scale: 7 }),
  
  // Cálculos
  horasTrabalhadas: decimal("horasTrabalhadas", { precision: 5, scale: 2 }),
  horasExtras: decimal("horasExtras", { precision: 5, scale: 2 }),
  
  // Status
  status: statusEnum16.default("normal"),
  
  // Justificativa
  justificativa: text("justificativa"),
  atestadoUrl: text("atestadoUrl"),
  
  // Aprovação
  aprovado: boolean("aprovado"),
  aprovadoPor: int("aprovadoPor"),
  dataAprovacao: timestamp("dataAprovacao"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("time_tenant_idx").on(table.tenantId),
  employeeIdx: index("time_employee_idx").on(table.employeeId),
  dataIdx: index("time_data_idx").on(table.data),
  statusIdx: index("time_status_idx").on(table.status),
}));

export type TimeClock = typeof timeClocks.$inferSelect;
export type InsertTimeClock = typeof timeClocks.$inferInsert;

/**
 * Registro de KM
 */
export const mileageRecords = pgTable("mileageRecords", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Data e Percurso
  data: date("data").notNull(),
  origem: varchar("origem", { length: 255 }).notNull(),
  destino: varchar("destino", { length: 255 }).notNull(),
  kmInicial: decimal("kmInicial", { precision: 10, scale: 2 }),
  kmFinal: decimal("kmFinal", { precision: 10, scale: 2 }),
  kmPercorrido: decimal("kmPercorrido", { precision: 10, scale: 2 }).notNull(),
  
  // Motivo
  motivo: text("motivo"),
  cliente: varchar("cliente", { length: 255 }),
  
  // Veículo
  veiculo: varchar("veiculo", { length: 100 }),
  placa: varchar("placa", { length: 10 }),
  
  // Reembolso
  valorKm: decimal("valorKm", { precision: 10, scale: 2 }),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }),
  
  // Status
  status: statusEnum17.default("pendente"),
  aprovadoPor: int("aprovadoPor"),
  dataAprovacao: timestamp("dataAprovacao"),
  
  // Comprovante
  comprovanteUrl: text("comprovanteUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("mile_tenant_idx").on(table.tenantId),
  employeeIdx: index("mile_employee_idx").on(table.employeeId),
  dataIdx: index("mile_data_idx").on(table.data),
  statusIdx: index("mile_status_idx").on(table.status),
}));

export type MileageRecord = typeof mileageRecords.$inferSelect;
export type InsertMileageRecord = typeof mileageRecords.$inferInsert;

/**
 * Solicitações de Horas Extras
 */
export const overtimeRequests = pgTable("overtimeRequests", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Data e Horário
  data: date("data").notNull(),
  horaInicio: varchar("horaInicio", { length: 5 }).notNull(),
  horaFim: varchar("horaFim", { length: 5 }).notNull(),
  totalHoras: decimal("totalHoras", { precision: 5, scale: 2 }).notNull(),
  
  // Justificativa
  motivo: text("motivo").notNull(),
  atividades: text("atividades"),
  
  // Tipo
  tipo: tipoEnum10.default("normal"),
  
  // Status
  status: statusEnum18.default("pendente"),
  aprovadoPor: int("aprovadoPor"),
  dataAprovacao: timestamp("dataAprovacao"),
  motivoReprovacao: text("motivoReprovacao"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("over_tenant_idx").on(table.tenantId),
  employeeIdx: index("over_employee_idx").on(table.employeeId),
  dataIdx: index("over_data_idx").on(table.data),
  statusIdx: index("over_status_idx").on(table.status),
}));

export type OvertimeRequest = typeof overtimeRequests.$inferSelect;
export type InsertOvertimeRequest = typeof overtimeRequests.$inferInsert;

/**
 * Registro de Ausências
 */
export const absenceRecords = pgTable("absenceRecords", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Período
  dataInicio: date("dataInicio").notNull(),
  dataFim: date("dataFim").notNull(),
  totalDias: int("totalDias").notNull(),
  
  // Tipo
  tipo: tipoEnum11.notNull(),
  
  // Justificativa
  motivo: text("motivo"),
  documentoUrl: text("documentoUrl"),
  
  // Status
  status: statusEnum18.default("pendente"),
  aprovadoPor: int("aprovadoPor"),
  dataAprovacao: timestamp("dataAprovacao"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("abs_tenant_idx").on(table.tenantId),
  employeeIdx: index("abs_employee_idx").on(table.employeeId),
  dataIdx: index("abs_data_idx").on(table.dataInicio),
  statusIdx: index("abs_status_idx").on(table.status),
}));

export type AbsenceRecord = typeof absenceRecords.$inferSelect;
export type InsertAbsenceRecord = typeof absenceRecords.$inferInsert;

/**
 * CAT - Comunicado de Acidente de Trabalho
 */
export const workAccidents = pgTable("workAccidents", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  employeeId: int("employeeId").notNull(),
  
  // Data e Hora do Acidente
  dataAcidente: date("dataAcidente").notNull(),
  horaAcidente: varchar("horaAcidente", { length: 5 }),
  
  // Local
  localAcidente: text("localAcidente").notNull(),
  
  // Descrição
  descricaoAcidente: text("descricaoAcidente").notNull(),
  parteCorpoAtingida: varchar("parteCorpoAtingida", { length: 255 }),
  naturezaLesao: varchar("naturezaLesao", { length: 255 }),
  
  // Testemunhas
  testemunhas: text("testemunhas"),
  
  // Atendimento
  houveSocorro: boolean("houveSocorro").default(false),
  localSocorro: varchar("localSocorro", { length: 255 }),
  
  // Afastamento
  houveAfastamento: boolean("houveAfastamento").default(false),
  diasAfastamento: int("diasAfastamento"),
  
  // Documentos
  atestadoUrl: text("atestadoUrl"),
  fotosUrl: text("fotosUrl"),
  catUrl: text("catUrl"),
  
  // Status
  status: statusEnum19.default("registrado"),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("cat_tenant_idx").on(table.tenantId),
  employeeIdx: index("cat_employee_idx").on(table.employeeId),
  dataIdx: index("cat_data_idx").on(table.dataAcidente),
  statusIdx: index("cat_status_idx").on(table.status),
}));

export type WorkAccident = typeof workAccidents.$inferSelect;
export type InsertWorkAccident = typeof workAccidents.$inferInsert;


// ============================================
// MÓDULO DE INTEGRAÇÕES (RNDS/PNI e NFe)
// ============================================

// Estabelecimentos e CNES
export const healthEstablishments = pgTable("health_establishments", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Identificação
  cnes: varchar("cnes", { length: 7 }).notNull().unique(),
  nomeFantasia: varchar("nomeFantasia", { length: 255 }).notNull(),
  razaoSocial: varchar("razaoSocial", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 14 }).notNull(),
  
  // Endereço
  logradouro: varchar("logradouro", { length: 255 }).notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }).notNull(),
  municipio: varchar("municipio", { length: 100 }).notNull(),
  uf: varchar("uf", { length: 2 }).notNull(),
  cep: varchar("cep", { length: 8 }).notNull(),
  
  // Responsável Técnico
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  responsavelCPF: varchar("responsavelCPF", { length: 11 }),
  responsavelCNS: varchar("responsavelCNS", { length: 15 }),
  responsavelEmail: varchar("responsavelEmail", { length: 255 }),
  responsavelTelefone: varchar("responsavelTelefone", { length: 20 }),
  
  // Status
  ativo: boolean("ativo").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("health_est_tenant_idx").on(table.tenantId),
  cnesIdx: index("health_est_cnes_idx").on(table.cnes),
}));

export type HealthEstablishment = typeof healthEstablishments.$inferSelect;
export type InsertHealthEstablishment = typeof healthEstablishments.$inferInsert;

// Credenciais de Integração RNDS
export const rndsCredentials = pgTable("rnds_credentials", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  establishmentId: int("establishmentId").notNull(),
  
  // Ambiente
  ambiente: ambienteEnum.notNull(),
  
  // Credenciais (criptografadas)
  clientId: text("clientId").notNull(),
  clientSecret: text("clientSecret").notNull(),
  
  // Endpoints
  authUrl: varchar("authUrl", { length: 500 }),
  apiUrl: varchar("apiUrl", { length: 500 }),
  
  // Status
  ativo: boolean("ativo").default(true),
  dataHomologacao: date("dataHomologacao"),
  dataProducao: date("dataProducao"),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("rnds_cred_tenant_idx").on(table.tenantId),
  establishmentIdx: index("rnds_cred_est_idx").on(table.establishmentId),
  ambienteIdx: index("rnds_cred_ambiente_idx").on(table.ambiente),
}));

export type RndsCredential = typeof rndsCredentials.$inferSelect;
export type InsertRndsCredential = typeof rndsCredentials.$inferInsert;

// Configurações Fiscais (NFS-e / NFe)
export const fiscalConfigurations = pgTable("fiscal_configurations", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  establishmentId: int("establishmentId").notNull(),
  
  // Tipo de Nota
  tipoNota: tipoNotaEnum.notNull(),
  
  // Dados Fiscais
  inscricaoMunicipal: varchar("inscricaoMunicipal", { length: 50 }),
  inscricaoEstadual: varchar("inscricaoEstadual", { length: 50 }),
  regimeTributario: regimeTributarioEnum,
  cnae: varchar("cnae", { length: 10 }),
  
  // Alíquotas
  aliquotaISS: decimal("aliquotaISS", { precision: 5, scale: 2 }),
  aliquotaPIS: decimal("aliquotaPIS", { precision: 5, scale: 2 }),
  aliquotaCOFINS: decimal("aliquotaCOFINS", { precision: 5, scale: 2 }),
  
  // Certificado Digital
  certificadoA1: text("certificadoA1"), // Base64 criptografado
  senhaCertificado: text("senhaCertificado"), // Criptografado
  validadeCertificado: date("validadeCertificado"),
  
  // Ambiente
  ambiente: ambienteEnum.notNull(),
  
  // Endpoints (se integração direta)
  endpointEmissao: varchar("endpointEmissao", { length: 500 }),
  endpointConsulta: varchar("endpointConsulta", { length: 500 }),
  
  // Status
  ativo: boolean("ativo").default(true),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("fiscal_config_tenant_idx").on(table.tenantId),
  establishmentIdx: index("fiscal_config_est_idx").on(table.establishmentId),
  tipoNotaIdx: index("fiscal_config_tipo_idx").on(table.tipoNota),
}));

export type FiscalConfiguration = typeof fiscalConfigurations.$inferSelect;
export type InsertFiscalConfiguration = typeof fiscalConfigurations.$inferInsert;

// Fila de Envios (Outbox Pattern)
export const integrationOutbox = pgTable("integration_outbox", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  establishmentId: int("establishmentId").notNull(),
  
  // Tipo de Integração
  tipoIntegracao: tipoIntegracaoEnum.notNull(),
  
  // Referência
  referenciaId: int("referenciaId").notNull(), // ID da aplicação ou transação
  referenciaTabela: varchar("referenciaTabela", { length: 100 }).notNull(),
  
  // Payload
  payload: json("payload").notNull(), // Documento FHIR ou XML fiscal
  
  // Status
  status: statusEnum20.default("pendente"),
  tentativas: int("tentativas").default(0),
  maxTentativas: int("maxTentativas").default(5),
  
  // Resposta
  protocolo: varchar("protocolo", { length: 100 }),
  chave: varchar("chave", { length: 100 }),
  mensagemRetorno: text("mensagemRetorno"),
  codigoErro: varchar("codigoErro", { length: 50 }),
  
  // Timestamps
  dataEnvio: timestamp("dataEnvio"),
  dataResposta: timestamp("dataResposta"),
  proximaTentativa: timestamp("proximaTentativa"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("outbox_tenant_idx").on(table.tenantId),
  statusIdx: index("outbox_status_idx").on(table.status),
  tipoIdx: index("outbox_tipo_idx").on(table.tipoIntegracao),
  proximaTentativaIdx: index("outbox_proxima_idx").on(table.proximaTentativa),
}));

export type IntegrationOutbox = typeof integrationOutbox.$inferSelect;
export type InsertIntegrationOutbox = typeof integrationOutbox.$inferInsert;

// Logs de Integração (Auditoria)
export const integrationLogs = pgTable("integration_logs", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  outboxId: int("outboxId").notNull(),
  
  // Request
  requestUrl: varchar("requestUrl", { length: 500 }),
  requestMethod: varchar("requestMethod", { length: 10 }),
  requestHeaders: json("requestHeaders"),
  requestBody: json("requestBody"), // Mascarado para LGPD
  
  // Response
  responseStatus: int("responseStatus"),
  responseHeaders: json("responseHeaders"),
  responseBody: json("responseBody"), // Mascarado para LGPD
  
  // Timing
  latenciaMs: int("latenciaMs"),
  
  // Erro
  erro: text("erro"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("logs_tenant_idx").on(table.tenantId),
  outboxIdx: index("logs_outbox_idx").on(table.outboxId),
  createdAtIdx: index("logs_created_idx").on(table.createdAt),
}));

export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = typeof integrationLogs.$inferInsert;

// Estatísticas de Integração
export const integrationStats = pgTable("integration_stats", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  establishmentId: int("establishmentId").notNull(),
  
  // Período
  data: date("data").notNull(),
  tipoIntegracao: tipoIntegracaoEnum.notNull(),
  
  // Contadores
  totalEnviados: int("totalEnviados").default(0),
  totalAceitos: int("totalAceitos").default(0),
  totalRejeitados: int("totalRejeitados").default(0),
  totalErros: int("totalErros").default(0),
  
  // Latência
  latenciaMediaMs: int("latenciaMediaMs"),
  latenciaP50Ms: int("latenciaP50Ms"),
  latenciaP95Ms: int("latenciaP95Ms"),
  latenciaP99Ms: int("latenciaP99Ms"),
  
  // IC 95% (Wilson para proporções)
  taxaSucessoPercent: decimal("taxaSucessoPercent", { precision: 5, scale: 2 }),
  icInferiorPercent: decimal("icInferiorPercent", { precision: 5, scale: 2 }),
  icSuperiorPercent: decimal("icSuperiorPercent", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("stats_tenant_idx").on(table.tenantId),
  dataIdx: index("stats_data_idx").on(table.data),
  tipoIdx: index("stats_tipo_idx").on(table.tipoIntegracao),
}));

export type IntegrationStat = typeof integrationStats.$inferSelect;
export type InsertIntegrationStat = typeof integrationStats.$inferInsert;


// ============= MÓDULO DE AGENDAMENTOS =============

/**
 * Appointments table - Scheduling for vaccinations
 */
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Paciente
  patientId: int("patientId").notNull(),
  patientName: varchar("patientName", { length: 255 }).notNull(),
  patientPhone: varchar("patientPhone", { length: 20 }),
  
  // Agendamento
  dataHora: timestamp("dataHora").notNull(),
  tipo: tipoEnum.notNull(),
  
  // Local
  unitId: int("unitId"),
  endereco: text("endereco"), // Para domiciliar
  
  // Vacinas solicitadas
  vaccineIds: json("vaccineIds").$type<number[]>(), // Array de IDs de vacinas
  vaccineNames: text("vaccineNames"), // Nomes das vacinas (para exibição rápida)
  
  // Duração
  duracao: int("duracao").default(30), // minutos
  
  // Endereço domiciliar (se aplicável)
  homeCareAddressId: int("homeCareAddressId"),
  
  // Valores
  valorTotal: decimal("valorTotal", { precision: 12, scale: 2 }),
  taxaDomiciliar: decimal("taxaDomiciliar", { precision: 12, scale: 2 }).default("0.00"),
  descontoAntecipado: decimal("descontoAntecipado", { precision: 12, scale: 2 }).default("0.00"),
  valorFinal: decimal("valorFinal", { precision: 12, scale: 2 }),
  
  // Status
  status: statusEnum21.default("pendente").notNull(),
  motivoCancelamento: text("motivoCancelamento"),
  
  // Pagamento antecipado
  pagamentoAntecipado: boolean("pagamentoAntecipado").default(false),
  paymentLinkId: varchar("paymentLinkId", { length: 255 }),
  
  // Notificações
  notificacaoEnviada: boolean("notificacaoEnviada").default(false),
  dataNotificacao: timestamp("dataNotificacao"),
  
  // Profissional responsável
  employeeId: int("employeeId"),
  
  // Rota (para domiciliar)
  routeId: int("routeId"),
  ordemNaRota: int("ordemNaRota"),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("appt_tenant_idx").on(table.tenantId),
  patientIdx: index("appt_patient_idx").on(table.patientId),
  dataIdx: index("appt_data_idx").on(table.dataHora),
  statusIdx: index("appt_status_idx").on(table.status),
}));

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ============= MÓDULO DE ORÇAMENTOS =============

/**
 * Budgets table - Vaccine budget quotes
 */
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Número do orçamento (formato: ORÇ-YYYYMMDD-XXXX)
  numero: varchar("numero", { length: 50 }).notNull().unique(),
  
  // Dados do cliente
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  dataNascimento: timestamp("dataNascimento"),
  email: varchar("email", { length: 320 }),
  celular: varchar("celular", { length: 20 }),
  
  // Vacinas e valores
  vaccineIds: json("vaccineIds").$type<number[]>().notNull(), // Array de IDs
  vaccineNames: text("vaccineNames").notNull(), // Nomes para exibição
  vaccineQuantities: json("vaccineQuantities").$type<number[]>(), // Quantidades
  vaccinePrices: json("vaccinePrices").$type<number[]>(), // Preços unitários em centavos
  
  valorTotal: int("valorTotal").notNull(), // em centavos
  desconto: int("desconto").default(0), // em centavos
  valorFinal: int("valorFinal").notNull(), // em centavos
  
  // Validade
  dataValidade: timestamp("dataValidade").notNull(),
  
  // Status e conversão
  status: statusEnum22.default("pendente").notNull(),
  applicationId: int("applicationId"), // ID da aplicação quando convertido
  dataConversao: timestamp("dataConversao"),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("budget_tenant_idx").on(table.tenantId),
  numeroIdx: index("budget_numero_idx").on(table.numero),
  cpfIdx: index("budget_cpf_idx").on(table.cpf),
  statusIdx: index("budget_status_idx").on(table.status),
  validadeIdx: index("budget_validade_idx").on(table.dataValidade),
}));

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;


// ============= TABELAS DE PREÇOS =============

/**
 * Price Tables table - Named price tables (Particular, 5% Desconto, etc.)
 */
export const priceTables = pgTable("price_tables", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  nome: varchar("nome", { length: 255 }).notNull(), // Ex: "Particular", "5% de Desconto", "Familiares de Colaboradores"
  descricao: text("descricao"),
  
  ativo: boolean("ativo").default(true).notNull(),
  padrao: boolean("padrao").default(false).notNull(), // Tabela padrão para novos orçamentos
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("ptable_tenant_idx").on(table.tenantId),
  ativoIdx: index("ptable_ativo_idx").on(table.ativo),
}));

export type PriceTable = typeof priceTables.$inferSelect;
export type InsertPriceTable = typeof priceTables.$inferInsert;

/**
 * Vaccine Prices table - Selling prices for vaccines
 */
export const vaccinePrices = pgTable("vaccine_prices", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  priceTableId: int("priceTableId").notNull(), // Referência à tabela de preços
  vaccineId: int("vaccineId").notNull(),
  
  // Preço
  preco: int("preco").notNull(), // em centavos
  
  // Vigência
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim"),
  
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("vprice_tenant_idx").on(table.tenantId),
  priceTableIdx: index("vprice_pricetable_idx").on(table.priceTableId),
  vaccineIdx: index("vprice_vaccine_idx").on(table.vaccineId),
  ativoIdx: index("vprice_ativo_idx").on(table.ativo),
}));

export type VaccinePrice = typeof vaccinePrices.$inferSelect;
export type InsertVaccinePrice = typeof vaccinePrices.$inferInsert;

/**
 * Price Campaigns table - Discount campaigns
 */
export const priceCampaigns = pgTable("price_campaigns", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Tipo de desconto
  tipoDesconto: tipoDescontoEnum.notNull(),
  valorDesconto: int("valorDesconto").notNull(), // percentual (ex: 10 = 10%) ou valor em centavos
  
  // Vacinas aplicáveis (null = todas)
  vaccineIds: json("vaccineIds").$type<number[]>(),
  
  // Vigência
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("campaign_tenant_idx").on(table.tenantId),
  ativoIdx: index("campaign_ativo_idx").on(table.ativo),
  dataInicioIdx: index("campaign_inicio_idx").on(table.dataInicio),
}));

export type PriceCampaign = typeof priceCampaigns.$inferSelect;
export type InsertPriceCampaign = typeof priceCampaigns.$inferInsert;

/**
 * Bank Accounts table - Bank accounts for reconciliation
 */
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Dados da conta
  banco: varchar("banco", { length: 100 }).notNull(), // Nome do banco
  agencia: varchar("agencia", { length: 20 }).notNull(),
  conta: varchar("conta", { length: 20 }).notNull(),
  tipoConta: tipoContaEnum.notNull(),
  
  // Identificação
  apelido: varchar("apelido", { length: 100 }).notNull(), // Ex: "Conta Principal", "Conta Reserva"
  descricao: text("descricao"),
  
  // Saldo
  saldoInicial: decimal("saldoInicial", { precision: 12, scale: 2 }).default("0.00").notNull(),
  saldoAtual: decimal("saldoAtual", { precision: 12, scale: 2 }).default("0.00").notNull(),
  
  // Status
  ativa: boolean("ativa").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("bank_account_tenant_idx").on(table.tenantId),
  ativaIdx: index("bank_account_ativa_idx").on(table.ativa),
}));

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;


/**
 * Home care addresses table - Addresses for home care service
 */
export const homeCareAddresses = pgTable("home_care_addresses", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  patientId: int("patientId").notNull(),
  
  // Endereço completo
  cep: varchar("cep", { length: 9 }).notNull(),
  logradouro: varchar("logradouro", { length: 255 }).notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }).notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  
  // Geolocalização
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Região (para cálculo de taxa)
  regiao: regiaoEnum.default("grande_campinas").notNull(),
  
  // Referências
  pontoReferencia: text("pontoReferencia"),
  
  // Status
  ativo: boolean("ativo").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("hca_tenant_idx").on(table.tenantId),
  patientIdx: index("hca_patient_idx").on(table.patientId),
  regiaoIdx: index("hca_regiao_idx").on(table.regiao),
  ativoIdx: index("hca_ativo_idx").on(table.ativo),
}));

export type HomeCareAddress = typeof homeCareAddresses.$inferSelect;
export type InsertHomeCareAddress = typeof homeCareAddresses.$inferInsert;

/**
 * Appointment routes table - Optimized routes for home care
 */
export const appointmentRoutes = pgTable("appointment_routes", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Data da rota
  dataRota: date("dataRota").notNull(),
  
  // Profissional responsável
  employeeId: int("employeeId").notNull(),
  
  // Agendamentos na rota (JSON array de IDs ordenados)
  appointmentIds: json("appointmentIds").notNull(), // [5, 12, 8, 3]
  
  // Distância e tempo total
  distanciaTotal: decimal("distanciaTotal", { precision: 10, scale: 2 }), // km
  tempoTotal: int("tempoTotal"), // minutos
  
  // Rota otimizada (JSON do Google Maps)
  rotaOtimizada: json("rotaOtimizada"),
  
  // Status
  status: statusEnum23.default("planejada").notNull(),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("route_tenant_idx").on(table.tenantId),
  dataIdx: index("route_data_idx").on(table.dataRota),
  employeeIdx: index("route_employee_idx").on(table.employeeId),
  statusIdx: index("route_status_idx").on(table.status),
}));

export type AppointmentRoute = typeof appointmentRoutes.$inferSelect;
export type InsertAppointmentRoute = typeof appointmentRoutes.$inferInsert;

/**
 * Vaccine reservations table - Vaccines reserved for appointments
 */
export const vaccineReservations = pgTable("vaccine_reservations", {
  id: serial("id").primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Agendamento
  appointmentId: int("appointmentId").notNull(),
  
  // Vacina
  vaccineId: int("vaccineId").notNull(),
  lote: varchar("lote", { length: 50 }).notNull(),
  
  // Quantidade reservada
  quantidade: int("quantidade").default(1).notNull(),
  
  // Estoque origem
  refrigeratorId: int("refrigeratorId").notNull(),
  
  // Status
  status: statusEnum.default("reservada").notNull(),
  
  // Datas
  dataReserva: timestamp("dataReserva").defaultNow().notNull(),
  dataExpiracao: timestamp("dataExpiracao").notNull(), // 24h após agendamento
  dataAplicacao: timestamp("dataAplicacao"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("vres_tenant_idx").on(table.tenantId),
  apptIdx: index("vres_appt_idx").on(table.appointmentId),
  vaccineIdx: index("vres_vaccine_idx").on(table.vaccineId),
  statusIdx: index("vres_status_idx").on(table.status),
  expiracaoIdx: index("vres_expiracao_idx").on(table.dataExpiracao),
}));

export type VaccineReservation = typeof vaccineReservations.$inferSelect;
export type InsertVaccineReservation = typeof vaccineReservations.$inferInsert;
