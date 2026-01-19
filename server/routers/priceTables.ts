import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc.js";
import { priceTables } from "../../drizzle/schema";
import { getDb } from "../db.js";

export const priceTablesRouter = router({
  // Listar tabelas de preços
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        apenasAtivas: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      
      const conditions = [eq(priceTables.tenantId, input.tenantId)];
      
      if (input.apenasAtivas) {
        conditions.push(eq(priceTables.ativo, true));
      }
      
      const tables = await db
        .select()
        .from(priceTables)
        .where(and(...conditions))
        .orderBy(desc(priceTables.padrao), desc(priceTables.createdAt));
      
      return tables;
    }),

  // Buscar tabela por ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      
      const [table] = await db
        .select()
        .from(priceTables)
        .where(
          and(
            eq(priceTables.id, input.id),
            eq(priceTables.tenantId, input.tenantId)
          )
        )
        .limit(1);
      
      return table || null;
    }),

  // Buscar tabela padrão
  getDefault: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      
      const [table] = await db
        .select()
        .from(priceTables)
        .where(
          and(
            eq(priceTables.tenantId, input.tenantId),
            eq(priceTables.padrao, true),
            eq(priceTables.ativo, true)
          )
        )
        .limit(1);
      
      return table || null;
    }),

  // Criar tabela de preços
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        nome: z.string().min(1).max(255),
        descricao: z.string().optional(),
        padrao: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      
      // Se esta tabela for marcada como padrão, desmarcar outras
      if (input.padrao) {
        await db
          .update(priceTables)
          .set({ padrao: false })
          .where(eq(priceTables.tenantId, input.tenantId));
      }
      
      const [result] = await db.insert(priceTables).values({
        tenantId: input.tenantId,
        nome: input.nome,
        descricao: input.descricao || null,
        padrao: input.padrao || false,
        ativo: true,
      });
      
      return { id: Number(result.insertId) };
    }),

  // Atualizar tabela de preços
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
        nome: z.string().min(1).max(255).optional(),
        descricao: z.string().optional(),
        ativo: z.boolean().optional(),
        padrao: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      
      // Se esta tabela for marcada como padrão, desmarcar outras
      if (input.padrao) {
        await db
          .update(priceTables)
          .set({ padrao: false })
          .where(eq(priceTables.tenantId, input.tenantId));
      }
      
      const updateData: any = {};
      if (input.nome !== undefined) updateData.nome = input.nome;
      if (input.descricao !== undefined) updateData.descricao = input.descricao;
      if (input.ativo !== undefined) updateData.ativo = input.ativo;
      if (input.padrao !== undefined) updateData.padrao = input.padrao;
      
      await db
        .update(priceTables)
        .set(updateData)
        .where(
          and(
            eq(priceTables.id, input.id),
            eq(priceTables.tenantId, input.tenantId)
          )
        );
      
      return { success: true };
    }),

  // Deletar tabela de preços
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      
      await db
        .delete(priceTables)
        .where(
          and(
            eq(priceTables.id, input.id),
            eq(priceTables.tenantId, input.tenantId)
          )
        );
      
      return { success: true };
    }),

  // Definir tabela como padrão
  setAsDefault: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      
      // Desmarcar todas as tabelas como padrão
      await db
        .update(priceTables)
        .set({ padrao: false })
        .where(eq(priceTables.tenantId, input.tenantId));
      
      // Marcar a tabela selecionada como padrão
      await db
        .update(priceTables)
        .set({ padrao: true })
        .where(
          and(
            eq(priceTables.id, input.id),
            eq(priceTables.tenantId, input.tenantId)
          )
        );
      
      return { success: true };
    }),
});
