const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const utils = require('../js/19-realtime-fields-utils.js');

const ENGINE = fs.readFileSync('js/19-realtime-sync-engine.js','utf8');
const TS = {'.sv':'timestamp'};

function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }
function split(path){ return String(path||'').split('/').filter(Boolean); }
function getAt(root,path){ return split(path).reduce((o,k)=>o && o[k],root); }
function setAt(root,path,value){
  const parts=split(path); let o=root;
  for(let i=0;i<parts.length-1;i++){ o[parts[i]] ||= {}; o=o[parts[i]]; }
  const key=parts[parts.length-1];
  if(value===null || value===undefined) delete o[key]; else o[key]=value;
}
function resolveServerValues(v, now){
  if(v && typeof v==='object' && !Array.isArray(v) && v['.sv']==='timestamp' && Object.keys(v).length===1) return now;
  if(Array.isArray(v)) return v.map(x=>resolveServerValues(x,now));
  if(v && typeof v==='object'){
    const out={}; for(const [k,x] of Object.entries(v)) out[k]=resolveServerValues(x,now); return out;
  }
  return v;
}
class Snap{
  constructor(key,value){ this.key=key; this._value=clone(value); }
  val(){ return clone(this._value); }
  exists(){ return this._value !== undefined && this._value !== null; }
}
class SharedDb{
  constructor(){ this.data={}; this.listeners=[]; this.clock=1000000; }
  ref(path){ return new Ref(this,path); }
  notify(path, before, after){
    const parts=split(path);
    const childKey=parts[parts.length-1];
    const parent=parts.slice(0,-1).join('/');
    const event = before===undefined ? 'child_added' : 'child_changed';
    for(const l of [...this.listeners]){
      if(l.path===parent && l.event===event) l.cb(new Snap(childKey,after));
    }
    // root initialization: emit added fields to listeners already attached.
    if(parts[0]==='sheetRealtime' && parts.length===3 && after?.fields){
      const fieldsPath=`${path}/fields`;
      for(const [k,v] of Object.entries(after.fields)){
        for(const l of [...this.listeners]) if(l.path===fieldsPath && l.event==='child_added') l.cb(new Snap(k,v));
      }
    }
  }
}
class Ref{
  constructor(db,path){ this.db=db; this.path=path; }
  once(){
    if(this.path==='.info/serverTimeOffset') return Promise.resolve(new Snap('serverTimeOffset',0));
    return Promise.resolve(new Snap(split(this.path).at(-1)||'',getAt(this.db.data,this.path)));
  }
  on(event,cb){
    if(this.path==='.info/serverTimeOffset' && event==='value'){ cb(new Snap('serverTimeOffset',0)); return; }
    this.db.listeners.push({path:this.path,event,cb});
    if(event==='child_added'){
      const current=getAt(this.db.data,this.path)||{};
      for(const [k,v] of Object.entries(current)) cb(new Snap(k,v));
    }
  }
  off(event,cb){ this.db.listeners=this.db.listeners.filter(l=>!(l.path===this.path&&l.event===event&&l.cb===cb)); }
  async transaction(updater){
    const before=clone(getAt(this.db.data,this.path));
    const proposed=updater(clone(before));
    if(proposed===undefined) return {committed:false,snapshot:new Snap(split(this.path).at(-1)||'',before)};
    const after=resolveServerValues(clone(proposed),++this.db.clock);
    setAt(this.db.data,this.path,after);
    this.db.notify(this.path,before,after);
    return {committed:true,snapshot:new Snap(split(this.path).at(-1)||'',after)};
  }
  async remove(){
    const before=clone(getAt(this.db.data,this.path));
    setAt(this.db.data,this.path,null);
    this.db.notify(this.path,before,undefined);
  }
}
class MemoryStorage{
  constructor(seed={}){ this.map=new Map(Object.entries(seed)); }
  getItem(k){ return this.map.has(k)?this.map.get(k):null; }
  setItem(k,v){ this.map.set(k,String(v)); }
  removeItem(k){ this.map.delete(k); }
}

