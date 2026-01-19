import { z } from "zod";
import { router } from "../_core/trpc.js";
import { tenantProcedure } from "../tenantMiddleware.js";
import { getDb } from "../db.js";
import { vaccines } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const vaccinesRouter = router({
  // Listar vacinas
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
        .from(vaccines)
        .where(eq(vaccines.tenantId, tenantId))
        .orderBy(desc(vaccines.id));
    }),

  // Buscar vacina por ID
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

      const result = await db
        .select()
        .from(vaccines)
        .where(and(eq(vaccines.id, input.id), eq(vaccines.tenantId, tenantId)))
        .limit(1);
      
      return result[0] || null;
    }),

  // Criar vacina
  create: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      nome: z.string(),
      nomeFantasia: z.string().optional(),
      fabricante: z.string().optional(),
      marca: z.string().optional(),
      lote: z.string(),
      dataValidade: z.date().optional(),
      codigoBarras: z.string().optional(),
      estoqueMinimo: z.number().optional(),
      bula: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const result = await db.insert(vaccines).values({
        tenantId: input.tenantId,
        nome: input.nome,
        nomeFantasia: input.nomeFantasia || null,
        fabricante: input.fabricante || null,
        marca: input.marca || null,
        lote: input.lote,
        validade: input.dataValidade || new Date(),
        codigoBarras: input.codigoBarras || null,
        estoqueMinimo: input.estoqueMinimo || 10,
        bula: input.bula || null,
      });

      return { success: true, id: Number((result as any).insertId) };
    }),

  // Atualizar vacina
  update: tenantProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      nome: z.string(),
      nomeFantasia: z.string().optional(),
      fabricante: z.string().optional(),
      marca: z.string().optional(),
      lote: z.string(),
      dataValidade: z.date().optional(),
      codigoBarras: z.string().optional(),
      estoqueMinimo: z.number().optional(),
      bula: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      await db
        .update(vaccines)
        .set({
          nome: input.nome,
          nomeFantasia: input.nomeFantasia || null,
          fabricante: input.fabricante || null,
          marca: input.marca || null,
          lote: input.lote,
          validade: input.dataValidade || new Date(),
          codigoBarras: input.codigoBarras || null,
          estoqueMinimo: input.estoqueMinimo || 10,
          bula: input.bula || null,
        })
        .where(and(eq(vaccines.id, input.id), eq(vaccines.tenantId, input.tenantId)));

      return { success: true };
    }),

  // Deletar vacina
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

      await db
        .delete(vaccines)
        .where(and(eq(vaccines.id, input.id), eq(vaccines.tenantId, tenantId)));
      
      return { success: true };
    }),

  // Transferir estoque entre geladeiras
  transfer: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        vaccineId: z.number(),
        fromRefrigeratorId: z.number(),
        toRefrigeratorId: z.number(),
        quantidade: z.number().positive(),
        observacoes: z.string().optional(),
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

      // Buscar vacina de origem
      const [vaccine] = await db
        .select()
        .from(vaccines)
        .where(
          and(
            eq(vaccines.id, input.vaccineId),
            eq(vaccines.tenantId, tenantId),
            eq(vaccines.refrigeratorId, input.fromRefrigeratorId)
          )
        )
        .limit(1);

      if (!vaccine) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacina não encontrada na geladeira de origem",
        });
      }

      if (vaccine.quantidadeDisponivel < input.quantidade) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Estoque insuficiente. Disponível: ${vaccine.quantidadeDisponivel}`,
        });
      }

      // Atualizar quantidade na origem
      await db
        .update(vaccines)
        .set({
          quantidadeDisponivel: vaccine.quantidadeDisponivel - input.quantidade,
          quantidadeTotal: vaccine.quantidadeTotal - input.quantidade,
        })
        .where(eq(vaccines.id, input.vaccineId));

      // Verificar se já existe a mesma vacina (mesmo lote) na geladeira de destino
      const [targetVaccine] = await db
        .select()
        .from(vaccines)
        .where(
          and(
            eq(vaccines.tenantId, tenantId),
            eq(vaccines.refrigeratorId, input.toRefrigeratorId),
            eq(vaccines.lote, vaccine.lote),
            eq(vaccines.nome, vaccine.nome)
          )
        )
        .limit(1);

      if (targetVaccine) {
        // Atualizar vacina existente no destino
        await db
          .update(vaccines)
          .set({
            quantidadeDisponivel: targetVaccine.quantidadeDisponivel + input.quantidade,
            quantidadeTotal: targetVaccine.quantidadeTotal + input.quantidade,
          })
          .where(eq(vaccines.id, targetVaccine.id));
      } else {
        // Criar nova entrada na geladeira de destino
        await db.insert(vaccines).values({
          tenantId,
          refrigeratorId: input.toRefrigeratorId,
          nome: vaccine.nome,
          nomeFantasia: vaccine.nomeFantasia,
          fabricante: vaccine.fabricante,
          marca: vaccine.marca,
          lote: vaccine.lote,
          codigoBarras: vaccine.codigoBarras,
          validade: vaccine.validade,
          categoria: vaccine.categoria,
          doencas: vaccine.doencas,
          quantidadeTotal: input.quantidade,
          quantidadeDisponivel: input.quantidade,
          quantidadeReservada: 0,
          estoqueMinimo: vaccine.estoqueMinimo,
          precoCompra: vaccine.precoCompra,
          precoVenda: vaccine.precoVenda,
          temperaturaMin: vaccine.temperaturaMin,
          temperaturaMax: vaccine.temperaturaMax,
        });
      }

      return { success: true, message: "Transferência realizada com sucesso" };
    }),
});
