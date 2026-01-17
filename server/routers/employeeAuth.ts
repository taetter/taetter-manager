import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { hrEmployees } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

/**
 * Employee Authentication Router
 * Handles authentication for the employee portal (ADC)
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

// Create employee sessions table if needed
async function createEmployeeSessionsTable(db: any) {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employee_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        tenant_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_token (session_token),
        INDEX idx_employee_id (employee_id)
      )
    `);
  } catch (error) {
    console.error("Error creating employee_sessions table:", error);
  }
}

export const employeeAuthRouter = router({
  /**
   * Employee login
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
    .mutation(async ({ input }) => {
      const { tenantId, cpf, senha } = input;

      // Normalizar CPF (remover pontos e traços)
      const cpfNormalizado = cpf.replace(/[^\d]/g, "");

      // Buscar colaborador
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Ensure employee_sessions table exists
      await createEmployeeSessionsTable(db);

      const [employee] = await db
        .select()
        .from(hrEmployees)
        .where(and(eq(hrEmployees.tenantId, tenantId), eq(hrEmployees.cpf, cpfNormalizado)))
        .limit(1);

      if (!employee) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "CPF ou senha inválidos",
        });
      }

      // Verificar se está ativo
      if (employee.status !== "ativo") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Colaborador inativo. Entre em contato com o RH.",
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, employee.senha || "");
      if (!senhaValida) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "CPF ou senha inválidos",
        });
      }

      // Criar sessão
      const sessionToken = generateSessionToken();
      const expiresAt = getSessionExpiration();

      await db.execute(sql`
        INSERT INTO employee_sessions (employee_id, tenant_id, session_token, expires_at)
        VALUES (${employee.id}, ${tenantId}, ${sessionToken}, ${expiresAt})
      `);

      return {
        success: true,
        sessionToken,
        employee: {
          id: employee.id,
          nome: employee.nome,
          cpf: employee.cpf,
          cargo: employee.cargo,
          perfil: employee.perfil,
        },
      };
    }),

  /**
   * Get current employee from session
   */
  me: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar sessão
      const [session] = await db.execute(sql`
        SELECT * FROM employee_sessions 
        WHERE session_token = ${input.sessionToken} 
        AND expires_at > NOW()
        LIMIT 1
      `);

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida ou expirada",
        });
      }

      // Buscar colaborador
      const [employee] = await db
        .select()
        .from(hrEmployees)
        .where(eq(hrEmployees.id, (session as any).employee_id))
        .limit(1);

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Colaborador não encontrado",
        });
      }

      return {
        id: employee.id,
        nome: employee.nome,
        cpf: employee.cpf,
        cargo: employee.cargo,
        perfil: employee.perfil,
        tenantId: employee.tenantId,
      };
    }),

  /**
   * Logout
   */
  logout: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.execute(sql`
        DELETE FROM employee_sessions 
        WHERE session_token = ${input.sessionToken}
      `);

      return { success: true };
    }),

  /**
   * Change password
   */
  changePassword: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        senhaAtual: z.string(),
        senhaNova: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar sessão
      const [session] = await db.execute(sql`
        SELECT * FROM employee_sessions 
        WHERE session_token = ${input.sessionToken} 
        AND expires_at > NOW()
        LIMIT 1
      `);

      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida ou expirada",
        });
      }

      // Buscar colaborador
      const [employee] = await db
        .select()
        .from(hrEmployees)
        .where(eq(hrEmployees.id, (session as any).employee_id))
        .limit(1);

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Colaborador não encontrado",
        });
      }

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(input.senhaAtual, employee.senha || "");
      if (!senhaValida) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha atual incorreta",
        });
      }

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(input.senhaNova, 10);

      // Atualizar senha
      await db.execute(sql`
        UPDATE hr_employees 
        SET senha = ${senhaHash}
        WHERE id = ${employee.id}
      `);

      return { success: true };
    }),
});
