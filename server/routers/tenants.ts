import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { tenants, auditLogs } from "../../drizzle/schema";
import { eq, isNull, or, like, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { initializeTenantTemplate } from "../tenantTemplate.js";

// Schema de validação para criar/editar tenant
const tenantInputSchema = z.object({
  name: z.string().min(3),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  razaoSocial: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().min(2),
  estado: z.string().length(2),
  cep: z.string().regex(/^\d{5}-\d{3}$/),
  responsavelNome: z.string().min(3),
  responsavelCpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  responsavelEmail: z.string().email(),
  responsavelTelefone: z.string().optional(),
  plan: z.enum(["basic", "intermediate", "full"]),
  enabledModules: z.array(z.string()).optional(),
  status: z.enum(["ativo", "inativo", "suspenso"]),
});

export const tenantsRouter = router({
  // Listar todos os tenants (apenas super_admin)
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["ativo", "inativo", "suspenso"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se é super admin
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can list tenants",
        });
      }

      let query = db
        .select()
        .from(tenants)
        .where(isNull(tenants.deletedAt))
        .orderBy(desc(tenants.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Aplicar filtros
      const conditions = [isNull(tenants.deletedAt)];

      if (input.search) {
        conditions.push(
          or(
            like(tenants.name, `%${input.search}%`),
            like(tenants.cnpj, `%${input.search}%`),
            like(tenants.razaoSocial, `%${input.search}%`)
          )!
        );
      }

      if (input.status) {
        conditions.push(eq(tenants.status, input.status));
      }

      const results = await db
        .select()
        .from(tenants)
        .where(conditions.length > 1 ? or(...conditions) : conditions[0])
        .orderBy(desc(tenants.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return results;
    }),

  // Buscar tenant por subdomínio
  getBySubdomain: publicProcedure
    .input(z.object({ subdomain: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const result = await db
        .select()
        .from(tenants)
        .where(eq(tenants.subdomain, input.subdomain))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      return result[0];
    }),

  // Buscar tenant por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se é super admin ou usuário do tenant
      if (ctx.user?.role !== "super_admin" && ctx.user?.tenantId !== input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const result = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      return result[0];
    }),

  // Criar novo tenant (apenas super_admin)
  create: publicProcedure
    .input(tenantInputSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se é super admin
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can create tenants",
        });
      }

      // Verificar se CNPJ já existe
      const existingTenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.cnpj, input.cnpj))
        .limit(1);

      if (existingTenant.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "CNPJ already registered",
        });
      }

      // Criar tenant
      const result = await db.insert(tenants).values(input);
      const insertId = (result as any).insertId || 0;

      // Inicializar tenant template (criar dados iniciais)
      try {
        await initializeTenantTemplate(Number(insertId), input.responsavelEmail);
      } catch (error) {
        console.error("Failed to initialize tenant template:", error);
        // Não falha a criação do tenant se a inicialização falhar
      }

      // Registrar log de auditoria
      if (ctx.user?.id) {
        await db.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "create",
          entity: "tenant",
          entityId: Number(insertId),
          changes: JSON.stringify(input),
        });
      }

      return { id: Number(insertId), ...input };
    }),

  // Atualizar tenant (apenas super_admin)
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: tenantInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se é super admin
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can update tenants",
        });
      }

      // Verificar se tenant existe
      const existing = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      // Atualizar tenant
      await db
        .update(tenants)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(tenants.id, input.id));

      // Registrar log de auditoria
      if (ctx.user?.id) {
        await db.insert(auditLogs).values({
          tenantId: input.id,
          userId: ctx.user.id,
          action: "update",
          entity: "tenant",
          entityId: input.id,
          changes: JSON.stringify({
            before: existing[0],
            after: input.data,
          }),
        });
      }

      return { success: true };
    }),

  // Soft delete tenant (apenas super_admin)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se é super admin
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can delete tenants",
        });
      }

      // Soft delete
      await db
        .update(tenants)
        .set({ deletedAt: new Date() })
        .where(eq(tenants.id, input.id));

      // Registrar log de auditoria
      if (ctx.user?.id) {
        await db.insert(auditLogs).values({
          tenantId: input.id,
          userId: ctx.user.id,
          action: "delete",
          entity: "tenant",
          entityId: input.id,
        });
      }

      return { success: true };
    }),

  // Criar tenant simplificado (wizard)
  createSimple: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        cnpj: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        plan: z.enum(["basic", "intermediate", "full"]),
        subdomain: z.string().min(3),
        databaseHost: z.string(),
        databaseName: z.string(),
        supabaseUrl: z.string(),
        supabaseAnonKey: z.string(),
        supabaseServiceKey: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se é super admin
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can create tenants",
        });
      }

      // Verificar se subdomínio já existe
      const existingSubdomain = await db
        .select()
        .from(tenants)
        .where(eq(tenants.subdomain, input.subdomain))
        .limit(1);

      if (existingSubdomain.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Subdomain already in use",
        });
      }

      // Criar tenant
      const result = await db.insert(tenants).values({
        name: input.name,
        cnpj: input.cnpj,
        razaoSocial: input.name,
        email: input.email,
        telefone: input.phone || "",
        endereco: "",
        cidade: "",
        estado: "SP",
        cep: "00000-000",
        responsavelNome: "Admin",
        responsavelCpf: "000.000.000-00",
        responsavelEmail: input.email,
        responsavelTelefone: input.phone || "",
        plan: input.plan,
        subdomain: input.subdomain,
        databaseHost: input.databaseHost,
        databaseName: input.databaseName,
        configuracoes: JSON.stringify({
          supabase: {
            url: input.supabaseUrl,
            anonKey: input.supabaseAnonKey,
            serviceKey: input.supabaseServiceKey,
          },
        }),
        status: "ativo",
      });

      const insertId = (result as any).insertId || 0;

      // Registrar log de auditoria
      if (ctx.user?.id) {
        await db.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "create",
          entity: "tenant",
          entityId: Number(insertId),
          changes: JSON.stringify({ name: input.name, subdomain: input.subdomain }),
        });
      }

      return { id: Number(insertId), ...input };
    }),

  // Estatísticas para dashboard (apenas super_admin)
  stats: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    // Verificar se é super admin
    if (ctx.user?.role !== "super_admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only super admins can view stats",
      });
    }

    const allTenants = await db
      .select()
      .from(tenants)
      .where(isNull(tenants.deletedAt));

    const total = allTenants.length;
    const ativos = allTenants.filter((t) => t.status === "ativo").length;
    const inativos = allTenants.filter((t) => t.status === "inativo").length;
    const suspensos = allTenants.filter((t) => t.status === "suspenso").length;

    return {
      total,
      ativos,
      inativos,
      suspensos,
    };
  }),
});
