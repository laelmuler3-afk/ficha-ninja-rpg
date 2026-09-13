'use strict';

const crypto = require('crypto');

function text(value) {
  return String(value == null ? '' : value).trim();
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  Object.keys(value).sort().forEach((key) => {
    output[key] = stableValue(value[key]);
  });
  return output;
}

function fingerprint(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(stableValue(value)))
    .digest('hex');
}

function buildBackupFromRealtime({uid, sheetId, realtime, previousBackup = null, now = Date.now()}) {
  const ownerUid = text(uid);
  const id = text(sheetId);
  if (!ownerUid) throw new Error('UID ausente para backup automático.');
  if (!id) throw new Error('sheetId ausente para backup automático.');
  if (!realtime || typeof realtime !== 'object' || Array.isArray(realtime)) {
    throw new Error('Estado realtime inválido para backup automático.');
  }

  const fields = realtime.fields && typeof realtime.fields === 'object' && !Array.isArray(realtime.fields)
    ? realtime.fields
    : {};
  const fieldKeys = Object.keys(fields).sort();
  if (!fieldKeys.length) throw new Error('Estado realtime sem campos para backup.');

  const data = {};
  let sourceRealtimeUpdatedAt = 0;

  for (const key of fieldKeys) {
    const record = fields[key];
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw new Error(`Registro realtime inválido no campo ${key}.`);
    }
    const name = text(record.name);
    if (!name) throw new Error(`Nome de campo realtime ausente em ${key}.`);
    sourceRealtimeUpdatedAt = Math.max(sourceRealtimeUpdatedAt, Number(record.serverUpdatedAt || 0));
    if (record.deleted === true) continue;
    if (typeof record.payload !== 'string') {
      throw new Error(`Payload realtime inválido no campo ${name}.`);
    }
    try {
      data[name] = JSON.parse(record.payload);
    } catch (error) {
      throw new Error(`Payload realtime inválido no campo ${name}: ${error.message}`);
    }
  }

  const sheetName = text(realtime.sheetName) || 'Principal';
  const characterName = text(data.nome) || text(realtime.characterName) || sheetName;
  const previousOnline = previousBackup?.data?.__online && typeof previousBackup.data.__online === 'object'
    ? previousBackup.data.__online
    : {};

  data.__online = {
    ...previousOnline,
    sheetId: id,
    ownerUid,
    identityVersion: Math.max(2, Number(previousOnline.identityVersion || 0)),
    name: sheetName,
  };
  delete data.__online.syncDisabled;
  delete data.__online.legacyAutoCopy;

  const sharedData = {...data};
  delete sharedData.__online;
  const sourceRealtimeFingerprint = fingerprint({
    schemaVersion: Number(realtime.schemaVersion || 1),
    sheetName,
    characterName,
    data: sharedData,
  });

  if (text(previousBackup?.sourceRealtimeFingerprint) === sourceRealtimeFingerprint) {
    return {
      skip: true,
      reason: 'unchanged',
      path: `userSheets/${ownerUid}/${id}`,
      fingerprint: sourceRealtimeFingerprint,
      sourceRealtimeUpdatedAt,
    };
  }

  const revision = Number(previousBackup?.revision || 0) + 1;
  const timestamp = Number(now) > 0 ? Number(now) : Date.now();
  const backup = {
    name: sheetName,
    characterName,
    revision,
    updatedAt: timestamp,
    deviceId: 'server:auto-backup',
    hash: sourceRealtimeFingerprint,
    appVersion: text(previousBackup?.appVersion) || 'server-auto',
    deleted: false,
    backupReason: 'auto-daily',
    sourceRealtimeSchemaVersion: Number(realtime.schemaVersion || 1),
    sourceRealtimeUpdatedAt,
    sourceRealtimeFingerprint,
    data,
  };

  return {
    skip: false,
    path: `userSheets/${ownerUid}/${id}`,
    fingerprint: sourceRealtimeFingerprint,
    sourceRealtimeUpdatedAt,
    backup,
  };
}

module.exports = {buildBackupFromRealtime, fingerprint};
