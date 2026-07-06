// Utilitarios partilhados entre paginas
const CORES_PILAR = { I: "#EC671B", II: "#5DADE2", III: "#BB8FCE" };

function corPorMedia(media) {
  if (media < 2.5) return "#e74c3c";
  if (media < 3.8) return "#f1c40f";
  return "#2ecc71";
}

function nivelIcone(chave) {
  const icones = {
    observador: "🔍", explorador: "🧭", utilizador_regular: "⚙️",
    integrador: "🚀", lider_inovacao: "🏆"
  };
  return icones[chave] || "•";
}

async function apiGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Erro ao obter " + url);
  return r.json();
}

async function apiPost(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  return { status: r.status, ok: r.ok, data: await r.json().catch(() => ({})) };
}

async function apiPut(url, body) {
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  return { status: r.status, ok: r.ok, data: await r.json().catch(() => ({})) };
}

async function apiDelete(url) {
  const r = await fetch(url, { method: "DELETE", credentials: "include" });
  return { status: r.status, ok: r.ok, data: await r.json().catch(() => ({})) };
}

function obterParticipanteId() {
  let id = localStorage.getItem("cespu_participante_id");
  if (!id) {
    id = "part_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("cespu_participante_id", id);
  }
  return id;
}

function jaRespondeuLocal() {
  return localStorage.getItem("cespu_ja_respondeu") === "1";
}

function marcarRespondidoLocal() {
  localStorage.setItem("cespu_ja_respondeu", "1");
}
