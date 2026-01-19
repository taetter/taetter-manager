import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers.js";
import { getDb } from "./db.js";
import { vaccines, refrigerators } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

describe("Vaccines Transfer Router", () => {
  const testTenantId = 1;
  let refrigerator1Id: number;
  let refrigerator2Id: number;
  let vaccineId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Criar geladeiras de teste
    const [ref1] = await db
      .insert(refrigerators)
      .values({
        tenantId: testTenantId,
        unitId: 1, // Adicionar unitId obrigatório
        nome: "Geladeira Teste 1",
        modelo: "Modelo A",
        numeroSerie: "SN001",
        temperaturaMin: 2,
        temperaturaMax: 8,
      })
      .$returningId();
    refrigerator1Id = ref1.id;

    const [ref2] = await db
      .insert(refrigerators)
      .values({
        tenantId: testTenantId,
        unitId: 1, // Adicionar unitId obrigatório
        nome: "Geladeira Teste 2",
        modelo: "Modelo B",
        numeroSerie: "SN002",
        temperaturaMin: 2,
        temperaturaMax: 8,
      })
      .$returningId();
    refrigerator2Id = ref2.id;

    // Criar vacina na geladeira 1
    const [vaccine] = await db
      .insert(vaccines)
      .values({
        tenantId: testTenantId,
        refrigeratorId: refrigerator1Id,
        nome: "Vacina Teste",
        lote: "LOTE001",
        validade: new Date("2025-12-31"), // Campo obrigatório
        quantidadeTotal: 100,
        quantidadeDisponivel: 100,
        quantidadeReservada: 0,
      })
      .$returningId();
    vaccineId = vaccine.id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Limpar dados de teste
    await db
      .delete(vaccines)
      .where(
        and(
          eq(vaccines.tenantId, testTenantId),
          eq(vaccines.lote, "LOTE001")
        )
      );

    if (refrigerator1Id) {
      await db
        .delete(refrigerators)
        .where(eq(refrigerators.id, refrigerator1Id));
    }

    if (refrigerator2Id) {
      await db
        .delete(refrigerators)
        .where(eq(refrigerators.id, refrigerator2Id));
    }
  });

  it("should transfer vaccine stock between refrigerators", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin", tenantId: testTenantId },
      tenantId: testTenantId,
    });

    const result = await caller.vaccines.transfer({
      tenantId: testTenantId,
      vaccineId,
      fromRefrigeratorId: refrigerator1Id,
      toRefrigeratorId: refrigerator2Id,
      quantidade: 30,
      observacoes: "Transferência de teste",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Transferência realizada com sucesso");

    // Verificar que a quantidade foi reduzida na origem
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [originVaccine] = await db
      .select()
      .from(vaccines)
      .where(eq(vaccines.id, vaccineId))
      .limit(1);

    expect(originVaccine.quantidadeDisponivel).toBe(70);
    expect(originVaccine.quantidadeTotal).toBe(70);

    // Verificar que foi criada entrada no destino
    const [targetVaccine] = await db
      .select()
      .from(vaccines)
      .where(
        and(
          eq(vaccines.tenantId, testTenantId),
          eq(vaccines.refrigeratorId, refrigerator2Id),
          eq(vaccines.lote, "LOTE001")
        )
      )
      .limit(1);

    expect(targetVaccine).toBeDefined();
    expect(targetVaccine.quantidadeDisponivel).toBe(30);
    expect(targetVaccine.quantidadeTotal).toBe(30);
  });

  it("should fail transfer with insufficient stock", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin", tenantId: testTenantId },
      tenantId: testTenantId,
    });

    await expect(
      caller.vaccines.transfer({
        tenantId: testTenantId,
        vaccineId,
        fromRefrigeratorId: refrigerator1Id,
        toRefrigeratorId: refrigerator2Id,
        quantidade: 200, // Mais do que o disponível
      })
    ).rejects.toThrow("Estoque insuficiente");
  });

  it("should fail transfer from non-existent vaccine", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", name: "Test User", role: "admin", tenantId: testTenantId },
      tenantId: testTenantId,
    });

    await expect(
      caller.vaccines.transfer({
        tenantId: testTenantId,
        vaccineId: 99999, // ID inexistente
        fromRefrigeratorId: refrigerator1Id,
        toRefrigeratorId: refrigerator2Id,
        quantidade: 10,
      })
    ).rejects.toThrow("Vacina não encontrada");
  });
});
