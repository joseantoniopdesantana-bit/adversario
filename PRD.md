# PRD — Adversário

**Documento de Requisitos do Produto**
Versão 1.0 · 20 de outubro de 2026
Status: aprovado para implementação

---

## 1. Visão do Produto

**Adversário** é um jogo casual de adivinhação de palavras em português do Brasil. O jogador tenta descobrir uma palavra secreta fazendo palpites e lendo o feedback visual por cores. Diferente dos jogos do gênero, o **Adversário** não sorteia uma palavra fixa: ele mantém o conjunto de palavras ainda possíveis e, a cada palpite, escolhe a coloração que **menos** reduz esse conjunto.

Isso inverte a lógica do gênero. Em *Wordle* o jogador busca uma verdade imutável. No **Adversário**, a "verdade" é emergente: só se revela se o jogador a provar por eliminação. A partida fica mais longa, mais difícil e mais justa — porque o jogador nunca pode culpar a sorte.

**Em uma frase:** um jogo de palavras que joga de volta.

---

## 2. Pesquisa de Mercado

### 2.1 O arquétipo: Wordle

Criado por Josh Wardle (out/2021), inspirado no board game *Mastermind* e no *Jotto* (1955).

- 6 tentativas, palavra secreta de 5 letras, feedback por cor: verde (certo no lugar), amarelo (certo no lugar errado), cinza (ausente).
- Um puzzle por dia, idêntico para todo o mundo.
- **Lista curada minúscula:** 2.309 palavras. Wardle começou com ~13.000 e cortou para ~2.000 porque o conjunto amplo tornava o jogo "tão aleatório quanto o Mastermind".
- Três decisões explicam o sucesso:
  1. Um puzzle por dia → escassez + hábito (~3 min/dia).
  2. Grade de emojis compartilhável → viralidade. O produto social é tão importante quanto o jogo.
  3. Lista curada → a palavra é sempre reconhecível.
- Acessibilidade padrão: tema escuro, **modo alto contraste e daltônico** (verde/amarelo → azul/laranja).
- ~4,8 bilhões de partidas em 2023.
- Maior reclamação registrada: palavras obscuras (`parer`, `rupee`, `condo`), nunca as regras.

### 2.2 O caso brasileiro: Termo

Criado por Fernando Serboncini (jan/2022), é o melhor estudo de caso para este projeto.

- **O trabalho real foi o léxico, não o código.** ~7 dias montando ~18.000 palavras de 5 letras (dicionários de SO, posts do Facebook, decisões judiciais); o código levou 2–3 dias.
- Filtros aplicados: remoção de regionalismos, profanity, nomes próprios, conjugações verbais.
- Variantes: **Dueto** (2 palavras) e **Quarteto** (4 palavras).
- **Zero anúncios, zero compras, zero notificações.**
- 500 mil usuários/dia; 85% Brasil, 7,5% Portugal.
- **O erro clássico:** usar só vocabulário brasileiro (`mamãe`, `miojo`, `sachê`, `turnê`) gerou críticas de jogadores portugueses.
- A lista foi liberada publicamente como legado.

### 2.3 O espaço de variantes

| Jogo | Twist | Relevância |
|---|---|---|
| **Absurdle** | Adversarial: a palavra muda a cada turno, escolhendo a coloração que **menos** poda o conjunto de candidatos. Tentativas infinitas. | **Base direta da mecânica central.** |
| **Quordle** (Merriam-Webster, 2023) | 4 puzzles simultâneos, 9 turnos, modo prática infinito. | Valida o apelo de multi-palavra. |
| **Semantle** | Semântica (word2vec + similaridade de cosseno), score + rank/1000, sem limite de palpites. | Prova de que "difícil" sustenta nicho. |
| **Heardle / Worldle / Poeltl / Globle** | Trocam letras por áudio, geografia, NBA, mapa. | Evidencia que o *formato* é um molde reutilizável. |
| **Squabble** | Battle royale multiplayer. | Sinal de demanda social. |

### 2.4 Aprendizados consolidados

