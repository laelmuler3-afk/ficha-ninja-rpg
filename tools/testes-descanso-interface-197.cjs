'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const E=require('../js/17-pontos-chave-engine.js');
const script=fs.readFileSync(path.join(__dirname,'../js/17-descansos-197.js'),'utf8');
function montar(aceita=true,grava=true){
 const ficha={nivel:8,pv:10,pvMax:40,chakra:10,chakraMax:40,constituicao:14,pontosChaveV1:{versao:1,eventos:[]}};
 const dados={value:'4, 5'};const chakra={checked:true,disabled:false};
 const painel={hidden:true,querySelector(seletor){return {'#descanso197Dados':dados,'#descanso197Chakra':chakra,
   '#descanso197Disponibilidade':{textContent:''},'#descanso197Regra':{textContent:''}}[seletor]||null;},
   scrollIntoView() {}};
 const pv={value:'10'},eko={value:'10'};
 const avisos=[];let saves=0;
 const doc={readyState:'complete',getElementById(id){return id==='descansoCurto197Painel'?painel:null;},
  querySelector(q){return {'[data-save="pv"]':pv,'[data-save="chakra"]':eko}[q]||null;},
  querySelectorAll(){return[];},addEventListener(){}};
 const window={document:doc,estado:ficha,ShinobiPontosChave:E,
    addEventListener(){},dispatchEvent(){},alert(t){avisos.push(t);},
    confirm(){return aceita;},confirmarUsoAcao(){return Promise.resolve(aceita);},
    salvar(){saves++;if(!grava)return false;ficha.pv=pv.value;ficha.chakra=eko.value;return true;},
    atualizarPainelBatalhaVivo(){},renderizarJutsus(){}};
 vm.runInNewContext(script,{window,console,Date,Math,Number,String,Array,Set,Object,Promise,CustomEvent:function(){},crypto:undefined});
 return {window,ficha,painel,dados,chakra,pv,eko,avisos,saves:()=>saves};
}
test('descanso curto confirmado persiste PV, EKO, rolagens e registro',async()=>{
 const x=montar();x.window.abrirDescansoCurto197();
 assert.equal(x.painel.hidden,false);assert.equal(x.chakra.disabled,false);
 assert.equal(await x.window.confirmarDescansoCurto197(),true);
 assert.equal(x.ficha.pv,'23');assert.equal(x.ficha.chakra,'20');
 assert.equal(x.ficha.pontosChaveV1.eventos.length,1);assert.equal(x.ficha.pontosChaveV1.eventos[0].dadosGastos,2);
 assert.equal(x.painel.hidden,true);
});
test('cancelamento não altera ficha nem gastos de dados',async()=>{
 const x=montar(false);x.window.abrirDescansoCurto197();
 assert.equal(await x.window.confirmarDescansoCurto197(),false);
 assert.equal(x.ficha.pv,10);assert.equal(x.ficha.pontosChaveV1.eventos.length,0);assert.equal(x.saves(),0);
});
test('falha de persistência restaura recursos, dados e EKO anteriores',async()=>{
 const x=montar(true,false);x.window.abrirDescansoCurto197();
 assert.equal(await x.window.confirmarDescansoCurto197(),false);
 assert.equal(x.ficha.pv,10);assert.equal(x.ficha.chakra,10);
 assert.equal(x.pv.value,'10');assert.equal(x.eko.value,'10');
 assert.equal(x.ficha.pontosChaveV1.eventos.length,0);
 assert.match(x.avisos.join(' '),/Não foi possível salvar/);
});
