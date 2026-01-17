import { Link, useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Thermometer,
  Wrench,
  GraduationCap,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function QualityDashboard() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);

  // Buscar estatísticas do dashboard
  const { data: stats, isLoading } = trpc.quality.dashboard.useQuery({
    tenantId,
  });

  const modules = [
    {
      title: "POPs",
      description: "Procedimentos Operacionais Padrão",
      icon: FileText,
      href: `/tenant/${tenantId}/quality/pops`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: `${stats?.popsAtivos || 0} ativos`,
    },
    {
      title: "Documentação Regulatória",
      description: "Alvarás, Licenças e Certificados",
      icon: Shield,
      href: `/tenant/${tenantId}/quality/regulatory`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: `${stats?.documentosValidos || 0} válidos`,
    },
    {
      title: "Auditorias",
      description: "Checklists e Avaliações",
      icon: ClipboardCheck,
      href: `/tenant/${tenantId}/quality/audits`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "Gerenciar auditorias",
    },
    {
      title: "Ocorrências",
      description: "Reações e Eventos Adversos",
      icon: AlertTriangle,
      href: `/tenant/${tenantId}/quality/occurrences`,
      color: "text-red-600",
      bgColor: "bg-red-50",
      stats: `${stats?.ocorrenciasAbertas || 0} abertas`,
    },
    {
      title: "Monitoramento de Temperatura",
      description: "Geladeiras e Transporte",
      icon: Thermometer,
      href: `/tenant/${tenantId}/quality/temperatures`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      stats: `${stats?.temperaturasForaPadrao || 0} alertas (24h)`,
    },
    {
      title: "Manutenções",
      description: "Preventivas e Corretivas",
      icon: Wrench,
      href: `/tenant/${tenantId}/quality/maintenances`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: `${stats?.manutencoesPendentes || 0} pendentes`,
    },
    {
      title: "Treinamentos",
      description: "Capacitação do RH",
      icon: GraduationCap,
      href: `/tenant/${tenantId}/quality/trainings`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stats: "Gerenciar treinamentos",
    },
  ];

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Módulo de Qualidade' }
          ]}
          tenantId={tenantId}
        />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Módulo de Qualidade</h1>
              <p className="text-gray-600 mt-1">
                Gestão de conformidade, segurança e qualidade
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Resumo Geral */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">POPs Ativos</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? '...' : stats?.popsAtivos || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Procedimentos vigentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Válidos</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : stats?.documentosValidos || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Licenças e alvarás
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ocorrências Abertas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? '...' : stats?.ocorrenciasAbertas || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requer atenção
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas de Temperatura</CardTitle>
                <Thermometer className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">
                  {isLoading ? '...' : stats?.temperaturasForaPadrao || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Últimas 24 horas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Módulos de Qualidade */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Módulos de Qualidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <Link key={index} href={module.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 ${module.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <module.icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{module.stats}</p>
                    <Button className="w-full mt-4" variant="outline">
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Alertas e Ações Rápidas */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertas e Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats?.temperaturasForaPadrao && stats.temperaturasForaPadrao > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alerta de Temperatura
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    {stats.temperaturasForaPadrao} registro(s) fora do padrão nas últimas 24 horas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/tenant/${tenantId}/quality/temperatures`}>
                    <Button variant="destructive" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {stats?.manutencoesPendentes && stats.manutencoesPendentes > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Manutenções Pendentes
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    {stats.manutencoesPendentes} manutenção(ões) agendada(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/tenant/${tenantId}/quality/maintenances`}>
                    <Button className="bg-orange-600 hover:bg-orange-700" size="sm">
                      Ver Agenda
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>
    </TenantLayout>
  );
}
