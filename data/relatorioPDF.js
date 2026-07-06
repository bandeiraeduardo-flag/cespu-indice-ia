const PDFDocument = require("pdfkit");
const path = require("path");

const COR_FUNDO = "#2E2D2D";
const COR_LARANJA = "#EC671B";
const COR_BRANCO = "#FFFFFF";
const COR_CINZA = "#B6B5B5";

function gerarRelatorioPDF(res, resultados, config) {
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=indice-cespu-maturidade-ia.pdf");
  doc.pipe(res);

  const logoPath = path.join(__dirname, "..", "public", "img", "logo.png");

  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COR_FUNDO);
  try {
    doc.image(logoPath, 50, 60, { width: 260 });
  } catch (e) { /* logo opcional */ }

  doc.fillColor(COR_LARANJA).fontSize(12).text("GABINETE DE INOVAÇÃO PEDAGÓGICA · CESPU", 50, 180);
  doc.fillColor(COR_BRANCO).fontSize(28).font("Helvetica-Bold").text(config.titulo || "Índice CESPU de Maturidade Docente em Inteligência Artificial", 50, 210, { width: 495 });
  doc.moveDown(1);
  doc.fillColor(COR_CINZA).fontSize(11).font("Helvetica").text("Relatório executivo gerado automaticamente a partir da sessão ao vivo do Gabinete de Inovação Pedagógica.", 50, 320, { width: 495 });
  doc.fillColor(COR_CINZA).fontSize(10).text(`Gerado em: ${new Date().toLocaleString("pt-PT")}`, 50, 750);

  doc.addPage().rect(0, 0, doc.page.width, doc.page.height).fill("#FFFFFF");
  tituloSeccao(doc, "Resumo Executivo");
  corpo(doc, `Participaram ${resultados.totalParticipantes} pessoas nesta sessão` +
    (resultados.participantesEsperados ? ` (taxa de participação estimada: ${resultados.taxaParticipacao}%).` : ".") +
    ` O Índice Global de Maturidade obtido foi de ${resultados.indiceGlobal}% (média ${resultados.mediaGlobal}/5), correspondendo ao nível "${resultados.nivel.nome}".`);
  doc.moveDown(0.5);
  corpo(doc, resultados.nivel.descricao);
  doc.moveDown(1);

  subtitulo(doc, "Distribuição por níveis de maturidade");
  const dn = resultados.distribuicaoNiveis;
  linhaLista(doc, [
    `Observador: ${dn.observador || 0} participante(s)`,
    `Explorador: ${dn.explorador || 0} participante(s)`,
    `Utilizador Regular: ${dn.utilizador_regular || 0} participante(s)`,
    `Integrador: ${dn.integrador || 0} participante(s)`,
    `Líder de Inovação: ${dn.lider_inovacao || 0} participante(s)`
  ]);

  doc.moveDown(1);
  subtitulo(doc, "Resultados por Pilar (CNIPES)");
  linhaLista(doc, resultados.porPilar.map(p => `${p.nome}: média ${p.media}/5`));

  doc.addPage();
  tituloSeccao(doc, "Resultados por Eixo Analítico");
  resultados.porEixo.forEach(e => {
    subtitulo(doc, `${e.nome} — média ${e.media}/5 (n=${e.n})`);
  });

  doc.moveDown(1);
  subtitulo(doc, "Top pontos fortes");
  linhaLista(doc, resultados.insights.forcas);
  doc.moveDown(0.5);
  subtitulo(doc, "Top oportunidades de desenvolvimento");
  linhaLista(doc, resultados.insights.fragilidades);

  doc.addPage();
  tituloSeccao(doc, "Interpretação Detalhada por Pergunta");
  resultados.porPergunta.forEach(p => {
    if (!p.interpretacao) return;
    if (doc.y > 680) doc.addPage();
    doc.fillColor(COR_FUNDO).fontSize(11).font("Helvetica-Bold").text(p.texto, { width: 495 });
    doc.fillColor(COR_LARANJA).fontSize(10).font("Helvetica-Bold").text(`Média: ${p.interpretacao.media}/5 · ${p.interpretacao.banda}`);
    doc.fillColor("#333333").fontSize(9.5).font("Helvetica").text(p.interpretacao.significado, { width: 495 });
    doc.fillColor("#555555").fontSize(9).font("Helvetica-Oblique").text("Ligação ao CNIPES: " + p.interpretacao.ligacaoCNIPES, { width: 495 });
    doc.fillColor("#333333").fontSize(9.5).font("Helvetica").text("Implicações: " + p.interpretacao.implicacoes, { width: 495 });
    doc.fillColor(COR_LARANJA).fontSize(9.5).font("Helvetica-Bold").text("Recomendação: ", { continued: true }).fillColor("#333333").font("Helvetica").text(p.interpretacao.recomendacao, { width: 495 });
    doc.moveDown(0.8);
  });

  doc.addPage();
  tituloSeccao(doc, "Nuvem de Palavras — Principal Desafio Identificado");
  if (resultados.nuvemPalavras.length) {
    linhaLista(doc, resultados.nuvemPalavras.slice(0, 25).map(w => `${w.texto} (${w.contagem}x)`));
  } else {
    corpo(doc, "Ainda sem respostas suficientes na pergunta aberta.");
  }

  doc.moveDown(1);
  subtitulo(doc, "Riscos potenciais");
  linhaLista(doc, resultados.insights.riscos);
  doc.moveDown(0.5);
  subtitulo(doc, "Oportunidades de capacitação");
  linhaLista(doc, resultados.insights.oportunidades);
  doc.moveDown(0.5);
  subtitulo(doc, "Recomendações para o Gabinete de Inovação Pedagógica");
  linhaLista(doc, resultados.insights.recomendacoesGabinete);

  doc.addPage();
  tituloSeccao(doc, "Comentário Estratégico");
  corpo(doc,
    `Este diagnóstico institucional replica, à escala da sessão, a leitura central do relatório CNIPES 2026: ` +
    `a integração da IA no ensino superior avança mais depressa do que a governação que a deveria enquadrar. ` +
    `Com um índice global de ${resultados.indiceGlobal}% (nível "${resultados.nivel.nome}"), o próximo passo do Gabinete de Inovação Pedagógica ` +
    `não é apenas continuar a promover o uso da IA, mas consolidar critérios comuns de mediação humana, verificação, transparência, ` +
    `literacia afetiva e decisão baseada em evidências — os cinco critérios mínimos de maturidade institucional definidos pelo CNIPES. ` +
    `A passagem necessária é, tal como no diagnóstico nacional, da experimentação dispersa para a governação baseada em evidências.`
  );

  doc.end();
}

function tituloSeccao(doc, texto) {
  doc.fillColor(COR_LARANJA).fontSize(20).font("Helvetica-Bold").text(texto, { underline: false });
  doc.moveDown(0.8);
}

function subtitulo(doc, texto) {
  doc.fillColor(COR_FUNDO).fontSize(13).font("Helvetica-Bold").text(texto);
  doc.moveDown(0.3);
}

function corpo(doc, texto) {
  doc.fillColor("#333333").fontSize(10.5).font("Helvetica").text(texto, { width: 495 });
}

function linhaLista(doc, itens) {
  doc.fillColor("#333333").fontSize(10.5).font("Helvetica");
  itens.forEach(i => doc.text("•  " + i, { width: 495 }));
}

module.exports = { gerarRelatorioPDF };
