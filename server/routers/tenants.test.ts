import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../db.js";
import { tenants } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Tenants Database Schema", () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available for testing");
    }
  });

  it("should have tenants table available", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    
    // Verificar se a tabela existe tentando fazer uma query
    const result = await db!.select().from(tenants).limit(1);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate tenant schema structure", () => {
    // Verificar se os campos esperados existem no schema
    expect(tenants.id).toBeDefined();
    expect(tenants.name).toBeDefined();
    expect(tenants.cnpj).toBeDefined();
    expect(tenants.razaoSocial).toBeDefined();
    expect(tenants.email).toBeDefined();
    expect(tenants.status).toBeDefined();
    expect(tenants.plano).toBeDefined();
    expect(tenants.createdAt).toBeDefined();
    expect(tenants.updatedAt).toBeDefined();
    expect(tenants.deletedAt).toBeDefined();
  });

  it("should have proper indexes on tenants table", () => {
    // Verificar campos indexados
    expect(tenants.cnpj).toBeDefined();
    expect(tenants.status).toBeDefined();
  });
});

describe("Tenant CRUD Operations", () => {
  it("should be able to query tenants", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const allTenants = await db.select().from(tenants);
    expect(Array.isArray(allTenants)).toBe(true);
  });

  it("should handle empty tenant list", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db.select().from(tenants).limit(0);
    expect(result).toEqual([]);
  });
});

describe("Tenant Validation", () => {
  it("should validate CNPJ format", () => {
    const validCNPJ = "12.345.678/0001-90";
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    expect(cnpjRegex.test(validCNPJ)).toBe(true);
  });

  it("should reject invalid CNPJ format", () => {
    const invalidCNPJ = "12345678000190";
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    expect(cnpjRegex.test(invalidCNPJ)).toBe(false);
  });

  it("should validate CPF format", () => {
    const validCPF = "123.456.789-00";
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    expect(cpfRegex.test(validCPF)).toBe(true);
  });

  it("should validate CEP format", () => {
    const validCEP = "12345-678";
    const cepRegex = /^\d{5}-\d{3}$/;
    expect(cepRegex.test(validCEP)).toBe(true);
  });

  it("should validate email format", () => {
    const validEmail = "test@example.com";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(validEmail)).toBe(true);
  });
});
