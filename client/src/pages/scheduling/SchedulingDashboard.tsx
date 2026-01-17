import { Link, useParams } from "wouter";
import { Calendar, MapPin, Clock, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SchedulingDashboard() {
  const params = useParams();
  const tenantId = params.id;

  const modules = [
    {
      title: "Agenda",
      description: "Visualizar e gerenciar agendamentos",
      icon: Calendar,
      route: `/tenant/${tenantId}/scheduling/calendar`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Atendimento Domiciliar",
      description: "Gerenciar endereços e rotas",
      icon: MapPin,
      route: `/tenant/${tenantId}/scheduling/home-care`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Horários Disponíveis",
      description: "Configurar disponibilidade",
      icon: Clock,
      route: `/tenant/${tenantId}/scheduling/availability`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Lista de Agendamentos",
      description: "Ver todos os agendamentos",
      icon: Users,
      route: `/tenant/${tenantId}/scheduling/list`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Estatísticas",
      description: "Relatórios e métricas",
      icon: TrendingUp,
      route: `/tenant/${tenantId}/scheduling/stats`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Módulo de Agendamento</h1>
        <p className="text-muted-foreground">
          Gerencie agendamentos, atendimentos domiciliares e rotas otimizadas
        </p>
      </div>

      {/* Cards de estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domiciliares</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">da agenda</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de módulos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.route} href={module.route}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Funcionalidades do Módulo</CardTitle>
          <CardDescription>O que você pode fazer com o módulo de Agendamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Agenda Visual</h4>
              <p className="text-sm text-muted-foreground">
                Visualize todos os agendamentos em calendário mensal ou semanal com horários disponíveis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Atendimento Domiciliar</h4>
              <p className="text-sm text-muted-foreground">
                Gerencie endereços, calcule taxas automáticas e otimize rotas com Google Maps
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Reserva de Vacinas</h4>
              <p className="text-sm text-muted-foreground">
                Reserve doses do estoque para agendamentos sem dar baixa até o atendimento
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium">Pagamento Antecipado</h4>
              <p className="text-sm text-muted-foreground">
                Gere links de pagamento com 5% de desconto para PIX, Crédito ou Débito
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
