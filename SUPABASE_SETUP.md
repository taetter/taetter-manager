# Supabase Setup Guide - Taetter VIS Manager

**Data**: 20 de Janeiro de 2026  
**Objetivo**: Migrar autenticação de JWT custom para Supabase Auth

---

## 📋 Pré-requisitos

- [ ] Acesso ao [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Acesso ao [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Credenciais Supabase (fornecidas abaixo)
- [ ] Acesso ao repositório GitHub `taetter/taetter-manager`

---

## 🔑 Credenciais Supabase

**Projeto**: jqikzhgjkmgnnescocqo  
**URL**: https://jqikzhgjkmgnnescocqo.supabase.co

```bash
SUPABASE_URL=https://jqikzhgjkmgnnescocqo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaWt6aGdqa21nbm5lc2NvY3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDk4NDcsImV4cCI6MjA4NDIyNTg0N30.S2wRsp4tmwqHZ8bvuwsJTvkByt23doxvb4MTc0ogsl0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaWt6aGdqa21nbm5lc2NvY3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY0OTg0NywiZXhwIjoyMDg0MjI1ODQ3fQ.QsSZVjkUCdcnsCYJxxbc5TncyIbdcFv54QFRqtH261s
```

---

## 🚀 Etapa 1: Configurar Environment Variables no Vercel

### 1.1 Acessar Vercel Dashboard

1. Acesse https://vercel.com/dashboard
2. Navegue para o projeto **taetter-manager**
3. Vá em **Settings** → **Environment Variables**

### 1.2 Adicionar Variáveis de Ambiente

**⚠️ CRÍTICO DE SEGURANÇA**:
- `SUPABASE_ANON_KEY` → Disponível para **Production, Preview, Development**
- `SUPABASE_SERVICE_ROLE_KEY` → Disponível **APENAS** para **Production** (nunca Preview/Development)

#### Variável 1: SUPABASE_URL
```
Key: SUPABASE_URL
Value: https://jqikzhgjkmgnnescocqo.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variável 2: SUPABASE_ANON_KEY (Frontend)
```
Key: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaWt6aGdqa21nbm5lc2NvY3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDk4NDcsImV4cCI6MjA4NDIyNTg0N30.S2wRsp4tmwqHZ8bvuwsJTvkByt23doxvb4MTc0ogsl0
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variável 3: SUPABASE_SERVICE_ROLE_KEY (Backend ONLY)
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaWt6aGdqa21nbm5lc2NvY3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY0OTg0NywiZXhwIjoyMDg0MjI1ODQ3fQ.QsSZVjkUCdcnsCYJxxbc5TncyIbdcFv54QFRqtH261s
Environments: ✅ Production ⛔ Preview ⛔ Development
```

**Justificativa de Segurança**:
- Service Role Key bypassa RLS policies → NUNCA expor ao frontend
- Preview/Development podem vazar via logs/screenshots → usar apenas em Production
- Anon Key é segura para frontend → protegida por RLS policies

### 1.3 Redeploy para Aplicar Variáveis

Após adicionar as variáveis:
1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deployment
3. Selecione **Redeploy**
4. Aguarde build completar

---

## 🔐 Etapa 2: Configurar Redirect URLs no Supabase

### 2.1 Acessar Supabase Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione o projeto **jqikzhgjkmgnnescocqo**
3. Vá em **Authentication** → **URL Configuration**

### 2.2 Adicionar Site URL

```
Site URL: https://www.taetter.com.br
```

### 2.3 Adicionar Redirect URLs

Adicione as seguintes URLs na lista de **Redirect URLs**:

```
https://www.taetter.com.br/**
https://taetter-manager.vercel.app/**
https://taetter-manager-*.vercel.app/**
http://localhost:3000/**
http://127.0.0.1:3000/**
```

**Explicação**:
- `www.taetter.com.br` → Produção (domínio custom)
- `taetter-manager.vercel.app` → Produção (Vercel)
- `taetter-manager-*.vercel.app` → Preview deployments
- `localhost:3000` → Desenvolvimento local

### 2.4 Configurar Email Templates (Opcional)

Se quiser customizar emails de confirmação/reset:
1. Vá em **Authentication** → **Email Templates**
2. Customize os templates de:
   - Confirm signup
   - Reset password
   - Magic link

---

## 🗄️ Etapa 3: Aplicar Migration do Campo supabaseUserId

### 3.1 Verificar Migration Gerada

A migration foi gerada automaticamente pelo Drizzle Kit:

```sql
-- Arquivo: drizzle/migrations/0000_faithful_stardust.sql

CREATE TABLE `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `supabaseUserId` varchar(36),  -- ← NOVO CAMPO
  `openId` varchar(64),
  `username` varchar(64),
  `passwordHash` varchar(255),
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin','super_admin') NOT NULL DEFAULT 'user',
  `tenantId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `users_id` PRIMARY KEY(`id`),
  CONSTRAINT `users_supabaseUserId_unique` UNIQUE(`supabaseUserId`),  -- ← ÍNDICE ÚNICO
  CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
  CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
```

### 3.2 Aplicar Migration no Banco de Dados

**Opção A: Via Drizzle Kit (Recomendado)**

```bash
# No repositório local
cd taetter-manager
pnpm db:push
```

**Opção B: Via SQL Direto (se Drizzle falhar)**

Se a tabela `users` já existe, execute apenas o ALTER TABLE:

```sql
-- Adicionar campo supabaseUserId
ALTER TABLE users 
ADD COLUMN supabaseUserId VARCHAR(36) UNIQUE AFTER id;

-- Criar índice para performance
CREATE INDEX idx_users_supabase_user_id ON users(supabaseUserId);
```

Execute via:
- MySQL Workbench
- phpMyAdmin
- Linha de comando: `mysql -h <host> -u <user> -p <database> < migration.sql`

### 3.3 Verificar Migration Aplicada

```sql
-- Verificar estrutura da tabela
DESCRIBE users;

-- Deve mostrar:
-- supabaseUserId | varchar(36) | YES | UNI | NULL |
```

---

## 👤 Etapa 4: Criar Usuário Super Admin no Supabase Auth

### 4.1 Acessar Supabase SQL Editor

1. Acesse https://supabase.com/dashboard
2. Selecione o projeto **jqikzhgjkmgnnescocqo**
3. Vá em **SQL Editor**
4. Clique em **New query**

### 4.2 Executar Script de Criação de Super Admin

**⚠️ IMPORTANTE**: Este script usa a função `auth.admin_create_user` que requer privilégios de service_role.

```sql
-- =============================================================================
-- CRIAR SUPER ADMIN NO SUPABASE AUTH
-- =============================================================================

-- Step 1: Criar usuário no Supabase Auth
-- ATENÇÃO: Substitua o email e senha conforme necessário
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Criar usuário no Supabase Auth
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'gfranceschi@taetter.com.br',  -- ← ALTERAR EMAIL
    crypt('gabriel', gen_salt('bf')),  -- ← ALTERAR SENHA
    NOW(),
    '{"provider":"email","providers":["email"],"role":"super_admin"}',
    '{"name":"Gabriel Franceschi","role":"super_admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Exibir ID do usuário criado
  RAISE NOTICE 'Super admin created with Supabase User ID: %', new_user_id;
END $$;
```

**Alternativa: Via Supabase Dashboard UI**

1. Vá em **Authentication** → **Users**
2. Clique em **Add user**
3. Preencha:
   - **Email**: gfranceschi@taetter.com.br
   - **Password**: gabriel
   - **Auto Confirm User**: ✅ Sim
4. Clique em **Create user**
5. **Copie o User ID** (formato UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 4.3 Vincular Supabase User ao Banco de Dados Local

Após criar o usuário no Supabase Auth, vincule ao banco de dados local:

```sql
-- =============================================================================
-- VINCULAR SUPER ADMIN AO BANCO LOCAL
-- =============================================================================

-- ATENÇÃO: Substitua o supabaseUserId pelo UUID copiado do Supabase Dashboard
INSERT INTO users (
  supabaseUserId,
  email,
  name,
  role,
  tenantId,
  loginMethod,
  createdAt,
  updatedAt,
  lastSignedIn
)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- ← SUBSTITUIR pelo UUID real
  'gfranceschi@taetter.com.br',
  'Gabriel Franceschi',
  'super_admin',
  NULL,  -- Super admin não pertence a nenhum tenant
  'supabase',
  NOW(),
  NOW(),
  NOW()
);

-- Verificar criação
SELECT id, supabaseUserId, email, name, role, tenantId 
FROM users 
WHERE role = 'super_admin';
```

---

## ✅ Etapa 5: Validar Fluxo de Autenticação

### 5.1 Testar Login no Master Dashboard

1. Acesse https://www.taetter.com.br/login
2. Faça login com:
   - **Email**: gfranceschi@taetter.com.br
   - **Password**: gabriel
3. Deve redirecionar para `/admin/dashboard`

### 5.2 Verificar Token JWT no DevTools

1. Abra DevTools (F12)
2. Vá em **Application** → **Local Storage** → `https://www.taetter.com.br`
3. Procure por chave `sb-jqikzhgjkmgnnescocqo-auth-token`
4. Deve conter um objeto JSON com `access_token` e `refresh_token`

### 5.3 Verificar Context no Backend

Adicione logging temporário em `server/_core/context.ts`:

```typescript
export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  // ... código existente ...
  
  console.log('[Auth Debug]', {
    hasAuthHeader: !!authHeader,
    supabaseUserId,
    userFound: !!user,
    userRole: user?.role,
  });
  
  return { req: opts.req, res: opts.res, user, supabaseUserId };
}
```

Verifique logs no Vercel:
1. Vá em **Deployments** → Último deployment
2. Clique em **View Function Logs**
3. Procure por `[Auth Debug]`

### 5.4 Testar Procedures Protegidas

Teste um endpoint protegido via tRPC:

```typescript
// No DevTools Console
fetch('/api/trpc/supabaseAuth.me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('sb-jqikzhgjkmgnnescocqo-auth-token').access_token}`
  }
})
.then(r => r.json())
.then(console.log);
```

Deve retornar:
```json
{
  "result": {
    "data": {
      "id": 1,
      "supabaseUserId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "email": "gfranceschi@taetter.com.br",
      "name": "Gabriel Franceschi",
      "role": "super_admin",
      "tenantId": null
    }
  }
}
```

---

## 🔒 Etapa 6: Implementar RLS Policies (Próxima Fase)

**⚠️ CRÍTICO PARA LGPD**: Row-Level Security deve ser implementado para isolamento de tenants.

Será executado na **Fase 4** do plano de correção arquitetural.

Prévia das políticas necessárias:

```sql
-- Habilitar RLS em todas as tabelas tenant-scoped
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_applications ENABLE ROW LEVEL SECURITY;
-- ... (todas as tabelas com tenantId)

