# Scripts de Administração

## Criar Usuário Super Admin

Este script cria ou atualiza o usuário `gfranceschi` com role `super_admin`.

### Pré-requisitos

1. Ter a variável `DATABASE_URL` configurada
2. Ter as dependências instaladas (`pnpm install`)

### Execução Local

```bash
# No diretório raiz do projeto
pnpm exec node scripts/create-super-admin.mjs
```

### Execução no Vercel (via CLI)

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Fazer login
vercel login

# Executar script remotamente
vercel env pull .env.local
node scripts/create-super-admin.mjs
```

### Credenciais Criadas

- **Username**: `gfranceschi`
- **Password**: `gabriel`
- **Role**: `super_admin`
- **Email**: `gabriel@taetter.com.br`

### O que o script faz

1. Conecta no banco de dados usando `DATABASE_URL`
2. Verifica se o usuário `gfranceschi` já existe
3. Se existir: atualiza a senha e garante que o role seja `super_admin`
4. Se não existir: cria o usuário com os dados acima

### Troubleshooting

**Erro: DATABASE_URL não está definida**
- Certifique-se de que a variável de ambiente está configurada
- No Vercel: `vercel env pull .env.local` para baixar as variáveis

**Erro: Cannot find module 'bcrypt'**
- Execute `pnpm install` para instalar as dependências

**Erro: Connection refused**
- Verifique se a DATABASE_URL está correta
- Verifique se o banco de dados está acessível
