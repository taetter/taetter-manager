# 🚀 Instruções de Deploy - Taetter VIS Manager

## ⚠️ IMPORTANTE: Configurar Environment Variables no Vercel

Para o sistema funcionar corretamente em produção, você **DEVE** configurar as seguintes variáveis de ambiente no Vercel:

### 1. Acessar Configurações do Projeto no Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto `taetter-manager`
3. Vá em **Settings** → **Environment Variables**

### 2. Adicionar Variáveis Obrigatórias

#### 🔐 Supabase (CRÍTICO)

```bash
SUPABASE_URL=https://jqikzhgjkmgnnescocqo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaWt6aGdqa21nbm5lc2NvY3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDk4NDcsImV4cCI6MjA4NDIyNTg0N30.S2wRsp4tmwqHZ8bvuwsJTvkByt23doxvb4MTc0ogsl0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaWt6aGdqa21nbm5lc2NvY3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY0OTg0NywiZXhwIjoyMDg0MjI1ODQ3fQ.QsSZVjkUCdcnsCYJxxbc5TncyIbdcFv54QFRqtH261s
```

#### 🗄️ Database

```bash
DATABASE_URL=postgresql://postgres:lubrujuM3ll3c4@db.jqikzhgjkmgnnescocqo.supabase.co:5432/postgres
```

#### 🔑 JWT & Auth

```bash
JWT_SECRET=taetter-vis-manager-super-secret-jwt-key-2026
```

#### 🎨 Frontend (VITE_ prefix)

```bash
VITE_SUPABASE_URL=https://jqikzhgjkmgnnescocqo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaWt6aGdqa21nbm5lc2NvY3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDk4NDcsImV4cCI6MjA4NDIyNTg0N30.S2wRsp4tmwqHZ8bvuwsJTvkByt23doxvb4MTc0ogsl0
VITE_APP_TITLE=Taetter VIS Manager
VITE_APP_LOGO=/logo.svg
```

### 3. Aplicar para Todos os Ambientes

⚠️ **IMPORTANTE**: Marque as opções:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 4. Fazer Redeploy

Após adicionar as variáveis:
1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deployment
3. Selecione **Redeploy**

---

## ✅ Validar Deploy

### 1. Health Check

Acesse: https://www.taetter.com.br/api/trpc/health.check

Resposta esperada:
```json
{
  "ok": true,
  "env": {
    "supabaseUrl": true,
    "supabaseAnonKey": true,
    "supabaseServiceRoleKey": true,
    "databaseUrl": true,
    "jwtSecret": true
  },
  "database": {
    "connected": true,
    "error": null
  },
  "auth": {
    "available": true,
    "adminAvailable": true,
    "error": null
  }
}
```

### 2. Criar Super Admin

Acesse: https://www.taetter.com.br/create-super-admin

Clique em **"Create Super Admin"**

Credenciais criadas:
- **Email**: master@taetter.com.br
- **Password**: gabriel
- **Role**: super_admin

### 3. Testar Login

Acesse: https://www.taetter.com.br/login

Faça login com:
- **Email**: master@taetter.com.br
- **Password**: gabriel

---

## 🔧 Troubleshooting

### Erro: "Missing required environment variable: SUPABASE_URL"

**Causa**: Env vars não configuradas no Vercel

**Solução**: Siga o passo 2 acima e faça redeploy

### Erro: "Database not available"

**Causa**: DATABASE_URL incorreta ou banco inacessível

**Solução**: 
1. Verifique a connection string no Supabase Dashboard
2. Confirme que o banco está ativo (não pausado)

### Erro: "Supabase Admin client not available"

**Causa**: SUPABASE_SERVICE_ROLE_KEY não configurada

**Solução**: Adicione a service_role_key nas env vars do Vercel

---

## 📝 Próximos Passos

Após validar o deploy:

1. ✅ Remover endpoint temporário `/create-super-admin`
2. ✅ Implementar fluxo de recuperação de senha
3. ✅ Adicionar autenticação de dois fatores (2FA)
4. ✅ Configurar RLS (Row Level Security) no Supabase
5. ✅ Implementar audit logs para ações administrativas

---

## 🆘 Suporte

Se encontrar problemas, verifique os logs no Vercel:
1. Acesse o projeto no Vercel Dashboard
2. Vá em **Deployments** → Clique no deployment
3. Vá em **Functions** → Selecione a função com erro
4. Veja os logs detalhados

Para mais informações: https://vercel.com/docs/functions/serverless-functions/troubleshooting
