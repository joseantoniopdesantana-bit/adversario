const CONFIG = {
  WORD_LENGTH: 6,
  MAX_TRIES: 6,
  LANG: 'pt-BR',
  STORAGE_KEY_GAME: 'palavraJogo',
  STORAGE_KEY_STATS: 'palavraStats',
  DATE_FORMAT: 'YYYY-MM-DD',
  CATEGORIAS: [
    { nome: 'Animais', chave: 'animais' },
    { nome: 'Comida', chave: 'comida' },
    { nome: 'Ciencia', chave: 'ciencia' },
    { nome: 'Esportes', chave: 'esportes' }
  ],
  MESSAGES: {
    ptBR: {
      title: 'Palavra do Dia',
      subtitle: 'Adivinhe a palavra de 6 letras em até 6 tentativas.',
      start: 'Iniciar',
      playAgain: 'Jogar amanhã',
      backHome: 'Voltar ao início',
      stats: 'Estatísticas',
      copy: 'Copiar resultado',
      categoryLabel: 'Tema',
      turnLabel: 'Tentativa',
      of: 'de',
      win: 'Parabéns!',
      lose: 'Não foi dessa vez',
      used: 'Você acertou em {{count}} tentativa{{plural}}!',
      wordReveal: 'PALAVRA: {{word}}',
      invalidLength: 'Digite {{len}} letras',
      invalidWord: 'Palavra não encontrada no dicionário',
      repeated: 'Você já tentou esta palavra',
      tomorrow: 'Volte amanhã',
      tomorrowBody: 'Você já jogou hoje. Uma nova palavra espera por você.',
      streak: 'streak',
      bestStreak: 'melhor streak',
      wins: 'vitórias',
      total: 'partidas',
      copied: 'Copiado!',
      ariaTile: 'Letra {{letter}}, posição {{pos}}: {{status}}',
      statusCorrect: 'correta, posição certa',
      statusPresent: 'correta, outro lugar',
      statusAbsent: 'não existe na palavra',
      percentAcerto: 'percentual de acerto',
      ultimaPalavra: 'ultima palavra'
    }
  }
};

export default CONFIG;
