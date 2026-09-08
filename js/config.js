/* ============================================================
   CONFIG DO SITE — EDITAR AQUI
   Troque os nomes, a data, o local e as fotos de vocês.
   ============================================================ */

const CASAL = {
  noivo: "Júlio",        // ← SEU NOME
  noiva: "Isabelle",     // ← NOME DA NOIVA
  iniciais: "J & I",     // Monograma (troque pelas iniciais de vocês)
  data: "2027-04-03T15:30:00", // Data e hora do casamento (ISO 8601)
  dataExibicao: "3 de Abril de 2027 · 15h30",
  dataFooter: "03 · 04 · 2027",
  cidade: "Salto, SP",

  // ----- CERIMÔNIA (igreja) -----
  cerimonia: "Paróquia São Benedito",
  cerimoniaEndereco: "Salto/SP",
  cerimoniaMapa: "https://maps.google.com/?q=Par%C3%B3quia+S%C3%A3o+Benedito+Salto+SP",

  // ----- FESTA (recepção) -----
  festa: "Sindicato dos Químicos",
  festaEndereco: "R. Batalha do Riachuelo, 6820 — Centro de Lazer do Sindicato dos Trabalhadores das Indústrias Químicas, Salto/SP",
  festaMapa: "https://maps.google.com/?q=R.+Batalha+do+Riachuelo,+6820,+Centro+de+Lazer+Sindicato+dos+Trabalhadores+das+Ind%C3%BAstrias+Qu%C3%ADmicas,+Salto+SP",

  // (compatibilidade — o site usa os campos acima)
  local: "Paróquia São Benedito",
  endereco: "Salto/SP",
  mapaUrl: "https://maps.google.com/?q=Par%C3%B3quia+S%C3%A3o+Benedito+Salto+SP",
  historia: "Nos conhecemos em 2017, ainda na escola. Fazíamos parte do mesmo grupo de amigos e, aos poucos, fomos nos aproximando.\n\nMas a nossa história de amor só começou, de verdade, em 2022, quando começamos a namorar.\n\nE todo o caminho que percorremos até chegar aqui — cada momento, cada escolha, cada dificuldade e cada conquista — vocês já conhecem.\n\nHoje, estamos diante de um novo capítulo dessa história.\n\nUm capítulo ainda mais especial, porque agora vamos continuar escrevendo essa linda história de amor juntos, construindo nossos sonhos e, acima de tudo, começando a formar a nossa própria família.",
  frase: "“A medida do amor é amar sem medida.”",
  fraseAutor: "— Santo Agostinho",
  // Fotos (opcional): cole o caminho/URL de uma foto de vocês.
  // Deixe "" para usar o monograma elegante padrão.
  fotoHero: "",
  fotoHistoria: "img/casal-historia.jpg",
  // Contato para os convidados tirarem dúvidas (WhatsApp)
  contato: "(11) 97951-1534 e (11) 96857-2530",
  whatsapp: [
    { numero: "11979511534", rotulo: "WhatsApp 1" },
    { numero: "11968572530", rotulo: "WhatsApp 2" },
  ],
};

/* Senha do painel do casal (admin.html) — TROQUE por uma de vocês! */
const ADMIN_SENHA = "amor2027";

/* Textos de ajuda que aparecem na lista de presentes */
const TEXTO_LISTA = {
  titulo: "Lista de Presentes",
  subtitulo: "O presente mais importante é a sua presença. Mas se quiser nos presentear, escolha um item abaixo e reserve — assim evitamos presentes repetidos. 💛",
  reservadoAviso: "Presente reservado — outra pessoa já escolheu este item.",
  compradoAviso: "Presente comprado! Obrigado por fazer parte da nossa história. 🤍",
};
