import { useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Filter, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Installments() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    status: '' as '' | 'pendente' | 'pago' | 'atrasado' | 'cancelado',
    dataInicio: '',
    dataFim: '',
  });

  // Queries
  const { data: installments, isLoading } = trpc.financialTransactions.listInstallments.useQuery({
    tenantId,
    status: filtros.status || undefined,
    dataInicio: filtros.dataInicio || undefined,
    dataFim: filtros.dataFim || undefined,
  });

  const { data: stats } = trpc.financialTransactions.installmentStats.useQuery({ tenantId });

  const limparFiltros = () => {
    setFiltros({
      status: '',
      dataInicio: '',
      dataFim: '',
    });
  };

  const getStatusBadge = (status: string, dataVencimento: string) => {
    // Verificar se está atrasado
    const isOverdue = new Date(dataVencimento) < new Date() && status === 'pendente';
    
    const variants: Record<string, { icon: any, variant: "default" | "secondary" | "destructive" | "outline", label: string, className?: string }> = {
      pendente: { 
        icon: Clock, 
        variant: isOverdue ? "destructive" : "outline", 
        label: isOverdue ? "Atrasado" : "Pendente",
        className: isOverdue ? "bg-red-100 text-red-800" : ""
      },
      pago: { icon: CheckCircle, variant: "default", label: "Pago", className: "bg-green-100 text-green-800" },
      atrasado: { icon: AlertCircle, variant: "destructive", label: "Atrasado" },
      cancelado: { icon: XCircle, variant: "secondary", label: "Cancelado" },
    };
    
    const config = variants[isOverdue ? 'atrasado' : status] || variants.pendente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const calcularDiasAtraso = (dataVencimento: string, status: string) => {
    if (status !== 'pendente') return 0;
    const vencimento = new Date(dataVencimento);
    const hoje = new Date();
    const diff = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <TenantLayout>
      <div className="container mx-auto p-6">
        <Breadcrumbs
          items={[
            { label: "Início", href: `/tenant/${tenantId}/dashboard` },
            { label: "Financeiro", href: `/tenant/${tenantId}/financial` },
            { label: "Parcelas a Receber" },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Parcelas a Receber</h1>
            <p className="text-muted-foreground mt-2">
              Controle de pagamentos parcelados no crédito
            </p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  R$ {parseFloat(stats.totalPendentes || '0').toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.quantidadePendentes || 0} parcela(s)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pagas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {parseFloat(stats.totalPagas || '0').toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.quantidadePagas || 0} parcela(s)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Atrasadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {parseFloat(stats.totalAtrasadas || '0').toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.quantidadeAtrasadas || 0} parcela(s)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(
                    parseFloat(stats.totalPendentes || '0') +
                    parseFloat(stats.totalPagas || '0') +
                    parseFloat(stats.totalAtrasadas || '0')
                  ).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.quantidadePendentes || 0) + (stats.quantidadePagas || 0) + (stats.quantidadeAtrasadas || 0)} parcela(s)
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filtros.status || undefined}
                  onValueChange={(value) => setFiltros({ ...filtros, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vencimento Início</Label>
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Vencimento Fim</Label>
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                />
              </div>

              <div className="space-y-2 flex items-end">
                <Button variant="outline" onClick={limparFiltros} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Parcelas */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Parcelas</CardTitle>
            <CardDescription>
              {installments?.length || 0} parcela(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : !installments || installments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma parcela encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Parcela</th>
                      <th className="text-left p-3">Transação</th>
                      <th className="text-left p-3">Vencimento</th>
                      <th className="text-left p-3">Pagamento</th>
                      <th className="text-right p-3">Valor</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Atraso</th>
                      <th className="text-left p-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((installment) => {
                      const diasAtraso = calcularDiasAtraso(installment.dataVencimento, installment.status);
                      return (
                        <tr key={installment.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <Badge variant="outline">
                              {installment.numeroParcela}/{installment.totalParcelas}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            #{installment.transactionId}
                          </td>
                          <td className="p-3">
                            {new Date(installment.dataVencimento).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3">
                            {installment.dataPagamento 
                              ? new Date(installment.dataPagamento).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            R$ {parseFloat(installment.valor).toFixed(2)}
                          </td>
                          <td className="p-3">
                            {getStatusBadge(installment.status, installment.dataVencimento)}
                          </td>
                          <td className="p-3">
                            {diasAtraso > 0 ? (
                              <span className="text-red-600 font-semibold">
                                {diasAtraso} dia(s)
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {installment.observacoes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
}
