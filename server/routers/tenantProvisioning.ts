import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const tenantProvisioningRouter = router({
  createSupabaseProject: publicProcedure
    .input(
      z.object({
        tenantName: z.string(),
        subdomain: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Criar projeto Supabase via MCP
        const projectName = `${input.subdomain}_vis`;
        
        const { stdout, stderr } = await execAsync(
          `manus-mcp-cli tool call create_project --server supabase --input '{"name": "${projectName}", "organization_id": "default", "region": "us-east-1"}'`
        );

        if (stderr && !stderr.includes("OAuth")) {
          throw new Error(`Supabase error: ${stderr}`);
        }

        const result = JSON.parse(stdout);
        
        return {
          projectId: result.id,
          url: result.url,
          anonKey: result.anon_key,
          serviceRoleKey: result.service_role_key,
        };
      } catch (error) {
        console.error("Error creating Supabase project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar projeto Supabase",
        });
      }
    }),

  cloneSchema: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        serviceRoleKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Ler schema SQL do arquivo
        const fs = await import("fs/promises");
        const schemaSQL = await fs.readFile(
          "/home/ubuntu/taetter-vis/supabase_schema.sql",
          "utf-8"
        );

        // Executar SQL no projeto Supabase via MCP
        const { stdout, stderr } = await execAsync(
          `manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id": "${input.projectId}", "sql": ${JSON.stringify(schemaSQL)}}'`
        );

        if (stderr && !stderr.includes("OAuth")) {
          throw new Error(`Schema clone error: ${stderr}`);
        }

        return { success: true };
      } catch (error) {
        console.error("Error cloning schema:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao clonar schema do banco",
        });
      }
    }),

  createGitHubRepo: publicProcedure
    .input(
      z.object({
        tenantName: z.string(),
        subdomain: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const repoName = `${input.subdomain}-vis`;
        
        // Criar repositório via GitHub CLI
        const { stdout: createOutput } = await execAsync(
          `gh repo create ${repoName} --private --description "VIS instance for ${input.tenantName}"`
        );

        // Clonar template e fazer push
        const tempDir = `/tmp/${repoName}`;
        await execAsync(`rm -rf ${tempDir}`);
        await execAsync(`cp -r /home/ubuntu/taetter-vis ${tempDir}`);
        await execAsync(`cd ${tempDir} && git init && git add . && git commit -m "Initial commit from template"`);
        await execAsync(`cd ${tempDir} && gh repo set-default ${repoName} && git push -u origin main`);

        return {
          repoUrl: createOutput.trim(),
        };
      } catch (error) {
        console.error("Error creating GitHub repo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar repositório GitHub",
        });
      }
    }),

  createVercelProject: publicProcedure
    .input(
      z.object({
        tenantName: z.string(),
        subdomain: z.string(),
        githubRepoUrl: z.string(),
        supabaseUrl: z.string(),
        supabaseAnonKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const projectName = `${input.subdomain}-vis`;
        
        // Criar projeto Vercel via MCP
        const { stdout, stderr } = await execAsync(
          `manus-mcp-cli tool call create_deployment --server vercel --input '{"name": "${projectName}", "git_url": "${input.githubRepoUrl}", "env": {"VITE_SUPABASE_URL": "${input.supabaseUrl}", "VITE_SUPABASE_ANON_KEY": "${input.supabaseAnonKey}"}}'`
        );

        if (stderr && !stderr.includes("OAuth")) {
          throw new Error(`Vercel error: ${stderr}`);
        }

        const result = JSON.parse(stdout);
        
        return {
          projectUrl: result.url,
          deploymentUrl: result.deployment_url,
        };
      } catch (error) {
        console.error("Error creating Vercel project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar projeto Vercel",
        });
      }
    }),
});
