import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Trash2, Calendar, DollarSign, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Budgets() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);

  // Buscar orçamentos
  const { data: budgets, isLoading, refetch } = trpc.budgets.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Deletar orçamento
  const deleteMutation = trpc.budgets.delete.useMutation({
    onSuccess: () => {
      toast.success('Orçamento excluído com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir orçamento: ${error.message}`);
    },
  });

  const handleDelete = (budgetId: number, fornecedor: string) => {
    if (confirm(`Tem certeza que deseja excluir o orçamento do fornecedor "${fornecedor}"?`)) {
      deleteMutation.mutate({ id: budgetId, tenantId });
    }
  };

  // Função para obter cor do badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pendente: { label: 'Pendente', variant: 'secondary' },
      enviado: { label: 'Enviado', variant: 'default' },
      respondido: { label: 'Respondido', variant: 'default' },
      aprovado: { label: 'Aprovado', variant: 'default' },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return (
      <Badge variant={config.variant} className={
        status === 'aprovado' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
        status === 'respondido' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
        status === 'enviado' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
        ''
      }>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
              <p className="text-gray-600 mt-1">
                Solicitações de cotação para distribuidores e farmacêuticas
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/tenant/${tenantId}/stock`}>
                <Button variant="outline">Voltar</Button>
              </Link>
              <Link href={`/tenant/${tenantId}/stock/budgets/new`}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Orçamento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Lista de Orçamentos */}
        {budgets && budgets.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {budgets.map((budget: any) => (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{budget.numero}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Building2 className="h-4 w-4" />
                            <span>{budget.fornecedor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(budget.status)}
                      {budget.valorTotal && (
                        <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                          <DollarSign className="h-5 w-5" />
                          <span>R$ {parseFloat(budget.valorTotal).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Data de Solicitação */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Solicitação</p>
                        <p className="font-semibold">
                          {budget.dataSolicitacao 
                            ? new Date(budget.dataSolicitacao).toLocaleDateString('pt-BR')
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Data de Resposta */}
                    {budget.dataResposta && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Resposta</p>
                          <p className="font-semibold">
                            {new Date(budget.dataResposta).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contato */}
                    <div className="text-sm">
                      <p className="text-gray-600">Contato</p>
                      <p className="font-semibold truncate">
                        {budget.emailFornecedor || budget.telefoneFornecedor || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Observações */}
                  {budget.observacoes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{budget.observacoes}</p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Link href={`/tenant/${tenantId}/stock/budgets/${budget.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(budget.id, budget.fornecedor)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Comece solicitando cotações para seus fornecedores
              </p>
              <Link href={`/tenant/${tenantId}/stock/budgets/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Orçamento
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
