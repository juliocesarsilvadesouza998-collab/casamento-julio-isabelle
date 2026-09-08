/* ============================================================
   ARMAZENAMENTO — camada única de persistência
   ------------------------------------------------------------
   Hoje usa localStorage (funciona perfeitamente para demo/teste).

   QUANDO FOR PUBLICAR PARA OS CONVIDADOS (fase 2):
   para que a reserva de um convidado apareça para os outros,
   troque as funções abaixo por chamadas a um banco grátis
   (ex.: Supabase — https://supabase.com). O resto do site
   não precisa mudar: app.js só usa esta API.

   Exemplo de troca (Supabase):
   ------------------------------------------------------------
   const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
   const SUPABASE_KEY = "SUA-ANON-KEY";

   async function getReservas() {
     const r = await fetch(`${SUPABASE_URL}/rest/v1/reservas?select=*`, {
       headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
     });
     const rows = await r.json();
     const out = {};
     rows.forEach(row => { out[row.item_id] = { nome: row.nome, status: row.status, data: row.data }; });
     return out;
   }
   async function saveReserva(itemId, dados) { /* upsert via REST * / }
   ------------------------------------------------------------
   ============================================================ */

const StorageAPI = (() => {
  const K = {
    reservas: "casamento.reservas.v2",
    rsvp: "casamento.rsvp.v1",
    guest: "casamento.guest.v1",
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sem espaço */ }
  }

  return {
    /* Mapa de reservas: { itemId: { nome, status, data } } */
    getReservas() {
      const base = read(K.reservas, {});
      // Estado de exemplo (para você ver os 3 estágios na primeira abertura)
      if (Object.keys(base).length === 0 && ESTADO_INICIAL_EXEMPLO) {
        const demo = Object.assign({}, ESTADO_INICIAL_EXEMPLO);
        write(K.reservas, demo);
        return demo;
      }
      return base;
    },
    saveReserva(itemId, dados) {
      const base = this.getReservas();
      if (dados === null) delete base[itemId];
      else base[itemId] = dados;
      write(K.reservas, base);
    },

    /* Confirmações de presença (RSVP) */
    getRsvp() { return read(K.rsvp, []); },
    addRsvp(entry) {
      const base = this.getRsvp();
      base.push(entry);
      write(K.rsvp, base);
    },
    clearRsvp() { write(K.rsvp, []); },

    /* Nome do convidado (lembrado neste dispositivo) */
    getGuestName() { return read(K.guest, ""); },
    setGuestName(nome) { write(K.guest, nome); },

    /* Utilitários do painel do casal */
    limparTudo() {
      localStorage.removeItem(K.reservas);
      localStorage.removeItem(K.rsvp);
    },
    restaurarDemo() {
      this.limparTudo();
      this.getReservas(); // recria o estado de exemplo
    },
  };
})();
