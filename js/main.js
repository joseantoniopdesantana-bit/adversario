import CONFIG from './config.js';
import GameController from './game.js';
import UI from './ui.js';
import Share from './share.js';

/**
 * Orquestração principal do jogo.
 */

let game = null;
let ui = null;
let share = null;
let wordBank = null;

// Elementos de ação
let btnStart, btnPlayAgain, btnBackHome, btnCopy, btnStats, btnCloseModal;

/**
 * Carrega o banco de palavras via fetch (evita problema de MIME type com import estática de JSON).
 */
async function loadWordBank() {
  try {
    const response = await fetch('words/seed-pt-BR.json');
    if (!response.ok) throw new Error(`Falha ao carregar palavras: ${response.status}`);
    wordBank = await response.json();
    return wordBank;
  } catch (e) {
    console.error(e);
    alert('Erro ao carregar o banco de palavras. Verifique o console.');
    return null;
  }
}

/* ---------- Inicialização ---------- */

async function init() {
  try {
    wordBank = await loadWordBank();
    if (!wordBank) return;

    ui = new UI();
    game = new GameController(wordBank);
    share = new Share(ui);

    const current = game.init();
    renderHeader(current.categoria);

    // Se já terminou hoje, mostra modal
    if (current.finished) {
      ui.renderResult({ won: current.won, turn: current.turn, target: current.palavra }, game.getStats());
      ui.showResult();
      const startButton = document.getElementById('btnStart');
      if (startButton) startButton.disabled = true;
    } else {
      ui.showHome();
    }

    bindButtons();
    setupDailyRefresh();
  } catch (e) {
    console.error('Erro na inicialização:', e);
    alert('Erro ao iniciar o jogo. Verifique o console do navegador (F12).');
  }
}

function renderHeader(categoria) {
  if (ui) ui.setCategory(categoria);
}

function bindButtons() {
  // Tela inicial
  btnStart = document.querySelector('#screen-home .btn-primary');
  if (btnStart) {
    btnStart.onclick = () => startGame();
  }

  // Tela de resultado
  const btnBack = document.getElementById('btnBackHome');
  if (btnBack) btnBack.onclick = () => ui.showHome();

  btnPlayAgain = document.querySelector('#screen-result .btn-primary');
  if (btnPlayAgain) {
    btnPlayAgain.onclick = () => {
      if (ui) { ui.hideModal(); ui.showHome(); }
    };
  }

  btnCopy = document.querySelector('#screen-result .btn-copy');
  if (btnCopy) {
    btnCopy.onclick = () => {
      if (game) {
        const text = game.buildShareText();
        share.share(text);
      }
    };
  }

  // Modal
  btnStats = document.querySelector('#modalOverlay .btn-ghost');
  btnCloseModal = document.querySelector('#modalOverlay .btn-primary');
  if (btnStats) btnStats.onclick = () => { if (ui) { ui.hideModal(); ui.showHome(); } };
  if (btnCloseModal) btnCloseModal.onclick = () => { if (ui) { ui.hideModal(); ui.showHome(); } }
}

function startGame() {
  if (!game || !ui) return;

  const current = game.getGame ? game.getGame() : null;
  if (!current || current.finished) {
    if (current?.finished) {
      ui.renderResult({ won: current.won, turn: current.turn, target: current.palavra }, game.getStats());
      ui.showResult();
    }
    return;
  }

  const turn = current.turn;
  ui.showGame();
  ui.renderBoard(current ? current.guesses : [], CONFIG.WORD_LENGTH, CONFIG.MAX_TRIES);
  ui.elements.turnNum.textContent = `${(turn || 0) + 1} ${CONFIG.MESSAGES.ptBR.of} ${CONFIG.MAX_TRIES}`;

  // Render teclado virtual (callbacks já estão integrados no ui.js)
  ui.renderKeyboard(
    (ch) => { /* teclado virtual chama ui.typeChar internamente */ },
    () => { /* backspace chama ui.deleteChar internamente */ },
    () => handleSubmit() // ENTER submete a tentativa
  );

  // Teclado físico global
  setupGlobalKeyboard();
}

function setupGlobalKeyboard() {
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('keydown', handleGlobalKeydown);
}

function setupDailyRefresh() {
  window.setInterval(refreshDailyGame, 60_000);
  window.addEventListener('focus', refreshDailyGame);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshDailyGame();
  });
}

function refreshDailyGame() {
  if (!game || !ui || game.state.getLocalDateKey() === game.state.today) return;

  const current = game.init();
  renderHeader(current.categoria);
  ui.resetCurrentLetters();
  ui.showHome();
  if (btnStart) btnStart.disabled = Boolean(current.finished);
}

function handleGlobalKeydown(e) {
  if (e.target instanceof Element && e.target.closest('button')) return;

  if (document.getElementById('screen-game').classList.contains('active') && !game.getGame().finished) {
    // Letras
    if (/^[a-záàâãéêíóôõúüç]$/i.test(e.key)) {
      e.preventDefault();
      ui.typeChar(e.key.toUpperCase());
    }
    // Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      ui.deleteChar();
    }
    // Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    // Setas
  }
}

function handleSubmit() {
  if (!game || !ui) return;

  const guess = ui.getCurrentGuess();

  if (guess.length !== CONFIG.WORD_LENGTH || guess.includes('')) {
    ui.showAlert(`Preencha todas as ${CONFIG.WORD_LENGTH} letras`);
    return;
  }

  const result = game.submitGuess(guess);

  if (!result.valid) {
    let msg = '';
    if (result.error === 'length') {
      msg = CONFIG.MESSAGES.ptBR.invalidLength.replace('{{len}}', result.len);
    } else if (result.error === 'finished') {
      msg = 'Esta partida já foi concluída.';
    } else if (result.error === 'notInDictionary') {
      msg = CONFIG.MESSAGES.ptBR.invalidWord;
    } else if (result.error === 'repeated') {
      msg = CONFIG.MESSAGES.ptBR.repeated;
    }
    ui.showAlert(msg);
    return;
  }

  // Renderiza tabuleiro com animação
  const current = game.state.getGame();
  ui.renderBoard(current.guesses, CONFIG.WORD_LENGTH, CONFIG.MAX_TRIES);
  ui.elements.turnNum.textContent = `${result.turn} ${CONFIG.MESSAGES.ptBR.of} ${CONFIG.MAX_TRIES}`;

  // Limpa letras da linha atual para a próxima tentativa
  ui.resetCurrentLetters();
  ui.currentRow = result.turn;
  ui.currentCol = 0;
  if (!result.finished) ui.selectTile(ui.currentRow, ui.currentCol);

  // Atualiza teclado virtual com cores das letras usadas
  result.guess.split('').forEach((ch, i) => {
    ui.updateKeyboardKey(ch, result.status[i]);
  });

  if (result.finished) {
    setTimeout(() => {
      ui.renderResult(result, game.getStats());
      ui.showResult();
      const startButton = document.getElementById('btnStart');
      if (startButton) startButton.disabled = true;
    }, 700);
  }
}

// Tratamento global de erros
window.addEventListener('error', (e) => {
  console.error('Erro não tratado:', e.error);
  alert('Erro no jogo: ' + (e.message || 'desconhecido') + '. Verifique o console (F12).');
});

// Inicia quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
