import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { 
  Building2, 
  Refrigerator, 
  Syringe, 
  FileText,
  AlertTriangle,
  TrendingUp,
  Package,
  Thermometer
} from 'lucide-react';

export default function StockDashboard() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);

  const modules = [
    {
      title: "Unidades",
      description: "Gerenciar unidades de atendimento",
      icon: Building2,
      href: `/tenant/${tenantId}/stock/units`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: "Cadastrar e gerenciar",
    },
    {
      title: "Geladeiras",
      description: "Controle de geladeiras e temperatura",
      icon: Refrigerator,
      href: `/tenant/${tenantId}/stock/refrigerators`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      stats: "Monitoramento ativo",
    },
    {
      title: "Vacinas",
      description: "Estoque de vacinas e insumos",
      icon: Syringe,
      href: `/tenant/${tenantId}/stock/vaccines`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "Controle de estoque",
    },
    {
      title: "Orçamentos",
      description: "Solicitações para distribuidores",
      icon: FileText,
      href: `/tenant/${tenantId}/stock/budgets`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      stats: "Comparar preços",
    },
  ];

  const alerts = [
    {
      title: "Alertas de Temperatura",
      description: "Geladeiras com temperatura fora do padrão",
      icon: Thermometer,
      count: 0,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Vencimento Próximo",
      description: "Vacinas com validade em até 30 dias",
      icon: AlertTriangle,
      count: 0,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Estoque Baixo",
      description: "Vacinas com quantidade abaixo do mínimo",
      icon: Package,
      count: 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <TenantLayout>
      <div className="p-8">
        <Breadcrumbs 
          items={[
            { label: 'Início', href: `/tenant/${tenantId}/dashboard` },
            { label: 'Módulo de Estoque' }
          ]}
          tenantId={tenantId}
        />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Módulo de Estoque</h1>
              <p className="text-gray-600 mt-1">
                Gerenciamento completo de estoque, unidades e equipamentos
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Alertas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertas e Notificações</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alerts.map((alert) => (
              <Card key={alert.title} className={`${alert.bgColor} border-2`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <alert.icon className={`h-8 w-8 ${alert.color}`} />
                    <span className={`text-3xl font-bold ${alert.color}`}>
                      {alert.count}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                  <CardDescription>{alert.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Módulos */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gerenciamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <Link key={module.title} href={module.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                      <module.icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{module.stats}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Visão Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Unidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-1">Unidades cadastradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Geladeiras Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-1">Em operação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Vacinas em Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-1">Doses disponíveis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor do Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">R$ 0,00</p>
                <p className="text-sm text-gray-500 mt-1">Custo total</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </TenantLayout>
  );
}
