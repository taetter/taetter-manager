# Módulos Operacionais - Taetter VIS

Esta pasta contém todos os módulos operacionais do sistema VIS que serão acessados pelos usuários dos tenants (clínicas).

## Estrutura de Módulos

### 1. Pacientes (`/modules/patients`)
- Cadastro completo de pacientes
- Histórico de vacinação
- Dados demográficos e clínicos
- Carteirinha virtual
- Notificações de intercorrências

### 2. Estoque (`/modules/inventory`)
- Gestão de vacinas e insumos
- Controle de lotes e validades
- Alertas de estoque mínimo
- Rastreabilidade completa

### 3. Aplicação (`/modules/application`)
- Registro de aplicação de vacinas
- Integração com RNDS
- Geração de comprovantes
- Agendamento de doses

### 4. Financeiro (`/modules/financial`)
- Controle de pagamentos
- Emissão de Nota Fiscal Eletrônica
- Relatórios financeiros
- Integração com meios de pagamento

### 5. RH (`/modules/hr`)
- Cadastro de profissionais
- Controle de escalas
- Registro de aplicadores
- Certificações e treinamentos

### 6. Orçamentos (`/modules/budgets`)
- Criação de orçamentos
- Aprovação de orçamentos
- Conversão em aplicação
- Histórico de orçamentos

## Padrão de Implementação

Cada módulo deve seguir a estrutura:

```
modules/
  └── [nome-modulo]/
      ├── index.tsx           # Página principal do módulo
      ├── components/         # Componentes específicos
      ├── hooks/             # Hooks personalizados
      └── types.ts           # Tipos TypeScript
```

## Autenticação e Autorização

- Todos os módulos requerem autenticação
- Verificação de tenant_id automática
- Controle de permissões por role (admin, user)
- RLS (Row Level Security) no banco de dados

## Próximos Passos

1. Implementar módulo de Pacientes (prioridade alta)
2. Implementar módulo de Aplicação
3. Implementar módulo de Estoque
4. Implementar integração RNDS
5. Implementar integração NFe
