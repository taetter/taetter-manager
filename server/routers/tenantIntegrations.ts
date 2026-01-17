import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const tenantIntegrationsRouter = router({
  createGitHubRepo: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        repoName: z.string(),
        templateRepo: z.string().default("taetter/tenant_template_repository"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é super_admin
      if (ctx.user.role !== "super_admin") {
        throw new Error("Apenas super admins podem criar repositórios");
      }

      try {
        // Criar repositório a partir do template usando GitHub CLI
        const { stdout, stderr } = await execAsync(
          `gh repo create taetter/${input.repoName} --template ${input.templateRepo} --private --clone`
        );

        const repoUrl = `https://github.com/taetter/${input.repoName}`;

        // Atualizar configurações do tenant no banco
        // TODO: Salvar repoUrl no campo configuracoes do tenant

        return {
          success: true,
          repoUrl,
          message: `Repositório ${input.repoName} criado com sucesso!`,
        };
      } catch (error: any) {
        console.error("Erro ao criar repositório GitHub:", error);
        throw new Error(`Erro ao criar repositório: ${error.message}`);
      }
    }),

  deployToVercel: protectedProcedure
    .input(
      z.object({
        tenantId: z.number(),
        projectName: z.string(),
        githubRepoUrl: z.string(),
        supabaseUrl: z.string(),
        supabaseAnonKey: z.string(),
        supabaseServiceKey: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é super_admin
      if (ctx.user.role !== "super_admin") {
        throw new Error("Apenas super admins podem fazer deploy");
      }

      try {
        // Fazer deploy via MCP Vercel
        const { stdout, stderr } = await execAsync(
          `manus-mcp-cli tool call deploy_to_vercel --server vercel --input '{}'`
        );

        // Parse do resultado
        const result = JSON.parse(stdout);
        const deploymentUrl = result.url || `https://${input.projectName}.vercel.app`;

        // Atualizar configurações do tenant no banco
        // TODO: Salvar deploymentUrl no campo configuracoes do tenant

        return {
          success: true,
          deploymentUrl,
          projectUrl: `https://vercel.com/taetter/${input.projectName}`,
          message: `Deploy concluído com sucesso!`,
        };
      } catch (error: any) {
        console.error("Erro ao fazer deploy Vercel:", error);
        throw new Error(`Erro ao fazer deploy: ${error.message}`);
      }
    }),
});
