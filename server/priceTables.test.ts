import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers.js";
import { getDb } from "./db.js";
import { tenants, vaccines, vaccinePrices, priceCampaigns } from "../drizzle/schema.js";

describe("Price Tables Routers", () => {
  let testTenantId: number;
  let testVaccineId: number;
  let testPriceId: number;
  let testCampaignId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Criar tenant de teste
    const randomSuffix = Math.floor(Math.random() * 1000);
    const [tenant] = await db.insert(tenants).values({
      name: `Clínica Teste Preços`,
      cnpj: `13.456.${randomSuffix.toString().padStart(3, '0')}/01-90`,
      razaoSocial: `Clínica Teste Preços LTDA`,
      email: `precos${randomSuffix}@clinica.com`,
      status: "ativo",
      plan: "basic",
    }).$returningId();
    testTenantId = tenant.id;

    // Criar vacina de teste
    const [vaccine] = await db.insert(vaccines).values({
      tenantId: testTenantId,
      nome: "Vacina Teste Preços",
      fabricante: "Fabricante Teste",
      lote: "LOTE456",
      quantidadeDisponivel: 50,
      quantidadeMinima: 5,
      validade: new Date("2025-12-31"),
      tipo: "inativada",
    }).$returningId();
    testVaccineId = vaccine.id;
  });

  describe("Vaccine Prices Router", () => {
    it("deve criar preço de vacina com sucesso", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.vaccinePrices.create({
        tenantId: testTenantId,
        vaccineId: testVaccineId,
        preco: 20000, // R$ 200,00
        ativo: true,
        dataInicio: "2025-01-01",
      });

      expect(result.id).toBeDefined();
      testPriceId = result.id;
    });

    it("deve listar preços cadastrados", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.vaccinePrices.list({
        tenantId: testTenantId,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].vaccineName).toBe("Vacina Teste Preços");
      expect(result[0].preco).toBe(20000);
    });


  });

  describe("Price Campaigns Router", () => {
    it("deve criar campanha de desconto percentual", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.priceCampaigns.create({
        tenantId: testTenantId,
        nome: "Campanha Teste 10%",
        descricao: "Desconto de 10% em todas as vacinas",
        tipoDesconto: "percentual",
        valorDesconto: 10,
        dataInicio: "2025-01-15",
        dataFim: "2025-01-31",
        ativo: true,
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
      testCampaignId = result.id;
    });

    it("deve criar campanha de desconto fixo", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.priceCampaigns.create({
        tenantId: testTenantId,
        nome: "Campanha Teste R$ 50",
        descricao: "Desconto fixo de R$ 50",
        tipoDesconto: "valor_fixo",
        valorDesconto: 5000, // R$ 50,00 em centavos
        vaccineIds: [testVaccineId],
        dataInicio: "2025-02-01",
        dataFim: "2025-02-28",
        ativo: true,
      });

      expect(result.id).toBeDefined();
    });

    it("deve listar campanhas cadastradas", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.priceCampaigns.list({
        tenantId: testTenantId,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });



    it("deve validar desconto percentual máximo de 100%", async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, tenantId: testTenantId, role: "admin" } as any,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.priceCampaigns.create({
          tenantId: testTenantId,
          nome: "Campanha Inválida",
          tipoDesconto: "percentual",
          valorDesconto: 150, // Maior que 100%
          dataInicio: "2025-03-01",
          dataFim: "2025-03-31",
          ativo: true,
        })
      ).rejects.toThrow("Desconto percentual não pode ser maior que 100%");
    });
  });
});
