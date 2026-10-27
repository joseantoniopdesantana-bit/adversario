# SPECS — Documento Técnico de Projeto

Jogo Casual de Adivinhação de Palavras  
**Versão:** 1.0  
**Data:** 22/10/2026  
**Base:** PRD.md + Protótipo 3 (Estilo Escuro / Moderno)

---

## 1. Visão Geral

Este documento especifica a implementação técnica de um jogo casual de adivinhação de palavras (word-guessing), inspirado em Wordle/Termo, com foco em experiência mobile-first, sessões curtas, estatísticas de progressão, modo diário e compartilhamento de resultados.

O design de referência é o **Protótipo 3 (Dark Modern)**: tema escuro, painel central, estatísticas em linha, teclado virtual, feedback por cores com suporte a acessibilidade (contraste, navegação por teclado, ARIA).

---

## 2. Escopo Funcional (MVP)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| F01 | Jogador digita palavra de 6 letras (chute) | Essencial |
| F02 | Sistema valida chute e retorna feedback por posição (correta/presente/ausente) | Essencial |
| F03 | Máximo de 6 tentativas por partida | Essencial |
| F04 | Vitória ao acertar a palavra secreta antes de esgotar tentativas | Essencial |
| F05 | Derrota ao esgotar tentativas; palavra secreta revelada | Essencial |
| F06 | Modo diário: uma palavra secreta por dia para todos os jogadores | Essencial |
| F07 | Modo livre: fora do MVP atual | Fora do escopo |
| F08 | Estatísticas locais: partidas, vitórias, sequência, taxa de acerto | Essencial |
| F09 | Persistência de estatísticas via `localStorage` | Essencial |
| F10 | Teclado virtual responsivo; tentativas são normalizadas sem acentos | Essencial |
| F11 | Suporte a teclado físico (Enter, Backspace, letras) | Essencial |
| F12 | Botão de dica | Fora do MVP atual |
| F13 | Compartilhamento de resultado (texto sem spoiler) | Importante |
| F14 | Acessibilidade: ARIA labels, contraste adequado, navegação por tab | Essencial |
| F15 | Modo escuro fixo (tema do Protótipo 3) | Essencial |

**Fora do escopo (MVP):** login/cadastro, ranking global, compras no app, anúncios, multiplayer em tempo real.

---

### Ajustes de escopo e limitações da versão corrigida

- O tamanho definido pelo código e pelo PRD é de **6 letras**, com até 6 tentativas.
- O desafio diário é determinístico pela data local do navegador. Sem backend, não é possível impor uma única data global entre fusos horários ou impedir que alguém altere o relógio/dispositivo.
- O progresso é armazenado localmente no navegador; não sincroniza entre dispositivos.
- O banco inicial é pequeno e serve como MVP. A validação aceita palavras presentes nesse banco; ampliar o vocabulário é necessário antes de publicar.
- Não há modo livre nem botão de dica nesta versão.
- A normalização remove diacríticos para comparação (por exemplo, FEIJÃO é comparado como FEIJAO).

## 3. Stack de Tecnologia

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | HTML5 semântico + CSS3 + JavaScript (ES6+) | Zero dependências, execução nativa no navegador, fácil deploy estático |
| Estilização | CSS puro com variáveis CSS (`:root`) | Tema escuro consistente, fácil manutenção |
| Armazenamento | `localStorage` do navegador | Persistência local de estatísticas sem backend |
| Build/Deploy | Hospedagem estática (GitHub Pages, Netlify, Vercel) | Implantação simples e gratuita |
| Testes | Jest (opcional) + testes manuais de navegador | Validação de lógica de jogo |
| Versionamento | Git | Controle de versão |

---

## 4. Arquitetura de Software

### 4.1 Padrão adotado

Arquitetura baseada em componentes funcionais com separação de responsabilidades:

- **Camada de apresentação:** HTML + CSS (UI estática e reativa via manipulação do DOM)
- **Camada de lógica de jogo:** JavaScript puro (state machine, validação de chutes, dicionário)
- **Camada de persistência:** `localStorage` (estatísticas e configurações)

### 4.2 Fluxo de dados (estado da aplicação)

```
[Início] → [Sorteia palavra secreta] → [Jogador digita chute]
                                          ↓
                                    [Valida chute]
                                          ↓
                               [Feedback por cor por posição]
                                          ↓
                               [Acertou?] ──Não──→ [Tentativas esgotadas?]
                                          ↓Sim           ↓Não
                                  [Vitória]         [Próxima linha]
                                          ↓           ↳ Volta para digitar
                                  [Atualiza estatísticas]
                                          ↓
                                    [Fim de partida]
```

