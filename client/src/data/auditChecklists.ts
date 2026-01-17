// Checklists de Auditoria para Vigilância Sanitária e Certificações

export const vigilanciaSanitariaChecklist = [
  {
    categoria: "1. Estrutura Física",
    itens: [
      {
        item: "Área física compatível com o serviço prestado",
        criterio: "Dimensionamento adequado conforme RDC 50/2002",
      },
      {
        item: "Pisos, paredes e tetos em bom estado de conservação",
        criterio: "Superfícies lisas, laváveis e impermeáveis",
      },
      {
        item: "Iluminação adequada em todos os ambientes",
        criterio: "Iluminação natural e/ou artificial suficiente",
      },
      {
        item: "Ventilação adequada",
        criterio: "Natural e/ou artificial com renovação de ar",
      },
      {
        item: "Instalações sanitárias adequadas",
        criterio: "Sanitários separados para pacientes e funcionários",
      },
      {
        item: "Área para armazenamento de resíduos",
        criterio: "Local exclusivo, identificado e de fácil higienização",
      },
    ],
  },
  {
    categoria: "2. Equipamentos e Materiais",
    itens: [
      {
        item: "Equipamentos de refrigeração para vacinas",
        criterio: "Geladeiras exclusivas com termômetro de máxima e mínima",
      },
      {
        item: "Registro de temperatura diário",
        criterio: "Planilha de controle preenchida 2x ao dia",
      },
      {
        item: "Caixas térmicas para transporte",
        criterio: "Caixas adequadas com bobinas reutilizáveis",
      },
      {
        item: "Materiais de primeiros socorros",
        criterio: "Kit completo e dentro da validade",
      },
      {
        item: "Equipamentos de proteção individual (EPIs)",
        criterio: "Disponíveis e em quantidade suficiente",
      },
    ],
  },
  {
    categoria: "3. Recursos Humanos",
    itens: [
      {
        item: "Responsável técnico habilitado",
        criterio: "Profissional de nível superior com registro ativo",
      },
      {
        item: "Equipe capacitada",
        criterio: "Treinamentos documentados e atualizados",
      },
      {
        item: "Vacinadores habilitados",
        criterio: "Profissionais de enfermagem com COREN ativo",
      },
      {
        item: "Uso de uniformes e EPIs",
        criterio: "Equipe uniformizada e utilizando EPIs adequados",
      },
    ],
  },
  {
    categoria: "4. Documentação",
    itens: [
      {
        item: "Alvará Sanitário válido",
        criterio: "Documento vigente e afixado em local visível",
      },
      {
        item: "Licença de Funcionamento",
        criterio: "Documento atualizado",
      },
      {
        item: "POPs disponíveis e atualizados",
        criterio: "Procedimentos documentados e acessíveis à equipe",
      },
      {
        item: "Registro de vacinação",
        criterio: "Sistema informatizado ou manual organizado",
      },
      {
        item: "Controle de estoque",
        criterio: "Planilhas atualizadas com entrada e saída",
      },
      {
        item: "Plano de Gerenciamento de Resíduos (PGRSS)",
        criterio: "Documento elaborado e implementado",
      },
    ],
  },
  {
    categoria: "5. Processos Operacionais",
    itens: [
      {
        item: "Higienização das mãos",
        criterio: "Disponibilidade de lavatórios e insumos",
      },
      {
        item: "Segregação de resíduos",
        criterio: "Separação adequada por grupo (A, B, D, E)",
      },
      {
        item: "Limpeza e desinfecção",
        criterio: "Rotina estabelecida e documentada",
      },
      {
        item: "Controle de pragas",
        criterio: "Contrato com empresa especializada",
      },
      {
        item: "Procedimento de emergência",
        criterio: "Protocolo para reações adversas disponível",
      },
    ],
  },
  {
    categoria: "6. Segurança do Paciente",
    itens: [
      {
        item: "Identificação do paciente",
        criterio: "Conferência de nome completo e data de nascimento",
      },
      {
        item: "Verificação de contraindicações",
        criterio: "Anamnese realizada antes da vacinação",
      },
      {
        item: "Registro de eventos adversos",
        criterio: "Notificação e acompanhamento documentados",
      },
      {
        item: "Orientações pós-vacinação",
        criterio: "Informações fornecidas verbalmente e por escrito",
      },
    ],
  },
];

