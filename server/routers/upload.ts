import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const uploadRouter = router({
  // Upload de foto de paciente
  uploadPatientPhoto: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded
        mimeType: z.string(),
        tenantId: z.number(),
        patientId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validar tipo de arquivo
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.",
          });
        }

        // Converter base64 para buffer
        const base64Data = input.fileData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Validar tamanho (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (buffer.length > maxSize) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Arquivo muito grande. Tamanho máximo: 5MB",
          });
        }

        // Gerar nome único para o arquivo
        const extension = input.fileName.split(".").pop() || "jpg";
        const randomSuffix = nanoid(10);
        const fileKey = `tenants/${input.tenantId}/patients/${input.patientId || "temp"}/photo-${randomSuffix}.${extension}`;

        // Upload para S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return {
          success: true,
          url,
          key: fileKey,
        };
      } catch (error) {
        console.error("[Upload] Error uploading patient photo:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fazer upload da foto",
        });
      }
    }),
});
