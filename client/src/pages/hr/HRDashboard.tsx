import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, DollarSign, FileText, AlertTriangle, Calendar, Car, Shield } from "lucide-react";
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function HRDashboard() {
  const params = useParams();
  const tenantId = parseInt(params.id || "0");

  const { data: stats, isLoading } = trpc.hr.dashboard.useQuery({ tenantId });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const modules = [
    {
      title: "Colaboradores",
      description: "Gestão de equipe e acesso à ADC",
      icon: Users,
      href: `/tenant/${tenantId}/hr/employees`,
      color: "text-blue-600",
    },
    {
      title: "Ponto Eletrônico",
      description: "Registro e controle de ponto",
      icon: Clock,
      href: `/tenant/${tenantId}/hr/timeclock`,
      color: "text-green-600",
    },
    {
      title: "Folha de Pagamento",
      description: "Gestão de salários e benefícios",
      icon: DollarSign,
      href: `/tenant/${tenantId}/hr/payroll`,
      color: "text-yellow-600",
    },
    {
      title: "Horas Extras",
      description: "Solicitações e aprovações",
      icon: Calendar,
      href: `/tenant/${tenantId}/hr/overtime`,
      color: "text-purple-600",
    },
    {
      title: "Ausências",
      description: "Férias, atestados e licenças",
      icon: FileText,
      href: `/tenant/${tenantId}/hr/absences`,
      color: "text-orange-600",
    },
    {
      title: "Registro de KM",
      description: "Controle de quilometragem",
      icon: Car,
      href: `/tenant/${tenantId}/hr/mileage`,
      color: "text-indigo-600",
    },
    {
      title: "CAT",
      description: "Comunicado de Acidente de Trabalho",
      icon: Shield,
      href: `/tenant/${tenantId}/hr/accidents`,
      color: "text-red-600",
    },
    {
      title: "Treinamentos",
      description: "Capacitação e desenvolvimento",
      icon: FileText,
      href: `/tenant/${tenantId}/quality/trainings`,
      color: "text-teal-600",
    },
  ];

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Recursos Humanos' }
          ]}
          tenantId={tenantId}
        />

    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Recursos Humanos</h1>
        <p className="text-muted-foreground mt-2">
          Gestão completa de colaboradores, ponto eletrônico e folha de pagamento
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalColaboradores || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.colaboradoresAtivos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Trabalhando atualmente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Férias</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.colaboradoresFerias || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Período de descanso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afastados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.colaboradoresAfastados || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Atestados ou licenças</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Módulos de RH</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${module.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <CardDescription className="text-xs">{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = module.href}
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Área do Colaborador */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Área do Colaborador (ADC)
          </CardTitle>
          <CardDescription>
            Portal mobile-friendly para colaboradores acessarem holerites, registrarem ponto e solicitarem benefícios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full md:w-auto"
            onClick={() => window.location.href = `/tenant/${tenantId}/adc`}
          >
            Acessar Área do Colaborador
          </Button>
        </CardContent>
      </Card>
      </div>
      </div>
    </TenantLayout>
  );
}
