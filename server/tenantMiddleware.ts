import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import { publicProcedure } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import superjson from "superjson";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

/**
 * Middleware to ensure tenant context is set
 * Automatically filters all queries by tenantId
 */
export const tenantMiddleware = t.middleware(async (opts) => {
  const { ctx, next, input } = opts;
  
  // Super admins can access all tenants
  if (ctx.user?.role === "super_admin") {
    // Try to get tenantId from input
    const inputTenantId = (input as any)?.tenantId;
    
    return next({
      ctx: {
        ...ctx,
        tenantId: inputTenantId || null, // Use input tenantId if provided
      },
    });
  }

  // Regular users must have a tenantId
  if (!ctx.user?.tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User must belong to a tenant",
    });
  }

  return next({
    ctx: {
      ...ctx,
      tenantId: ctx.user.tenantId,
    },
  });
});

/**
 * Procedure that requires tenant context
 * Use this for all tenant-scoped operations
 */
export const tenantProcedure = publicProcedure.use(tenantMiddleware);

/**
 * Middleware to validate tenant access
 * Ensures user can only access their own tenant data
 */
export const validateTenantAccess = (tenantId: number, userTenantId: number | null | undefined, userRole: string | undefined) => {
  // Super admins can access any tenant
  if (userRole === "super_admin") {
    return true;
  }

  // Regular users can only access their own tenant
  if (userTenantId !== tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Access denied to this tenant",
    });
  }

  return true;
};

/**
 * Helper to get tenant ID from context
 * Throws error if tenant context is required but not set
 */
export function requireTenantId(ctx: any): number {
  if (ctx.user?.role === "super_admin") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Super admin must specify tenant ID explicitly",
    });
  }

  if (!ctx.tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tenant context required",
    });
  }

  return ctx.tenantId;
}

/**
 * Helper to get tenant ID from context or input
 * For super admins, allows specifying tenant ID in input
 */
export function getTenantId(ctx: any, inputTenantId?: number): number {
  // Super admin can specify tenant ID
  if (ctx.user?.role === "super_admin" && inputTenantId) {
    return inputTenantId;
  }

  // Regular users use their own tenant ID
  if (!ctx.tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tenant context required",
    });
  }

  return ctx.tenantId;
}
