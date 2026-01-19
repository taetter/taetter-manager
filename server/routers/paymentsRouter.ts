import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { payments, financialTransactions } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const paymentsRouterApp = router({
  /**
   * List all payments for a tenant
   */
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        applicationId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { tenantId, applicationId } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const conditions = [eq(payments.tenantId, tenantId)];
      if (applicationId) {
        conditions.push(eq(payments.applicationId, applicationId));
      }

      const paymentsList = await db
        .select()
        .from(payments)
        .where(and(...conditions))
        .orderBy(desc(payments.dataHora));

      return paymentsList;
    }),

  /**
   * Get payment by ID
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

      const [payment] = await db
        .select()
        .from(payments)
        .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)))
        .limit(1);

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pagamento não encontrado",
        });
      }

      return payment;
    }),

  /**
   * Create payment (Tela 4: Pagamento)
   */
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        applicationId: z.number(),
        tipo: z.enum(["pix", "credito", "debito", "dinheiro"]),
        valor: z.string(), // Decimal as string
        // PIX
        pixChave: z.string().optional(),
        // Cartão
        cartaoBandeira: z.string().optional(),
        cartaoUltimosDigitos: z.string().optional(),
        cartaoNsu: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Criar pagamento
      const [newPayment] = await db
        .insert(payments)
        .values({
          ...input,
          status: "aprovado", // Por enquanto, aprova automaticamente
          dataHora: new Date(),
        })
        .$returningId();

      // Criar transação financeira automaticamente
      const metodoPagamentoMap: Record<string, "dinheiro" | "pix" | "debito" | "credito" | "boleto"> = {
        "pix": "pix",
        "credito": "credito",
        "debito": "debito",
        "dinheiro": "dinheiro",
      };

      const dataHoje = new Date().toISOString().split('T')[0];
      
      await db.execute(sql`
        INSERT INTO financialTransactions (
          tipo, categoria, metodoPagamento, valor, dataTransacao, 
          status, vaccineApplicationId, descricao, parcelado, numeroParcelas
        )
        VALUES (
          'receita', 
          'aplicacao_vacina', 
          ${metodoPagamentoMap[input.tipo]}, 
          ${input.valor}, 
          ${dataHoje},
          'pago', 
          ${input.applicationId}, 
          'Pagamento de aplicação de vacina',
          ${input.tipo === 'credito' ? true : false},
          ${input.tipo === 'credito' ? 1 : null}
        )
      `);

      return { id: newPayment.id, success: true };
    }),

  /**
   * Generate PIX QR Code
   */
  generatePixQrCode: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        applicationId: z.number(),
        valor: z.number(),
        chave: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { tenantId, applicationId, valor, chave } = input;

      // TODO: Implementar geração real de QR Code PIX
      // Por enquanto, retorna QR Code mockado
      const qrCode = `00020126580014br.gov.bcb.pix0136${chave}52040000530398654${valor.toFixed(2)}5802BR5925NOME DO ESTABELECIMENTO6009SAO PAULO62070503***6304XXXX`;

      return {
        qrCode,
        pixChave: chave,
        pixTxId: `TXN${Date.now()}`,
        success: true,
      };
    }),

  /**
   * Confirm payment
   */
  confirm: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
        comprovanteUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tenantId, comprovanteUrl } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(payments)
        .set({
          status: "aprovado",
          comprovanteUrl,
        })
        .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)));

      return { success: true };
    }),

  /**
   * Cancel payment
   */
  cancel: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
        motivo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tenantId, motivo } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(payments)
        .set({
          status: "cancelado",
          observacoes: motivo,
        })
        .where(and(eq(payments.id, id), eq(payments.tenantId, tenantId)));

      return { success: true };
    }),
});
