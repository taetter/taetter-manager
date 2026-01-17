import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { vaccineApplications, vaccines, patients, payments, patientVaccinationHistory, units, refrigerators } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const vaccineApplicationsRouter = router({
  /**
   * List all applications for a tenant
   */
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        patientId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { tenantId, patientId } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const conditions = [eq(vaccineApplications.tenantId, tenantId)];
      if (patientId) {
        conditions.push(eq(vaccineApplications.patientId, patientId));
      }

      const applicationsList = await db
        .select()
        .from(vaccineApplications)
        .where(and(...conditions))
        .orderBy(desc(vaccineApplications.dataAplicacao));

      return applicationsList;
    }),

  /**
   * Get application by ID
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

      const [application] = await db
        .select()
        .from(vaccineApplications)
        .where(and(eq(vaccineApplications.id, id), eq(vaccineApplications.tenantId, tenantId)))
        .limit(1);

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aplicação não encontrada",
        });
      }

      return application;
    }),

  /**
   * Create new application (Tela 3: Aplicar Vacina)
   * This endpoint:
   * - Creates the application record
   * - Decreases vaccine stock
   * - Generates Zebra label
   * - Updates patient's virtual card (ADP)
   */
  create: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        patientId: z.number(),
        vaccineId: z.number(),
        unitId: z.number(),
        refrigeratorId: z.number(),
        employeeId: z.number().optional(),
        dose: z.string().optional(),
        localAplicacao: z.string().optional(),
        viaAdministracao: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verificar se a vacina existe e tem estoque
      const [vaccine] = await db
        .select()
        .from(vaccines)
        .where(and(eq(vaccines.id, input.vaccineId), eq(vaccines.tenantId, input.tenantId)))
        .limit(1);

      if (!vaccine) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vacina não encontrada",
        });
      }

      if (vaccine.quantidadeDisponivel <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vacina sem estoque disponível",
        });
      }

      // Criar aplicação
      const [newApplication] = await db
        .insert(vaccineApplications)
        .values({
          ...input,
          dataAplicacao: new Date(),
          lote: vaccine.lote,
          status: "aplicada",
          etiquetaVirtual: true, // Adiciona à ADP automaticamente
        })
        .$returningId();

      // Diminuir estoque
      await db
        .update(vaccines)
        .set({
          quantidadeDisponivel: vaccine.quantidadeDisponivel - 1,
        })
        .where(eq(vaccines.id, input.vaccineId));

      // Buscar dados da unidade e geladeira
      const [unit] = await db
        .select()
        .from(units)
        .where(eq(units.id, input.unitId))
        .limit(1);

      const [refrigerator] = await db
        .select()
        .from(refrigerators)
        .where(eq(refrigerators.id, input.refrigeratorId))
        .limit(1);

      // Registrar no histórico do paciente
      const dataAplicacaoStr = new Date().toISOString().split('T')[0];
      await db.execute(sql`
        INSERT INTO patientVaccinationHistory (
          tenantId, pacienteId, vaccineApplicationId, vaccineId,
          nomeVacina, lote, dataValidade, dataAplicacao,
          unidadeId, nomeUnidade, refrigeratorId, nomeGeladeira,
          profissionalId, observacoes, createdAt, updatedAt
        )
        VALUES (
          ${input.tenantId}, ${input.patientId}, ${newApplication.id}, ${input.vaccineId},
          ${vaccine.nome}, ${vaccine.lote}, ${vaccine.validade}, ${dataAplicacaoStr},
          ${input.unitId}, ${unit?.nome || 'Unidade não encontrada'}, ${input.refrigeratorId}, ${refrigerator?.nome || 'Geladeira não encontrada'},
          ${input.employeeId || null}, ${input.observacoes || null}, NOW(), NOW()
        )
      `);

      return { id: newApplication.id, success: true };
    }),

  /**
   * Generate Zebra label for application
   */
  generateLabel: protectedProcedure
    .input(
      z.object({
        applicationId: z.number(),
        tenantId: z.number(),
        tipo: z.enum(["fisica", "virtual"]),
      })
    )
    .mutation(async ({ input }) => {
      const { applicationId, tenantId, tipo } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar aplicação
      const [application] = await db
        .select()
        .from(vaccineApplications)
        .where(and(eq(vaccineApplications.id, applicationId), eq(vaccineApplications.tenantId, tenantId)))
        .limit(1);

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aplicação não encontrada",
        });
      }

      // TODO: Implementar geração real de etiqueta Zebra
      // Por enquanto, retorna URL mockada
      const etiquetaUrl = `https://storage.example.com/labels/${applicationId}.pdf`;

      // Atualizar aplicação com URL da etiqueta
      await db
        .update(vaccineApplications)
        .set({
          etiquetaZebraUrl: tipo === "fisica" ? etiquetaUrl : null,
          etiquetaVirtual: tipo === "virtual",
        })
        .where(eq(vaccineApplications.id, applicationId));

      return { url: etiquetaUrl, success: true };
    }),

  /**
   * Cancel application
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

      // Buscar aplicação
      const [application] = await db
        .select()
        .from(vaccineApplications)
        .where(and(eq(vaccineApplications.id, id), eq(vaccineApplications.tenantId, tenantId)))
        .limit(1);

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aplicação não encontrada",
        });
      }

      // Devolver ao estoque
      const [vaccine] = await db
        .select()
        .from(vaccines)
        .where(eq(vaccines.id, application.vaccineId))
        .limit(1);

      if (vaccine) {
        await db
          .update(vaccines)
          .set({
            quantidadeDisponivel: vaccine.quantidadeDisponivel + 1,
          })
          .where(eq(vaccines.id, application.vaccineId));
      }

      // Cancelar aplicação
      await db
        .update(vaccineApplications)
        .set({
          status: "cancelada",
          observacoes: motivo ? `${application.observacoes || ""}\nCancelamento: ${motivo}` : application.observacoes,
        })
        .where(eq(vaccineApplications.id, id));

      return { success: true };
    }),

  /**
   * Print Zebra label (physical)
   * Generates ZPL code and sends to printer
   */
  printLabel: protectedProcedure
    .input(
      z.object({
        applicationId: z.number(),
        tenantId: z.number(),
        printerIP: z.string().optional(), // IP da impressora Zebra
      })
    )
    .mutation(async ({ input }) => {
      const { applicationId, tenantId, printerIP } = input;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar aplicação com todos os dados
      const [application] = await db
        .select()
        .from(vaccineApplications)
        .where(and(eq(vaccineApplications.id, applicationId), eq(vaccineApplications.tenantId, tenantId)))
        .limit(1);

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aplicação não encontrada",
        });
      }

      // Buscar dados do paciente
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, application.patientId))
        .limit(1);

      // Buscar dados da vacina
      const [vaccine] = await db
        .select()
        .from(vaccines)
        .where(eq(vaccines.id, application.vaccineId))
        .limit(1);

      // Buscar dados da unidade
      const [unit] = await db
        .select()
        .from(units)
        .where(eq(units.id, application.unitId))
        .limit(1);

      if (!patient || !vaccine || !unit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dados da aplicação incompletos",
        });
      }

      // Gerar URL da etiqueta virtual
      const { generateVirtualLabelURL, generateVaccinationLabelZPL, sendZPLToPrinter } = await import("../utils/zebraLabel");
      const virtualLabelURL = generateVirtualLabelURL(tenantId, applicationId);

      // Gerar código ZPL
      const zpl = generateVaccinationLabelZPL({
        patientName: patient.nome,
        patientCPF: patient.cpf || "N/A",
        vaccineName: vaccine.nome,
        lote: application.lote || "N/A",
        dataAplicacao: new Date(application.dataAplicacao),
        dataValidade: vaccine.validade ? new Date(vaccine.validade) : new Date(),
        unidade: unit.nome,
        profissional: application.employeeId ? `ID: ${application.employeeId}` : undefined,
        qrCodeUrl: virtualLabelURL,
      });

      // Se IP da impressora foi fornecido, enviar para impressão
      if (printerIP) {
        try {
          await sendZPLToPrinter(zpl, printerIP);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao enviar para impressora: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          });
        }
      }

      // Atualizar aplicação com URL da etiqueta virtual
      await db
        .update(vaccineApplications)
        .set({
          etiquetaVirtual: true,
        })
        .where(eq(vaccineApplications.id, applicationId));

      return { 
        success: true, 
        zpl, // Retorna ZPL para debug ou download
        virtualLabelURL 
      };
    }),
});
