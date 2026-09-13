const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname,'..');
const exists = rel => fs.existsSync(path.join(root, rel));
const firebase = JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8'));

assert.strictEqual(firebase?.functions?.source, 'functions', 'firebase.json deve apontar para functions em minúsculas');
assert(exists('functions/index.js'), 'pasta functions/ em minúsculas está ausente');
assert(!exists('Functions'), 'pasta Functions/ com maiúscula não pode coexistir');
assert(exists('.firebaserc'), '.firebaserc obrigatório está ausente');

const duplicadosRaiz = [
  'realtime-two-devices.test.js',
  'realtime-core-contract.test.js',
  'backup-realtime-separation.test.js',
  'confirmation-realtime-contract.test.js',
  'auto-backup-server.test.js',
  'auto-backup-function-contract.test.js',
  'run-sync-suite.js'
];
for(const rel of duplicadosRaiz){
  assert(!exists(rel), `teste duplicado na raiz deve ser removido: ${rel}`);
}
assert(!exists('css/efeitos-jutsus.json'), 'cópia duplicada css/efeitos-jutsus.json deve ser removida');
assert(exists('data/efeitos-jutsus.json'), 'arquivo canônico data/efeitos-jutsus.json precisa existir');

console.log('✓ estrutura do projeto e Firebase está limpa e consistente');
