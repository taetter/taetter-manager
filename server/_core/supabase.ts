import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration - centralized env vars validation
 * 
 * IMPORTANT: This module does NOT throw errors during initialization
 * to prevent breaking the entire server. Instead, it returns null
 * and logs warnings. Endpoints should check for null and return
 * proper JSON error responses.
 */

// Get env vars (may be undefined)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate and log warnings (do NOT throw)
if (!SUPABASE_URL) {
  console.warn('[Supabase] Missing required environment variable: SUPABASE_URL');
  console.warn('[Supabase] Supabase client will not be available');
}

if (!SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Missing required environment variable: SUPABASE_ANON_KEY');
  console.warn('[Supabase] Supabase client will not be available');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY - admin operations will fail');
}

/**
 * Supabase client for public operations (anon key)
 * Use this for client-side auth flows
 * Returns null if env vars are not configured
 */
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Supabase admin client for server-side operations (service_role key)
 * Use this ONLY for administrative operations like creating users, resetting passwords
 * NEVER expose this client to the frontend
 * Returns null if env vars are not configured
 */
export const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Export env vars for use in other modules
 */
export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  isConfigured: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
  isAdminConfigured: !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
};

// Log configuration status on startup
if (supabaseConfig.isConfigured) {
  console.log('[Supabase] Client configured successfully');
} else {
  console.warn('[Supabase] Client NOT configured - missing env vars');
}

if (supabaseConfig.isAdminConfigured) {
  console.log('[Supabase] Admin client configured successfully');
} else {
  console.warn('[Supabase] Admin client NOT configured - missing SUPABASE_SERVICE_ROLE_KEY');
}
