const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { perguntasIniciais, DIMENSOES } = require("./perguntas");
const { interpretarPergunta, nivelDeIndice } = require("./interpretacoes");
const STOPWORDS = require("./stopwords");

const PERSIST_PATH = path.join(__dirname, "sessao-atual.json");

function estadoInicial() {
  const { likert, aberta } = perguntasIniciais();
  return {
    config: {
      titulo: "Índice CESPU de Maturidade Docente em Inteligência Artificial",
      senhaAdmin: process.env.ADMIN_PASSWORD || "cespu2026",
      participantesEsperados: 40,
      sessaoAtiva: true,
      criadoEm: new Date().toISOString()
    },
    perguntasLikert: likert,
    perguntaAberta: aberta,
    respostas: [],
    apresentador: {
      destaque: null,
      modo: "dashboard"
    }
  };
}

let estado = carregarOuIniciar();

function carregarOuIniciar() {
  try {
    if (fs.existsSync(PERSIST_PATH)) {
      const raw = fs.readFileSync(PERSIST_PATH, "utf-8");
      const dados = JSON.parse(raw);
      if (dados && dados.perguntasLikert && dados.respostas) {
        return dados;
      }
    }
  } catch (e) {
    console.warn("Nao foi possivel carregar sessao persistida, a iniciar nova sessao.", e.message);
  }
  return estadoInicial();
}

function persistir() {
  try {
    fs.writeFileSync(PERSIST_PATH, JSON.stringify(estado, null, 2), "utf-8");
  } catch (e) {
    console.warn("Falha ao persistir sessao:", e.message);
  }
}

function getPerguntasPublicas() {
  const likert = estado.perguntasLikert
    .filter(p => p.ativa)
    .sort((a, b) => a.ordem - b.ordem);
  return {
    likert,
    aberta: estado.perguntaAberta.ativa ? estado.perguntaAberta : null,
    titulo: estado.config.titulo
  };
}

function getTodasPerguntasAdmin() {
  return {
    likert: [...estado.perguntasLikert].sort((a, b) => a.ordem - b.ordem),
    aberta: estado.perguntaAberta,
    dimensoes: DIMENSOES
  };
}

function proximaOrdem() {
  const ordens = estado.perguntasLikert.map(p => p.ordem);
  return ordens.length ? Math.max(...ordens) + 1 : 1;
}

function criarPergunta(dados) {
  const nova = {
    id: "p_" + uuidv4().slice(0, 8),
    pilar: dados.pilar || "II",
    eixo: dados.eixo || "praticas_pedagogicas",
    criterio: dados.criterio || "mediacao_humana",
    texto: dados.texto || "Nova pergunta",
    tipo: "likert",
    escala: {
      tipo: "likert5",
      labels: dados.labels && dados.labels.length === 5
        ? dados.labels
        : ["Nunca", "Raramente", "Ocasionalmente", "Frequentemente", "Sempre"]
    },
    ordem: proximaOrdem(),
    ativa: dados.ativa !== undefined ? dados.ativa : true
  };
  estado.perguntasLikert.push(nova);
  persistir();
  return nova;
}

function atualizarPergunta(id, dados) {
  const p = estado.perguntasLikert.find(q => q.id === id);
  if (!p) return null;
  Object.assign(p, {
    texto: dados.texto ?? p.texto,
    pilar: dados.pilar ?? p.pilar,
    eixo: dados.eixo ?? p.eixo,
    criterio: dados.criterio ?? p.criterio,
    ativa: dados.ativa ?? p.ativa
  });
  if (dados.labels && dados.labels.length === 5) {
    p.escala.labels = dados.labels;
  }
  persistir();
  return p;
}

function eliminarPergunta(id) {
  const antes = estado.perguntasLikert.length;
  estado.perguntasLikert = estado.perguntasLikert.filter(q => q.id !== id);
  persistir();
  return estado.perguntasLikert.length < antes;
}

function duplicarPergunta(id) {
  const p = estado.perguntasLikert.find(q => q.id === id);
  if (!p) return null;
  const copia = {
    ...JSON.parse(JSON.stringify(p)),
    id: "p_" + uuidv4().slice(0, 8),
    texto: p.texto + " (copia)",
    ordem: proximaOrdem()
  };
  estado.perguntasLikert.push(copia);
  persistir();
  return copia;
}

function alternarAtivaPergunta(id) {
  const p = estado.perguntasLikert.find(q => q.id === id);
  if (!p) return null;
  p.ativa = !p.ativa;
  persistir();
  return p;
}

function atualizarPerguntaAberta(dados) {
  Object.assign(estado.perguntaAberta, {
    texto: dados.texto ?? estado.perguntaAberta.texto,
    ativa: dados.ativa ?? estado.perguntaAberta.ativa
  });
  persistir();
  return estado.perguntaAberta;
}

