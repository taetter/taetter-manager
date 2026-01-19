import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers.js";
import { getDb } from "./db.js";
import { patients, patientGuardians } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

describe("Patient Guardians Router", () => {
  const testTenantId = 1;
  let guardianPatientId: number;
  let minorPatientId: number;
  let relationshipId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Criar paciente responsável (adulto)
    const [guardian] = await db
      .insert(patients)
      .values({
        tenantId: testTenantId,
        nome: "João Silva",
        cpf: "12345678901",
        dataNascimento: new Date("1980-01-01"),
        sexo: "M",
        telefone: "(11) 98765-4321",
      })
      .$returningId();
    guardianPatientId = guardian.id;

    // Criar paciente menor
    const [minor] = await db
      .insert(patients)
      .values({
        tenantId: testTenantId,
        nome: "Maria Silva",
        cpf: "98765432100",
        dataNascimento: new Date("2015-06-15"),
        sexo: "F",
        telefone: "(11) 98765-4321",
        telefoneResponsavel: "(11) 98765-4321",
      })
      .$returningId();
    minorPatientId = minor.id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Limpar dados de teste
    if (relationshipId) {
      await db
        .delete(patientGuardians)
        .where(eq(patientGuardians.id, relationshipId));
    }

    if (minorPatientId) {
      await db.delete(patients).where(eq(patients.id, minorPatientId));
    }

    if (guardianPatientId) {
      await db.delete(patients).where(eq(patients.id, guardianPatientId));
    }
  });

  it("should create a guardian relationship", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin" },
      tenantId: testTenantId,
    });

    const result = await caller.patientGuardians.create({
      tenantId: testTenantId,
      minorPatientId,
      guardianPatientId,
      relacao: "pai",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    relationshipId = result.id;
  });

  it("should list guardians by minor patient", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin" },
      tenantId: testTenantId,
    });

    const guardians = await caller.patientGuardians.listByMinor({
      tenantId: testTenantId,
      minorPatientId,
    });

    expect(guardians).toBeDefined();
    expect(guardians.length).toBeGreaterThan(0);
    expect(guardians[0].guardianNome).toBe("João Silva");
    expect(guardians[0].relacao).toBe("pai");
  });

  it("should list minors by guardian patient", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin" },
      tenantId: testTenantId,
    });

    const minors = await caller.patientGuardians.listByGuardian({
      tenantId: testTenantId,
      guardianPatientId,
    });

    expect(minors).toBeDefined();
    expect(minors.length).toBeGreaterThan(0);
    expect(minors[0].minorNome).toBe("Maria Silva");
    expect(minors[0].relacao).toBe("pai");
  });

  it("should delete a guardian relationship", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin" },
      tenantId: testTenantId,
    });

    const result = await caller.patientGuardians.delete({
      tenantId: testTenantId,
      id: relationshipId,
    });

    expect(result.success).toBe(true);

    // Verificar que foi deletado
    const guardians = await caller.patientGuardians.listByMinor({
      tenantId: testTenantId,
      minorPatientId,
    });

    expect(guardians.length).toBe(0);
    relationshipId = 0; // Marcar como deletado para não tentar deletar novamente no afterAll
  });
});
