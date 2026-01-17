import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Key, FileText, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function IntegrationsDashboard() {
  const params = useParams();
  const tenantId = parseInt(params.id || "0");

  const { data: stats, isLoading } = trpc.integrations.dashboard.useQuery({ tenantId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando estatísticas...</div>
      </div>
    );
  }

  const modules = [
    {
      title: "Estabelecimentos / CNES",
      description: "Gerenciar estabelecimentos e códigos CNES",
      icon: Building2,
      href: `/tenant/${tenantId}/integrations/establishments`,
      color: "text-blue-600",
      count: stats?.totalEstabelecimentos || 0,
    },
    {
      title: "Credenciais RNDS",
      description: "Configurar acesso à RNDS/PNI",
      icon: Key,
      href: `/tenant/${tenantId}/integrations/rnds`,
      color: "text-green-600",
      count: stats?.credenciaisRNDS || 0,
    },
    {
      title: "Configurações Fiscais",
      description: "Configurar emissão de NFS-e/NFe",
      icon: FileText,
      href: `/tenant/${tenantId}/integrations/fiscal`,
      color: "text-purple-600",
      count: stats?.configsFiscais || 0,
    },
    {
      title: "Fila de Envios",
      description: "Monitorar e reprocessar envios",
      icon: Clock,
      href: `/tenant/${tenantId}/integrations/outbox`,
      color: "text-orange-600",
      count: stats?.backlog || 0,
    },
  ];

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Integrações' }
          ]}
          tenantId={tenantId}
        />

    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Gerenciar integrações com RNDS/PNI e emissão fiscal (NFS-e/NFe)
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estabelecimentos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEstabelecimentos || 0}</div>
            <p className="text-xs text-muted-foreground">CNES cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credenciais RNDS</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.credenciaisRNDS || 0}</div>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configs Fiscais</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.configsFiscais || 0}</div>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backlog</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.backlog || 0}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas RNDS */}
      <Card>
        <CardHeader>
          <CardTitle>RNDS - Registro de Imunobiológico Administrado (RIA-R)</CardTitle>
          <CardDescription>Estatísticas de envio para a RNDS (hoje)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Enviados</span>
              </div>
              <div className="text-2xl font-bold">{stats?.rnds.totalEnviados || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Aceitos</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats?.rnds.totalAceitos || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Rejeitados</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats?.rnds.totalRejeitados || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
              </div>
              <div className="text-2xl font-bold">{stats?.rnds.taxaSucessoPercent || 0}%</div>
              <p className="text-xs text-muted-foreground">p95: {stats?.rnds.latenciaP95Ms || 0}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas NFS-e */}
      <Card>
        <CardHeader>
          <CardTitle>NFS-e - Nota Fiscal de Serviço Eletrônica</CardTitle>
          <CardDescription>Estatísticas de emissão fiscal (hoje)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Enviados</span>
              </div>
              <div className="text-2xl font-bold">{stats?.nfse.totalEnviados || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Autorizadas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats?.nfse.totalAceitos || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Rejeitadas</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats?.nfse.totalRejeitados || 0}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
              </div>
              <div className="text-2xl font-bold">{stats?.nfse.taxaSucessoPercent || 0}%</div>
              <p className="text-xs text-muted-foreground">p95: {stats?.nfse.latenciaP95Ms || 0}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Módulos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <module.icon className={`h-8 w-8 ${module.color}`} />
                <span className="text-2xl font-bold text-muted-foreground">{module.count}</span>
              </div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href={module.href}>Acessar</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas e Ações Necessárias</CardTitle>
          <CardDescription>Itens que requerem atenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.backlog && stats.backlog > 0 ? (
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium">Backlog de envios pendentes</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.backlog} envios aguardando processamento
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/tenant/${tenantId}/integrations/outbox`}>Ver Fila</a>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm">Todas as integrações estão operando normalmente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
      </div>
    </TenantLayout>
  );
}
