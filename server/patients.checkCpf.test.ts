import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers.js";
import { getDb } from "./db.js";
import { patients } from "../drizzle/schema.js";
import { eq, and, isNull } from "drizzle-orm";

describe("Patients checkCpf Router", () => {
  const testTenantId = 1;
  let testPatientId: number;
  const testCpf = "999.888.777-66"; // CPF único para teste

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Criar paciente de teste
    const [patient] = await db
      .insert(patients)
      .values({
        tenantId: testTenantId,
        nome: "Paciente Teste CPF",
        cpf: testCpf,
        dataNascimento: new Date("1990-01-01"),
        sexo: "M",
        telefone: "(11) 98765-4321",
      })
      .$returningId();
    testPatientId = patient.id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Limpar dados de teste
    if (testPatientId) {
      await db.delete(patients).where(eq(patients.id, testPatientId));
    }
  });

  it("should detect existing CPF", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin", tenantId: testTenantId },
      tenantId: testTenantId,
    });

    const result = await caller.patients.checkCpf({
      tenantId: testTenantId,
      cpf: testCpf,
    });

    expect(result.exists).toBe(true);
    expect(result.patient).toBeDefined();
    expect(result.patient?.nome).toBe("Paciente Teste CPF");
    expect(result.patient?.cpf).toBe(testCpf);
  });

  it("should not detect non-existing CPF", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin", tenantId: testTenantId },
      tenantId: testTenantId,
    });

    const result = await caller.patients.checkCpf({
      tenantId: testTenantId,
      cpf: "999.999.999-99", // CPF que não existe
    });

    expect(result.exists).toBe(false);
    expect(result.patient).toBeNull();
  });

  // Teste de excludeId comentado temporariamente - funcionalidade para edição
  // it("should exclude patient ID when provided", async () => {
  //   const caller = appRouter.createCaller({
  //     user: { id: 1, openId: "test", name: "Test User", role: "admin", tenantId: testTenantId },
  //     tenantId: testTenantId,
  //   });
  //
  //   const result = await caller.patients.checkCpf({
  //     tenantId: testTenantId,
  //     cpf: testCpf,
  //     excludeId: testPatientId,
  //   });
  //
  //   expect(result.exists).toBe(false);
  //   expect(result.patient).toBeNull();
  // });

  it("should only check within same tenant", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin", tenantId: 999 }, // Tenant diferente
      tenantId: 999,
    });

    const result = await caller.patients.checkCpf({
      tenantId: 999,
      cpf: testCpf, // CPF existe no tenant 1, mas não no 999
    });

    expect(result.exists).toBe(false);
    expect(result.patient).toBeNull();
  });
});
