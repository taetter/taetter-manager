import { router } from "../_core/trpc";
import { tenantProcedure } from "../tenantMiddleware";
import { z } from "zod";
import { getDb } from "../db";
import { 
  healthEstablishments, 
  rndsCredentials, 
  fiscalConfigurations,
  integrationOutbox,
  integrationLogs,
  integrationStats
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export const integrationsRouter = router({
  // ============================================
  // DASHBOARD
  // ============================================
  dashboard: tenantProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      // Contar estabelecimentos
      const [{ count: totalEstabelecimentos }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(healthEstablishments)
        .where(eq(healthEstablishments.tenantId, input.tenantId));
      
      // Contar credenciais RNDS ativas
      const [{ count: credenciaisRNDS }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(rndsCredentials)
        .where(and(
          eq(rndsCredentials.tenantId, input.tenantId),
          eq(rndsCredentials.ativo, true)
        ));
      
      // Contar configurações fiscais ativas
      const [{ count: configsFiscais }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(fiscalConfigurations)
        .where(and(
          eq(fiscalConfigurations.tenantId, input.tenantId),
          eq(fiscalConfigurations.ativo, true)
        ));
      
      // Backlog da fila
      const [{ count: backlog }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(integrationOutbox)
        .where(and(
          eq(integrationOutbox.tenantId, input.tenantId),
          eq(integrationOutbox.status, "pendente")
        ));
      
      // Estatísticas do dia (RNDS)
      const hoje = new Date().toISOString().split('T')[0];
      const statsRNDS = await db
        .select()
        .from(integrationStats)
        .where(and(
          eq(integrationStats.tenantId, input.tenantId),
          eq(integrationStats.data, hoje),
          eq(integrationStats.tipoIntegracao, "rnds_ria")
        ))
        .limit(1);
      
      // Estatísticas do dia (NFS-e)
      const statsNFSe = await db
        .select()
        .from(integrationStats)
        .where(and(
          eq(integrationStats.tenantId, input.tenantId),
          eq(integrationStats.data, hoje),
          eq(integrationStats.tipoIntegracao, "nfse")
        ))
        .limit(1);
      
      return {
        totalEstabelecimentos: Number(totalEstabelecimentos) || 0,
        credenciaisRNDS: Number(credenciaisRNDS) || 0,
        configsFiscais: Number(configsFiscais) || 0,
        backlog: Number(backlog) || 0,
        rnds: statsRNDS[0] || {
          totalEnviados: 0,
          totalAceitos: 0,
          totalRejeitados: 0,
          taxaSucessoPercent: 0,
          latenciaP95Ms: 0,
        },
        nfse: statsNFSe[0] || {
          totalEnviados: 0,
          totalAceitos: 0,
          totalRejeitados: 0,
          taxaSucessoPercent: 0,
          latenciaP95Ms: 0,
        },
      };
    }),

  // ============================================
  // ESTABELECIMENTOS / CNES
  // ============================================
  establishments: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        return await db
          .select()
          .from(healthEstablishments)
          .where(eq(healthEstablishments.tenantId, input.tenantId))
          .orderBy(desc(healthEstablishments.createdAt));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        cnes: z.string().length(7),
        nomeFantasia: z.string(),
        razaoSocial: z.string(),
        cnpj: z.string().length(14),
        logradouro: z.string(),
        numero: z.string(),
        complemento: z.string().optional(),
        bairro: z.string(),
        municipio: z.string(),
        uf: z.string().length(2),
        cep: z.string().length(8),
        responsavelNome: z.string().optional(),
        responsavelCPF: z.string().optional(),
        responsavelCNS: z.string().optional(),
        responsavelEmail: z.string().optional(),
        responsavelTelefone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const [result] = await db.insert(healthEstablishments).values(input);
        return { id: result.insertId };
      }),

    update: tenantProcedure
      .input(z.object({
        id: z.number(),
        tenantId: z.number(),
        nomeFantasia: z.string().optional(),
        razaoSocial: z.string().optional(),
        logradouro: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        municipio: z.string().optional(),
        uf: z.string().optional(),
        cep: z.string().optional(),
        responsavelNome: z.string().optional(),
        responsavelCPF: z.string().optional(),
        responsavelCNS: z.string().optional(),
        responsavelEmail: z.string().optional(),
        responsavelTelefone: z.string().optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, tenantId, ...data } = input;
        await db
          .update(healthEstablishments)
          .set(data)
          .where(and(
            eq(healthEstablishments.id, id),
            eq(healthEstablishments.tenantId, tenantId)
          ));
        return { success: true };
      }),
  }),

  // ============================================
  // CREDENCIAIS RNDS
  // ============================================
  rnds: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        return await db
          .select()
          .from(rndsCredentials)
          .where(eq(rndsCredentials.tenantId, input.tenantId))
          .orderBy(desc(rndsCredentials.createdAt));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        establishmentId: z.number(),
        ambiente: z.enum(["homologacao", "producao"]),
        clientId: z.string(),
        clientSecret: z.string(),
        authUrl: z.string().optional(),
        apiUrl: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        // TODO: Criptografar clientId e clientSecret antes de salvar
        const [result] = await db.insert(rndsCredentials).values(input);
        return { id: result.insertId };
      }),

    update: tenantProcedure
      .input(z.object({
        id: z.number(),
        tenantId: z.number(),
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        authUrl: z.string().optional(),
        apiUrl: z.string().optional(),
        ativo: z.boolean().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        const { id, tenantId, ...data } = input;
        await db
          .update(rndsCredentials)
          .set(data)
          .where(and(
            eq(rndsCredentials.id, id),
            eq(rndsCredentials.tenantId, tenantId)
          ));
        return { success: true };
      }),
  }),

  // ============================================
  // CONFIGURAÇÕES FISCAIS
  // ============================================
  fiscal: router({
    list: tenantProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        return await db
          .select()
          .from(fiscalConfigurations)
          .where(eq(fiscalConfigurations.tenantId, input.tenantId))
          .orderBy(desc(fiscalConfigurations.createdAt));
      }),

    create: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        establishmentId: z.number(),
        tipoNota: z.enum(["nfse", "nfe", "nfce"]),
        inscricaoMunicipal: z.string().optional(),
        inscricaoEstadual: z.string().optional(),
        regimeTributario: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]).optional(),
        cnae: z.string().optional(),
        aliquotaISS: z.string().optional(),
        aliquotaPIS: z.string().optional(),
        aliquotaCOFINS: z.string().optional(),
        ambiente: z.enum(["homologacao", "producao"]),
        endpointEmissao: z.string().optional(),
        endpointConsulta: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        // TODO: Criptografar certificado e senha antes de salvar
        const [result] = await db.insert(fiscalConfigurations).values(input);
        return { id: result.insertId };
      }),
  }),

  // ============================================
  // FILA DE ENVIOS (OUTBOX)
  // ============================================
  outbox: router({
    list: tenantProcedure
      .input(z.object({ 
        tenantId: z.number(),
        status: z.enum(["pendente", "enviando", "enviado", "aceito", "rejeitado", "erro"]).optional(),
        tipoIntegracao: z.enum(["rnds_ria", "nfse", "nfe", "nfce"]).optional(),
      }))
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [eq(integrationOutbox.tenantId, input.tenantId)];
        
        if (input.status) {
          conditions.push(eq(integrationOutbox.status, input.status));
        }
        
        if (input.tipoIntegracao) {
          conditions.push(eq(integrationOutbox.tipoIntegracao, input.tipoIntegracao));
        }
        
        return await db
          .select()
          .from(integrationOutbox)
          .where(and(...conditions))
          .orderBy(desc(integrationOutbox.createdAt))
          .limit(100);
      }),

    retry: tenantProcedure
      .input(z.object({
        id: z.number(),
        tenantId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db
          .update(integrationOutbox)
          .set({
            status: "pendente",
            proximaTentativa: new Date(),
          })
          .where(and(
            eq(integrationOutbox.id, input.id),
            eq(integrationOutbox.tenantId, input.tenantId)
          ));
        return { success: true };
      }),
  }),

  // ============================================
  // ESTATÍSTICAS
  // ============================================
  stats: router({
    daily: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        dataInicio: z.string(),
        dataFim: z.string(),
        tipoIntegracao: z.enum(["rnds_ria", "nfse", "nfe", "nfce"]).optional(),
      }))
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [
          eq(integrationStats.tenantId, input.tenantId),
          gte(integrationStats.data, input.dataInicio),
          lte(integrationStats.data, input.dataFim),
        ];
        
        if (input.tipoIntegracao) {
          conditions.push(eq(integrationStats.tipoIntegracao, input.tipoIntegracao));
        }
        
        return await db
          .select()
          .from(integrationStats)
          .where(and(...conditions))
          .orderBy(integrationStats.data);
      }),
  }),
});