1. **Qualidade do léxico é o maior risco de UX.** Reclamações são sempre sobre palavras, nunca sobre regras.
2. **Dois dicionários, não um.** Lista de respostas (curada, pequena) e lista de palpites (ampla).
3. **Acessibilidade é requisito, não extra.**
4. **Compartilhamento é o mecanismo de crescimento.** Sem ele, o jogo é um hábito privado.
5. **Dificuldade extrema sustenta nicho** (Semantle/Absurdle), mas precisa de contrapeso de alívio.

---

## 3. Público-Alvo

| Persona | Descrição | Necessidade |
|---|---|---|
| **Casual diário** | Joga 3–5 min no celular, no transporte. | Partida curta, resultado compartilhável, motivo para voltar. |
| **Viciado em puzzle** | Conhece Wordle, Quordle, Semantle. Busca o próximo desafio. | Um jogo que **não** seja mais do mesmo. |
| **Jogador ocasional de grupo** | Joga com amigos, compartilha no WhatsApp. | Algo para comparar e comentar. |
| **Avaliador / professor** | Recebe a entrega, testa em ~2 minutos. | Entender as regras sem ler manual. |

### Exclusões

- Público infantil (vocabulário e mecânica assumem leitura fluente).
- Público pt-PT como alvo primário (ver RNF-006 e a seção 12).

---

## 4. Proposta de Valor

Para o **casual diário**: uma partida de 3 minutos que termina com algo para compartilhar.
Para o **viciado em puzzle**: um jogo que não pode ser "resolvido" por decorar uma lista de palavras — porque a resposta não existe até o fim.
Para o **projeto acadêmico**: um documento de requisitos rastreável, um algoritmo testável e um produto que funciona de verdade.

---

## 5. Objetivos

### Objetivos de negócio

- Publicar um PWA funcional, sem backend e sem custo de infraestrutura.
- Validar empiricamente que a mecânica adversarial sustenta engajamento sem frustrar.
- Produzir código testado com documentação de requisitos rastreável (RF/RNF → teste).

### Objetivos de usuário

- Entender a mecânica em menos de 60 segundos, sem tutorial obrigatório.
- Jogar uma partida completa em menos de 5 minutos.
- Compartilhar o resultado com um toque.
- Não se sentir enganado quando perder — o jogo deve ser difícil e justo.

### Não-objetivos (v1)

- Backend, contas de usuário, sincronização entre dispositivos.
- Monetização (anúncios, IAP, assinaturas).
- Modo diário global com palavra única compartilhada.
- Suporte a pt-PT.
- Multiplayer em tempo real.
- Notificações push.

---

## 6. Escopo

### Dentro do escopo

- Jogo web PWA em Vanilla + TypeScript.
- Dois regimes: **Justo** e **Cruel**.
- Três tamanhos de pool de respostas.
- Lista de palpites ampla e independente do pool.
- Validação estrita de palpites com mensagem.
- Streak semanal com corte por fuso local.
- Desafios semanais temáticos com dois níveis.
- Persistência em `localStorage`.
- Compartilhamento (grade de cores + dica parcial).
- Modo alto contraste e daltônico.
- Tutorial embutido.
- Suíte de testes unitários e de integração.

### Fora do escopo

- Backend, autenticação, placar online.
- Anúncios e compras.
- Notificações.
- Modo diário com palavra comum a todos.
- Suporte multilíngue.
- Aplicativo nativo (iOS/Android).

---

## 7. Modelo Conceitual

### 7.1 Regimes

O jogo tem dois regimes que definem quem escolhe a verdade.

**Regime Justo**
A palavra secreta é sorteada de forma uniforme no início da partida, a partir do pool selecionado, e permanece fixa. O jogador apenas a descobre. Existe "a resposta" e ela é comparável entre jogadores.

**Regime Cruel**
A palavra **não é sorteada**. O jogo mantém o conjunto `C` de todos os candidatos possíveis. A cada palpite, particiona `C` pela coloração resultante e **descarta tudo, exceto o maior grupo**. A palavra final é a que sobreviver a todas as partições — ela emerge da sequência de palpites, e não de um sorteio.

### 7.2 Eixos de configuração

| Eixo | Valores | Descrição |
|---|---|---|
| **Regime** | Justo · Cruel | Define se há adversário. |
| **Pool de respostas** | ~2k · ~8k · ~18k | De onde a palavra secreta pode vir. |
| **Nível temático** | Geral · Tema semanal | Desafio semanal com pool reduzido. |

