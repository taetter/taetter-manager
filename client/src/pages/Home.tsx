import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Usuário autenticado - redirecionar para dashboard apropriado
        if (user.role === "super_admin") {
          setLocation("/admin/dashboard");
        } else if (user.role === "admin") {
          setLocation("/tenant/1/dashboard");
        }
      } else {
        // Usuário não autenticado - redirecionar para login do Master Dashboard
        setLocation("/login");
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Decorative Lines - Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, #1e3a8a 1px, transparent 1px),
              linear-gradient(to bottom, #1e3a8a 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }} />
        </div>

        {/* Decorative Circles - Control Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 border border-blue-900/10 rounded-full" />
        <div className="absolute top-32 right-32 w-48 h-48 border border-blue-900/10 rounded-full" />
        <div className="absolute bottom-20 left-20 w-72 h-72 border border-amber-600/10 rounded-full" />
        <div className="absolute bottom-32 left-32 w-56 h-56 border border-amber-600/10 rounded-full" />

        {/* Vertical Lines - Precision Indicators */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
        <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-600/10 to-transparent" />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <img 
              src="/logo-full.png" 
              alt="Taetter - Imunidade Mensurada" 
              className="w-full max-w-2xl h-auto"
            />
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-slate-600 font-light tracking-wide mb-16 max-w-3xl mx-auto leading-relaxed">
            Sistema integrado de gestão de vacinação
            <span className="block mt-2 text-lg text-slate-500">
              Da compra ao registro, com precisão e controle total
            </span>
          </p>

          {/* Stats Grid - Visual Representation of Control */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent rounded-lg transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 border-2 border-blue-900/20 rounded-full" />
                  <div className="absolute inset-2 border-2 border-blue-900/40 rounded-full" />
                  <div className="absolute inset-4 bg-blue-900/60 rounded-full" />
                </div>
                <div className="text-sm font-light text-slate-600 tracking-wide">Multi-Tenant</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent rounded-lg transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <svg className="w-full h-full text-amber-600/60" viewBox="0 0 64 64" fill="none">
                    <path d="M8 32 L32 8 L56 32 L32 56 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M20 32 L32 20 L44 32 L32 44 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="text-sm font-light text-slate-600 tracking-wide">Integração RNDS</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent rounded-lg transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 border-l-2 border-t-2 border-blue-900/40" />
                  <div className="absolute inset-0 border-r-2 border-b-2 border-amber-600/40" />
                  <div className="absolute inset-4 bg-gradient-to-br from-blue-900/20 to-amber-600/20" />
                </div>
                <div className="text-sm font-light text-slate-600 tracking-wide">Rastreabilidade</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent rounded-lg transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-6">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="grid grid-cols-3 gap-1 w-full h-full">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-amber-600/40 rounded-sm" />
                    ))}
                  </div>
                </div>
                <div className="text-sm font-light text-slate-600 tracking-wide">NFe Automática</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-slate-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section - Minimal & Elegant */}
      <section className="relative py-32 bg-gradient-to-b from-white to-slate-50">
        {/* Section Divider Line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-slate-300" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Feature 1 - Left Aligned */}
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
              <div className="order-2 md:order-1">
                <div className="relative">
                  {/* Decorative Element */}
                  <div className="absolute -left-8 top-0 w-1 h-24 bg-gradient-to-b from-blue-900 to-transparent" />
                  <h3 className="text-3xl font-light text-slate-800 mb-6 tracking-tight">
                    Gestão Centralizada
                  </h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    Controle múltiplas clínicas em uma única plataforma. Isolamento completo de dados, 
                    permissões granulares e visibilidade total das operações.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                {/* Visual Representation - Hierarchy */}
                <div className="relative h-64 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-2 border-blue-900/20 rounded-lg" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border-2 border-blue-900/40 rounded-lg rotate-45" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-900/60 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Right Aligned */}
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
              <div>
                {/* Visual Representation - Flow */}
                <div className="relative h-64">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <defs>
                      <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="100" r="20" fill="none" stroke="url(#flowGradient)" strokeWidth="2" />
                    <line x1="70" y1="100" x2="130" y2="100" stroke="url(#flowGradient)" strokeWidth="2" />
                    <circle cx="150" cy="100" r="20" fill="none" stroke="url(#flowGradient)" strokeWidth="2" />
                    <line x1="170" y1="100" x2="230" y2="100" stroke="url(#flowGradient)" strokeWidth="2" />
                    <circle cx="250" cy="100" r="20" fill="none" stroke="url(#flowGradient)" strokeWidth="2" />
                    <line x1="270" y1="100" x2="330" y2="100" stroke="url(#flowGradient)" strokeWidth="2" />
                    <circle cx="350" cy="100" r="20" fill="none" stroke="url(#flowGradient)" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute -right-8 top-0 w-1 h-24 bg-gradient-to-b from-amber-600 to-transparent" />
                  <h3 className="text-3xl font-light text-slate-800 mb-6 tracking-tight">
                    Fluxo Integrado
                  </h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    Do estoque à aplicação, cada etapa conectada. Registro automático no RNDS, 
                    emissão de NFe e rastreabilidade completa do lote à dose.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 - Left Aligned */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -left-8 top-0 w-1 h-24 bg-gradient-to-b from-blue-900 to-transparent" />
                  <h3 className="text-3xl font-light text-slate-800 mb-6 tracking-tight">
                    Experiência do Paciente
                  </h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    Carteirinha virtual, histórico completo de vacinação e notificações inteligentes. 
                    Transparência e controle na palma da mão.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                {/* Visual Representation - User-Centric */}
                <div className="relative h-64 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border border-amber-600/20 rounded-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 border border-amber-600/40 rounded-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-amber-600/60 rounded-full" />
                  </div>
                  {/* Radiating Lines */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <div
                      key={angle}
                      className="absolute w-px h-20 bg-gradient-to-t from-amber-600/40 to-transparent"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'bottom center',
                        bottom: '50%'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-slate-500 font-light tracking-wide">
              Copyright 2026 Taetter. Todos os direitos reservados.
            </p>
            <a 
              href="/login"
              className="text-xs text-slate-400 hover:text-blue-900 transition-colors duration-300 font-light tracking-widest"
            >
              v1.0.0
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
