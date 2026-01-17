# Taetter - VIS (Vaccine Interface System)

![Taetter Logo](./client/public/logo-full.png)

**Imunidade Mensurada** - Sistema completo de gestão de vacinação

## 🎯 Visão Geral

O **Taetter-VIS** é um conceito único no mercado que integra toda a cadeia de vacinação em um único sistema SaaS multi-tenant. Da compra do insumo até a aplicação da vacina, passando por gestão de estoque, financeira, RH, integração com RNDS (Registro Nacional de Dados em Saúde) e emissão de Nota Fiscal Eletrônica.

### Diferenciais

- **Multi-Tenant**: Gerencie múltiplas clínicas em um único sistema
- **Integração Completa**: Da compra à aplicação, tudo integrado
- **RNDS**: Integração nativa com o Registro Nacional de Dados em Saúde
- **NFe Automática**: Emissão automática de Nota Fiscal Eletrônica
- **Área do Paciente**: Carteirinha virtual, histórico e notificações

## 🏗️ Arquitetura

### Stack Tecnológica

- **Frontend**: React 19 + TypeScript + TailwindCSS 4
- **Backend**: Node.js + Express + tRPC
- **Database**: MySQL com Drizzle ORM
- **Autenticação**: Manus OAuth + JWT
- **Deploy**: Manus Hosting (preparado para Vercel)
- **Integração**: Supabase (preparado)

### Estrutura Multi-Tenant

O sistema implementa uma arquitetura multi-tenant robusta com:

- Isolamento completo de dados por tenant (clínica)
- Row Level Security (RLS) no banco de dados
- Hierarquia de roles: Super Admin, Tenant Admin, User
- Auditoria completa de ações

## 📦 Módulos

### 1. Gestor de Tenants (✅ Implementado)
- Criação e gerenciamento de clínicas
- Dashboard administrativo
- Métricas e estatísticas
- Logs de auditoria

### 2. Pacientes (🚧 Em Desenvolvimento)
- Cadastro completo de pacientes
- Histórico de vacinação
- Carteirinha virtual
- Notificações de intercorrências

### 3. Estoque (📋 Planejado)
- Gestão de vacinas e insumos
- Controle de lotes e validades
- Alertas de estoque mínimo

### 4. Aplicação (📋 Planejado)
- Registro de aplicação de vacinas
- Integração com RNDS
- Geração de comprovantes

### 5. Financeiro (📋 Planejado)
- Controle de pagamentos
- Emissão de NFe
- Relatórios financeiros

### 6. RH (📋 Planejado)
- Cadastro de profissionais
- Controle de escalas
- Certificações

## 🚀 Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 22+
- pnpm 10+
- MySQL 8+

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd taetter-vis

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrations
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im
# ... outras variáveis
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Verificar tipos TypeScript
pnpm check
```

## 📊 Database Schema

### Principais Tabelas

#### `users`
- Usuários do sistema
- Relacionamento com tenant via `tenantId`
- Roles: `user`, `admin`, `super_admin`

#### `tenants`
- Clínicas cadastradas
- Dados completos: CNPJ, endereço, responsável técnico
- Status: `ativo`, `inativo`, `suspenso`
- Soft delete com `deletedAt`

#### `auditLogs`
- Logs de auditoria de todas as ações
- Rastreabilidade completa

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

1. Usuário faz login via Manus OAuth
2. Sistema verifica role e tenant
3. Redirecionamento baseado em permissões:
   - Super Admin → Dashboard de Gestão
   - Tenant Admin/User → Dashboard do Tenant

### Hierarquia de Roles

- **Super Admin**: Acesso total, gerencia todos os tenants
- **Admin**: Gerencia seu tenant
- **User**: Acesso aos módulos operacionais do tenant

## 🌐 Deploy

### Manus Hosting (Atual)

O projeto está configurado para deploy no Manus Hosting:

```bash
# Criar checkpoint
# (use a interface do Manus)

# Publicar
# (use o botão Publish na interface)
```

### Vercel (Preparado)

O projeto está preparado para migração futura para Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📱 PWA

O sistema é um Progressive Web App completo:

- Instalável em dispositivos móveis
- Funciona offline (cache de recursos)
- Ícones otimizados para todas as plataformas
- Manifest.json configurado

## 🔄 Integração Supabase

O projeto está preparado para integração com Supabase:

- Schema compatível
- RLS (Row Level Security) implementado
- Migrations prontas para exportação

### Migração para Supabase

1. Crie um projeto no Supabase
2. Exporte o schema atual: `pnpm db:push`
3. Importe no Supabase
4. Configure as variáveis de ambiente
5. Ative RLS nas tabelas

## 🛣️ Roadmap

### Fase 1 - MVP (✅ Concluído)
- [x] Estrutura multi-tenant
- [x] Gestor de tenants
- [x] Autenticação e autorização
- [x] PWA configurado

### Fase 2 - Módulos Core (🚧 Em Andamento)
- [ ] Módulo de Pacientes completo
- [ ] Módulo de Aplicação
- [ ] Módulo de Estoque

### Fase 3 - Integrações (📋 Planejado)
- [ ] Integração RNDS
- [ ] Integração NFe
- [ ] Módulo Financeiro

### Fase 4 - Expansão (📋 Planejado)
- [ ] Módulo de RH
- [ ] Relatórios avançados
- [ ] App mobile nativo

## 🤝 Contribuindo

Este é um projeto proprietário. Para contribuir, entre em contato com a equipe.

## 📄 Licença

Copyright © 2026 Taetter. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@taetter.com.br
- Website: https://taetter.com.br

---

**Desenvolvido com ❤️ pela equipe Taetter**
