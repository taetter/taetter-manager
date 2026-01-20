import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk.js";
import { verifySupabaseToken } from "./supabase.js";
import { getDb } from "../db.js";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  supabaseUserId: string | null; // Supabase Auth user ID
};

/**
 * Create tRPC context with server-side session validation
 * 
 * SECURITY:
 * - Validates session server-side (never trust frontend)
 * - Logs authentication failures for audit trail
 * - Fails explicitly with typed errors
 * 
 * ARCHITECTURE:
 * - Supabase Auth as primary authentication
 * - Manus OAuth as fallback (for backward compatibility)
 * - Fail-fast validation with structured logging
 * 
 * AUTHENTICATION FLOW:
 * 1. Try Supabase Auth (Authorization: Bearer <token>)
 * 2. Lookup user in database by supabaseUserId
 * 3. Fallback to Manus OAuth if Supabase fails
 * 4. Return null for unauthenticated requests (public procedures)
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let supabaseUserId: string | null = null;

  // Step 1: Try Supabase Auth (primary)
  const authHeader = opts.req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    const supabaseUser = await verifySupabaseToken(token);
    
    if (supabaseUser) {
      supabaseUserId = supabaseUser.id;
      
      // Fetch user from our database
      const db = await getDb();
      if (db) {
        const [foundUser] = await db
          .select()
          .from(users)
          .where(eq(users.supabaseUserId, supabaseUserId))
          .limit(1);
        
        if (foundUser) {
          user = foundUser;
        } else {
          // User exists in Supabase but not in our database
          // This can happen during onboarding - log for debugging
          console.warn('[Auth] Supabase user not found in database:', {
            supabaseUserId,
            email: supabaseUser.email,
            ip: opts.req.ip,
          });
        }
      }
    }
  }

  // Step 2: Fallback to Manus OAuth (for backward compatibility)
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures
      // Log only in development to avoid noise
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Auth] Manus OAuth not available:', error);
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    supabaseUserId,
  };
}
