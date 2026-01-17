import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ApplicationStepper } from '@/components/ApplicationStepper';
import { Search, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export function SelectPatient() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id);
  const [, setLocation] = useLocation();
  const deviceType = useDeviceDetection();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Buscar pacientes
  const { data: patients, isLoading } = trpc.patients.list.useQuery(
    { tenantId },
    { enabled: !!tenantId }
  );

  // Filtrar pacientes por CPF ou nome
  const filteredPatients = patients?.patients?.filter((patient: any) => {
    const term = searchTerm.toLowerCase();
    return (
      patient.cpf.includes(term) ||
      patient.nome.toLowerCase().includes(term)
    );
  });

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleContinue = () => {
    if (!selectedPatient) {
      toast.error('Selecione um paciente para continuar');
      return;
    }

    // Navegar para Tela 2 com o paciente selecionado
    setLocation(`/tenant/${tenantId}/application/select-vaccines?patientId=${selectedPatient.id}`);
  };

  const handleCreatePatient = () => {
    setLocation(`/tenant/${tenantId}/patients/new`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Stepper Visual */}
      <ApplicationStepper currentStep={1} totalSteps={5} />
      
      <div className={`${deviceType === "mobile" ? "p-4" : "p-8"}`}>
        <div className={`${deviceType === "mobile" ? "max-w-full" : "max-w-6xl"} mx-auto`}>
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
              <BreadcrumbPage>Selecionar Paciente</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-6">
          <h1 className={`${deviceType === 'mobile' ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
            Aplicação de Vacinas
          </h1>
          <p className="text-gray-600 mt-2">
            {deviceType === 'mobile' ? 'Dispositivo Móvel' : 'Dispositivo Desktop'} - Passo 1 de 5
          </p>
        </div>

        {/* Busca de Paciente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Paciente</CardTitle>
            <CardDescription>
              Busque o paciente por CPF ou nome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Digite CPF ou nome do paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleCreatePatient}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {deviceType === 'desktop' && 'Novo'}
              </Button>
            </div>

            {/* Lista de Pacientes */}
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando pacientes...</div>
            ) : filteredPatients && filteredPatients.length > 0 ? (
              <div className={`grid ${deviceType === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-3 max-h-96 overflow-y-auto`}>
                {filteredPatients.map((patient: any) => (
                  <Card
                    key={patient.id}
                    className={`cursor-pointer transition-all ${
                      selectedPatient?.id === patient.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {patient.fotoUrl && (
                          <img
                            src={patient.fotoUrl}
                            alt={patient.nome}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{patient.nome}</p>
                          <p className="text-sm text-gray-600">CPF: {patient.cpf}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(patient.dataNascimento).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Digite para buscar pacientes'}
                </p>
                {searchTerm && (
                  <Button onClick={handleCreatePatient} variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar Novo Paciente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paciente Selecionado */}
        {selectedPatient && (
          <Card className="mb-6 border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Paciente Selecionado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {selectedPatient.fotoUrl && (
                  <img
                    src={selectedPatient.fotoUrl}
                    alt={selectedPatient.nome}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-lg">{selectedPatient.nome}</p>
                  <p className="text-gray-600">CPF: {selectedPatient.cpf}</p>
                  <p className="text-sm text-gray-500">
                    Nascimento: {new Date(selectedPatient.dataNascimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão Continuar */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!selectedPatient}
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
