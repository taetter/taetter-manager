/**
 * Definições de planos e módulos comercializáveis do sistema
 */

export type ModuleId = 
  | "scheduling"
  | "patients"
  | "applications"
  | "stock"
  | "financial"
  | "indicators"
  | "bi"
  | "quality"
  | "hr"
  | "integrations";

export type PlanType = "basic" | "intermediate" | "full";

export interface Module {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  category: "essential" | "advanced" | "premium";
  route: string;
}

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  includedModules: ModuleId[];
  additionalModulesAllowed: number; // Quantos módulos adicionais podem ser escolhidos
  availableAdditionalModules: ModuleId[]; // Pool de módulos disponíveis para escolha
}

/**
 * Definição de todos os módulos disponíveis no sistema
 */
export const MODULES: Record<ModuleId, Module> = {
  scheduling: {
    id: "scheduling",
    name: "Agendamento",
    description: "Agenda e atendimento domiciliar",
    icon: "Calendar",
    category: "essential",
    route: "/scheduling",
  },
  patients: {
    id: "patients",
    name: "Pacientes",
    description: "Gerenciar cadastro de pacientes",
    icon: "Users",
    category: "essential",
    route: "/patients",
  },
  applications: {
    id: "applications",
    name: "Aplicações",
    description: "Registro de vacinação",
    icon: "Syringe",
    category: "essential",
    route: "/application",
  },
  stock: {
    id: "stock",
    name: "Estoque",
    description: "Controle de vacinas e insumos",
    icon: "Package",
    category: "essential",
    route: "/stock",
  },
  financial: {
    id: "financial",
    name: "Financeiro",
    description: "Controle financeiro e NFe",
    icon: "DollarSign",
    category: "essential",
    route: "/financial",
  },
  indicators: {
    id: "indicators",
    name: "Indicadores",
    description: "Relatórios e gráficos",
    icon: "TrendingUp",
    category: "advanced",
    route: "/indicators",
  },
  bi: {
    id: "bi",
    name: "B.I.",
    description: "Business Intelligence",
    icon: "BarChart3",
    category: "premium",
    route: "/bi",
  },
  quality: {
    id: "quality",
    name: "Qualidade",
    description: "POPs, Auditorias e Conformidade",
    icon: "Award",
    category: "premium",
    route: "/quality",
  },
  hr: {
    id: "hr",
    name: "RH",
    description: "Gestão de profissionais",
    icon: "Briefcase",
    category: "advanced",
    route: "/hr",
  },
  integrations: {
    id: "integrations",
    name: "Integrações",
    description: "RNDS/PNI e NFS-e/NFe",
    icon: "Plug",
    category: "premium",
    route: "/integrations",
  },
};

/**
 * Definição dos planos disponíveis
 */
export const PLANS: Record<PlanType, Plan> = {
  basic: {
    id: "basic",
    name: "Plano Básico",
    description: "Módulos essenciais para operação da clínica",
    price: 297.00,
    includedModules: ["scheduling", "patients", "applications", "stock", "financial"],
    additionalModulesAllowed: 0,
    availableAdditionalModules: [],
  },
  intermediate: {
    id: "intermediate",
    name: "Plano Intermediário",
    description: "Plano básico + 2 módulos adicionais à escolha",
    price: 497.00,
    includedModules: ["scheduling", "patients", "applications", "stock", "financial"],
    additionalModulesAllowed: 2,
    availableAdditionalModules: ["indicators", "hr"], // Pool limitado para não comprometer integrações
  },
  full: {
    id: "full",
    name: "Plano Full",
    description: "Todos os módulos disponíveis + suporte premium",
    price: 997.00,
    includedModules: ["scheduling", "patients", "applications", "stock", "financial", "indicators", "bi", "quality", "hr", "integrations"],
    additionalModulesAllowed: 0,
    availableAdditionalModules: [],
  },
};

/**
 * Helper para obter os módulos habilitados de um tenant baseado no plano
 */
export function getEnabledModules(plan: PlanType, additionalModules: ModuleId[] = []): ModuleId[] {
  const planConfig = PLANS[plan];
  const enabled = [...planConfig.includedModules];
  
  // Adicionar módulos adicionais (validando o limite)
  if (additionalModules.length > 0) {
    const validAdditional = additionalModules
      .filter(mod => planConfig.availableAdditionalModules.includes(mod))
      .slice(0, planConfig.additionalModulesAllowed);
    enabled.push(...validAdditional);
  }
  
  return enabled;
}

/**
 * Helper para verificar se um tenant tem acesso a um módulo
 */
export function hasModuleAccess(enabledModules: ModuleId[] | null | undefined, moduleId: ModuleId): boolean {
  if (!enabledModules || enabledModules.length === 0) {
    // Se não há módulos configurados, assume plano básico
    return PLANS.basic.includedModules.includes(moduleId);
  }
  return enabledModules.includes(moduleId);
}

/**
 * Helper para obter módulos disponíveis para adicionar ao plano
 */
export function getAvailableModulesForPlan(plan: PlanType, currentAdditionalModules: ModuleId[] = []): Module[] {
  const planConfig = PLANS[plan];
  const availableIds = planConfig.availableAdditionalModules.filter(
    id => !currentAdditionalModules.includes(id)
  );
  return availableIds.map(id => MODULES[id]);
}
