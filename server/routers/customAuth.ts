import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-me");

/**
 * Generate JWT token for authenticated user
 */
async function generateToken(userId: number, username: string, role: string): Promise<string> {
  const token = await new SignJWT({ userId, username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; username: string; role: string };
  } catch (error) {
    return null;
  }
}

/**
 * Custom authentication router
 */
export const customAuthRouter = router({
  /**
   * Login with username and password
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
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

      // Find user by username
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário ou senha inválidos",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário ou senha inválidos",
        });
      }

      // Generate JWT token
      const token = await generateToken(user.id, user.username!, user.role);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      };
    }),

  /**
   * Logout
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  /**
   * Create super admin (temporary endpoint - remove after use)
   */
  createSuperAdmin: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const username = 'gfranceschi';
    const password = 'gabriel';
    const name = 'Gabriel Franceschi';
    const email = 'gabriel@taetter.com.br';

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      // Update password
      const passwordHash = await bcrypt.hash(password, 10);
      await db
        .update(users)
        .set({ passwordHash, role: 'super_admin' })
        .where(eq(users.username, username));
      
      return {
        success: true,
        message: `User '${username}' updated`,
        userId: existingUser.id,
      };
    }

    // Create password hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.insert(users).values({
      username,
      passwordHash,
      name,
      email,
      role: 'super_admin',
      loginMethod: 'custom',
    });

    return {
      success: true,
      message: `Super admin '${username}' created successfully`,
      userId: result.insertId,
    };
  }),
});