function criarDimensao(chave, nomeEixo) {
  const chaveNormalizada = chave.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  DIMENSOES.eixos[chaveNormalizada] = nomeEixo;
  return { chave: chaveNormalizada, nome: nomeEixo };
}

function getConfigPublica() {
  return {
    titulo: estado.config.titulo,
    sessaoAtiva: estado.config.sessaoAtiva,
    participantesEsperados: estado.config.participantesEsperados
  };
}

function atualizarConfig(dados) {
  Object.assign(estado.config, {
    titulo: dados.titulo ?? estado.config.titulo,
    participantesEsperados: dados.participantesEsperados ?? estado.config.participantesEsperados,
    sessaoAtiva: dados.sessaoAtiva ?? estado.config.sessaoAtiva
  });
  persistir();
  return getConfigPublica();
}

function validarSenhaAdmin(senha) {
  return senha && senha === estado.config.senhaAdmin;
}

function alterarSenhaAdmin(novaSenha) {
  if (novaSenha && novaSenha.length >= 4) {
    estado.config.senhaAdmin = novaSenha;
    persistir();
    return true;
  }
  return false;
}

function jaRespondeu(participanteId) {
  return estado.respostas.some(r => r.participanteId === participanteId);
}

function registrarResposta(participanteId, valores, textoAberto) {
  if (!participanteId) participanteId = uuidv4();
  if (jaRespondeu(participanteId)) {
    return { ok: false, motivo: "ja_respondeu" };
  }
  const registo = {
    participanteId,
    valores: valores || {},
    aberta: (textoAberto || "").trim().slice(0, 500),
    criadoEm: new Date().toISOString()
  };
  estado.respostas.push(registo);
  persistir();
  return { ok: true, registo };
}

function totalRespostas() {
  return estado.respostas.length;
}

function resetarSessao({ manterPerguntas = true } = {}) {
  const perguntasLikert = manterPerguntas ? estado.perguntasLikert : perguntasIniciais().likert;
  const perguntaAberta = manterPerguntas ? estado.perguntaAberta : perguntasIniciais().aberta;
  estado = {
    ...estadoInicial(),
    perguntasLikert,
    perguntaAberta,
    config: { ...estado.config, criadoEm: new Date().toISOString() }
  };
  persistir();
}

function exportarDadosBrutos() {
  return JSON.parse(JSON.stringify(estado));
}

function getEstadoApresentador() {
  return estado.apresentador;
}

function atualizarApresentador(dados) {
  Object.assign(estado.apresentador, {
    destaque: dados.destaque !== undefined ? dados.destaque : estado.apresentador.destaque,
    modo: dados.modo || estado.apresentador.modo
  });
  persistir();
  return estado.apresentador;
}

function mediaDeArray(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calcularNuvemPalavras() {
  const contagem = {};
  for (const r of estado.respostas) {
    if (!r.aberta) continue;
    const palavras = r.aberta
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 4 && !STOPWORDS.has(w));
    for (const w of palavras) {
      contagem[w] = (contagem[w] || 0) + 1;
    }
  }
  return Object.entries(contagem)
    .map(([texto, contagemN]) => ({ texto, contagem: contagemN }))
    .sort((a, b) => b.contagem - a.contagem)
    .slice(0, 60);
}

