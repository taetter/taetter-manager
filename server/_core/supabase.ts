import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client (Server-side ONLY)
 * Uses SERVICE_ROLE_KEY for privileged operations
 * 
 * SECURITY:
 * - NEVER expose this client to the frontend
 * - NEVER send service_role_key to browser
 * - Use only for admin operations (createUser, bypass RLS, etc.)
 * 
 * ARCHITECTURE:
 * - Fail-fast: validates env vars at module load
 * - Single source of truth for Supabase credentials
 * - Type-safe exports for use in routers
 */

// Validate environment variables at module load (fail-fast)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    '[Supabase] SUPABASE_URL is required. Set it in Vercel environment variables.'
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    '[Supabase] SUPABASE_SERVICE_ROLE_KEY is required. Set it in Vercel environment variables.'
  );
}

/**
 * Admin client with service_role privileges
 * Can bypass RLS policies - use with extreme caution
 * 
 * Use cases:
 * - Create users programmatically
 * - Admin operations (support, auditing)
 * - Bypass RLS for system operations
 */
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Type-safe database access
 * Use this for all server-side database operations
 */
export const supabaseDb = supabaseAdmin;

/**
 * Helper to get Supabase public config for frontend
 * Safe to expose - does not contain secrets
 * 
 * Returns:
 * - url: Supabase project URL
 * - anonKey: Public anonymous key (safe for frontend)
 */
export function getSupabasePublicConfig() {
  const anonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!anonKey) {
    throw new Error(
      '[Supabase] SUPABASE_ANON_KEY is required for frontend config.'
    );
  }
  
  return {
    url: SUPABASE_URL,
    anonKey,
  };
}

/**
 * Verify Supabase JWT token (from Authorization header)
 * 
 * @param token - JWT token from Authorization: Bearer <token>
 * @returns User object if valid, null if invalid
 */
export async function verifySupabaseToken(token: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) {
      console.warn('[Supabase] Token verification failed:', {
        error: error.message,
        code: error.status,
      });
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('[Supabase] Unexpected error verifying token:', error);
    return null;
  }
}
