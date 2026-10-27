import CONFIG from './config.js';

/**
 * Gerenciamento de estado do jogo via localStorage.
 * Sem cadastro: tudo persiste localmente no navegador.
 */

export class GameState {
  constructor() {
    this.game = null;
    this.stats = null;
    this.today = this.getLocalDateKey(); // YYYY-MM-DD
  }

  getLocalDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  refreshToday(date = new Date()) {
    const today = this.getLocalDateKey(date);
    if (today === this.today) return false;
    this.today = today;
    return true;
  }

  /* ---------- Estado da partida do dia ---------- */

  loadGame() {
    let raw;
    try { raw = localStorage.getItem(CONFIG.STORAGE_KEY_GAME); } catch (e) { console.warn('localStorage indisponível:', e); return null; }
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!this.validateGameSchema(parsed)) {
        console.warn('Estado do jogo com esquema inválido, ignorando.');
        return null;
      }
      this.game = parsed;
      return this.game;
    } catch (e) {
      console.warn('Falha ao ler estado do jogo:', e);
      return null;
    }
  }

  saveGame() {
    if (!this.game) return;
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_GAME, JSON.stringify(this.game));
    } catch (e) {
      console.warn('Falha ao salvar estado do jogo (localStorage cheio?):', e);
    }
  }

  startNewDay(categoria, palavra) {
    this.game = {
      date: this.today,
      categoria,
      palavra,
      turn: 0,
      guesses: [],
      finished: false,
      won: false
    };
    this.saveGame();
  }

  isNewDay() {
    return !this.game || this.game.date !== this.today;
  }

  addGuess(letters, status) {
    if (!this.game) return;
    this.game.guesses.push({ letters, status });
    this.game.turn++;
    if (letters.join('') === this.game.palavra || this.game.turn >= CONFIG.MAX_TRIES) {
      this.game.finished = true;
      this.game.won = letters.join('') === this.game.palavra;
    }
    this.saveGame();
  }

  /* ---------- Estatísticas ---------- */

  loadStats() {
    let raw;
    try { raw = localStorage.getItem(CONFIG.STORAGE_KEY_STATS); } catch (e) { console.warn('localStorage indisponível:', e); raw = null; }
    if (!raw) {
      this.stats = { streak: 0, bestStreak: 0, wins: 0, total: 0, lastWord: null, lastPlayedDate: null };
      return this.stats;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!this.validateStatsSchema(parsed)) {
        console.warn('Estatísticas com esquema inválido, resetando.');
        this.stats = { streak: 0, bestStreak: 0, wins: 0, total: 0, lastWord: null, lastPlayedDate: null };
        return this.stats;
      }
      this.stats = parsed;
      // Garante campos ausentes em dados antigos
      if (this.stats.lastPlayedDate === undefined) this.stats.lastPlayedDate = null;
      return this.stats;
    } catch (e) {
      console.warn('Falha ao ler estatísticas:', e);
      this.stats = { streak: 0, bestStreak: 0, wins: 0, total: 0, lastWord: null, lastPlayedDate: null };
      return this.stats;
    }
  }

  saveStats() {
    if (!this.stats) return;
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_STATS, JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Falha ao salvar estatísticas (localStorage cheio?):', e);
    }
  }

  updateStats(won) {
    if (!this.stats) return;
    this.stats.total++;
    this.stats.lastPlayedDate = this.today;
    if (won) {
      this.stats.wins++;
      this.stats.streak++;
      if (this.stats.streak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.streak;
      }
      this.stats.lastWord = this.game.palavra;
    } else {
      this.stats.streak = 0;
    }
    this.saveStats();
  }

  /**
   * Verifica se o streak deve ser mantido ou resetado com base no dia anterior.
   * Chamado ao carregar o jogo em um novo dia.
   */
  checkStreakRollover() {
    if (!this.stats || !this.game) return;
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = this.getLocalDateKey(yesterdayDate);
    const playedYesterday = this.stats.lastPlayedDate === yesterday;
    // Se não jogou/venceu no dia anterior e o streak está ativo, reseta
    if (!playedYesterday && this.stats.streak > 0) {
      this.stats.streak = 0;
      this.saveStats();
    }
  }

  validateGameSchema(data) {
    return (
      data &&
      typeof data.date === 'string' &&
      typeof data.categoria === 'string' &&
      typeof data.palavra === 'string' &&
      typeof data.turn === 'number' &&
      Array.isArray(data.guesses) &&
      typeof data.finished === 'boolean' &&
      typeof data.won === 'boolean'
    );
  }

  validateStatsSchema(data) {
    return (
      data &&
      typeof data.streak === 'number' &&
      typeof data.bestStreak === 'number' &&
      typeof data.wins === 'number' &&
      typeof data.total === 'number' &&
      (data.lastWord === null || typeof data.lastWord === 'string') &&
      (data.lastPlayedDate === null || typeof data.lastPlayedDate === 'string' || data.lastPlayedDate === undefined)
    );
  }

  getStats() {
    return this.stats;
  }

  getGame() {
    return this.game;
  }
}

export default new GameState();
