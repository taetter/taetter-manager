import { router, protectedProcedure } from "../_core/trpc.js";
import { z } from "zod";
import { getDb } from "../db.js";
import { patientGuardians, patients } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const patientGuardiansRouter = router({
  /**
   * Adicionar responsável a um paciente menor
   */
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        minorPatientId: z.number(),
        guardianPatientId: z.number(),
        relacao: z.enum(["mae", "pai", "tutor", "outro"]),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new Error("Database not available");
      
      // Verificar se ambos os pacientes existem e pertencem ao tenant
      const [minor, guardian] = await Promise.all([
        connection
          .select()
          .from(patients)
          .where(and(eq(patients.id, input.minorPatientId), eq(patients.tenantId, input.tenantId)))
          .limit(1),
        connection
          .select()
          .from(patients)
          .where(and(eq(patients.id, input.guardianPatientId), eq(patients.tenantId, input.tenantId)))
          .limit(1),
      ]);

      if (minor.length === 0) {
        throw new Error("Paciente menor não encontrado");
      }

      if (guardian.length === 0) {
        throw new Error("Responsável não encontrado");
      }

      // Verificar se o menor é realmente menor de idade
      const minorAge = Math.floor(
        (Date.now() - new Date(minor[0].dataNascimento).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      );

      if (minorAge >= 18) {
        throw new Error("Paciente não é menor de idade");
      }

      // Criar relacionamento
      const [result] = await connection.insert(patientGuardians).values({
        tenantId: input.tenantId,
        minorPatientId: input.minorPatientId,
        guardianPatientId: input.guardianPatientId,
        relacao: input.relacao,
        observacoes: input.observacoes,
      });

      return { id: result.insertId, success: true };
    }),

  /**
   * Listar responsáveis de um paciente menor
   */
  listByMinor: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        minorPatientId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new Error("Database not available");

      const guardians = await connection
        .select({
          id: patientGuardians.id,
          relacao: patientGuardians.relacao,
          observacoes: patientGuardians.observacoes,
          guardianId: patients.id,
          guardianNome: patients.nome,
          guardianCpf: patients.cpf,
          guardianTelefone: patients.telefone,
          guardianCelular: patients.celular,
          guardianEmail: patients.email,
        })
        .from(patientGuardians)
        .innerJoin(patients, eq(patientGuardians.guardianPatientId, patients.id))
        .where(
          and(
            eq(patientGuardians.tenantId, input.tenantId),
            eq(patientGuardians.minorPatientId, input.minorPatientId)
          )
        );

      return guardians;
    }),

  /**
   * Listar menores sob responsabilidade de um paciente
   */
  listByGuardian: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        guardianPatientId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new Error("Database not available");

      const minors = await connection
        .select({
          id: patientGuardians.id,
          relacao: patientGuardians.relacao,
          observacoes: patientGuardians.observacoes,
          minorId: patients.id,
          minorNome: patients.nome,
          minorCpf: patients.cpf,
          minorDataNascimento: patients.dataNascimento,
          minorTelefone: patients.telefone,
        })
        .from(patientGuardians)
        .innerJoin(patients, eq(patientGuardians.minorPatientId, patients.id))
        .where(
          and(
            eq(patientGuardians.tenantId, input.tenantId),
            eq(patientGuardians.guardianPatientId, input.guardianPatientId)
          )
        );

      return minors;
    }),

  /**
   * Remover relacionamento entre menor e responsável
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const connection = await getDb();
      if (!connection) throw new Error("Database not available");

      await connection
        .delete(patientGuardians)
        .where(and(eq(patientGuardians.id, input.id), eq(patientGuardians.tenantId, input.tenantId)));

      return { success: true };
    }),
});
