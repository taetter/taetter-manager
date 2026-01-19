import { z } from "zod";
import { router } from "../_core/trpc.js";
import { tenantProcedure } from "../tenantMiddleware.js";
import { getDb } from "../db.js";
import { 
  pops, 
  regulatoryDocuments, 
  auditChecklists,
  occurrences,
  temperatureMonitoring,
  maintenanceRecords,
  trainingRecords 
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const qualityRouter = router({
  // ============================================
  // DASHBOARD - Estatísticas Gerais
  // ============================================
  dashboard: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // POPs ativos
      const popsAtivos = await db
        .select()
        .from(pops)
        .where(and(eq(pops.tenantId, input.tenantId), eq(pops.status, "ativo")));

      // Documentos regulatórios válidos
      const docsValidos = await db
        .select()
        .from(regulatoryDocuments)
        .where(and(eq(regulatoryDocuments.tenantId, input.tenantId), eq(regulatoryDocuments.status, "valido")));

      // Ocorrências abertas
      const ocorrenciasAbertas = await db
        .select()
        .from(occurrences)
        .where(and(eq(occurrences.tenantId, input.tenantId), eq(occurrences.status, "aberta")));

      // Temperaturas fora do padrão (últimas 24h)
      const tempForaPadrao = await db.execute(sql`
        SELECT COUNT(*) as total
        FROM temperatureMonitoring
        WHERE tenantId = ${input.tenantId}
          AND dentroDoLimite = false
          AND dataHoraRegistro >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);

      // Manutenções pendentes
      const manutencoesPendentes = await db
        .select()
        .from(maintenanceRecords)
        .where(and(
          eq(maintenanceRecords.tenantId, input.tenantId),
          eq(maintenanceRecords.status, "agendada")
        ));

      return {
        popsAtivos: popsAtivos.length,
        documentosValidos: docsValidos.length,
        ocorrenciasAbertas: ocorrenciasAbertas.length,
        temperaturasForaPadrao: Number((tempForaPadrao as any).rows?.[0]?.total || 0),
        manutencoesPendentes: manutencoesPendentes.length,
      };
    }),

  // ============================================
  // POPs
  // ============================================
  pops: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db
          .select()
          .from(pops)
          .where(eq(pops.tenantId, input.tenantId))
          .orderBy(desc(pops.createdAt));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        codigo: z.string(),
        titulo: z.string(),
        versao: z.string(),
        objetivo: z.string(),
        procedimento: z.string(),
        dataElaboracao: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.execute(sql`
          INSERT INTO pops (tenantId, codigo, titulo, versao, objetivo, procedimento, dataElaboracao, status)
          VALUES (${input.tenantId}, ${input.codigo}, ${input.titulo}, ${input.versao}, ${input.objetivo}, ${input.procedimento}, ${input.dataElaboracao}, 'ativo')
        `);

        return { success: true };
      }),
  }),

  // ============================================
  // Documentação Regulatória
  // ============================================
  regulatoryDocs: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db
          .select()
          .from(regulatoryDocuments)
          .where(eq(regulatoryDocuments.tenantId, input.tenantId))
          .orderBy(desc(regulatoryDocuments.dataValidade));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        tipo: z.enum(["alvara", "licenca", "certificado", "laudo", "protocolo", "outro"]),
        numero: z.string(),
        orgaoEmissor: z.string(),
        titulo: z.string(),
        dataEmissao: z.string(),
        dataValidade: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.execute(sql`
          INSERT INTO regulatoryDocuments (tenantId, tipo, numero, orgaoEmissor, titulo, dataEmissao, dataValidade, status)
          VALUES (${input.tenantId}, ${input.tipo}, ${input.numero}, ${input.orgaoEmissor}, ${input.titulo}, ${input.dataEmissao}, ${input.dataValidade || null}, 'valido')
        `);

        return { success: true };
      }),
  }),

  // ============================================
  // Auditorias
  // ============================================
  audits: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db
          .select()
          .from(auditChecklists)
          .where(eq(auditChecklists.tenantId, input.tenantId))
          .orderBy(desc(auditChecklists.dataPrevista));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        tipo: z.enum(["vigilancia_sanitaria", "acreditacao", "interna", "fornecedor", "outro"]),
        titulo: z.string(),
        dataPrevista: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.execute(sql`
          INSERT INTO auditChecklists (tenantId, tipo, titulo, dataPrevista, status)
          VALUES (${input.tenantId}, ${input.tipo}, ${input.titulo}, ${input.dataPrevista || null}, 'pendente')
        `);

        return { success: true };
      }),
  }),

  // ============================================
  // Ocorrências / Contatos
  // ============================================
  occurrences: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        tipo: z.enum(["reacao_pos_vacinal", "efeito_adverso", "reclamacao", "sugestao", "elogio", "outro"]).optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const conditions = [eq(occurrences.tenantId, input.tenantId)];
        if (input.tipo) {
          conditions.push(eq(occurrences.tipo, input.tipo));
        }

        return await db
          .select()
          .from(occurrences)
          .where(and(...conditions))
          .orderBy(desc(occurrences.dataOcorrencia));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        tipo: z.enum(["reacao_pos_vacinal", "efeito_adverso", "reclamacao", "sugestao", "elogio", "outro"]),
        titulo: z.string(),
        descricao: z.string(),
        pacienteId: z.number().optional(),
        vaccineApplicationId: z.number().optional(),
        gravidade: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.execute(sql`
          INSERT INTO occurrences (tenantId, tipo, titulo, descricao, pacienteId, vaccineApplicationId, gravidade, dataOcorrencia, status)
          VALUES (${input.tenantId}, ${input.tipo}, ${input.titulo}, ${input.descricao}, ${input.pacienteId || null}, ${input.vaccineApplicationId || null}, ${input.gravidade}, NOW(), 'aberta')
        `);

        return { success: true };
      }),
  }),

  // ============================================
  // Monitoramento de Temperaturas
  // ============================================
  temperatures: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        equipamentoId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const conditions = [eq(temperatureMonitoring.tenantId, input.tenantId)];
        if (input.equipamentoId) {
          conditions.push(eq(temperatureMonitoring.equipamentoId, input.equipamentoId));
        }

        return await db
          .select()
          .from(temperatureMonitoring)
          .where(and(...conditions))
          .orderBy(desc(temperatureMonitoring.dataHoraRegistro))
          .limit(100);
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        tipoEquipamento: z.enum(["geladeira", "caixa_transporte", "freezer", "camara_fria"]),
        equipamentoId: z.number().optional(),
        nomeEquipamento: z.string(),
        temperatura: z.number(),
        limiteInferior: z.number().default(2),
        limiteSuperior: z.number().default(8),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const dentroDoLimite = input.temperatura >= input.limiteInferior && input.temperatura <= input.limiteSuperior;

        await db.execute(sql`
          INSERT INTO temperatureMonitoring (
            tenantId, tipoEquipamento, equipamentoId, nomeEquipamento, 
            temperatura, limiteInferior, limiteSuperior, dentroDoLimite
          )
          VALUES (
            ${input.tenantId}, ${input.tipoEquipamento}, ${input.equipamentoId || null}, ${input.nomeEquipamento},
            ${input.temperatura}, ${input.limiteInferior}, ${input.limiteSuperior}, ${dentroDoLimite}
          )
        `);

        return { success: true, dentroDoLimite };
      }),
  }),

  // ============================================
  // Manutenções
  // ============================================
  maintenances: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db
          .select()
          .from(maintenanceRecords)
          .where(eq(maintenanceRecords.tenantId, input.tenantId))
          .orderBy(desc(maintenanceRecords.dataPrevista));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        tipoEquipamento: z.enum(["geladeira", "freezer", "ar_condicionado", "gerador", "computador", "impressora", "outro"]),
        nomeEquipamento: z.string(),
        tipoManutencao: z.enum(["preventiva", "corretiva", "preditiva"]),
        titulo: z.string(),
        descricao: z.string(),
        dataPrevista: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.execute(sql`
          INSERT INTO maintenanceRecords (tenantId, tipoEquipamento, nomeEquipamento, tipoManutencao, titulo, descricao, dataPrevista, status)
          VALUES (${input.tenantId}, ${input.tipoEquipamento}, ${input.nomeEquipamento}, ${input.tipoManutencao}, ${input.titulo}, ${input.descricao}, ${input.dataPrevista || null}, 'agendada')
        `);

        return { success: true };
      }),
  }),

  // ============================================
  // Treinamentos
  // ============================================
  trainings: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        return await db
          .select()
          .from(trainingRecords)
          .where(eq(trainingRecords.tenantId, input.tenantId))
          .orderBy(desc(trainingRecords.dataRealizacao));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        titulo: z.string(),
        tipo: z.enum(["admissao", "reciclagem", "capacitacao", "workshop", "palestra", "curso", "outro"]),
        dataRealizacao: z.string(),
        cargaHoraria: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.execute(sql`
          INSERT INTO trainingRecords (tenantId, titulo, tipo, dataRealizacao, cargaHoraria, status)
          VALUES (${input.tenantId}, ${input.titulo}, ${input.tipo}, ${input.dataRealizacao}, ${input.cargaHoraria || null}, 'realizado')
        `);

        return { success: true };
      }),
  }),
});
