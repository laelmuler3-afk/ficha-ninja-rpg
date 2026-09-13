# Configuração do Firebase — EKO

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
12. Faça um backup explícito da ficha, restaure-o no segundo aparelho e confirme que novas alterações confirmadas passam a aparecer nos dois aparelhos em tempo real.

## Como a duração funciona

- Um turno é a oportunidade individual de agir.
- Uma rodada termina depois que todos os participantes tiveram seu turno.
- Uma rodada inteira representa seis segundos.
- Um Jutsu descrito como `5 turnos` é tratado como `5 rodadas`, não como cinco ações individuais.
- O sistema registra o ponto da iniciativa em que o efeito começou e encerra o efeito no ponto correspondente após as rodadas completas.

## Backup, sincronização e limites

- A ficha é salva localmente no aparelho.
- A sincronização entre dispositivos usa `sheetRealtime` e envia somente alterações confirmadas por campo/área.
- O backup completo usa `userSheets/{uid}/{sheetId}`. Ele é atualizado automaticamente pelo servidor todos os dias às **03:00 (America/Sao_Paulo)** e também pode ser atualizado manualmente pelo botão **Fazer backup agora**.
- Existe um único backup completo atual por ficha. Tanto o backup automático quanto o manual gravam no mesmo `sheetId`, substituindo o conteúdo anterior; não criam nova personagem nem histórico automático.
- O caminho legado `sheetBackups` fica somente leitura para impedir novas cópias históricas acidentais.
- Avatar, fundos e outras imagens ainda dependem do armazenamento local do aparelho; a sincronização de mídia será tratada separadamente.
- O acesso anônimo fica ligado ao navegador atual. Para sincronizar ou restaurar backups em outro aparelho, entre com a mesma Conta Google.


## Backup automático diário no servidor

A versão 2.5.8.68 adiciona a Cloud Function `backupAutomaticoDiario`. Ela roda às **03:00 no fuso America/Sao_Paulo**, lê o estado consolidado em `sheetRealtime/{uid}/{sheetId}` e atualiza `userSheets/{uid}/{sheetId}`. Nenhum celular ou tablet precisa estar aberto nesse horário.

O agendamento usa Cloud Functions + Cloud Scheduler. Para implantar essa função, o projeto Firebase precisa estar em um plano compatível com Cloud Functions agendadas (normalmente Blaze) e o Cloud Scheduler precisa estar habilitado.

Com Node.js e Firebase CLI instalados, na raiz do repositório execute:

```bash
npm install -g firebase-tools
firebase login
cd functions
npm install
cd ..
firebase deploy --only functions:backupAutomaticoDiario
```

As regras do Realtime Database continuam em `firebase/database.rules.json`. Para publicá-las pelo CLI:

```bash
firebase deploy --only database
```

Depois do deploy, a função e o job do Cloud Scheduler são criados pelo Firebase. Para testar sem esperar 03:00, abra o Google Cloud Console > Cloud Scheduler e use **Force run / Forçar execução** no job correspondente a `backupAutomaticoDiario`.

### Garantias do backup automático

- o destino é sempre `userSheets/{uid}/{sheetId}`;
- um novo backup substitui o snapshot anterior da mesma ficha;
- não são criados `sheetId` novos;
- fichas sem alteração desde o último backup automático não são regravadas;
- um payload realtime inválido bloqueia o backup daquela ficha em vez de produzir uma cópia parcial;
- o backup manual continua disponível e usa o mesmo destino.
