import { Link, useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Receipt
} from 'lucide-react';

export default function FinancialDashboard() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);

  // Buscar estatísticas financeiras
  const { data: stats, isLoading } = trpc.financialTransactions.stats.useQuery({
    tenantId,
  });

  const modules = [
    {
      title: "Transações",
      description: "Gerenciar receitas e despesas",
      icon: DollarSign,
      href: `/tenant/${tenantId}/financial/transactions`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: "Todas as movimentações",
    },
    {
      title: "Recebimentos Parcelados",
      description: "Controle de parcelas a receber",
      icon: CreditCard,
      href: `/tenant/${tenantId}/financial/installments`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: "Cartão de crédito",
    },
    {
      title: "Conciliação Bancária",
      description: "Conciliar extratos bancários",
      icon: CheckCircle,
      href: `/tenant/${tenantId}/financial/reconciliation`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "Débito e PIX",
    },
    {
      title: "Notas Fiscais",
      description: "Gerenciar NFe",
      icon: FileText,
      href: `/tenant/${tenantId}/financial/invoices`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: "Emissão e controle",
    },
    {
      title: "Tabelas de Preços",
      description: "Preços de vacinas e campanhas",
      icon: Receipt,
      href: `/tenant/${tenantId}/financial/prices`,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      stats: "Gestão de preços",
    },
  ];

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Módulo Financeiro' }
          ]}
          tenantId={tenantId}
        />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Módulo Financeiro</h1>
              <p className="text-gray-600 mt-1">
                Gestão completa de finanças, conciliação e notas fiscais
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Estatísticas Financeiras */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo Financeiro</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : `R$ ${stats?.totalReceitas.toFixed(2) || '0.00'}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Período atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? '...' : `R$ ${stats?.totalDespesas.toFixed(2) || '0.00'}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Período atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(stats?.saldo || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {isLoading ? '...' : `R$ ${stats?.saldo.toFixed(2) || '0.00'}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Receitas - Despesas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {isLoading ? '...' : stats?.transacoesPendentes || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Transações pendentes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alertas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertas e Pendências</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-orange-50 border-2 border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <span className="text-3xl font-bold text-orange-600">
                    {isLoading ? '...' : stats?.transacoesNaoConciliadas || 0}
                  </span>
                </div>
                <CardTitle className="text-lg">Transações Não Conciliadas</CardTitle>
                <CardDescription>Requerem conciliação bancária</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-yellow-50 border-2 border-yellow-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Receipt className="h-8 w-8 text-yellow-600" />
                  <span className="text-3xl font-bold text-yellow-600">
                    {isLoading ? '...' : stats?.transacoesPendentes || 0}
                  </span>
                </div>
                <CardTitle className="text-lg">Pagamentos Pendentes</CardTitle>
                <CardDescription>Aguardando confirmação de pagamento</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Módulos */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gerenciamento Financeiro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <Link key={module.title} href={module.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                      <module.icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{module.stats}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      </div>
    </TenantLayout>
  );
}
