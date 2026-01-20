import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { signIn, initSupabase } from "@/lib/supabase";

/**
 * Master Login Page
 * Authentication for super_admin users (Master Dashboard access)
 * 
 * SECURITY:
 * - Uses Supabase Auth for authentication
 * - Validates role server-side via tRPC
 * - Redirects based on user role and tenantId
 * 
 * VISUAL IDENTITY:
 * - Dark theme (slate-950) matching landing page
 * - Gold accents (#d4af37) for premium feel
 * - Differentiated from tenant login (light theme)
 */

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get Supabase config from backend
  const { data: supabaseConfig } = trpc.supabaseAuth.getConfig.useQuery();

  // Initialize Supabase client
  useEffect(() => {
    if (supabaseConfig && !isInitialized) {
      initSupabase(supabaseConfig.url, supabaseConfig.anonKey)
        .then(() => {
          setIsInitialized(true);
        })
        .catch((error) => {
          console.error('[Supabase] Failed to initialize:', error);
          toast.error('Erro ao inicializar autenticação');
        });
    }
  }, [supabaseConfig, isInitialized]);

  // Get current user info from our database
  const { data: currentUser, refetch: refetchUser } = trpc.supabaseAuth.me.useQuery(
    undefined,
    { enabled: false }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isInitialized) {
      toast.error('Aguarde a inicialização...');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Sign in with Supabase Auth
      const { session } = await signIn(email, password);

      if (!session) {
        throw new Error('Falha ao criar sessão');
      }

      // Step 2: Get user info from our database
      const { data: user } = await refetchUser();

      if (!user) {
        throw new Error('Usuário não encontrado no sistema');
      }

      // Step 3: Validate role (Master Login is for super_admin only)
      if (user.role !== 'super_admin') {
        toast.error('Acesso negado. Esta área é exclusiva para administradores.');
        setIsLoading(false);
        return;
      }

      // Step 4: Success - redirect to Master Dashboard
      toast.success(`Bem-vindo, ${user.name || user.email}!`);
      setLocation('/admin/dashboard');
    } catch (error) {
      console.error('[Login] Error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao fazer login. Verifique suas credenciais.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #d4af37 1px, transparent 1px),
            linear-gradient(to bottom, #d4af37 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#d4af37]/20 p-8 md:p-12">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/logo-full.png" 
              alt="Taetter" 
              className="w-full max-w-xs h-auto"
            />
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-light text-slate-200 tracking-wide">
              Master Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Acesso exclusivo para administradores
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-light">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!isInitialized}
                className="h-12 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-[#d4af37]/50 focus:ring-[#d4af37]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-light">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!isInitialized}
                className="h-12 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-[#d4af37]/50 focus:ring-[#d4af37]/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isInitialized}
              className="w-full h-12 bg-[#d4af37] hover:bg-[#c4a030] text-slate-950 font-normal tracking-wide transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                  Entrando...
                </div>
              ) : !isInitialized ? (
                "Inicializando..."
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex flex-col items-center gap-3 text-sm">
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.taetter.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#d4af37] transition-colors font-light"
                >
                  www.taetter.com.br
                </a>
                <span className="text-slate-700">•</span>
                <a 
                  href="https://www.linkedin.com/company/taetter" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#d4af37] transition-colors font-light"
                >
                  LinkedIn
                </a>
              </div>
              <a 
                href="mailto:suporte@taetter.com.br"
                className="text-slate-400 hover:text-[#d4af37] transition-colors font-light"
              >
                Suporte
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -top-20 -right-20 w-40 h-40 border border-[#d4af37]/10 rounded-full -z-10" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 border border-[#d4af37]/10 rounded-full -z-10" />
      </div>
    </div>
  );
}
