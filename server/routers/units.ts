import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { units } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const unitsRouter = router({
  /**
   * List all units for a tenant
   */
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { tenantId } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const unitsList = await db
        .select()
        .from(units)
        .where(eq(units.tenantId, tenantId))
        .orderBy(desc(units.createdAt));

      return unitsList;
    }),

  /**
   * Get unit by ID
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

      const [unit] = await db
        .select()
        .from(units)
        .where(and(eq(units.id, id), eq(units.tenantId, tenantId)))
        .limit(1);

      if (!unit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unidade não encontrada",
        });
      }

      return unit;
    }),

  /**
   * Create new unit
   */
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        nome: z.string().min(1),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        telefone: z.string().optional(),
        responsavel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [newUnit] = await db.insert(units).values(input).$returningId();

      return { id: newUnit.id };
    }),

  /**
   * Update unit
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
        nome: z.string().min(1).optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        telefone: z.string().optional(),
        responsavel: z.string().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tenantId, ...updateData } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(units)
        .set(updateData)
        .where(and(eq(units.id, id), eq(units.tenantId, tenantId)));

      return { success: true };
    }),

  /**
   * Delete unit (soft delete)
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
        .update(units)
        .set({ ativo: false })
        .where(and(eq(units.id, id), eq(units.tenantId, tenantId)));

      return { success: true };
    }),
});
