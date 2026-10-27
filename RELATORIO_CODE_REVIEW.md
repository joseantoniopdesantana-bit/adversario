# Relatório de revisão de código — Palavra do Dia

**Data:** 27/10/2026  
**Escopo:** `index.html`, `js/*.js`, `css/*.css`, banco JSON e documentação.  
**Método:** inspeção estática, verificação de sintaxe com Node.js e teste da lógica de partida com `localStorage` simulado. Não foi executado teste automatizado em navegador real.

## Problemas encontrados e corrigidos

1. **Falha ao renderizar o teclado virtual:** havia atribuição a `delListener` sem declaração, que provoca `ReferenceError` em módulos ES. Removida.
2. **Palavras de tamanho incompatível:** o banco contém palavras de 7 letras, apesar da regra de 6. A seleção diária agora filtra palavras normalizadas pelo tamanho configurado.
3. **Nova partida diária reutilizava estado anterior:** a palavra era trocada sem zerar tentativas/conclusão. A inicialização agora cria um estado novo com `startNewDay`.
4. **Tabuleiro não mostrava tentativas salvas:** a UI lia a tentativa como array, mas o estado guarda `{ letters, status }`. Corrigida a leitura.
5. **Tentativas seguintes não avançavam corretamente:** após uma tentativa aceita, a UI agora limpa a entrada e seleciona a próxima linha.
6. **Possibilidade de enviar depois do fim:** a lógica rejeita tentativas quando a partida já terminou e a interface impede reiniciar o desafio diário concluído.
7. **Botão de retorno sem evento:** conectado ao retorno à tela inicial.
8. **Fuso horário:** a chave diária e a verificação do dia anterior passaram a usar a data local, evitando a mudança de dia inesperada causada por UTC.
9. **Acessibilidade de foco:** adicionados estilos de `:focus-visible` e estado visual de botões desabilitados.

## Verificações realizadas

- Sintaxe de todos os arquivos JavaScript: aprovada (`node --check`).
- Teste de lógica: palavra diária tem 6 letras; estado inicial começa com zero tentativas; acertar a palavra encerra a partida e atualiza estatísticas; envio após concluir é recusado.
- Testes de navegador, leitor de tela e auditoria WCAG automatizada: não executados neste ambiente.

## Limitações remanescentes

- O banco de palavras é pequeno; a validação só aceita palavras presentes nele, então o vocabulário precisa crescer para uma experiência realista.
- A persistência é local e pode ser apagada pelo usuário; não há sincronização nem proteção contra manipulação do relógio.
- O compartilhamento depende das APIs suportadas pelo navegador e do contexto seguro (HTTPS ou localhost).
- Recomenda-se validar contraste WCAG 2.2 AA e navegação com teclado/leitor de tela antes de publicar.
