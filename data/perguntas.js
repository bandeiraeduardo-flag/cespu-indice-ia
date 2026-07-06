// Banco de perguntas do "Índice CESPU de Maturidade Docente em Inteligência Artificial"
// Construído com base prioritária no relatório:
// "Inteligência Artificial no Ensino Superior em Portugal - Diagnóstico Nacional para
// Governação Institucional" (CNIPES, Abril 2026)
//
// Estrutura: 3 Pilares (Saber sobre IA / Fazer com IA / Ser sem IA), 5 Critérios mínimos
// de maturidade (mediação humana, verificação, transparência, literacia afetiva,
// decisão baseada em evidências) e 7 Eixos analíticos da Fase 2 do CNIPES.

const ESCALA_PADRAO = {
  tipo: "likert5",
  labels: ["Nunca", "Raramente", "Ocasionalmente", "Frequentemente", "Sempre"]
};

const DIMENSOES = {
  pilares: {
    I: "Saber sobre IA",
    II: "Fazer com IA",
    III: "Ser sem IA"
  },
  criterios: {
    mediacao_humana: "Mediação humana",
    verificacao: "Verificação",
    transparencia: "Transparência",
    literacia_afetiva: "Literacia afetiva",
    decisao_evidencia: "Decisão baseada em evidências"
  },
  eixos: {
    literacia_epistemica: "Literacia em IA e consciência epistémica",
    verificacao_praticas: "Práticas de verificação ética e epistémica",
    praticas_pedagogicas: "Práticas pedagógicas e integração criativa",
    formacao_docente: "Formação de docentes e capacitação",
    responsabilidade: "Limites éticos e responsabilidade partilhada",
    impactos_emocionais: "Impactos emocionais e culturais",
    governacao: "Governação institucional e coordenação"
  }
};

