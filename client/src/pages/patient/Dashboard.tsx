import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { usePatientAuth } from "@/contexts/PatientAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  LogOut,
  Syringe,
  Download,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function PatientDashboard() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const tenantId = parseInt(params.tenantId || "0");
  
  const { patient, logout, isLoading, token } = usePatientAuth();

  // Buscar histórico de vacinação
  const { data: history, isLoading: loadingHistory } = trpc.patientAuth.getVaccinationHistory.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  // Buscar próximas vacinas
  const { data: upcoming, isLoading: loadingUpcoming } = trpc.patientAuth.getUpcomingVaccinations.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !patient) {
      setLocation(`/patient/${tenantId}/login`);
    }
  }, [patient, isLoading, tenantId, setLocation]);

  // Redirecionar para troca de senha se primeiro acesso
  useEffect(() => {
    if (patient && patient.primeiroAcesso) {
      setLocation(`/patient/${tenantId}/change-password`);
    }
  }, [patient, tenantId, setLocation]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
      setLocation(`/patient/${tenantId}/login`);
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const handleDownloadCard = () => {
    toast.info("Gerando cartão de vacinação digital...");
    // TODO: Implementar geração de PDF
    setTimeout(() => {
      toast.success("Cartão gerado! Download iniciado.");
    }, 1500);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return "-";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return "-";
    return phone;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a365d]">Área do Paciente</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo, {patient.nome.split(" ")[0]}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Perfil */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Meus Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={patient.fotoUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {getInitials(patient.nome)}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-3 font-semibold text-lg">{patient.nome}</p>
                <p className="text-sm text-muted-foreground">CPF: {formatCPF(patient.cpf)}</p>
              </div>

              {/* Informações */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data de Nascimento</span>
                  </div>
                  <p className="font-medium">{formatDate(patient.dataNascimento)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Sexo</span>
                  </div>
                  <p className="font-medium">
                    {patient.sexo === "M" ? "Masculino" : patient.sexo === "F" ? "Feminino" : "Outro"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{patient.email || "-"}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Telefone</span>
                  </div>
                  <p className="font-medium">{formatPhone(patient.celular || patient.telefone)}</p>
                </div>

                {patient.cartaoSus && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Cartão SUS</span>
                    </div>
                    <p className="font-medium">{patient.cartaoSus}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximas Vacinas */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Próximas Vacinas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUpcoming ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : upcoming && upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((vac: any) => (
                  <div key={vac.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium">{vac.vacina}</p>
                      <p className="text-sm text-muted-foreground">
                        Dose {(vac.dose || 0) + 1} - Agendada para {formatDate(vac.proximaDose)}
                      </p>
                    </div>
                    <Syringe className="h-5 w-5 text-orange-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma vacina agendada no momento.</p>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Vacinas */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-blue-600" />
              Histórico de Vacinação
            </CardTitle>
            <Button onClick={handleDownloadCard} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar Cartão Digital
            </Button>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((vac: any) => (
                  <div key={vac.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{vac.vacina}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Data:</span>{" "}
                            <span className="font-medium">{formatDate(vac.dataAplicacao)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dose:</span>{" "}
                            <span className="font-medium">{vac.dose || "Única"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fabricante:</span>{" "}
                            <span className="font-medium">{vac.fabricante || "-"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lote:</span>{" "}
                            <span className="font-medium">{vac.lote || "-"}</span>
                          </div>
                          {vac.aplicador && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Aplicador:</span>{" "}
                              <span className="font-medium">{vac.aplicador}</span>
                            </div>
                          )}
                          {vac.observacoes && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Observações:</span>{" "}
                              <span className="font-medium">{vac.observacoes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Syringe className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Nenhuma vacinação registrada ainda.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seu histórico aparecerá aqui após a primeira aplicação.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endereço */}
        {(patient.endereco || patient.cidade) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.endereco && (
                  <p>
                    {patient.endereco}
                    {patient.numero && `, ${patient.numero}`}
                    {patient.complemento && ` - ${patient.complemento}`}
                  </p>
                )}
                {patient.bairro && <p>{patient.bairro}</p>}
                {patient.cidade && (
                  <p>
                    {patient.cidade} - {patient.estado}
                  </p>
                )}
                {patient.cep && <p>CEP: {patient.cep}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