function createDevice(label, db, existingStorage=null){
  const sheetId='sheet_shared_123';
  const initial={nome:'Luffy',pv:'100',chakra:'50',notasTopicos:[],__online:{sheetId,ownerUid:'uid_same',name:'Principal'}};
  const storage=existingStorage || new MemoryStorage({
    ficha_ninja_app_v2:JSON.stringify(initial),
    ficha_ninja_lista_v1:JSON.stringify(['Principal']),
    ficha_ninja_ativa_v1:'Principal',
    shinobi_device_id_v1:`device_${label}`
  });
  const windowEvents={};
  const docEvents={};
  const fakeFirebase={
    apps:[{}],
    app(){ return {database(){return db;}}; },
    database:function(){return db;}
  };
  fakeFirebase.database.ServerValue={TIMESTAMP:TS};

  const context={
    console,
    setTimeout,clearTimeout,
    structuredClone:global.structuredClone,
    crypto:require('crypto').webcrypto,
    localStorage:storage,
    navigator:{onLine:true},
    CustomEvent:class {constructor(type,opts={}){this.type=type;this.detail=opts.detail;}},
    document:{
      visibilityState:'visible',
      addEventListener(type,cb){(docEvents[type] ||= []).push(cb);},
      querySelectorAll(){return [];}
    },
    window:null,
    globalThis:null
  };
  context.window=context;
  context.globalThis=context;
  context.firebase=fakeFirebase;
  context.EkoRealtimeFields=utils;
  context.addEventListener=(type,cb)=>{(windowEvents[type] ||= []).push(cb);};
  context.dispatchEvent=(ev)=>{for(const cb of windowEvents[ev.type]||[]) cb(ev);};
  context.ShinobiOnline={
    snapshot(){ return {user:{uid:'uid_same',anonymous:false}}; },
    listarFichasSincronizaveis(){
      const data=JSON.parse(storage.getItem('ficha_ninja_app_v2'));
      return [{name:'Principal',key:'ficha_ninja_app_v2',sheetId:data.__online.sheetId,data}];
    },
    fichaAtualLocal(){ return this.listarFichasSincronizaveis()[0]; },
    registrarSyncGranularPendente(){},
    confirmarSyncGranular(){},
    notificarEventoSync(){}
  };
  vm.createContext(context);
  vm.runInContext(ENGINE,context,{filename:'19-realtime-sync-engine.js'});
  return {
    context,storage,sheetId,
    data(){return JSON.parse(storage.getItem('ficha_ninja_app_v2'));},
    setData(data){storage.setItem('ficha_ninja_app_v2',JSON.stringify(data));}
  };
}