-- Política de isolamento de tenant
CREATE POLICY "tenant_isolation_patients"
ON patients
FOR ALL
USING (
  tenant_id = (
    SELECT tenant_id 
    FROM users 
    WHERE supabase_user_id = auth.uid()
  )
);
```

---

## 📊 Checklist de Validação

### Backend
- [ ] `@supabase/supabase-js` instalado no package.json
- [ ] `server/_core/supabase.ts` criado e exportando `supabaseAdmin`
- [ ] `server/routers/supabaseAuth.ts` criado com procedures
- [ ] `server/_core/context.ts` validando tokens Supabase
- [ ] `drizzle/schema.ts` com campo `supabaseUserId`

### Frontend
- [ ] `client/src/lib/supabase.ts` criado com helpers
- [ ] `client/src/pages/Login.tsx` usando Supabase Auth
- [ ] Inicialização do Supabase client no app startup

### Vercel
- [ ] `SUPABASE_URL` configurada (Production, Preview, Development)
- [ ] `SUPABASE_ANON_KEY` configurada (Production, Preview, Development)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada (Production ONLY)
- [ ] Redeploy executado após adicionar env vars

### Supabase
- [ ] Site URL configurada: `https://www.taetter.com.br`
- [ ] Redirect URLs configuradas (produção + preview + localhost)
- [ ] Email templates customizados (opcional)

