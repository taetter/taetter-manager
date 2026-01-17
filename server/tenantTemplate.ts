import { getDb } from "./db";
import {
  tenants,
  users,
  vaccines,
  employees,
  type InsertUser,
} from "../drizzle/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

/**
 * Initialize a new tenant with template data
 * This function is called automatically when a tenant is created
 */
export async function initializeTenantTemplate(tenantId: number, adminEmail: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // 1. Create tenant admin user
    const adminOpenId = `tenant-admin-${nanoid(10)}`;
    await db.insert(users).values({
      openId: adminOpenId,
      email: adminEmail,
      role: "admin",
      tenantId: tenantId,
      name: "Administrador",
    });

    // 2. Initialize default vaccine categories (example data)
    const defaultVaccines = [
      {
        tenantId,
        nome: "Vacina Exemplo - Influenza",
        fabricante: "Fabricante Exemplo",
        lote: "LOTE-EXEMPLO-001",
        validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        categoria: "Rotina",
        doencas: JSON.stringify(["Gripe"]),
        quantidadeTotal: 0,
        quantidadeDisponivel: 0,
        ativo: false, // Inactive example
      },
    ];

    await db.insert(vaccines).values(defaultVaccines);

    // 3. Create example employee (the admin)
    await db.insert(employees).values({
      tenantId,
      nome: "Administrador",
      cpf: "000.000.000-00",
      cargo: "Administrador",
      email: adminEmail,
      ativo: true,
    });

    console.log(`[TenantTemplate] Tenant ${tenantId} initialized successfully`);
    
    return {
      success: true,
      adminOpenId,
    };
  } catch (error) {
    console.error(`[TenantTemplate] Failed to initialize tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Clone tenant template structure for a new tenant
 * This creates all necessary initial data
 */
export async function cloneTenantTemplate(tenantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // In the future, this could clone from a "template tenant" with pre-configured data
  // For now, we just initialize with empty structure
  
  console.log(`[TenantTemplate] Template cloned for tenant ${tenantId}`);
  
  return {
    success: true,
    message: "Tenant template cloned successfully",
  };
}

/**
 * Get tenant configuration
 */
export async function getTenantConfig(tenantId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const tenantResult = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const tenant = tenantResult[0];

  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`);
  }

  // Parse configurations JSON
  let config = {};
  if (tenant.configuracoes) {
    try {
      config = JSON.parse(tenant.configuracoes);
    } catch (e) {
      console.error("Failed to parse tenant config:", e);
    }
  }

  return {
    ...tenant,
    config,
  };
}

/**
 * Update tenant configuration
 */
export async function updateTenantConfig(
  tenantId: number,
  config: Record<string, any>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(tenants)
    .set({
      configuracoes: JSON.stringify(config),
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  return {
    success: true,
  };
}

/**
 * Get tenant modules (features enabled)
 */
export function getTenantModules(tenantConfig: any) {
  const defaultModules = [
    "patients",
    "stock",
    "applications",
    "financial",
    "hr",
  ];

  return tenantConfig?.modules || defaultModules;
}

/**
 * Check if tenant has access to a specific module
 */
export function tenantHasModule(tenantConfig: any, module: string): boolean {
  const modules = getTenantModules(tenantConfig);
  return modules.includes(module);
}