export const certificacaoISOChecklist = [
  {
    categoria: "1. Contexto da Organização (ISO 9001:2015 - Cláusula 4)",
    itens: [
      {
        item: "Análise do contexto organizacional",
        criterio: "Identificação de questões internas e externas relevantes",
      },
      {
        item: "Identificação das partes interessadas",
        criterio: "Mapeamento e análise de necessidades e expectativas",
      },
      {
        item: "Escopo do Sistema de Gestão da Qualidade",
        criterio: "Definição clara e documentada do escopo",
      },
      {
        item: "Processos do SGQ",
        criterio: "Identificação, sequência e interação dos processos",
      },
    ],
  },
  {
    categoria: "2. Liderança (ISO 9001:2015 - Cláusula 5)",
    itens: [
      {
        item: "Comprometimento da liderança",
        criterio: "Evidências de responsabilização e comprometimento da direção",
      },
      {
        item: "Política da Qualidade",
        criterio: "Política estabelecida, documentada e comunicada",
      },
      {
        item: "Papéis e responsabilidades",
        criterio: "Definição clara de autoridades e responsabilidades",
      },
      {
        item: "Foco no cliente",
        criterio: "Determinação e atendimento de requisitos do cliente",
      },
    ],
  },
  {
    categoria: "3. Planejamento (ISO 9001:2015 - Cláusula 6)",
    itens: [
      {
        item: "Ações para abordar riscos e oportunidades",
        criterio: "Análise de riscos e oportunidades documentada",
      },
      {
        item: "Objetivos da qualidade",
        criterio: "Objetivos mensuráveis e alinhados com a política",
      },
      {
        item: "Planejamento de mudanças",
        criterio: "Mudanças planejadas e controladas",
      },
    ],
  },
  {
    categoria: "4. Apoio (ISO 9001:2015 - Cláusula 7)",
    itens: [
      {
        item: "Recursos",
        criterio: "Provisão adequada de recursos (pessoas, infraestrutura, ambiente)",
      },
      {
        item: "Competência",
        criterio: "Determinação e desenvolvimento de competências necessárias",
      },
      {
        item: "Conscientização",
        criterio: "Equipe consciente da política e objetivos da qualidade",
      },
      {
        item: "Comunicação",
        criterio: "Processos de comunicação interna e externa estabelecidos",
      },
      {
        item: "Informação documentada",
        criterio: "Controle de documentos e registros implementado",
      },
    ],
  },
  {
    categoria: "5. Operação (ISO 9001:2015 - Cláusula 8)",
    itens: [
      {
        item: "Planejamento e controle operacional",
        criterio: "Processos operacionais planejados e controlados",
      },
      {
        item: "Requisitos para produtos e serviços",
        criterio: "Determinação e análise crítica de requisitos",
      },
      {
        item: "Projeto e desenvolvimento",
        criterio: "Processo de desenvolvimento controlado (se aplicável)",
      },
      {
        item: "Controle de processos terceirizados",
        criterio: "Fornecedores avaliados e controlados",
      },
      {
        item: "Produção e provisão de serviço",
        criterio: "Condições controladas para execução",
      },
      {
        item: "Liberação de produtos e serviços",
        criterio: "Verificação antes da entrega ao cliente",
      },
      {
        item: "Controle de saídas não conformes",
        criterio: "Tratamento de não conformidades documentado",
      },
    ],
  },
  {
    categoria: "6. Avaliação de Desempenho (ISO 9001:2015 - Cláusula 9)",
    itens: [
      {
        item: "Monitoramento e medição",
        criterio: "Indicadores de desempenho definidos e monitorados",
      },
      {
        item: "Satisfação do cliente",
        criterio: "Percepção do cliente monitorada e analisada",
      },
      {
        item: "Análise e avaliação",
        criterio: "Análise de dados para tomada de decisão",
      },
      {
        item: "Auditoria interna",
        criterio: "Programa de auditorias internas implementado",
      },
      {
        item: "Análise crítica pela direção",
        criterio: "Reuniões periódicas de análise crítica realizadas",
      },
    ],
  },
  {
    categoria: "7. Melhoria (ISO 9001:2015 - Cláusula 10)",
    itens: [
      {
        item: "Melhoria contínua",
        criterio: "Ações de melhoria implementadas sistematicamente",
      },
      {
        item: "Não conformidade e ação corretiva",
        criterio: "Tratamento de não conformidades com análise de causa raiz",
      },
    ],
  },
];

export const certificacaoONAChecklist = [
  {
    categoria: "Nível 1 - Segurança (Estrutura)",
    itens: [
      {
        item: "Liderança e Gestão",
        criterio: "Estrutura organizacional definida e documentada",
      },
      {
        item: "Gestão de Pessoas",
        criterio: "Processos de recrutamento, seleção e capacitação",
      },
      {
        item: "Gestão da Assistência",
        criterio: "Protocolos assistenciais implementados",
      },
      {
        item: "Gestão de Medicamentos",
        criterio: "Processo seguro de prescrição, dispensação e administração",
      },
      {
        item: "Gestão da Infraestrutura",
        criterio: "Manutenção preventiva e corretiva documentada",
      },
      {
        item: "Gestão de Tecnologia",
        criterio: "Equipamentos calibrados e com manutenção em dia",
      },
      {
        item: "Gestão de Suprimentos",
        criterio: "Controle de estoque e rastreabilidade",
      },
    ],
  },
  {
    categoria: "Nível 2 - Gestão Integrada (Processo)",
    itens: [
      {
        item: "Indicadores de desempenho",
        criterio: "Monitoramento sistemático de indicadores",
      },
      {
        item: "Gestão de riscos",
        criterio: "Identificação e mitigação de riscos assistenciais",
      },
      {
        item: "Cultura de segurança",
        criterio: "Notificação e análise de eventos adversos",
      },
      {
        item: "Integração de processos",
        criterio: "Processos integrados e comunicação efetiva",
      },
    ],
  },
  {
    categoria: "Nível 3 - Excelência em Gestão (Resultado)",
    itens: [
      {
        item: "Resultados assistenciais",
        criterio: "Demonstração de melhoria contínua nos resultados",
      },
      {
        item: "Satisfação de pacientes",
        criterio: "Pesquisas de satisfação com resultados positivos",
      },
      {
        item: "Benchmarking",
        criterio: "Comparação com referenciais de excelência",
      },
      {
        item: "Inovação",
        criterio: "Implementação de práticas inovadoras",
      },
    ],
  },
];

export function getChecklistByType(tipo: string) {
  switch (tipo) {
    case 'vigilancia_sanitaria':
      return vigilanciaSanitariaChecklist;
    case 'iso':
      return certificacaoISOChecklist;
    case 'ona':
      return certificacaoONAChecklist;
    default:
      return [];
  }
}
