import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = trpc.customAuth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Bem-vindo, ${data.user.name || data.user.username}!`);
      // Redirect based on role
      if (data.user.role === "super_admin") {
        setLocation("/admin/dashboard");
      } else if (data.user.tenantId) {
        setLocation(`/tenant/${data.user.tenantId}/dashboard`);
      } else {
        setLocation("/");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #1e3a8a 1px, transparent 1px),
            linear-gradient(to bottom, #1e3a8a 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 md:p-12">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/logo-full.png" 
              alt="Taetter" 
              className="w-full max-w-xs h-auto"
            />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-light">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="seu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 bg-white/50 border-slate-300 focus:border-blue-900 focus:ring-blue-900/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-light">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white/50 border-slate-300 focus:border-blue-900 focus:ring-blue-900/20"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white font-light tracking-wide transition-all duration-300"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col items-center gap-3 text-sm">
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.taetter.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-blue-900 transition-colors font-light"
                >
                  www.taetter.com.br
                </a>
                <span className="text-slate-300">•</span>
                <a 
                  href="https://www.linkedin.com/company/taetter" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-blue-900 transition-colors font-light"
                >
                  LinkedIn
                </a>
              </div>
              <a 
                href="mailto:suporte@taetter.com.br"
                className="text-slate-600 hover:text-blue-900 transition-colors font-light"
              >
                Suporte
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -top-20 -right-20 w-40 h-40 border border-blue-900/10 rounded-full -z-10" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 border border-amber-600/10 rounded-full -z-10" />
      </div>
    </div>
  );
}
