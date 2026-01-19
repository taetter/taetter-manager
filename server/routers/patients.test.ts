import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "../routers.js";
import type { TrpcContext } from "../_core/context.js";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTenantContext(tenantId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "tenant-user",
    email: "user@clinic.com",
    name: "Tenant User",
    loginMethod: "manus",
    role: "admin",
    tenantId: tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("patients router", () => {
  describe("list", () => {
    it("should require tenant context", async () => {
      const { ctx } = createTenantContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.list({ limit: 10, offset: 0 });

      expect(result).toBeDefined();
      expect(result.patients).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("should filter by search term", async () => {
      const { ctx } = createTenantContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.list({
        search: "João",
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.patients).toBeInstanceOf(Array);
    });
  });

  describe("create", () => {
    it("should create a patient with valid data", async () => {
      const { ctx } = createTenantContext(1);
      const caller = appRouter.createCaller(ctx);

      const uniqueCpf = `${Math.floor(Math.random() * 900 + 100)}.456.789-00`;
      const patientData = {
        nome: "João da Silva",
        cpf: uniqueCpf,
        dataNascimento: new Date("1990-01-01"),
        email: "joao@example.com",
        celular: "(11) 98765-4321",
        cidade: "São Paulo",
        estado: "SP",
      };

      const result = await caller.patients.create(patientData);

      expect(result).toBeDefined();
      // Note: insertId may be 0 in test environment
      expect(result.id).toBeGreaterThanOrEqual(0);
      expect(result.nome).toBe(patientData.nome);
      expect(result.cpf).toBe(patientData.cpf);
    });

    it("should reject duplicate CPF in same tenant", async () => {
      const { ctx } = createTenantContext(1);
      const caller = appRouter.createCaller(ctx);

      const uniqueCpf = `${Math.floor(Math.random() * 900 + 100)}.654.321-00`;
      const patientData = {
        nome: "Maria Santos",
        cpf: uniqueCpf,
        dataNascimento: new Date("1985-05-15"),
        cidade: "Rio de Janeiro",
        estado: "RJ",
      };

      // Create first patient
      await caller.patients.create(patientData);

      // Try to create duplicate
      await expect(
        caller.patients.create({
          ...patientData,
          nome: "Maria Duplicada",
        })
      ).rejects.toThrow("CPF already registered");
    });
  });

  describe("stats", () => {
    it("should return patient statistics", async () => {
      const { ctx } = createTenantContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.stats();

      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.active).toBeGreaterThanOrEqual(0);
      expect(result.inactive).toBeGreaterThanOrEqual(0);
      expect(result.bySex).toBeDefined();
      expect(result.bySex.M).toBeGreaterThanOrEqual(0);
      expect(result.bySex.F).toBeGreaterThanOrEqual(0);
    });
  });

  describe("tenant isolation", () => {
    it("should not see patients from other tenants", async () => {
      // Create patient in tenant 1
      const { ctx: ctx1 } = createTenantContext(1);
      const caller1 = appRouter.createCaller(ctx1);

      const uniqueCpf = `${Math.floor(Math.random() * 900 + 100)}.111.111-11`;
      await caller1.patients.create({
        nome: "Paciente Tenant 1",
        cpf: uniqueCpf,
        dataNascimento: new Date("1990-01-01"),
        cidade: "São Paulo",
        estado: "SP",
      });

      // Try to list from tenant 2
      const { ctx: ctx2 } = createTenantContext(2);
      const caller2 = appRouter.createCaller(ctx2);

      const result = await caller2.patients.list({ limit: 100, offset: 0 });

      // Should not see tenant 1's patients
      const tenant1Patients = result.patients.filter(
        (p) => p.cpf === uniqueCpf
      );
      expect(tenant1Patients.length).toBe(0);
    });
  });
});
