import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ApplicationStepper } from '@/components/ApplicationStepper';
import { ArrowRight, ArrowLeft, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { BarcodeScanner } from '@/components/BarcodeScanner';

interface SelectedVaccine {
  id: number;
  nome: string;
  lote: string;
  fabricante: string | null;
  quantidadeDisponivel: number;
  codigoBarras: string | null;
}

export function SelectVaccines() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [, setLocation] = useLocation();
  const deviceType = useDeviceDetection();

  // Obter patientId da query string
  const searchParams = new URLSearchParams(window.location.search);
  const patientId = parseInt(searchParams.get('patientId') || '0');

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedRefrigeratorId, setSelectedRefrigeratorId] = useState<number | null>(null);
  const [selectedVaccines, setSelectedVaccines] = useState<SelectedVaccine[]>([]);

  // Buscar unidades
  const { data: units, isLoading: loadingUnits } = trpc.units.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Buscar geladeiras da unidade selecionada
  const { data: refrigerators, isLoading: loadingRefrigerators } = trpc.refrigerators.list.useQuery(
    { tenantId, unitId: selectedUnitId || undefined },
    { enabled: !!tenantId && !!selectedUnitId }
  );

  // Buscar vacinas da geladeira selecionada
  const { data: vaccines, isLoading: loadingVaccines } = trpc.vaccines.list.useQuery(
    { tenantId },
    { enabled: !!tenantId && !!selectedRefrigeratorId }
  );

  const handleBarcodeScanned = (code: string) => {
    // Buscar vacina pelo código de barras
    // TODO: Implementar query específica para buscar por código de barras
    toast.info(`Código escaneado: ${code}`);
    
    // Mock: Adicionar vacina de exemplo
    const mockVaccine: SelectedVaccine = {
      id: Date.now(),
      nome: 'Vacina COVID-19',
      lote: code,
      fabricante: 'Pfizer',
      quantidadeDisponivel: 10,
      codigoBarras: code,
    };
    
    // Verificar se já foi adicionada
    if (selectedVaccines.some(v => v.codigoBarras === code)) {
      toast.warning('Vacina já adicionada');
      return;
    }
    
    setSelectedVaccines([...selectedVaccines, mockVaccine]);
    toast.success('Vacina adicionada');
  };

  const handleRemoveVaccine = (id: number) => {
    setSelectedVaccines(selectedVaccines.filter(v => v.id !== id));
    toast.info('Vacina removida');
  };

  const handleContinue = () => {
    if (!selectedUnitId) {
      toast.error('Selecione uma unidade');
      return;
    }
    if (!selectedRefrigeratorId) {
      toast.error('Selecione uma geladeira');
      return;
    }
    if (selectedVaccines.length === 0) {
      toast.error('Adicione pelo menos uma vacina');
      return;
    }

    // Navegar para Tela 3 com os dados
    const vaccineIds = selectedVaccines.map(v => v.id).join(',');
    setLocation(
      `/tenant/${tenantId}/application/confirm?patientId=${patientId}&unitId=${selectedUnitId}&refrigeratorId=${selectedRefrigeratorId}&vaccineIds=${vaccineIds}`
    );
  };

  const handleBack = () => {
    setLocation(`/tenant/${tenantId}/application/select-patient`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Stepper Visual */}
      <ApplicationStepper currentStep={2} totalSteps={5} />
      
      <div className={`${deviceType === 'mobile' ? 'p-4' : 'p-8'}`}>
        <div className={`${deviceType === 'mobile' ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
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
              <BreadcrumbPage>Selecionar Vacinas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-6">
          <h1 className={`${deviceType === 'mobile' ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
            Selecionar Vacinas
          </h1>
          <p className="text-gray-600 mt-2">
            {deviceType === 'mobile' ? 'Dispositivo Móvel' : 'Dispositivo Desktop'} - Passo 2 de 5
          </p>
        </div>

        {/* Seleção de Unidade */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Unidade</CardTitle>
            <CardDescription>Selecione a unidade onde a aplicação será realizada</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedUnitId?.toString()}
              onValueChange={(value) => {
                setSelectedUnitId(parseInt(value));
                setSelectedRefrigeratorId(null); // Reset geladeira
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {loadingUnits ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : units && units.length > 0 ? (
                  units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.nome}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>Nenhuma unidade cadastrada</SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Seleção de Geladeira */}
        {selectedUnitId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Geladeira</CardTitle>
              <CardDescription>Selecione a geladeira de armazenamento</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedRefrigeratorId?.toString()}
                onValueChange={(value) => setSelectedRefrigeratorId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma geladeira" />
                </SelectTrigger>
                <SelectContent>
                  {loadingRefrigerators ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : refrigerators && refrigerators.length > 0 ? (
                    refrigerators.map((refrigerator) => (
                      <SelectItem key={refrigerator.id} value={refrigerator.id.toString()}>
                        {refrigerator.nome}
                        {refrigerator.temperaturaAtual && ` (${refrigerator.temperaturaAtual}°C)`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>Nenhuma geladeira cadastrada</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Scanner de Código de Barras */}
        {selectedUnitId && selectedRefrigeratorId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Escanear Vacinas</CardTitle>
              <CardDescription>
                {deviceType === 'mobile' 
                  ? 'Use a câmera para escanear o código de barras da vacina'
                  : 'Use o scanner USB ou digite o código manualmente'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarcodeScanner onScan={handleBarcodeScanned} deviceType={deviceType} />
            </CardContent>
          </Card>
        )}

        {/* Lista de Vacinas Selecionadas */}
        {selectedVaccines.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Vacinas Selecionadas ({selectedVaccines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedVaccines.map((vaccine) => (
                  <div
                    key={vaccine.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{vaccine.nome}</p>
                      <p className="text-sm text-gray-600">
                        Lote: {vaccine.lote} | Fabricante: {vaccine.fabricante || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Estoque disponível: {vaccine.quantidadeDisponivel} unidades
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVaccine(vaccine.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Navegação */}
        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedUnitId || !selectedRefrigeratorId || selectedVaccines.length === 0}
            size="lg"
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}
