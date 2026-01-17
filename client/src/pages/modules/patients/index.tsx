import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Search, FileText } from "lucide-react";
import { Link } from "wouter";

export default function PatientsModule() {
  const { user, logout } = useAuth();

  // Verificar autenticação
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você precisa estar autenticado para acessar este módulo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="Taetter" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold">Taetter - VIS</h1>
              <p className="text-sm text-muted-foreground">Módulo de Pacientes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gestão de Pacientes</h2>
          <p className="text-muted-foreground">
            Gerencie o cadastro completo de pacientes e histórico de vacinação
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cadastro de Pacientes
              </CardTitle>
              <CardDescription>
                Registre novos pacientes no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                <Plus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Pacientes
              </CardTitle>
              <CardDescription>
                Pesquise pacientes cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Gere relatórios de pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>🚧 Módulo em Desenvolvimento</strong>
              <br />
              Este módulo está sendo desenvolvido e será implementado nas próximas versões.
              Funcionalidades planejadas incluem: cadastro completo de pacientes, histórico de vacinação,
              carteirinha virtual, notificações de intercorrências e integração com RNDS.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
