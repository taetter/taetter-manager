import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ApplicationStepper } from '@/components/ApplicationStepper';
import { ArrowRight, ArrowLeft, Check, Printer, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export function ConfirmApplication() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [, setLocation] = useLocation();
  const deviceType = useDeviceDetection();

  // Obter dados da query string
  const searchParams = new URLSearchParams(window.location.search);
  const patientId = parseInt(searchParams.get('patientId') || '0');
  const unitId = parseInt(searchParams.get('unitId') || '0');
  const refrigeratorId = parseInt(searchParams.get('refrigeratorId') || '0');
  const vaccineIds = searchParams.get('vaccineIds')?.split(',').map(Number) || [];

  const [labelType, setLabelType] = useState<'fisica_virtual' | 'somente_virtual'>('fisica_virtual');

  // Buscar dados do paciente
  const { data: patient } = trpc.patients.getById.useQuery(
    { id: patientId, tenantId },
    { enabled: !!patientId && !!tenantId }
  );

  const handleContinue = () => {
    if (!patient) {
      toast.error('Paciente não encontrado');
      return;
    }

    // Navegar para Tela 4 (Pagamento) com todos os parâmetros necessários
    const vaccineIdsParam = vaccineIds.join(',');
    setLocation(
      `/tenant/${tenantId}/application/payment?patientId=${patientId}&unitId=${unitId}&refrigeratorId=${refrigeratorId}&vaccineIds=${vaccineIdsParam}&labelType=${labelType}`
    );
  };

  const handleBack = () => {
    setLocation(`/tenant/${tenantId}/application/select-vaccines?patientId=${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ApplicationStepper currentStep={3} totalSteps={5} />
      <div className={`${deviceType === 'mobile' ? 'p-4' : 'p-8'}`}>
        <div className={`${deviceType === 'mobile' ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
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
              <BreadcrumbPage>Confirmar Aplicação</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-6">
          <h1 className={`${deviceType === 'mobile' ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
            Confirmar Aplicação
          </h1>
          <p className="text-gray-600 mt-2">
            {deviceType === 'mobile' ? 'Dispositivo Móvel' : 'Dispositivo Desktop'} - Passo 3 de 5
          </p>
        </div>

        {/* Informações do Paciente */}
        {patient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {patient.fotoUrl && (
                  <img
                    src={patient.fotoUrl}
                    alt={patient.nome}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-lg">{patient.nome}</p>
                  <p className="text-gray-600">CPF: {patient.cpf}</p>
                  <p className="text-sm text-gray-500">
                    Nascimento: {new Date(patient.dataNascimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo das Vacinas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vacinas a Aplicar</CardTitle>
            <CardDescription>
              {vaccineIds.length} vacina(s) selecionada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vaccineIds.map((id, index) => (
                <div key={id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold">Vacina #{index + 1}</p>
                  <p className="text-sm text-gray-600">ID: {id}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Etiqueta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tipo de Etiqueta Zebra</CardTitle>
            <CardDescription>
              Escolha como deseja gerar a etiqueta de vacinação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={labelType} onValueChange={(value: any) => setLabelType(value)}>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="fisica_virtual" id="fisica_virtual" />
                <Label htmlFor="fisica_virtual" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Printer className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">Etiqueta Física + Virtual</p>
                      <p className="text-sm text-gray-600">
                        Gera etiqueta Zebra para impressão E adiciona à Área do Paciente
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="somente_virtual" id="somente_virtual" />
                <Label htmlFor="somente_virtual" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Somente Etiqueta Virtual</p>
                      <p className="text-sm text-gray-600">
                        Adiciona automaticamente à Área do Paciente (sem impressão)
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

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
            size="lg"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <ArrowRight className="h-5 w-5" />
            Continuar para Pagamento
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}
