# EKO — 2.5.8.68

## Backup automático diário no servidor

Esta versão parte da 2.5.8.67 e mantém a separação entre sincronização simultânea e backup completo.

### Sincronização em tempo real

- alterações confirmadas continuam sendo enviadas por campo/área em `sheetRealtime`;
- celular e tablet da mesma Conta Google continuam como pares, sem aparelho principal;
- receber uma alteração remota não cria backup e não pede uma nova confirmação.

### Backup

- o destino continua sendo exatamente `userSheets/{uid}/{sheetId}`;
- existe somente um backup atual por ficha;
- o botão **Fazer backup agora** continua atualizando esse mesmo snapshot;
- a Cloud Function `backupAutomaticoDiario` roda às 03:00 em `America/Sao_Paulo`;
- o servidor reconstrói a ficha a partir do estado consolidado em `sheetRealtime` e substitui o snapshot anterior;
- se a ficha não mudou desde o último backup automático, nenhuma nova gravação é feita;
- payload realtime inválido bloqueia o backup daquela ficha para evitar cópia parcial.

### Implantação adicional

Além de subir os arquivos do app e publicar as regras, esta versão precisa que a pasta `functions/` seja implantada no Firebase com o Firebase CLI. Consulte `firebase/SETUP-FIREBASE.md`.
