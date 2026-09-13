const assert = require('assert');
const fs = require('fs');

const core = fs.readFileSync('js/19-online-core.js','utf8');
const hooks = fs.readFileSync('js/21-online-hooks.js','utf8');
const rules = fs.readFileSync('firebase/database.rules.json','utf8');
let engine = '';
try{ engine = fs.readFileSync('js/19-realtime-sync-engine.js','utf8'); }catch(_error){}

assert(engine.includes('shinobi_field_outbox_v1'), 'field outbox persistente ausente');
assert(engine.includes('sheetRealtime/'), 'caminho sheetRealtime ausente');
assert(engine.includes('sincronizarCamposFicha'), 'API sincronizarCamposFicha ausente');
assert(engine.includes('child_added'), 'listener child_added ausente');
assert(engine.includes('.info/serverTimeOffset'), 'relógio do servidor ausente');
assert(engine.includes('window.ShinobiOnline.sincronizarCamposFicha'), 'API granular não integrada ao ShinobiOnline');
assert(core.includes('EkoRealtimeSync'), 'core não delega status/reconciliação granular');
assert(hooks.includes('camposAlterados'), 'hook não consome camposAlterados');
assert(hooks.includes('sincronizarCamposFicha'), 'hook não usa sync granular');
assert(hooks.includes('const snapshotManual=motivo==="salvamento-manual"'), 'salvamento manual deve preservar snapshot/backup legado');
assert(rules.includes('"sheetRealtime"'), 'regras sheetRealtime ausentes');
assert(engine.includes('excluirFichaRealtime'), 'limpeza da árvore realtime na exclusão ausente');
assert(engine.includes('evento?.detail?.granular'), 'evento granular confirmado não deve reagendar bootstrap completo');
assert(engine.includes('if(estadoRT.listeners.has(ficha.sheetId)) return true;'), 'ficha já observada não deve repetir bootstrap/leitura no foco');
assert(engine.includes('atualizarModificadoresBatalha'), 'atributo remoto precisa atualizar modificadores derivados');
assert(engine.includes('atualizarModsBatalhaComBonus'), 'atributo remoto precisa atualizar bônus/modificadores de batalha');
assert(engine.includes('atualizarBonusPericias'), 'atributo/perícia remota precisa atualizar bônus de perícias');
assert(core.includes('excluirFichaRealtime'), 'core não aciona limpeza realtime ao excluir ficha');

const authCallbackStart = core.indexOf('api.onAuthStateChanged');
const authEmit = core.indexOf('emitir("auth",snapshot())', authCallbackStart);
const identityPrep = core.indexOf('prepararIdentidadesDaConta()', authCallbackStart);
assert(identityPrep > authCallbackStart && identityPrep < authEmit, 'identidades devem ser estabilizadas antes do evento auth do realtime');

console.log('Contrato estrutural do realtime granular passou.');