### Database
- [ ] Migration aplicada: campo `supabaseUserId` adicionado
- [ ] Índice único criado em `supabaseUserId`
- [ ] Super admin criado no Supabase Auth
- [ ] Super admin vinculado ao banco local

### Testes
- [ ] Login no Master Dashboard funcionando
- [ ] Token JWT armazenado no localStorage
- [ ] Context validando token server-side
- [ ] Procedure `supabaseAuth.me` retornando usuário
- [ ] Redirecionamento baseado em role funcionando

---

## 🆘 Troubleshooting

### Erro: "Supabase client not initialized"

**Causa**: Frontend tentou usar Supabase antes de inicializar.

**Solução**: Verificar se `initSupabase()` é chamado no `App.tsx` antes de qualquer uso.

```typescript
// client/src/App.tsx
useEffect(() => {
  const initAuth = async () => {
    const config = await trpc.supabaseAuth.getConfig.query();
    await initSupabase(config.url, config.anonKey);
  };
  initAuth();
}, []);
```

### Erro: "Invalid login credentials"

**Causa**: Credenciais incorretas ou usuário não existe no Supabase Auth.

**Solução**:
1. Verificar se usuário foi criado no Supabase Dashboard
2. Resetar senha via **Authentication** → **Users** → **Reset password**

### Erro: "User not found in database"

**Causa**: Usuário existe no Supabase Auth mas não no banco local.

**Solução**: Executar SQL de vinculação (Etapa 4.3).

### Erro: "CORS error" ao fazer login

**Causa**: Redirect URL não configurada no Supabase.

**Solução**: Adicionar URL na lista de Redirect URLs (Etapa 2.3).

---

## 📚 Referências

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)

---

## 🎯 Próximos Passos

Após completar este setup:

1. **Fase 3**: Refatorar `createContext` com fail-fast validation
2. **Fase 4**: Implementar RLS policies para isolamento de tenants
3. **Fase 5**: Migrar Tenant Login para Supabase Auth
4. **Fase 6**: Implementar 2FA para super_admin

---

**Autor**: Manus AI - Senior SaaS Architect  
**Última Atualização**: 20 de Janeiro de 2026
