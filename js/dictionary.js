/**
 * dictionary.js
 * Dicionário de palavras e seleção da palavra secreta.
 * Suporte a modo diário (mesma palavra para todos na mesma data)
 * e modo livre (palavra sorteada aleatoriamente).
 */

const DICTIONARY = [
  "CÓDIGO", "PIXEL", "REDE", "SISTEMA", "DADOS", "CAMADA", "VISÃO", "FLUXO",
  "LÓGICA", "CRIAR", "APP", "WEB", "JAVA", "NÓS", "NUVEM", "TECNO", "DISCO",
  "MEMÓRIA", "TECLADO", "MOUSE", "TELA", "FOTO", "ÁUDIO", "VÍDEO", "LINHA",
  "CURVA", "PONTO", "ÁREA", "VOLUME", "MASSA", "FORÇA", "ENERGIA", "LUZ",
  "SOM", "COR", "FORMA", "ESPACO", "TEMPO", "RAZÃO", "MENTE", "IDEIA",
  "PLANO", "META", "OBJETO", "VALOR", "PREÇO", "CAIXA", "PASTA", "ARQUIVO",
  "LIVRO", "CANETA", "PAPEL", "TINTA", "BRASA", "VINHO", "MOBIL", "JOGOS",
  "NUVEM", "GASTO", "FLORES", "VIAGEM", "SONHO", "CAFÉ", "MÚSICA", "PAZ",
  "VIDA", "ARTE", "CASA", "SOL", "LUAR", "MAR", "RIO", "MONTANHA",
  "FLORESTA", "CAMINHO", "PONTE", "PORTA", "JANELA", "MESA", "CADEIRA",
  "CAMA", "TRAVESSEIRO", "COBERTA", "LUMINÁRIA", "RELÓGIO", "ESPelho".replace("É", "E"),
  "CHAVE", "FECHADURA", "CARRO", "BICICLETA", "ÔNIBUS", "TREM", "AVIÃO", "NAVIO",
  "BICHO", "GATO", "CACHORRO", "PÁSSARO", "PEIXE", "COBRA", "LAGARTO", "SAPO",
  "FRUTA", "MAÇÃ", "BANANA", "UVA", "LARANJA", "MORANGO", "MELANCIA", "MAMÃO",
  "LEITE", "PÃO", "QUEIJO", "CARNE", "FEIJÃO", "ARROZ", "MACARRÃO", "SOPA",
  "SALADA", "SUCO", "CHÁ", "ÁGUA", "CERVEJA", "REFRIGERANTE"
].map(w => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase())
  .filter((w, i, arr) => arr.indexOf(w) === i) // remove duplicados após normalização
  .filter(w => w.length >= 4 && w.length <= 7);

/**
 * Retorna um número sequencial baseado na data atual (modo diário).
 * Todos os usuários que acessarem no mesmo dia recebem o mesmo número.
 */
function getDayIndex() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const epoch = today.getTime();
  const dayIndex = Math.floor(epoch / (1000 * 60 * 60 * 24));
  return dayIndex;
}

/**
 * Retorna a palavra secreta do modo diário.
 * Baseada na data atual, garante a mesma palavra para todos no mesmo dia.
 */
function getWordOfTheDay() {
  const index = getDayIndex() % DICTIONARY.length;
  return DICTIONARY[index];
}

/**
 * Retorna uma palavra aleatória (modo livre).
 */
function getRandomWord() {
  const index = Math.floor(Math.random() * DICTIONARY.length);
  return DICTIONARY[index];
}

/**
 * Normaliza uma string para comparação (remove acentos e deixa maiúscula).
 */
function normalize(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}
