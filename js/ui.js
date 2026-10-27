import CONFIG from './config.js';

/**
 * Camada de interface: renderização de telas, teclado, tiles, alertas e toast.
 * Suporta digitação direta nos quadrados (clique ou teclado físico).
 * Sem lógica de negócio — apenas DOM.
 */

export class UI {
  constructor() {
    this.elements = this.cacheElements();
    // Estado de digitação direta nos quadrados
    this.currentRow = 0;
    this.currentCol = 0;
    this.currentLetters = Array(CONFIG.WORD_LENGTH).fill('');
    this.callbacks = {}; // onKeyClick, onBackspace, onEnter, onTileClick
  }

  cacheElements() {
    return {
      screenHome: document.getElementById('screen-home'),
      screenGame: document.getElementById('screen-game'),
      screenResult: document.getElementById('screen-result'),
      board: document.getElementById('board'),
      keyboard: document.getElementById('keyboard'),
      alert: document.getElementById('alert'),
      turnNum: document.getElementById('turnNum'),
      gameCatName: document.getElementById('gameCatName'),
      homeCatName: document.getElementById('homeCatName'),
      homeCat: document.getElementById('homeCat'),
      catBadge: document.getElementById('catBadge'),
      resultTitle: document.getElementById('resultTitle'),
      resultMsg: document.getElementById('resultMsg'),
      wordReveal: document.getElementById('wordReveal'),
      statStreak: document.getElementById('statStreak'),
      statBest: document.getElementById('statBest'),
      statWin: document.getElementById('statWin'),
      statTotal: document.getElementById('statTotal'),
      statAccuracy: document.getElementById('statAccuracy'),
      statLastWord: document.getElementById('statLastWord'),
      modalOverlay: document.getElementById('modalOverlay'),
      toast: document.getElementById('toast')
    };
  }

  /* ---------- Callbacks ---------- */

  on(eventName, fn) {
    this.callbacks[eventName] = fn;
  }

  /* ---------- Navegação de telas ---------- */

  showHome() {
    this.hideAll();
    this.elements.screenHome.classList.add('active');
  }

  showGame() {
    this.hideAll();
    this.elements.screenGame.classList.add('active');
  }

  showResult() {
    this.hideAll();
    this.elements.screenResult.classList.add('active');
  }

  hideAll() {
    [this.elements.screenHome, this.elements.screenGame, this.elements.screenResult].forEach(el => {
      if (el) el.classList.remove('active');
    });
  }

  /* ---------- Cabeçalho ---------- */

  setCategory(categoria) {
    this.elements.homeCatName.textContent = categoria;
    this.elements.gameCatName.textContent = categoria;
    this.elements.catBadge.textContent = categoria;
    if (this.elements.homeCat) {
      this.elements.homeCat.style.display = categoria ? 'flex' : 'none';
    }
  }

  /* ---------- Tabuleiro ---------- */

