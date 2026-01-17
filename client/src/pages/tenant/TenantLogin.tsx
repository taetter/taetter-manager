import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast as showToast } from "sonner";

export default function TenantLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const toast = (props: { title: string; description?: string; variant?: 'destructive' }) => {
    if (props.variant === 'destructive') {
      showToast.error(props.title, { description: props.description });
    } else {
      showToast.success(props.title, { description: props.description });
    }
  };

  // Detectar tenant pelo subdomínio
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const subdomain = hostname.split('.')[0];
  const targetSubdomain = hostname.includes('localhost') || hostname.includes('manus.computer') ? 'template' : subdomain;

  const { data: tenant, isLoading: isTenantLoading, error: tenantError } = trpc.tenants.getBySubdomain.useQuery(
    { subdomain: targetSubdomain },
    { enabled: !!targetSubdomain }
  );

  const tenantId = tenant?.id || null;
  const tenantName = tenant?.name || "";

  useEffect(() => {
    if (tenantError) {
      console.error("Erro ao buscar tenant:", tenantError);
      toast({
        title: "Erro",
        description: "Não foi possível identificar a clínica. Verifique o endereço.",
        variant: "destructive",
      });
    }
  }, [tenantError]);

  const loginMutation = trpc.customAuth.login.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${data.user.name}!`,
      });
      
      // Redirecionar para o dashboard do tenant
      setLocation(`/tenant/${tenantId}/dashboard`);
    },
    onError: (error) => {
      toast({
        title: "Erro no login",
        description: error.message || "Usuário ou senha incorretos",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantId) {
      toast({
        title: "Erro",
        description: "Clínica não identificada. Verifique o endereço.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    loginMutation.mutate({ username, password });
  };

  if (isTenantLoading || !tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>Identificando clínica...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/taetter-logo.png" 
              alt="Taetter" 
              className="h-12"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {tenantName}
          </CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestão de Vacinação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="seu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Powered by Taetter VIS</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
