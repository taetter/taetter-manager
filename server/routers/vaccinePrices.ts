import { z } from "zod";
import { router } from "../_core/trpc";
import { tenantProcedure } from "../tenantMiddleware";
import { getDb } from "../db";
import { vaccinePrices, vaccines } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const vaccinePricesRouter = router({
  // Listar preços de vacinas
  list: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        vaccineId: z.number().optional(),
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

      let conditions = [eq(vaccinePrices.tenantId, tenantId)];

      if (input.vaccineId !== undefined) {
        conditions.push(eq(vaccinePrices.vaccineId, input.vaccineId));
      }

      if (input.ativo !== undefined) {
        conditions.push(eq(vaccinePrices.ativo, input.ativo));
      }

      const prices = await db
        .select({
          id: vaccinePrices.id,
          tenantId: vaccinePrices.tenantId,
          priceTableId: vaccinePrices.priceTableId,
          vaccineId: vaccinePrices.vaccineId,
          vaccineName: vaccines.nome,
          preco: vaccinePrices.preco,
          ativo: vaccinePrices.ativo,
          dataInicio: vaccinePrices.dataInicio,
          dataFim: vaccinePrices.dataFim,
          createdAt: vaccinePrices.createdAt,
          updatedAt: vaccinePrices.updatedAt,
        })
        .from(vaccinePrices)
        .leftJoin(vaccines, eq(vaccinePrices.vaccineId, vaccines.id))
        .where(and(...conditions))
        .orderBy(desc(vaccinePrices.createdAt));

      return prices;
    }),

  // Buscar preço por ID
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

      const [price] = await db
        .select()
        .from(vaccinePrices)
        .where(and(eq(vaccinePrices.id, input.id), eq(vaccinePrices.tenantId, tenantId)))
        .limit(1);

      if (!price) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Preço não encontrado" });
      }

      return price;
    }),

  // Criar preço
  create: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        priceTableId: z.number(),
        vaccineId: z.number(),
        preco: z.number().min(0),
        ativo: z.boolean().default(true),
        dataInicio: z.string(),
        dataFim: z.string().optional(),
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

      // Verificar se vacina existe
      const [vaccine] = await db
        .select()
        .from(vaccines)
        .where(and(eq(vaccines.id, input.vaccineId), eq(vaccines.tenantId, tenantId)))
        .limit(1);

      if (!vaccine) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vacina não encontrada" });
      }

      const result = await db.insert(vaccinePrices).values({
        tenantId,
        priceTableId: input.priceTableId,
        vaccineId: input.vaccineId,
        preco: input.preco,
        ativo: input.ativo,
        dataInicio: new Date(input.dataInicio),
        dataFim: input.dataFim ? new Date(input.dataFim) : null,
      });

      return { id: Number((result as any).insertId) };
    }),

  // Atualizar preço
  update: tenantProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
        preco: z.number().min(0).optional(),
        ativo: z.boolean().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
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

      if (input.preco !== undefined) updateData.preco = input.preco;
      if (input.ativo !== undefined) updateData.ativo = input.ativo;
      if (input.dataInicio) updateData.dataInicio = new Date(input.dataInicio);
      if (input.dataFim) updateData.dataFim = new Date(input.dataFim);

      await db
        .update(vaccinePrices)
        .set(updateData)
        .where(and(eq(vaccinePrices.id, input.id), eq(vaccinePrices.tenantId, tenantId)));

      return { success: true };
    }),

  // Deletar preço
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
        .delete(vaccinePrices)
        .where(and(eq(vaccinePrices.id, input.id), eq(vaccinePrices.tenantId, tenantId)));

      return { success: true };
    }),
});
