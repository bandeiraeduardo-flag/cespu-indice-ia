// Biblioteca de interpretação automática, ligada prioritariamente ao relatório:
// "Inteligência Artificial no Ensino Superior em Portugal - Diagnóstico Nacional para
// Governação Institucional" (CNIPES, Abril 2026)
//
// Cada eixo tem 3 bandas de leitura: frágil / emergente / consolidado.
// Cada pergunta herda a interpretação do seu eixo, combinada com o seu próprio valor médio.

const BANDAS = [
  { chave: "fragil", min: 1, max: 2.49, label: "Frágil" },
  { chave: "emergente", min: 2.5, max: 3.79, label: "Emergente" },
  { chave: "consolidado", min: 3.8, max: 5.01, label: "Consolidado" }
];

function bandaDeMedia(media) {
  return BANDAS.find(b => media >= b.min && media <= b.max) || BANDAS[0];
}

const INTERPRETACOES_EIXO = {
  literacia_epistemica: {
    fragil: {
      significado: "Este resultado sugere uma compreensão ainda limitada sobre o funcionamento e os limites da IA generativa.",
      ligacaoCNIPES: "O relatório CNIPES identifica a fragilidade epistémica como um dos riscos centrais da IA generativa: os modelos de linguagem produzem 'afirmações plausíveis, mas não verificáveis', pelo que a ausência de literacia técnica e crítica agrava a exposição institucional a este risco.",
      implicacoes: "Sem esta literacia de base, docentes e estudantes tendem a tratar respostas de IA como factos, aumentando o risco de erro não detetado em contexto académico.",
      recomendacao: "Promover sessões curtas e práticas de literacia em IA (Pilar I - Saber sobre IA), com exemplos reais de 'alucinações' e discussão sobre a natureza probabilística dos modelos."
    },
    emergente: {
      significado: "Existe já alguma compreensão sobre a lógica da IA, mas de forma pouco consolidada e desigual entre participantes.",
      ligacaoCNIPES: "Este padrão é coerente com o diagnóstico nacional do CNIPES, que identifica 'princípios amadurecidos versus procedimentos inconsistentes' como um dos quatro desequilíbrios estruturais do sistema português.",
      implicacoes: "A literacia parcial pode gerar confiança excessiva em alguns contextos e desconfiança injustificada noutros, dificultando critérios comuns de uso.",
      recomendacao: "Consolidar a literacia em IA através de comunidades de prática e partilha estruturada de casos, em vez de formação pontual e isolada."
    },
    consolidado: {
      significado: "Os participantes revelam uma compreensão robusta da lógica, limites e riscos da IA generativa.",
      ligacaoCNIPES: "Este nível aproxima a instituição do topo dos Três Pilares definidos pelo CNIPES ('Saber sobre IA'), acima da média nacional, onde a formalização da literacia institucional continua incompleta.",
      implicacoes: "Esta base sólida permite avançar com mais confiança para práticas pedagógicas mais ambiciosas (Pilar II), sem comprometer o rigor epistémico.",
      recomendacao: "Transformar este conhecimento em mentoria interna: participantes mais literados podem apoiar a formação de pares e a criação de materiais institucionais."
    }
  },
  verificacao_praticas: {
    fragil: {
      significado: "As rotinas de verificação de resultados gerados por IA são ainda escassas ou informais.",
      ligacaoCNIPES: "O CNIPES aponta a verificação insuficiente como o segundo grande desequilíbrio do sistema: 'a adoção cresce; as rotinas institucionais de validação ainda não cresceram ao mesmo ritmo'.",
      implicacoes: "Sem verificação sistemática, aumenta o risco de erros, enviesamentos ou conteúdo fabricado entrarem em materiais pedagógicos e avaliações sem deteção.",
      recomendacao: "Instituir um pequeno protocolo prático de verificação (ex.: checklist de 3 perguntas antes de usar um resultado de IA) e torná-lo visível e partilhado."
    },
    emergente: {
      significado: "Há já práticas de verificação, mas aplicadas de forma pontual e não sistemática.",
      ligacaoCNIPES: "Este é exatamente o ponto de maior desfasamento identificado no ecossistema português: a adoção existe, mas 'a sua estabilização institucional é ainda minoritária'.",
      implicacoes: "A verificação inconsistente cria uma falsa sensação de segurança coletiva, ainda que práticas individuais de cuidado já existam.",
      recomendacao: "Tornar a verificação um critério explícito e partilhado (não apenas individual), incluído em orientações de unidade curricular ou de curso."
    },
    consolidado: {
      significado: "A verificação de resultados de IA é já uma prática consistente entre os participantes.",
      ligacaoCNIPES: "Este padrão coloca a instituição alinhada com o critério mínimo de maturidade 'Verificação' definido pelo CNIPES como central para qualquer resposta institucional robusta.",
      implicacoes: "A instituição está mais protegida do risco epistémico identificado pelo relatório como o principal risco dos sistemas generativos.",
      recomendacao: "Documentar e formalizar estas boas práticas de verificação como orientação institucional, para que não dependam apenas da iniciativa individual."
    }
  },
  praticas_pedagogicas: {
    fragil: {
      significado: "A integração pedagógica da IA no ensino é ainda pouco explorada ou pouco intencional.",
      ligacaoCNIPES: "A revisão sistemática de 191 estudos do CNIPES mostra que a IA funciona melhor como 'amplificador cognitivo' quando integrada em rotinas pedagógicas bem estruturadas - algo que este resultado sugere estar pouco desenvolvido.",
      implicacoes: "Sem desenho pedagógico intencional, a IA tende a ser usada de forma acidental ou apenas administrativa, perdendo potencial de aprendizagem ativa.",
      recomendacao: "Iniciar com atividades piloto simples que integrem IA em tarefas de aprendizagem ativa (ex.: debate crítico sobre um resultado de IA), com apoio do Gabinete de Inovação Pedagógica."
    },
    emergente: {
      significado: "Existem já práticas pedagógicas com IA, mas concentradas em usos operacionais (preparação de materiais, eficiência) mais do que em usos transformadores.",
      ligacaoCNIPES: "Este resultado é coerente com o diagnóstico CNIPES: 'forte experimentação, mas ainda reduzida consolidação institucional' na integração pedagógica da IA.",
      implicacoes: "Há espaço para evoluir de um uso instrumental da IA para usos mais ricos (interpretativo, reflexivo, criativo), conforme os modos de interação descritos no relatório.",
      recomendacao: "Redesenhar uma ou duas atividades letivas por semestre para explorar a IA em modo interpretativo ou criativo, e não apenas operativo."
    },
    consolidado: {
      significado: "A IA está bem integrada em práticas pedagógicas diversificadas e intencionais.",
      ligacaoCNIPES: "Este nível de maturidade pedagógica corresponde ao que o CNIPES identifica como uso pedagogicamente rico, indo além da automatização para a reformulação da aprendizagem.",
      implicacoes: "A instituição está bem posicionada para consolidar estas práticas em critérios partilhados e mensuráveis.",
      recomendacao: "Sistematizar e documentar estas práticas como estudos de caso internos, alimentando uma futura partilha institucional de boas práticas."
    }
  },
  formacao_docente: {
    fragil: {
      significado: "A formação e o apoio institucional para o uso pedagógico da IA são ainda escassos ou pouco acedidos.",
      ligacaoCNIPES: "O CNIPES identifica a formação de docentes como prioridade imediata a nível nacional (55,1% de adoção), mas ainda desigual e frequentemente pouco estruturada.",
      implicacoes: "Sem formação estruturada, a adoção de IA tende a depender de esforço individual, criando desigualdades entre docentes e cursos.",
      recomendacao: "Criar um plano mínimo de capacitação em IA, mesmo que ligeiro, com sessões regulares e recursos partilhados pelo Gabinete de Inovação Pedagógica."
    },
    emergente: {
      significado: "Existe alguma formação e apoio institucional, mas de forma pontual ou dependente de iniciativa individual.",
      ligacaoCNIPES: "Este padrão espelha o retrato nacional: a formação dirigida a docentes surge como o item com maior nível de adoção, mas a consolidação de comunidades de prática permanece frágil.",
      implicacoes: "Sem consolidação, o conhecimento adquirido tende a ficar disperso e pouco reaproveitado institucionalmente.",
      recomendacao: "Transformar iniciativas pontuais numa comunidade de prática regular, com encontros periódicos e recursos partilhados."
    },
    consolidado: {
      significado: "Os participantes sentem-se bem apoiados e formados para integrar IA na sua prática docente.",
      ligacaoCNIPES: "Este nível ultrapassa a média nacional identificada pelo CNIPES e aproxima a instituição de um modelo de integração estratégica, como o observado em universidades de referência internacional.",
      implicacoes: "Esta base de capacitação sólida é um ativo institucional que pode ser mobilizado para apoiar outros cursos ou unidades menos maduras.",
      recomendacao: "Formalizar mentores internos de IA e considerar partilhar este modelo de capacitação com outras unidades da CESPU."
    }
  },
  responsabilidade: {
    fragil: {
      significado: "Os limites éticos e de responsabilidade sobre o uso da IA são ainda pouco claros para os participantes.",
      ligacaoCNIPES: "O CNIPES alerta que 'a automação sem interpretação é abdicação': quando não há clareza sobre quem responde pelos resultados da IA, o risco institucional aumenta.",
      implicacoes: "A ausência de limites claros aumenta a exposição a erros de responsabilidade, como os casos internacionais documentados no relatório.",
      recomendacao: "Definir, de forma simples e prática, três a cinco situações em que o uso de IA não é apropriado sem supervisão humana explícita."
    },
    emergente: {
      significado: "Há alguma consciência sobre limites éticos, mas ainda pouco formalizada em regras partilhadas.",
      ligacaoCNIPES: "Este resultado é coerente com o retrato nacional: apenas 14,7% das instituições portuguesas têm políticas de IA já em prática, e 42,6% não dispõem ainda de qualquer enquadramento formal.",
      implicacoes: "Sem regras partilhadas, a responsabilidade tende a recair apenas sobre o indivíduo, o que é frágil e desigual.",
      recomendacao: "Elevar esta discussão ao nível de curso ou departamento, transformando critérios individuais em orientações coletivas mínimas."
    },
    consolidado: {
      significado: "Os participantes demonstram clareza sobre limites éticos e responsabilidade partilhada no uso da IA.",
      ligacaoCNIPES: "Este resultado aproxima a instituição do critério mínimo de maturidade 'Mediação Humana' definido pelo CNIPES como central para qualquer resposta institucional robusta.",
      implicacoes: "Esta clareza reduz significativamente o risco de incidentes de responsabilidade como os identificados no relatório.",
      recomendacao: "Documentar estas boas práticas como orientação formal, contribuindo para preencher a lacuna nacional de formalização identificada pelo CNIPES."
    }
  },
  impactos_emocionais: {
    fragil: {
      significado: "Os participantes reportam pouca reflexão ou consciência sobre os efeitos emocionais e culturais da IA na sua prática.",
      ligacaoCNIPES: "O CNIPES sublinha que a literacia em IA deve ir 'além da cognição e abranger a emoção', alertando para riscos de ansiedade, dependência e erosão da autonomia.",
      implicacoes: "Sem esta reflexão, os efeitos emocionais da IA (pressão, ansiedade, perda de autoconfiança) tendem a ficar invisíveis até se tornarem problemáticos.",
      recomendacao: "Incluir um momento de reflexão coletiva sobre o impacto emocional da IA nas rotinas de formação docente, e não apenas os aspetos técnicos."
    },
    emergente: {
      significado: "Existe alguma consciência dos impactos emocionais da IA, mas ainda pouco trabalhada institucionalmente.",
      ligacaoCNIPES: "Este padrão está alinhado com o alerta do CNIPES sobre a 'fadiga da IA' e a sobreestimulação, fenómenos ainda emergentes e pouco enquadrados na maioria das instituições.",
      implicacoes: "A ausência de espaço estruturado para esta reflexão pode acumular tensão silenciosa entre docentes e estudantes.",
      recomendacao: "Criar momentos regulares, e não apenas técnicos, de partilha sobre como a IA está a afetar motivação, autonomia e bem-estar na comunidade académica."
    },
    consolidado: {
      significado: "Os participantes demonstram consciência madura sobre os efeitos emocionais e culturais da IA na aprendizagem e no ensino.",
      ligacaoCNIPES: "Este resultado corresponde ao critério de maturidade 'Literacia Afetiva' definido pelo CNIPES, um dos cinco critérios mínimos para a resposta institucional.",
      implicacoes: "Esta maturidade protege a instituição da erosão silenciosa do julgamento e da presença intelectual alertada pelo relatório.",
      recomendacao: "Partilhar esta prática reflexiva como modelo para outras unidades orgânicas, reforçando o Pilar III - Ser sem IA."
    }
  },
  governacao: {
    fragil: {
      significado: "O conhecimento sobre políticas e governação institucional da IA é ainda muito limitado entre os participantes.",
      ligacaoCNIPES: "A nível nacional, 42,6% das instituições não dispõem de qualquer política de IA, e apenas 14,7% têm políticas já em prática - este resultado sugere uma situação semelhante ou mais frágil.",
      implicacoes: "Sem visibilidade sobre a governação, os participantes tendem a agir por iniciativa individual, aumentando a fragmentação e o risco institucional.",
      recomendacao: "Comunicar de forma simples e acessível o que já existe, ou está em elaboração, em termos de política de IA, mesmo que ainda incompleta."
    },
    emergente: {
      significado: "Existe alguma consciência sobre a governação institucional da IA, mas de forma parcial ou incerta.",
      ligacaoCNIPES: "Este resultado reflete o padrão nacional identificado pelo CNIPES: 42,6% das instituições têm políticas 'em elaboração', um estado de consolidação inacabada.",
      implicacoes: "A incerteza sobre regras institucionais pode gerar tanto excesso de cautela como uso descontrolado, consoante o participante.",
      recomendacao: "Envolver os participantes na fase de elaboração das políticas institucionais, reforçando o sentido de pertença e clareza coletiva."
    },
    consolidado: {
      significado: "Os participantes têm boa consciência da governação institucional da IA e sentem-na relativamente clara.",
      ligacaoCNIPES: "Este nível coloca a instituição à frente da média nacional, onde apenas 14,7% das instituições portuguesas reportam políticas de IA já em prática.",
      implicacoes: "Esta clareza reduz o desfasamento entre adoção e governação identificado pelo CNIPES como o principal problema estrutural do sistema português.",
      recomendacao: "Consolidar e divulgar formalmente esta governação, replicando o modelo junto de outras unidades da CESPU."
    }
  }
};