  renderBoard(guesses, wordLength = CONFIG.WORD_LENGTH, maxTries = CONFIG.MAX_TRIES) {
    const board = this.elements.board;
    board.innerHTML = '';
    this.currentRow = Math.min(guesses.length, maxTries - 1);
    this.currentCol = 0;
    this.resetCurrentLetters();

    for (let r = 0; r < maxTries; r++) {
      const row = document.createElement('div');
      row.className = 'row';

      for (let c = 0; c < wordLength; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile empty';
        tile.setAttribute('aria-label', this.ariaTileLabel('', r + 1, c + 1, ''));
        tile.setAttribute('data-row', r);
        tile.setAttribute('data-col', c);
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '-1');

        // Clique no tile para selecionar/editar
        tile.addEventListener('click', () => {
          this.selectTile(r, c);
        });

        // Teclado dentro do tile
        tile.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectTile(r, c);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            e.stopPropagation();
            this.selectTile(r, Math.max(0, c - 1));
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            this.selectTile(r, Math.min(wordLength - 1, c + 1));
          }
        });

        const g = guesses[r];
        const letter = g && Array.isArray(g.letters) ? g.letters[c] : '';
        const status = g && Array.isArray(g.status) ? g.status[c] : '';
        if (letter) {
          tile.classList.remove('empty');
          tile.classList.add('revealed', status);
          tile.textContent = letter;
          tile.setAttribute('aria-label', this.ariaTileLabel(letter, r + 1, c + 1, status));
          tile.classList.remove('empty');
          tile.classList.add('animating');
        }

        row.appendChild(tile);
      }
      board.appendChild(row);
    }

    // Seleciona o primeiro tile vazio da linha atual
    this.selectTile(this.currentRow, this.currentCol);
  }

  selectTile(r, c) {
    if (r < 0 || r >= CONFIG.MAX_TRIES || c < 0 || c >= CONFIG.WORD_LENGTH) return;
    if (r !== this.currentRow) return;

    const guesses = this._getGuessesFromBoard();
    const g = guesses[r];
    if (g && g[c]) return; // já revelado, não permite editar

    this.currentRow = r;
    this.currentCol = c;

    // Remover seleção anterior
    document.querySelectorAll('.tile.selected').forEach(el => {
      el.classList.remove('selected');
      el.setAttribute('tabindex', '-1');
    });

    const tile = this.elements.board.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
    if (tile) {
      tile.classList.add('selected');
      tile.setAttribute('tabindex', '0');
      tile.focus();
    }
  }

  // Lê as letras já reveladas do board para não permitir editar
  _getGuessesFromBoard() {
    // Retorna uma cópia simples das letras reveladas no DOM
    const result = [];
    const rows = this.elements.board.querySelectorAll('.row');
    rows.forEach((row, r) => {
      result[r] = {};
      const tiles = row.querySelectorAll('.tile');
      tiles.forEach((tile, c) => {
        if (tile.classList.contains('revealed') && tile.textContent) {
          result[r][c] = tile.textContent;
        }
      });
    });
    return result;
  }

  /* ---------- Digitação direta ---------- */

  typeChar(ch) {
    if (this.currentRow >= CONFIG.MAX_TRIES) return;
    const tile = this.elements.board.querySelector(
      `.tile[data-row="${this.currentRow}"][data-col="${this.currentCol}"]`
    );
    if (tile && !tile.classList.contains('revealed')) {
      tile.textContent = ch.toUpperCase();
      tile.classList.remove('empty');
      tile.setAttribute('aria-label', this.ariaTileLabel(ch.toUpperCase(), this.currentRow + 1, this.currentCol + 1, ''));
      this.currentLetters[this.currentCol] = ch.toUpperCase();
      if (this.currentCol < CONFIG.WORD_LENGTH - 1) {
        this.selectTile(this.currentRow, this.currentCol + 1);
      }
    }
  }

  deleteChar() {
    if (this.currentRow >= CONFIG.MAX_TRIES) return;
    let col = this.currentCol;
    let tile = this.elements.board.querySelector(
      `.tile[data-row="${this.currentRow}"][data-col="${this.currentCol}"]`
    );
    if (tile && !tile.classList.contains('revealed')) {
      if (!tile.textContent && col > 0) {
        col--;
        tile = this.elements.board.querySelector(
          `.tile[data-row="${this.currentRow}"][data-col="${col}"]`
        );
      }
      this.currentCol = col;
      tile.textContent = '';
      tile.classList.add('empty');
      tile.setAttribute('aria-label', this.ariaTileLabel('', this.currentRow + 1, col + 1, ''));
      this.currentLetters[col] = '';
      this.selectTile(this.currentRow, col);
    }
  }

  getCurrentGuess() {
    return this.currentLetters.join('').toUpperCase();
  }

  resetCurrentLetters() {
    this.currentLetters = Array(CONFIG.WORD_LENGTH).fill('');
  }

  /* ---------- Teclado virtual ---------- */

  renderKeyboard(onKeyClick, onBackspace, onEnter) {
    const kb = this.elements.keyboard;
    kb.innerHTML = '';

    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ÇZXCVBNM'];

    rows.forEach((rowStr, rowIdx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '5px';
      row.style.justifyContent = 'center';
      row.style.marginBottom = '5px';

      [...rowStr].forEach(ch => {
        const k = document.createElement('button');
        k.className = 'key';
        k.textContent = ch;
        k.type = 'button';
        k.setAttribute('aria-label', `Tecla ${ch}`);
        k.addEventListener('click', () => {
          if (onKeyClick) onKeyClick(ch);
          this.typeChar(ch);
        });
        row.appendChild(k);
      });

      if (rowIdx === 1) {
        const del = document.createElement('button');
        del.className = 'key wide';
        del.textContent = 'APAGAR';
        del.type = 'button';
        del.setAttribute('aria-label', 'Apagar letra');
        del.addEventListener('click', () => {
          if (onBackspace) onBackspace();
          this.deleteChar();
        });
        row.appendChild(del);
      }

      if (rowIdx === 2) {
        const ent = document.createElement('button');
        ent.className = 'key wide';
        ent.textContent = 'ENTER';
        ent.type = 'button';
        ent.setAttribute('aria-label', 'Enviar tentativa');
        ent.addEventListener('click', () => {
          if (onEnter) onEnter();
        });
        row.appendChild(ent);
      }

      kb.appendChild(row);
    });
  }

  updateKeyboardKey(letter, status) {
    const priority = { absent: 0, present: 1, correct: 2 };
    const keys = this.elements.keyboard.querySelectorAll('.key');
    keys.forEach(k => {
      if (k.textContent === letter.toUpperCase()) {
        const current = k.className;
        const currentStatus = current.split(' ').find(c => priority[c] !== undefined);
        const currentPrio = currentStatus ? priority[currentStatus] : 0;
        const newPrio = priority[status] || 0;
        if (newPrio >= currentPrio) {
          k.className = `key ${status}`;
        }
      }
    });
  }

  ariaTileLabel(letter, row, pos, status) {
    const labels = {
      correct: 'correta e na posição certa',
      present: 'presente em outra posição',
      absent: 'não está na palavra'
    };
    const value = letter ? `letra ${letter}` : 'vazia';
    return `Linha ${row}, coluna ${pos}: ${value}, ${labels[status] || 'sem resultado'}`;
  }

  /* ---------- Alerta ---------- */

  showAlert(message, duration = 2200) {
    this.elements.alert.textContent = message;
    this.elements.alert.setAttribute('aria-live', 'polite');
    this.elements.alert.style.display = 'block';
    setTimeout(() => {
      this.elements.alert.style.display = 'none';
      this.elements.alert.removeAttribute('aria-live');
    }, duration);
  }

  /* ---------- Resultado ---------- */

  renderResult(result, stats) {
    const won = result.won;
    this.elements.resultTitle.textContent = won ? CONFIG.MESSAGES.ptBR.win : CONFIG.MESSAGES.ptBR.lose;
    this.elements.resultMsg.textContent = won
      ? CONFIG.MESSAGES.ptBR.used
        .replace('{{count}}', result.turn)
        .replace('{{plural}}', result.turn > 1 ? 's' : '')
      : `A palavra era ${result.target}.`;
    this.elements.wordReveal.textContent = `${CONFIG.MESSAGES.ptBR.wordReveal.replace('{{word}}', result.target)}`;
    this.elements.statStreak.textContent = stats.streak;
    this.elements.statBest.textContent = stats.bestStreak;
    this.elements.statWin.textContent = stats.wins;
    this.elements.statTotal.textContent = stats.total;
    this.elements.statAccuracy.textContent = stats.total
      ? `${Math.round((stats.wins / stats.total) * 100)}%`
      : '0%';
    this.elements.statLastWord.textContent = stats.lastWord || '—';
  }

  /* ---------- Modal ---------- */

  showModal() {
    this.elements.modalOverlay.style.display = 'flex';
    this.elements.modalOverlay.setAttribute('aria-hidden', 'false');
    const focusable = this.elements.modalOverlay.querySelectorAll('button');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  hideModal() {
    this.elements.modalOverlay.style.display = 'none';
    this.elements.modalOverlay.setAttribute('aria-hidden', 'true');
  }

  /* ---------- Toast ---------- */

  showToast(message, duration = 1800) {
    this.elements.toast.textContent = message;
    this.elements.toast.setAttribute('aria-live', 'polite');
    this.elements.toast.style.display = 'block';
    setTimeout(() => {
      this.elements.toast.style.display = 'none';
      this.elements.toast.removeAttribute('aria-live');
    }, duration);
  }
}

export default UI;
