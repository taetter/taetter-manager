import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import * as schema from "../../drizzle/schema";

export const appointmentsRouter = router({
  /**
   * Criar novo agendamento
   */
  create: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        patientName: z.string(),
        patientPhone: z.string().optional(),
        dataHora: z.string(), // ISO datetime
        tipo: z.enum(["unidade", "domiciliar"]),
        unitId: z.number().optional(),
        endereco: z.string().optional(),
        vaccineIds: z.array(z.number()),
        vaccineNames: z.string(),
        duracao: z.number().default(30),
        homeCareAddressId: z.number().optional(),
        valorTotal: z.string(),
        taxaDomiciliar: z.string().default("0.00"),
        descontoAntecipado: z.string().default("0.00"),
        valorFinal: z.string(),
        pagamentoAntecipado: z.boolean().default(false),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Criar agendamento
      const [appointment] = await connection.insert(schema.appointments).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        status: "pendente",
        dataHora: new Date(input.dataHora),
      });

      // Criar reservas de vacina
      if (input.vaccineIds.length > 0) {
        // TODO: Implementar lógica de reserva de vacinas
        // Requer: lote, refrigeratorId, dataExpiracao
        // Por enquanto, pular criação de reservas até implementar gestão de estoque
        console.warn('[Appointments] Vaccine reservation skipped - requires stock management implementation');
      }

      return { id: appointment.insertId };
    }),

  /**
   * Listar agendamentos com filtros
   */
  list: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(["pendente", "confirmado", "realizado", "cancelado"]).optional(),
        tipo: z.enum(["unidade", "domiciliar"]).optional(),
        patientId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      let query = connection
        .select()
        .from(schema.appointments)
        .where(eq(schema.appointments.tenantId, ctx.user.tenantId!))
        .$dynamic();

      if (input.startDate) {
        query = query.where(gte(schema.appointments.dataHora, new Date(input.startDate)));
      }

      if (input.endDate) {
        query = query.where(lte(schema.appointments.dataHora, new Date(input.endDate)));
      }

      if (input.status) {
        query = query.where(eq(schema.appointments.status, input.status));
      }

      if (input.tipo) {
        query = query.where(eq(schema.appointments.tipo, input.tipo));
      }

      if (input.patientId) {
        query = query.where(eq(schema.appointments.patientId, input.patientId));
      }

      const appointments = await query.orderBy(desc(schema.appointments.dataHora));

      return appointments;
    }),

  /**
   * Buscar agendamento por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const [appointment] = await connection
        .select()
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.id, input.id),
            eq(schema.appointments.tenantId, ctx.user.tenantId!)
          )
        );

      if (!appointment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agendamento não encontrado" });
      }

      // Buscar reservas de vacinas
      const reservations = await connection
        .select()
        .from(schema.vaccineReservations)
        .where(eq(schema.vaccineReservations.appointmentId, appointment.id));

      return { ...appointment, reservations };
    }),

  /**
   * Buscar agendamentos por paciente
   */
  getByPatient: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const appointments = await connection
        .select()
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.patientId, input.patientId),
            eq(schema.appointments.tenantId, ctx.user.tenantId!)
          )
        )
        .orderBy(desc(schema.appointments.dataHora));

      return appointments;
    }),

  /**
   * Atualizar agendamento
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        dataHora: z.string().optional(),
        status: z.enum(["pendente", "confirmado", "realizado", "cancelado"]).optional(),
        observacoes: z.string().optional(),
        employeeId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const { id, dataHora, ...updateData } = input;

      await connection
        .update(schema.appointments)
        .set({
          ...updateData,
          ...(dataHora && { dataHora: new Date(dataHora) }),
        })
        .where(
          and(
            eq(schema.appointments.id, id),
            eq(schema.appointments.tenantId, ctx.user.tenantId!)
          )
        );

      return { success: true };
    }),

  /**
   * Cancelar agendamento
   */
  cancel: protectedProcedure
    .input(z.object({ id: z.number(), motivo: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Atualizar status do agendamento
      await connection
        .update(schema.appointments)
        .set({
          status: "cancelado",
          motivoCancelamento: input.motivo || "Cancelado pelo usuário",
        })
        .where(
          and(
            eq(schema.appointments.id, input.id),
            eq(schema.appointments.tenantId, ctx.user.tenantId!)
          )
        );

      // Liberar reservas de vacinas
      await connection
        .update(schema.vaccineReservations)
        .set({ status: "cancelada" })
        .where(eq(schema.vaccineReservations.appointmentId, input.id));

      return { success: true };
    }),

  /**
   * Confirmar agendamento
   */
  confirm: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      await connection
        .update(schema.appointments)
        .set({ status: "confirmado" })
        .where(
          and(
            eq(schema.appointments.id, input.id),
            eq(schema.appointments.tenantId, ctx.user.tenantId!)
          )
        );

      return { success: true };
    }),

  /**
   * Estatísticas de agendamentos
   */
  stats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      let query = connection
        .select({
          total: sql<number>`count(*)`,
          status: schema.appointments.status,
          tipo: schema.appointments.tipo,
        })
        .from(schema.appointments)
        .where(eq(schema.appointments.tenantId, ctx.user.tenantId!))
        .groupBy(schema.appointments.status, schema.appointments.tipo)
        .$dynamic();

      if (input.startDate) {
        query = query.where(gte(schema.appointments.dataHora, new Date(input.startDate)));
      }

      if (input.endDate) {
        query = query.where(lte(schema.appointments.dataHora, new Date(input.endDate)));
      }

      const stats = await query;

      return stats;
    }),

  /**
   * Verificar disponibilidade de horário
   */
  checkAvailability: protectedProcedure
    .input(
      z.object({
        dataHora: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const connection = await getDb();
      if (!connection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const targetDate = new Date(input.dataHora);
      
      const existing = await connection
        .select()
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.tenantId, ctx.user.tenantId!),
            eq(schema.appointments.dataHora, targetDate),
            sql`${schema.appointments.status} != 'cancelado'`
          )
        );

      return { available: existing.length === 0, conflictCount: existing.length };
    }),
});
