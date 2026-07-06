const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const QRCode = require("qrcode");
const path = require("path");
const crypto = require("crypto");

const store = require("./data/store");
const { gerarRelatorioPDF } = require("./data/relatorioPDF");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// tokens de sessao de administrador validos (simples, em memoria)
const tokensAdmin = new Set();

function exigirAdmin(req, res, next) {
  const token = req.cookies.admin_token;
  if (token && tokensAdmin.has(token)) return next();
  return res.status(401).json({ ok: false, erro: "Nao autenticado" });
}

function emitirAtualizacao() {
  io.emit("atualizacao", store.calcularResultados());
}

// ---------------- ROTAS PUBLICAS ----------------

app.get("/api/config", (req, res) => {
  res.json(store.getConfigPublica());
});

app.get("/api/perguntas", (req, res) => {
  res.json(store.getPerguntasPublicas());
});

app.get("/api/resultados", (req, res) => {
  res.json(store.calcularResultados());
});

app.get("/api/qrcode.png", async (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  const url = `${base}/responder.html`;
  try {
    const png = await QRCode.toBuffer(url, {
      width: 640,
      margin: 1,
      color: { dark: "#2E2D2D", light: "#FFFFFF" }
    });
    res.setHeader("Content-Type", "image/png");
    res.send(png);
  } catch (e) {
    res.status(500).send("Erro a gerar QR code");
  }
});

app.get("/api/qrcode-url", (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  res.json({ url: `${base}/responder.html` });
});

app.post("/api/responder", (req, res) => {
  const config = store.getConfigPublica();
  if (!config.sessaoAtiva) {
    return res.status(403).json({ ok: false, erro: "sessao_inativa" });
  }
  const { participanteId, valores, aberta } = req.body || {};
  const resultado = store.registrarResposta(participanteId, valores, aberta);
  if (!resultado.ok) {
    return res.status(409).json(resultado);
  }
  emitirAtualizacao();
  res.json({ ok: true });
});

app.get("/api/apresentador/estado", (req, res) => {
  res.json(store.getEstadoApresentador());
});

// ---------------- RELATORIO PDF ----------------

app.get("/api/relatorio/pdf", (req, res) => {
  const resultados = store.calcularResultados();
  const config = store.getConfigPublica();
  gerarRelatorioPDF(res, resultados, config);
});

// ---------------- ADMIN: AUTENTICACAO ----------------

app.post("/api/admin/login", (req, res) => {
  const { senha } = req.body || {};
  if (store.validarSenhaAdmin(senha)) {
    const token = crypto.randomBytes(24).toString("hex");
    tokensAdmin.add(token);
    res.cookie("admin_token", token, { httpOnly: true, sameSite: "lax" });
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, erro: "senha_invalida" });
});

app.post("/api/admin/logout", (req, res) => {
  const token = req.cookies.admin_token;
  if (token) tokensAdmin.delete(token);
  res.clearCookie("admin_token");
  res.json({ ok: true });
});

app.get("/api/admin/verificar", exigirAdmin, (req, res) => res.json({ ok: true }));

// ---------------- ADMIN: PERGUNTAS ----------------

app.get("/api/admin/perguntas", exigirAdmin, (req, res) => {
  res.json(store.getTodasPerguntasAdmin());
});

app.post("/api/admin/perguntas", exigirAdmin, (req, res) => {
  const nova = store.criarPergunta(req.body || {});
  emitirAtualizacao();
  res.json({ ok: true, pergunta: nova });
});

app.put("/api/admin/perguntas/:id", exigirAdmin, (req, res) => {
  const p = store.atualizarPergunta(req.params.id, req.body || {});
  if (!p) return res.status(404).json({ ok: false });
  emitirAtualizacao();
  res.json({ ok: true, pergunta: p });
});

app.delete("/api/admin/perguntas/:id", exigirAdmin, (req, res) => {
  const ok = store.eliminarPergunta(req.params.id);
  emitirAtualizacao();
  res.json({ ok });
});

app.post("/api/admin/perguntas/:id/duplicar", exigirAdmin, (req, res) => {
  const copia = store.duplicarPergunta(req.params.id);
  if (!copia) return res.status(404).json({ ok: false });
  res.json({ ok: true, pergunta: copia });
});

app.post("/api/admin/perguntas/:id/alternar", exigirAdmin, (req, res) => {
  const p = store.alternarAtivaPergunta(req.params.id);
  if (!p) return res.status(404).json({ ok: false });
  emitirAtualizacao();
  res.json({ ok: true, pergunta: p });
});

app.put("/api/admin/pergunta-aberta", exigirAdmin, (req, res) => {
  const p = store.atualizarPerguntaAberta(req.body || {});
  res.json({ ok: true, pergunta: p });
});

app.post("/api/admin/dimensoes", exigirAdmin, (req, res) => {
  const { chave, nome } = req.body || {};
  if (!chave || !nome) return res.status(400).json({ ok: false, erro: "dados_incompletos" });
  const criada = store.criarDimensao(chave, nome);
  res.json({ ok: true, dimensao: criada });
});

app.get("/api/admin/dimensoes", exigirAdmin, (req, res) => {
  res.json(store.DIMENSOES);
});

// ---------------- ADMIN: CONFIGURACAO E SESSAO ----------------

app.put("/api/admin/config", exigirAdmin, (req, res) => {
  const cfg = store.atualizarConfig(req.body || {});
  emitirAtualizacao();
  res.json({ ok: true, config: cfg });
});

app.post("/api/admin/senha", exigirAdmin, (req, res) => {
  const ok = store.alterarSenhaAdmin((req.body || {}).novaSenha);
  res.json({ ok });
});

app.post("/api/admin/reset", exigirAdmin, (req, res) => {
  store.resetarSessao({ manterPerguntas: (req.body || {}).manterPerguntas !== false });
  emitirAtualizacao();
  res.json({ ok: true });
});

app.get("/api/admin/exportar", exigirAdmin, (req, res) => {
  res.json(store.exportarDadosBrutos());
});

// ---------------- APRESENTADOR ----------------

app.put("/api/admin/apresentador", exigirAdmin, (req, res) => {
  const est = store.atualizarApresentador(req.body || {});
  io.emit("apresentador", est);
  res.json({ ok: true, estado: est });
});

// ---------------- SOCKET.IO ----------------

io.on("connection", (socket) => {
  socket.emit("atualizacao", store.calcularResultados());
  socket.emit("apresentador", store.getEstadoApresentador());
});

server.listen(PORT, () => {
  console.log(`Indice CESPU de Maturidade Docente em IA a correr em http://localhost:${PORT}`);
});
