'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const B=require('../js/17-beneficios-jutsus-188.js');
const E=require('../js/17-pontos-chave-engine.js');

function grandeBola(dano='4d6 de fogo (8d6 após upgrade)'){
  return {jutsuId:'bola196',nome:'Katon: Grande Bola de Fogo',elemento:'katon',rank:'B',
    dano,custo:'10',upgrade:{requisito:'LV3 de Katon',efeito:'O dano aumenta para 8d6.'},alcance:'até 45 metros'};
}
function ficha({nivelNatureza=3,aplicacao='nao-aplicado',dano,comII=true}={}){
  const eventos=[{id:'aprimorado196',tipo:'historico',habilidadeId:'ninjutsu_aprimorado',custo:0,
    escolhas:{alvoId:'bola196',alvoTipo:'jutsu',aplicacao,efeito:'aumentar-dado'}}];
  if(comII)eventos.push({id:'melhoradoII196',tipo:'historico',habilidadeId:'ninjutsu_melhorado_2',custo:0,
    escolhas:{alvoId:'bola196',alvoTipo:'jutsu',aplicacao:'nao-aplicado',efeito:'reduzir-custo'}});
  return {nivel:8,cla:'Sarutobi',katon:nivelNatureza,jutsus:[grandeBola(dano)],pontosChaveV1:{eventos}};
}
function ambiente(f){
  const doc={readyState:'loading',querySelector(){return null;},getElementById(){return null;},addEventListener(){}};
  const win={renderizarJutsus(){},addEventListener(){},ShinobiPontosChave:E,
    ShinobiBeneficiosJutsus188:B};
  const ctx={window:win,document:doc,estado:f,console,Map,Set,setTimeout(){}};
  const src=fs.readFileSync(path.join(__dirname,'../js/10-regras-natureza.js'),'utf8');
  vm.runInNewContext(src,ctx,{filename:'10-regras-natureza.js'});
  return win.RegrasNaturezaShinobi;
}
test('Grande Bola de Fogo: N3 e Ninjutsu Aprimorado mostram apenas 8d8 (não a anotação)',()=>{
  const f=ficha();const salvo=JSON.stringify(f);
  const r=ambiente(f).calcularJutsu(f.jutsus[0]);
  assert.equal(r.danoEfetivo,'8d8');
  assert.equal(r.custoEfetivoTexto,'6');
  assert.equal(r.quantidadeDados,8);
  assert.equal(JSON.stringify(f),salvo,'não modificar os valores de origem nem eventos');
});
test('Grande Bola de Fogo: antes de Katon N3 o dano base é 4d6 e o talento vira 4d8',()=>{
  const f=ficha({nivelNatureza:2});const r=ambiente(f).calcularJutsu(f.jutsus[0]);
  assert.equal(r.danoEfetivo,'4d8');
});
test('Grand Bola de Fogo: original já ajustado manualmente não ganha o dado outra vez',()=>{
  const f=ficha({aplicacao:'ja-aplicado',dano:'4d8 de fogo (8d8 após upgrade)'});
  const r=ambiente(f).calcularJutsu(f.jutsus[0]);
  assert.equal(r.danoEfetivo,'8d8');
  assert.equal(r.beneficios188.aprimoradoAtivo,true);
  assert.equal(f.jutsus[0].dano,'4d8 de fogo (8d8 após upgrade)');
});
test('upgrade desconhecido ou outro requisito não pode ser ativado automaticamente',()=>{
  const f=ficha();const a=ambiente(f);
  const estranho={...grandeBola(),nome:'Técnica desconhecida',upgrade:{requisito:'Desafio do mestre'}};
  assert.equal(a.danoAtualDoUpgrade(estranho,7,'katon'),estranho.dano);
  const elemental={...grandeBola(),upgrade:{requisito:'LV3 de Suiton'}};
  assert.equal(a.danoAtualDoUpgrade(elemental,3,'katon'),elemental.dano);
});
test('compatibilidade: cópia antiga do Grande Bola sem metadados de upgrade',()=>{
  const f=ficha();const a=ambiente(f);
  const antigo={...grandeBola()};delete antigo.upgrade;
  assert.equal(a.danoAtualDoUpgrade(antigo,3,'katon'),'8d6');
});
function card(){
  const map={},created=[];
  function node(){return {textContent:'',className:'',title:'',removed:false,attrs:{},
    remove(){this.removed=true;},setAttribute(k,v){this.attrs[k]=v;}};}
  const host={querySelector(sel){return sel==='.jutsuTcgBar'?{}:null;},
    insertBefore(el){map['.jutsuIndicadoresAtivos195']=el;created.push(el);}};
  map['.jutsuLinhaTexto']=host;map['.jutsuTcgChipCusto strong']=node();
  return {map,card:{querySelector(sel){return map[sel]||null;},ownerDocument:{createElement:node}}};
}
test('cartão compacto só indica os talentos e cargas restantes, sem descrição longa',()=>{
  const f=ficha(),a=ambiente(f);const m=card();
  B.decorarCard(m.card,f.jutsus[0],a.calcularJutsu(f.jutsus[0]));
  assert.equal(m.map['.jutsuIndicadoresAtivos195'].textContent,
    'Ninjutsu Aprimorado ativo · Ninjutsu Melhorado II ativo · 3/3');
  assert.equal(m.map['.b188Selo'],undefined);
  assert.equal(m.map['.b188Detalhes'],undefined);
  assert.equal(m.map['.jutsuTcgChipCusto strong'].textContent,'6 EKO');
});
test('gastar as cargas muda a etiqueta e o custo, sem desfazer o Aprimorado',()=>{
  const f=ficha(),a=ambiente(f);
  for(let i=0;i<3;i++){
    const prep=B.prepararUsoMelhoradoII(f,f.jutsus[0],E);
    f.pontosChaveV1=B.registrarUsoMelhoradoII(f,f.jutsus[0],E,prep,6);
  }
  const r=a.calcularJutsu(f.jutsus[0]);
  const m=card();B.decorarCard(m.card,f.jutsus[0],r);
  assert.equal(r.danoEfetivo,'8d8');
  assert.equal(r.custoEfetivoTexto,'10');
  assert.equal(m.map['.jutsuTcgChipCusto strong'].textContent,'10 EKO');
  assert.equal(m.map['.jutsuIndicadoresAtivos195'].textContent,
    'Ninjutsu Aprimorado ativo · Ninjutsu Melhorado II esgotado · 0/3');
  f.pontosChaveV1=B.registrarDescansoLongo(f,E);
  const novo=a.calcularJutsu(f.jutsus[0]);
  assert.equal(novo.custoEfetivoTexto,'6');
  assert.equal(novo.danoEfetivo,'8d8');
});
test('não listar habilidades pendentes como ativas',()=>{
  const f=ficha({aplicacao:'incerto',comII:false});const a=ambiente(f);const m=card();
  B.decorarCard(m.card,f.jutsus[0],a.calcularJutsu(f.jutsus[0]));
  assert.equal(m.map['.jutsuIndicadoresAtivos195'],undefined);
  assert.equal(a.calcularJutsu(f.jutsus[0]).danoEfetivo,'8d6');
});
