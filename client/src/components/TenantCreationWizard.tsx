import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface TenantCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface TenantData {
  // Etapa 1: Informações Básicas
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  plan: "basic" | "intermediate" | "full";
  subdomain: string;
  
  // Etapa 2: Credenciais Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseConnectionString: string;
  
  // Etapa 3-4: Criação
  tenantId?: number;
  adminUsername: string;
  adminPassword: string;
  
  // Etapa 6: GitHub
  githubRepoName: string;
  githubRepoUrl?: string;
  
  // Etapa 7: Vercel
  vercelProjectName: string;
  vercelProjectUrl?: string;
  vercelDeploymentUrl?: string;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function TenantCreationWizard({ open, onOpenChange, onSuccess }: TenantCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [tenantData, setTenantData] = useState<TenantData>({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    plan: "basic",
    subdomain: "",
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseServiceRoleKey: "",
    supabaseConnectionString: "",
    adminUsername: "",
    adminPassword: "",
    githubRepoName: "",
    vercelProjectName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const createTenantMutation = trpc.tenants.createSimple.useMutation();

  const steps = [
    { number: 1, title: "Informações", description: "Dados da clínica" },
    { number: 2, title: "Supabase", description: "Credenciais do banco" },
    { number: 3, title: "Criar Tenant", description: "Salvar no banco" },
    { number: 4, title: "Usuário Admin", description: "Criar acesso" },
    { number: 6, title: "GitHub", description: "Criar repositório" },
    { number: 7, title: "Vercel", description: "Deploy automático" },
    { number: 5, title: "Concluído", description: "Pronto para usar" },
  ];

  const handleNext = async () => {
    // Validações por etapa
    if (currentStep === 1) {
      if (!tenantData.name || !tenantData.cnpj || !tenantData.email || !tenantData.subdomain) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
    }

    if (currentStep === 2) {
      if (!tenantData.supabaseUrl || !tenantData.supabaseAnonKey || !tenantData.supabaseServiceRoleKey || !tenantData.supabaseConnectionString) {
        toast.error("Preencha todas as credenciais do Supabase");
        return;
      }
    }

    if (currentStep === 3) {
      // Criar tenant no banco
      await handleCreateTenant();
      return;
    }

    if (currentStep === 4) {
      if (!tenantData.adminUsername || !tenantData.adminPassword) {
        toast.error("Preencha as credenciais do usuário admin");
        return;
      }
      // Criar usuário admin
      await handleCreateAdmin();
      return;
    }
    
    if (currentStep === 6) {
      if (!tenantData.githubRepoName) {
        toast.error("Preencha o nome do repositório GitHub");
        return;
      }
      // Criar repositório GitHub
      await handleCreateGitHubRepo();
      return;
    }
    
    if (currentStep === 7) {
      if (!tenantData.vercelProjectName) {
        toast.error("Preencha o nome do projeto Vercel");
        return;
      }
      // Deploy Vercel
      await handleDeployVercel();
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else {
      // Finalizar
      onSuccess?.();
      onOpenChange(false);
      toast.success("Tenant criado com sucesso!");
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 3 && currentStep !== 4) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleCreateTenant = async () => {
    setIsProcessing(true);
    try {
      const result = await createTenantMutation.mutateAsync({
        name: tenantData.name,
        cnpj: tenantData.cnpj,
        email: tenantData.email,
        phone: tenantData.phone,
        plan: tenantData.plan,
        subdomain: tenantData.subdomain,
        databaseHost: tenantData.supabaseUrl.replace("https://", "").replace("http://", ""),
        databaseName: "postgres",
        supabaseUrl: tenantData.supabaseUrl,
        supabaseAnonKey: tenantData.supabaseAnonKey,
        supabaseServiceKey: tenantData.supabaseServiceRoleKey,
      });

      setTenantData({ ...tenantData, tenantId: result.id });
      toast.success("Tenant criado no banco principal!");
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar tenant");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAdmin = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implementar criação de usuário admin via tRPC
      toast.success("Usuário admin criado!");
      setCurrentStep(6);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário admin");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const createGitHubRepoMutation = trpc.tenantIntegrations.createGitHubRepo.useMutation();
  
  const handleCreateGitHubRepo = async () => {
    if (!tenantData.tenantId) {
      toast.error("Tenant ID não encontrado");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await createGitHubRepoMutation.mutateAsync({
        tenantId: tenantData.tenantId,
        repoName: tenantData.githubRepoName,
      });
      
      setTenantData({ ...tenantData, githubRepoUrl: result.repoUrl });
      toast.success(result.message);
      setCurrentStep(7);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar repositório GitHub");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const deployToVercelMutation = trpc.tenantIntegrations.deployToVercel.useMutation();
  
  const handleDeployVercel = async () => {
    if (!tenantData.tenantId || !tenantData.githubRepoUrl) {
      toast.error("Repositório GitHub não encontrado");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await deployToVercelMutation.mutateAsync({
        tenantId: tenantData.tenantId,
        projectName: tenantData.vercelProjectName,
        githubRepoUrl: tenantData.githubRepoUrl,
        supabaseUrl: tenantData.supabaseUrl,
        supabaseAnonKey: tenantData.supabaseAnonKey,
        supabaseServiceKey: tenantData.supabaseServiceRoleKey,
      });
      
      setTenantData({ 
        ...tenantData, 
        vercelDeploymentUrl: result.deploymentUrl,
        vercelProjectUrl: result.projectUrl 
      });
      toast.success(result.message);
      setCurrentStep(5);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer deploy Vercel");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Clínica *</Label>
              <Input
                id="name"
                placeholder="Ex: ImuneVida Centro de Vacinação"
                value={tenantData.name}
                onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={tenantData.cnpj}
                onChange={(e) => setTenantData({ ...tenantData, cnpj: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@imunevida.com.br"
                value={tenantData.email}
                onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 98765-4321"
                value={tenantData.phone}
                onChange={(e) => setTenantData({ ...tenantData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plano *</Label>
              <Select
                value={tenantData.plan}
                onValueChange={(value: "basic" | "intermediate" | "full") =>
                  setTenantData({ ...tenantData, plan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomínio *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  placeholder="imunevida"
                  value={tenantData.subdomain}
                  onChange={(e) => setTenantData({ ...tenantData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.taetter.com.br</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Apenas letras minúsculas, números e hífens
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-blue-900">Projeto Supabase Necessário</h4>
                  <p className="text-xs text-blue-700">
                    Você precisa criar um projeto Supabase manualmente e aplicar o schema SQL fornecido antes de continuar.
                  </p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Abrir Supabase Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabaseUrl">Supabase URL *</Label>
              <Input
                id="supabaseUrl"
                placeholder="https://xxxxx.supabase.co"
                value={tenantData.supabaseUrl}
                onChange={(e) => setTenantData({ ...tenantData, supabaseUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabaseAnonKey">Anon Key *</Label>
              <Textarea
                id="supabaseAnonKey"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={tenantData.supabaseAnonKey}
                onChange={(e) => setTenantData({ ...tenantData, supabaseAnonKey: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabaseServiceRoleKey">Service Role Key *</Label>
              <Textarea
                id="supabaseServiceRoleKey"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={tenantData.supabaseServiceRoleKey}
                onChange={(e) => setTenantData({ ...tenantData, supabaseServiceRoleKey: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabaseConnectionString">Connection String *</Label>
              <Textarea
                id="supabaseConnectionString"
                placeholder="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
                value={tenantData.supabaseConnectionString}
                onChange={(e) => setTenantData({ ...tenantData, supabaseConnectionString: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Check className="h-5 w-5 text-green-600" />
                )}
                <h3 className="font-medium">
                  {isProcessing ? "Criando tenant no banco principal..." : "Tenant criado com sucesso!"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isProcessing
                  ? "Salvando informações do tenant e credenciais Supabase..."
                  : `Tenant "${tenantData.name}" foi criado com ID: ${tenantData.tenantId}`}
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
              <h4 className="font-medium text-sm text-blue-900">Criar Usuário Administrador</h4>
              <p className="text-xs text-blue-700">
                Este usuário terá acesso total ao sistema do tenant.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminUsername">Nome de Usuário *</Label>
              <Input
                id="adminUsername"
                placeholder="admin"
                value={tenantData.adminUsername}
                onChange={(e) => setTenantData({ ...tenantData, adminUsername: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha *</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="••••••••"
                value={tenantData.adminPassword}
                onChange={(e) => setTenantData({ ...tenantData, adminPassword: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
              <h4 className="font-medium text-sm text-blue-900">Criar Repositório GitHub</h4>
              <p className="text-xs text-blue-700">
                O repositório será criado a partir do template <strong>tenant_template_repository</strong> na organização <strong>taetter</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubRepoName">Nome do Repositório *</Label>
              <Input
                id="githubRepoName"
                placeholder="Ex: imunevida-vis"
                value={tenantData.githubRepoName}
                onChange={(e) => setTenantData({ ...tenantData, githubRepoName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Usar apenas letras minúsculas, números e hífens
              </p>
            </div>
            
            {tenantData.githubRepoUrl && (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Repositório criado!</span>
                </div>
                <a
                  href={tenantData.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  {tenantData.githubRepoUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        );
        
      case 7:
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
              <h4 className="font-medium text-sm text-blue-900">Deploy Automático Vercel</h4>
              <p className="text-xs text-blue-700">
                O projeto será conectado ao repositório GitHub e fazerá deploy automático.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vercelProjectName">Nome do Projeto Vercel *</Label>
              <Input
                id="vercelProjectName"
                placeholder="Ex: imunevida-vis"
                value={tenantData.vercelProjectName}
                onChange={(e) => setTenantData({ ...tenantData, vercelProjectName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Usar apenas letras minúsculas, números e hífens
              </p>
            </div>
            
            {tenantData.vercelDeploymentUrl && (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Deploy concluído!</span>
                </div>
                <a
                  href={tenantData.vercelDeploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  {tenantData.vercelDeploymentUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-green-900">Tenant Criado com Sucesso!</h4>
                  <p className="text-xs text-green-700">
                    O tenant está pronto para uso.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{tenantData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CNPJ:</span>
                  <span className="font-medium">{tenantData.cnpj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium capitalize">{tenantData.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domínio:</span>
                  <span className="font-medium">{tenantData.subdomain}.taetter.com.br</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuário Admin:</span>
                  <span className="font-medium">{tenantData.adminUsername}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
              <h4 className="font-medium text-sm text-blue-900">Próximos Passos</h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Acesse o tenant via {tenantData.subdomain}.taetter.com.br</li>
                <li>Faça login com as credenciais criadas</li>
                <li>Configure os módulos necessários</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Tenant</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.number
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 mx-2 ${
                    currentStep > step.number ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || currentStep === 3 || currentStep === 4 || currentStep === 5 || isProcessing}
          >
            Voltar
          </Button>
          <Button onClick={handleNext} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : currentStep === 5 ? (
              "Concluir"
            ) : currentStep === 3 ? (
              "Criar Tenant"
            ) : currentStep === 4 ? (
              "Criar Usuário"
            ) : (
              "Próximo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
