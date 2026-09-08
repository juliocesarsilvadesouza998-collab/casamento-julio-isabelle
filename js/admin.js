/* ============================================================
   PAINEL DOS NOIVOS (admin.html)
   ============================================================ */

const AdminJS = (() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (v) => v === 0 ? "Valor livre" : "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const CAT_STYLES = {
    "Cozinha": "linear-gradient(140deg,#F3E1DC,#E9CDC8)",
    "Eletroportáteis": "linear-gradient(140deg,#ECE3E2,#DDD0CF)",
    "Cama & Banho": "linear-gradient(140deg,#F5EAE1,#EBD9CE)",
    "Casa": "linear-gradient(140deg,#EDE7E3,#DCD2CC)",
    "Lazer": "linear-gradient(140deg,#E7E2E9,#D5CCDA)",
    "Lua de Mel": "linear-gradient(140deg,#F8E4E0,#F0D2CC)",
    "Pessoal": "linear-gradient(140deg,#F0E7F0,#E0D0E0)",
  };
  const cor = (cat) => CAT_STYLES[cat] || "#EFEAE2";

  const STATUS_OPCOES = ["livre", "reservado", "comprado"];
  const STATUS_LABEL = { livre: "Disponível", reservado: "Reservado", comprado: "Comprado" };

  function entrar() {
    const senha = document.getElementById("lock-senha").value;
    if (senha === ADMIN_SENHA) {
      document.getElementById("lock").style.display = "none";
      document.getElementById("painel").style.display = "block";
      renderTudo();
    } else {
      const err = document.getElementById("lock-erro");
      err.style.display = "block";
      setTimeout(() => (err.style.display = "none"), 2500);
    }
  }

  function renderTudo() {
    renderStats();
    renderTabelaPresentes();
    renderTabelaReservas();
    renderTabelaRsvp();
  }

  function renderStats() {
    const r = StorageAPI.getReservas();
    const total = PRESENTES.length;
    const reservados = PRESENTES.filter((p) => r[p.id] && r[p.id].status === "reservado").length;
    const comprados = PRESENTES.filter((p) => r[p.id] && r[p.id].status === "comprado").length;
    document.getElementById("st-total").textContent = total;
    document.getElementById("st-reservados").textContent = reservados;
    document.getElementById("st-comprados").textContent = comprados;
    document.getElementById("st-pendentes").textContent = total - reservados - comprados;
    document.getElementById("st-rsvp").textContent = StorageAPI.getRsvp().length;
  }

  function renderTabelaPresentes() {
    const r = StorageAPI.getReservas();
    const wrap = document.getElementById("tabela-presentes");
    if (!PRESENTES.length) { wrap.innerHTML = `<div class="admin-empty">Lista vazia. Adicione presentes!</div>`; return; }

    const rows = PRESENTES.map((p) => {
      const st = r[p.id] ? r[p.id].status : "livre";
      const nome = r[p.id] ? r[p.id].nome : "";
      return `<tr data-id="${p.id}">
        <td><div class="gift-cell"><div class="thumb" style="background:${cor(p.categoria)}">${p.img ? `<img src="${esc(p.img)}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" onerror="this.outerHTML='${p.emoji}'" />` : p.emoji}</div><div><strong>${esc(p.nome)}</strong><br /><span style="color:var(--muted);font-size:.78rem;">${esc(p.categoria)} · ${fmt(p.preco)}</span></div></div></td>
        <td style="white-space:nowrap;">
          <select onchange="AdminJS.mudarStatus('${p.id}', this.value)">
            ${STATUS_OPCOES.map((o) => `<option value="${o}" ${o === st ? "selected" : ""}>${STATUS_LABEL[o]}</option>`).join("")}
          </select>
          ${nome ? `<div style="font-size:.78rem;color:var(--muted);margin-top:4px;">${esc(nome)}</div>` : ""}
        </td>
        <td style="text-align:right;white-space:nowrap;">
          <button class="btn btn-sm btn-secondary" onclick="AdminJS.removerItem('${p.id}')">🗑</button>
        </td>
      </tr>`;
    }).join("");

    wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Presente</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderTabelaReservas() {
    const r = StorageAPI.getReservas();
    const wrap = document.getElementById("tabela-reservas");
    const itens = Object.entries(r).filter(([, v]) => v.status !== "livre");
    if (!itens.length) { wrap.innerHTML = `<div class="admin-empty">Nenhuma reserva ou compra registrada ainda.</div>`; return; }

    const nomeItem = (id) => { const p = PRESENTES.find((x) => x.id === id); return p ? p.nome : id; };
    const rows = itens.map(([id, v]) => `
      <tr>
        <td><strong>${esc(v.nome)}</strong></td>
        <td>${esc(nomeItem(id))}</td>
        <td><span class="admin-tag ${v.status}">${STATUS_LABEL[v.status] || v.status}</span></td>
        <td style="color:var(--muted);font-size:.82rem;">${esc(v.data || "")}</td>
      </tr>`).join("");

    wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Convidado</th><th>Presente</th><th>Status</th><th>Data</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderTabelaRsvp() {
    const lista = StorageAPI.getRsvp();
    const wrap = document.getElementById("tabela-rsvp");
    if (!lista.length) { wrap.innerHTML = `<div class="admin-empty">Nenhuma confirmação de presença ainda.</div>`; return; }
    const rows = lista.map((e) => `
      <tr>
        <td><strong>${esc(e.nome)}</strong>${e.email ? `<br /><span style="color:var(--muted);font-size:.78rem;">${esc(e.email)}</span>` : ""}</td>
        <td>${e.presenca === "sim" ? `<span class="admin-tag livre">Vai 💚</span>` : `<span class="admin-tag reservado">Não pode 💛</span>`}</td>
        <td>${e.presenca === "sim" ? e.qtd + " convidado(s)" : "—"}</td>
        <td style="max-width:220px;color:var(--muted);font-size:.8rem;">${esc(e.recado || "")}</td>
      </tr>`).join("");
    wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Nome</th><th>Presença</th><th>Qtd</th><th>Recado</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  /* ---------- Ações ---------- */
  function mudarStatus(id, status) {
    const r = StorageAPI.getReservas();
    if (status === "livre") {
      StorageAPI.saveReserva(id, null);
    } else {
      const atual = r[id] || {};
      StorageAPI.saveReserva(id, {
        nome: atual.nome || "Noivos",
        status,
        data: atual.data || new Date().toISOString().slice(0, 10),
      });
    }
    renderTudo();
  }

  function removerItem(id) {
    if (!confirm("Remover este presente da lista?")) return;
    const idx = PRESENTES.findIndex((p) => p.id === id);
    if (idx >= 0) PRESENTES.splice(idx, 1);
    StorageAPI.saveReserva(id, null);
    renderTudo();
  }

  function toggleForm() {
    const f = document.getElementById("admin-form");
    f.style.display = f.style.display === "none" ? "grid" : "none";
  }

  function adicionarItem() {
    toggleForm();
    document.getElementById("admin-form").scrollIntoView({ behavior: "smooth" });
  }

  function salvarNovoItem() {
    const nome = document.getElementById("f-nome").value.trim();
    if (!nome) return alert("Digite o nome do presente.");
    const id = "p" + Date.now();
    PRESENTES.push({
      id,
      nome,
      descricao: document.getElementById("f-desc").value.trim(),
      preco: parseFloat(document.getElementById("f-preco").value) || 0,
      loja: document.getElementById("f-loja").value.trim(),
      categoria: document.getElementById("f-cat").value,
      emoji: document.getElementById("f-emoji").value.trim() || "🎁",
      link: "",
    });
    ["f-nome", "f-desc", "f-preco", "f-loja", "f-emoji"].forEach((i) => (document.getElementById(i).value = ""));
    toggleForm();
    renderTudo();
  }

  function exportarCSV() {
    const r = StorageAPI.getReservas();
    const linhas = [["Presente", "Categoria", "Preco", "Loja", "Status", "Convidado"]];
    PRESENTES.forEach((p) => {
      const st = r[p.id] ? r[p.id].status : "livre";
      linhas.push([p.nome, p.categoria, p.preco, p.loja, STATUS_LABEL[st] || st, r[p.id] ? r[p.id].nome : ""]);
    });
    const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lista-de-presentes.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function restaurarDemo() {
    if (!confirm("Restaurar a lista de exemplo? Isso apaga reservas atuais.")) return;
    StorageAPI.restaurarDemo();
    renderTudo();
  }

  function limparTudo() {
    if (!confirm("Zerar TODAS as reservas, compras e confirmações?")) return;
    StorageAPI.limparTudo();
    renderTudo();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("lock-form").addEventListener("submit", (ev) => { ev.preventDefault(); entrar(); });
    document.getElementById("lock-senha").addEventListener("keydown", (ev) => { if (ev.key === "Enter") entrar(); });
  });

  return { entrar, renderTudo, mudarStatus, removerItem, toggleForm, adicionarItem, salvarNovoItem, exportarCSV, restaurarDemo, limparTudo };
})();
