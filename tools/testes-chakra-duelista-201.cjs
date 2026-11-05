'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const Livro=require('../js/17-pontos-chave-engine.js');
const Chakra=require('../js/17-beneficios-chakra-201.js');
const Duelista=require('../js/17-duelista-defensivo-201.js');
const Preparacao=require('../js/17-preparacao-ataques.js');
const Ataques=require('../js/17-ataques-automaticos.js');
const Calculos=require('../js/17-calculos-confirmados.js');
const regras=require('../data/progressao-ninja.json');
const clan=id=>regras.clans.find(c=>c.id===id);
const compra=(id='c',tipo='historico',aplicacao='nao-aplicado',habilidadeId='melhoria_chakra')=>({id,tipo,habilidadeId,bolsa:tipo==='compra'?'chave':'historico',custo:tipo==='compra'?2:0,nivel:8,escolhas:aplicacao?{aplicacao}:{}});
const ficha=(evs=[],rest={})=>({nivel:8,cla:'Sarutobi',nome:'Luffy',chakra:'20',chakraMax:'40',ca:16,pontosChaveV1:{versao:1,eventos:evs},...rest});

test('Chakra maximizado aplica d10 do Sarutobi apenas no máximo',()=>{
 const f=ficha([compra()]);const r=Chakra.preparar(f,Livro,'c',clan('sarutobi'));
 assert.equal(r.ganho,10);assert.equal(r.depois,50);assert.equal(r.ekoAtual,20);
 assert.equal(r.evento.campo,'chakraMax');assert.equal(r.evento.resultadoMaximizado,10);
 assert.equal(f.chakraMax,'40');assert.equal(f.chakra,'20');assert.equal(Livro.resumo(f).chaveGasta,0);
});
test('Clãs usam exatamente seus dados de Chakra, não os de Vida',()=>{
 for(const cla of regras.clans){const f=ficha([compra()],{cla:cla.id});const r=Chakra.preparar(f,Livro,'c',cla);
   assert.equal(r.ganho,cla.chakra.die,cla.id);assert.equal(r.depois,40+cla.chakra.die,cla.id);}
});
test('Melhoria de Chakra não usa mod CON e não cura EKO',()=>{
 const f=ficha([compra()],{constituciao:20,chakra:'3'});
 const r=Chakra.preparar(f,Livro,'c',clan('sarutobi'));
 assert.equal(r.ganho,10);assert.equal(r.ekoAtual,3);
});
test('Pode ser usada por compra nova sem recontar compras antigas',()=>{
 const f=ficha([compra('nova','compra','')]);assert.equal(Chakra.preparar(f,Livro,'nova',clan('lee')).ganho,6);
});
test('Aquisição manual ou incerta não pode receber bônus duplicado',()=>{
 for(const aplicacao of ['ja-aplicado','incerto',''])assert.throws(()=>Chakra.preparar(ficha([compra('c','historico',aplicacao)]),Livro,'c',clan('sarutobi')),/aplicada|conferência/);
});
test('Reaplicar a mesma aquisição é bloqueado, inclusive após estorno de efetivação',()=>{
 const f=ficha([compra()]);const r=Chakra.preparar(f,Livro,'c',clan('sarutobi'));
 const g=ficha(r.novoRegistro.eventos,{chakraMax:50});assert.throws(()=>Chakra.preparar(g,Livro,'c',clan('sarutobi')),/já foi efetivada/);
 g.pontosChaveV1.eventos.push({id:'est',tipo:'estorno',alvoId:r.evento.id});
 assert.throws(()=>Chakra.preparar(g,Livro,'c',clan('sarutobi')),/já foi efetivada/);
});
test('Duas compras independentes podem ser efetivadas separadamente',()=>{
 const f=ficha([compra('a'),compra('b')]);const a=Chakra.preparar(f,Livro,'a',clan('sarutobi'));
 const g=ficha(a.novoRegistro.eventos,{chakraMax:'50'});const b=Chakra.preparar(g,Livro,'b',clan('sarutobi'));
 assert.equal(b.depois,60);assert.notEqual(a.id,b.id);
});
test('Dados ausentes, inconsistentes e compra cancelada não alteram a ficha',()=>{
 const f=ficha([compra()]);const anterior=JSON.stringify(f);
 assert.throws(()=>Chakra.preparar(f,Livro,'c',null),/dado de Chakra/);
 assert.throws(()=>Chakra.preparar(ficha([compra()],{chakra:60}),Livro,'c',clan('sarutobi')),/inválido/);
 assert.throws(()=>Chakra.preparar(ficha([compra()],{chakraMax:0}),Livro,'c',clan('sarutobi')),/inválido/);
 assert.throws(()=>Chakra.preparar(ficha([compra(),{id:'e',tipo:'estorno',alvoId:'c'}]),Livro,'c',clan('sarutobi')),/aquisição válida/);
 assert.equal(JSON.stringify(f),anterior);
});
test('Duelista Defensivo não aparece sem aquisição confirmada',()=>{
 assert.equal(Duelista.adquirida(ficha(),Livro),false);
 assert.equal(Duelista.adquirida(ficha([compra('dd','historico','incerto','duelista_defensivo')]),Livro),false);
 assert.equal(Duelista.adquirida(ficha([compra('dd','historico','ja-aplicado','duelista_defensivo')]),Livro),true);
});
test('Somente armas de Acuidade com proficiência comprovada ficam elegíveis',()=>{
 const f=ficha([compra('dd','compra','','duelista_defensivo')]);
 const armas=Duelista.armasElegiveis(f,Preparacao,Ataques,Livro);
 assert.ok(armas.some(a=>a.id==='kunai'));assert.ok(!armas.some(a=>a.id==='wakizaki'));
 assert.ok(!armas.some(a=>a.id==='katana'));
});
test('Duelista Defensivo soma proficiência apenas à CA de um ataque, sem persistir',()=>{
 const f=ficha([compra('dd','compra','','duelista_defensivo')]);const copia=JSON.stringify(f);
 const calc=Duelista.calcular(f,Livro,Preparacao,Ataques,Calculos,'kunai',true,true,'18');
 assert.equal(calc.bonus,3);assert.equal(calc.caBase,16);assert.equal(calc.caTemporaria,19);
 assert.match(calc.resultado,/não ultrapassa/);assert.equal(f.ca,16);assert.equal(JSON.stringify(f),copia);
});
test('Acerto que alcança CA temporária continua acertando',()=>{
 const f=ficha([compra('dd','compra','','duelista_defensivo')]);
 const calc=Duelista.calcular(f,Livro,Preparacao,Ataques,Calculos,'kunai',true,true,'19');
 assert.match(calc.resultado,/alcança/);
});
test('Sem empunhar a arma ou sem reação, não calcula bônus',()=>{
 const f=ficha([compra('dd','compra','','duelista_defensivo')]);
 assert.throws(()=>Duelista.calcular(f,Livro,Preparacao,Ataques,Calculos,'kunai',false,true),/empunhando/);
 assert.throws(()=>Duelista.calcular(f,Livro,Preparacao,Ataques,Calculos,'kunai',true,false),/reação/);
 assert.throws(()=>Duelista.calcular(f,Livro,Preparacao,Ataques,Calculos,'katana',true,true),/Acuidade/);
});
test('Proficiência cresce com nível; resultado defensivo cresce automaticamente',()=>{
 const f=ficha([compra('dd','compra','','duelista_defensivo')],{nivel:13});
 assert.equal(Duelista.calcular(f,Livro,Preparacao,Ataques,Calculos,'kunai',true,true).caTemporaria,21);
});
test('Arquivos de interface, cache e loader da versão 201 estão ligados',()=>{
 const base=path.join(__dirname,'..'),ler=x=>fs.readFileSync(path.join(base,x),'utf8');
 assert.match(ler('index.html'),/data-dd201-calcular/);assert.match(ler('js/17-beneficios-pontos-chave-190.js'),/data-b201-chakra/);
 assert.match(ler('js/00-compat-loader.js'),/17-beneficios-chakra-201\.js/);
 assert.match(ler('js/00-compat-loader.js'),/17-duelista-defensivo-201\.js/);
 assert.match(ler('service-worker.js'),/css\/duelista-defensivo-201\.css/);
 assert.match(ler('version.json'),/2\.5\.8\.20[1-9]/);
});
const vm=require('node:vm');
function cenarioChakra({confirmacao=true,salvamento=true}={}){
 const f=ficha([compra()]);const escutas={};const campo={value:'40',dataset:{shinobiEdicaoPendente:'0'}};
 const doc={readyState:'complete',querySelector(s){return s==='[data-save="chakraMax"]'?campo:null;},addEventListener(n,fn){escutas[n]=fn;}};
 const avisos=[];let saves=0;const events=[];
 const win={document:doc,estado:f,ShinobiPontosChave:Livro,shinobiLevelUp:{getClanRule(){return clan('sarutobi');}},
  confirm(){return confirmacao;},alert(s){avisos.push(s);},persistirEstadoLocal(){saves++;return salvamento;},
  atualizarPlacar(){},atualizarPerfil(){},dispatchEvent(e){events.push(e.type);}};
 const ctx={window:win,estado:f,module:{exports:{}},globalThis:win,CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail;}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/17-beneficios-chakra-201.js'),'utf8'),ctx);
 const botao={closest(seletor){return seletor==='[data-b201-chakra]'?this:null;},getAttribute(){return 'c';}};
 return {f,campo,avisos,win,click(){escutas.click({target:botao});},get saves(){return saves;}};
}
test('Interface Chakra: cancela sem tocar em EKO ou histórico',()=>{
 const s=cenarioChakra({confirmacao:false});s.click();assert.equal(s.f.chakraMax,'40');assert.equal(s.saves,0);assert.equal(s.f.pontosChaveV1.eventos.length,1);
});
test('Interface Chakra: falha no salvamento reverte campo e evento',()=>{
 const s=cenarioChakra({salvamento:false});s.click();assert.equal(s.f.chakraMax,'40');assert.equal(s.campo.value,'40');assert.equal(s.f.pontosChaveV1.eventos.length,1);assert.equal(s.saves,1);
});
test('Interface Chakra: sucesso altera max uma vez e mantém chakra atual',()=>{
 const s=cenarioChakra();s.click();assert.equal(s.f.chakraMax,'50');assert.equal(s.f.chakra,'20');assert.equal(s.saves,1);
 assert.equal(s.f.pontosChaveV1.eventos.length,2);s.click();assert.equal(s.saves,1);assert.equal(s.f.chakraMax,'50');
});
