import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, CreditCard, QrCode, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FinancialModalsProps {
  tenantId: number;
  valorTotal: number;
  onPaymentComplete: (payment: PaymentData) => void;
}

export interface PaymentData {
  tipo: "pix" | "credito" | "debito" | "dinheiro";
  valor: number;
  // PIX
  pixChave?: string;
  pixQrCode?: string;
  // Cartão
  cartaoBandeira?: string;
  cartaoUltimosDigitos?: string;
  numeroParcelas?: number;
  // Dinheiro
  valorRecebido?: number;
  troco?: number;
  observacoes?: string;
}

export function FinancialModals({ tenantId, valorTotal, onPaymentComplete }: FinancialModalsProps) {
  const [modalAberto, setModalAberto] = useState<"pix" | "dinheiro" | "credito" | "debito" | null>(null);
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setModalAberto("pix")}
        >
          <QrCode className="w-8 h-8" />
          <span>PIX</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setModalAberto("dinheiro")}
        >
          <Banknote className="w-8 h-8" />
          <span>Dinheiro</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setModalAberto("credito")}
        >
          <CreditCard className="w-8 h-8" />
          <span>Crédito</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setModalAberto("debito")}
        >
          <Smartphone className="w-8 h-8" />
          <span>Débito</span>
        </Button>
      </div>

      {/* Modal PIX */}
      <PixModal
        open={modalAberto === "pix"}
        onClose={() => setModalAberto(null)}
        valorTotal={valorTotal}
        onConfirm={(data) => {
          onPaymentComplete(data);
          setModalAberto(null);
        }}
      />

      {/* Modal Dinheiro */}
      <DinheiroModal
        open={modalAberto === "dinheiro"}
        onClose={() => setModalAberto(null)}
        valorTotal={valorTotal}
        onConfirm={(data) => {
          onPaymentComplete(data);
          setModalAberto(null);
        }}
      />

      {/* Modal Crédito */}
      <CreditoModal
        open={modalAberto === "credito"}
        onClose={() => setModalAberto(null)}
        valorTotal={valorTotal}
        onConfirm={(data) => {
          onPaymentComplete(data);
          setModalAberto(null);
        }}
      />

      {/* Modal Débito */}
      <DebitoModal
        open={modalAberto === "debito"}
        onClose={() => setModalAberto(null)}
        valorTotal={valorTotal}
        onConfirm={(data) => {
          onPaymentComplete(data);
          setModalAberto(null);
        }}
      />
    </>
  );
}

// Modal PIX
interface PixModalProps {
  open: boolean;
  onClose: () => void;
  valorTotal: number;
  onConfirm: (data: PaymentData) => void;
}

