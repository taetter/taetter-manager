import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { bankAccounts } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const bankAccountsRouter = router({
  // Listar contas bancárias
  list: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      apenasAtivas: z.boolean().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      let query = connection
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.tenantId, input.tenantId));

      if (input.apenasAtivas) {
        query = query.where(and(
          eq(bankAccounts.tenantId, input.tenantId),
          eq(bankAccounts.ativa, true)
        )) as any;
      }

      const accounts = await query.orderBy(desc(bankAccounts.createdAt));
      return accounts;
    }),

  // Buscar conta bancária por ID
  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
    }))
    .query(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const [account] = await connection
        .select()
        .from(bankAccounts)
        .where(and(
          eq(bankAccounts.id, input.id),
          eq(bankAccounts.tenantId, input.tenantId)
        ));

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conta bancária não encontrada" });
      }

      return account;
    }),

  // Criar conta bancária
  create: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      banco: z.string(),
      agencia: z.string(),
      conta: z.string(),
      tipoConta: z.enum(["corrente", "poupanca", "pagamento"]),
      apelido: z.string(),
      descricao: z.string().optional(),
      saldoInicial: z.string(),
    }))
    .mutation(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const [result] = await connection.insert(bankAccounts).values({
        ...input,
        saldoAtual: input.saldoInicial,
      });

      return { id: Number(result.insertId) };
    }),

  // Atualizar conta bancária
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
      banco: z.string().optional(),
      agencia: z.string().optional(),
      conta: z.string().optional(),
      tipoConta: z.enum(["corrente", "poupanca", "pagamento"]).optional(),
      apelido: z.string().optional(),
      descricao: z.string().optional(),
      saldoAtual: z.string().optional(),
      ativa: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const { id, tenantId, ...data } = input;

      await connection
        .update(bankAccounts)
        .set(data)
        .where(and(
          eq(bankAccounts.id, id),
          eq(bankAccounts.tenantId, tenantId)
        ));

      return { success: true };
    }),

  // Deletar conta bancária
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
      tenantId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      await connection
        .delete(bankAccounts)
        .where(and(
          eq(bankAccounts.id, input.id),
          eq(bankAccounts.tenantId, input.tenantId)
        ));

      return { success: true };
    }),
});
