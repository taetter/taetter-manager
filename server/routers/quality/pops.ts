import { z } from "zod";
import { router } from "../../_core/trpc";
import { tenantProcedure } from "../../tenantMiddleware";
import { getDb } from "../../db";
import { pops } from "../../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const popsRouter = router({
  // Listar todos os POPs
  list: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      status: z.enum(["ativo", "revisao", "obsoleto"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const conditions = [eq(pops.tenantId, input.tenantId)];
      if (input.status) {
        conditions.push(eq(pops.status, input.status));
      }

      const popsList = await db
        .select()
        .from(pops)
        .where(and(...conditions))
        .orderBy(desc(pops.createdAt));

      return popsList;
    }),

  // Buscar POP por ID
  getById: tenantProcedure
    .input(z.object({
      id: z.number(),
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

      const [pop] = await db
        .select()
        .from(pops)
        .where(and(eq(pops.id, input.id), eq(pops.tenantId, input.tenantId)))
        .limit(1);

      if (!pop) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "POP não encontrado",
        });
      }

      return pop;
    }),

  // Criar novo POP
  create: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      codigo: z.string(),
      titulo: z.string(),
      versao: z.string(),
      objetivo: z.string(),
      aplicacao: z.string().optional(),
      responsavel: z.string().optional(),
      procedimento: z.string(),
      dataElaboracao: z.string(),
      dataRevisao: z.string().optional(),
      proximaRevisao: z.string().optional(),
      status: z.enum(["ativo", "revisao", "obsoleto"]).default("ativo"),
      arquivoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const result = await db.execute(sql`
        INSERT INTO pops (
          tenantId, codigo, titulo, versao, objetivo, aplicacao, responsavel,
          procedimento, dataElaboracao, dataRevisao, proximaRevisao, status, arquivoUrl
        )
        VALUES (
          ${input.tenantId}, ${input.codigo}, ${input.titulo}, ${input.versao},
          ${input.objetivo}, ${input.aplicacao || null}, ${input.responsavel || null},
          ${input.procedimento}, ${input.dataElaboracao}, ${input.dataRevisao || null},
          ${input.proximaRevisao || null}, ${input.status}, ${input.arquivoUrl || null}
        )
      `);

      return { id: (result as any).insertId, success: true };
    }),

  // Atualizar POP
  update: tenantProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      codigo: z.string().optional(),
      titulo: z.string().optional(),
      versao: z.string().optional(),
      objetivo: z.string().optional(),
      aplicacao: z.string().optional(),
      responsavel: z.string().optional(),
      procedimento: z.string().optional(),
      dataElaboracao: z.string().optional(),
      dataRevisao: z.string().optional(),
      proximaRevisao: z.string().optional(),
      status: z.enum(["ativo", "revisao", "obsoleto"]).optional(),
      arquivoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, tenantId, ...updateData } = input;

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Filtrar apenas campos que não são datas
      const { dataElaboracao, dataRevisao, proximaRevisao, ...safeData } = updateData;
      
      await db
        .update(pops)
        .set(safeData)
        .where(and(eq(pops.id, id), eq(pops.tenantId, tenantId)));
      
      // Atualizar datas separadamente se fornecidas
      if (dataElaboracao || dataRevisao || proximaRevisao) {
        const dateUpdates: string[] = [];
        if (dataElaboracao) dateUpdates.push(`dataElaboracao = '${dataElaboracao}'`);
        if (dataRevisao) dateUpdates.push(`dataRevisao = '${dataRevisao}'`);
        if (proximaRevisao) dateUpdates.push(`proximaRevisao = '${proximaRevisao}'`);
        
        if (dateUpdates.length > 0) {
          await db.execute(sql.raw(`
            UPDATE pops 
            SET ${dateUpdates.join(', ')}
            WHERE id = ${id} AND tenantId = ${tenantId}
          `));
        }
      }

      return { success: true };
    }),

  // Deletar POP
  delete: tenantProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
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
        .delete(pops)
        .where(and(eq(pops.id, input.id), eq(pops.tenantId, input.tenantId)));

      return { success: true };
    }),

  // Estatísticas de POPs
  stats: tenantProcedure
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

      const popsList = await db
        .select()
        .from(pops)
        .where(eq(pops.tenantId, input.tenantId));

      const total = popsList.length;
      const ativos = popsList.filter(p => p.status === "ativo").length;
      const emRevisao = popsList.filter(p => p.status === "revisao").length;
      const obsoletos = popsList.filter(p => p.status === "obsoleto").length;

      return {
        total,
        ativos,
        emRevisao,
        obsoletos,
      };
    }),
});