**Nota de design (limitação conhecida):** o tamanho do pool **só tem efeito no regime Cruel**. No regime Justo, reduzir o pool não altera materialmente a dificuldade — um pool pequeno apenas limita o vocabulário, não a quantidade de informação por palpite. No regime Justo, o seletor de pool aparece **desabilitado** com a indicação "não se aplica neste regime". Esta limitação é declarada no documento e não deve ser mascarada na interface.

### 7.3 Relação entre eixos

```
Regime  ─┬─ Justo ── pool fixo (não configurável)
         └─ Cruel ── pool configurável ─┬─ Geral (2k / 8k / 18k)
                                        └─ Temático (nível reduzido)
```

O jogador sempre escolhe o regime primeiro; a escolha de pool é condicionada a ele.

---

## 8. Requisitos Funcionais

### RF-001 — Palavra secreta

**Descrição:** O jogo define uma palavra secreta de 5 letras em português do Brasil.

**Regime Justo:** a palavra é sorteada uniformemente do pool ativo no início da partida e permanece imutável.

**Regime Cruel:** não há palavra pré-definida. O conjunto de candidatos inicia-se igual ao pool ativo e é reduzido conforme RF-003.

**Aceite:**
- Todo palpite válido recebe coloração coerente com a palavra secreta (Justo) ou com o maior subconjunto consistente (Cruel).
- A partida termina quando o palpite é igual à palavra secreta, ou quando o limite de tentativas é atingido.

### RF-002 — Colorização de palpite

**Descrição:** Cada letra do palpite recebe uma das três cores.

| Cor | Significado |
|---|---|
| **Verde** | A letra está na palavra secreta, na posição correta. |
| **Amarelo** | A letra está na palavra secreta, em outra posição. |
| **Cinza** | A letra não está na palavra secreta. |

**Tratamento de letras repetidas (crítico):**

1. Marque primeiro todas as posições exatas (verde).
2. Conte a frequência de cada letra na palavra secreta.
3. Subtraia as ocorrências já marcadas como verdes.
4. Para cada letra restante do palpite, na ordem, marque amarelo enquanto houver cota restante; o excedente vira cinza.

**Aceite:**
- Um palpite com mais repetições de uma letra do que a palavra secreta marca apenas as ocorrências possíveis como verde/amarelo e o restante como cinza.
- Exemplo: palavra `CASAS`, palpite `AMARELO` → nenhum conflito; palavra `TERMO`, palpite `TENTO` → o primeiro `T` verde, o segundo `T` cinza.
- O mesmo algoritmo é usado na coloração e no particionamento (RF-003). **Deve haver uma única implementação compartilhada**, testada isoladamente.

### RF-003 — Particionamento adversarial

**Descrição:** No regime Cruel, o conjunto de candidatos é atualizado a cada palpite.

**Algoritmo:**

```
entrada: C (conjunto de candidatos), G (palpite)
1. Para cada w em C:
     calcular coloração de G contra w
2. Agrupar os w por coloração resultante
3. Selecionar o grupo com MAIOR cardinalidade
4. C := grupo selecionado
5. Se C contém exatamente 1 palavra, a partida termina em vitória
```

**Propriedades:**
- O conjunto nunca fica vazio: o palpite do jogador, se válido, é sempre membro de pelo menos um grupo.
- O adversário é **determinístico**: dada a mesma sequência de palpites, o mesmo resultado é obtido. Isso é obrigatório para que a partida seja reproduzível e testável.
- Em caso de empate de cardinalidade entre grupos, o critério de desempate é a ordem lexicográfica da coloração (determinístico e documentado).

**Aceite:**
- Após cada palpite, o conjunto de candidatos é exatamente o maior subconjunto consistente com todos os palpites anteriores.
- O jogador nunca vê o tamanho do conjunto.
- A implementação é pura: mesma entrada → mesma saída, sem estado externo.

### RF-004 — Palpites válidos

**Descrição:** O jogador só pode submeter palavras da **lista de palpites**.

