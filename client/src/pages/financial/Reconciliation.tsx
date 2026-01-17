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
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Reconciliation() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);

  // Estados do modal de conta
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: 'corrente' as 'corrente' | 'poupanca' | 'pagamento',
    apelido: '',
    descricao: '',
    saldoInicial: '',
  });

  // Queries
  const { data: accounts, isLoading, refetch } = trpc.bankAccounts.list.useQuery({
    tenantId,
  });

  const { data: transactions } = trpc.financialTransactions.list.useQuery({
    tenantId,
    conciliado: false,
  });

  // Mutations
  const createMutation = trpc.bankAccounts.create.useMutation({
    onSuccess: () => {
      toast.success('Conta bancária criada com sucesso!');
      setModalOpen(false);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar conta: ${error.message}`);
    },
  });

  const updateMutation = trpc.bankAccounts.update.useMutation({
    onSuccess: () => {
      toast.success('Conta bancária atualizada com sucesso!');
      setModalOpen(false);
      setEditingAccount(null);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar conta: ${error.message}`);
    },
  });

  const deleteMutation = trpc.bankAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success('Conta bancária excluída com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir conta: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      banco: '',
      agencia: '',
      conta: '',
      tipoConta: 'corrente',
      apelido: '',
      descricao: '',
      saldoInicial: '',
    });
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      banco: account.banco,
      agencia: account.agencia,
      conta: account.conta,
      tipoConta: account.tipoConta,
      apelido: account.apelido,
      descricao: account.descricao || '',
      saldoInicial: account.saldoAtual,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.banco || !formData.agencia || !formData.conta || !formData.apelido) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingAccount) {
      updateMutation.mutate({
        id: editingAccount.id,
        tenantId,
        ...formData,
        saldoAtual: formData.saldoInicial,
      });
    } else {
      createMutation.mutate({
        tenantId,
        ...formData,
      });
    }
  };

  const handleDelete = (accountId: number) => {
    if (confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      deleteMutation.mutate({ id: accountId, tenantId });
    }
  };

  const getTipoContaBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      pagamento: 'Pagamento',
    };
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>;
  };

  return (
    <TenantLayout>
      <div className="container mx-auto p-6">
        <Breadcrumbs
          items={[
            { label: "Início", href: `/tenant/${tenantId}/dashboard` },
            { label: "Financeiro", href: `/tenant/${tenantId}/financial` },
            { label: "Conciliação Bancária" },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Conciliação Bancária</h1>
            <p className="text-muted-foreground mt-2">
              Gerenciar contas bancárias e conciliar transações
            </p>
          </div>
          <Dialog open={modalOpen} onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setEditingAccount(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta Bancária
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
                </DialogTitle>
                <DialogDescription>
                  {editingAccount ? 'Atualize os dados da conta bancária' : 'Cadastre uma nova conta bancária para conciliação'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Apelido *</Label>
                    <Input
                      value={formData.apelido}
                      onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
                      placeholder="Ex: Conta Principal, Conta Reserva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Banco *</Label>
                    <Input
                      value={formData.banco}
                      onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                      placeholder="Ex: Banco do Brasil, Itaú"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Conta *</Label>
                    <Select
                      value={formData.tipoConta}
                      onValueChange={(value: any) => setFormData({ ...formData, tipoConta: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                        <SelectItem value="pagamento">Conta Pagamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Agência *</Label>
                    <Input
                      value={formData.agencia}
                      onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                      placeholder="0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Conta *</Label>
                    <Input
                      value={formData.conta}
                      onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                      placeholder="00000-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Saldo {editingAccount ? 'Atual' : 'Inicial'} *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.saldoInicial}
                      onChange={(e) => setFormData({ ...formData, saldoInicial: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Informações adicionais sobre a conta"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? 'Salvando...' : 'Salvar Conta'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Contas Bancárias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">Carregando...</div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhuma conta bancária cadastrada
            </div>
          ) : (
            accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{account.apelido}</CardTitle>
                      <CardDescription className="mt-1">{account.banco}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getTipoContaBadge(account.tipoConta)}
                    <div className="text-sm text-muted-foreground">
                      Ag: {account.agencia} | Conta: {account.conta}
                    </div>
                    <div className="text-2xl font-bold mt-3">
                      R$ {parseFloat(account.saldoAtual).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Saldo atual
                    </div>
                    {account.ativa ? (
                      <Badge variant="default" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-2">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativa
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Transações Pendentes de Conciliação */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Pendentes de Conciliação</CardTitle>
            <CardDescription>
              {transactions?.length || 0} transação(ões) aguardando conciliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Todas as transações estão conciliadas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Categoria</th>
                      <th className="text-left p-3">Método</th>
                      <th className="text-right p-3">Valor</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-center p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{new Date(transaction.dataTransacao).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3">{transaction.categoria}</td>
                        <td className="p-3 capitalize">{transaction.metodoPagamento}</td>
                        <td className="p-3 text-right font-semibold">
                          R$ {parseFloat(transaction.valor).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">Não Conciliado</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button size="sm" variant="outline">
                            Conciliar
                          </Button>
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
