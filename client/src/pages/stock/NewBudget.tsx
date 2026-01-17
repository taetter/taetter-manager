import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetItem {
  nomeVacina: string;
  fabricante: string;
  quantidade: number;
}

export default function NewBudget() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [, setLocation] = useLocation();

  const [fornecedor, setFornecedor] = useState('');
  const [emailFornecedor, setEmailFornecedor] = useState('');
  const [telefoneFornecedor, setTelefoneFornecedor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([
    { nomeVacina: '', fabricante: '', quantidade: 1 }
  ]);

  // Criar orçamento
  const createMutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      toast.success('Orçamento criado com sucesso!');
      setLocation(`/tenant/${tenantId}/stock/budgets`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar orçamento: ${error.message}`);
    },
  });

  const handleAddItem = () => {
    setItems([...items, { nomeVacina: '', fabricante: '', quantidade: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!fornecedor.trim()) {
      toast.error('Nome do fornecedor é obrigatório');
      return;
    }

    const validItems = items.filter(item => item.nomeVacina.trim() !== '');
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos uma vacina ao orçamento');
      return;
    }

    createMutation.mutate({
      tenantId,
      fornecedor,
      emailFornecedor: emailFornecedor || undefined,
      telefoneFornecedor: telefoneFornecedor || undefined,
      observacoes: observacoes || undefined,
      items: validItems,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Orçamento</h1>
              <p className="text-gray-600 mt-1">
                Solicitar cotação de vacinas para fornecedor
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation(`/tenant/${tenantId}/stock/budgets`)}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados do Fornecedor */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Fornecedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fornecedor">Nome do Fornecedor *</Label>
                    <Input
                      id="fornecedor"
                      value={fornecedor}
                      onChange={(e) => setFornecedor(e.target.value)}
                      placeholder="Ex: Farmacêutica ABC"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={emailFornecedor}
                        onChange={(e) => setEmailFornecedor(e.target.value)}
                        placeholder="contato@fornecedor.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={telefoneFornecedor}
                        onChange={(e) => setTelefoneFornecedor(e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Informações adicionais sobre o orçamento..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Itens do Orçamento */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Vacinas Solicitadas</CardTitle>
                    <Button type="button" size="sm" onClick={handleAddItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Vacina
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Item {index + 1}
                        </span>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <Label htmlFor={`vacina-${index}`}>Nome da Vacina *</Label>
                          <Input
                            id={`vacina-${index}`}
                            value={item.nomeVacina}
                            onChange={(e) => handleItemChange(index, 'nomeVacina', e.target.value)}
                            placeholder="Ex: Vacina Tríplice Viral"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor={`quantidade-${index}`}>Quantidade *</Label>
                          <Input
                            id={`quantidade-${index}`}
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`fabricante-${index}`}>Fabricante</Label>
                        <Input
                          id={`fabricante-${index}`}
                          value={item.fabricante}
                          onChange={(e) => handleItemChange(index, 'fabricante', e.target.value)}
                          placeholder="Ex: Laboratório XYZ"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Resumo */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Fornecedor</p>
                    <p className="font-semibold">
                      {fornecedor || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total de Itens</p>
                    <p className="font-semibold">
                      {items.filter(item => item.nomeVacina.trim() !== '').length} vacina(s)
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Quantidade Total</p>
                    <p className="font-semibold">
                      {items.reduce((sum, item) => sum + (item.quantidade || 0), 0)} dose(s)
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createMutation.isPending ? 'Salvando...' : 'Criar Orçamento'}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    O orçamento será salvo com status "Pendente" e poderá ser enviado ao fornecedor posteriormente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