**Regras:**
- A lista de palpites é **independente** do pool de respostas e é ampla (alvo: 12.000+ palavras).
- A lista de palpites **não varia** com o tamanho do pool de respostas. Reduzir o pool não pode reduzir a liberdade do jogador de sondar o vocabulário.
- Palavras fora da lista são **rejeitadas com mensagem** e **não consomem tentativa**.
- Palpites com comprimento diferente de 5 letras são rejeitados.
- O input aceita letras maiúsculas, minúsculas e acentuadas; a normalização é feita antes da validação.

**Aceite:**
- Palpite inválido exibe mensagem clara e não altera o número de tentativas restantes.
- Palpite válido é aceito mesmo que não pertença ao pool de respostas.

### RF-005 — Estado e limite de tentativas

**Descrição:** Cada partida tem um número máximo de tentativas.

| Regime | Tentativas |
|---|---|
| Justo | 6 |
| Cruel | 15 |

**Justificativa:** no regime Cruel a informação por palpite é deliberadamente minimizada; o limite precisa ser maior para que a partida seja vencível com habilidade. No regime Justo o limite clássico de 6 se aplica.

**Aceite:**
- Ao exceder o limite, a partida termina em derrota e a palavra secreta é revelada.
- O contador de tentativas restantes é sempre visível.

### RF-006 — Pools de respostas

**Descrição:** Três pools curados de palavras de 5 letras em pt-BR.

| Pool | Tamanho alvo | Uso |
|---|---|---|
| Fácil | ~2.000 | Introdução e partidas rápidas |
| Médio | ~8.000 | Experiência padrão |
| Completo | ~18.000 | Desafio pleno |

**Critérios de curadoria (obrigatórios):**
- Remover nomes próprios.
- Remover profanity e termos ofensivos.
- Remover conjugações verbais e flexões de número/grau.
- Priorizar vocabulário de uso corrente no Brasil.
- Excluir termos que não existem em pt-PT **apenas quando houver equivalente comum**; registrar a decisão no changelog do léxico.

**Aceite:**
- Cada pool é um arquivo de dados versionado, com contagem de palavras documentada.
- Nenhuma palavra do pool de respostas está ausente da lista de palpites.
- A curadoria é um processo rastreável (fonte, data, critério aplicado).

### RF-007 — Streak semanal

**Descrição:** O jogador acumula uma sequência de vitórias em partidas válidas.

**Regras:**
- O período é **segunda a domingo**, definido pelo **fuso horário local do jogador**.
- A streak vale **em qualquer regime** (Justo ou Cruel).
- Uma partida conta para a streak se o jogador vencer dentro do limite de tentativas.
- A contagem zera se o jogador terminar a semana sem nenhuma vitória.
- A streak é persistida em `localStorage` (RF-012).

**Aceite:**
- Ao vencer, o contador incrementa e o novo valor é exibido.
- Ao cruzar o limite semanal sem vitória, o contador zera e o jogador é informado.
- O mesmo estado é observável em recarregamentos de página.

### RF-008 — Desafios semanais temáticos

**Descrição:** Uma vez por semana, um tema de vocabulário substitui o pool geral como **camada adicional**.

**Estrutura:**

```
Desafio da semana
├── Nível Geral   → pool completo (regime configurável)
└── Nível Tema    → pool temático reduzido (ex.: "animais", ~800 palavras)
```

**Regras:**
- O tema é um pool **curado e separado**; não é uma filtragem do pool geral em tempo de execução.
- O tema aplica-se **apenas ao pool de respostas**. A lista de palpites permanece a mesma.
- Um pool temático menor torna o adversário mais fraco — essa é uma **consequência declarada**, não um defeito: o Nível Tema é propositalmente mais acessível.
- Se o tema não tiver palavras suficientes para o regime Cruel (mínimo: 500), o regime Cruel é desabilitado para aquele tema.

**Aceite:**
- O desafio semanal é identificável na tela inicial com o nome do tema.
- Os dois níveis são selecionáveis e têm estatísticas separadas.
- O tema não afeta a lista de palpites.

### RF-009 — Persistência

**Descrição:** Todo o progresso é salvo no navegador.

**Dados persistidos:**

| Chave | Conteúdo |
|---|---|
| `adversario:settings` | Preferências (tema visual, acessibilidade) |
| `adversario:game:<id>` | Estado da partida em andamento |
| `adversario:stats` | Estatísticas agregadas |
| `adversario:streak` | Semana atual e contagem |

