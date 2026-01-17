import { Link, useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Users,
  Syringe,
  DollarSign,
  Download,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function IndicatorsDashboard() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [dateRange, setDateRange] = useState({
    dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
  });

  // Buscar estatísticas gerais
  const { data: stats, isLoading: loadingStats } = trpc.indicators.generalStats.useQuery({
    tenantId,
    ...dateRange,
  });

  // Buscar aplicações por mês
  const { data: applicationsByMonth } = trpc.indicators.applicationsByMonth.useQuery({
    tenantId,
  });

  // Buscar dados financeiros por mês
  const { data: financialByMonth } = trpc.indicators.financialByMonth.useQuery({
    tenantId,
  });

  // Buscar vacinas mais aplicadas
  const { data: topVaccines } = trpc.indicators.topVaccines.useQuery({
    tenantId,
    limit: 5,
  });

  // Buscar métodos de pagamento
  const { data: paymentMethods } = trpc.indicators.paymentMethods.useQuery({
    tenantId,
  });

  const handleExportApplications = () => {
    // TODO: Implementar exportação Excel
    alert('Exportando relatório de aplicações...');
  };

  const handleExportFinancial = () => {
    // TODO: Implementar exportação Excel
    alert('Exportando relatório financeiro...');
  };

  const handleExportStock = () => {
    // TODO: Implementar exportação Excel
    alert('Exportando relatório de estoque...');
  };

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Indicadores e Relatórios' }
          ]}
          tenantId={tenantId}
        />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Indicadores e Relatórios</h1>
              <p className="text-gray-600 mt-1">
                Análise de dados e exportação de relatórios
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Estatísticas Gerais */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Aplicações</CardTitle>
                <Syringe className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {loadingStats ? '...' : stats?.totalAplicacoes || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Período selecionado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loadingStats ? '...' : stats?.totalPacientes || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cadastrados no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vacinas em Estoque</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loadingStats ? '...' : stats?.totalVacinasEstoque || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Doses disponíveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {loadingStats ? '...' : `R$ ${stats?.receitaTotal.toFixed(2) || '0.00'}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Período selecionado
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Aplicações por Mês */}
          <Card>
            <CardHeader>
              <CardTitle>Aplicações por Mês</CardTitle>
              <CardDescription>Últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={applicationsByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Aplicações" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Receitas vs Despesas */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
              <CardDescription>Últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vacinas Mais Aplicadas */}
          <Card>
            <CardHeader>
              <CardTitle>Vacinas Mais Aplicadas</CardTitle>
              <CardDescription>Top 5 vacinas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topVaccines || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nomeVacina" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" name="Aplicações" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Distribuição por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.metodo}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {(paymentMethods || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Exportação de Relatórios */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exportar Relatórios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relatório de Aplicações</CardTitle>
                <CardDescription>Exportar histórico completo de vacinações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportApplications} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relatório Financeiro</CardTitle>
                <CardDescription>Exportar transações e movimentações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportFinancial} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relatório de Estoque</CardTitle>
                <CardDescription>Exportar inventário de vacinas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportStock} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </TenantLayout>
  );
}
