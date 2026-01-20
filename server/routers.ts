import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { tenantsRouter } from "./routers/tenants.js";
import { patientsRouter } from "./routers/patients.js";
import { uploadRouter } from "./routers/upload.js";
import { patientAuthRouter } from "./routers/patientAuth.js";
import { unitsRouter } from "./routers/units.js";
import { refrigeratorsRouter } from "./routers/refrigerators.js";
import { vaccineApplicationsRouter } from "./routers/vaccineApplications.js";
import { paymentsRouterApp } from "./routers/paymentsRouter.js";
import { vaccinesRouter } from "./routers/vaccines.js";
import { budgetsRouter } from "./routers/budgets.js";
import { patientBudgetsRouter } from "./routers/patientBudgets.js";
import { financialTransactionsRouter } from "./routers/financialTransactions.js";
import { indicatorsRouter } from "./routers/indicators.js";
import { qualityRouter } from "./routers/quality.js";
import { hrRouter } from "./routers/hr.js";
// Temporarily disabled routers with TypeScript errors
// import { integrationsRouter } from "./routers/integrations.js";
import { employeeAuthRouter } from "./routers/employeeAuth.js";
import { vaccinePricesRouter } from "./routers/vaccinePrices.js";
import { priceCampaignsRouter } from "./routers/priceCampaigns.js";
import { priceTablesRouter } from "./routers/priceTables.js";
import { patientGuardiansRouter } from "./routers/patientGuardians.js";
// import { bankAccountsRouter } from "./routers/bankAccounts.js";
// import { appointmentsRouter } from "./routers/appointments.js";
import { tenantIntegrationsRouter } from "./routers/tenantIntegrations.js";
import { supabaseAuthRouter } from "./routers/supabaseAuth.js";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  // Authentication routers
  supabaseAuth: supabaseAuthRouter,
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
  // bankAccounts: bankAccountsRouter, // Temporarily disabled - TypeScript errors
  
  // Scheduling module routers
  // appointments: appointmentsRouter, // Temporarily disabled - TypeScript errors
  priceTables: priceTablesRouter,
  vaccinePrices: vaccinePricesRouter,
  priceCampaigns: priceCampaignsRouter,
  
  // Indicators module
  indicators: indicatorsRouter,
  
  // Quality module
  quality: qualityRouter,
  hr: hrRouter,
  // integrations: integrationsRouter, // Temporarily disabled - TypeScript errors
  employeeAuth: employeeAuthRouter,
});

export type AppRouter = typeof appRouter;
