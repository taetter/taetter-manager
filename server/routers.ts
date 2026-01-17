import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { tenantsRouter } from "./routers/tenants";
import { patientsRouter } from "./routers/patients";
import { customAuthRouter } from "./routers/customAuth";
import { uploadRouter } from "./routers/upload";
import { patientAuthRouter } from "./routers/patientAuth";
import { unitsRouter } from "./routers/units";
import { refrigeratorsRouter } from "./routers/refrigerators";
import { vaccineApplicationsRouter } from "./routers/vaccineApplications";
import { paymentsRouterApp } from "./routers/paymentsRouter";
import { vaccinesRouter } from "./routers/vaccines";
import { budgetsRouter } from "./routers/budgets";
import { patientBudgetsRouter } from "./routers/patientBudgets";
import { financialTransactionsRouter } from "./routers/financialTransactions";
import { indicatorsRouter } from "./routers/indicators";
import { qualityRouter } from "./routers/quality";
import { hrRouter } from "./routers/hr";
import { integrationsRouter } from "./routers/integrations";
import { employeeAuthRouter } from "./routers/employeeAuth";
import { vaccinePricesRouter } from "./routers/vaccinePrices";
import { priceCampaignsRouter } from "./routers/priceCampaigns";
import { priceTablesRouter } from "./routers/priceTables";
import { patientGuardiansRouter } from "./routers/patientGuardians";
import { bankAccountsRouter } from "./routers/bankAccounts";
import { appointmentsRouter } from "./routers/appointments";
import { tenantIntegrationsRouter } from "./routers/tenantIntegrations";
import { healthRouter } from "./routers/health";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Health check
  health: healthRouter,
  
  // Custom authentication
  customAuth: customAuthRouter,
  
  // Feature routers
  tenants: tenantsRouter,
  tenantIntegrations: tenantIntegrationsRouter,
  patients: patientsRouter,
  patientGuardians: patientGuardiansRouter,
  upload: uploadRouter,
  patientAuth: patientAuthRouter,
  
  // Application module routers
  units: unitsRouter,
  refrigerators: refrigeratorsRouter,
  vaccines: vaccinesRouter,
  budgets: budgetsRouter,
  patientBudgets: patientBudgetsRouter,
  vaccineApplications: vaccineApplicationsRouter,
  paymentsApp: paymentsRouterApp,
  
  // Financial module routers
  financialTransactions: financialTransactionsRouter,
  bankAccounts: bankAccountsRouter,
  
  // Scheduling module routers
  appointments: appointmentsRouter,
  priceTables: priceTablesRouter,
  vaccinePrices: vaccinePricesRouter,
  priceCampaigns: priceCampaignsRouter,
  
  // Indicators module
  indicators: indicatorsRouter,
  
  // Quality module
  quality: qualityRouter,
  hr: hrRouter,
  integrations: integrationsRouter,
  employeeAuth: employeeAuthRouter,
});

export type AppRouter = typeof appRouter;