**Aceite:**
- Recarregar a página no meio de uma partida restaura o estado exato.
- A persistência não exige backend, rede ou permissão.
- Corrupção ou ausência de dados é tratada com partida nova, sem erro visível.

### RF-010 — Compartilhamento

**Descrição:** O jogador pode compartilhar o resultado com um toque.

**Formato:** grade de emojis com as cores de cada palpite, **mais uma dica parcial**.

**Regras de conteúdo:**
- A grade contém **apenas cores**, nunca as letras — evita spoiler.
- A dica parcial é **sobre o tabuleiro do próprio jogador** (ex.: número de tentativas, dificuldade alcançada, posição de uma letra do último palpite). **Nunca** revela a palavra secreta diretamente.
- No regime Cruel, a palavra secreta **não é revelada no compartilhamento**, pois não há segredo comum a todos.

**Aceite:**
- O texto de compartilhamento é copiado para a área de transferência com confirmação visual.
- Nenhuma letra do tabuleiro aparece no texto compartilhado.

### RF-011 — Acessibilidade

**Descrição:** O jogo é utilizável por jogadores com daltonismo e em ambientes de alto contraste.

**Requisitos obrigatórios:**
- **Modo daltônico:** substitui verde/amarelo por azul/laranja, mantendo distinção por tonalidade e não apenas por cor.
- **Modo alto contraste:** aumenta o contraste de todos os elementos.
- **Dupla codificação:** além da cor, cada estado é distinguível por forma ou rótulo (verde = contorno sólido; amarelo = contorno tracejado; cinza = preenchimento neutro). A cor **nunca** é o único canal de informação.
- **Teclado:** todas as ações são alcançáveis por teclado, com foco visível e ordem de tabulação lógica.
- **Alvo de toque:** mínimo de 44×44 px em elementos interativos.
- A preferência é persistida e aplicada antes da primeira renderização (sem "flash" de tema errado).

**Aceite:**
- A mecânica é completável usando apenas o modo daltônico.
- O modo daltônico e o alto contraste podem ser combinados.
- O estado de cada casa é legível sem percepção de cor.

### RF-012 — Tutorial

**Descrição:** O jogador entende a mecânica sem ler documentação externa.

**Conteúdo mínimo:**
1. O que significam as três cores.
2. Que o jogo escolhe o feedback que menos ajuda (regime Cruel).
3. Que palpites inválidos não consomem tentativa.

**Aceite:**
- O tutorial aparece na primeira visita e pode ser reaberto a qualquer momento.
- Um jogador que nunca viu o jogo entende as regras em menos de 60 segundos.

---

## 9. Requisitos Não Funcionais

| ID | Categoria | Requisito |
|---|---|---|
| RNF-001 | Performance | Primeira renderização interativa em menos de 2 s em conexão 3G lenta. |
| RNF-002 | Performance | O cálculo de particionamento (RF-003) responde em menos de 50 ms para o pool completo (~18k palavras). |
| RNF-003 | Performance | Tempo total de resposta a um palpite (validação + coloração + particionamento + render) inferior a 100 ms. |
| RNF-004 | Qualidade | Lighthouse: desempenho ≥ 90, acessibilidade ≥ 95. |
| RNF-005 | Portabilidade | Funciona offline após a primeira visita (service worker). |
| RNF-006 | Idioma | pt-BR. O produto **não** declara suporte a pt-PT; a lista de respostas é de vocabulário brasileiro. |
| RNF-007 | Privacidade | Nenhum dado sai do dispositivo. Nenhum rastreador, nenhum analytics, nenhuma chamada de rede para terceiros. |
| RNF-008 | Tamanho | Bundle inicial (gzipped) inferior a 150 KB, excluindo os arquivos de léxico (carregados sob demanda). |
| RNF-009 | Compatibilidade | Chrome, Edge, Firefox e Safari (desktop e mobile) nas duas últimas versões principais. |
| RNF-010 | Robustez | Erros de léxico ou estado corrompido nunca quebram a UI; o jogo recupera para uma partida nova. |
| RNF-011 | Testabilidade | A coloração e o particionamento são funções puras e testáveis isoladamente. |
| RNF-012 | Manutenibilidade | Cada requisito funcional (RF-xxx) possui ao menos um teste associado, rastreável no documento. |
| RNF-013 | Acessibilidade | Atende WCAG 2.1 nível AA nos critérios relacionados a contraste, foco e alvos de toque. |

