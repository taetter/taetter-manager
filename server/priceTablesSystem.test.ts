import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { tenants, priceTables, vaccinePrices, vaccines } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Price Tables System", () => {
  let testTenantId: number;
  let testVaccineId: number;
  let testPriceTableId: number;
  let testPriceTableId2: number;

  const createCaller = (tenantId: number) => {
    return appRouter.createCaller({
      user: {
        id: 1,
        openId: null,
        username: "testuser",
        passwordHash: "",
        name: "Test User",
        email: "test@test.com",
        loginMethod: "custom",
        role: "admin",
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });
  };

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Criar tenant de teste
    const uniqueCNPJ = `99999${Date.now().toString().slice(-8)}`;
    const [tenantResult] = await db.insert(tenants).values({
      name: "Test Clinic Price Tables",
      cnpj: uniqueCNPJ,
      razaoSocial: "Test Clinic Price Tables LTDA",
      email: "test-pricetables@test.com",
      status: "ativo",
    });
    testTenantId = Number(tenantResult.insertId);

    // Criar vacina de teste
    const [vaccineResult] = await db.insert(vaccines).values({
      tenantId: testTenantId,
      nome: "Vacina Teste Preços",
      fabricante: "Fabricante Teste",
      lote: "LOTE-TEST-001",
      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      quantidadeDisponivel: 100,
      temperaturaArmazenamento: "2-8°C",
      viaAdministracao: "Intramuscular",
      status: "disponivel",
    });
    testVaccineId = Number(vaccineResult.insertId);
  });

  it("Deve criar tabela de preços", async () => {
    const caller = createCaller(testTenantId);

    const result = await caller.priceTables.create({
      tenantId: testTenantId,
      nome: "Particular",
      descricao: "Tabela de preços para clientes particulares",
      padrao: true,
    });

    expect(result.id).toBeDefined();
    testPriceTableId = result.id;
  });

  it("Deve listar tabelas de preços", async () => {
    const caller = createCaller(testTenantId);

    const tables = await caller.priceTables.list({
      tenantId: testTenantId,
    });

    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0].nome).toBe("Particular");
    expect(tables[0].padrao).toBe(true);
  });

  it("Deve buscar tabela padrão", async () => {
    const caller = createCaller(testTenantId);

    const defaultTable = await caller.priceTables.getDefault({
      tenantId: testTenantId,
    });

    expect(defaultTable).toBeDefined();
    expect(defaultTable?.nome).toBe("Particular");
    expect(defaultTable?.padrao).toBe(true);
  });

  it("Deve criar segunda tabela de preços", async () => {
    const caller = createCaller(testTenantId);

    const result = await caller.priceTables.create({
      tenantId: testTenantId,
      nome: "5% de Desconto",
      descricao: "Tabela com 5% de desconto para colaboradores",
      padrao: false,
    });

    expect(result.id).toBeDefined();
    testPriceTableId2 = result.id;
  });

  it("Deve adicionar preço de vacina na tabela Particular", async () => {
    const caller = createCaller(testTenantId);

    const result = await caller.vaccinePrices.create({
      tenantId: testTenantId,
      priceTableId: testPriceTableId,
      vaccineId: testVaccineId,
      preco: 10000, // R$ 100,00
      dataInicio: new Date().toISOString(),
      ativo: true,
    });

    expect(result.id).toBeDefined();
  });

  it("Deve adicionar preço de vacina na tabela 5% Desconto", async () => {
    const caller = createCaller(testTenantId);

    const result = await caller.vaccinePrices.create({
      tenantId: testTenantId,
      priceTableId: testPriceTableId2,
      vaccineId: testVaccineId,
      preco: 9500, // R$ 95,00 (5% de desconto)
      dataInicio: new Date().toISOString(),
      ativo: true,
    });

    expect(result.id).toBeDefined();
  });

  it("Deve listar preços e filtrar por tabela", async () => {
    const caller = createCaller(testTenantId);

    const allPrices = await caller.vaccinePrices.list({
      tenantId: testTenantId,
    });

    expect(allPrices.length).toBe(2);

    const particularPrices = allPrices.filter((p: any) => p.priceTableId === testPriceTableId);
    const descontoPrices = allPrices.filter((p: any) => p.priceTableId === testPriceTableId2);

    expect(particularPrices.length).toBe(1);
    expect(particularPrices[0].preco).toBe(10000);

    expect(descontoPrices.length).toBe(1);
    expect(descontoPrices[0].preco).toBe(9500);
  });

  it("Deve definir nova tabela como padrão", async () => {
    const caller = createCaller(testTenantId);

    await caller.priceTables.setAsDefault({
      id: testPriceTableId2,
      tenantId: testTenantId,
    });

    const defaultTable = await caller.priceTables.getDefault({
      tenantId: testTenantId,
    });

    expect(defaultTable?.id).toBe(testPriceTableId2);
    expect(defaultTable?.nome).toBe("5% de Desconto");
  });

  it("Deve atualizar tabela de preços", async () => {
    const caller = createCaller(testTenantId);

    await caller.priceTables.update({
      id: testPriceTableId,
      tenantId: testTenantId,
      nome: "Particular Atualizado",
      descricao: "Descrição atualizada",
    });

    const table = await caller.priceTables.getById({
      id: testPriceTableId,
      tenantId: testTenantId,
    });

    expect(table?.nome).toBe("Particular Atualizado");
    expect(table?.descricao).toBe("Descrição atualizada");
  });

  it("Deve limpar dados de teste", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Deletar preços
    await db.delete(vaccinePrices).where(eq(vaccinePrices.tenantId, testTenantId));

    // Deletar tabelas de preços
    await db.delete(priceTables).where(eq(priceTables.tenantId, testTenantId));

    // Deletar vacina
    await db.delete(vaccines).where(eq(vaccines.id, testVaccineId));

    // Deletar tenant
    await db.delete(tenants).where(eq(tenants.id, testTenantId));

    expect(true).toBe(true);
  });
});
