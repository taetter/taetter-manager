import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyToken } from "../routers/customAuth";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { COOKIE_NAME } from "../../shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Try custom JWT authentication first
  const token = opts.req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = await verifyToken(token);
      if (payload) {
        const db = await getDb();
        if (db) {
          const [foundUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1);
          if (foundUser) {
            user = foundUser;
          }
        }
      }
    } catch (error) {
      // JWT verification failed, try OAuth
    }
  }

  // Fallback to Manus OAuth if custom auth failed
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
