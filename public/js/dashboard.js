let graficoRadar, graficoNiveis;

const CORES_WORDCLOUD = ["#EC671B", "#FFFFFF", "#B6B5B5", "#F2A265"];

// Quebra um texto longo em várias linhas (sem cortar palavras), para uso
// nos rótulos do radar (pointLabels aceita um array = uma linha por item).
function quebrarRotulo(texto, maxCaracteresPorLinha = 16) {
  const palavras = texto.split(' ');
  const linhas = [];
  let linhaAtual = '';
  palavras.forEach(palavra => {
    const tentativa = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;
    if (tentativa.length > maxCaracteresPorLinha && linhaAtual) {
      linhas.push(linhaAtual);
      linhaAtual = palavra;
    } else {
      linhaAtual = tentativa;
    }
  });
  if (linhaAtual) linhas.push(linhaAtual);
  return linhas;
}

function inicializarGraficos() {
  const ctxRadar = document.getElementById('graficoRadar').getContext('2d');
  graficoRadar = new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: [],
      datasets: [{
        label: 'Média por eixo (1-5)',
        data: [],
        backgroundColor: 'rgba(236,103,27,0.25)',
        borderColor: '#EC671B',
        pointBackgroundColor: '#EC671B'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 12 },
      scales: {
        r: {
          min: 0, max: 5,
          angleLines: { color: 'rgba(255,255,255,0.1)' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          pointLabels: {
            color: '#FFFFFF',
            font: { size: 11 },
            padding: 10,
            callback: (label) => quebrarRotulo(label, 16)
          },
          ticks: { color: '#B6B5B5', backdropColor: 'transparent', stepSize: 1 }
        }
      },
      plugins: { legend: { labels: { color: '#FFFFFF' } } }
    }
  });

  const ctxNiveis = document.getElementById('graficoNiveis').getContext('2d');
  graficoNiveis = new Chart(ctxNiveis, {
    type: 'bar',
    data: {
      labels: ['Observador', 'Explorador', 'Utilizador\nRegular', 'Integrador', 'Líder de\nInovação'],
      datasets: [{
        label: 'Participantes',
        data: [0, 0, 0, 0, 0],
        backgroundColor: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#EC671B']
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: '#B6B5B5' }, grid: { display: false } },
        y: { ticks: { color: '#B6B5B5', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function atualizarDashboard(res) {
  document.getElementById('kpiTotal').textContent = res.totalParticipantes;
  document.getElementById('kpiTaxa').textContent = res.taxaParticipacao !== null ? res.taxaParticipacao + '%' : '–';
  document.getElementById('kpiIndice').textContent = res.indiceGlobal + '%';
  document.getElementById('kpiNivel').textContent = res.nivel.nome;
  document.getElementById('nivelIcone').textContent = nivelIcone(res.nivel.chave);

  graficoRadar.data.labels = res.porEixo.map(e => e.nome);
  graficoRadar.data.datasets[0].data = res.porEixo.map(e => e.media);
  graficoRadar.update();

  const dn = res.distribuicaoNiveis;
  graficoNiveis.data.datasets[0].data = [
    dn.observador || 0, dn.explorador || 0, dn.utilizador_regular || 0, dn.integrador || 0, dn.lider_inovacao || 0
  ];
  graficoNiveis.update();

  // heatmap
  const grid = document.getElementById('heatmapGrid');
  grid.innerHTML = res.porPergunta.map((p, i) => {
    const cor = p.n > 0 ? corPorMedia(p.media) : '#4a4a4a';
    return `<div class="heatmap-celula" title="${p.texto}" style="background:${cor}">P${i + 1}<br>${p.n > 0 ? p.media : '–'}</div>`;
  }).join('');

  // wordcloud
  const wc = document.getElementById('wordcloud');
  if (res.nuvemPalavras.length === 0) {
    wc.innerHTML = '<span style="color:var(--cor-cinza); font-weight:400;">Aguardando respostas na pergunta aberta...</span>';
  } else {
    const max = res.nuvemPalavras[0].contagem;
    wc.innerHTML = res.nuvemPalavras.slice(0, 40).map((w, i) => {
      const escala = 0.9 + (w.contagem / max) * 2.6;
      const cor = CORES_WORDCLOUD[i % CORES_WORDCLOUD.length];
      return `<span style="font-size:${escala}rem; color:${cor};">${w.texto}</span>`;
    }).join(' ');
  }

  // forcas / oportunidades
  document.getElementById('listaForcas').innerHTML = res.insights.forcas.map(f => `<li>${f}</li>`).join('');
  document.getElementById('listaOportunidades').innerHTML = res.insights.fragilidades.map(f => `<li>${f}</li>`).join('');
}

function aplicarDestaque(estado) {
  const mapa = {
    radar: 'cardRadar', niveis: 'cardNiveis', heatmap: 'cardHeatmap', wordcloud: 'cardWordcloud'
  };
  Object.values(mapa).forEach(id => document.getElementById(id).classList.remove('destaque-ativo'));
  if (estado && estado.destaque && mapa[estado.destaque]) {
    document.getElementById(mapa[estado.destaque]).classList.add('destaque-ativo');
    document.getElementById(mapa[estado.destaque]).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

inicializarGraficos();

fetch('/api/config').then(r => r.json()).then(cfg => {
  document.getElementById('tituloEvento').textContent = cfg.titulo;
});

const socket = io();
socket.on('atualizacao', atualizarDashboard);
socket.on('apresentador', aplicarDestaque);

apiGet('/api/resultados').then(atualizarDashboard);
apiGet('/api/apresentador/estado').then(aplicarDestaque);
