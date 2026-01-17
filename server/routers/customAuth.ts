import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { supabase, supabaseAdmin } from "../_core/supabase";

/**
 * Custom authentication router using Supabase Auth
 * 
 * IMPORTANT:
 * - Passwords are managed by Supabase Auth, NOT stored in the users table
 * - Use supabase.auth.signInWithPassword for login (client-side)
 * - Use supabaseAdmin.auth.admin.createUser for creating users (server-side only)
 * - NEVER store or update passwordHash in the users table
 */
export const customAuthRouter = router({
  /**
   * Login with email and password using Supabase Auth
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        if (!data.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não encontrado",
          });
        }

        // Get user from database
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não encontrado no sistema",
          });
        }

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fazer login",
        });
      }
    }),

  /**
   * Logout using Supabase Auth
   */
  logout: publicProcedure.mutation(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("[Auth] Logout error:", error);
      }

      return {
        success: true,
      } as const;
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      return {
        success: true, // Return success anyway to clear client state
      } as const;
    }
  }),

  /**
   * Create super admin user (idempotent)
   * Uses Supabase Admin API to create user in auth.users
   * 
   * IMPORTANT: This endpoint should be protected or removed after initial setup
   */
  createSuperAdmin: publicProcedure.mutation(async () => {
    if (!supabaseAdmin) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Supabase Admin client not available - missing SUPABASE_SERVICE_ROLE_KEY",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const email = 'master@taetter.com.br';
    const password = 'gabriel';
    const name = 'Gabriel Franceschi';

    try {
      // Check if user exists in Supabase Auth
      const { data: existingAuthUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list users: ${listError.message}`,
        });
      }

      const existingAuthUser = existingAuthUsers.users.find(u => u.email === email);

      let authUserId: string;

      if (existingAuthUser) {
        authUserId = existingAuthUser.id;
        console.log(`[Auth] User ${email} already exists in Supabase Auth (${authUserId})`);
      } else {
        // Create user in Supabase Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name,
          },
        });

        if (createError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create user in Supabase Auth: ${createError.message}`,
          });
        }

        if (!newUser.user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user - no user returned",
          });
        }

        authUserId = newUser.user.id;
        console.log(`[Auth] Created user ${email} in Supabase Auth (${authUserId})`);
      }

      // Check if user exists in our database
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        // Update existing user
        await db
          .update(users)
          .set({
            openId: authUserId,
            name,
            role: 'super_admin',
            loginMethod: 'supabase',
          })
          .where(eq(users.email, email));

        return {
          success: true,
          message: `Super admin '${email}' updated successfully`,
          userId: existingUser.id,
          authUserId,
        };
      }

      // Insert new user in database
      const [result] = await db.insert(users).values({
        openId: authUserId,
        email,
        name,
        role: 'super_admin',
        loginMethod: 'supabase',
      });

      return {
        success: true,
        message: `Super admin '${email}' created successfully`,
        userId: result.insertId,
        authUserId,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      console.error("[Auth] createSuperAdmin error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Unknown error creating super admin",
      });
    }
  }),
});
