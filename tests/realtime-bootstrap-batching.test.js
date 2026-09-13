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
  notify(path,before,after){
    const parts=split(path), childKey=parts.at(-1), parent=parts.slice(0,-1).join('/');
    const event=before===undefined?'child_added':'child_changed';
    for(const l of [...this.listeners]) if(l.path===parent&&l.event===event) l.cb(new Snap(childKey,after));
  }
}
class Ref{
  constructor(db,path){ this.db=db; this.path=path; }
  once(){
    if(this.path==='.info/serverTimeOffset') return Promise.resolve(new Snap('serverTimeOffset',0));
    return Promise.resolve(new Snap(split(this.path).at(-1)||'',getAt(this.db.data,this.path)));
  }
  on(event,cb){
    if(this.path==='.info/serverTimeOffset'&&event==='value'){ cb(new Snap('serverTimeOffset',0)); return; }
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
}
class CountingStorage{
  constructor(seed={}){ this.map=new Map(Object.entries(seed)); this.writes=new Map(); }
  getItem(k){ return this.map.has(k)?this.map.get(k):null; }
  setItem(k,v){ this.map.set(k,String(v)); this.writes.set(k,(this.writes.get(k)||0)+1); }
  removeItem(k){ this.map.delete(k); }
  resetCounts(){ this.writes.clear(); }
  count(k){ return this.writes.get(k)||0; }
}
function createDevice(label,db,fields=45){
  const sheetId='sheet_shared_bootstrap';
  const data={nome:'Kakashi',pv:'100',pvMax:'100',chakra:'80',chakraMax:'80',nivel:'8',xp:'12000',rank:'Jounin',forca:'3',destreza:'4',constituicao:'3',inteligencia:'5',sabedoria:'4',carisma:'2',ca:'18',cd:'16',proficiencia:'3',notasTopicos:[],inventarioItens:[],jutsus:[],armados:[],naturezas:[],kekkeiGenkai:[],carteira:0,carteiraHistorico:[],__online:{sheetId,ownerUid:'uid_same',name:'Principal'}};
  for(let i=0;i<fields;i++) data[`campoTeste${i}`]=i; // campo genérico permitido pelo motor
  const storage=new CountingStorage({
    ficha_ninja_app_v2:JSON.stringify(data),
    ficha_ninja_lista_v1:JSON.stringify(['Principal']),
    ficha_ninja_ativa_v1:'Principal',
    shinobi_device_id_v1:`device_${label}`
  });
  const windowEvents={},docEvents={};
  const fakeFirebase={apps:[{}],app(){return {database(){return db;}};},database:function(){return db;}};
  fakeFirebase.database.ServerValue={TIMESTAMP:TS};
  let syncEvents=0;
  const context={console,setTimeout,clearTimeout,structuredClone:global.structuredClone,crypto:require('crypto').webcrypto,localStorage:storage,navigator:{onLine:true},CustomEvent:class{constructor(type,opts={}){this.type=type;this.detail=opts.detail;}},document:{visibilityState:'visible',addEventListener(type,cb){(docEvents[type]||=[]).push(cb);},querySelectorAll(){return[];}},window:null,globalThis:null};
  context.window=context; context.globalThis=context; context.firebase=fakeFirebase; context.EkoRealtimeFields=utils;
  context.addEventListener=(type,cb)=>{(windowEvents[type]||=[]).push(cb);};
  context.dispatchEvent=(ev)=>{for(const cb of windowEvents[ev.type]||[]) cb(ev);};
  context.ShinobiOnline={
    snapshot(){return {user:{uid:'uid_same',anonymous:false}};},
    listarFichasSincronizaveis(){const d=JSON.parse(storage.getItem('ficha_ninja_app_v2'));return [{name:'Principal',key:'ficha_ninja_app_v2',sheetId:d.__online.sheetId,data:d}];},
    fichaAtualLocal(){return this.listarFichasSincronizaveis()[0];},
    registrarSyncGranularPendente(){},confirmarSyncGranular(){},
    notificarEventoSync(tipo){if(tipo==='ficha-atualizada-nuvem') syncEvents++;}
  };
  vm.createContext(context); vm.runInContext(ENGINE,context,{filename:'19-realtime-sync-engine.js'});
  return {context,storage,sheetId,get syncEvents(){return syncEvents;}};
}

(async()=>{
  const db=new SharedDb();
  const source=createDevice('source',db);
  await source.context.EkoRealtimeSync.garantirConta();

  const target=createDevice('target',db);
  target.storage.resetCounts();
  await target.context.EkoRealtimeSync.garantirConta();

  const sheetWrites=target.storage.count('ficha_ninja_app_v2');
  assert(sheetWrites<=1,`bootstrap remoto deve persistir a ficha no máximo uma vez; gravou ${sheetWrites} vezes`);
  assert(target.syncEvents<=1,`bootstrap remoto deve emitir no máximo um evento consolidado; emitiu ${target.syncEvents}`);
  console.log(`✓ bootstrap consolidado: ${sheetWrites} gravação da ficha, ${target.syncEvents} evento de UI`);
})().catch(error=>{console.error(error);process.exit(1);});
