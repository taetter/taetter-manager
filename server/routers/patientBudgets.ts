import { z } from "zod";
import { router } from "../_core/trpc.js";
import { tenantProcedure } from "../tenantMiddleware.js";
import { getDb } from "../db.js";
import { budgets, vaccines, vaccinePrices, priceCampaigns } from "../../drizzle/schema";
import { eq, and, desc, lte, gte, or, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const patientBudgetsRouter = router({
  // Listar orçamentos
  list: tenantProcedure
    .input(z.object({
      tenantId: z.number().optional(),
      status: z.enum(["pendente", "aprovado", "convertido", "expirado", "cancelado"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      const where = input.status
        ? and(eq(budgets.tenantId, tenantId), eq(budgets.status, input.status))
        : eq(budgets.tenantId, tenantId);

      return db.select().from(budgets).where(where).orderBy(desc(budgets.createdAt));
    }),

  // Buscar orçamento por número
  getByNumber: tenantProcedure
    .input(z.object({
      tenantId: z.number().optional(),
      numero: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      const [budget] = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.tenantId, tenantId), eq(budgets.numero, input.numero)));

      return budget || null;
    }),

  // Calcular preço de vacinas (com campanhas ativas)
  calculatePrice: tenantProcedure
    .input(z.object({
      tenantId: z.number().optional(),
      vaccineIds: z.array(z.number()),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      const hoje = new Date();
      const results = [];

      for (const vaccineId of input.vaccineIds) {
        // Buscar vacina
        const [vaccine] = await db.select().from(vaccines).where(eq(vaccines.id, vaccineId));
        if (!vaccine) continue;

        // Buscar preço ativo
        const [price] = await db
          .select()
          .from(vaccinePrices)
          .where(
            and(
              eq(vaccinePrices.tenantId, tenantId),
              eq(vaccinePrices.vaccineId, vaccineId),
              eq(vaccinePrices.ativo, true),
              lte(vaccinePrices.dataInicio, hoje),
              or(isNull(vaccinePrices.dataFim), gte(vaccinePrices.dataFim, hoje))
            )
          )
          .orderBy(desc(vaccinePrices.dataInicio))
          .limit(1);

        if (!price) {
          results.push({
            vaccineId,
            vaccineName: vaccine.nome,
            preco: 0,
            precoOriginal: 0,
            desconto: 0,
            campanhaId: null,
            campanhaNome: null,
            semPreco: true,
          });
          continue;
        }

        // Buscar campanha ativa aplicável
        const campaigns = await db
          .select()
          .from(priceCampaigns)
          .where(
            and(
              eq(priceCampaigns.tenantId, tenantId),
              eq(priceCampaigns.ativo, true),
              lte(priceCampaigns.dataInicio, hoje),
              gte(priceCampaigns.dataFim, hoje)
            )
          );

        let melhorCampanha = null;
        let maiorDesconto = 0;

        for (const campaign of campaigns) {
          // Verificar se vacina está incluída (null = todas)
          if (campaign.vaccineIds && !campaign.vaccineIds.includes(vaccineId)) continue;

          const desconto =
            campaign.tipoDesconto === "percentual"
              ? (price.preco * campaign.valorDesconto) / 100
              : campaign.valorDesconto;

          if (desconto > maiorDesconto) {
            maiorDesconto = desconto;
            melhorCampanha = campaign;
          }
        }

        const precoFinal = Math.max(0, price.preco - maiorDesconto);

        results.push({
          vaccineId,
          vaccineName: vaccine.nome,
          preco: precoFinal,
          precoOriginal: price.preco,
          desconto: maiorDesconto,
          campanhaId: melhorCampanha?.id || null,
          campanhaNome: melhorCampanha?.nome || null,
          semPreco: false,
        });
      }

      return results;
    }),

  // Criar orçamento
  create: tenantProcedure
    .input(z.object({
      tenantId: z.number().optional(),
      nome: z.string(),
      cpf: z.string().optional(),
      dataNascimento: z.string().optional(),
      email: z.string().email().optional(),
      celular: z.string().optional(),
      vaccineIds: z.array(z.number()),
      vaccineNames: z.string(),
      vaccineQuantities: z.array(z.number()).optional(),
      vaccinePrices: z.array(z.number()).optional(),
      valorTotal: z.number(),
      desconto: z.number().default(0),
      valorFinal: z.number(),
      dataValidade: z.string(),
      observacoes: z.string().optional(),
      status: z.enum(["pendente", "aprovado", "recusado", "convertido", "expirado", "cancelado"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      // Gerar número do orçamento
      const hoje = new Date();
      const dataStr = hoje.toISOString().slice(0, 10).replace(/-/g, "");
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const numero = `ORÇ-${dataStr}-${random}`;

      const result = await db.insert(budgets).values([{
        ...input,
        tenantId,
        numero,
        dataNascimento: input.dataNascimento ? new Date(input.dataNascimento) : null,
        dataValidade: new Date(input.dataValidade),
      }]);

      return { id: Number((result as any).insertId), numero };
    }),

  // Marcar como convertido
  markAsConverted: tenantProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number().optional(),
      applicationId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      await db
        .update(budgets)
        .set({
          status: "convertido",
          applicationId: input.applicationId,
          dataConversao: new Date(),
        })
        .where(and(eq(budgets.id, input.id), eq(budgets.tenantId, tenantId)));

      return { success: true };
    }),

  // Estatísticas de conversão
  getConversionStats: tenantProcedure
    .input(z.object({ tenantId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      const allBudgets = await db.select().from(budgets).where(eq(budgets.tenantId, tenantId));

      const total = allBudgets.length;
      const convertidos = allBudgets.filter((b) => b.status === "convertido").length;
      const pendentes = allBudgets.filter((b) => b.status === "pendente").length;

      const taxaConversao = total > 0 ? ((convertidos / total) * 100).toFixed(1) : "0.0";

      return {
        total,
        convertidos,
        pendentes,
        taxaConversao: parseFloat(taxaConversao),
      };
    }),
});
