import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams } from "wouter";
import { useState } from "react";
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  Calendar,
  Plus,
  FileText,
  BarChart3,
  Activity,
  Syringe,
  Package,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";

export default function TenantDashboard() {
  const { user, loading } = useAuth();
  const params = useParams();
  const tenantId = parseInt(params.tenantId || "1");
  
  // Estados para filtros
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [vaccineFilter, setVaccineFilter] = useState<string>("all");
  
  // Buscar estatísticas do tenant
  const { data: patientStats } = trpc.patients.stats.useQuery(
    { tenantId },
    { enabled: !!user }
  );

  // Buscar unidades para filtro
  const { data: units } = trpc.units.list.useQuery(
    { tenantId },
    { enabled: !!user }
  );
  
  // Buscar dados do tenant para verificar módulos habilitados
  const { data: tenantData } = trpc.tenants.getById.useQuery(
    { id: tenantId },
    { enabled: !!user }
  );

  // Buscar estatísticas de orçamentos
  const { data: budgetStats } = trpc.patientBudgets.getConversionStats.useQuery(
    { tenantId },
    { enabled: !!user }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Super Admins podem acessar qualquer tenant
  if (!user?.tenantId && user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não está associado a nenhuma clínica.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }



  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs items={[]} tenantId={tenantId} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da clínica e acesso rápido às funcionalidades
          </p>
        </div>
        {/* Quick Actions - MOVIDO PARA O TOPO */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-6 h-6 text-primary" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades mais utilizadas do dia a dia
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button asChild size="lg" className="w-full h-auto py-4">
                <Link href={`/tenant/${tenantId}/patients/new`}>
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-6 h-6" />
                    <span>Cadastrar Paciente</span>
                  </div>
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="w-full h-auto py-4 border-2">
                <Link href={`/tenant/${tenantId}/application`}>
                  <div className="flex flex-col items-center gap-2">
                    <Syringe className="w-6 h-6" />
                    <span>Módulo de Aplicações</span>
                  </div>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full h-auto py-4 border-2">
                <Link href={`/tenant/${tenantId}/stock`}>
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-6 h-6" />
                    <span>Ver Estoque</span>
                  </div>
                </Link>
              </Button>

            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Visualização</CardTitle>
            <CardDescription>
              Personalize os indicadores abaixo conforme sua necessidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta Semana</SelectItem>
                    <SelectItem value="month">Este Mês</SelectItem>
                    <SelectItem value="quarter">Este Trimestre</SelectItem>
                    <SelectItem value="year">Este Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Unidade</label>
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Unidades</SelectItem>
                    {units?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Vacina</label>
                <Select value={vaccineFilter} onValueChange={setVaccineFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Vacinas</SelectItem>
                    <SelectItem value="covid">COVID-19</SelectItem>
                    <SelectItem value="gripe">Gripe (Influenza)</SelectItem>
                    <SelectItem value="hepatite">Hepatite</SelectItem>
                    <SelectItem value="outras">Outras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - EXPANDIDOS COM MAIS INDICADORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pacientes
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patientStats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {patientStats?.active || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Aplicações Hoje
              </CardTitle>
              <Syringe className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dateFilter === "today" ? "Hoje" : dateFilter === "week" ? "Esta semana" : "Este mês"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Aplicações Semana
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Aplicações Mês
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Hoje
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground mt-1">
                Faturamento de hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Semana
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Mês
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground mt-1">
                Faturamento mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Crítico
              </CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Vacinas com baixo estoque
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores por Módulo */}
        <div className="mt-12 space-y-8">
          {/* Estoque */}
          <div>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Estoque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vacinas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Doses disponíveis</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Validade Próxima</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Próximos 30 dias</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rupturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Vacinas em falta</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground mt-1">Valor total</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Financeiro */}
          <div>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              Financeiro
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Orçamentos Convertidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {budgetStats ? `${budgetStats.taxaConversao.toFixed(1)}%` : "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgetStats?.totalConvertidos || 0} de {budgetStats?.totalAprovados || 0} aprovados
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Total criados: {budgetStats?.totalOrcamentos || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RH */}
          <div>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              Recursos Humanos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Ativos</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Escalas Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Próxima semana</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Treinamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Agendados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Documentos Vencidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Qualidade */}
          <div>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Qualidade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">POPs Atualizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Auditorias Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Agendadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Não Conformidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Abertas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Integrações */}
          <div>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              Integrações
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status RNDS/PNI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <p className="text-xs text-muted-foreground mt-1">Conectado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">NFe Emitidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Mês atual</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sincronizações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Hoje</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Erros de Integração</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <p className="text-xs text-muted-foreground mt-1">Últimas 24h</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      </div>
    </TenantLayout>
  );
}
