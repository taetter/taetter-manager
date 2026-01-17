import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration - centralized env vars validation
 */

// Validate required env vars
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing required environment variable: SUPABASE_URL');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variable: SUPABASE_ANON_KEY');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY - admin operations will fail');
}

/**
 * Supabase client for public operations (anon key)
 * Use this for client-side auth flows
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase admin client for server-side operations (service_role key)
 * Use this ONLY for administrative operations like creating users, resetting passwords
 * NEVER expose this client to the frontend
 */
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
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
};
