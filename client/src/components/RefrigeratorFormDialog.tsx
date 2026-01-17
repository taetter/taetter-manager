import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface RefrigeratorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: number;
  refrigeratorId?: number;
  onSuccess: () => void;
}

export function RefrigeratorFormDialog({ open, onOpenChange, tenantId, refrigeratorId, onSuccess }: RefrigeratorFormDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    modelo: '',
    marca: '',
    numeroSerie: '',
    unitId: '',
    temperaturaMin: '-20',
    temperaturaMax: '8',
    capacidade: '0',
  });

  // Buscar unidades para o select
  const { data: units } = trpc.units.list.useQuery(
    { tenantId },
    { enabled: !!tenantId && open }
  );

  // Buscar dados da geladeira se estiver editando
  const { data: refrigerator } = trpc.refrigerators.getById.useQuery(
    { id: refrigeratorId!, tenantId },
    { enabled: !!refrigeratorId && open }
  );

  // Preencher formulário ao editar
  useEffect(() => {
    if (refrigerator) {
      setFormData({
        nome: refrigerator.nome || '',
        modelo: refrigerator.modelo || '',
        marca: refrigerator.marca || '',
        numeroSerie: refrigerator.numeroSerie || '',
        unitId: refrigerator.unitId?.toString() || '',
        temperaturaMin: refrigerator.temperaturaMin || '-20',
        temperaturaMax: refrigerator.temperaturaMax || '8',
        capacidade: refrigerator.capacidadeLitros?.toString() || '0',
      });
    } else {
      // Resetar formulário ao criar novo
      setFormData({
        nome: '',
        modelo: '',
        marca: '',
        numeroSerie: '',
        unitId: '',
        temperaturaMin: '-20',
        temperaturaMax: '8',
        capacidade: '0',
      });
    }
  }, [refrigerator, open]);

  // Criar geladeira
  const createMutation = trpc.refrigerators.create.useMutation({
    onSuccess: () => {
      toast.success('Geladeira cadastrada com sucesso!');
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar geladeira: ${error.message}`);
    },
  });

  // Atualizar geladeira
  const updateMutation = trpc.refrigerators.update.useMutation({
    onSuccess: () => {
      toast.success('Geladeira atualizada com sucesso!');
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar geladeira: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!formData.nome.trim()) {
      toast.error('Nome da geladeira é obrigatório');
      return;
    }

    if (!formData.unitId) {
      toast.error('Selecione uma unidade');
      return;
    }

    const payload = {
      tenantId,
      nome: formData.nome,
      modelo: formData.modelo || undefined,
      marca: formData.marca || undefined,
      numeroSerie: formData.numeroSerie || undefined,
      unitId: parseInt(formData.unitId),
      temperaturaMin: formData.temperaturaMin,
      temperaturaMax: formData.temperaturaMax,
      capacidadeLitros: parseInt(formData.capacidade) || undefined,
    };

    if (refrigeratorId) {
      updateMutation.mutate({ id: refrigeratorId, ...payload });
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
          <DialogTitle>{refrigeratorId ? 'Editar Geladeira' : 'Nova Geladeira'}</DialogTitle>
          <DialogDescription>
            {refrigeratorId
              ? 'Atualize as informações da geladeira'
              : 'Preencha os dados para cadastrar uma nova geladeira'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome da Geladeira *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Geladeira Principal"
                required
              />
            </div>

            {/* Unidade */}
            <div className="md:col-span-2">
              <Label htmlFor="unitId">Unidade *</Label>
              <Select value={formData.unitId} onValueChange={(value) => handleChange('unitId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modelo */}
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleChange('modelo', e.target.value)}
                placeholder="Ex: FrostFree 450L"
              />
            </div>

            {/* Marca */}
            <div>
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
                placeholder="Ex: Consul"
              />
            </div>

            {/* Número de Série */}
            <div className="md:col-span-2">
              <Label htmlFor="numeroSerie">Número de Série</Label>
              <Input
                id="numeroSerie"
                value={formData.numeroSerie}
                onChange={(e) => handleChange('numeroSerie', e.target.value)}
                placeholder="Ex: SN123456789"
              />
            </div>

            {/* Temperatura Mínima */}
            <div>
              <Label htmlFor="temperaturaMin">Temperatura Mínima (°C)</Label>
              <Input
                id="temperaturaMin"
                type="number"
                value={formData.temperaturaMin}
                onChange={(e) => handleChange('temperaturaMin', e.target.value)}
                placeholder="Ex: -20"
              />
            </div>

            {/* Temperatura Máxima */}
            <div>
              <Label htmlFor="temperaturaMax">Temperatura Máxima (°C)</Label>
              <Input
                id="temperaturaMax"
                type="number"
                value={formData.temperaturaMax}
                onChange={(e) => handleChange('temperaturaMax', e.target.value)}
                placeholder="Ex: 8"
              />
            </div>

            {/* Capacidade */}
            <div className="md:col-span-2">
              <Label htmlFor="capacidade">Capacidade (litros)</Label>
              <Input
                id="capacidade"
                type="number"
                min="0"
                value={formData.capacidade}
                onChange={(e) => handleChange('capacidade', e.target.value)}
                placeholder="Ex: 450"
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
              {isLoading ? 'Salvando...' : refrigeratorId ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
