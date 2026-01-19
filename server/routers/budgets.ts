import { z } from "zod";
import { router } from "../_core/trpc.js";
import { tenantProcedure } from "../tenantMiddleware.js";
import { getDb } from "../db.js";
import { quotations, quotationItems } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const budgetsRouter = router({
  // Listar orçamentos
  list: tenantProcedure
    .input(z.object({ tenantId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      return db
        .select()
        .from(quotations)
        .where(eq(quotations.tenantId, tenantId))
        .orderBy(desc(quotations.createdAt));
    }),

  // Buscar orçamento por ID com itens
  getById: tenantProcedure
    .input(z.object({ id: z.number(), tenantId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const quotation = await db
        .select()
        .from(quotations)
        .where(and(eq(quotations.id, input.id), eq(quotations.tenantId, tenantId)))
        .limit(1);
      
      if (!quotation[0]) return null;

      const items = await db
        .select()
        .from(quotationItems)
        .where(eq(quotationItems.quotationId, input.id));

      return {
        ...quotation[0],
        items,
      };
    }),

  // Criar orçamento
  create: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        fornecedor: z.string(),
        emailFornecedor: z.string().email().optional(),
        telefoneFornecedor: z.string().optional(),
        observacoes: z.string().optional(),
        items: z.array(
          z.object({
            nomeVacina: z.string(),
            fabricante: z.string().optional(),
            quantidade: z.number(),
            precoUnitario: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      const { items, ...quotationData } = input;

      // Criar orçamento
      const result = await db.insert(quotations).values([{
        ...quotationData,
        tenantId,
        numero: `ORC-${Date.now()}`,
        dataSolicitacao: new Date(),
        status: "pendente",
      }]);

      const quotationId = Number((result as any).insertId);

      // Criar itens do orçamento
      if (items.length > 0) {
        await db.insert(quotationItems).values(
          items.map((item) => ({
            quotationId,
            nomeVacina: item.nomeVacina,
            fabricante: item.fabricante,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario || '0',
          }))
        );
      }

      return { id: quotationId, success: true };
    }),

  // Atualizar status do orçamento
  updateStatus: tenantProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
        status: z.enum(["pendente", "enviado", "respondido", "aprovado", "rejeitado"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      await db
        .update(quotations)
        .set({ status: input.status })
        .where(and(eq(quotations.id, input.id), eq(quotations.tenantId, tenantId)));

      return { success: true };
    }),

  // Deletar orçamento
  delete: tenantProcedure
    .input(z.object({ id: z.number(), tenantId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const tenantId = input.tenantId || ctx.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant ID is required",
        });
      }

      // Deletar itens primeiro
      await db
        .delete(quotationItems)
        .where(eq(quotationItems.quotationId, input.id));

      // Deletar orçamento
      await db
        .delete(quotations)
        .where(and(eq(quotations.id, input.id), eq(quotations.tenantId, tenantId)));

      return { success: true };
    }),
});