const PERGUNTAS_BASE = [
  { id: "p01", pilar: "I", eixo: "literacia_epistemica", criterio: "decisao_evidencia",
    texto: "Compreendo tecnicamente como funcionam os modelos de IA generativa que utilizo (ex.: ChatGPT, Copilot, Gemini)." },
  { id: "p02", pilar: "I", eixo: "literacia_epistemica", criterio: "verificacao",
    texto: "Reconheço quando uma resposta gerada por IA pode estar errada ou ser inventada ('alucinação')." },
  { id: "p03", pilar: "I", eixo: "literacia_epistemica", criterio: "verificacao",
    texto: "Sei explicar a diferença entre uma resposta de IA plausível e uma resposta verdadeira." },
  { id: "p04", pilar: "I", eixo: "literacia_epistemica", criterio: "decisao_evidencia",
    texto: "Atualizo os meus conhecimentos sobre novas ferramentas e limitações da IA." },
  { id: "p05", pilar: "I", eixo: "literacia_epistemica", criterio: "mediacao_humana",
    texto: "Discuto com colegas os riscos e limites da IA generativa no ensino superior." },

  { id: "p06", pilar: "I", eixo: "verificacao_praticas", criterio: "verificacao",
    texto: "Verifico as fontes ou factos apresentados por ferramentas de IA antes de os utilizar em contexto académico." },
  { id: "p07", pilar: "I", eixo: "verificacao_praticas", criterio: "verificacao",
    texto: "Utilizo critérios claros para validar se um conteúdo gerado por IA pode ser usado nas minhas aulas ou trabalhos." },
  { id: "p08", pilar: "I", eixo: "verificacao_praticas", criterio: "verificacao",
    texto: "Alerto os estudantes para a necessidade de verificar resultados de IA." },
  { id: "p09", pilar: "I", eixo: "verificacao_praticas", criterio: "transparencia",
    texto: "Declaro ou torno visível quando um conteúdo que produzo teve apoio de IA." },
  { id: "p10", pilar: "I", eixo: "verificacao_praticas", criterio: "transparencia",
    texto: "Sinto-me confortável a identificar limites de autoria quando uso IA em trabalhos académicos." },

  { id: "p11", pilar: "II", eixo: "praticas_pedagogicas", criterio: "mediacao_humana",
    texto: "Utilizo IA para preparar materiais pedagógicos (planos de aula, exercícios, apresentações)." },
  { id: "p12", pilar: "II", eixo: "praticas_pedagogicas", criterio: "mediacao_humana",
    texto: "Uso IA para dar feedback mais rápido ou mais rico aos estudantes." },
  { id: "p13", pilar: "II", eixo: "praticas_pedagogicas", criterio: "decisao_evidencia",
    texto: "Desenho atividades que exigem que os estudantes usem IA de forma crítica, e não apenas para obter respostas." },
  { id: "p14", pilar: "II", eixo: "praticas_pedagogicas", criterio: "mediacao_humana",
    texto: "Combino o uso de IA com métodos de aprendizagem ativa (ex.: discussão, resolução de problemas em grupo)." },
  { id: "p15", pilar: "II", eixo: "praticas_pedagogicas", criterio: "verificacao",
    texto: "Uso IA para apoiar a avaliação dos estudantes (correção, geração de perguntas)." },
  { id: "p16", pilar: "II", eixo: "praticas_pedagogicas", criterio: "literacia_afetiva",
    texto: "Reflito com os estudantes sobre quando a IA ajuda e quando atrapalha a aprendizagem." },

  { id: "p17", pilar: "II", eixo: "formacao_docente", criterio: "decisao_evidencia",
    texto: "Participei em formação institucional sobre uso pedagógico de IA nos últimos 12 meses." },
  { id: "p18", pilar: "II", eixo: "formacao_docente", criterio: "decisao_evidencia",
    texto: "Sinto que tenho apoio da minha instituição para explorar IA na docência." },
  { id: "p19", pilar: "II", eixo: "formacao_docente", criterio: "mediacao_humana",
    texto: "Partilho práticas e materiais sobre IA com outros docentes." },
  { id: "p20", pilar: "II", eixo: "formacao_docente", criterio: "decisao_evidencia",
    texto: "Procuro formação ou recursos por iniciativa própria quando sinto lacunas no uso de IA." },

  { id: "p21", pilar: "III", eixo: "responsabilidade", criterio: "mediacao_humana",
    texto: "Sei identificar situações em que não devo usar IA (ex.: decisões de avaliação final, casos sensíveis)." },
  { id: "p22", pilar: "III", eixo: "responsabilidade", criterio: "mediacao_humana",
    texto: "Assumo responsabilidade pelos erros ou enviesamentos de conteúdos gerados por IA que utilizo." },
  { id: "p23", pilar: "III", eixo: "responsabilidade", criterio: "transparencia",
    texto: "Sinto que existem regras claras, na minha instituição, sobre o uso responsável de IA." },
  { id: "p24", pilar: "III", eixo: "responsabilidade", criterio: "transparencia",
    texto: "Considero as implicações éticas (equidade, privacidade, autoria) antes de adotar uma nova ferramenta de IA." },

  { id: "p25", pilar: "III", eixo: "impactos_emocionais", criterio: "literacia_afetiva",
    texto: "Sinto ansiedade ou pressão relacionada com o ritmo de mudança trazido pela IA no ensino." },
  { id: "p26", pilar: "III", eixo: "impactos_emocionais", criterio: "literacia_afetiva",
    texto: "Preocupo-me com o efeito da IA na autonomia e no pensamento crítico dos meus estudantes." },
  { id: "p27", pilar: "III", eixo: "impactos_emocionais", criterio: "literacia_afetiva",
    texto: "Reservo, conscientemente, momentos de trabalho sem apoio de IA para preservar o meu próprio julgamento e criatividade." },

  { id: "p28", pilar: "III", eixo: "governacao", criterio: "decisao_evidencia",
    texto: "Conheço a existência (ou ausência) de uma política institucional sobre uso de IA na minha instituição." },
  { id: "p29", pilar: "III", eixo: "governacao", criterio: "decisao_evidencia",
    texto: "Considero que a minha instituição está a acompanhar, com regras claras, o ritmo de adoção de IA por docentes e estudantes." },
  { id: "p30", pilar: "III", eixo: "governacao", criterio: "mediacao_humana",
    texto: "Participaria ativamente numa comunidade de prática institucional sobre IA no ensino." }
].map((p, idx) => ({
  ...p,
  tipo: "likert",
  escala: ESCALA_PADRAO,
  ordem: idx + 1,
  ativa: true
}));

const PERGUNTA_ABERTA = {
  id: "aberta01",
  tipo: "aberta",
  ordem: 31,
  ativa: true,
  obrigatoria: true,
  texto: "Qual considera ser o principal desafio para integrar IA na sua prática docente?"
};

function perguntasIniciais() {
  return {
    likert: JSON.parse(JSON.stringify(PERGUNTAS_BASE)),
    aberta: JSON.parse(JSON.stringify(PERGUNTA_ABERTA))
  };
}

module.exports = { DIMENSOES, ESCALA_PADRAO, perguntasIniciais };