(async()=>{
  const db=new SharedDb();
  const phone=createDevice('phone',db);
  const tablet=createDevice('tablet',db);
  await phone.context.EkoRealtimeSync.garantirConta();
  await tablet.context.EkoRealtimeSync.garantirConta();
  const discovery=getAt(db.data,`userSheets/uid_same/${phone.sheetId}`);
  assert(discovery && discovery.data, 'ficha nova deve criar registro de descoberta em userSheets');
  assert.strictEqual(discovery.revision,1,'registro inicial de descoberta deve começar na revisão 1');

  const p=phone.data(); p.pv='82'; phone.setData(p);
  await phone.context.ShinobiOnline.sincronizarCamposFicha('Principal',['pv'],{motivo:'teste-pv'});
  assert.strictEqual(tablet.data().pv,'82','PV do celular deve chegar ao tablet');
  assert.strictEqual(tablet.data().chakra,'50','campo não alterado deve permanecer intacto');

  const t=tablet.data(); t.notasTopicos=[{id:'n1',titulo:'Pista',texto:'Encontrar Kakashi',aberto:true}]; tablet.setData(t);
  await tablet.context.ShinobiOnline.sincronizarCamposFicha('Principal',['notasTopicos'],{motivo:'teste-nota'});
  assert.strictEqual(phone.data().notasTopicos[0].texto,'Encontrar Kakashi','nota do tablet deve chegar ao celular');
  assert.strictEqual(phone.data().pv,'82','nota não pode reverter PV');

  tablet.context.navigator.onLine=false;
  const off=tablet.data(); off.chakra='31'; tablet.setData(off);
  const queued=await tablet.context.ShinobiOnline.sincronizarCamposFicha('Principal',['chakra'],{motivo:'offline'});
  assert.strictEqual(queued.queued,true,'alteração offline deve ser enfileirada');
  assert.strictEqual(phone.data().chakra,'50','offline ainda não deve alterar o outro aparelho');
  tablet.context.navigator.onLine=true;
  await tablet.context.EkoRealtimeSync.processarOutbox();
  assert.strictEqual(phone.data().chakra,'31','fila offline deve convergir ao reconectar');

  phone.context.navigator.onLine=false;
  tablet.context.navigator.onLine=false;
  const pOld=phone.data(); pOld.pv='70'; phone.setData(pOld);
  await phone.context.ShinobiOnline.sincronizarCamposFicha('Principal',['pv'],{motivo:'offline-antigo'});
  await new Promise(resolve=>setTimeout(resolve,4));
  const tNew=tablet.data(); tNew.pv='61'; tablet.setData(tNew);
  await tablet.context.ShinobiOnline.sincronizarCamposFicha('Principal',['pv'],{motivo:'offline-novo'});

  // O write mais novo reconecta primeiro; o write antigo chega depois e não pode revertê-lo.
  tablet.context.navigator.onLine=true;
  await tablet.context.EkoRealtimeSync.processarOutbox();
  phone.context.navigator.onLine=true;
  await phone.context.EkoRealtimeSync.processarOutbox();
  assert.strictEqual(phone.data().pv,'61','write antigo não pode reverter o campo mais novo');
  assert.strictEqual(tablet.data().pv,'61','os dois dispositivos devem convergir para o mesmo valor mais novo');

  const dbRestart=new SharedDb();
  const desk=createDevice('desk',dbRestart);
  const mobile=createDevice('mobile',dbRestart);
  await desk.context.EkoRealtimeSync.garantirConta();
  await mobile.context.EkoRealtimeSync.garantirConta();
  mobile.context.navigator.onLine=false;
  const beforeRestart=mobile.data(); beforeRestart.chakra='19'; mobile.setData(beforeRestart);
  await mobile.context.ShinobiOnline.sincronizarCamposFicha('Principal',['chakra'],{motivo:'antes-fechar'});
  const outboxKey=[...mobile.storage.map.keys()].find(k=>k.startsWith('shinobi_field_outbox_v1__'));
  assert(outboxKey && JSON.parse(mobile.storage.getItem(outboxKey)), 'outbox deve existir antes de fechar o app');
  const mobileRestarted=createDevice('mobile',dbRestart,mobile.storage);
  await mobileRestarted.context.EkoRealtimeSync.garantirConta();
  await mobileRestarted.context.EkoRealtimeSync.processarOutbox();
  assert.strictEqual(desk.data().chakra,'19','outbox deve sobreviver ao fechamento/reabertura do app');

  const dbDelete=new SharedDb();
  const deleting=createDevice('deleting',dbDelete);
  await deleting.context.EkoRealtimeSync.garantirConta();
  deleting.context.navigator.onLine=false;
  const pendingDelete=deleting.data(); pendingDelete.pv='44'; deleting.setData(pendingDelete);
  await deleting.context.ShinobiOnline.sincronizarCamposFicha('Principal',['pv'],{motivo:'antes-excluir'});
  assert.strictEqual(deleting.context.EkoRealtimeSync.temPendencias(deleting.sheetId),true,'deve haver pendência antes da exclusão');
  deleting.context.navigator.onLine=true;
  const removed=await deleting.context.EkoRealtimeSync.excluirFichaRealtime(deleting.sheetId);
  assert.strictEqual(removed.ok,true,'limpeza realtime deve concluir');
  assert.strictEqual(deleting.context.EkoRealtimeSync.temPendencias(deleting.sheetId),false,'exclusão deve limpar outbox granular da ficha');
  assert.strictEqual(getAt(dbDelete.data,`sheetRealtime/uid_same/${deleting.sheetId}`),undefined,'exclusão deve remover árvore realtime antiga');

  console.log('✓ dois dispositivos convergem por campo, notas, fila offline, reinício, exclusão e latest-write-wins');
})().catch(error=>{console.error(error);process.exit(1);});