---

## 10. Modelo de Dados

### 10.1 Arquivos de léxico

```
data/
├── answers/
│   ├── facil.json      (~2.000 palavras)
│   ├── medio.json      (~8.000 palavras)
│   ├── completo.json   (~18.000 palavras)
│   └── temas/
│       ├── animais.json
│       ├── alimentos.json
│       └── ...
├── guesses.json        (~12.000+ palavras, comum a todos os pools)
└── meta.json           (contagens, versão, data de curadoria)
```

### 10.2 Tipos (TypeScript)

```ts
type Letter = string;                       // caractere normalizado (A–Z, sem acento para comparação)
type Color = "green" | "yellow" | "gray";
type Pattern = Color[];                     // 5 posições
type Regime = "justo" | "cruel";
type PoolSize = "facil" | "medio" | "completo";
type GameId = string;

interface Guess {
  word: string;                             // normalizado
  display: string;                          // como digitado
  pattern: Pattern;
}

interface GameState {
  id: GameId;
  regime: Regime;
  poolSize: PoolSize;
  themeId: string | null;
  guesses: Guess[];
  maxAttempts: number;
  status: "playing" | "won" | "lost";
  startedAt: string;                        // ISO 8601
  /** Regime Cruel: subconjunto atual de candidatos (nunca exposto na UI). */
  candidates?: string[];
}

interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  distribution: Record<number, number>;     // nº de tentativas → vitórias
  streakWeekStart: string;                  // semana ISO
}

interface Settings {
  colorblind: boolean;
  highContrast: boolean;
  tutorialSeen: boolean;
}
```

### 10.3 Normalização

- Acentos são removidos **apenas para comparação** (`palavra` ≡ `palavra`).
- A exibição preserva a forma digitada.
- Palavras com diacríticos são aceitas e comparadas pela forma normalizada.
- A posição na palavra é sempre contada sobre os 5 caracteres (não bytes).

---

## 11. Algoritmo Adversário — Especificação

### 11.1 Contrato

```ts
/**
 * Dado o conjunto atual de candidatos e um palpite, retorna o maior
 * subconjunto de candidatos consistente com a coloração observada.
 */
function adversarialStep(
  candidates: readonly string[],
  guess: string
): string[];

/**
 * Coloração de um palpite contra uma palavra candidata.
 * Única implementação usada por coloração (RF-002) e particionamento (RF-003).
 */
function colorize(guess: string, target: string): Pattern;
```

### 11.2 Complexidade

