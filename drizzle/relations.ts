import { relations } from "drizzle-orm";
import { users, tenants, auditLogs } from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  auditLogs: many(auditLogs),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
}));
