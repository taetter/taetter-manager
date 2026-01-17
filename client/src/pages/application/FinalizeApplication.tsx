import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ApplicationStepper } from '@/components/ApplicationStepper';
import { ArrowLeft, CheckCircle2, User, UserPlus, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

export default function FinalizeApplication() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const tenantId = parseInt(params.id || "0");
  
  // Recuperar dados da sessão
  const patientId = parseInt(sessionStorage.getItem("application_patientId") || "0");
  const selectedVaccines = JSON.parse(sessionStorage.getItem("application_vaccines") || "[]");
  const tipoEtiqueta = sessionStorage.getItem("application_tipoEtiqueta");
  const payments = JSON.parse(sessionStorage.getItem("application_payments") || "[]");
  const troco = parseFloat(sessionStorage.getItem("application_troco") || "0");
  
  // Estados
  const [pagadorMesmoPaciente, setPagadorMesmoPaciente] = useState(true);
  const [pagadorId, setPagadorId] = useState<number | null>(null);
  const [pagadorNome, setPagadorNome] = useState("");
  const [pagadorCPF, setPagadorCPF] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Queries
  const { data: patient } = trpc.patients.getById.useQuery(
    { id: patientId, tenantId },
    { enabled: !!patientId }
  );

  // Buscar pacientes para seleção de pagador
  const { data: patients } = trpc.patients.list.useQuery(
    { tenantId },
    { enabled: !pagadorMesmoPaciente }
  );

  // Mutations
  const createApplicationMutation = trpc.vaccineApplications.create.useMutation();
  const createPaymentMutation = trpc.paymentsApp.create.useMutation();

  const handleVoltar = () => {
    setLocation(`/tenant/${tenantId}/application/payment`);
  };

  const handleFinalizar = async () => {
    // Validar dados do pagador
    if (!pagadorMesmoPaciente && !pagadorId && (!pagadorNome || !pagadorCPF)) {
      toast.error("Por favor, selecione ou cadastre o responsável financeiro");
      return;
    }

    setIsProcessing(true);

    try {
      // Criar aplicações para cada vacina
      const applicationPromises = selectedVaccines.map((vaccine: any) =>
        createApplicationMutation.mutateAsync({
          tenantId,
          patientId,
          vaccineId: vaccine.id,
          tipoEtiqueta: tipoEtiqueta as "fisica_virtual" | "somente_virtual",
          pagadorMesmoPaciente,
          pagadorId: pagadorMesmoPaciente ? patientId : (pagadorId || undefined),
          pagadorNome: pagadorMesmoPaciente ? patient?.nome : pagadorNome,
          pagadorCPF: pagadorMesmoPaciente ? patient?.cpf : pagadorCPF,
        })
      );

      const applications = await Promise.all(applicationPromises);
      
      // Criar pagamentos
      for (const payment of payments) {
        await createPaymentMutation.mutateAsync({
          tenantId,
          applicationId: applications[0].id,
          tipo: payment.tipo,
          valor: payment.valor.toString(),
        });
      }

      toast.success("Aplicação finalizada com sucesso!");

      // Limpar sessão
      sessionStorage.removeItem("application_patientId");
      sessionStorage.removeItem("application_vaccines");
      sessionStorage.removeItem("application_unitId");
      sessionStorage.removeItem("application_refrigeratorId");
      sessionStorage.removeItem("application_tipoEtiqueta");
      sessionStorage.removeItem("application_payments");
      sessionStorage.removeItem("application_troco");

      // Redirecionar para dashboard ou nova aplicação
      setLocation(`/tenant/${tenantId}/application/select-patient`);
    } catch (error: any) {
      console.error("Erro ao finalizar aplicação:", error);
      toast.error(error.message || "Erro ao finalizar aplicação");
    } finally {
      setIsProcessing(false);
    }
  };

  const valorTotal = selectedVaccines.reduce((acc: number, v: any) => acc + (parseFloat(v.preco) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ApplicationStepper currentStep={5} totalSteps={5} />
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
            <BreadcrumbPage>Finalização</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Finalização</h1>
        <p className="text-muted-foreground mt-2">
          Confirme os dados e finalize a aplicação
        </p>
      </div>

      {/* Resumo da Aplicação */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo da Aplicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Paciente */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-primary" />
              <span className="font-medium">Paciente</span>
            </div>
            <p className="text-lg font-bold">{patient?.nome}</p>
            <p className="text-sm text-muted-foreground">CPF: {patient?.cpf}</p>
          </div>

          {/* Vacinas */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Vacinas Aplicadas</p>
            <div className="space-y-2">
              {selectedVaccines.map((vaccine: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">{vaccine.nome}</span>
                  <span className="font-bold">R$ {parseFloat(vaccine.preco || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pagamento */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Formas de Pagamento</p>
            <div className="space-y-2">
              {payments.map((payment: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium capitalize">{payment.tipo}</span>
                  <span className="font-bold">R$ {parseFloat(payment.valor || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {troco > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                <span className="font-medium text-green-800">Troco</span>
                <span className="font-bold text-green-600">R$ {troco.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Etiqueta */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              {tipoEtiqueta === "fisica_virtual" ? (
                <>
                  <Printer className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Etiqueta física será impressa + Etiqueta virtual na Área do Paciente
                  </span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Etiqueta virtual disponível na Área do Paciente
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identificação do Pagador */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Responsável Financeiro (Pagador)</CardTitle>
          <CardDescription>
            Quem é o responsável pelo pagamento desta aplicação?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção: Mesmo Paciente ou Outro */}
          <RadioGroup 
            value={pagadorMesmoPaciente ? "mesmo" : "outro"} 
            onValueChange={(value) => setPagadorMesmoPaciente(value === "mesmo")}
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="mesmo" id="mesmo" />
              <Label htmlFor="mesmo" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">O pagador é o próprio paciente</p>
                    <p className="text-sm text-muted-foreground">
                      A nota fiscal será emitida para {patient?.nome}
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="outro" id="outro" />
              <Label htmlFor="outro" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">O pagador é outra pessoa (responsável)</p>
                    <p className="text-sm text-muted-foreground">
                      Selecione ou cadastre o responsável financeiro
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Se pagador for outro */}
          {!pagadorMesmoPaciente && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div>
                <Label>Selecionar Paciente Existente (opcional)</Label>
                <select
                  className="w-full mt-2 p-2 border rounded-lg"
                  value={pagadorId || ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setPagadorId(id || null);
                    const selected = patients?.find((p: any) => p.id === id);
                    if (selected) {
                      setPagadorNome(selected.nome);
                      setPagadorCPF(selected.cpf);
                    }
                  }}
                >
                  <option value="">-- Selecione um paciente --</option>
                  {patients?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} - {p.cpf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                OU
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Nome Completo</Label>
                  <Input
                    value={pagadorNome}
                    onChange={(e) => setPagadorNome(e.target.value)}
                    placeholder="Digite o nome do responsável"
                    disabled={!!pagadorId}
                  />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={pagadorCPF}
                    onChange={(e) => setPagadorCPF(e.target.value)}
                    placeholder="000.000.000-00"
                    disabled={!!pagadorId}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informação sobre NF */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">
            <strong>Nota Fiscal:</strong> A NF-e será emitida para{" "}
            {pagadorMesmoPaciente 
              ? patient?.nome 
              : pagadorNome || "o responsável selecionado"
            } (CPF: {pagadorMesmoPaciente ? patient?.cpf : pagadorCPF || "a ser informado"})
          </p>
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleVoltar} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button 
          onClick={handleFinalizar}
          disabled={isProcessing || (!pagadorMesmoPaciente && !pagadorId && (!pagadorNome || !pagadorCPF))}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            "Processando..."
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar Aplicação
            </>
          )}
        </Button>
      </div>
    </div>
    </div>
  );
}
