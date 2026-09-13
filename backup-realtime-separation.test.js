const assert = require('assert');
const fs = require('fs');

const core = fs.readFileSync('js/19-online-core.js','utf8');
const engine = fs.readFileSync('js/19-realtime-sync-engine.js','utf8');
const hooks = fs.readFileSync('js/21-online-hooks.js','utf8');
const ui = fs.readFileSync('js/20-online-ui.js','utf8');

function trechoEntre(texto,inicio,fim){
  const a=texto.indexOf(inicio);
  assert(a>=0,`início ausente: ${inicio}`);
  const b=texto.indexOf(fim,a+inicio.length);
  assert(b>a,`fim ausente: ${fim}`);
  return texto.slice(a,b);
}

// O motor de tempo real jamais deve criar/alterar o backup completo.
assert(!engine.includes('userSheets/'), 'motor realtime ainda depende de userSheets (backup)');

// Observar backups serve apenas para atualizar a lista da interface.
const observer=trechoEntre(core,'function observarFichasNuvem()','async function salvarBackupFicha(');
assert(!observer.includes('processarAtualizacoesNuvem'), 'observer de backup não pode aplicar backup automaticamente na ficha local');
assert(!observer.includes('sincronizarTodasFichas'), 'observer de backup não pode disparar upload automático de ficha completa');

// O backup explícito deve ter API própria e usar um único caminho por sheetId.
assert(core.includes('async function salvarBackupFicha('), 'API explícita salvarBackupFicha ausente');
const backup=trechoEntre(core,'async function salvarBackupFicha(','async function restaurarFichaDaNuvem');
assert(backup.includes('userSheets/${uid}/${sheetId}'), 'backup deve usar userSheets/{uid}/{sheetId}');
assert(!backup.includes('sheetBackups/'), 'backup explícito não pode criar histórico em sheetBackups');
assert(!backup.includes('Date.now()}_'), 'backup explícito não pode gerar ID novo por execução');

// Persistência confirmada só envia campos; nunca faz fallback para ficha inteira.
const hook=trechoEntre(hooks,'async function enviarAlteracaoConfirmada(','function instalarAutoSync()');
assert(hook.includes('sincronizarCamposFicha'), 'hook confirmado precisa usar sincronização granular');
assert(!hook.includes('sincronizarFicha('), 'hook confirmado ainda faz fallback para upload completo');
assert(!hook.includes('backup:'), 'hook de alteração não pode criar backup automaticamente');

// A UI precisa deixar as duas responsabilidades explícitas.
assert(ui.includes('BACKUP NA NUVEM'), 'UI não separa a área de backup');
assert(ui.includes('Fazer backup agora'), 'UI não oferece backup explícito substituível');
assert(ui.includes('SINCRONIZAÇÃO ENTRE DISPOSITIVOS'), 'UI não identifica claramente o realtime');

const rulesJson = JSON.parse(fs.readFileSync('firebase/database.rules.json','utf8'));
assert.strictEqual(rulesJson.rules.sheetBackups?.$uid?.['.write'], false, 'histórico legado sheetBackups deve ficar bloqueado para novas gravações');

console.log('✓ backup completo e sincronização realtime estão estruturalmente separados');