function calcularResultados() {
  const perguntasAtivas = estado.perguntasLikert.filter(p => p.ativa);
  const totalParticipantes = estado.respostas.length;
  const taxaParticipacao = estado.config.participantesEsperados
    ? Math.min(100, Math.round((totalParticipantes / estado.config.participantesEsperados) * 100))
    : null;

  const porPergunta = perguntasAtivas.map(p => {
    const valores = estado.respostas
      .map(r => r.valores[p.id])
      .filter(v => typeof v === "number" && v >= 1 && v <= 5);
    const media = mediaDeArray(valores);
    return {
      id: p.id,
      texto: p.texto,
      pilar: p.pilar,
      eixo: p.eixo,
      criterio: p.criterio,
      n: valores.length,
      media: Number(media.toFixed(2)),
      interpretacao: valores.length ? interpretarPergunta(p.eixo, media) : null
    };
  });

  const eixosUnicos = [...new Set(perguntasAtivas.map(p => p.eixo))];
  const porEixo = eixosUnicos.map(eixo => {
    const perguntasDoEixo = porPergunta.filter(p => p.eixo === eixo);
    const valoresValidos = perguntasDoEixo.filter(p => p.n > 0).map(p => p.media);
    const media = mediaDeArray(valoresValidos);
    return {
      eixo,
      nome: (DIMENSOES.eixos[eixo]) || eixo,
      media: Number(media.toFixed(2)),
      n: perguntasDoEixo.reduce((acc, p) => acc + p.n, 0)
    };
  }).sort((a, b) => b.media - a.media);

  const pilaresUnicos = ["I", "II", "III"];
  const porPilar = pilaresUnicos.map(pilar => {
    const perguntasDoPilar = porPergunta.filter(p => p.pilar === pilar && p.n > 0);
    const media = mediaDeArray(perguntasDoPilar.map(p => p.media));
    return {
      pilar,
      nome: DIMENSOES.pilares[pilar],
      media: Number(media.toFixed(2))
    };
  });

  const criteriosUnicos = Object.keys(DIMENSOES.criterios);
  const porCriterio = criteriosUnicos.map(criterio => {
    const perguntasDoCriterio = porPergunta.filter(p => p.criterio === criterio && p.n > 0);
    const media = mediaDeArray(perguntasDoCriterio.map(p => p.media));
    return {
      criterio,
      nome: DIMENSOES.criterios[criterio],
      media: Number(media.toFixed(2))
    };
  });

  const mediasValidas = porPergunta.filter(p => p.n > 0).map(p => p.media);
  const mediaGlobal = mediaDeArray(mediasValidas);
  const indiceGlobal = mediasValidas.length ? Math.round(((mediaGlobal - 1) / 4) * 100) : 0;
  const nivel = nivelDeIndice(indiceGlobal);

  const distribuicaoNiveis = { observador: 0, explorador: 0, utilizador_regular: 0, integrador: 0, lider_inovacao: 0 };
  for (const r of estado.respostas) {
    const valoresParticipante = Object.values(r.valores).filter(v => typeof v === "number");
    if (!valoresParticipante.length) continue;
    const mediaParticipante = mediaDeArray(valoresParticipante);
    const pctParticipante = Math.round(((mediaParticipante - 1) / 4) * 100);
    const nivelParticipante = nivelDeIndice(pctParticipante);
    distribuicaoNiveis[nivelParticipante.chave] = (distribuicaoNiveis[nivelParticipante.chave] || 0) + 1;
  }

  const eixosComDados = porEixo.filter(e => e.n > 0);
  const topForcas = eixosComDados.slice(0, 3);
  const topOportunidades = [...eixosComDados].sort((a, b) => a.media - b.media).slice(0, 3);

  const insights = {
    forcas: topForcas.map(e => `${e.nome} (média ${e.media}/5)`),
    fragilidades: topOportunidades.map(e => `${e.nome} (média ${e.media}/5)`),
    riscos: mediaGlobal > 0 && mediaGlobal < 2.5
      ? ["Risco epistémico elevado: uso pouco mediado e pouco verificado da IA, tal como alertado pelo CNIPES para o ecossistema nacional."]
      : ["Risco de desfasamento entre prática e governação, replicando o padrão nacional identificado pelo CNIPES (adoção acima de 50% no ensino vs. apenas 14,7% de políticas em prática)."],
    oportunidades: ["Criar uma comunidade de prática interna de IA no Gabinete de Inovação Pedagógica, tal como sugerido pela Plataforma de Práticas Pedagógicas de IA proposta pelo CNIPES."],
    recomendacoesGabinete: [
      "Usar os eixos mais fracos identificados nesta sessão como prioridade dos próximos workshops.",
      "Formalizar, mesmo que de forma leve, orientações mínimas sobre verificação e transparência no uso de IA.",
      "Repetir este diagnóstico periodicamente para acompanhar a evolução da maturidade ao longo do tempo."
    ]
  };

  return {
    totalParticipantes,
    participantesEsperados: estado.config.participantesEsperados,
    taxaParticipacao,
    indiceGlobal,
    nivel,
    mediaGlobal: Number(mediaGlobal.toFixed(2)),
    porPergunta,
    porEixo,
    porPilar,
    porCriterio,
    distribuicaoNiveis,
    nuvemPalavras: calcularNuvemPalavras(),
    insights,
    atualizadoEm: new Date().toISOString()
  };
}

module.exports = {
  getPerguntasPublicas,
  getTodasPerguntasAdmin,
  criarPergunta,
  atualizarPergunta,
  eliminarPergunta,
  duplicarPergunta,
  alternarAtivaPergunta,
  atualizarPerguntaAberta,
  criarDimensao,
  getConfigPublica,
  atualizarConfig,
  validarSenhaAdmin,
  alterarSenhaAdmin,
  jaRespondeu,
  registrarResposta,
  totalRespostas,
  resetarSessao,
  exportarDadosBrutos,
  getEstadoApresentador,
  atualizarApresentador,
  calcularResultados,
  DIMENSOES
};
