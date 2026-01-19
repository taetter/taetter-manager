import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db.js";
import { patients, patientSessions, vaccineApplications, vaccines, applications } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

/**
 * Patient Authentication Router
 * Handles authentication for the patient portal
 */

// Helper to generate session token
function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

// Helper to get session expiration (7 days from now)
function getSessionExpiration(): Date {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 7);
  return expiration;
}

export const patientAuthRouter = router({
  /**
   * Patient login
   * Authenticates with CPF and password
   */
  login: publicProcedure
    .input(
      z.object({
        tenantId: z.number(),
        cpf: z.string().min(11),
        senha: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { tenantId, cpf, senha } = input;

      // Normalizar CPF (remover pontos e traços)
      const cpfNormalizado = cpf.replace(/[^\d]/g, "");

      // Buscar paciente
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [patient] = await db
        .select()
        .from(patients)
        .where(and(eq(patients.tenantId, tenantId), eq(patients.cpf, cpf)))
        .limit(1);

      if (!patient) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "CPF ou senha inválidos",
        });
      }

      // Verificar se o paciente está ativo
      if (!patient.ativo) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Paciente inativo. Entre em contato com a clínica.",
        });
      }

      // Verificar senha
      let senhaValida = false;
      
      // Se não tem senha cadastrada ou é primeiro acesso, aceitar primeiro nome como senha
      if (!patient.senhaHash || patient.primeiroAcesso) {
        const primeiroNome = patient.nome.split(" ")[0].toLowerCase();
        const senhaInformada = senha.toLowerCase();
        senhaValida = primeiroNome === senhaInformada;
        
        if (!senhaValida) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "CPF ou senha inválidos. No primeiro acesso, use seu primeiro nome como senha.",
          });
        }
      } else {
        // Verificar senha cadastrada
        senhaValida = await bcrypt.compare(senha, patient.senhaHash);
        if (!senhaValida) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "CPF ou senha inválidos",
          });
        }
      }

      // Criar sessão
      const token = generateSessionToken();
      const expiresAt = getSessionExpiration();

      await db.insert(patientSessions).values({
        tenantId,
        patientId: patient.id,
        token,
        ipAddress: ctx.req?.ip || null,
        userAgent: ctx.req?.headers["user-agent"] || null,
        expiresAt,
      });

      return {
        success: true,
        token,
        patient: {
          id: patient.id,
          nome: patient.nome,
          cpf: patient.cpf,
          email: patient.email,
          primeiroAcesso: patient.primeiroAcesso,
        },
      };
    }),

  /**
   * Patient logout
   * Invalidates the current session
   */
  logout: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { token } = input;

      // Deletar sessão
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.delete(patientSessions).where(eq(patientSessions.token, token));

      return { success: true };
    }),

  /**
   * Get current patient
   * Returns patient data based on session token
   */
  me: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { token } = input;

      // Buscar sessão
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [session] = await db
        .select()
        .from(patientSessions)
        .where(eq(patientSessions.token, token))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida",
        });
      }

      // Verificar se a sessão expirou
      if (new Date() > session.expiresAt) {
        await db.delete(patientSessions).where(eq(patientSessions.id, session.id));
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão expirada",
        });
      }

      // Buscar dados do paciente
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, session.patientId))
        .limit(1);

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente não encontrado",
        });
      }

      return {
        id: patient.id,
        tenantId: patient.tenantId,
        nome: patient.nome,
        cpf: patient.cpf,
        rg: patient.rg,
        dataNascimento: patient.dataNascimento,
        sexo: patient.sexo,
        nomeMae: patient.nomeMae,
        nomePai: patient.nomePai,
        email: patient.email,
        telefone: patient.telefone,
        celular: patient.celular,
        endereco: patient.endereco,
        numero: patient.numero,
        complemento: patient.complemento,
        bairro: patient.bairro,
        cidade: patient.cidade,
        estado: patient.estado,
        cep: patient.cep,
        cartaoSus: patient.cartaoSus,
        fotoUrl: patient.fotoUrl,
        primeiroAcesso: patient.primeiroAcesso,
      };
    }),

  /**
   * Change password
   * Allows patient to change their password
   */
  changePassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        senhaAtual: z.string().min(1),
        novaSenha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      const { token, senhaAtual, novaSenha } = input;

      // Buscar sessão
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [session] = await db
        .select()
        .from(patientSessions)
        .where(eq(patientSessions.token, token))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida",
        });
      }

      // Buscar paciente
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, session.patientId))
        .limit(1);

      if (!patient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Paciente não encontrado",
        });
      }

      // Verificar senha atual
      let senhaValida = false;
      
      // Se é primeiro acesso ou não tem senha, aceitar primeiro nome
      if (!patient.senhaHash || patient.primeiroAcesso) {
        const primeiroNome = patient.nome.split(" ")[0].toLowerCase();
        const senhaInformada = senhaAtual.toLowerCase();
        senhaValida = primeiroNome === senhaInformada;
      } else {
        // Verificar senha cadastrada
        senhaValida = await bcrypt.compare(senhaAtual, patient.senhaHash);
      }
      
      if (!senhaValida) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha atual incorreta",
        });
      }

      // Hash da nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await db
        .update(patients)
        .set({
          senhaHash: novaSenhaHash,
          primeiroAcesso: false,
        })
        .where(eq(patients.id, patient.id));

      return { success: true };
    }),

  /**
   * Get patient vaccination history
   * Returns all vaccinations for the current patient
   */
  getVaccinationHistory: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { token } = input;

      // Buscar sessão
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [session] = await db
        .select()
        .from(patientSessions)
        .where(eq(patientSessions.token, token))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida",
        });
      }

      // Buscar histórico de vacinações
      const history = await db
        .select({
          id: vaccineApplications.id,
          dataAplicacao: vaccineApplications.dataAplicacao,
          vacina: vaccines.nome,
          fabricante: vaccines.fabricante,
          lote: vaccineApplications.lote,
          dose: vaccineApplications.dose,
          observacoes: vaccineApplications.observacoes,
        })
        .from(vaccineApplications)
        .innerJoin(vaccines, eq(vaccineApplications.vaccineId, vaccines.id))
        .where(eq(vaccineApplications.patientId, session.patientId))
        .orderBy(vaccineApplications.dataAplicacao);

      return history;
    }),

  /**
   * Get upcoming vaccinations
   * Returns vaccinations scheduled for the patient
   */
  getUpcomingVaccinations: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { token } = input;

      // Buscar sessão
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [session] = await db
        .select()
        .from(patientSessions)
        .where(eq(patientSessions.token, token))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida",
        });
      }

      // Buscar próximas vacinações (status pendente)
      const upcoming = await db
        .select({
          id: vaccineApplications.id,
          dataAplicacao: vaccineApplications.dataAplicacao,
          vacina: vaccines.nome,
          dose: vaccineApplications.dose,
        })
        .from(vaccineApplications)
        .innerJoin(vaccines, eq(vaccineApplications.vaccineId, vaccines.id))
        .where(
          and(
            eq(vaccineApplications.patientId, session.patientId),
            eq(vaccineApplications.status, "pendente")
          )
        )
        .orderBy(vaccineApplications.dataAplicacao);

      return upcoming;
    }),

});