### 4.3 Máquina de estados (estados do jogo)

| Estado | Descrição | Transição |
|--------|-----------|-----------|
| `IDLE` | Aguardando interação | → `PLAYING` ao iniciar |
| `PLAYING` | Partida ativa, digitando chute | → `EVALUATING` ao pressionar Enter |
| `EVALUATING` | Animando feedback das letras | → `PLAYING` (próxima linha) ou `GAME_OVER` |
| `WIN` | Jogador acertou a palavra | → `IDLE` (novo jogo) |
| `LOSS` | Jogador esgotou tentativas | → `IDLE` (novo jogo) |

---

## 5. Estrutura de Diretórios

```
jogo-palavras/
├── index.html              # Página única (SPA)
├── css/
│   └── style.css           # Estilos (tema escuro, variáveis, responsivo)
├── js/
│   ├── game.js             # Lógica principal do jogo (state machine, validação)
│   ├── dictionary.js       # Dicionário de palavras e seleção da palavra secreta
│   ├── storage.js          # Leitura/gravação de estatísticas no localStorage
│   └── ui.js               # Manipulação do DOM (renderização, teclado, mensagens)
├── assets/
│   └── icons/              # Ícones (opcional, SVG)
├── README.md
├── SPECS.md                # Este documento
└── PRD.md                  # Documento de requisitos
```

---

## 6. Detalhes de Implementação por Módulo

### 6.1 `index.html`
- Estrutura semântica: `<header>`, `<main>`, `<section>`, `<button>` com `type="button"`
- IDs e `data-*` attributes para conectar com o JS
- `aria-label` e `aria-live="polite"` para mensagens dinâmicas (acessibilidade)
- Teclado virtual renderizado via JS (evita hardcode repetitivo)

### 6.2 `css/style.css`
- Variáveis CSS em `:root` para cores (fundo, painel, superfície, texto, acertos)
- Tema escuro fixo (Protótipo 3)
- Layout centralizado com `max-width: 420px`, padding responsivo
- Grid do tabuleiro: `grid-template-columns: repeat(5, 1fr)`
- Animações de "virada" das células (`@keyframes turn`)
- Estados das teclas: `.correct`, `.present`, `.absent`
- Media queries para mobile (< 480px)

### 6.3 `js/dictionary.js`
- Lista de palavras em português (mínimo 100 palavras para MVP)
- Função `getWordOfTheDay()`: retorna palavra fixa baseada na data atual (modo diário)
- Função `getRandomWord()`: sorteia palavra aleatória (modo livre)
- Normalização de acentos: `String.prototype.normalize("NFD").replace(/[\u0300-\u036f]/g, "")` para comparação sem distinção de acento, mantendo exibição com acento

### 6.4 `js/game.js`
- Estado central: `state = { target, attempts, maxAttempts, currentRow, currentCol, gameOver, streak, wins, played }`
- `init()`: inicializa novo jogo
- `handleKey(letter)`: adiciona letra à linha atual
- `handleBackspace()`: remove última letra
- `handleEnter()`: valida e submete chute
- `evaluateGuess(guess)`: compara chute com palavra secreta, gera feedback por posição
- `useHint()`: revela letra aleatória ainda não preenchida na linha atual
- `resetGame()`: reinicia partida
- Atualização de estatísticas após cada partida

### 6.5 `js/storage.js`
- `loadStats()`: lê estatísticas do `localStorage`
- `saveStats(stats)`: grava estatísticas no `localStorage`
- Chave: `"palavras_stats"` (JSON)

### 6.6 `js/ui.js`
- `renderBoard()`: cria células do tabuleiro dinamicamente
- `renderKeyboard()`: cria teclado virtual com linhas QWERTY adaptado para português
- `updateCell(row, col, letter, status)`: atualiza cor e letra de uma célula
- `updateKeyStatus(letter, status)`: atualiza cor da tecla no teclado virtual
- `showMessage(text, type)`: exibe mensagem temporária (sucesso/erro)
- `updateStatsUI()`: atualiza painel de estatísticas na tela
- `shareResult()`: copia resultado para área de transferência (formato sem spoiler)

---

## 7. Lógica de Validação de Chute (algoritmo)

