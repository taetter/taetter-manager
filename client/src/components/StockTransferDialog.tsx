import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, Package } from "lucide-react";

interface StockTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: number;
  onSuccess?: () => void;
}

export function StockTransferDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess,
}: StockTransferDialogProps) {
  const [formData, setFormData] = useState({
    vaccineId: "",
    fromRefrigeratorId: "",
    toRefrigeratorId: "",
    quantidade: "",
    observacoes: "",
  });

  // Buscar vacinas
  const { data: vaccines } = trpc.vaccines.list.useQuery(
    { tenantId },
    { enabled: open }
  );

  // Buscar geladeiras
  const { data: refrigerators } = trpc.refrigerators.list.useQuery(
    { tenantId },
    { enabled: open }
  );

  // Buscar detalhes da vacina selecionada
  const selectedVaccine = vaccines?.find(
    (v) => v.id === parseInt(formData.vaccineId)
  );

  // Estoque disponível na geladeira de origem
  const availableStock =
    selectedVaccine && formData.fromRefrigeratorId
      ? selectedVaccine.refrigeratorId === parseInt(formData.fromRefrigeratorId)
        ? selectedVaccine.quantidadeDisponivel
        : 0
      : 0;

  const transferMutation = trpc.vaccines.transfer.useMutation({
    onSuccess: () => {
      toast.success("Transferência realizada com sucesso!");
      setFormData({
        vaccineId: "",
        fromRefrigeratorId: "",
        toRefrigeratorId: "",
        quantidade: "",
        observacoes: "",
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao realizar transferência");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.vaccineId) {
      toast.error("Selecione uma vacina");
      return;
    }

    if (!formData.fromRefrigeratorId) {
      toast.error("Selecione a geladeira de origem");
      return;
    }

    if (!formData.toRefrigeratorId) {
      toast.error("Selecione a geladeira de destino");
      return;
    }

    if (formData.fromRefrigeratorId === formData.toRefrigeratorId) {
      toast.error("As geladeiras de origem e destino devem ser diferentes");
      return;
    }

    const quantidade = parseInt(formData.quantidade);
    if (!quantidade || quantidade <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    if (quantidade > availableStock) {
      toast.error(
        `Quantidade indisponível. Estoque disponível: ${availableStock}`
      );
      return;
    }

    transferMutation.mutate({
      tenantId,
      vaccineId: parseInt(formData.vaccineId),
      fromRefrigeratorId: parseInt(formData.fromRefrigeratorId),
      toRefrigeratorId: parseInt(formData.toRefrigeratorId),
      quantidade,
      observacoes: formData.observacoes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Transferência de Estoque
          </DialogTitle>
          <DialogDescription>
            Transfira vacinas entre geladeiras/unidades de armazenamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vacina */}
          <div className="space-y-2">
            <Label htmlFor="vaccine">Vacina *</Label>
            <Select
              value={formData.vaccineId}
              onValueChange={(value) =>
                setFormData({ ...formData, vaccineId: value })
              }
            >
              <SelectTrigger id="vaccine">
                <SelectValue placeholder="Selecione a vacina" />
              </SelectTrigger>
              <SelectContent>
                {vaccines?.map((vaccine) => (
                  <SelectItem key={vaccine.id} value={vaccine.id.toString()}>
                    {vaccine.nome} - Lote: {vaccine.lote} (Estoque:{" "}
                    {vaccine.quantidadeDisponivel})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Geladeira de Origem e Destino */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">Geladeira de Origem *</Label>
              <Select
                value={formData.fromRefrigeratorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, fromRefrigeratorId: value })
                }
              >
                <SelectTrigger id="from">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  {refrigerators?.refrigerators?.map((ref) => (
                    <SelectItem key={ref.id} value={ref.id.toString()}>
                      {ref.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">Geladeira de Destino *</Label>
              <Select
                value={formData.toRefrigeratorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, toRefrigeratorId: value })
                }
              >
                <SelectTrigger id="to">
                  <SelectValue placeholder="Destino" />
                </SelectTrigger>
                <SelectContent>
                  {refrigerators?.refrigerators?.map((ref) => (
                    <SelectItem
                      key={ref.id}
                      value={ref.id.toString()}
                      disabled={ref.id.toString() === formData.fromRefrigeratorId}
                    >
                      {ref.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indicador visual de transferência */}
          {formData.fromRefrigeratorId && formData.toRefrigeratorId && (
            <div className="flex items-center justify-center gap-3 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {
                  refrigerators?.refrigerators?.find(
                    (r) => r.id.toString() === formData.fromRefrigeratorId
                  )?.nome
                }
              </span>
              <ArrowRight className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                {
                  refrigerators?.refrigerators?.find(
                    (r) => r.id.toString() === formData.toRefrigeratorId
                  )?.nome
                }
              </span>
            </div>
          )}

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              max={availableStock}
              value={formData.quantidade}
              onChange={(e) =>
                setFormData({ ...formData, quantidade: e.target.value })
              }
              placeholder="Digite a quantidade"
            />
            {availableStock > 0 && (
              <p className="text-xs text-muted-foreground">
                Disponível na origem: {availableStock} unidades
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Motivo da transferência, condições, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={transferMutation.isPending}>
              {transferMutation.isPending ? "Transferindo..." : "Transferir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
