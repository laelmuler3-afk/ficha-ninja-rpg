# Ficha Ninja RPG — v2.5.8.60

## Menu lateral: relação nome → função

Esta versão transforma os atalhos Online do menu esquerdo em destinos funcionais independentes.

- **Minha conta** abre a área de login/autenticação.
- **Conta conectada** mostra a conta atual e permite selecionar outro usuário Google.
- **Criar sala** abre a criação de campanha/sala e, após criar, mantém o gerenciador com código e QR Code.
- **Entrar em sala** abre diretamente o campo de código e o leitor de QR Code.
- **Sala atual** abre a sala conectada; sem sala ativa, o item fica desabilitado.
- **Sincronização** continua abrindo a área de nuvem/sincronização.

## Correções internas

- Corrigida a variável de destino do painel Online, que estava sendo usada sem declaração em modo estrito e podia impedir a abertura correta do painel.
- Cada destino agora possui renderização própria, em vez de apenas abrir uma tela genérica e rolar até um bloco.
- Ao entrar em outra sala enquanto já existe uma sala ativa, o app pede confirmação e encerra corretamente a participação anterior antes da troca.
- O seletor de Conta Google usa o fluxo já existente do Firebase com `prompt: select_account`.
- O QR Code de criação continua usando o gerador local já incluído no projeto.
- O leitor de QR usa a câmera quando o navegador oferece `BarcodeDetector`; caso contrário, o campo de código manual permanece disponível.

Não há alteração nas regras do Firebase.
