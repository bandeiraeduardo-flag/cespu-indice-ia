# Índice CESPU de Maturidade Docente em Inteligência Artificial

Aplicação web ao vivo do Gabinete de Inovação Pedagógica da CESPU. Construída com base
prioritária no relatório **"Inteligência Artificial no Ensino Superior em Portugal —
Diagnóstico Nacional para Governação Institucional" (CNIPES, Abril 2026)**.

Totalmente anónima. Sem recolha de nome, email, telefone, IP ou identificação institucional.

---

## 1. O que esta aplicação faz

- Ecrã de projeção (`/projecao.html`) com QR code gigante para os participantes.
- Questionário anónimo no telemóvel (`/responder.html`) — 30 perguntas Likert (1–5) +
  1 pergunta aberta final.
- Dashboard ao vivo (`/dashboard.html`) — KPIs, radar por eixo, heatmap, distribuição de
  níveis de maturidade e nuvem de palavras, tudo a atualizar em tempo real.
- Modo Apresentador (`/apresentador.html`) — destacar gráficos no dashboard, mudar modo de
  sessão, atalhos e reiniciar sessão. Password: ver secção 4.
- Modo Administrador (`/admin.html`) — editar, eliminar, adicionar, ativar/desativar e
  duplicar perguntas, criar novas dimensões, sem necessidade de programação.
- Relatório executivo em PDF gerado automaticamente (`/api/relatorio/pdf`).

## 2. Testar localmente (antes do dia da sessão)

Requer [Node.js](https://nodejs.org) 18 ou superior instalado no seu computador.

```bash
cd cespu-ia-maturidade
npm install
npm start
```

Abra `http://localhost:3000/projecao.html` no browser. Para testar no telemóvel, ambos
(computador e telemóvel) têm de estar na mesma rede WiFi — use o IP local do computador em
vez de `localhost` (ex.: `http://192.168.1.10:3000/responder.html`).

## 3. Colocar a aplicação online (recomendado: Render.com)

A aplicação precisa de estar acessível por um URL público para que os telemóveis a
consigam abrir ao fazer scan do QR code. Passos com o [Render](https://render.com)
(tem plano gratuito):

1. Crie uma conta gratuita em [github.com](https://github.com) (se ainda não tiver) e crie
   um novo repositório vazio (ex.: `cespu-indice-ia`). Pode arrastar a pasta
   `cespu-ia-maturidade` diretamente para a página "Add file → Upload files" do GitHub, sem
   precisar de usar a linha de comandos.
2. Crie uma conta gratuita em [render.com](https://render.com) e escolha
   **New → Web Service**, ligando o repositório GitHub que acabou de criar.
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free (suficiente para uma sessão até ~50 pessoas)
4. Em **Environment**, adicione a variável `ADMIN_PASSWORD` com a password que quiser usar
   no Modo Administrador e no Modo Apresentador (por omissão é `cespu2026` — mude-a).
5. Clique em **Deploy**. Ao fim de 1–2 minutos terá um URL público do tipo
   `https://cespu-indice-ia.onrender.com`.
6. No dia da sessão, abra `https://<o-seu-url>.onrender.com/projecao.html` no computador
   ligado ao videoprojetor. O QR code já aponta automaticamente para o URL correto.

> Nota: no plano gratuito do Render, o serviço "adormece" após período de inatividade e
> demora uns 30 segundos a "acordar" no primeiro acesso. Abra o ecrã de projeção uns
> minutos antes de a sessão começar para evitar esse atraso ao vivo.

### Alternativa sem GitHub: Railway ou Glitch

Se preferir não usar GitHub, serviços como [Railway](https://railway.app) ou
[Glitch](https://glitch.com) permitem importar a pasta do projeto diretamente (upload de
ficheiros ou `.zip`), com um fluxo semelhante: definir `node server.js` como comando de
arranque e `ADMIN_PASSWORD` como variável de ambiente.

## 4. Password de administrador

Por omissão: **`cespu2026`**

Pode alterá-la de duas formas:
- Antes do deploy: definir a variável de ambiente `ADMIN_PASSWORD` no serviço de
  hospedagem (Render/Railway/etc.).
- Depois do deploy: entrar no Modo Administrador com a password atual e usar o campo
  "Alterar password" no painel de Segurança.

A mesma password dá acesso ao Modo Administrador (`/admin.html`) e ao Modo Apresentador
(`/apresentador.html`).

## 5. Fluxo recomendado no dia da sessão

1. Abrir `/apresentador.html`, autenticar, e confirmar que a "Sessão está ativa".
2. Abrir `/projecao.html` numa janela/aba ligada ao videoprojetor.
3. Abrir `/dashboard.html` numa segunda janela (ou trocar para ela após a maioria ter
   respondido) — também pode ser projetada.
4. Pedir aos participantes para fazerem scan do QR code e responderem no telemóvel.
5. Usar o Modo Apresentador para destacar o Radar, a Distribuição de Níveis, o Heatmap ou
   a Nuvem de Palavras conforme a discussão avança.
6. No final, descarregar o **Relatório PDF** diretamente do Modo Apresentador.
7. Antes de uma nova sessão (ex.: outra turma), usar "Reiniciar sessão" no Modo
   Administrador ou Apresentador — mantém as perguntas, apaga apenas as respostas
   anteriores.

## 6. Estrutura de conteúdo

- **3 Pilares** (Saber sobre IA / Fazer com IA / Ser sem IA)
- **5 Critérios mínimos de maturidade** (mediação humana, verificação, transparência,
  literacia afetiva, decisão baseada em evidências)
- **7 Eixos analíticos** (alinhados com a Fase 2 do CNIPES)
- **30 perguntas Likert (1–5)** + **1 pergunta aberta final**
- Todas as interpretações automáticas citam explicitamente dados e conceitos do relatório
  CNIPES 2026 (ex.: 14,7% de instituições com políticas de IA em prática, os quatro
  desequilíbrios do sistema, os cinco critérios mínimos de maturidade).

Todo este conteúdo pode ser editado sem programação a partir do Modo Administrador.

## 7. Privacidade

- Não são recolhidos nome, email, telefone, IP ou qualquer identificador institucional.
- A deduplicação de respostas usa apenas um identificador aleatório gerado no telemóvel do
  participante (guardado no `localStorage` do navegador), nunca ligado à sua identidade.
- Os dados agregados podem ser exportados em JSON a partir do Modo Administrador
  (`Exportar dados`) para arquivo interno do Gabinete de Inovação Pedagógica.

## 8. Suporte técnico rápido

| Problema | Solução |
|---|---|
| QR code não abre no telemóvel | Confirmar que o URL está publicamente acessível (não `localhost`) |
| Dashboard não atualiza em tempo real | Verificar ligação à internet do computador de projeção; o Socket.io reconecta automaticamente |
| Quero recomeçar do zero (apagar tudo, incl. perguntas editadas) | Modo Administrador → Reiniciar sessão, desmarcando "manter perguntas" (via API) ou eliminando o ficheiro `data/sessao-atual.json` antes de reiniciar o servidor |
| Esqueci a password de administrador | Redefinir a variável de ambiente `ADMIN_PASSWORD` no serviço de hospedagem e reiniciar o serviço |
