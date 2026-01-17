import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface VaccineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: number;
  vaccineId?: number;
  onSuccess: () => void;
}

export function VaccineFormDialog({ open, onOpenChange, tenantId, vaccineId, onSuccess }: VaccineFormDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    nomeFantasia: '',
    marca: '',
    lote: '',
    dataValidade: '',
    codigoBarras: '',
    estoqueMinimo: 10,
    bula: '',
  });

  // Buscar dados da vacina se estiver editando
  const { data: vaccine } = trpc.vaccines.getById.useQuery(
    { id: vaccineId!, tenantId },
    { enabled: !!vaccineId && open }
  );

  // Preencher formulário ao editar
  useEffect(() => {
    if (vaccine) {
      setFormData({
        nome: vaccine.nome || '',
        nomeFantasia: vaccine.nomeFantasia || '',
        marca: vaccine.marca || '',
        lote: vaccine.lote || '',
        dataValidade: vaccine.validade ? new Date(vaccine.validade).toISOString().split('T')[0] : '',
        codigoBarras: vaccine.codigoBarras || '',
        estoqueMinimo: vaccine.estoqueMinimo || 10,
        bula: vaccine.bula || '',
      });
    } else {
      // Resetar formulário ao criar novo
      setFormData({
        nome: '',
        nomeFantasia: '',
        marca: '',
        lote: '',
        dataValidade: '',
        codigoBarras: '',
        estoqueMinimo: 10,
        bula: '',
      });
    }
  }, [vaccine, open]);

  // Criar vacina
  const createMutation = trpc.vaccines.create.useMutation({
    onSuccess: () => {
      toast.success('Vacina cadastrada com sucesso!');
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar vacina: ${error.message}`);
    },
  });

  // Atualizar vacina
  const updateMutation = trpc.vaccines.update.useMutation({
    onSuccess: () => {
      toast.success('Vacina atualizada com sucesso!');
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar vacina: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!formData.nome.trim()) {
      toast.error('Nome da vacina é obrigatório');
      return;
    }

    const payload = {
      tenantId,
      ...formData,
      dataValidade: formData.dataValidade ? new Date(formData.dataValidade) : undefined,
    };

    if (vaccineId) {
      updateMutation.mutate({ id: vaccineId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vaccineId ? 'Editar Vacina' : 'Nova Vacina'}</DialogTitle>
          <DialogDescription>
            {vaccineId
              ? 'Atualize as informações da vacina'
              : 'Preencha os dados para cadastrar uma nova vacina'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome da Vacina *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Vacina Tríplice Viral"
                required
              />
            </div>

            {/* Nome Fantasia */}
            <div>
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                placeholder="Ex: MMR-II"
              />
            </div>

            {/* Marca */}
            <div>
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
                placeholder="Ex: Merck"
              />
            </div>

            {/* Lote */}
            <div>
              <Label htmlFor="lote">Lote</Label>
              <Input
                id="lote"
                value={formData.lote}
                onChange={(e) => handleChange('lote', e.target.value)}
                placeholder="Ex: L123456"
              />
            </div>

            {/* Data de Validade */}
            <div>
              <Label htmlFor="dataValidade">Data de Validade</Label>
              <Input
                id="dataValidade"
                type="date"
                value={formData.dataValidade}
                onChange={(e) => handleChange('dataValidade', e.target.value)}
              />
            </div>

            {/* Código de Barras */}
            <div>
              <Label htmlFor="codigoBarras">Código de Barras</Label>
              <Input
                id="codigoBarras"
                value={formData.codigoBarras}
                onChange={(e) => handleChange('codigoBarras', e.target.value)}
                placeholder="Ex: 7891234567890"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                min="0"
                value={formData.estoqueMinimo}
                onChange={(e) => handleChange('estoqueMinimo', parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Bula */}
            <div className="md:col-span-2">
              <Label htmlFor="bula">Bula / Observações</Label>
              <Textarea
                id="bula"
                value={formData.bula}
                onChange={(e) => handleChange('bula', e.target.value)}
                placeholder="Informações sobre indicações, contraindicações, posologia..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : vaccineId ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
