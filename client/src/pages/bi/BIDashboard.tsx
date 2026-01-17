import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "wouter";
import { useState } from "react";
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Users,
  Syringe,
  DollarSign,
  Package,
  Target,
  PieChart,
  LineChart,
  Activity,
  Flag,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BIDashboard() {
  const { user } = useAuth();
  const params = useParams();
  const tenantId = parseInt(params.id || "1");
  
  // Estados para filtros
  const [dateRange, setDateRange] = useState<string>("month");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("operational");
  
  // Buscar unidades para filtro
  const { data: units } = trpc.stock.listUnits.useQuery(
    { tenantId },
    { enabled: !!user }
  );

  // Dados mockados para demonstração
  const applicationsData = [
    { mes: "Jan", aplicacoes: 120, meta: 100 },
    { mes: "Fev", aplicacoes: 150, meta: 120 },
    { mes: "Mar", aplicacoes: 180, meta: 140 },
    { mes: "Abr", aplicacoes: 165, meta: 150 },
    { mes: "Mai", aplicacoes: 200, meta: 160 },
    { mes: "Jun", aplicacoes: 220, meta: 180 },
  ];

  const revenueData = [
    { mes: "Jan", receita: 12000, despesa: 8000 },
    { mes: "Fev", receita: 15000, despesa: 8500 },
    { mes: "Mar", receita: 18000, despesa: 9000 },
    { mes: "Abr", receita: 16500, despesa: 8800 },
    { mes: "Mai", receita: 20000, despesa: 9200 },
    { mes: "Jun", receita: 22000, despesa: 9500 },
  ];

  const vaccineDistribution = [
    { nome: "COVID-19", quantidade: 450, valor: 45 },
    { nome: "Gripe", quantidade: 320, valor: 32 },
    { nome: "Hepatite B", quantidade: 180, valor: 18 },
    { nome: "Outras", quantidade: 50, valor: 5 },
  ];

  const paymentMethods = [
    { metodo: "PIX", quantidade: 380, percentual: 38 },
    { metodo: "Crédito", quantidade: 320, percentual: 32 },
    { metodo: "Débito", quantidade: 200, percentual: 20 },
    { metodo: "Dinheiro", quantidade: 100, percentual: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExportExcel = (reportName: string) => {
    alert(`Exportando relatório: ${reportName}`);
  };

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Business Intelligence' }
          ]}
          tenantId={tenantId}
        />


      <main className="container mx-auto px-4 py-8">
        {/* Filtros Globais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Análise
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para personalizar suas análises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mês</SelectItem>
                    <SelectItem value="quarter">Último Trimestre</SelectItem>
                    <SelectItem value="semester">Último Semestre</SelectItem>
                    <SelectItem value="year">Último Ano</SelectItem>
                    <SelectItem value="custom">Período Personalizado</SelectItem>
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
                <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="strategic">Estratégico</SelectItem>
                    <SelectItem value="quality">Qualidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={() => handleExportExcel('Relatório Completo')}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Crescimento
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+18.5%</div>
              <p className="text-xs text-muted-foreground mt-1">
                vs. período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 95,50</div>
              <p className="text-xs text-muted-foreground mt-1">
                por aplicação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conversão
              </CardTitle>
              <Target className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.3%</div>
              <p className="text-xs text-muted-foreground mt-1">
                agendamentos → aplicações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Satisfação
              </CardTitle>
              <Activity className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5.0</div>
              <p className="text-xs text-muted-foreground mt-1">
                avaliação média
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Análises */}
        <Tabs defaultValue="operational" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="operational">Operacional</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="strategic">Estratégico</TabsTrigger>
            <TabsTrigger value="quality">Qualidade</TabsTrigger>
            <TabsTrigger value="planning">Planej. Estratégico</TabsTrigger>
          </TabsList>

          {/* Tab Operacional */}
          <TabsContent value="operational" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Aplicações vs Meta
                  </CardTitle>
                  <CardDescription>
                    Comparativo mensal de aplicações realizadas e metas estabelecidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={applicationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="aplicacoes" stroke="#8884d8" strokeWidth={2} name="Aplicações" />
                      <Line type="monotone" dataKey="meta" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Distribuição por Vacina
                  </CardTitle>
                  <CardDescription>
                    Percentual de aplicações por tipo de vacina
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={vaccineDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.nome}: ${entry.valor}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {vaccineDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas - Relatórios Operacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Aplicações por Período')}>
                    <Download className="w-4 h-4 mr-2" />
                    Aplicações por Período
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Produtividade por Colaborador')}>
                    <Download className="w-4 h-4 mr-2" />
                    Produtividade por Colaborador
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Agendamentos vs Realizações')}>
                    <Download className="w-4 h-4 mr-2" />
                    Agendamentos vs Realizações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Financeiro */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Receitas vs Despesas
                  </CardTitle>
                  <CardDescription>
                    Análise comparativa mensal de receitas e despesas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="receita" fill="#10b981" name="Receita" />
                      <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Formas de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Distribuição percentual por método de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.metodo}: ${entry.percentual}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas - Relatórios Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Fluxo de Caixa')}>
                    <Download className="w-4 h-4 mr-2" />
                    Fluxo de Caixa
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('DRE - Demonstrativo')}>
                    <Download className="w-4 h-4 mr-2" />
                    DRE - Demonstrativo
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Contas a Receber')}>
                    <Download className="w-4 h-4 mr-2" />
                    Contas a Receber
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Estratégico */}
          <TabsContent value="strategic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Market Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">23.5%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Participação regional
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CAC (Custo de Aquisição)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ 45,00</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por novo paciente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">LTV (Lifetime Value)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ 850,00</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor médio por paciente
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas - Relatórios Estratégicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Análise de Mercado')}>
                    <Download className="w-4 h-4 mr-2" />
                    Análise de Mercado
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Projeção de Crescimento')}>
                    <Download className="w-4 h-4 mr-2" />
                    Projeção de Crescimento
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Análise SWOT')}>
                    <Download className="w-4 h-4 mr-2" />
                    Análise SWOT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Qualidade */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conformidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Taxa de conformidade
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Não Conformidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">3</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pendentes de correção
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Auditorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Realizadas no período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Treinamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Colaboradores treinados
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas - Relatórios de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Relatório de Auditorias')}>
                    <Download className="w-4 h-4 mr-2" />
                    Relatório de Auditorias
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Não Conformidades')}>
                    <Download className="w-4 h-4 mr-2" />
                    Não Conformidades
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Controle de Temperatura')}>
                    <Download className="w-4 h-4 mr-2" />
                    Controle de Temperatura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Planejamento Estratégico (SCOPI) */}
          <TabsContent value="planning" className="space-y-6">
            {/* Painel de Governança */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Flag className="w-6 h-6 text-primary" />
                  Painel de Governança Estratégica
                </CardTitle>
                <CardDescription>
                  Visão executiva do planejamento estratégico no estilo SCOPI
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-3xl font-bold text-green-600">8</div>
                    <p className="text-sm text-muted-foreground mt-1">Objetivos no Prazo</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-3xl font-bold text-yellow-600">3</div>
                    <p className="text-sm text-muted-foreground mt-1">Objetivos em Atenção</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <div className="text-3xl font-bold text-red-600">1</div>
                    <p className="text-sm text-muted-foreground mt-1">Objetivos Atrasados</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-3xl font-bold text-blue-600">12</div>
                    <p className="text-sm text-muted-foreground mt-1">Iniciativas Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objetivos Estratégicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos Estratégicos
                </CardTitle>
                <CardDescription>
                  Acompanhamento dos objetivos estratégicos da organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Objetivo 1 */}
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <h3 className="font-semibold text-lg">Aumentar Market Share em 15%</h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Perspectiva: Mercado | Responsável: Diretoria Comercial
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">87%</div>
                        <p className="text-xs text-muted-foreground">Progresso</p>
                      </div>
                    </div>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta:</span>
                        <span className="font-medium">15% de market share até Dez/2026</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atual:</span>
                        <span className="font-medium">13.05%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Objetivo 2 */}
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <h3 className="font-semibold text-lg">Reduzir Custo Operacional em 10%</h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Perspectiva: Processos Internos | Responsável: Diretoria de Operações
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">92%</div>
                        <p className="text-xs text-muted-foreground">Progresso</p>
                      </div>
                    </div>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta:</span>
                        <span className="font-medium">Reduzir 10% até Dez/2026</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atual:</span>
                        <span className="font-medium">9.2% de redução</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Objetivo 3 */}
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <h3 className="font-semibold text-lg">Alcançar NPS de 80 pontos</h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Perspectiva: Clientes | Responsável: Gerente de Qualidade
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">68%</div>
                        <p className="text-xs text-muted-foreground">Progresso</p>
                      </div>
                    </div>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta:</span>
                        <span className="font-medium">NPS 80 até Dez/2026</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atual:</span>
                        <span className="font-medium">NPS 54</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                  </div>

                  {/* Objetivo 4 */}
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <h3 className="font-semibold text-lg">Implementar 100% dos POPs</h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Perspectiva: Aprendizado e Crescimento | Responsável: Coordenador de Qualidade
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">45%</div>
                        <p className="text-xs text-muted-foreground">Progresso</p>
                      </div>
                    </div>
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta:</span>
                        <span className="font-medium">100% dos POPs até Jun/2026</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Atual:</span>
                        <span className="font-medium">45 de 100 POPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Evolução dos KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Evolução do Market Share
                  </CardTitle>
                  <CardDescription>
                    Acompanhamento mensal do objetivo de market share
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsLineChart data={[
                      { mes: "Jan", valor: 10.5, meta: 11.25 },
                      { mes: "Fev", valor: 11.2, meta: 11.88 },
                      { mes: "Mar", valor: 11.8, meta: 12.5 },
                      { mes: "Abr", valor: 12.3, meta: 13.13 },
                      { mes: "Mai", valor: 12.7, meta: 13.75 },
                      { mes: "Jun", valor: 13.05, meta: 14.38 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} name="Realizado" />
                      <Line type="monotone" dataKey="meta" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Progresso dos Objetivos
                  </CardTitle>
                  <CardDescription>
                    Visão geral do avanço de todos os objetivos estratégicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { objetivo: "Market Share", progresso: 87 },
                      { objetivo: "Custo Operacional", progresso: 92 },
                      { objetivo: "NPS", progresso: 68 },
                      { objetivo: "POPs", progresso: 45 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="objetivo" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="progresso" fill="#3b82f6" name="Progresso (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Iniciativas Estratégicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Iniciativas Estratégicas em Andamento
                </CardTitle>
                <CardDescription>
                  Projetos e ações vinculados aos objetivos estratégicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium">Campanha de Marketing Digital</p>
                        <p className="text-sm text-muted-foreground">Vinculado: Market Share</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">75% concluído</p>
                      <p className="text-xs text-muted-foreground">Prazo: 30/06/2026</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium">Automação de Processos</p>
                        <p className="text-sm text-muted-foreground">Vinculado: Custo Operacional</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">82% concluído</p>
                      <p className="text-xs text-muted-foreground">Prazo: 31/08/2026</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div>
                        <p className="font-medium">Programa de Experiência do Cliente</p>
                        <p className="text-sm text-muted-foreground">Vinculado: NPS</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">55% concluído</p>
                      <p className="text-xs text-muted-foreground">Prazo: 30/09/2026</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div>
                        <p className="font-medium">Documentação de POPs</p>
                        <p className="text-sm text-muted-foreground">Vinculado: POPs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">45% concluído</p>
                      <p className="text-xs text-muted-foreground">Prazo: 30/06/2026 (Atrasado)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas - Planejamento Estratégico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Relatório de Objetivos')}>
                    <Download className="w-4 h-4 mr-2" />
                    Relatório de Objetivos
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Painel de KPIs')}>
                    <Download className="w-4 h-4 mr-2" />
                    Painel de KPIs
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportExcel('Status das Iniciativas')}>
                    <Download className="w-4 h-4 mr-2" />
                    Status das Iniciativas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </TenantLayout>
  );
}
