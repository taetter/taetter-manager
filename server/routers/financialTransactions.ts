import { z } from "zod";
import { router } from "../_core/trpc";
import { tenantProcedure } from "../tenantMiddleware";
import { getDb } from "../db";
import { financialTransactions, installments } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const financialTransactionsRouter = router({
  // Listar transações
  list: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      tipo: z.enum(["receita", "despesa"]).optional(),
      status: z.enum(["pendente", "pago", "cancelado", "estornado"]).optional(),
      conciliado: z.boolean().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const conditions = [eq(financialTransactions.tenantId, input.tenantId)];

      if (input.tipo) {
        conditions.push(eq(financialTransactions.tipo, input.tipo));
      }

      if (input.status) {
        conditions.push(eq(financialTransactions.status, input.status));
      }

      if (input.conciliado !== undefined) {
        conditions.push(eq(financialTransactions.conciliado, input.conciliado));
      }

      if (input.dataInicio) {
        conditions.push(sql`${financialTransactions.dataTransacao} >= ${input.dataInicio}`);
      }

      if (input.dataFim) {
        conditions.push(sql`${financialTransactions.dataTransacao} <= ${input.dataFim}`);
      }

      return db
        .select()
        .from(financialTransactions)
        .where(and(...conditions))
        .orderBy(desc(financialTransactions.dataTransacao))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // Buscar por ID
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

      const result = await db
        .select()
        .from(financialTransactions)
        .where(
          and(
            eq(financialTransactions.id, input.id),
            eq(financialTransactions.tenantId, input.tenantId)
          )
        )
        .limit(1);

      return result[0] || null;
    }),

  // Criar transação
  create: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      tipo: z.enum(["receita", "despesa"]),
      categoria: z.string(),
      metodoPagamento: z.enum(["dinheiro", "pix", "debito", "credito", "boleto"]),
      valor: z.string(),
      dataTransacao: z.string(),
      dataVencimento: z.string().optional(),
      pacienteId: z.number().optional(),
      vaccineApplicationId: z.number().optional(),
      descricao: z.string().optional(),
      observacoes: z.string().optional(),
      parcelado: z.boolean().default(false),
      numeroParcelas: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Criar transação
      const result = await db.insert(financialTransactions).values({
        tipo: input.tipo,
        categoria: input.categoria,
        metodoPagamento: input.metodoPagamento,
        valor: input.valor,
        dataTransacao: input.dataTransacao,
        dataVencimento: input.dataVencimento || null,
        pacienteId: input.pacienteId || null,
        vaccineApplicationId: input.vaccineApplicationId || null,
        descricao: input.descricao || null,
        observacoes: input.observacoes || null,
        parcelado: input.parcelado,
        numeroParcelas: input.numeroParcelas || null,
      } as any);

      const transactionId = Number((result as any).insertId);

      // Se for parcelado, criar as parcelas
      if (input.parcelado && input.numeroParcelas && input.numeroParcelas > 1) {
        const valorParcela = parseFloat(input.valor) / input.numeroParcelas;
        const dataBase = new Date(input.dataTransacao);

        for (let i = 1; i <= input.numeroParcelas; i++) {
          const dataVencimento = new Date(dataBase);
          dataVencimento.setMonth(dataVencimento.getMonth() + i);

          await db.execute(sql`
            INSERT INTO installments (tenantId, transactionId, numeroParcela, totalParcelas, valor, dataVencimento, status, createdAt, updatedAt)
            VALUES (${input.tenantId}, ${transactionId}, ${i}, ${input.numeroParcelas}, ${valorParcela.toFixed(2)}, ${dataVencimento.toISOString().split('T')[0]}, 'pendente', NOW(), NOW())
          `);
        }
      }

      return { success: true, id: transactionId };
    }),

  // Atualizar transação
  update: tenantProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      status: z.enum(["pendente", "pago", "cancelado", "estornado"]).optional(),
      valorPago: z.string().optional(),
      dataPagamento: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const updateData: any = {};
      if (input.status) updateData.status = input.status;
      if (input.valorPago) updateData.valorPago = input.valorPago;
      if (input.dataPagamento) updateData.dataPagamento = input.dataPagamento;
      if (input.observacoes !== undefined) updateData.observacoes = input.observacoes;

      await db
        .update(financialTransactions)
        .set(updateData)
        .where(
          and(
            eq(financialTransactions.id, input.id),
            eq(financialTransactions.tenantId, input.tenantId)
          )
        );

      return { success: true };
    }),

  // Conciliar transação
  reconcile: tenantProcedure
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
        .update(financialTransactions)
        .set({
          conciliado: true,
          dataConciliacao: new Date(),
        })
        .where(
          and(
            eq(financialTransactions.id, input.id),
            eq(financialTransactions.tenantId, input.tenantId)
          )
        );

      return { success: true };
    }),

  // Estatísticas
  stats: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const conditions = [eq(financialTransactions.tenantId, input.tenantId)];

      if (input.dataInicio) {
        conditions.push(sql`${financialTransactions.dataTransacao} >= ${input.dataInicio}`);
      }

      if (input.dataFim) {
        conditions.push(sql`${financialTransactions.dataTransacao} <= ${input.dataFim}`);
      }

      // Total de receitas
      const receitasResult = await db
        .select({
          total: sql<number>`SUM(${financialTransactions.valor})`,
        })
        .from(financialTransactions)
        .where(and(...conditions, eq(financialTransactions.tipo, "receita")));

      // Total de despesas
      const despesasResult = await db
        .select({
          total: sql<number>`SUM(${financialTransactions.valor})`,
        })
        .from(financialTransactions)
        .where(and(...conditions, eq(financialTransactions.tipo, "despesa")));

      // Transações pendentes
      const pendentesResult = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(financialTransactions)
        .where(and(...conditions, eq(financialTransactions.status, "pendente")));

      // Transações não conciliadas
      const naoConciliadasResult = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(financialTransactions)
        .where(and(...conditions, eq(financialTransactions.conciliado, false)));

      return {
        totalReceitas: Number(receitasResult[0]?.total || 0),
        totalDespesas: Number(despesasResult[0]?.total || 0),
        saldo: Number(receitasResult[0]?.total || 0) - Number(despesasResult[0]?.total || 0),
        transacoesPendentes: Number(pendentesResult[0]?.count || 0),
        transacoesNaoConciliadas: Number(naoConciliadasResult[0]?.count || 0),
      };
    }),

  // Deletar transação
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

      // Deletar parcelas associadas
      await db
        .delete(installments)
        .where(eq(installments.transactionId, input.id));

      // Deletar transação
      await db
        .delete(financialTransactions)
        .where(
          and(
            eq(financialTransactions.id, input.id),
            eq(financialTransactions.tenantId, input.tenantId)
          )
        );

      return { success: true };
    }),

  // Listar parcelas
  listInstallments: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      status: z.enum(["pendente", "pago", "atrasado", "cancelado"]).optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const conditions = [eq(installments.tenantId, input.tenantId)];

      if (input.status) {
        conditions.push(eq(installments.status, input.status));
      }

      if (input.dataInicio) {
        conditions.push(sql`${installments.dataVencimento} >= ${input.dataInicio}`);
      }

      if (input.dataFim) {
        conditions.push(sql`${installments.dataVencimento} <= ${input.dataFim}`);
      }

      const result = await db
        .select()
        .from(installments)
        .where(and(...conditions))
        .orderBy(installments.dataVencimento);

      return result;
    }),

  // Estatísticas de parcelas
  installmentStats: tenantProcedure
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

      const pendentesResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(${installments.valor}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(installments)
        .where(and(
          eq(installments.tenantId, input.tenantId),
          eq(installments.status, "pendente")
        ));

      const pagasResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(${installments.valor}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(installments)
        .where(and(
          eq(installments.tenantId, input.tenantId),
          eq(installments.status, "pago")
        ));

      const atrasadasResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(${installments.valor}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(installments)
        .where(and(
          eq(installments.tenantId, input.tenantId),
          eq(installments.status, "atrasado")
        ));

      return {
        totalPendentes: pendentesResult[0]?.total || "0",
        quantidadePendentes: Number(pendentesResult[0]?.count || 0),
        totalPagas: pagasResult[0]?.total || "0",
        quantidadePagas: Number(pagasResult[0]?.count || 0),
        totalAtrasadas: atrasadasResult[0]?.total || "0",
        quantidadeAtrasadas: Number(atrasadasResult[0]?.count || 0),
      };
    }),
});
