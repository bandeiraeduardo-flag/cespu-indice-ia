let DIMENSOES_CACHE = null;
let PERGUNTAS_CACHE = [];

async function autenticar() {
  const senha = document.getElementById('campoSenha').value;
  const resp = await apiPost('/api/admin/login', { senha });
  if (resp.ok) {
    document.getElementById('ecraLogin').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'block';
    await carregarTudo();
  } else {
    document.getElementById('erroLogin').style.display = 'block';
  }
}

async function carregarTudo() {
  const [config, resultados, dados] = await Promise.all([
    apiGet('/api/config'),
    apiGet('/api/resultados'),
    apiGet('/api/admin/perguntas')
  ]);

  document.getElementById('campoTitulo').value = config.titulo;
  document.getElementById('campoEsperados').value = config.participantesEsperados;
  document.getElementById('campoAtiva').checked = config.sessaoAtiva;
  document.getElementById('infoTotal').textContent = resultados.totalParticipantes;

  DIMENSOES_CACHE = dados.dimensoes;
  PERGUNTAS_CACHE = dados.likert;
  preencherSelectEixos();
  renderizarTabelaPerguntas();

  document.getElementById('campoPerguntaAberta').value = dados.aberta.texto;
  document.getElementById('campoAbertaAtiva').checked = dados.aberta.ativa;
}

function preencherSelectEixos() {
  const select = document.getElementById('modalEixo');
  select.innerHTML = Object.entries(DIMENSOES_CACHE.eixos)
    .map(([chave, nome]) => `<option value="${chave}">${nome}</option>`)
    .join('');
}

function renderizarTabelaPerguntas() {
  document.getElementById('contagemPerguntas').textContent = PERGUNTAS_CACHE.length;
  const corpo = document.getElementById('corpoTabelaPerguntas');
  corpo.innerHTML = PERGUNTAS_CACHE
    .sort((a, b) => a.ordem - b.ordem)
    .map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><span class="badge badge-pilar-${p.pilar}">${p.pilar}</span></td>
        <td>${(DIMENSOES_CACHE.eixos[p.eixo]) || p.eixo}</td>
        <td>${p.texto}</td>
        <td><span class="badge ${p.ativa ? 'badge-ativa' : 'badge-inativa'}">${p.ativa ? 'Ativa' : 'Inativa'}</span></td>
        <td style="white-space:nowrap;">
          <button class="botao secundario pequeno" onclick="abrirModalPergunta('${p.id}')">Editar</button>
          <button class="botao secundario pequeno" onclick="duplicarPergunta('${p.id}')">Duplicar</button>
          <button class="botao secundario pequeno" onclick="alternarPergunta('${p.id}')">${p.ativa ? 'Desativar' : 'Ativar'}</button>
          <button class="botao perigo pequeno" onclick="eliminarPergunta('${p.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('');
}

function abrirModalPergunta(id) {
  document.getElementById('modalPergunta').style.display = 'flex';
  if (id) {
    const p = PERGUNTAS_CACHE.find(q => q.id === id);
    document.getElementById('modalTitulo').textContent = 'Editar pergunta';
    document.getElementById('modalId').value = p.id;
    document.getElementById('modalTexto').value = p.texto;
    document.getElementById('modalPilar').value = p.pilar;
    document.getElementById('modalEixo').value = p.eixo;
    document.getElementById('modalCriterio').value = p.criterio;
    document.getElementById('modalEscala').value = p.escala.labels.join(', ');
  } else {
    document.getElementById('modalTitulo').textContent = 'Nova pergunta';
    document.getElementById('modalId').value = '';
    document.getElementById('modalTexto').value = '';
    document.getElementById('modalPilar').value = 'II';
    document.getElementById('modalEixo').value = Object.keys(DIMENSOES_CACHE.eixos)[0];
    document.getElementById('modalCriterio').value = 'mediacao_humana';
    document.getElementById('modalEscala').value = 'Nunca, Raramente, Ocasionalmente, Frequentemente, Sempre';
  }
}

function fecharModal() {
  document.getElementById('modalPergunta').style.display = 'none';
}

async function guardarModalPergunta() {
  const id = document.getElementById('modalId').value;
  const labels = document.getElementById('modalEscala').value.split(',').map(s => s.trim()).filter(Boolean);
  const dados = {
    texto: document.getElementById('modalTexto').value.trim(),
    pilar: document.getElementById('modalPilar').value,
    eixo: document.getElementById('modalEixo').value,
    criterio: document.getElementById('modalCriterio').value,
    labels: labels.length === 5 ? labels : undefined
  };
  if (!dados.texto) { alert('O texto da pergunta é obrigatório.'); return; }

  if (id) {
    await apiPut('/api/admin/perguntas/' + id, dados);
  } else {
    await apiPost('/api/admin/perguntas', dados);
  }
  fecharModal();
  await carregarTudo();
}

async function duplicarPergunta(id) {
  await apiPost('/api/admin/perguntas/' + id + '/duplicar');
  await carregarTudo();
}

async function alternarPergunta(id) {
  await apiPost('/api/admin/perguntas/' + id + '/alternar');
  await carregarTudo();
}

async function eliminarPergunta(id) {
  if (!confirm('Eliminar esta pergunta definitivamente?')) return;
  await apiDelete('/api/admin/perguntas/' + id);
  await carregarTudo();
}

async function guardarPerguntaAberta() {
  await apiPut('/api/admin/pergunta-aberta', {
    texto: document.getElementById('campoPerguntaAberta').value,
    ativa: document.getElementById('campoAbertaAtiva').checked
  });
  alert('Pergunta aberta atualizada.');
}

async function criarDimensao() {
  const chave = document.getElementById('novaDimensaoChave').value.trim();
  const nome = document.getElementById('novaDimensaoNome').value.trim();
  if (!chave || !nome) { alert('Preencha a chave e o nome da dimensão.'); return; }
  await apiPost('/api/admin/dimensoes', { chave, nome });
  document.getElementById('novaDimensaoChave').value = '';
  document.getElementById('novaDimensaoNome').value = '';
  const dados = await apiGet('/api/admin/perguntas');
  DIMENSOES_CACHE = dados.dimensoes;
  preencherSelectEixos();
  alert('Dimensão criada. Já pode ser usada em novas perguntas.');
}

async function guardarConfig() {
  await apiPut('/api/admin/config', {
    titulo: document.getElementById('campoTitulo').value,
    participantesEsperados: Number(document.getElementById('campoEsperados').value)
  });
  alert('Configuração guardada.');
}

async function alternarAtiva() {
  await apiPut('/api/admin/config', {
    sessaoAtiva: document.getElementById('campoAtiva').checked
  });
  alert('Estado da sessão guardado.');
}

async function mudarSenha() {
  const novaSenha = document.getElementById('campoNovaSenha').value;
  const resp = await apiPost('/api/admin/senha', { novaSenha });
  if (resp.data.ok) {
    alert('Password alterada com sucesso.');
    document.getElementById('campoNovaSenha').value = '';
  } else {
    alert('A password deve ter pelo menos 4 caracteres.');
  }
}

async function confirmarReset() {
  if (!confirm('Tem a certeza? Todas as respostas anónimas atuais serão apagadas permanentemente.')) return;
  await apiPost('/api/admin/reset', { manterPerguntas: true });
  await carregarTudo();
  alert('Sessão reiniciada.');
}