function PixModal({ open, onClose, valorTotal, onConfirm }: PixModalProps) {
  const [pixChave, setPixChave] = useState("");
  const [gerandoQrCode, setGerandoQrCode] = useState(false);
  const [qrCodeGerado, setQrCodeGerado] = useState("");

  const gerarQrCode = async () => {
    if (!pixChave) {
      toast.error("Informe a chave PIX");
      return;
    }

    setGerandoQrCode(true);
    // Simular geração de QR Code
    setTimeout(() => {
      const qrCode = `00020126580014br.gov.bcb.pix0136${pixChave}520400005303986540${valorTotal.toFixed(2)}5802BR5913Clinica6009SAO PAULO62070503***6304`;
      setQrCodeGerado(qrCode);
      setGerandoQrCode(false);
      toast.success("QR Code gerado com sucesso!");
    }, 1500);
  };

  const confirmar = () => {
    if (!qrCodeGerado) {
      toast.error("Gere o QR Code antes de confirmar");
      return;
    }

    onConfirm({
      tipo: "pix",
      valor: valorTotal,
      pixChave,
      pixQrCode: qrCodeGerado,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Pagamento via PIX
          </DialogTitle>
          <DialogDescription>
            Valor total: <strong>R$ {valorTotal.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pixChave">Chave PIX</Label>
            <Input
              id="pixChave"
              placeholder="CPF, CNPJ, E-mail, Telefone ou Chave Aleatória"
              value={pixChave}
              onChange={(e) => setPixChave(e.target.value)}
            />
          </div>

          <Button
            type="button"
            onClick={gerarQrCode}
            disabled={gerandoQrCode || !pixChave}
            className="w-full"
          >
            {gerandoQrCode ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando QR Code...
              </>
            ) : (
              "Gerar QR Code"
            )}
          </Button>

          {qrCodeGerado && (
            <div className="border rounded-lg p-4 bg-muted">
              <div className="flex justify-center mb-3">
                <div className="w-48 h-48 bg-white border-2 border-primary rounded-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-primary" />
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground break-all">
                {qrCodeGerado}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!qrCodeGerado}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal Dinheiro
interface DinheiroModalProps {
  open: boolean;
  onClose: () => void;
  valorTotal: number;
  onConfirm: (data: PaymentData) => void;
}

function DinheiroModal({ open, onClose, valorTotal, onConfirm }: DinheiroModalProps) {
  const [valorRecebido, setValorRecebido] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const valorRecebidoNum = parseFloat(valorRecebido) || 0;
  const troco = valorRecebidoNum - valorTotal;

  const confirmar = () => {
    if (valorRecebidoNum < valorTotal) {
      toast.error("Valor recebido é menor que o valor total");
      return;
    }

    onConfirm({
      tipo: "dinheiro",
      valor: valorTotal,
      valorRecebido: valorRecebidoNum,
      troco: troco > 0 ? troco : 0,
      observacoes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Pagamento em Dinheiro
          </DialogTitle>
          <DialogDescription>
            Valor total: <strong>R$ {valorTotal.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="valorRecebido">Valor Recebido</Label>
            <Input
              id="valorRecebido"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={valorRecebido}
              onChange={(e) => setValorRecebido(e.target.value)}
            />
          </div>

          {valorRecebidoNum > 0 && (
            <div className={`p-4 rounded-lg border ${troco >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-center">
                <span className="font-medium">Troco:</span>
                <span className={`text-xl font-bold ${troco >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  R$ {Math.abs(troco).toFixed(2)}
                </span>
              </div>
              {troco < 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Faltam R$ {Math.abs(troco).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o pagamento"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={valorRecebidoNum < valorTotal}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal Crédito
interface CreditoModalProps {
  open: boolean;
  onClose: () => void;
  valorTotal: number;
  onConfirm: (data: PaymentData) => void;
}

function CreditoModal({ open, onClose, valorTotal, onConfirm }: CreditoModalProps) {
  const [bandeira, setBandeira] = useState("");
  const [ultimosDigitos, setUltimosDigitos] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [observacoes, setObservacoes] = useState("");

  const numParcelas = parseInt(parcelas) || 1;
  const valorParcela = valorTotal / numParcelas;

  const confirmar = () => {
    if (!bandeira) {
      toast.error("Selecione a bandeira do cartão");
      return;
    }
    if (!ultimosDigitos || ultimosDigitos.length !== 4) {
      toast.error("Informe os 4 últimos dígitos do cartão");
      return;
    }

    onConfirm({
      tipo: "credito",
      valor: valorTotal,
      cartaoBandeira: bandeira,
      cartaoUltimosDigitos: ultimosDigitos,
      numeroParcelas: numParcelas,
      observacoes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pagamento em Crédito
          </DialogTitle>
          <DialogDescription>
            Valor total: <strong>R$ {valorTotal.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bandeira">Bandeira do Cartão</Label>
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ultimosDigitos">Últimos 4 Dígitos</Label>
            <Input
              id="ultimosDigitos"
              type="text"
              maxLength={4}
              placeholder="0000"
              value={ultimosDigitos}
              onChange={(e) => setUltimosDigitos(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parcelas">Número de Parcelas</Label>
            <Select value={parcelas} onValueChange={setParcelas}>
              <SelectTrigger id="parcelas">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}x de R$ {(valorTotal / n).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {numParcelas > 1 && (
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor da Parcela:</span>
                <span className="text-xl font-bold text-blue-700">
                  {numParcelas}x R$ {valorParcela.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o pagamento"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!bandeira || ultimosDigitos.length !== 4}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal Débito
interface DebitoModalProps {
  open: boolean;
  onClose: () => void;
  valorTotal: number;
  onConfirm: (data: PaymentData) => void;
}

function DebitoModal({ open, onClose, valorTotal, onConfirm }: DebitoModalProps) {
  const [bandeira, setBandeira] = useState("");
  const [ultimosDigitos, setUltimosDigitos] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const confirmar = () => {
    if (!bandeira) {
      toast.error("Selecione a bandeira do cartão");
      return;
    }
    if (!ultimosDigitos || ultimosDigitos.length !== 4) {
      toast.error("Informe os 4 últimos dígitos do cartão");
      return;
    }

    onConfirm({
      tipo: "debito",
      valor: valorTotal,
      cartaoBandeira: bandeira,
      cartaoUltimosDigitos: ultimosDigitos,
      observacoes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Pagamento em Débito
          </DialogTitle>
          <DialogDescription>
            Valor total: <strong>R$ {valorTotal.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bandeira">Bandeira do Cartão</Label>
            <Select value={bandeira} onValueChange={setBandeira}>
              <SelectTrigger id="bandeira">
                <SelectValue placeholder="Selecione a bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="elo">Elo</SelectItem>
                <SelectItem value="maestro">Maestro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ultimosDigitos">Últimos 4 Dígitos</Label>
            <Input
              id="ultimosDigitos"
              type="text"
              maxLength={4}
              placeholder="0000"
              value={ultimosDigitos}
              onChange={(e) => setUltimosDigitos(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="p-4 rounded-lg border bg-green-50 border-green-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">Valor à Vista:</span>
              <span className="text-xl font-bold text-green-700">
                R$ {valorTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o pagamento"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!bandeira || ultimosDigitos.length !== 4}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