| Etapa | Custo | Com pool de 18.000 |
|---|---|---|
| Colorir o palpite contra cada candidato | O(\|C\| · L²), L = 5 | ~450.000 operações |
| Agrupar por padrão | O(\|C\|) | ~18.000 inserções em mapa |
| Selecionar o maior grupo | O(\#padrões) | desprezível |

Custo total por palpite: **ordem de milissegundos** em JavaScript. Não há gargalo algorítmico. A otimização, se necessária, é cache de padrões — não reescrita do algoritmo.

### 11.3 Propriedades formais

- **Consistência:** o palpite do jogador, se válido, sempre pertence a pelo menos um grupo; o conjunto nunca se torna vazio.
- **Determinismo:** o resultado depende apenas de (pool inicial, sequência de palpites). Sem aleatoriedade.
- **Monotonicidade:** `|C|` nunca aumenta ao longo da partida.
- **Justiça:** o jogador não pode distinguir, pela UI, qual grupo foi escolhido — a única informação disponível é a coloração exibida.

### 11.4 Critério de desempate

Se dois ou mais grupos tiverem cardinalidade máxima idêntica, escolhe-se o grupo cuja coloração é lexicograficamente menor, considerando a ordem `green < yellow < gray` por posição. Documentado para garantir determinismo.

---

## 12. Riscos

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | **Custo de curadoria do léxico** — é o caminho crítico, não o código | Alta | Alto | Iniciar a curadoria no primeiro marco. Reaproveitar a lista pública do Termo como ponto de partida. |
| R2 | **Divergência regional pt-BR** — palavras brasileiras que não existem em pt-PT geram rejeição | Média | Médio | Critério de curadoria explícito; registrar decisões. Não é bloqueante pois o público-alvo é pt-BR. |
| R3 | **Pool temático enfraquece o adversário** | Alta | Médio | Declarado como consequência (RF-008); mínimo de 500 palavras ou regime Cruel desabilitado. |
| R4 | **Fuso local gera inconsistência de streak** | Média | Baixo | Decisão consciente (RF-007). Documentar que jogadores em fusos diferentes podem discordar do corte. |
| R5 | **Frustração no regime Cruel** | Alta | Alto | Limite de 15 tentativas; feedback de tentativas restantes; tutorial explicando a mecânica. |
| R6 | **Sem palavra comum, o compartilhamento perde força social** | Certa | Médio | Compartilhamento foca no esforço do jogador (grade + dica), não na palavra. |
| R7 | **Eixo de dificuldade inerte no regime Justo** | Certa | Baixo | Seletor desabilitado com explicação (seção 7.2). |
| R8 | **Bundle de léxico grande** | Média | Médio | Carregamento sob demanda por pool; apenas o pool ativo é baixado. |

---

## 13. Critérios de Aceite

### 13.1 Funcionais

- [ ] Partida no regime Justo resolve em 6 tentativas com a coloração correta.
- [ ] Partida no regime Cruel termina e a palavra final é consistente com todos os palpites.
- [ ] Letras repetidas são coloridas corretamente em todos os casos de teste.
- [ ] Palpite inválido é rejeitado sem consumir tentativa.
- [ ] Palpite válido fora do pool de respostas é aceito.
- [ ] A streak incrementa ao vencer e zera ao fim da semana sem vitória.
- [ ] Recarregar a página restaura a partida exata.
- [ ] O compartilhamento não revela letras.
- [ ] O modo daltônico é suficiente para completar uma partida.

### 13.2 Métricas de usabilidade (critério de aceite principal)

| Métrica | Alvo |
|---|---|
| **Compreensão da mecânica sem tutorial** | ≥ 80% dos usuários de teste |
| **Conclusão de uma partida** | ≥ 90% dos participantes |
| **Tempo para a primeira partida** | ≤ 90 segundos |
| **Taxa de vitória no regime Justo (pool médio)** | ≥ 60% |
| **Taxa de vitória no regime Cruel (pool completo)** | ≥ 15% |
| **Sessão de teste** | ≥ 10 participantes, sem mediação |

### 13.3 Testes automatizados

- Cobertura de testes ≥ 80% nas funções de coloração e particionamento.
- Testes parametrizados cobrindo letras repetidas, acentos, palpites inválidos e empates de cardinalidade.
- Teste de propriedade: para qualquer sequência de palpites, o conjunto resultante é não-vazio e consistente.

---

## 14. Estratégia de Testes

| Camada | Ferramenta | Escopo |
|---|---|---|
| Unitária | Vitest | `colorize`, `adversarialStep`, validação, normalização |
| Integração | Vitest | Transição de estado de `GameState` |
| Propriedade | fast-check (ou equivalente) | Invariantes do algoritmo adversário |
| Usabilidade | Sessões com usuários | Métricas da seção 13.2 |

---

## 15. Arquitetura e Stack

```
src/
├── core/           lógica pura (colorize, adversarialStep, validação)
├── game/           máquina de estados da partida
├── data/           carregamento e cache dos léxicos
├── ui/             renderização (DOM, Web Components)
├── storage/        persistência em localStorage
├── share/          montagem do texto de compartilhamento
└── a11y/           temas e modos de contraste
```

**Stack:** Vanilla TypeScript + Vite, sem framework de UI.

**Justificativa:** controle total sobre a renderização das animações de virada de casa e bundle mínimo. A lógica de jogo é isolada em módulos puros, permitindo testes sem DOM.

**Build:** Vite para desenvolvimento e bundle de produção; service worker gerado manualmente (sem dependência de framework).

---

## 16. Cronograma

| Marco | Entregável | Duração |
|---|---|---|
| **M1** | Léxico: pools de respostas e lista de palpites, com curadoria documentada | 1 semana |
| **M2** | Núcleo: `colorize` e `adversarialStep` com testes | 1 semana |
| **M3** | Estado da partida, validação e limite de tentativas | 1 semana |
| **M4** | UI: grade, teclado, feedback | 1 semana |
| **M5** | Persistência, streak, compartilhamento | 1 semana |
| **M6** | Acessibilidade, tutorial, desafios temáticos | 1 semana |
| **M7** | Testes de usabilidade e ajustes | 1 semana |
| **M8** | Documentação final e entrega | 1 semana |

**Marco crítico:** M1. A curadoria do léxico é o caminho crítico do projeto inteiro; o código é secundário.

---

## 17. Trabalho Futuro (fora da v1)

- Suporte a pt-PT com pool próprio.
- Modo diário com palavra global (exigiria backend para sincronização).
- Multiplayer local ou online.
- Modo multi-palavra (Dueto/Quarteto).
- Mais temas e progressão de temporada.
- Notificações (exigiria backend e consentimento).

---

## 18. Glossário

| Termo | Definição |
|---|---|
| **Candidato** | Palavra que ainda pode ser a secreta, dada a sequência de palpites. |
| **Pool de respostas** | Conjunto do qual a palavra secreta é sorteada (Justo) ou que inicia o conjunto de candidatos (Cruel). |
| **Lista de palpites** | Conjunto de palavras que o jogador pode digitar. Independente do pool de respostas. |
| **Padrão / coloração** | A sequência de 5 cores resultante de um palpite. |
| **Particionamento** | Divisão do conjunto de candidatos pelos padrões possíveis. |
| **Regime Cruel** | Modo em que o jogo escolhe o subconjunto mais numeroso a cada palpite. |
| **Regime Justo** | Modo em que a palavra secreta é fixa e sorteada no início. |
| **Streak** | Sequência de vitórias consecutivas dentro de uma semana. |

---

## 19. Anexos

- **A1** — Lista de palavras do pool Fácil (`data/answers/facil.json`)
- **A2** — Lista de palavras do pool Médio (`data/answers/medio.json`)
- **A3** — Lista de palavras do pool Completo (`data/answers/completo.json`)
- **A4** — Lista de palpites (`data/guesses.json`)
- **A5** — Registro de curadoria do léxico (fonte, critério, data)
- **A6** — Resultado dos testes de usabilidade

---

## 20. Histórico de Revisões

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 20/10/2026 | Versão inicial. |

---

## Apêndice A — Decisões de Produto Registradas

Este apêndice consolida as decisões tomadas durante a elaboração do PRD, com o fundamento de cada uma.

| # | Decisão | Fundamento |
|---|---|---|
| D1 | Mecânica adversarial (estilo Absurdle) | Diferencia o produto num gênero saturado de clones fiéis. |
| D2 | Apenas pt-BR | Escopo reduzido; evita o problema de divergência de dialeto que o Termo enfrentou. |
| D3 | PWA web responsiva | URL única, instalação no celular, zero fricção de loja. Padrão do Wordle e do Termo. |
| D4 | Vanilla + TypeScript | Controle da renderização e bundle mínimo; lógica pura e testável. |
| D5 | Dois regimes: Justo e Cruel | Isola a variável do adversário e dá um modo justo para calibração. |
| D6 | Dificuldade por tamanho de pool | Conceito mais limpo; só tem efeito no regime Cruel (limitação declarada). |
| D7 | Sem desafio diário global | O regime Cruel não tem palavra comum; streak semanal substitui. |
| D8 | Streak semanal em qualquer regime | Incentiva explorar ambos os regimes. |
| D9 | Fuso local para a semana | Mais justo individualmente; inconsistência entre fusos é aceita e documentada. |
| D10 | Desafios temáticos com dois níveis | Mantém o desafio completo intacto e adiciona uma camada acessível. |
| D11 | Validação estrita de palpites | Feedback previsível; evita o problema das flexões verbais em português. |
| D12 | Persistência somente em localStorage | Zero backend, zero custo, funciona offline. |
| D13 | Compartilhamento: grade + dica sobre o tabuleiro | Mantém a utilidade do compartilhamento sem revelar a palavra (que no Cruel não é segredo comum). |
| D14 | Acessibilidade obrigatória: alto contraste + daltônico | Padrão do gênero; requisito de produto, não melhoria incremental. |
| D15 | Nome: **Adversário** | Descritivo da mecânica que diferencia o produto. |
