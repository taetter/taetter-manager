import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ApplicationStepper } from "@/components/ApplicationStepper";
import { Calculator, User, FileText, ArrowRight, AlertCircle, DollarSign, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function BudgetQuote() {
  const [, params] = useRoute("/tenant/:tenantId/application/budget");
  const [, navigate] = useLocation();
  const tenantId = params?.tenantId ? parseInt(params.tenantId) : 0;

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPriceTableId, setSelectedPriceTableId] = useState<number | null>(null);
  const [selectedVaccineIds, setSelectedVaccineIds] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Buscar pacientes
  const { data: patientsData } = trpc.patients.list.useQuery({ tenantId });
  const patients = patientsData?.patients || [];

  // Buscar tabelas de preços
  const { data: priceTables } = trpc.priceTables.list.useQuery({ tenantId, apenasAtivas: true });
  const { data: defaultTable } = trpc.priceTables.getDefault.useQuery({ tenantId });

  // Definir tabela padrão quando carregar
  useEffect(() => {
    if (defaultTable && !selectedPriceTableId) {
      setSelectedPriceTableId(defaultTable.id);
    }
  }, [defaultTable, selectedPriceTableId]);

  // Buscar vacinas
  const { data: vaccinesData } = trpc.vaccines.list.useQuery({ tenantId });
  const vaccines = vaccinesData || [];

  // Buscar preços da tabela selecionada
  const { data: vaccinePrices } = trpc.vaccinePrices.list.useQuery(
    { tenantId },
    { enabled: selectedPriceTableId !== null }
  );

  // Filtrar preços pela tabela selecionada
  const pricesForSelectedTable = vaccinePrices?.filter(
    (p: any) => p.priceTableId === selectedPriceTableId && p.ativo
  ) || [];

  // Calcular preços
  const { data: priceData } = trpc.patientBudgets.calculatePrice.useQuery(
    {
      tenantId,
      vaccineIds: selectedVaccineIds,
    },
    {
      enabled: selectedVaccineIds.length > 0,
    }
  );

  const createBudget = trpc.patientBudgets.create.useMutation();

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const valorTotal = priceData?.reduce((sum, item) => sum + item.precoOriginal, 0) || 0;
  const descontoTotal = priceData?.reduce((sum, item) => sum + item.desconto, 0) || 0;
  const valorFinal = priceData?.reduce((sum, item) => sum + item.preco, 0) || 0;

  const temVacinaSemPreco = priceData?.some((item) => item.semPreco) || false;

  const handleToggleVaccine = (vaccineId: number) => {
    setSelectedVaccineIds((prev) =>
      prev.includes(vaccineId) ? prev.filter((id) => id !== vaccineId) : [...prev, vaccineId]
    );
  };

  const handleReject = async () => {
    if (!selectedPatientId || selectedVaccineIds.length === 0) return;

    setIsCalculating(true);

    try {
      // Criar orçamento com status "recusado"
      const vaccineNames = priceData?.map((item) => item.vaccineName).join(", ") || "";
      const vaccinePrices = priceData?.map((item) => item.preco) || [];

      const hoje = new Date();
      const dataValidade = new Date(hoje);
      dataValidade.setDate(dataValidade.getDate() + 7);

      await createBudget.mutateAsync({
        tenantId,
        nome: selectedPatient.nome,
        cpf: selectedPatient.cpf || undefined,
        dataNascimento: selectedPatient.dataNascimento
          ? new Date(selectedPatient.dataNascimento).toISOString().split("T")[0]
          : undefined,
        email: selectedPatient.email || undefined,
        celular: selectedPatient.celular || undefined,
        vaccineIds: selectedVaccineIds,
        vaccineNames,
        vaccinePrices,
        valorTotal,
        desconto: descontoTotal,
        valorFinal,
        dataValidade: dataValidade.toISOString().split("T")[0],
        status: "recusado",
      });

      toast.success("Orçamento salvo como recusado");
      // Voltar para dashboard ou ApplicationHome
      navigate(`/tenant/${tenantId}/application`);
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      toast.error("Erro ao salvar orçamento. Tente novamente.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedPatientId || selectedVaccineIds.length === 0) return;

    const selectedPatient = patients.find((p) => p.id === selectedPatientId);
    if (!selectedPatient || !selectedPatient.telefone) {
      toast.error("Paciente não possui telefone cadastrado.");
      return;
    }

    // Formatar mensagem do orçamento
    const vaccineList = priceData?.map((item, index) => 
      `${index + 1}. ${item.vaccineName} - R$ ${item.preco.toFixed(2).replace('.', ',')}`
    ).join('%0A') || '';

    const totalFormatted = valorFinal.toFixed(2).replace('.', ',');
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 7);
    const validadeFormatted = dataValidade.toLocaleDateString('pt-BR');

    const message = `*Orçamento de Vacinação*%0A%0A` +
      `Olá *${selectedPatient.nome}*!%0A%0A` +
      `Segue o orçamento das vacinas solicitadas:%0A%0A` +
      `${vaccineList}%0A%0A` +
      `*Valor Total: R$ ${totalFormatted}*%0A%0A` +
      `✅ Orçamento válido até ${validadeFormatted}%0A%0A` +
      `Para confirmar sua vacinação, entre em contato conosco!`;

    // Limpar telefone e abrir WhatsApp
    const phone = selectedPatient.telefone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Abrindo WhatsApp...");
  };

  const handleAccept = async () => {
    if (!selectedPatientId || selectedVaccineIds.length === 0) return;

    setIsCalculating(true);

    try {
      // Criar orçamento com status "aprovado"
      const vaccineNames = priceData?.map((item) => item.vaccineName).join(", ") || "";
      const vaccinePrices = priceData?.map((item) => item.preco) || [];

      const hoje = new Date();
      const dataValidade = new Date(hoje);
      dataValidade.setDate(dataValidade.getDate() + 7);

      const result = await createBudget.mutateAsync({
        tenantId,
        nome: selectedPatient.nome,
        cpf: selectedPatient.cpf || undefined,
        dataNascimento: selectedPatient.dataNascimento
          ? new Date(selectedPatient.dataNascimento).toISOString().split("T")[0]
          : undefined,
        email: selectedPatient.email || undefined,
        celular: selectedPatient.celular || undefined,
        vaccineIds: selectedVaccineIds,
        vaccineNames,
        vaccinePrices,
        valorTotal,
        desconto: descontoTotal,
        valorFinal,
        dataValidade: dataValidade.toISOString().split("T")[0],
        status: "aprovado",
      });

      toast.success("Orçamento aprovado! Continuando para aplicação...");
      // Navegar para próxima etapa (Confirmar Aplicação)
      navigate(
        `/tenant/${tenantId}/application/select-patient?budgetId=${result.id}&patientId=${selectedPatientId}`
      );
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("Erro ao criar orçamento. Tente novamente.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAcceptAndContinue = async () => {
    if (!selectedPatient || selectedVaccineIds.length === 0) return;

    setIsCalculating(true);

    try {
      // Criar orçamento
      const vaccineNames = priceData?.map((item) => item.vaccineName).join(", ") || "";
      const vaccinePrices = priceData?.map((item) => item.preco) || [];

      const hoje = new Date();
      const dataValidade = new Date(hoje);
      dataValidade.setDate(dataValidade.getDate() + 7); // Válido por 7 dias

      const result = await createBudget.mutateAsync({
        tenantId,
        nome: selectedPatient.nome,
        cpf: selectedPatient.cpf || undefined,
        dataNascimento: selectedPatient.dataNascimento
          ? new Date(selectedPatient.dataNascimento).toISOString().split("T")[0]
          : undefined,
        email: selectedPatient.email || undefined,
        celular: selectedPatient.celular || undefined,
        vaccineIds: selectedVaccineIds,
        vaccineNames,
        vaccinePrices,
        valorTotal,
        desconto: descontoTotal,
        valorFinal,
        dataValidade: dataValidade.toISOString().split("T")[0],
      });

      // Navegar para Tela 1 com dados do orçamento
      navigate(
        `/tenant/${tenantId}/application/select-patient?budgetId=${result.id}&budgetNumber=${result.numero}`
      );
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      alert("Erro ao criar orçamento. Tente novamente.");
    } finally {
      setIsCalculating(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Stepper Visual */}
      <ApplicationStepper currentStep={0} totalSteps={6} />

      <div className="p-8">
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
            <BreadcrumbPage>Criar Orçamento</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            Orçamento de Vacinas
          </h1>
          <p className="text-slate-600 mt-2">
            Selecione o paciente e as vacinas para gerar um orçamento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Seleção */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seleção de Paciente */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Selecionar Paciente</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient">Paciente</Label>
                  <Select
                    value={selectedPatientId?.toString() || ""}
                    onValueChange={(value) => setSelectedPatientId(parseInt(value))}
                  >
                    <SelectTrigger id="patient">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.nome} {patient.cpf && `- CPF: ${patient.cpf}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatient && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-slate-700">
                      <strong>Nome:</strong> {selectedPatient.nome}
                    </p>
                    {selectedPatient.cpf && (
                      <p className="text-sm text-slate-700">
                        <strong>CPF:</strong> {selectedPatient.cpf}
                      </p>
                    )}
                    {selectedPatient.email && (
                      <p className="text-sm text-slate-700">
                        <strong>Email:</strong> {selectedPatient.email}
                      </p>
                    )}
                    {selectedPatient.celular && (
                      <p className="text-sm text-slate-700">
                        <strong>Celular:</strong> {selectedPatient.celular}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Seleção de Tabela de Preços */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Selecionar Tabela de Preços</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="priceTable">Tabela de Preços</Label>
                  <Select
                    value={selectedPriceTableId?.toString() || ""}
                    onValueChange={(value) => setSelectedPriceTableId(parseInt(value))}
                  >
                    <SelectTrigger id="priceTable">
                      <SelectValue placeholder="Selecione uma tabela de preços" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceTables?.map((table: any) => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          {table.nome} {table.padrao && "(⭐ Padrão)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPriceTableId && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-slate-700">
                      <strong>Tabela selecionada:</strong>{" "}
                      {priceTables?.find((t: any) => t.id === selectedPriceTableId)?.nome}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Os preços das vacinas serão baseados nesta tabela
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Seleção de Vacinas */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Selecionar Vacinas</h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {vaccines.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Nenhuma vacina cadastrada</p>
                ) : (
                  vaccines.map((vaccine) => {
                    const priceInfo = priceData?.find((p) => p.vaccineId === vaccine.id);
                    const isSelected = selectedVaccineIds.includes(vaccine.id);

                    return (
                      <div
                        key={vaccine.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Checkbox
                          id={`vaccine-${vaccine.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleToggleVaccine(vaccine.id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`vaccine-${vaccine.id}`}
                            className="font-medium text-slate-900 cursor-pointer"
                          >
                            {vaccine.nome}
                          </label>
                          {vaccine.fabricante && (
                            <p className="text-sm text-slate-600">{vaccine.fabricante}</p>
                          )}
                          {isSelected && priceInfo && (
                            <div className="mt-2 text-sm">
                              {priceInfo.semPreco ? (
                                <p className="text-red-600 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  Sem preço cadastrado
                                </p>
                              ) : (
                                <>
                                  {priceInfo.desconto > 0 && (
                                    <>
                                      <p className="text-slate-500 line-through">
                                        R$ {(priceInfo.precoOriginal / 100).toFixed(2)}
                                      </p>
                                      <p className="text-green-600 font-medium">
                                        R$ {(priceInfo.preco / 100).toFixed(2)}
                                        {priceInfo.campanhaNome && (
                                          <span className="text-xs ml-2">
                                            ({priceInfo.campanhaNome})
                                          </span>
                                        )}
                                      </p>
                                    </>
                                  )}
                                  {priceInfo.desconto === 0 && (
                                    <p className="text-slate-700 font-medium">
                                      R$ {(priceInfo.preco / 100).toFixed(2)}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Coluna Direita - Resumo */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Resumo do Orçamento</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Paciente Selecionado</p>
                  <p className="font-medium">
                    {selectedPatient ? selectedPatient.nome : "Nenhum"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Vacinas Selecionadas</p>
                  <p className="font-medium">{selectedVaccineIds.length}</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">R$ {(valorTotal / 100).toFixed(2)}</span>
                  </div>

                  {descontoTotal > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span className="font-medium">- R$ {(descontoTotal / 100).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">R$ {(valorFinal / 100).toFixed(2)}</span>
                  </div>
                </div>

                {temVacinaSemPreco && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Algumas vacinas não possuem preço cadastrado. Configure os preços no
                        módulo Financeiro antes de continuar.
                      </span>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    disabled={
                      !selectedPatientId ||
                      selectedVaccineIds.length === 0 ||
                      temVacinaSemPreco ||
                      isCalculating
                    }
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    Paciente Recusou
                  </Button>
                  <Button
                    onClick={handleSendWhatsApp}
                    variant="outline"
                    disabled={
                      !selectedPatientId ||
                      selectedVaccineIds.length === 0 ||
                      temVacinaSemPreco
                    }
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    size="lg"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Orçamento
                  </Button>
                  <Button
                    onClick={handleAccept}
                    disabled={
                      !selectedPatientId ||
                      selectedVaccineIds.length === 0 ||
                      temVacinaSemPreco ||
                      isCalculating
                    }
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {isCalculating ? (
                      "Salvando..."
                    ) : (
                      <>
                        Paciente Aceitou
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Orçamento válido por 7 dias
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
