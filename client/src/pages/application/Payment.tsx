import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ApplicationStepper } from '@/components/ApplicationStepper';
import { ArrowRight, ArrowLeft, CreditCard, Smartphone, Banknote, Plus, X, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { FinancialModals, PaymentData } from '@/components/FinancialModals';

type PaymentType = 'pix' | 'credito' | 'debito' | 'dinheiro';

interface PaymentItem {
  id: string;
  tipo: PaymentType;
  valor: number;
}

export function Payment() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [, setLocation] = useLocation();
  
  // Obter dados da query string
  const searchParams = new URLSearchParams(window.location.search);
  const patientId = parseInt(searchParams.get('patientId') || '0');
  const unitId = parseInt(searchParams.get('unitId') || '0');
  const refrigeratorId = parseInt(searchParams.get('refrigeratorId') || '0');
  const vaccineIds = searchParams.get('vaccineIds')?.split(',').map(Number) || [];
  const labelType = searchParams.get('labelType') || 'fisica_virtual';
  
  // Por enquanto, valor esperado é 0 (vacinas sem preço definido)
  const valorEsperado = 0;
  
  // Estados
  const [payments, setPayments] = useState<PaymentItem[]>([
    { id: crypto.randomUUID(), tipo: 'pix', valor: valorEsperado }
  ]);
  const [novoTipo, setNovoTipo] = useState<PaymentType>('pix');
  const [novoValor, setNovoValor] = useState('');
  
  // Estado para mostrar modais
  const [mostrarModais, setMostrarModais] = useState(false);

  // Calcular totais
  const valorTotal = payments.reduce((acc, p) => acc + p.valor, 0);
  const saldoRestante = valorEsperado - valorTotal;
  const troco = Math.max(0, valorTotal - valorEsperado);
  const isPago = valorTotal >= valorEsperado;

  const handleVoltar = () => {
    const vaccineIdsParam = vaccineIds.join(',');
    setLocation(
      `/tenant/${tenantId}/application/confirm?patientId=${patientId}&unitId=${unitId}&refrigeratorId=${refrigeratorId}&vaccineIds=${vaccineIdsParam}`
    );
  };

  const handleContinuar = () => {
    if (!isPago) {
      toast.error("O valor total dos pagamentos deve ser igual ou maior que o valor das vacinas");
      return;
    }

    // Navegar para tela de finalização com todos os parâmetros
    const vaccineIdsParam = vaccineIds.join(',');
    const paymentsParam = encodeURIComponent(JSON.stringify(payments));
    setLocation(
      `/tenant/${tenantId}/application/finalize?patientId=${patientId}&unitId=${unitId}&refrigeratorId=${refrigeratorId}&vaccineIds=${vaccineIdsParam}&labelType=${labelType}&payments=${paymentsParam}&troco=${troco}`
    );
  };

  const handleAdicionarPagamento = () => {
    const valor = parseFloat(novoValor);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    setPayments([...payments, {
      id: crypto.randomUUID(),
      tipo: novoTipo,
      valor
    }]);

    setNovoValor('');
    toast.success("Forma de pagamento adicionada");
  };

  const handlePaymentComplete = (payment: PaymentData) => {
    setPayments([...payments, {
      id: crypto.randomUUID(),
      tipo: payment.tipo,
      valor: payment.valor
    }]);
    setMostrarModais(false);
    toast.success("Pagamento adicionado com sucesso!");
  };

  const handleRemoverPagamento = (id: string) => {
    if (payments.length === 1) {
      toast.error("Deve haver pelo menos uma forma de pagamento");
      return;
    }

    setPayments(payments.filter(p => p.id !== id));
    toast.success("Forma de pagamento removida");
  };

  const handleAlterarValor = (id: string, novoValor: string) => {
    const valor = parseFloat(novoValor);
    if (isNaN(valor) || valor < 0) return;

    setPayments(payments.map(p => 
      p.id === id ? { ...p, valor } : p
    ));
  };

  const getPaymentIcon = (tipo: PaymentType) => {
    switch (tipo) {
      case 'pix': return <Smartphone className="h-5 w-5" />;
      case 'credito': return <CreditCard className="h-5 w-5" />;
      case 'debito': return <CreditCard className="h-5 w-5" />;
      case 'dinheiro': return <Banknote className="h-5 w-5" />;
    }
  };

  const getPaymentLabel = (tipo: PaymentType) => {
    switch (tipo) {
      case 'pix': return 'PIX';
      case 'credito': return 'Cartão de Crédito';
      case 'debito': return 'Cartão de Débito';
      case 'dinheiro': return 'Dinheiro';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ApplicationStepper currentStep={4} totalSteps={5} />
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/tenant/${tenantId}/dashboard`}>Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/tenant/${tenantId}/application`}>Módulo de Aplicações</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pagamento</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pagamento</h1>
        <p className="text-muted-foreground mt-2">
          Adicione as formas de pagamento utilizadas
        </p>
      </div>

      {/* Resumo do Valor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            R$ {valorEsperado.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {vaccineIds.length} vacina(s) selecionada(s)
          </p>
        </CardContent>
      </Card>

      {/* Formas de Pagamento Adicionadas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Formas de Pagamento</CardTitle>
          <CardDescription>
            Adicione uma ou mais formas de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.map((payment, index) => (
            <div key={payment.id} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3 flex-1">
                {getPaymentIcon(payment.tipo)}
                <div className="flex-1">
                  <p className="font-medium">{getPaymentLabel(payment.tipo)}</p>
                  <p className="text-sm text-muted-foreground">Forma {index + 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">R$</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={payment.valor}
                    onChange={(e) => handleAlterarValor(payment.id, e.target.value)}
                    className="w-32"
                  />
                </div>
                {payments.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoverPagamento(payment.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Adicionar Nova Forma */}
          <div className="p-4 border-2 border-dashed rounded-lg">
            <p className="font-medium mb-3">Adicionar Forma de Pagamento</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMostrarModais(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pagamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Pagamento */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Valor das Vacinas:</span>
            <span className="font-semibold">R$ {valorEsperado.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Total Pago:</span>
            <span className="font-semibold">R$ {valorTotal.toFixed(2)}</span>
          </div>
          
          {saldoRestante > 0 && (
            <div className="flex justify-between text-lg p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-800 font-medium flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Saldo Restante:
              </span>
              <span className="font-bold text-yellow-600">R$ {saldoRestante.toFixed(2)}</span>
            </div>
          )}

          {troco > 0 && (
            <div className="flex justify-between text-lg p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium">Troco:</span>
              <span className="font-bold text-green-600">R$ {troco.toFixed(2)}</span>
            </div>
          )}

          {isPago && saldoRestante === 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <span className="text-blue-800 font-medium">✓ Pagamento Completo</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleVoltar}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button 
          onClick={handleContinuar}
          disabled={!isPago}
          className="bg-green-600 hover:bg-green-700"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Modais de Pagamento */}
      {mostrarModais && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Adicionar Forma de Pagamento</CardTitle>
              <CardDescription>
                Selecione a forma de pagamento desejada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialModals
                tenantId={tenantId}
                valorTotal={Math.max(0, saldoRestante)}
                onPaymentComplete={handlePaymentComplete}
              />
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setMostrarModais(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </div>
  );
}
