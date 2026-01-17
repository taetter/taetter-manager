import { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useEmployeeAuth } from "@/contexts/EmployeeAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Clock, DollarSign, Calendar, Car, Shield, 
  LogOut, User, GraduationCap, AlertCircle, Syringe, Users 
} from "lucide-react";

export default function EmployeeDashboard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { employee, isLoading, logout } = useEmployeeAuth();
  
  const tenantId = parseInt(params.tenantId!);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !employee) {
      setLocation(`/employee/${tenantId}/login`);
    }
  }, [employee, isLoading, tenantId, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation(`/employee/${tenantId}/login`);
  };

  // Verificar se é aplicador de vacinas
  const isVaccinator = employee.perfil === 'aplicador' || employee.cargo?.toLowerCase().includes('enferm') || employee.cargo?.toLowerCase().includes('técnico');

  const menuItems = [
    {
      title: "Holerites",
      description: "Consultar holerites e informes",
      icon: FileText,
      href: `/employee/${tenantId}/payslips`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ponto Eletrônico",
      description: "Registrar entrada e saída",
      icon: Clock,
      href: `/employee/${tenantId}/timeclock`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Horas Extras",
      description: "Solicitar horas extras",
      icon: Calendar,
      href: `/employee/${tenantId}/overtime`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ausências",
      description: "Informar férias e atestados",
      icon: AlertCircle,
      href: `/employee/${tenantId}/absences`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Registro de KM",
      description: "Registrar quilometragem",
      icon: Car,
      href: `/employee/${tenantId}/mileage`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "CAT",
      description: "Comunicar acidente de trabalho",
      icon: Shield,
      href: `/employee/${tenantId}/accidents`,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Treinamentos",
      description: "Consultar treinamentos",
      icon: GraduationCap,
      href: `/employee/${tenantId}/trainings`,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Meu Perfil",
      description: "Atualizar dados pessoais",
      icon: User,
      href: `/employee/${tenantId}/profile`,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Área do Colaborador</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bem-vindo, {employee.nome}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white">Informações do Colaborador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="opacity-90">Cargo:</span>
              <span className="font-semibold">{employee.cargo}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">CPF:</span>
              <span className="font-semibold">{employee.cpf}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Perfil:</span>
              <span className="font-semibold capitalize">{employee.perfil}</span>
            </div>
          </CardContent>
        </Card>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={item.href}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${item.bgColor}`}>
                        <Icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Agenda de Aplicações (apenas para aplicadores) */}
        {isVaccinator && (
          <Card className="mt-8 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-blue-600" />
                Agenda de Aplicações - Hoje
              </CardTitle>
              <CardDescription>Pacientes agendados para aplicação de vacinas hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* TODO: Buscar agenda real do banco */}
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Nenhuma aplicação agendada</p>
                        <p className="text-sm text-muted-foreground">
                          Utilize o fluxo de aplicação para registrar vacinas
                        </p>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/tenant/${tenantId}/application/select-patient`}>
                        <Syringe className="h-4 w-4 mr-2" />
                        Iniciar Aplicação
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às funcionalidades mais utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="w-full">
                <Link href={`/employee/${tenantId}/timeclock`}>
                  <Clock className="h-4 w-4 mr-2" />
                  Registrar Ponto
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/employee/${tenantId}/payslips`}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Ver Holerites
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/employee/${tenantId}/overtime`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Solicitar Horas Extras
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
