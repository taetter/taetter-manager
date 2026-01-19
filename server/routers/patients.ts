import { z } from "zod";
import { router } from "../_core/trpc.js";
import { tenantProcedure, getTenantId } from "../tenantMiddleware.js";
import { getDb } from "../db.js";
import { patients, patientDocuments } from "../../drizzle/schema";
import { eq, and, like, or, isNull, desc, not, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as XLSX from "xlsx";

// Schema de validação para paciente
const patientInputSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  rg: z.string().optional(),
  dataNascimento: z.date(),
  sexo: z.enum(["M", "F", "Outro"]).optional(),
  nomeMae: z.string().optional(),
  nomePai: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/).optional(),
  cartaoSus: z.string().optional(),
  fotoUrl: z.string().url().optional(),
  fotoKey: z.string().optional(),
  observacoes: z.string().optional(),
});

export const patientsRouter = router({
  // Listar pacientes do tenant
  list: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const tenantId = getTenantId(ctx, input.tenantId);

      const conditions = [
        eq(patients.tenantId, tenantId),
        isNull(patients.deletedAt),
      ];

      if (input.search) {
        conditions.push(
          or(
            like(patients.nome, `%${input.search}%`),
            like(patients.cpf, `%${input.search}%`),
            like(patients.email, `%${input.search}%`)
          )!
        );
      }

      const results = await db
        .select()
        .from(patients)
        .where(and(...conditions))
        .orderBy(desc(patients.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Contar total
      const countResult = await db
        .select()
        .from(patients)
        .where(and(...conditions));

      return {
        patients: results,
        total: countResult.length,
      };
    }),

  // Buscar paciente por ID
  getById: tenantProcedure
    .input(z.object({ id: z.number(), tenantId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const tenantId = getTenantId(ctx, input.tenantId);

      const result = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.id, input.id),
            eq(patients.tenantId, tenantId),
            isNull(patients.deletedAt)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      return result[0];
    }),

  // Criar novo paciente
  create: tenantProcedure
    .input(patientInputSchema.extend({ tenantId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const tenantId = getTenantId(ctx, input.tenantId);

      // Verificar se CPF já existe no tenant
      const existingPatient = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.cpf, input.cpf),
            eq(patients.tenantId, tenantId),
            isNull(patients.deletedAt)
          )
        )
        .limit(1);

      if (existingPatient.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "CPF already registered in this clinic",
        });
      }

      // Criar paciente
      const result = await db.insert(patients).values({
        ...input,
        tenantId,
      });

      const insertId = (result as any).insertId || 0;

      return { id: Number(insertId), ...input, tenantId };
    }),

  // Atualizar paciente
  update: tenantProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
        data: patientInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const tenantId = getTenantId(ctx, input.tenantId);

      // Verificar se paciente existe e pertence ao tenant
      const existing = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.id, input.id),
            eq(patients.tenantId, tenantId),
            isNull(patients.deletedAt)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      // Se estiver atualizando CPF, verificar duplicação
      if (input.data.cpf && input.data.cpf !== existing[0].cpf) {
        const duplicateCpf = await db
          .select()
          .from(patients)
          .where(
            and(
              eq(patients.cpf, input.data.cpf),
              eq(patients.tenantId, tenantId),
              isNull(patients.deletedAt)
            )
          )
          .limit(1);

        if (duplicateCpf.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "CPF already registered in this clinic",
          });
        }
      }

      // Atualizar paciente
      await db
        .update(patients)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(patients.id, input.id));

      return { success: true };
    }),

  // Deletar paciente (soft delete)
  delete: tenantProcedure
    .input(z.object({ id: z.number(), tenantId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const tenantId = getTenantId(ctx, input.tenantId);

      // Verificar se paciente existe e pertence ao tenant
      const existing = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.id, input.id),
            eq(patients.tenantId, tenantId),
            isNull(patients.deletedAt)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      // Soft delete
      await db
        .update(patients)
        .set({
          deletedAt: new Date(),
          ativo: false,
        })
        .where(eq(patients.id, input.id));

      return { success: true };
    }),

  // Gerar template Excel para importação
  downloadTemplate: tenantProcedure.query(async () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Definir cabeçalhos
    const headers = [
      "nome",
      "cpf",
      "rg",
      "dataNascimento",
      "sexo",
      "nomeMae",
      "nomePai",
      "email",
      "telefone",
      "celular",
      "endereco",
      "numero",
      "complemento",
      "bairro",
      "cidade",
      "estado",
      "cep",
      "cartaoSus",
      "observacoes",
    ];

    // Criar linha de exemplo
    const example = [
      "João da Silva",
      "123.456.789-00",
      "MG-12.345.678",
      "1990-01-15",
      "M",
      "Maria da Silva",
      "José da Silva",
      "joao@email.com",
      "(31) 3333-4444",
      "(31) 98888-9999",
      "Rua das Flores",
      "123",
      "Apto 101",
      "Centro",
      "Belo Horizonte",
      "MG",
      "30100-000",
      "123456789012345",
      "Paciente exemplo",
    ];

    // Criar worksheet com cabeçalhos e exemplo
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes");

    // Gerar buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Retornar como base64 para download no frontend
    return {
      data: buffer.toString("base64"),
      filename: "template_pacientes.xlsx",
    };
  }),

  // Importar pacientes via Excel
  importExcel: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        fileData: z.string(), // Base64 encoded Excel file
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const tenantId = getTenantId(ctx, input.tenantId);

      // Decodificar arquivo base64
      const buffer = Buffer.from(input.fileData, "base64");

      // Ler arquivo Excel
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converter para JSON
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Excel file is empty",
        });
      }

      const results = {
        success: [] as any[],
        errors: [] as any[],
      };

      // Processar cada linha
      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        const rowNumber = i + 2; // +2 porque linha 1 é cabeçalho e Excel começa em 1

        try {
          // Validar campos obrigatórios
          if (!row.nome || !row.cpf) {
            results.errors.push({
              row: rowNumber,
              error: "Nome e CPF são obrigatórios",
              data: row,
            });
            continue;
          }

          // Validar formato do CPF
          const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
          if (!cpfRegex.test(row.cpf)) {
            results.errors.push({
              row: rowNumber,
              error: "CPF em formato inválido (use: 000.000.000-00)",
              data: row,
            });
            continue;
          }

          // Verificar se CPF já existe
          const existingPatient = await db
            .select()
            .from(patients)
            .where(
              and(
                eq(patients.cpf, row.cpf),
                eq(patients.tenantId, tenantId),
                isNull(patients.deletedAt)
              )
            )
            .limit(1);

          if (existingPatient.length > 0) {
            results.errors.push({
              row: rowNumber,
              error: "CPF já cadastrado nesta clínica",
              data: row,
            });
            continue;
          }

          // Validar data de nascimento
          let dataNascimento: Date | undefined;
          if (row.dataNascimento) {
            // Tentar parsear diferentes formatos de data
            const dateStr = String(row.dataNascimento);
            if (dateStr.includes("/")) {
              const [day, month, year] = dateStr.split("/");
              dataNascimento = new Date(`${year}-${month}-${day}`);
            } else if (dateStr.includes("-")) {
              dataNascimento = new Date(dateStr);
            } else {
              // Formato Excel serial date
              const excelDate = parseFloat(dateStr);
              if (!isNaN(excelDate)) {
                const parsedDate: any = XLSX.SSF.parse_date_code(excelDate);
                if (parsedDate) {
                  dataNascimento = new Date(
                    parsedDate.y,
                    parsedDate.m - 1,
                    parsedDate.d
                  );
                }
              }
            }

            if (!dataNascimento || isNaN(dataNascimento.getTime())) {
              results.errors.push({
                row: rowNumber,
                error: "Data de nascimento inválida",
                data: row,
              });
              continue;
            }
          }

          // Validar CEP se fornecido
          if (row.cep) {
            const cepRegex = /^\d{5}-\d{3}$/;
            if (!cepRegex.test(row.cep)) {
              results.errors.push({
                row: rowNumber,
                error: "CEP em formato inválido (use: 00000-000)",
                data: row,
              });
              continue;
            }
          }

          // Validar estado se fornecido
          if (row.estado && row.estado.length !== 2) {
            results.errors.push({
              row: rowNumber,
              error: "Estado deve ter 2 caracteres (ex: MG, SP)",
              data: row,
            });
            continue;
          }

          // Validar sexo se fornecido
          if (row.sexo && !["M", "F", "Outro"].includes(row.sexo)) {
            results.errors.push({
              row: rowNumber,
              error: 'Sexo deve ser "M", "F" ou "Outro"',
              data: row,
            });
            continue;
          }

          // Criar paciente
          const patientData: any = {
            tenantId,
            nome: row.nome,
            cpf: row.cpf,
            rg: row.rg || null,
            dataNascimento: dataNascimento || null,
            sexo: row.sexo || null,
            nomeMae: row.nomeMae || null,
            nomePai: row.nomePai || null,
            email: row.email || null,
            telefone: row.telefone || null,
            celular: row.celular || null,
            endereco: row.endereco || null,
            numero: row.numero || null,
            complemento: row.complemento || null,
            bairro: row.bairro || null,
            cidade: row.cidade || null,
            estado: row.estado || null,
            cep: row.cep || null,
            cartaoSus: row.cartaoSus || null,
            observacoes: row.observacoes || null,
          };

          await db.insert(patients).values(patientData);

          results.success.push({
            row: rowNumber,
            nome: row.nome,
            cpf: row.cpf,
          });
        } catch (error: any) {
          results.errors.push({
            row: rowNumber,
            error: error.message || "Erro desconhecido",
            data: row,
          });
        }
      }

      return {
        total: data.length,
        imported: results.success.length,
        failed: results.errors.length,
        successDetails: results.success,
        errorDetails: results.errors,
      };
    }),

  // Verificar se CPF já existe
  checkCpf: tenantProcedure
    .input(
      z.object({
        tenantId: z.number().optional(),
        cpf: z.string(),
        excludeId: z.number().optional(), // ID do paciente a excluir da busca (para edição)
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const tenantId = getTenantId(ctx, input.tenantId);

      // Buscar paciente com o CPF
      const conditions: any[] = [
        eq(patients.cpf, input.cpf),
        eq(patients.tenantId, tenantId),
        isNull(patients.deletedAt),
      ];

      // Se excludeId foi fornecido, adicionar condição de exclusão
      if (input.excludeId) {
        conditions.push(sql`${patients.id} != ${input.excludeId}`);
      }

      const existing = await db
        .select({
          id: patients.id,
          nome: patients.nome,
          cpf: patients.cpf,
          dataNascimento: patients.dataNascimento,
          telefone: patients.telefone,
        })
        .from(patients)
        .where(and(...conditions))
        .limit(1);

      if (existing.length > 0) {
        return {
          exists: true,
          patient: existing[0],
        };
      }

      return {
        exists: false,
        patient: null,
      };
    }),

  // Estatísticas de pacientes
  stats: tenantProcedure
    .input(z.object({ tenantId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const tenantId = getTenantId(ctx, input?.tenantId);

    const allPatients = await db
      .select()
      .from(patients)
      .where(
        and(eq(patients.tenantId, tenantId), isNull(patients.deletedAt))
      );

    const activePatients = allPatients.filter((p) => p.ativo);

    // Calcular distribuição por sexo
    const bySex = {
      M: allPatients.filter((p) => p.sexo === "M").length,
      F: allPatients.filter((p) => p.sexo === "F").length,
      Outro: allPatients.filter((p) => p.sexo === "Outro").length,
    };

    return {
      total: allPatients.length,
      active: activePatients.length,
      inactive: allPatients.length - activePatients.length,
      bySex,
    };
  }),
});
