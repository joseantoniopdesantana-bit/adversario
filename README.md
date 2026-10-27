# Palavra do Dia

Jogo web responsivo de adivinhação de palavras em português, com seis tentativas, tema diário, estatísticas locais e compartilhamento.

## Como executar

Os módulos JavaScript e o banco JSON precisam ser servidos por HTTP; abrir `index.html` diretamente via `file://` pode bloquear o `fetch` do banco de palavras.

1. Abra um terminal nesta pasta.
2. Execute `python3 -m http.server 8000` (ou `npm run serve` se tiver Python 3 disponível).
3. Acesse `http://localhost:8000`.

## Dados e privacidade

O progresso e as estatísticas ficam no `localStorage` do navegador. Não há cadastro nem envio de dados para um servidor.

## Observações

- A palavra diária é determinística por data local do navegador.
- O MVP usa um banco pequeno de palavras por tema. As tentativas aceitas são as palavras presentes nesse banco; o vocabulário deve ser ampliado antes de publicar.
- Para reiniciar os dados locais durante testes, limpe o armazenamento do site no navegador.
