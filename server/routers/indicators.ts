import { z } from "zod";
import { router } from "../_core/trpc.js";
import { tenantProcedure } from "../tenantMiddleware.js";
import { getDb } from "../db.js";
import { 
  vaccineApplications, 
  financialTransactions, 
  vaccines, 
  patients,
  payments 
} from "../../drizzle/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const indicatorsRouter = router({
  // Estatísticas gerais do tenant
  generalStats: tenantProcedure
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

      const conditions = [eq(vaccineApplications.tenantId, input.tenantId)];
      if (input.dataInicio) {
        conditions.push(sql`${vaccineApplications.dataAplicacao} >= ${input.dataInicio}`);
      }
      if (input.dataFim) {
        conditions.push(sql`${vaccineApplications.dataAplicacao} <= ${input.dataFim}`);
      }

      // Total de aplicações
      const [aplicacoesResult] = await db
        .select({
          total: sql<number>`COUNT(*)`,
        })
        .from(vaccineApplications)
        .where(and(...conditions));

      // Total de pacientes ativos
      const [pacientesResult] = await db
        .select({
          total: sql<number>`COUNT(*)`,
        })
        .from(patients)
        .where(eq(patients.tenantId, input.tenantId));

      // Total de vacinas em estoque
      const [vacinasResult] = await db
        .select({
          total: sql<number>`SUM(${vaccines.quantidadeDisponivel})`,
        })
        .from(vaccines)
        .where(eq(vaccines.tenantId, input.tenantId));

      // Receita total
      const finConditions = [
        eq(financialTransactions.tenantId, input.tenantId),
        eq(financialTransactions.tipo, "receita"),
      ];
      if (input.dataInicio) {
        finConditions.push(sql`${financialTransactions.dataTransacao} >= ${input.dataInicio}`);
      }
      if (input.dataFim) {
        finConditions.push(sql`${financialTransactions.dataTransacao} <= ${input.dataFim}`);
      }

      const [receitaResult] = await db
        .select({
          total: sql<number>`SUM(${financialTransactions.valor})`,
        })
        .from(financialTransactions)
        .where(and(...finConditions));

      return {
        totalAplicacoes: Number(aplicacoesResult?.total || 0),
        totalPacientes: Number(pacientesResult?.total || 0),
        totalVacinasEstoque: Number(vacinasResult?.total || 0),
        receitaTotal: Number(receitaResult?.total || 0),
      };
    }),

  // Aplicações por mês (últimos 12 meses)
  applicationsByMonth: tenantProcedure
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

      const result = await db.execute(sql`
        SELECT 
          DATE_FORMAT(dataAplicacao, '%Y-%m') as mes,
          COUNT(*) as total
        FROM vaccineApplications
        WHERE tenantId = ${input.tenantId}
          AND dataAplicacao >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(dataAplicacao, '%Y-%m')
        ORDER BY mes ASC
      `);

      return (result as any).rows as Array<{ mes: string; total: number }>;
    }),

  // Receitas vs Despesas por mês
  financialByMonth: tenantProcedure
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

      const result = await db.execute(sql`
        SELECT 
          DATE_FORMAT(dataTransacao, '%Y-%m') as mes,
          SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
          SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas
        FROM financialTransactions
        WHERE tenantId = ${input.tenantId}
          AND dataTransacao >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(dataTransacao, '%Y-%m')
        ORDER BY mes ASC
      `);

      return (result as any).rows as Array<{ mes: string; receitas: number; despesas: number }>;
    }),

  // Vacinas mais aplicadas
  topVaccines: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const result = await db.execute(sql`
        SELECT 
          v.nome as nomeVacina,
          COUNT(va.id) as total
        FROM vaccineApplications va
        JOIN vaccines v ON va.vaccineId = v.id
        WHERE va.tenantId = ${input.tenantId}
        GROUP BY v.nome
        ORDER BY total DESC
        LIMIT ${input.limit}
      `);

      return (result as any).rows as Array<{ nomeVacina: string; total: number }>;
    }),

  // Métodos de pagamento mais usados
  paymentMethods: tenantProcedure
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

      const result = await db.execute(sql`
        SELECT 
          tipo as metodo,
          COUNT(*) as total,
          SUM(valor) as valorTotal
        FROM payments
        WHERE tenantId = ${input.tenantId}
        GROUP BY tipo
        ORDER BY total DESC
      `);

      return (result as any).rows as Array<{ metodo: string; total: number; valorTotal: number }>;
    }),

  // Exportar relatório de aplicações em Excel
  exportApplicationsReport: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const result = await db.execute(sql`
        SELECT 
          va.id,
          va.dataAplicacao,
          p.nome as nomePaciente,
          p.cpf as cpfPaciente,
          v.nome as nomeVacina,
          v.lote,
          v.dataValidade,
          u.nome as nomeUnidade,
          r.nome as nomeGeladeira,
          pay.tipo as metodoPagamento,
          pay.valor as valorPago
        FROM vaccineApplications va
        JOIN patients p ON va.patientId = p.id
        JOIN vaccines v ON va.vaccineId = v.id
        JOIN units u ON va.unitId = u.id
        JOIN refrigerators r ON va.refrigeratorId = r.id
        LEFT JOIN payments pay ON pay.applicationId = va.id
        WHERE va.tenantId = ${input.tenantId}
          AND va.dataAplicacao >= ${input.dataInicio}
          AND va.dataAplicacao <= ${input.dataFim}
        ORDER BY va.dataAplicacao DESC
      `);

      return (result as any).rows;
    }),

  // Exportar relatório financeiro em Excel
  exportFinancialReport: tenantProcedure
    .input(z.object({
      tenantId: z.number(),
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const result = await db.execute(sql`
        SELECT 
          id,
          dataTransacao,
          tipo,
          categoria,
          metodoPagamento,
          valor,
          status,
          descricao
        FROM financialTransactions
        WHERE tenantId = ${input.tenantId}
          AND dataTransacao >= ${input.dataInicio}
          AND dataTransacao <= ${input.dataFim}
        ORDER BY dataTransacao DESC
      `);

      return (result as any).rows;
    }),

  // Exportar relatório de estoque em Excel
  exportStockReport: tenantProcedure
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

      const result = await db.execute(sql`
        SELECT 
          v.id,
          v.nome as nomeVacina,
          v.fabricante,
          v.lote,
          v.dataValidade,
          v.quantidadeDisponivel,
          v.quantidadeMinima,
          u.nome as nomeUnidade,
          r.nome as nomeGeladeira,
          CASE 
            WHEN v.quantidadeDisponivel <= v.quantidadeMinima THEN 'Baixo'
            WHEN v.quantidadeDisponivel <= v.quantidadeMinima * 2 THEN 'Médio'
            ELSE 'Alto'
          END as nivelEstoque
        FROM vaccines v
        JOIN units u ON v.unitId = u.id
        JOIN refrigerators r ON v.refrigeratorId = r.id
        WHERE v.tenantId = ${input.tenantId}
        ORDER BY v.quantidadeDisponivel ASC
      `);

      return (result as any).rows;
    }),
});
