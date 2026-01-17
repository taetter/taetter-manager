import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, User, Baby, Users, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PatientDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const tenantId = parseInt(params.id || "0");
  const patientId = parseInt(params.patientId || "0");


  const { data: patient, isLoading } = trpc.patients.getById.useQuery({
    id: patientId,
    tenantId,
  });

  const deleteMutation = trpc.patients.delete.useMutation({
    onSuccess: () => {
      toast.success("Paciente excluído com sucesso");
      navigate(`/tenant/${tenantId}/patients`);
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  // Calcular idade
  const calculateAge = (birthDate: Date | string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = patient ? calculateAge(patient.dataNascimento) < 18 : false;

  // Buscar responsáveis (se for menor)
  const { data: guardians } = trpc.patientGuardians.listByMinor.useQuery(
    { tenantId, minorPatientId: patientId },
    { enabled: isMinor }
  );

  // Buscar menores sob responsabilidade (se for adulto)
  const { data: minors } = trpc.patientGuardians.listByGuardian.useQuery(
    { tenantId, guardianPatientId: patientId },
    { enabled: !isMinor }
  );



  const handleDelete = () => {
    deleteMutation.mutate({ id: patientId, tenantId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Paciente não encontrado</p>
          <Button
            onClick={() => navigate(`/tenant/${tenantId}/patients`)}
            className="mt-4"
          >
            Voltar para Pacientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container max-w-5xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/tenant/${tenantId}/patients`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#1a365d]">
                Detalhes do Paciente
              </h1>
              <p className="text-muted-foreground">
                Visualize as informações completas do paciente
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(`/tenant/${tenantId}/patients/${patientId}/edit`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o paciente {patient.nome}?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Foto e Dados Principais */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-6">
              {patient.fotoUrl ? (
                <img
                  src={patient.fotoUrl}
                  alt={patient.nome}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-16 w-16 text-primary/40" />
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1a365d] mb-2">
                  {patient.nome}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{patient.cpf}</p>
                  </div>
                  {patient.rg && (
                    <div>
                      <p className="text-sm text-muted-foreground">RG</p>
                      <p className="font-medium">{patient.rg}</p>
                    </div>
                  )}
                  {patient.dataNascimento && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Data de Nascimento
                      </p>
                      <p className="font-medium">
                        {new Date(patient.dataNascimento).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  )}
                  {patient.sexo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sexo</p>
                      <p className="font-medium">
                        {patient.sexo === "M"
                          ? "Masculino"
                          : patient.sexo === "F"
                          ? "Feminino"
                          : "Outro"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Pessoais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {patient.nomeMae && (
                <div>
                  <p className="text-sm text-muted-foreground">Nome da Mãe</p>
                  <p className="font-medium">{patient.nomeMae}</p>
                </div>
              )}
              {patient.nomePai && (
                <div>
                  <p className="text-sm text-muted-foreground">Nome do Pai</p>
                  <p className="font-medium">{patient.nomePai}</p>
                </div>
              )}
              {patient.cartaoSus && (
                <div>
                  <p className="text-sm text-muted-foreground">Cartão SUS</p>
                  <p className="font-medium">{patient.cartaoSus}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {patient.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              )}
              {patient.telefone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{patient.telefone}</p>
                </div>
              )}
              {patient.celular && (
                <div>
                  <p className="text-sm text-muted-foreground">Celular</p>
                  <p className="font-medium">{patient.celular}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        {(patient.endereco ||
          patient.cidade ||
          patient.estado ||
          patient.cep) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {patient.endereco && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Logradouro</p>
                    <p className="font-medium">
                      {patient.endereco}
                      {patient.numero && `, ${patient.numero}`}
                      {patient.complemento && ` - ${patient.complemento}`}
                    </p>
                  </div>
                )}
                {patient.bairro && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bairro</p>
                    <p className="font-medium">{patient.bairro}</p>
                  </div>
                )}
                {patient.cidade && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cidade</p>
                    <p className="font-medium">
                      {patient.cidade}
                      {patient.estado && ` - ${patient.estado}`}
                    </p>
                  </div>
                )}
                {patient.cep && (
                  <div>
                    <p className="text-sm text-muted-foreground">CEP</p>
                    <p className="font-medium">{patient.cep}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {patient.observacoes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {patient.observacoes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Responsáveis (se for menor) */}
        {isMinor && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <CardTitle>Responsáveis Legais</CardTitle>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <Baby className="w-3 h-3" />
                    Menor de Idade
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tenant/${tenantId}/patients/${patientId}/edit`)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Responsável
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {guardians && guardians.length > 0 ? (
                <div className="space-y-3">
                  {guardians.map((guardian) => (
                    <div
                      key={guardian.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{guardian.guardianNome}</p>
                          <p className="text-sm text-muted-foreground">
                            {guardian.relacao.charAt(0).toUpperCase() + guardian.relacao.slice(1)} • {guardian.guardianCpf}
                          </p>
                          {guardian.guardianTelefone && (
                            <p className="text-sm text-muted-foreground">
                              Tel: {guardian.guardianTelefone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum responsável cadastrado. Clique em "Adicionar Responsável" para vincular um responsável legal.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Menores sob responsabilidade (se for adulto) */}
        {!isMinor && minors && minors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5" />
                <CardTitle>Menores sob Responsabilidade</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {minors.map((minor) => (
                  <div
                    key={minor.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Baby className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{minor.minorNome}</p>
                        <p className="text-sm text-muted-foreground">
                          {minor.relacao.charAt(0).toUpperCase() + minor.relacao.slice(1)} • {minor.minorCpf}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Nascimento: {new Date(minor.minorDataNascimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/tenant/${tenantId}/patients/${minor.minorId}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
