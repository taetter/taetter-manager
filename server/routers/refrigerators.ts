import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { refrigerators } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const refrigeratorsRouter = router({
  /**
   * List all refrigerators for a unit
   */
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        unitId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { tenantId, unitId } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const conditions = [eq(refrigerators.tenantId, tenantId)];
      if (unitId) {
        conditions.push(eq(refrigerators.unitId, unitId));
      }

      const refrigeratorsList = await db
        .select()
        .from(refrigerators)
        .where(and(...conditions))
        .orderBy(desc(refrigerators.createdAt));

      return refrigeratorsList;
    }),

  /**
   * Get refrigerator by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { id, tenantId } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [refrigerator] = await db
        .select()
        .from(refrigerators)
        .where(and(eq(refrigerators.id, id), eq(refrigerators.tenantId, tenantId)))
        .limit(1);

      if (!refrigerator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Geladeira não encontrada",
        });
      }

      return refrigerator;
    }),

  /**
   * Create new refrigerator
   */
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        unitId: z.number(),
        nome: z.string().min(1),
        modelo: z.string().optional(),
        numeroSerie: z.string().optional(),
        temperaturaMin: z.string().optional(),
        temperaturaMax: z.string().optional(),
        temperaturaAtual: z.string().optional(),
        capacidadeLitros: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [newRefrigerator] = await db.insert(refrigerators).values(input).$returningId();

      return { id: newRefrigerator.id };
    }),

  /**
   * Update refrigerator
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
        nome: z.string().min(1).optional(),
        modelo: z.string().optional(),
        numeroSerie: z.string().optional(),
        temperaturaMin: z.string().optional(),
        temperaturaMax: z.string().optional(),
        temperaturaAtual: z.string().optional(),
        capacidadeLitros: z.number().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tenantId, ...updateData } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(refrigerators)
        .set(updateData)
        .where(and(eq(refrigerators.id, id), eq(refrigerators.tenantId, tenantId)));

      return { success: true };
    }),

  /**
   * Delete refrigerator (soft delete)
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tenantId } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(refrigerators)
        .set({ ativo: false })
        .where(and(eq(refrigerators.id, id), eq(refrigerators.tenantId, tenantId)));

      return { success: true };
    }),
});
