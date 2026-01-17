import { useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import TenantLayout from "@/components/TenantLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Plus, Search, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function Transactions() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    tipo: '' as '' | 'receita' | 'despesa',
    status: '' as '' | 'pendente' | 'pago' | 'cancelado' | 'estornado',
    dataInicio: '',
    dataFim: '',
  });

  // Estados do modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    categoria: '',
    metodoPagamento: 'pix' as 'dinheiro' | 'pix' | 'debito' | 'credito' | 'boleto',
    valor: '',
    descricao: '',
    dataTransacao: new Date().toISOString().split('T')[0],
  });

  // Queries
  const { data: transactions, isLoading, refetch } = trpc.financialTransactions.list.useQuery({
    tenantId,
    tipo: filtros.tipo || undefined,
    status: filtros.status || undefined,
    dataInicio: filtros.dataInicio || undefined,
    dataFim: filtros.dataFim || undefined,
  });

  const { data: stats } = trpc.financialTransactions.stats.useQuery({ tenantId });

  // Mutations
  const createMutation = trpc.financialTransactions.create.useMutation({
    onSuccess: () => {
      toast.success('Transação criada com sucesso!');
      setModalOpen(false);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar transação: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      tipo: 'receita',
      categoria: '',
      metodoPagamento: 'pix',
      valor: '',
      descricao: '',
      dataTransacao: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoria || !formData.valor) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    createMutation.mutate({
      tenantId,
      ...formData,
      status: 'pago',
    });
  };

  const limparFiltros = () => {
    setFiltros({
      tipo: '',
      status: '',
      dataInicio: '',
      dataFim: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pendente: { variant: "outline", label: "Pendente" },
      pago: { variant: "default", label: "Pago" },
      cancelado: { variant: "destructive", label: "Cancelado" },
      estornado: { variant: "secondary", label: "Estornado" },
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'receita' ? (
      <Badge className="bg-green-100 text-green-800">Receita</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Despesa</Badge>
    );
  };

  return (
    <TenantLayout>
      <div className="container mx-auto p-6">
        <Breadcrumbs
          items={[
            { label: "Início", href: `/tenant/${tenantId}/dashboard` },
            { label: "Financeiro", href: `/tenant/${tenantId}/financial` },
            { label: "Transações" },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Transações Financeiras</h1>
            <p className="text-muted-foreground mt-2">
              Gerenciar receitas e despesas
            </p>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Lançamento Manual de Transação</DialogTitle>
                <DialogDescription>
                  Registre receitas ou despesas não vinculadas a atendimentos
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Input
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ex: Venda de produto, Pagamento fornecedor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Método de Pagamento *</Label>
                    <Select
                      value={formData.metodoPagamento}
                      onValueChange={(value: any) => setFormData({ ...formData, metodoPagamento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="debito">Débito</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data da Transação *</Label>
                    <Input
                      type="date"
                      value={formData.dataTransacao}
                      onChange={(e) => setFormData({ ...formData, dataTransacao: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Detalhes adicionais sobre a transação"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Salvando...' : 'Salvar Transação'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {parseFloat(stats.totalReceitas || '0').toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {parseFloat(stats.totalDespesas || '0').toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(parseFloat(stats.totalReceitas || '0') - parseFloat(stats.totalDespesas || '0')).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  R$ {parseFloat(stats.totalPendentes || '0').toFixed(2)}
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={filtros.tipo || undefined}
                  onValueChange={(value) => setFiltros({ ...filtros, tipo: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="estornado">Estornado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Fim</Label>
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

        {/* Tabela de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Transações</CardTitle>
            <CardDescription>
              {transactions?.length || 0} transação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Tipo</th>
                      <th className="text-left p-3">Categoria</th>
                      <th className="text-left p-3">Método</th>
                      <th className="text-right p-3">Valor</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{new Date(transaction.dataTransacao).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3">{getTipoBadge(transaction.tipo)}</td>
                        <td className="p-3">{transaction.categoria}</td>
                        <td className="p-3 capitalize">{transaction.metodoPagamento}</td>
                        <td className="p-3 text-right font-semibold">
                          R$ {parseFloat(transaction.valor).toFixed(2)}
                        </td>
                        <td className="p-3">{getStatusBadge(transaction.status)}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {transaction.descricao || '-'}
                        </td>
                      </tr>
                    ))}
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
