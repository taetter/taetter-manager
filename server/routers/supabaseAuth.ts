import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin, getSupabasePublicConfig } from "../_core/supabase.js";
import { getDb } from "../db.js";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Supabase Authentication Router
 * Handles user authentication via Supabase Auth
 * 
 * SECURITY:
 * - All auth operations go through Supabase Auth (no custom JWT)
 * - Service Role Key used only server-side
 * - Frontend receives only public config (URL + anon key)
 * 
 * ARCHITECTURE:
 * - Supabase Auth as single source of truth for identities
 * - Our database stores business data (role, tenantId, etc.)
 * - supabaseUserId links the two systems
 */

export const supabaseAuthRouter = router({
  /**
   * Get Supabase public configuration
   * Safe to expose to frontend - contains only URL and anon key
   */
  getConfig: publicProcedure.query(() => {
    return getSupabasePublicConfig();
  }),

  /**
   * Create user in our database after Supabase signup
   * Called by frontend after successful Supabase Auth signup
   * 
   * Flow:
   * 1. Frontend calls supabase.auth.signUp()
   * 2. Frontend receives Supabase user
   * 3. Frontend calls this procedure to create user in our DB
   */
  createUser: publicProcedure
    .input(
      z.object({
        supabaseUserId: z.string().uuid(),
        email: z.string().email(),
        name: z.string().optional(),
        role: z.enum(["user", "admin", "super_admin"]).default("user"),
        tenantId: z.number().int().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.supabaseUserId, input.supabaseUserId))
        .limit(1);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      // Create user in our database
      const [newUser] = await db.insert(users).values({
        supabaseUserId: input.supabaseUserId,
        email: input.email,
        name: input.name,
        role: input.role,
        tenantId: input.tenantId,
        loginMethod: "supabase",
      });

      return {
        success: true,
        userId: newUser.insertId,
      };
    }),

  /**
   * Create super admin user (Master Dashboard access)
   * Requires service role privileges
   * 
   * SECURITY:
   * - Only callable by authenticated super_admin
   * - Creates user in Supabase Auth + our database
   * - Password must meet security requirements
   */
  createSuperAdmin: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only super_admin can create other super_admins
      if (ctx.user?.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can create super admin users",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: true, // Auto-confirm email for admin users
          user_metadata: {
            name: input.name,
            role: "super_admin",
          },
        });

      if (authError || !authData.user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create user in Supabase: ${authError?.message}`,
        });
      }

      // Create user in our database
      const [newUser] = await db.insert(users).values({
        supabaseUserId: authData.user.id,
        email: input.email,
        name: input.name,
        role: "super_admin",
        tenantId: null, // Super admins don't belong to a tenant
        loginMethod: "supabase",
      });

      return {
        success: true,
        userId: newUser.insertId,
        supabaseUserId: authData.user.id,
      };
    }),

  /**
   * Get current user info
   * Returns user from database (includes role, tenantId, etc.)
   */
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  /**
   * Sync user data from Supabase to our database
   * Useful for updating email, name, etc. after Supabase profile update
   */
  syncUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Update user in our database
      await db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
      };
    }),
});
