'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const P=require('../js/17-pontos-chave-engine.js');
const S=require('../js/17-sorte-200.js');
const D=require('../js/17-descansos-197.js');
const J=require('../js/17-beneficios-jutsus-188.js');
const compra=(tipo='compra',status='')=>({id:'sorte-compra',tipo,habilidadeId:'sorte',nome:'Sorte',nivel:8,bolsa:'chave',custo:10,escolhas:status?{aplicacao:status}:{}});
const ficha=(eventos=[],extra={})=>({nivel:8,cla:'Sarutobi',nome:'Luffy',pontosChaveV1:{versao:1,eventos:JSON.parse(JSON.stringify(eventos))},...extra});
function usar(f,modo='ataque',dado=''){const p=S.preparar(f,P,modo,dado);f.pontosChaveV1=p.registro;return p;}

test('Sorte não é oferecida a ficha sem aquisição',()=>{const f=ficha();assert.equal(S.status(f,P).adquirida,false);assert.equal(S.status(f,P).restantes,0);assert.throws(()=>usar(f),/não está confirmada/);});
test('Compra nova de Sorte disponibiliza 3 pontos',()=>{const f=ficha([compra()]);assert.equal(S.status(f,P).adquirida,true);assert.equal(S.status(f,P).restantes,3);assert.equal(S.status(f,P).cicloId,'inicio');});
test('Aquisição antiga aplicada manualmente também tem contador',()=>{const f=ficha([compra('historico','ja-aplicado')]);assert.equal(S.status(f,P).restantes,3);});
test('Aquisição antiga pendente não ativa o contador antes da confirmação',()=>{for(const estado of ['incerto','']){const f=ficha([compra('historico',estado)]);assert.equal(S.status(f,P).adquirida,false);}});
test('Cada gasto válido consome um ponto e não mexe em PV, EKO, pontos ou dados salvos',()=>{
  const f=ficha([compra()],{pv:20,chakra:15,jutsus:[{nome:'Katon'}]});const custo=P.resumo(f).chaveGasta;
  for(const modo of ['ataque','habilidade','resistencia'])usar(f,modo);
  assert.equal(S.status(f,P).usos,3);assert.equal(S.status(f,P).restantes,0);
  assert.equal(f.pv,20);assert.equal(f.chakra,15);assert.equal(f.jutsus[0].nome,'Katon');
  assert.equal(P.resumo(f).chaveGasta,custo);
  assert.throws(()=>usar(f,'defesa'),/foram gastos/);
});
test('Permite gastar Sorte em defesa, sem rolar dado automaticamente',()=>{const f=ficha([compra()]);const p=usar(f,'defesa');assert.equal(p.evento.modalidade,'defesa');assert.equal(p.evento.d20Extra,undefined);});
test('Registra d20 informado e rejeita rolagens inválidas',()=>{
  const f=ficha([compra()]);assert.equal(usar(f,'ataque','20').evento.d20Extra,20);
  for(const invalido of ['0','21','1d20','-1','0.5','NaN','3, 6'])assert.throws(()=>S.preparar(f,P,'ataque',invalido));
  assert.equal(S.status(f,P).usos,1);
});
test('Não registra modalidade inválida, nem edita a ficha no planejamento',()=>{const f=ficha([compra()]);assert.throws(()=>S.preparar(f,P,'invalido',''),/Escolha/);
  const p=S.preparar(f,P,'habilidade','6');assert.equal(f.pontosChaveV1.eventos.length,1);assert.equal(p.registro.eventos.length,2);});
