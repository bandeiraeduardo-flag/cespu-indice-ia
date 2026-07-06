async function autenticar() {
  const senha = document.getElementById('campoSenha').value;
  const resp = await apiPost('/api/admin/login', { senha });
  if (resp.ok) {
    document.getElementById('ecraLogin').style.display = 'none';
    document.getElementById('painelApresentador').style.display = 'block';
    carregarEstado();
  } else {
    document.getElementById('erroLogin').style.display = 'block';
  }
}

async function destacar(chave) {
  await apiPut('/api/admin/apresentador', { destaque: chave });
}

async function mudarModo(modo) {
  const resp = await apiPut('/api/admin/apresentador', { modo });
  document.getElementById('modoAtual').textContent = modo;
}

async function confirmarReset() {
  if (!confirm('Tem a certeza que quer reiniciar a sessão? Todas as respostas atuais serão apagadas.')) return;
  await apiPost('/api/admin/reset', { manterPerguntas: true });
  alert('Sessão reiniciada.');
}

async function carregarEstado() {
  const res = await apiGet('/api/resultados');
  document.getElementById('infoTotal').textContent = res.totalParticipantes;
  document.getElementById('infoIndice').textContent = res.indiceGlobal + '%';
  document.getElementById('infoNivel').textContent = res.nivel.nome;

  const est = await apiGet('/api/apresentador/estado');
  document.getElementById('modoAtual').textContent = est.modo;
}

const socket = io();
socket.on('atualizacao', (res) => {
  if (document.getElementById('painelApresentador').style.display !== 'none') {
    document.getElementById('infoTotal').textContent = res.totalParticipantes;
    document.getElementById('infoIndice').textContent = res.indiceGlobal + '%';
    document.getElementById('infoNivel').textContent = res.nivel.nome;
  }
});
