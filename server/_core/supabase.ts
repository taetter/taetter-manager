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

// Debug logging (will appear in Vercel logs)
console.log('[Supabase Init] Environment check:', {
  SUPABASE_URL: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'MISSING',
  SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'MISSING',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (hidden)' : 'MISSING',
  NODE_ENV: process.env.NODE_ENV,
});

// Graceful degradation: warn but don't crash if env vars missing
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Supabase] WARNING: Missing required environment variables');
  console.warn('[Supabase] Supabase features will be disabled until env vars are configured');
  console.warn('[Supabase] Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY');
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
export const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null as any; // Fallback when env vars missing

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
  
  if (!anonKey || !SUPABASE_URL) {
    throw new Error(
      '[Supabase] SUPABASE_URL and SUPABASE_ANON_KEY are required. Check Vercel environment variables.'
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
