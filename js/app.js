/* ============================================================
   LÓGICA PRINCIPAL DO SITE
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    filtro: "Todos",
    busca: "",
    modalItem: null,     // item aberto no modal
  };

  const CATEGORIAS = ["Todos", ...new Set(PRESENTES.map(p => p.categoria))];

  /* ---------- Cores por categoria (thumb do card) ---------- */
  const CAT_STYLES = {
    "Cozinha": "linear-gradient(140deg,#F3E1DC,#E9CDC8)",
    "Eletroportáteis": "linear-gradient(140deg,#ECE3E2,#DDD0CF)",
    "Cama & Banho": "linear-gradient(140deg,#F5EAE1,#EBD9CE)",
    "Casa": "linear-gradient(140deg,#EDE7E3,#DCD2CC)",
    "Lazer": "linear-gradient(140deg,#E7E2E9,#D5CCDA)",
    "Lua de Mel": "linear-gradient(140deg,#F8E4E0,#F0D2CC)",
    "Pessoal": "linear-gradient(140deg,#F0E7F0,#E0D0E0)",
  };
  const corCategoria = (cat) => CAT_STYLES[cat] || "linear-gradient(140deg,#EFEAE2,#E4DCD0)";

  /* ---------- Helpers ---------- */
  const fmt = (v) => v === 0 ? "Valor livre" : "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const inicial = (nome) => (nome || "?").trim().charAt(0).toUpperCase();
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Config na tela ---------- */
  function aplicarConfig() {
    const c = CASAL;
    document.title = `${c.noivo} & ${c.noiva} — Nosso Casamento`;
    document.getElementById("hero-noivo").textContent = c.noivo;
    document.getElementById("hero-noiva").textContent = c.noiva;
    document.getElementById("hero-data").textContent = c.dataExibicao;
    document.getElementById("hero-monograma").textContent = c.iniciais;
    document.getElementById("nav-iniciais").innerHTML = c.iniciais.replace("&", " <span class='amp'>&amp;</span> ");
    document.getElementById("story-mono").textContent = c.iniciais;
    document.getElementById("signature-mono").textContent = c.iniciais;
    document.getElementById("signature-nomes").textContent = `${c.noivo} & ${c.noiva}`;
    document.getElementById("historia-texto").textContent = c.historia;
    document.getElementById("historia-frase").textContent = c.frase;
    document.getElementById("historia-frase-autor").textContent = c.fraseAutor;
    document.getElementById("local-data").innerHTML = c.dataExibicao.replace(" · ", "<br />");
    document.getElementById("local-nome").innerHTML = `${esc(c.cerimonia || c.local)}<br /><span style="color:var(--muted);font-size:.85rem;">${esc(c.cerimoniaEndereco || c.endereco)}</span>`;
    document.getElementById("local-mapa").href = c.cerimoniaMapa || c.mapaUrl;
    const festaNome = document.getElementById("festa-nome");
    if (festaNome) {
      festaNome.innerHTML = `${esc(c.festa)}<br /><span style="color:var(--muted);font-size:.85rem;">${esc(c.festaEndereco)}</span>`;
      document.getElementById("festa-mapa").href = c.festaMapa;
    }
    document.getElementById("local-contato").textContent = `Fale com os noivos: ${c.contato}`;
    document.getElementById("local-whatsapp").href = `https://wa.me/55${c.contato.replace(/\D/g, "")}`;
    document.getElementById("footer-mono").textContent = c.iniciais;
    document.getElementById("footer-nomes").textContent = `${c.noivo} & ${c.noiva}`;
    document.getElementById("footer-data").textContent = c.dataFooter || "";

    const st = document.getElementById("lista-titulo");
    st.textContent = TEXTO_LISTA.titulo;
    document.getElementById("lista-subtitulo").textContent = TEXTO_LISTA.subtitulo;

    // Foto do casal (se configurada)
    if (c.fotoHero) {
      const h = document.querySelector(".hero-inner");
      // imagem de fundo suave no hero
    }
    if (c.fotoHistoria) {
      const ph = document.getElementById("story-photo");
      ph.innerHTML = `<img src="${esc(c.fotoHistoria)}" alt="${esc(c.noivo)} & ${esc(c.noiva)}" /><div class="frame"></div>`;
    }
  }

  /* ---------- Countdown ---------- */
  function countdown() {
    const alvo = new Date(CASAL.data).getTime();
    const tick = () => {
      const diff = alvo - Date.now();
      const d = document.getElementById("cd-dias"), h = document.getElementById("cd-horas"),
            m = document.getElementById("cd-min"), s = document.getElementById("cd-seg");
      if (diff <= 0) { d.textContent = h.textContent = m.textContent = s.textContent = "00"; return; }
      const pad = (n) => String(n).padStart(2, "0");
      d.textContent = pad(Math.floor(diff / 86400000));
      h.textContent = pad(Math.floor(diff / 3600000) % 24);
      m.textContent = pad(Math.floor(diff / 60000) % 60);
      s.textContent = pad(Math.floor(diff / 1000) % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Render da lista ---------- */
  const grid = document.getElementById("gifts-grid");
  const emptyBox = document.getElementById("registry-empty");

  function renderChips() {
    const wrap = document.getElementById("filter-chips");
    wrap.innerHTML = "";
    CATEGORIAS.forEach((cat) => {
      const b = document.createElement("button");
      b.className = "chip" + (cat === state.filtro ? " active" : "");
      b.textContent = cat;
      b.addEventListener("click", () => {
        state.filtro = cat;
        renderChips();
        renderLista();
      });
      wrap.appendChild(b);
    });
  }

  function renderProgresso() {
    const reservas = StorageAPI.getReservas();
    const total = PRESENTES.length;
    const garantidos = PRESENTES.filter((p) => reservas[p.id]).length;
    document.getElementById("progresso-texto").textContent =
      `${garantidos} de ${total} presentes garantidos`;
    document.getElementById("progresso-detalhe").textContent =
      garantidos === total ? "Lista completa! Obrigado de coração 🤍"
      : "Reserve o seu antes que outra pessoa escolha!";
    document.getElementById("progresso-barra").style.width = `${(garantidos / total) * 100}%`;
  }

  function renderLista() {
    const reservas = StorageAPI.getReservas();
    const eu = StorageAPI.getGuestName();
    const q = state.busca.trim().toLowerCase();

    const visiveis = PRESENTES.filter((p) => {
      if (state.filtro !== "Todos" && p.categoria !== state.filtro) return false;
      if (q && !(`${p.nome} ${p.descricao} ${p.loja} ${p.categoria}`.toLowerCase().includes(q))) return false;
      return true;
    });

    grid.innerHTML = "";
    emptyBox.style.display = visiveis.length ? "none" : "block";

    visiveis.forEach((p) => {
      const r = reservas[p.id] || null;
      const card = document.createElement("article");
      card.className = "gift-card" + (r ? " is-disabled" : "");
      card.dataset.id = p.id;

      const statusBadge = r
        ? (r.status === "comprado"
            ? `<span class="gift-status-badge status-comprado"><span class="dot"></span>Comprado</span>`
            : `<span class="gift-status-badge status-reservado"><span class="dot"></span>Reservado</span>`)
        : `<span class="gift-status-badge status-livre"><span class="dot"></span>Disponível</span>`;

      const botao = r
        ? (r.status === "comprado"
            ? `<button class="btn btn-comprado" disabled><span class="check">✓</span> Comprado com amor</button>`
            : `<button class="btn btn-reservado" data-acao="comprei"><span class="check" style="background:var(--ok);color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;">✓</span> Já comprei!</button>`)
        : `<button class="btn btn-livre" data-acao="reservar">🎁 Reservar presente</button>`;

      const owner = r
        ? `<div class="gift-owner"><div class="avatar">${esc(inicial(r.nome))}</div><div><small>${r.status === "comprado" ? "Comprado por" : "Reservado por"}</small>${esc(r.nome)}</div></div>`
        : "";

      card.innerHTML = `
        <div class="gift-thumb" style="background:${corCategoria(p.categoria)}">
          <span class="cat-tag">${esc(p.categoria)}</span>
          ${statusBadge}
          ${p.img
            ? `<img src="${esc(p.img)}" alt="${esc(p.nome)}" loading="lazy" onerror="this.outerHTML='<span style=font-size:3rem;>${p.emoji}</span>'" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" />`
            : `<span style="font-size:3rem;">${p.emoji}</span>`}
        </div>
        <div class="gift-body">
          <h3 class="gift-name">${esc(p.nome)}</h3>
          ${p.descricao ? `<p class="gift-desc">${esc(p.descricao)}</p>` : ""}
          <div class="gift-meta">
            <span class="gift-price">${fmt(p.preco)}</span>
            ${p.loja ? `<span class="gift-store">🏬 ${esc(p.loja)}</span>` : ""}
          </div>
          <div class="gift-action">${botao}</div>
          ${owner}
        </div>`;

      card.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-acao]");
        if (!btn) return;
        if (btn.dataset.acao === "reservar") abrirModal(p);
        else if (btn.dataset.acao === "comprei") {
          if (!eu || r && r.nome === eu) {
            abrirModal(p, "comprei");
          } else {
            abrirModal(p, "comprei", r);
          }
        }
      });
      grid.appendChild(card);
    });
  }

  /* ---------- Modal ---------- */
  const modal = document.getElementById("modal");
  const modalForm = document.getElementById("modal-form");

  function abrirModal(item, modo = "reservar", reservaAtual = null) {
    state.modalItem = item;
    document.getElementById("modal-thumb").textContent = item.img ? "" : item.emoji;
    document.getElementById("modal-thumb").style.background = corCategoria(item.categoria);
    document.getElementById("modal-thumb").innerHTML = item.img
      ? `<img src="${esc(item.img)}" alt="${esc(item.nome)}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" onerror="this.outerHTML='<span style=font-size:1.6rem;>${item.emoji}</span>'" />`
      : item.emoji;
    document.getElementById("modal-nome").textContent = item.nome;
    document.getElementById("modal-preco").textContent = fmt(item.preco);

    const nomeInput = document.getElementById("modal-nome-convidado");
    nomeInput.value = StorageAPI.getGuestName() || "";

    if (modo === "comprei") {
      document.getElementById("modal-titulo").textContent = "Confirmar compra";
      document.getElementById("modal-lead").textContent = reservaAtual
        ? `Este presente está reservado por ${reservaAtual.nome}. Confirme que você comprou para liberar para os noivos!`
        : "Que alegria! Confirme seu nome para registrar que você já comprou este presente.";
      document.getElementById("modal-btn-reservar").textContent = "✅ Confirmar compra";
      document.getElementById("modal-btn-comprei").style.display = "none";
      if (reservaAtual && !reservaAtual.nome.includes(nomeInput.value) && nomeInput.value) {
        nomeInput.value = reservaAtual.nome;
      }
      document.getElementById("modal-note").textContent = "O presente ficará marcado como comprado para todos os convidados.";
    } else {
      document.getElementById("modal-titulo").textContent = "Reservar presente";
      document.getElementById("modal-lead").textContent = "Preencha seu nome para reservar este presente. Assim, evitamos presentes repetidos!";
      document.getElementById("modal-btn-reservar").textContent = "🎁 Reservar";
      document.getElementById("modal-btn-comprei").style.display = "";
      document.getElementById("modal-note").textContent = "Reservado? Depois você pode marcar como comprado.";
    }
    modalForm.dataset.modo = modo;
    modal.classList.add("open");
    setTimeout(() => nomeInput.focus(), 120);
  }

  function fecharModal() {
    modal.classList.remove("open");
    state.modalItem = null;
  }

  modalForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const item = state.modalItem;
    if (!item) return;
    const nome = document.getElementById("modal-nome-convidado").value.trim();
    if (nome.length < 2) return toast("Escreva seu nome para continuar 😊", "error");

    const modo = modalForm.dataset.modo;
    const hoje = new Date().toISOString().slice(0, 10);

    if (modo === "comprei") {
      StorageAPI.saveReserva(item.id, { nome, status: "comprado", data: hoje });
      StorageAPI.setGuestName(nome);
      fecharModal();
      confete();
      toast(`Compra confirmada! Obrigado, ${nome}! 🤍`, "success");
    } else {
      StorageAPI.saveReserva(item.id, { nome, status: "reservado", data: hoje });
      StorageAPI.setGuestName(nome);
      fecharModal();
      toast(`Presente reservado por ${nome}! 🎉`, "success");
    }
    renderLista();
    renderProgresso();
  });

  document.getElementById("modal-btn-comprei").addEventListener("click", () => {
    const item = state.modalItem;
    if (!item) return;
    const reservas = StorageAPI.getReservas();
    abrirModal(item, "comprei", reservas[item.id] || null);
  });

  document.getElementById("modal-close").addEventListener("click", fecharModal);
  modal.addEventListener("click", (ev) => { if (ev.target === modal) fecharModal(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") fecharModal(); });

  /* ---------- Busca ---------- */
  document.getElementById("busca").addEventListener("input", (ev) => {
    state.busca = ev.target.value;
    renderLista();
  });

  /* ---------- Toast ---------- */
  function toast(msg, tipo = "") {
    const wrap = document.getElementById("toast-wrap");
    const t = document.createElement("div");
    t.className = "toast " + tipo;
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add("bye"); setTimeout(() => t.remove(), 400); }, 3200);
  }
  window.toast = toast;

  /* ---------- Confete ---------- */
  function confete() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = innerWidth; canvas.height = innerHeight;
    const cores = ["#955251", "#C6A15B", "#7A403F", "#46383A", "#F2DFDC"];
    const ps = [];
    for (let i = 0; i < 160; i++) {
      ps.push({
        x: canvas.width / 2 + (Math.random() - .5) * 240,
        y: canvas.height / 2 + (Math.random() - .5) * 160,
        vx: (Math.random() - .5) * 9,
        vy: -Math.random() * 11 - 3,
        g: .32 + Math.random() * .18,
        s: 5 + Math.random() * 6,
        r: Math.random() * Math.PI,
        vr: (Math.random() - .5) * .3,
        c: cores[(Math.random() * cores.length) | 0],
      });
    }
    let frames = 0;
    (function anim() {
      frames++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .62);
        ctx.restore();
      });
      if (frames < 140) requestAnimationFrame(anim);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })();
  }
  window.confete = confete;

  /* ---------- Navbar ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("nav-burger");
  const navLinks = document.getElementById("nav-links");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 40));
  burger.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));

  /* ---------- RSVP ---------- */
  document.getElementById("rsvp-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const nome = document.getElementById("rsvp-nome").value.trim();
    const email = document.getElementById("rsvp-email").value.trim();
    const presenca = document.getElementById("rsvp-presenca").value;
    const qtd = document.getElementById("rsvp-acompanhantes").value;
    const recado = document.getElementById("rsvp-recado").value.trim();
    if (nome.length < 2) return toast("Escreva seu nome para confirmar 😊", "error");
    StorageAPI.addRsvp({
      nome, email, presenca, qtd: presenca === "sim" ? qtd : "0",
      recado, data: new Date().toISOString(),
    });
    document.getElementById("rsvp-form").style.display = "none";
    document.getElementById("rsvp-done").style.display = "block";
    confete();
    toast("Presença confirmada! 💌", "success");
  });

  /* ---------- Init ---------- */
  aplicarConfig();
  countdown();
  renderChips();
  renderLista();
  renderProgresso();
});
