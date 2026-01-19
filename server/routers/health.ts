import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { supabase, supabaseAdmin, supabaseConfig } from "../_core/supabase.js";

/**
 * Health check router
 * Validates environment variables and database connections
 */
export const healthRouter = router({
  /**
   * Check system health
   * Returns status of env vars, database, and auth
   */
  check: publicProcedure.query(async () => {
    const health = {
      ok: true,
      timestamp: new Date().toISOString(),
      env: {
        supabaseUrl: !!supabaseConfig.url,
        supabaseAnonKey: !!supabaseConfig.anonKey,
        supabaseServiceRoleKey: !!supabaseConfig.serviceRoleKey,
        databaseUrl: !!process.env.DATABASE_URL,
        jwtSecret: !!process.env.JWT_SECRET,
      },
      database: {
        connected: false,
        error: null as string | null,
      },
      auth: {
        available: false,
        adminAvailable: false,
        error: null as string | null,
      },
    };

    // Check database connection
    try {
      const db = await getDb();
      if (db) {
        // Try a simple query
        await db.execute('SELECT 1');
        health.database.connected = true;
      } else {
        health.database.error = "Database client not initialized";
        health.ok = false;
      }
    } catch (error) {
      health.database.error = error instanceof Error ? error.message : "Unknown database error";
      health.ok = false;
    }

    // Check Supabase Auth
    try {
      // Test anon client
      const { error: anonError } = await supabase.auth.getSession();
      if (anonError) {
        health.auth.error = `Anon client error: ${anonError.message}`;
      } else {
        health.auth.available = true;
      }

      // Test admin client
      if (supabaseAdmin) {
        const { error: adminError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
        if (adminError) {
          health.auth.error = health.auth.error 
            ? `${health.auth.error}; Admin client error: ${adminError.message}`
            : `Admin client error: ${adminError.message}`;
        } else {
          health.auth.adminAvailable = true;
        }
      } else {
        health.auth.error = health.auth.error
          ? `${health.auth.error}; Admin client not initialized`
          : "Admin client not initialized";
      }
    } catch (error) {
      health.auth.error = error instanceof Error ? error.message : "Unknown auth error";
      health.ok = false;
    }

    return health;
  }),

  /**
   * Simple ping endpoint
   */
  ping: publicProcedure.query(() => {
    return {
      ok: true,
      message: "pong",
      timestamp: new Date().toISOString(),
    };
  }),
});
