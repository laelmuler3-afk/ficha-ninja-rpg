const assert = require('assert');
const fs = require('fs');
const path = require('path');

function read(rel) {
  return fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
}

const index = read('functions/index.js');
assert.match(index, /backupAutomaticoDiario/);
assert.match(index, /onSchedule/);
assert.match(index, /schedule\s*:\s*["']0 3 \* \* \*["']/);
assert.match(index, /timeZone\s*:\s*["']America\/Sao_Paulo["']/);
assert.match(index, /region\s*:\s*["']us-central1["']/);
assert.match(index, /sheetRealtime/);
assert.match(index, /userSheets/);
assert.match(index, /transaction/);

const firebaseJson = JSON.parse(read('firebase.json'));
assert.equal(firebaseJson.functions.source, 'functions');
assert.equal(firebaseJson.functions.runtime, 'nodejs20');
assert.equal(firebaseJson.database.rules, 'firebase/database.rules.json');

const firebaserc = JSON.parse(read('.firebaserc'));
assert.equal(firebaserc.projects.default, 'ficha-ninja-rpg');

const pkg = JSON.parse(read('functions/package.json'));
assert.equal(pkg.engines.node, '20');
assert.ok(pkg.dependencies['firebase-admin']);
assert.ok(pkg.dependencies['firebase-functions']);

console.log('auto-backup-function-contract.test.js: OK');
