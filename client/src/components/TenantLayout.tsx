import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";
import { 
  Users, 
  Syringe, 
  Package, 
  DollarSign, 
  UserCog,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  User,
  Bell,
  Home,
  Plug,
  Calendar
} from "lucide-react";
import { PLANS, MODULES, type ModuleId } from "@/../../shared/modules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TenantLayoutProps {
  children: React.ReactNode;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const { user, logout } = useAuth();
  const params = useParams();
  const [location] = useLocation();
  const tenantId = parseInt(params.tenantId || params.id || "1");
  
  // Buscar dados do tenant
  const { data: tenantData } = trpc.tenants.getById.useQuery(
    { id: tenantId },
    { enabled: !!user }
  );

  const moduleIcons: Record<ModuleId, any> = {
    scheduling: Calendar,
    patients: Users,
    applications: Syringe,
    stock: Package,
    financial: DollarSign,
    indicators: TrendingUp,
    bi: BarChart3,
    quality: Activity,
    hr: UserCog,
    integrations: Plug,
  };

  // Organizar módulos por categoria
  const basicModules: ModuleId[] = ["scheduling", "patients", "applications", "stock", "financial"];
  const intermediateModules: ModuleId[] = ["indicators", "hr"];
  const fullModules: ModuleId[] = ["bi", "quality", "integrations"];

  const renderModuleLink = (moduleId: ModuleId) => {
    const module = MODULES[moduleId];
    const Icon = moduleIcons[moduleId];
    const isActive = location.includes(module.route);

    return (
      <Link
        key={moduleId}
        href={`/tenant/${tenantId}${module.route}`}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{module.name}</span>
      </Link>
    );
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-card z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo e Nome */}
          <Link href={`/tenant/${tenantId}/dashboard`} className="flex items-center gap-3">
            <img src="/logo-t.png" alt="Taetter" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-primary">Taetter VIS</h1>
              <p className="text-xs text-muted-foreground">
                {tenantData?.name || "Vaccine Interface System"}
              </p>
            </div>
          </Link>

          {/* Plano e Usuário */}
          <div className="flex items-center gap-4">
            {/* Badge do Plano */}
            {tenantData?.plan && (
              <Badge 
                variant={tenantData.plan === "full" ? "default" : tenantData.plan === "intermediate" ? "secondary" : "outline"}
                className="text-xs"
              >
                {PLANS[tenantData.plan]?.name || "Plano Básico"}
              </Badge>
            )}

            {/* Notificações */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </Button>

            {/* Dropdown do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePhoto} alt={user?.name} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/tenant/${tenantId}/profile`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/tenant/${tenantId}/settings`} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar Fixa */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 border-r bg-card overflow-y-auto">
        <nav className="p-4 space-y-6">
          {/* Dashboard Home */}
          <Link
            href={`/tenant/${tenantId}/dashboard`}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location === `/tenant/${tenantId}/dashboard` || location === `/tenant/${tenantId}`
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Módulos Básicos */}
          <div>
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Módulos Básicos
            </p>
            <div className="space-y-1">
              {basicModules.map(renderModuleLink)}
            </div>
          </div>

          {/* Módulos Avançados */}
          <div>
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Módulos Avançados
            </p>
            <div className="space-y-1">
              {intermediateModules.map(renderModuleLink)}
            </div>
          </div>

          {/* Módulos Premium */}
          <div>
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Módulos Premium
            </p>
            <div className="space-y-1">
              {fullModules.map(renderModuleLink)}
            </div>
          </div>

          {/* FAQ e Versão */}
          <div className="mt-auto pt-4 border-t">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Link href={`/tenant/${tenantId}/faq`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                <span>FAQ / Ajuda</span>
              </Link>
            </Button>
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">
              Versão 1.0.0
            </div>
          </div>
        </nav>
      </aside>

      {/* Área de Conteúdo */}
      <main className="ml-64 mt-16 min-h-[calc(100vh-4rem)]">
        <div className="transition-all duration-300 ease-in-out">
          {children}
        </div>
      </main>
    </div>
  );
}
