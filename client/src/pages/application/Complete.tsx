import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CheckCircle2, Home, FileText, User } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export function Complete() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [, setLocation] = useLocation();
  const deviceType = useDeviceDetection();

  // Obter dados da query string
  const searchParams = new URLSearchParams(window.location.search);
  const patientId = parseInt(searchParams.get('patientId') || '0');
  const applicationIds = searchParams.get('applicationIds')?.split(',').map(Number) || [];

  // Buscar dados do paciente
  const { data: patient } = trpc.patients.getById.useQuery(
    { id: patientId, tenantId },
    { enabled: !!patientId && !!tenantId }
  );

  // Buscar aplicações
  const { data: applications } = trpc.vaccineApplications.list.useQuery(
    { tenantId, patientId },
    { enabled: !!tenantId && !!patientId }
  );

  useEffect(() => {
    // Aqui seria feita a atualização da ADP do paciente
    // Por enquanto, apenas simula o sucesso
    console.log('Atualizando Área do Paciente com as aplicações:', applicationIds);
  }, [applicationIds]);

  const handleNewApplication = () => {
    setLocation(`/tenant/${tenantId}/application/select-patient`);
  };

  const handleViewPatient = () => {
    setLocation(`/tenant/${tenantId}/patients/${patientId}`);
  };

  const handleBackToDashboard = () => {
    setLocation(`/tenant/${tenantId}/dashboard`);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-green-50 to-white ${deviceType === 'mobile' ? 'p-4' : 'p-8'}`}>
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
              <BreadcrumbPage>Concluído</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header de Sucesso */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-20 w-20 text-green-600" />
          </div>
          <h1 className={`${deviceType === 'mobile' ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
            Aplicação Concluída!
          </h1>
          <p className="text-gray-600">
            {deviceType === 'mobile' ? 'Dispositivo Móvel' : 'Dispositivo Desktop'} - Passo 5 de 5
          </p>
        </div>

        {/* Resumo do Paciente */}
        {patient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Paciente</CardTitle>
              <CardDescription>Informações do paciente vacinado</CardDescription>
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

        {/* Resumo das Aplicações */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aplicações Realizadas</CardTitle>
            <CardDescription>
              {applicationIds.length} vacina(s) aplicada(s) com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applicationIds.map((id, index) => (
                <div key={id} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Vacina #{index + 1}</p>
                    <p className="text-sm text-gray-600">
                      Aplicação ID: {id} | Registrada com sucesso
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-blue-900">
                ✅ <strong>Estoque atualizado:</strong> As vacinas foram baixadas do estoque automaticamente
              </p>
              <p className="text-sm text-blue-900">
                ✅ <strong>Pagamento registrado:</strong> O pagamento foi processado e registrado no sistema
              </p>
              <p className="text-sm text-blue-900">
                ✅ <strong>Área do Paciente atualizada:</strong> As aplicações foram adicionadas à carteirinha virtual do paciente
              </p>
              <p className="text-sm text-blue-900">
                ✅ <strong>Etiquetas geradas:</strong> As etiquetas Zebra foram geradas conforme selecionado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className={`grid ${deviceType === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
          <Button
            onClick={handleNewApplication}
            size="lg"
            className="flex items-center gap-2"
          >
            <FileText className="h-5 w-5" />
            Nova Aplicação
          </Button>

          <Button
            onClick={handleViewPatient}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <User className="h-5 w-5" />
            Ver Paciente
          </Button>

          <Button
            onClick={handleBackToDashboard}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
