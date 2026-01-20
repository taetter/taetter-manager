import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client (Frontend)
 * Uses ANON_KEY for public operations
 * 
 * SECURITY:
 * - Only use for authentication (signIn, signOut, session)
 * - NEVER use for direct data mutations
 * - All data operations must go through tRPC
 * 
 * ARCHITECTURE:
 * - RLS policies enforce data access control
 * - Frontend limited to auth operations only
 * - Business logic lives in tRPC procedures
 */

// Get Supabase config from backend (safe - only URL and anon key)
// This will be populated by the app initialization
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Supabase client with config from backend
 * Call this once during app startup
 */
export async function initSupabase(url: string, anonKey: string) {
  supabaseClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  });
  
  return supabaseClient;
}

/**
 * Get Supabase client instance
 * Throws if not initialized
 */
export function getSupabase() {
  if (!supabaseClient) {
    throw new Error(
      '[Supabase] Client not initialized. Call initSupabase() first.'
    );
  }
  return supabaseClient;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: { name?: string }) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = getSupabase();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get current session
 * Returns null if not authenticated
 */
export async function getSession() {
  const supabase = getSupabase();
  
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[Supabase] Failed to get session:', error);
    return null;
  }
  
  return data.session;
}

/**
 * Get current user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = getSupabase();
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('[Supabase] Failed to get user:', error);
    return null;
  }
  
  return data.user;
}

/**
 * Listen to auth state changes
 * Useful for updating UI when user signs in/out
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabase();
  
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Reset password for email
 */
export async function resetPassword(email: string) {
  const supabase = getSupabase();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update password (requires current session)
 */
export async function updatePassword(newPassword: string) {
  const supabase = getSupabase();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    throw new Error(error.message);
  }
}
