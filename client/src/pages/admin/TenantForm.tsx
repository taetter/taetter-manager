import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateTenant } from "@/hooks/useTenants";
import { PLANS, MODULES, type ModuleId, type PlanType, getAvailableModulesForPlan } from "@/../../shared/modules";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const tenantSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido (formato: 00.000.000/0000-00)"),
  razaoSocial: z.string().min(3, "Razão social é obrigatória"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres (ex: SP)"),
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido (formato: 00000-000)"),
  responsavelNome: z.string().min(3, "Nome do responsável é obrigatório"),
  responsavelCpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (formato: 000.000.000-00)"),
  responsavelEmail: z.string().email("Email inválido"),
  responsavelTelefone: z.string().optional(),
  plan: z.enum(["basic", "intermediate", "full"]),
  enabledModules: z.array(z.string()).optional(),
  status: z.enum(["ativo", "inativo", "suspenso"]),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function TenantForm() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const createTenant = useCreateTenant();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      status: "ativo",
      plan: "basic",
      enabledModules: [],
    },
  });

  // Verificar se é super admin
  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: TenantFormData) => {
    try {
      await createTenant.mutateAsync(data);
      toast.success("Tenant criado com sucesso!");
      navigate("/admin/tenants");
    } catch (error: any) {
      const message = error?.message || "Erro ao criar tenant";
      toast.error(message);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="Taetter" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold">Taetter - VIS</h1>
              <p className="text-sm text-muted-foreground">Vaccine Interface System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/tenants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Tenants
            </Link>
          </Button>
          <h2 className="text-3xl font-bold mb-2">Criar Novo Tenant</h2>
          <p className="text-muted-foreground">
            Cadastre uma nova clínica no sistema VIS
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Informações Básicas */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais da clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Clínica *</Label>
                  <Input id="name" {...register("name")} placeholder="Clínica Exemplo" />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input id="cnpj" {...register("cnpj")} placeholder="00.000.000/0000-00" />
                  {errors.cnpj && (
                    <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  id="razaoSocial"
                  {...register("razaoSocial")}
                  placeholder="Clínica Exemplo Ltda"
                />
                {errors.razaoSocial && (
                  <p className="text-sm text-destructive">{errors.razaoSocial.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="contato@clinica.com.br"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" {...register("telefone")} placeholder="(11) 98765-4321" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Localização da clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Textarea
                  id="endereco"
                  {...register("endereco")}
                  placeholder="Rua Exemplo, 123 - Bairro"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input id="cidade" {...register("cidade")} placeholder="São Paulo" />
                  {errors.cidade && (
                    <p className="text-sm text-destructive">{errors.cidade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado (UF) *</Label>
                  <Input id="estado" {...register("estado")} placeholder="SP" maxLength={2} />
                  {errors.estado && (
                    <p className="text-sm text-destructive">{errors.estado.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input id="cep" {...register("cep")} placeholder="00000-000" />
                  {errors.cep && (
                    <p className="text-sm text-destructive">{errors.cep.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável Técnico */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Responsável Técnico</CardTitle>
              <CardDescription>Dados do responsável pela clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="responsavelNome">Nome Completo *</Label>
                  <Input
                    id="responsavelNome"
                    {...register("responsavelNome")}
                    placeholder="Dr. João Silva"
                  />
                  {errors.responsavelNome && (
                    <p className="text-sm text-destructive">{errors.responsavelNome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavelCpf">CPF *</Label>
                  <Input
                    id="responsavelCpf"
                    {...register("responsavelCpf")}
                    placeholder="000.000.000-00"
                  />
                  {errors.responsavelCpf && (
                    <p className="text-sm text-destructive">{errors.responsavelCpf.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="responsavelEmail">Email *</Label>
                  <Input
                    id="responsavelEmail"
                    type="email"
                    {...register("responsavelEmail")}
                    placeholder="responsavel@clinica.com.br"
                  />
                  {errors.responsavelEmail && (
                    <p className="text-sm text-destructive">{errors.responsavelEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavelTelefone">Telefone</Label>
                  <Input
                    id="responsavelTelefone"
                    {...register("responsavelTelefone")}
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Status e plano do tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={watch("status")}
                    onValueChange={(value) => setValue("status", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plano *</Label>
                  <Select
                    value={watch("plan")}
                    onValueChange={(value) => {
                      setValue("plan", value as PlanType);
                      // Resetar módulos adicionais ao mudar de plano
                      setValue("enabledModules", []);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PLANS).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{plan.name}</span>
                            <span className="text-xs text-muted-foreground">
                              R$ {plan.price.toFixed(2)}/mês
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Módulos do Plano */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Módulos Incluídos</CardTitle>
              <CardDescription>
                {PLANS[watch("plan") as PlanType]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PLANS[watch("plan") as PlanType]?.includedModules.map((moduleId) => {
                  const module = MODULES[moduleId as ModuleId];
                  return (
                    <div
                      key={moduleId}
                      className="p-3 border rounded-lg bg-primary/5 border-primary/20"
                    >
                      <div className="font-medium text-sm">{module.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {module.description}
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Incluído
                      </Badge>
                    </div>
                  );
                })}
              </div>

              {/* Módulos Adicionais (apenas para plano intermediate) */}
              {watch("plan") === "intermediate" && (
                <div className="mt-6 pt-6 border-t">
                  <Label className="text-base font-semibold mb-3 block">
                    Módulos Adicionais (escolha até 2)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione até 2 módulos adicionais para complementar o plano intermediário
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getAvailableModulesForPlan(
                      "intermediate",
                      watch("enabledModules") as ModuleId[]
                    ).map((module) => {
                      const isSelected = (watch("enabledModules") || []).includes(module.id);
                      const selectedCount = (watch("enabledModules") || []).length;
                      const canSelect = isSelected || selectedCount < 2;

                      return (
                        <div
                          key={module.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : canSelect
                              ? "hover:bg-accent"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (!canSelect) return;
                            const current = watch("enabledModules") || [];
                            if (isSelected) {
                              setValue(
                                "enabledModules",
                                current.filter((id) => id !== module.id)
                              );
                            } else {
                              setValue("enabledModules", [...current, module.id]);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={isSelected} disabled={!canSelect} />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{module.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {module.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {(watch("enabledModules") || []).length} de 2 módulos selecionados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/tenants">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Criar Tenant"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