test('Descanso curto não renova os pontos, descanso longo renova',()=>{
  const f=ficha([compra()],{constituicao:14,pv:7,pvMax:50,chakra:4,chakraMax:36});usar(f);usar(f);
  f.pontosChaveV1=D.registrarCurto(f,P,D.projetarCurto(f,P,[2],false));
  assert.equal(S.status(f,P).restantes,1);
  f.pontosChaveV1=D.registrarLongo(f,P,J);
  assert.equal(S.status(f,P).restantes,3);
  assert.notEqual(S.status(f,P).cicloId,'inicio');
  usar(f);assert.equal(S.status(f,P).restantes,2);
  f.pontosChaveV1=D.registrarLongo(f,P,J);assert.equal(S.status(f,P).restantes,3);
});
test('Estorno de compra desativa Sorte sem apagar histórico',()=>{const f=ficha([compra()]);usar(f);
  f.pontosChaveV1.eventos.push({id:'estorno123',tipo:'estorno',alvoId:'sorte-compra'});
  assert.equal(S.status(f,P).adquirida,false);assert.equal(S.status(f,P).restantes,0);
  assert.equal(f.pontosChaveV1.eventos.filter(e=>e.tipo==='uso-sorte-200').length,1);
});
test('Duas utilizações paralelas em dispositivos diferentes são somadas após mescla',()=>{
  const left=ficha([compra()]);const right=ficha([compra()]);usar(left);usar(right);
  const ids=[...left.pontosChaveV1.eventos,...right.pontosChaveV1.eventos].map(e=>e.id);
  assert.equal(new Set(ids.filter(id=>id!=='sorte-compra')).size,2);
  const f=ficha([compra(),...left.pontosChaveV1.eventos.slice(1),...right.pontosChaveV1.eventos.slice(1)]);
  assert.equal(S.status(f,P).usos,2);assert.equal(S.status(f,P).restantes,1);
});
test('Conflito de uso simultâneo acima do limite é sinalizado, sem apagar eventos',()=>{
  const f=ficha([compra()]);for(let i=0;i<4;i++)f.pontosChaveV1.eventos.push({id:`u${i}`,tipo:'uso-sorte-200',cicloId:'inicio',criadoEm:`2026-11-05T10:00:0${i}Z`});
  assert.equal(S.status(f,P).conflito,true);assert.equal(S.status(f,P).usos,4);
  assert.throws(()=>usar(f),/simultâneos/);assert.equal(f.pontosChaveV1.eventos.length,5);
});
test('Eventos do ciclo anterior não voltam a contar após sync offline',()=>{
  const f=ficha([compra()]);usar(f);const old=f.pontosChaveV1.eventos.at(-1);
  f.pontosChaveV1=D.registrarLongo(f,P,J);
  const antigoSincronizado={...old,id:'outra-copia',criadoEm:'2099-01-01T00:00:00Z'};
  f.pontosChaveV1.eventos.push(antigoSincronizado);
  assert.equal(S.status(f,P).restantes,3);
});
test('Evento estornado não consome uma carga',()=>{const f=ficha([compra()]);const p=usar(f);f.pontosChaveV1.eventos.push({id:'x',tipo:'estorno',alvoId:p.evento.id});assert.equal(S.status(f,P).restantes,3);});
test('UI e carregadores integram somente a área Combate e mantêm descanso original',()=>{
  const base=path.join(__dirname,'..');const html=fs.readFileSync(path.join(base,'index.html'),'utf8');const sw=fs.readFileSync(path.join(base,'service-worker.js'),'utf8');
  const loader=fs.readFileSync(path.join(base,'js/00-compat-loader.js'),'utf8');
  assert.match(html,/id="shinobiSorte200"/);assert.match(html,/data-sorte200-gastar/);
  assert.match(html,/onclick="resetarBatalha\(\)"/);assert.match(html,/onclick="abrirDescansoCurto197\(\)"/);
  assert.match(sw,/js\/17-sorte-200\.js/);assert.match(sw,/css\/sorte-200\.css/);assert.match(loader,/17-sorte-200\.js/);
});
const vm=require('node:vm');
function uiCenario({confirmado=true,salvou=true}={}){
 const f=ficha([compra()]);const listeners={};const el={value:'',disabled:false,textContent:'',classList:{toggle(){}}};
 const els={
   '[data-sorte200-tipo]':{value:'ataque'},
   '[data-sorte200-d20]':{value:'16'},
   '[data-sorte200-gastar]':{disabled:false,addEventListener(n,fn){this[n]=fn;}},
   '[data-sorte200-contador]':{textContent:''},
   '[data-sorte200-aviso]':{textContent:''}
 };
 const painel={hidden:true,classList:el.classList,querySelector(s){return els[s]||null;}};
 const doc={readyState:'complete',getElementById(id){return id==='shinobiSorte200'?painel:null;},addEventListener(n,fn){listeners[n]=fn;}};
 const alertas=[];let persistencias=0;
 const win={document:doc,estado:f,ShinobiPontosChave:P,alert(m){alertas.push(m);},confirm(){return confirmado;},
  persistirEstadoLocal(){persistencias++;return salvou;},dispatchEvent(){},addEventListener(n,fn){listeners[n]=fn;}};
 const contexto={window:win,estado:f,CustomEvent:class{constructor(n,options){this.type=n;this.detail=options.detail;}},module:{exports:{}},globalThis:win,crypto:globalThis.crypto};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/17-sorte-200.js'),'utf8'),contexto);
 return {f,els,painel,win,alertas,get saves(){return persistencias;},api:contexto.module.exports};
}
test('Interface de Sorte aparece somente quando a aquisição está confirmada',()=>{
 const s=uiCenario();assert.equal(s.painel.hidden,false);assert.equal(s.els['[data-sorte200-contador]'].textContent,'3/3');
});
test('Cancelar gasto na confirmação não altera estado nem consome carga',()=>{
 const s=uiCenario({confirmado:false});s.els['[data-sorte200-gastar]'].click();
 assert.equal(s.api.status(s.f,P).restantes,3);assert.equal(s.saves,0);
});
test('Falha de persistência reverte evento e mantém três cargas',()=>{
 const s=uiCenario({salvou:false});s.els['[data-sorte200-gastar]'].click();
 assert.equal(s.api.status(s.f,P).restantes,3);assert.equal(s.saves,1);
 assert.match(s.alertas[0],/não pôde ser salvo/);
});
test('Gasto confirmado salva somente no ledger, atualiza contador e limpa input',()=>{
 const s=uiCenario();s.els['[data-sorte200-gastar]'].click();
 assert.equal(s.api.status(s.f,P).restantes,2);assert.equal(s.saves,1);
 assert.equal(s.els['[data-sorte200-d20]'].value,'');assert.equal(s.els['[data-sorte200-contador]'].textContent,'2/3');
});
test('Descansos confirmados no mesmo milissegundo respeitam a sequência local',()=>{
 const f=ficha([compra(),
  {id:'descanso-z',tipo:'descanso-longo-197',criadoEm:'2026-11-05T10:00:00.000Z'},
  {id:'descanso-a',tipo:'descanso-longo-197',criadoEm:'2026-11-05T10:00:00.000Z'}]);
 assert.equal(S.status(f,P).cicloId,'descanso-a');
 f.pontosChaveV1.eventos.push({id:'u',tipo:'uso-sorte-200',cicloId:'descanso-z',criadoEm:'2026-11-05T10:00:00.000Z'});
 assert.equal(S.status(f,P).restantes,3);
});
