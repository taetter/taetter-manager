import { z } from "zod";
import { router } from "../_core/trpc.js";
import { tenantProcedure } from "../tenantMiddleware.js";
import { getDb } from "../db.js";
import { 
  hrEmployees,
  payrolls,
  timeClocks,
  overtimeRequests,
  absenceRecords,
  mileageRecords,
  workAccidents
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const hrRouter = router({
  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: tenantProcedure
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

      const colaboradores = await db
        .select()
        .from(hrEmployees)
        .where(eq(hrEmployees.tenantId, input.tenantId));

      const colaboradoresAtivos = colaboradores.filter(c => c.status === "ativo");
      const colaboradoresFerias = colaboradores.filter(c => c.status === "ferias");
      const colaboradoresAfastados = colaboradores.filter(c => c.status === "afastado");

      return {
        totalColaboradores: colaboradores.length,
        colaboradoresAtivos: colaboradoresAtivos.length,
        colaboradoresFerias: colaboradoresFerias.length,
        colaboradoresAfastados: colaboradoresAfastados.length,
      };
    }),

  // ============================================================================
  // COLABORADORES
  // ============================================================================
  employees: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        return await db
          .select()
          .from(hrEmployees)
          .where(eq(hrEmployees.tenantId, input.tenantId))
          .orderBy(hrEmployees.nome);
      }),

    // create: tenantProcedure - TODO: Fix date type issues
  }),

  // ============================================================================
  // PONTO ELETRÔNICO
  // ============================================================================
  timeClock: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        employeeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        const conditions = [eq(timeClocks.tenantId, input.tenantId)];
        if (input.employeeId) {
          conditions.push(eq(timeClocks.employeeId, input.employeeId));
        }

        return await db
          .select()
          .from(timeClocks)
          .where(and(...conditions))
          .orderBy(desc(timeClocks.data));
      }),

    // register: tenantProcedure - TODO: Fix date type issues
  }),

  // ============================================================================
  // HORAS EXTRAS
  // ============================================================================
  overtime: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        employeeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        const conditions = [eq(overtimeRequests.tenantId, input.tenantId)];
        if (input.employeeId) {
          conditions.push(eq(overtimeRequests.employeeId, input.employeeId));
        }

        return await db
          .select()
          .from(overtimeRequests)
          .where(and(...conditions))
          .orderBy(desc(overtimeRequests.data));
      }),

    // create: tenantProcedure - TODO: Fix date type issues
  }),

  // ============================================================================
  // AUSÊNCIAS
  // ============================================================================
  absences: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        employeeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        const conditions = [eq(absenceRecords.tenantId, input.tenantId)];
        if (input.employeeId) {
          conditions.push(eq(absenceRecords.employeeId, input.employeeId));
        }

        return await db
          .select()
          .from(absenceRecords)
          .where(and(...conditions))
          .orderBy(desc(absenceRecords.dataInicio));
      }),

    // create: tenantProcedure - TODO: Fix date type issues
  }),

  // ============================================================================
  // REGISTRO DE KM
  // ============================================================================
  mileage: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        employeeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        const conditions = [eq(mileageRecords.tenantId, input.tenantId)];
        if (input.employeeId) {
          conditions.push(eq(mileageRecords.employeeId, input.employeeId));
        }

        return await db
          .select()
          .from(mileageRecords)
          .where(and(...conditions))
          .orderBy(desc(mileageRecords.data));
      }),

    // create: tenantProcedure - TODO: Fix date type issues
  }),

  // ============================================================================
  // CAT (COMUNICADO DE ACIDENTE DE TRABALHO)
  // ============================================================================
  workAccidents: router({
    list: tenantProcedure
      .input(z.object({
        tenantId: z.number(),
        employeeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        const conditions = [eq(workAccidents.tenantId, input.tenantId)];
        if (input.employeeId) {
          conditions.push(eq(workAccidents.employeeId, input.employeeId));
        }

        return await db
          .select()
          .from(workAccidents)
          .where(and(...conditions))
          .orderBy(desc(workAccidents.dataAcidente));
      }),

    // create: tenantProcedure - TODO: Fix date type issues
    //   .input(z.object({...}))
    //   .mutation(async ({ input }) => {...})
  }),
});
