# Configuração do Firebase — Ficha Ninja RPG v2.2.0

A configuração abaixo é necessária somente para as funções online. A ficha local, o catálogo e a batalha continuam funcionando sem Firebase.

## 1. Criar o projeto e o aplicativo Web

1. Abra o Firebase Console e crie um projeto.
2. Dentro do projeto, adicione um aplicativo **Web**.
3. O Firebase mostrará um objeto chamado `firebaseConfig`.
4. Copie os valores para `js/18-online-config.js`, mantendo os nomes dos campos.

Exemplo de formato:

```js
window.SHINOBI_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Não coloque chaves de conta de serviço, arquivos administrativos ou senhas no GitHub. O aplicativo precisa apenas da configuração Web fornecida pelo Firebase.

## 2. Ativar a autenticação

Em **Authentication > Sign-in method**, ative:

- **Google** — recomendado para o mestre e para jogadores que desejam sincronização entre aparelhos;
- **Anonymous** — usado na entrada rápida de jogadores.

Em **Authentication > Settings > Authorized domains**, adicione o domínio usado pelo GitHub Pages. Normalmente ele tem o formato:

```text
seu-usuario.github.io
```

Se o projeto usa domínio próprio, autorize também esse domínio.

## 3. Criar o Realtime Database

1. Abra **Realtime Database**.
2. Crie o banco na região desejada.
3. Confirme que o campo `databaseURL` copiado para `js/18-online-config.js` corresponde ao banco criado.
4. Abra a aba **Rules**.
5. Substitua todo o conteúdo pelo arquivo `firebase/database.rules.json`.
6. Clique em **Publish**.

Não publique o aplicativo usando regras abertas de modo de teste. As regras fornecidas limitam as ações por usuário e por função na sala.

## 4. Publicar no GitHub

Envie mantendo esta estrutura:

```text
firebase/
  database.rules.json
  SETUP-FIREBASE.md
js/
  18-online-config.js
  19-online-core.js
  20-online-ui.js
  21-online-hooks.js
vendor/
  qrcode-local.js
  LICENSE-qrcode-terminal.txt
css/
  online.css
```

Também envie os arquivos atualizados da raiz, especialmente `index.html`, `service-worker.js` e `version.json`.

## 5. Teste completo recomendado

1. Abra o aplicativo publicado como mestre e entre com Conta Google.
2. Crie uma campanha e uma sala.
3. Confirme que o QR Code e o código de seis caracteres aparecem.
4. Em outro navegador ou aparelho, abra o link ou escaneie o QR Code.
5. Entre como jogador e escolha uma ficha local.
6. Confirme a bolinha verde antes do nome do jogador.
7. Importe uma ficha do mestre como NPC e crie um NPC rápido.
8. Defina as iniciativas e inicie o combate.
9. Avance os turnos até completar uma rodada e confirme que o tempo aumenta em seis segundos.
10. Use um Jutsu com duração e confirme que o efeito termina após a quantidade correta de rodadas.
11. Conceda XP e confirme a atualização da ficha do jogador.
12. Sincronize uma ficha e teste a restauração em outro aparelho usando a mesma Conta Google.

## Como a duração funciona

- Um turno é a oportunidade individual de agir.
- Uma rodada termina depois que todos os participantes tiveram seu turno.
- Uma rodada inteira representa seis segundos.
- Um Jutsu descrito como `5 turnos` é tratado como `5 rodadas`, não como cinco ações individuais.
- O sistema registra o ponto da iniciativa em que o efeito começou e encerra o efeito no ponto correspondente após as rodadas completas.

## Backup e limites

- O aplicativo continua salvando localmente antes de sincronizar.
- A nuvem mantém a versão atual e até cinco backups importantes por ficha.
- Imagens inseridas na ficha também podem fazer parte do backup e aumentar o consumo do banco.
- O acesso anônimo fica ligado ao navegador atual. Para recuperar fichas em outro aparelho, entre com a mesma Conta Google.
