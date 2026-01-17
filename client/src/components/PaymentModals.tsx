import { useState } from "react";
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
import { toast } from "sonner";
import { Smartphone, Banknote, CreditCard, Copy, Check } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valorTotal: number;
  onConfirm: (valor: number, detalhes?: any) => void;
}

// Modal PIX
export function PixPaymentModal({
  open,
  onOpenChange,
  valorTotal,
  onConfirm,
}: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Simular chave PIX (em produção, viria do backend)
  const pixKey = "pix@clinica.com.br";
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${valorTotal.toFixed(2)}5802BR5913CLINICA VIS6009SAO PAULO62070503***6304`;

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    onConfirm(valorTotal, { tipo: "pix", chave: pixKey });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Pagamento via PIX
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código PIX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Placeholder */}
          <div className="flex justify-center p-6 bg-muted rounded-lg">
            <div className="w-48 h-48 bg-white border-4 border-primary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">QR Code PIX</p>
              </div>
            </div>
          </div>

          {/* Valor */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor a pagar</p>
            <p className="text-3xl font-bold text-primary">
              R$ {valorTotal.toFixed(2)}
            </p>
          </div>

          {/* Código PIX */}
          <div className="space-y-2">
            <Label>Código PIX (Copia e Cola)</Label>
            <div className="flex gap-2">
              <Input value={pixCode} readOnly className="font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyPixCode}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Instruções:</strong>
              <br />
              1. Abra o app do seu banco
              <br />
              2. Escolha pagar com PIX
              <br />
              3. Escaneie o QR Code ou cole o código
              <br />
              4. Confirme o pagamento
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar Pagamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal Dinheiro
export function CashPaymentModal({
  open,
  onOpenChange,
  valorTotal,
  onConfirm,
}: PaymentModalProps) {
  const [valorRecebido, setValorRecebido] = useState("");

  const valor = parseFloat(valorRecebido) || 0;
  const troco = Math.max(0, valor - valorTotal);
  const isValido = valor >= valorTotal;

  const handleConfirm = () => {
    if (!isValido) {
      toast.error("Valor recebido deve ser maior ou igual ao valor total");
      return;
    }

    onConfirm(valorTotal, {
      tipo: "dinheiro",
      valorRecebido: valor,
      troco,
    });
    onOpenChange(false);
    setValorRecebido("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Pagamento em Dinheiro
          </DialogTitle>
          <DialogDescription>
            Informe o valor recebido do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor Total */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">R$ {valorTotal.toFixed(2)}</p>
          </div>

          {/* Valor Recebido */}
          <div className="space-y-2">
            <Label htmlFor="valorRecebido">Valor Recebido *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="valorRecebido"
                type="number"
                step="0.01"
                min={valorTotal}
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
                placeholder="0,00"
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          {/* Troco */}
          {valor > 0 && (
            <div
              className={`p-4 rounded-lg ${
                isValido ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="text-sm text-muted-foreground">Troco</p>
              <p
                className={`text-2xl font-bold ${
                  isValido ? "text-green-700" : "text-red-700"
                }`}
              >
                R$ {troco.toFixed(2)}
              </p>
              {!isValido && (
                <p className="text-sm text-red-600 mt-1">
                  Valor insuficiente (faltam R${" "}
                  {(valorTotal - valor).toFixed(2)})
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValido}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal Cartão (Crédito/Débito)
export function CardPaymentModal({
  open,
  onOpenChange,
  valorTotal,
  onConfirm,
  tipo,
}: PaymentModalProps & { tipo: "credito" | "debito" }) {
  const [parcelas, setParcelas] = useState("1");
  const [bandeira, setBandeira] = useState("");
  const [ultimos4Digitos, setUltimos4Digitos] = useState("");

  const numParcelas = parseInt(parcelas);
  const valorParcela = valorTotal / numParcelas;

  const handleConfirm = () => {
    if (!bandeira) {
      toast.error("Selecione a bandeira do cartão");
      return;
    }

    if (!ultimos4Digitos || ultimos4Digitos.length !== 4) {
      toast.error("Informe os 4 últimos dígitos do cartão");
      return;
    }

    onConfirm(valorTotal, {
      tipo: tipo === "credito" ? "cartao_credito" : "cartao_debito",
      bandeira,
      ultimos4Digitos,
      parcelas: numParcelas,
      valorParcela,
    });
    onOpenChange(false);
    setBandeira("");
    setUltimos4Digitos("");
    setParcelas("1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pagamento com Cartão de {tipo === "credito" ? "Crédito" : "Débito"}
          </DialogTitle>
          <DialogDescription>
            Informe os dados da transação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor Total */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">R$ {valorTotal.toFixed(2)}</p>
          </div>

          {/* Bandeira */}
          <div className="space-y-2">
            <Label htmlFor="bandeira">Bandeira *</Label>
            <Select value={bandeira} onValueChange={setBandeira}>
              <SelectTrigger id="bandeira">
                <SelectValue placeholder="Selecione a bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="elo">Elo</SelectItem>
                <SelectItem value="amex">American Express</SelectItem>
                <SelectItem value="hipercard">Hipercard</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Últimos 4 dígitos */}
          <div className="space-y-2">
            <Label htmlFor="digitos">Últimos 4 Dígitos *</Label>
            <Input
              id="digitos"
              type="text"
              maxLength={4}
              value={ultimos4Digitos}
              onChange={(e) =>
                setUltimos4Digitos(e.target.value.replace(/\D/g, ""))
              }
              placeholder="0000"
            />
          </div>

          {/* Parcelas (apenas para crédito) */}
          {tipo === "credito" && (
            <div className="space-y-2">
              <Label htmlFor="parcelas">Parcelas</Label>
              <Select value={parcelas} onValueChange={setParcelas}>
                <SelectTrigger id="parcelas">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}x de R$ {(valorTotal / n).toFixed(2)}
                      {n === 1 ? " à vista" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar Pagamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
