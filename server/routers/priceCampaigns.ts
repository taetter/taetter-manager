import { z } from "zod";
import { router } from "../_core/trpc";
import { tenantProcedure } from "../tenantMiddleware";
import { getDb } from "../db";
import { priceCampaigns } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const priceCampaignsRouter = router({
  // Listar campanhas
  list: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      let conditions = [eq(priceCampaigns.tenantId, tenantId)];

      if (input.ativo !== undefined) {
        conditions.push(eq(priceCampaigns.ativo, input.ativo));
      }

      const campaigns = await db
        .select()
        .from(priceCampaigns)
        .where(and(...conditions))
        .orderBy(desc(priceCampaigns.createdAt));

      return campaigns;
    }),

  // Buscar campanha por ID
  getById: tenantProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      const [campaign] = await db
        .select()
        .from(priceCampaigns)
        .where(and(eq(priceCampaigns.id, input.id), eq(priceCampaigns.tenantId, tenantId)))
        .limit(1);

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campanha não encontrada" });
      }

      return campaign;
    }),

  // Criar campanha
  create: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        nome: z.string().min(1),
        descricao: z.string().optional(),
        tipoDesconto: z.enum(["percentual", "valor_fixo"]),
        valorDesconto: z.number().min(0),
        vaccineIds: z.array(z.number()).optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
        ativo: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      // Validar datas
      const dataInicio = new Date(input.dataInicio);
      const dataFim = new Date(input.dataFim);

      if (dataFim <= dataInicio) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data de fim deve ser posterior à data de início",
        });
      }

      // Validar desconto percentual
      if (input.tipoDesconto === "percentual" && input.valorDesconto > 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Desconto percentual não pode ser maior que 100%",
        });
      }

      const result = await db.insert(priceCampaigns).values({
        tenantId,
        nome: input.nome,
        descricao: input.descricao || null,
        tipoDesconto: input.tipoDesconto,
        valorDesconto: input.valorDesconto,
        vaccineIds: input.vaccineIds || null,
        dataInicio,
        dataFim,
        ativo: input.ativo,
      });

      return { id: Number((result as any).insertId) };
    }),

  // Atualizar campanha
  update: tenantProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        tipoDesconto: z.enum(["percentual", "valor_fixo"]).optional(),
        valorDesconto: z.number().min(0).optional(),
        vaccineIds: z.array(z.number()).optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      const updateData: any = {};

      if (input.nome) updateData.nome = input.nome;
      if (input.descricao !== undefined) updateData.descricao = input.descricao;
      if (input.tipoDesconto) updateData.tipoDesconto = input.tipoDesconto;
      if (input.valorDesconto !== undefined) updateData.valorDesconto = input.valorDesconto;
      if (input.vaccineIds !== undefined) updateData.vaccineIds = input.vaccineIds;
      if (input.dataInicio) updateData.dataInicio = new Date(input.dataInicio);
      if (input.dataFim) updateData.dataFim = new Date(input.dataFim);
      if (input.ativo !== undefined) updateData.ativo = input.ativo;

      // Validar desconto percentual
      if (
        updateData.tipoDesconto === "percentual" &&
        updateData.valorDesconto !== undefined &&
        updateData.valorDesconto > 100
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Desconto percentual não pode ser maior que 100%",
        });
      }

      await db
        .update(priceCampaigns)
        .set(updateData)
        .where(and(eq(priceCampaigns.id, input.id), eq(priceCampaigns.tenantId, tenantId)));

      return { success: true };
    }),

  // Deletar campanha
  delete: tenantProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      await db
        .delete(priceCampaigns)
        .where(and(eq(priceCampaigns.id, input.id), eq(priceCampaigns.tenantId, tenantId)));

      return { success: true };
    }),

  // Ativar/Desativar campanha
  toggleActive: tenantProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
        ativo: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant ID is required" });

      await db
        .update(priceCampaigns)
        .set({ ativo: input.ativo })
        .where(and(eq(priceCampaigns.id, input.id), eq(priceCampaigns.tenantId, tenantId)));

      return { success: true };
    }),
});
