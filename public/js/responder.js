let PERGUNTAS = [];
let PERGUNTA_ABERTA = null;
let indiceAtual = 0;
let respostasValores = {};
let respostaAberta = "";

async function iniciarQuestionario() {
  if (jaRespondeuLocal()) {
    document.getElementById('ecraAnonimato').style.display = 'none';
    document.getElementById('ecraJaRespondeu').style.display = 'block';
    return;
  }
  const dados = await apiGet('/api/perguntas');
  PERGUNTAS = dados.likert;
  PERGUNTA_ABERTA = dados.aberta;

  document.getElementById('ecraAnonimato').style.display = 'none';
  document.getElementById('ecraQuestionario').style.display = 'block';
  indiceAtual = 0;
  renderizarPasso();
}

function totalPassos() {
  return PERGUNTAS.length + (PERGUNTA_ABERTA ? 1 : 0);
}

function renderizarPasso() {
  const area = document.getElementById('areaPergunta');
  const pct = Math.round((indiceAtual / totalPassos()) * 100);
  document.getElementById('barraInterna').style.width = pct + '%';
  document.getElementById('btnAnterior').disabled = indiceAtual === 0;

  const ehAberta = indiceAtual === PERGUNTAS.length;

  if (ehAberta && PERGUNTA_ABERTA) {
    area.innerHTML = `
      <div class="pergunta-numero">Pergunta final</div>
      <div class="pergunta-texto">${PERGUNTA_ABERTA.texto}</div>
      <textarea class="campo-aberto" id="campoAberto" placeholder="Escreva livremente...">${respostaAberta}</textarea>
    `;
    document.getElementById('btnSeguinte').textContent = 'Concluir';
  } else {
    const p = PERGUNTAS[indiceAtual];
    const valorAtual = respostasValores[p.id];
    area.innerHTML = `
      <div class="pergunta-numero">Pergunta ${indiceAtual + 1} de ${PERGUNTAS.length}</div>
      <div class="pergunta-texto">${p.texto}</div>
      <div class="escala-likert">
        ${p.escala.labels.map((label, i) => {
          const valor = i + 1;
          const sel = valorAtual === valor ? 'selecionada' : '';
          return `
            <label class="opcao-likert ${sel}" onclick="selecionarValor('${p.id}', ${valor})">
              <input type="radio" name="likert_${p.id}" value="${valor}" ${valorAtual === valor ? 'checked' : ''}>
              <span>${label}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
    document.getElementById('btnSeguinte').textContent = 'Seguinte';
  }
}

function selecionarValor(perguntaId, valor) {
  respostasValores[perguntaId] = valor;
  renderizarPasso();
}

function irAnterior() {
  if (indiceAtual === PERGUNTAS.length) {
    respostaAberta = document.getElementById('campoAberto').value;
  }
  if (indiceAtual > 0) {
    indiceAtual--;
    renderizarPasso();
  }
}

async function irSeguinte() {
  const ehAberta = indiceAtual === PERGUNTAS.length;

  if (!ehAberta) {
    const p = PERGUNTAS[indiceAtual];
    if (!respostasValores[p.id]) {
      alert('Por favor selecione uma opção antes de continuar.');
      return;
    }
    indiceAtual++;
    if (indiceAtual < totalPassos()) {
      renderizarPasso();
    } else {
      await submeter();
    }
  } else {
    respostaAberta = document.getElementById('campoAberto').value;
    await submeter();
  }
}

async function submeter() {
  const participanteId = obterParticipanteId();
  const resp = await apiPost('/api/responder', {
    participanteId,
    valores: respostasValores,
    aberta: respostaAberta
  });

  if (resp.ok) {
    marcarRespondidoLocal();
    document.getElementById('ecraQuestionario').style.display = 'none';
    document.getElementById('ecraObrigado').style.display = 'block';
  } else if (resp.data && resp.data.motivo === 'ja_respondeu') {
    marcarRespondidoLocal();
    document.getElementById('ecraQuestionario').style.display = 'none';
    document.getElementById('ecraJaRespondeu').style.display = 'block';
  } else {
    alert('Não foi possível registar a resposta. Tente novamente.');
  }
}