```
Entrada: chute (string de 5 letras), palavra secreta (string de 5 letras)
Saída: array de status por posição ['correct'|'present'|'absent']

1. Normalizar chute e palavra secreta (remover acentos, maiúsculas)
2. Primeiro passe: marcar posições onde letra está correta e na posição correta → 'correct'
3. Segundo passe: para letras não marcadas, verificar se existem em outra posição da palavra secreta → 'present'
4. Letras restantes → 'absent'
5. Contagem de letras: uma letra da palavra secreta só pode ser usada uma vez como 'present'
```

Exemplo:
- Secreta: `CASA`
- Chute: `CASS`
- Resultado: C(correct), A(correct), S(correct), S(absent)

---

## 8. Modo Diário

- A palavra secreta do dia é derivada da data atual (`new Date().toISOString().slice(0,10)`).
- Usar a data como semente para selecionar índice no dicionário: `index = dayNumber % dictionary.length`.
- Garante que todos os jogadores vejam a mesma palavra no mesmo dia.
- Armazena em `localStorage` se o jogador já jogou o modo diário hoje (para evitar reset de estatísticas diárias duplicadas).

---

## 9. Requisitos Não-Funcionais

| Categoria | Especificação |
|-----------|---------------|
| Performance | Tempo de carregamento inicial < 2s; resposta ao clique < 100ms |
| Responsividade | Layout funcional em telas de 320px a 1440px |
| Acessibilidade | Contraste WCAG AA, navegação por teclado (Tab), ARIA labels, foco visível |
| Compatibilidade | Chrome, Firefox, Safari, Edge (últimas 2 versões) |
| Offline | Funciona totalmente offline após carregamento inicial (PWA simples possível futuramente) |
| Segurança | Sem dados sensíveis; `localStorage` usado apenas para estatísticas locais |

---

## 10. Plano de Testes

### 10.1 Testes funcionais (manuais/automatizados)
- [ ] Digitar palavra de 5 letras e submeter
- [ ] Verificar feedback verde/amarelo/cinza por posição
- [ ] Vitória ao acertar na 1ª, 3ª e 6ª tentativa
- [ ] Derrota ao esgotar 6 tentativas
- [ ] Palavra do dia é a mesma para acessos na mesma data
- [ ] Estatísticas atualizam após vitória e derrota
- [ ] Teclado físico (Enter, Backspace, letras) funciona
- [ ] Botão de dica revela letra
- [ ] Compartilhamento copia texto sem revelar palavra

### 10.2 Testes de acessibilidade
- [ ] Navegação apenas com teclado (Tab) alcança todos os elementos interativos
- [ ] Leitor de tela anuncia estado das células (via ARIA)
- [ ] Contraste de cores atende WCAG AA (texto sobre fundo escuro)

---

## 11. Deploy e Distribuição

1. Hospedar arquivos estáticos em serviço de hospedagem estática (ex: GitHub Pages).
2. Configurar domínio customizado (opcional).
3. Não requer build step; basta fazer `push` dos arquivos.
4. Versão futura: converter para PWA (Service Worker + manifest.json) para instalação como app.

---

## 12. Métricas de Sucesso (Pós-lançamento)

- Partidas iniciadas por dia
- Taxa de conclusão (vitória / total de partidas)
- Sequência média de vitórias (streak)
- Retenção D1 (jogador retorna no dia seguinte)
- Uso do botão de dica

---

## 13. Roadmap de Implementação

| Fase | Entrega | Prazo sugerido |
|------|---------|----------------|
| 1 | SPECS + implementação básica (modo livre, 6 tentativas, teclado) | Semana 1 |
| 2 | Modo diário + estatísticas locais + compartilhamento | Semana 2 |
| 3 | Dicas, acessibilidade, polimento visual | Semana 3 |
| 4 | Testes, deploy e lançamento | Semana 4 |

---

## 14. Riscos e Mitigação

| Risco | Mitigação |
|-------|-----------|
| Palavras repetidas no modo livre | Manter histórico de palavras sorteadas na sessão |
| Dicionário pequeno | Expandir lista para 500+ palavras antes do lançamento |
| Usuário fecha aba durante partida | Estatísticas salvas apenas ao fim da partida; estado da partida atual não é crítico |
| Acentos causam comparação incorreta | Normalizar strings antes de comparar |

---

> Este SPECS.md deve ser lido em conjunto com o `PRD.md` e os protótipos em `prototypes/`. Qualquer mudança de escopo deve ser refletida em ambos os documentos.
