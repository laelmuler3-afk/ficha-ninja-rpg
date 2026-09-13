'use strict';

const {onSchedule} = require('firebase-functions/v2/scheduler');
const {logger} = require('firebase-functions');
const {initializeApp} = require('firebase-admin/app');
const {getDatabase} = require('firebase-admin/database');
const {buildBackupFromRealtime} = require('./lib/backup-builder');

initializeApp();

async function backupOneSheet(db, uid, sheetId, realtime) {
  const backupRef = db.ref(`userSheets/${uid}/${sheetId}`);
  let lastBuild = null;

  const result = await backupRef.transaction((current) => {
    lastBuild = buildBackupFromRealtime({
      uid,
      sheetId,
      realtime,
      previousBackup: current || null,
      now: Date.now(),
    });
    if (lastBuild.skip) return;
    return lastBuild.backup;
  });

  if (result.committed) {
    return {status: 'backed-up', revision: Number(result.snapshot.val()?.revision || 0)};
  }
  if (lastBuild?.skip) return {status: 'unchanged'};
  return {status: 'not-committed'};
}

exports.backupAutomaticoDiario = onSchedule({
  schedule: '0 3 * * *',
  timeZone: 'America/Sao_Paulo',
  region: 'us-central1',
}, async () => {
  const db = getDatabase();
  const rootSnapshot = await db.ref('sheetRealtime').get();
  const summary = {users: 0, sheets: 0, backedUp: 0, unchanged: 0, errors: 0};

  if (!rootSnapshot.exists()) {
    logger.info('Backup automático: nenhuma ficha realtime encontrada.', summary);
    return;
  }

  const jobs = [];
  rootSnapshot.forEach((userSnapshot) => {
    const uid = userSnapshot.key;
    if (!uid) return;
    summary.users += 1;
    userSnapshot.forEach((sheetSnapshot) => {
      const sheetId = sheetSnapshot.key;
      const realtime = sheetSnapshot.val();
      if (!sheetId || !realtime || typeof realtime !== 'object') return;
      summary.sheets += 1;
      jobs.push({uid, sheetId, realtime});
    });
  });

  /* Processamento sequencial de propósito: o backup diário não é sensível a
     milissegundos e assim evitamos rajadas de escrita no Realtime Database. */
  for (const job of jobs) {
    try {
      const result = await backupOneSheet(db, job.uid, job.sheetId, job.realtime);
      if (result.status === 'backed-up') summary.backedUp += 1;
      else if (result.status === 'unchanged') summary.unchanged += 1;
      else summary.errors += 1;
    } catch (error) {
      summary.errors += 1;
      logger.error('Falha no backup automático de uma ficha.', {
        uid: job.uid,
        sheetId: job.sheetId,
        message: error?.message || String(error),
      });
    }
  }

  logger.info('Backup automático diário concluído.', summary);
});

exports._test = {backupOneSheet};
