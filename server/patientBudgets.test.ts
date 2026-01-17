import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { tenants, patients, vaccines, vaccinePrices } from "../drizzle/schema";

describe("Patient Budgets Router", () => {
  let testTenantId: number;
  let testPatientId: number;
  let testVaccineId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Criar tenant de teste com CNPJ único
    const randomSuffix = Math.floor(Math.random() * 1000);
    const [tenant] = await db.insert(tenants).values({
      name: `Clínica Teste Orçamento`,
      cnpj: `12.345.${randomSuffix.toString().padStart(3, '0')}/01-90`,
      razaoSocial: `Clínica Teste Orçamento LTDA`,
      email: `teste${randomSuffix}@clinica.com`,
      status: "ativo",
      plan: "basic",
    }).$returningId();
    testTenantId = tenant.id;

    // Criar paciente de teste
    const [patient] = await db.insert(patients).values({
      tenantId: testTenantId,
      nome: "João da Silva",
      cpf: "123.456.789-00",
      email: "joao@email.com",
      celular: "(11) 98765-4321",
      dataNascimento: new Date("1990-01-01"),
    }).$returningId();
    testPatientId = patient.id;

    // Criar vacina de teste
    const [vaccine] = await db.insert(vaccines).values({
      tenantId: testTenantId,
      nome: "Vacina Teste",
      fabricante: "Fabricante Teste",
      lote: "LOTE123",
      quantidadeDisponivel: 100,
      quantidadeMinima: 10,
      validade: new Date("2025-12-31"),
      tipo: "inativada",
    }).$returningId();
    testVaccineId = vaccine.id;

    // Criar preço de teste
    await db.insert(vaccinePrices).values({
      tenantId: testTenantId,
      vaccineId: testVaccineId,
      preco: 15000, // R$ 150,00 em centavos
      ativo: true,
      dataInicio: new Date("2025-01-01"),
    });
  });

  it("deve calcular preço de vacinas corretamente", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.patientBudgets.calculatePrice({
      tenantId: testTenantId,
      vaccineIds: [testVaccineId],
    });

    expect(result).toHaveLength(1);
    expect(result[0].vaccineId).toBe(testVaccineId);
    expect(result[0].vaccineName).toBe("Vacina Teste");
    expect(result[0].preco).toBe(15000);
    expect(result[0].semPreco).toBe(false);
  });

  it("deve criar orçamento com sucesso", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const hoje = new Date();
    const dataValidade = new Date(hoje);
    dataValidade.setDate(dataValidade.getDate() + 7);

    const result = await caller.patientBudgets.create({
      tenantId: testTenantId,
      nome: "João da Silva",
      cpf: "123.456.789-00",
      dataNascimento: "1990-01-01",
      email: "joao@email.com",
      celular: "(11) 98765-4321",
      vaccineIds: [testVaccineId],
      vaccineNames: "Vacina Teste",
      vaccinePrices: [15000],
      valorTotal: 15000,
      desconto: 0,
      valorFinal: 15000,
      dataValidade: dataValidade.toISOString().split("T")[0],
    });

    expect(result.id).toBeDefined();
    expect(result.numero).toMatch(/^ORÇ-\d{8}-\d{4}$/);
  });

  it("deve listar orçamentos do tenant", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.patientBudgets.list({
      tenantId: testTenantId,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("deve retornar estatísticas de conversão", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.patientBudgets.getConversionStats({
      tenantId: testTenantId,
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.convertidos).toBeGreaterThanOrEqual(0);
    expect(result.pendentes).toBeGreaterThanOrEqual(0);
    expect(result.taxaConversao).toBeGreaterThanOrEqual(0);
  });
});
