/**
 * storage.js
 * Persistência de estatísticas no localStorage do navegador.
 */

const STORAGE_KEY = "palavras_stats";

const DEFAULT_STATS = {
  played: 0,
  wins: 0,
  streak: 0,
  maxStreak: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  lastPlayedDay: null
};

/**
 * Carrega as estatísticas salvas ou retorna valores padrão.
 */
function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch (e) {
    console.warn("Erro ao ler localStorage:", e);
    return { ...DEFAULT_STATS };
  }
}

/**
 * Salva as estatísticas no localStorage.
 */
function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("Erro ao gravar localStorage:", e);
  }
}

/**
 * Retorna a data atual no formato YYYY-MM-DD.
 */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