const NIVEIS_MATURIDADE = [
  { min: 0, max: 20, chave: "observador", nome: "Observador",
    descricao: "A instituição está numa fase inicial de contacto com a IA. O diagnóstico CNIPES situa este perfil antes da fase de 'aproximação e compreensão' descrita no AI Maturity Model referenciado pelo relatório: há curiosidade, mas pouca prática consolidada." },
  { min: 20, max: 40, chave: "explorador", nome: "Explorador",
    descricao: "Há experimentação ativa mas dispersa, tal como o CNIPES descreve o ecossistema português: 'projetos-piloto abundantes vs. evidência longitudinal frágil'. É o momento de começar a organizar o que já se faz." },
  { min: 40, max: 60, chave: "utilizador_regular", nome: "Utilizador Regular",
    descricao: "O uso de IA é já frequente, mas a formalização institucional tende a estar atrasada, replicando o desfasamento nacional identificado pelo CNIPES entre adoção (até 52,9% no ensino) e políticas em prática (apenas 14,7%)." },
  { min: 60, max: 80, chave: "integrador", nome: "Integrador",
    descricao: "A IA está integrada de forma consistente nas práticas pedagógicas e há sinais claros de mediação humana e verificação. Este perfil aproxima-se do nível 'Operational' do AI Maturity Model da Jisc citado pelo CNIPES." },
  { min: 80, max: 101, chave: "lider_inovacao", nome: "Líder de Inovação",
    descricao: "A instituição (ou o grupo de participantes) demonstra maturidade avançada nos três Pilares do CNIPES, com literacia, prática pedagógica e autorregulação consolidadas - um patamar ainda raro no panorama nacional." }
];

function nivelDeIndice(percentagem) {
  return NIVEIS_MATURIDADE.find(n => percentagem >= n.min && percentagem < n.max) || NIVEIS_MATURIDADE[NIVEIS_MATURIDADE.length - 1];
}

function interpretarPergunta(eixo, media) {
  const banda = bandaDeMedia(media);
  const bloco = (INTERPRETACOES_EIXO[eixo] && INTERPRETACOES_EIXO[eixo][banda.chave]) || null;
  if (!bloco) return null;
  return {
    banda: banda.label,
    media: Number(media.toFixed(2)),
    ...bloco
  };
}

module.exports = {
  BANDAS,
  bandaDeMedia,
  INTERPRETACOES_EIXO,
  NIVEIS_MATURIDADE,
  nivelDeIndice,
  interpretarPergunta
};
