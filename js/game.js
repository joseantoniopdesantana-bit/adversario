import CONFIG from './config.js';
import state from './state.js';

/**
 * Lógica de negócio do jogo:
 * - Seleção da palavra do dia (determinística por data)
 * - Validação de tentativa
 * - Cálculo de feedback por letra (algoritmo Wordle)
 * - Controle de tentativas e fim de partida
 */

export class GameController {
  constructor(wordBank) {
    this.wordBank = wordBank; // { categoria: [palavras] }
    this.state = state;
  }

  /* ---------- Inicialização ---------- */

  init() {
    this.state.refreshToday();
    this.state.loadGame();
    this.state.loadStats();

    if (this.state.isNewDay()) {
      // Rolagem de streak entre dias (antes de iniciar o novo jogo)
      this.state.checkStreakRollover();
      this.pickWordOfTheDay();
    }

    return this.state.getGame();
  }

  /**
   * Seleciona a palavra de forma determinística baseada na data.
   * Assim, todos os usuários veem a mesma palavra no mesmo dia.
   */
  pickWordOfTheDay() {
    const cats = Object.keys(this.wordBank).filter(cat =>
      this.wordBank[cat].some(word => this.normalizeWord(word).length === CONFIG.WORD_LENGTH)
    );
    if (!cats.length) throw new Error(`O banco não contém palavras de ${CONFIG.WORD_LENGTH} letras.`);
    const dateSeed = this.state.today.replace(/-/g, '');
    const catIndex = this.hashCode(dateSeed) % cats.length;
    const catKey = cats[catIndex];
    const palavras = this.wordBank[catKey].map(w => this.normalizeWord(w))
      .filter(w => w.length === CONFIG.WORD_LENGTH);
    const wordIndex = this.hashCode(dateSeed + catKey) % palavras.length;
    this.state.startNewDay(catKey, palavras[wordIndex]);
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Converter para int32
    }
    return Math.abs(hash);
  }

  getGame() {
    return this.state.getGame();
  }

  normalizeWord(word) {
    return String(word).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleUpperCase('pt-BR');
  }

  /* ---------- Validação ---------- */

  validateGuess(guess) {
    guess = this.normalizeWord(guess).replace(/[^A-Z]/g, '');

    if (this.state.game?.finished) return { valid: false, error: 'finished' };
    if (guess.length !== CONFIG.WORD_LENGTH) {
      return { valid: false, error: 'length', len: CONFIG.WORD_LENGTH };
    }
    const allowed = Object.values(this.wordBank).flat().map(w => this.normalizeWord(w));
    if (!allowed.includes(guess)) {
      return { valid: false, error: 'notInDictionary' };
    }
    const alreadyUsed = this.state.game.guesses.some(g => g.letters.join('') === guess);
    if (alreadyUsed) {
      return { valid: false, error: 'repeated' };
    }

    return { valid: true, guess };
  }

  /* ---------- Feedback por letra (algoritmo Wordle) ---------- */

  computeFeedback(guess, target) {
    const guessLetters = guess.split('');
    const targetLetters = target.split('');
    const status = Array(CONFIG.WORD_LENGTH).fill('absent');
    const used = Array(CONFIG.WORD_LENGTH).fill(false);

    // Passo 1: letras corretas na posição correta (verdes)
    for (let i = 0; i < CONFIG.WORD_LENGTH; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        status[i] = 'correct';
        used[i] = true;
      }
    }

    // Passo 2: letras corretas em posição errada (amarelos)
    // Respeita multiplicidade de letras
    for (let i = 0; i < CONFIG.WORD_LENGTH; i++) {
      if (status[i] !== 'absent') continue;
      const idx = targetLetters.findIndex((ch, j) => !used[j] && ch === guessLetters[i]);
      if (idx >= 0) {
        status[i] = 'present';
        used[idx] = true;
      }
    }

    // Passo 3: restante fica ausente (cinza) — já inicializado como 'absent'

    return status;
  }

  /* ---------- Submeter tentativa ---------- */

  submitGuess(guess) {
    const validation = this.validateGuess(guess);
    if (!validation.valid) {
      return validation;
    }

    const { guess: cleanGuess } = validation;
    const status = this.computeFeedback(cleanGuess, this.state.game.palavra);
    const won = cleanGuess === this.state.game.palavra;

    this.state.addGuess(cleanGuess.split(''), status);

    if (won || this.state.game.turn >= CONFIG.MAX_TRIES) {
      this.state.updateStats(won);
    }

    return {
      valid: true,
      guess: cleanGuess,
      status,
      won,
      finished: this.state.game.finished,
      turn: this.state.game.turn,
      maxTries: CONFIG.MAX_TRIES,
      target: this.state.game.palavra,
      categoria: this.state.game.categoria
    };
  }

  /* ---------- Compartilhamento ---------- */

  buildShareText() {
    const g = this.state.game;
    const tries = g.turn;
    const plural = tries > 1 ? 's' : '';
    return `Acabei de jogar hoje e usei ${tries} tentativa${plural}! #PalavraDoDia`;
  }

  getStats() {
    return this.state.getStats();
  }
}

export default GameController;
