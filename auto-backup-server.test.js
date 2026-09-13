const assert = require('assert');
const { buildBackupFromRealtime } = require('../functions/lib/backup-builder');

function field(name, value, serverUpdatedAt = 1000) {
  return {
    name,
    deleted: false,
    payload: JSON.stringify(value),
    editAt: serverUpdatedAt - 1,
    serverUpdatedAt,
    deviceId: 'device_a',
    opId: `op_${name}_${serverUpdatedAt}`,
  };
}

(function reconstructsCompleteBackup() {
  const realtime = {
    schemaVersion: 1,
    sheetName: 'Principal',
    characterName: 'Luffy',
    fields: {
      pv: field('pv', 82, 1200),
      chakra: field('chakra', 140, 1300),
      notas: field('notas', ['Ir para Konoha'], 1400),
    },
  };
  const result = buildBackupFromRealtime({uid:'uid_1', sheetId:'sheet_1', realtime, previousBackup:null, now:5000});
  assert.equal(result.skip, false);
  assert.deepEqual(result.backup.data.pv, 82);
  assert.deepEqual(result.backup.data.chakra, 140);
  assert.deepEqual(result.backup.data.notas, ['Ir para Konoha']);
  assert.equal(result.backup.data.__online.sheetId, 'sheet_1');
  assert.equal(result.backup.data.__online.ownerUid, 'uid_1');
  assert.equal(result.backup.name, 'Principal');
  assert.equal(result.backup.characterName, 'Luffy');
  assert.equal(result.backup.sourceRealtimeUpdatedAt, 1400);
  assert.equal(result.backup.backupReason, 'auto-daily');
})();

(function honorsDeletedFields() {
  const realtime = {
    schemaVersion: 1,
    sheetName: 'Principal',
    fields: {
      pv: field('pv', 80, 1000),
      antigo: {name:'antigo',deleted:true,editAt:1001,serverUpdatedAt:1100,deviceId:'device_a',opId:'delete_antigo'},
    },
  };
  const result = buildBackupFromRealtime({uid:'uid_1',sheetId:'sheet_1',realtime,previousBackup:null,now:5000});
  assert.equal(Object.prototype.hasOwnProperty.call(result.backup.data,'antigo'), false);
})();

(function refusesPartialBackupOnInvalidPayload() {
  const realtime = {
    schemaVersion:1,
    sheetName:'Principal',
    fields:{pv:{...field('pv',80,1000),payload:'{INVALID'}}
  };
  assert.throws(
    ()=>buildBackupFromRealtime({uid:'uid_1',sheetId:'sheet_1',realtime,previousBackup:null,now:5000}),
    /payload/i
  );
})();

(function skipsWhenRealtimeFingerprintAlreadyBackedUp() {
  const realtime = {schemaVersion:1,sheetName:'Principal',fields:{pv:field('pv',80,1000)}};
  const first = buildBackupFromRealtime({uid:'uid_1',sheetId:'sheet_1',realtime,previousBackup:null,now:5000});
  const second = buildBackupFromRealtime({uid:'uid_1',sheetId:'sheet_1',realtime,previousBackup:first.backup,now:9000});
  assert.equal(second.skip, true);
  assert.equal(second.reason, 'unchanged');
})();

(function sameSheetKeepsSingleLogicalDestination() {
  const realtime = {schemaVersion:1,sheetName:'Principal',fields:{pv:field('pv',80,1000)}};
  const first = buildBackupFromRealtime({uid:'uid_1',sheetId:'sheet_1',realtime,previousBackup:null,now:5000});
  const changed = {schemaVersion:1,sheetName:'Principal',fields:{pv:field('pv',65,2000)}};
  const second = buildBackupFromRealtime({uid:'uid_1',sheetId:'sheet_1',realtime:changed,previousBackup:first.backup,now:9000});
  assert.equal(second.skip, false);
  assert.equal(second.backup.revision, 2);
  assert.equal(second.path, 'userSheets/uid_1/sheet_1');
})();

console.log('auto-backup-server.test.js: OK');
