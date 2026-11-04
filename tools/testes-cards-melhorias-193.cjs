'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../js/17-beneficios-jutsus-188.js');
const E=require('../js/17-pontos-chave-engine.js');
function ficha(tipo,efeito,aplicacao,dano='8d6',custo='10'){
  return {nivel:8,cla:'Sarutobi',jutsus:[{jutsuId:'fogo-1',nome:'Katon: Grande Bola de Fogo',dano,custo,acao:'Ação',alcance:'até 45 metros'}],pontosChaveV1:{eventos:[{id:'habilidade-1',tipo:'historico',habilidadeId:tipo,custo:0,escolhas:{alvoId:'fogo-1',alvoTipo:'jutsu',aplicacao,efeito}}]}};
}
function fakeCard(){
  const map={};
  const elem=()=>({textContent:'',title:'',attrs:{},children:[],removed:false,
    appendChild(node){this.children.push(node);if(node.className==='b188Selo')map['.b188Selo']=node;},
    setAttribute(k,v){this.attrs[k]=v;},
    insertAdjacentElement(_pos,node){this.children.push(node);if(node.className==='b188Detalhes')map['.b188Detalhes']=node;},
    remove(){this.removed=true;}});
  ['.jutsuLinhaTexto small','.jutsuTcgChipCusto strong','.jutsuTcgChipAcao strong','.jutsuAcaoRapida','.jutsuAcaoPill','.jutsuResumo'].forEach(k=>map[k]=elem());
  return {card:{querySelector(k){return map[k]||null;},ownerDocument:{createElement:elem}},map};
}
function calculo(f){return B.aplicar(f,f.jutsus[0],{danoEfetivo:f.jutsus[0].dano,custoEfetivoTexto:f.jutsus[0].custo},E);}
test('carta compacta mostra dano efetivo 8d8 em vez de selo genérico e mantém custo manual',()=>{
  const f=ficha('ninjutsu_aprimorado','aumentar-dado','nao-aplicado','8d6','7');const antigo=JSON.stringify(f),r=calculo(f),{card,map}=fakeCard();
  assert.equal(r.danoEfetivo,'8d8');B.decorarCard(card,f.jutsus[0],r);
  assert.match(map['.b188Selo'].textContent,/Dano 8d8/);
  assert.equal(map['.jutsuTcgChipCusto strong'].textContent,'7 EKO');
  assert.equal(JSON.stringify(f),antigo);
});
test('Ação Bônus atualiza chip da capa, resumo da ação e botão expandido',()=>{
  const f=ficha('ninjutsu_aprimorado','acao-bonus','nao-aplicado');const {card,map}=fakeCard();
  B.decorarCard(card,f.jutsus[0],calculo(f));
  assert.equal(map['.jutsuTcgChipAcao strong'].textContent,'AB');
  assert.equal(map['.jutsuAcaoRapida'].textContent,'AB');
  assert.equal(map['.jutsuAcaoPill'].textContent,'AB');
});
test('habilidade declarada manualmente aplicada nunca é reaplicada, nem recebe falso selo ativo',()=>{
  const f=ficha('ninjutsu_aprimorado','aumentar-dado','ja-aplicado');const {card,map}=fakeCard(),r=calculo(f);
  B.decorarCard(card,f.jutsus[0],r);
  assert.equal(r.danoEfetivo,'8d6');assert.equal(map['.b188Selo'],undefined);
  assert.match(map['.b188Detalhes'].textContent,/já ajustado manualmente/);
});
test('Melhorado II sem controle de uso não cria custo permanente de 7 no cartão',()=>{
  const f=ficha('ninjutsu_melhorado_2','reduzir-custo','nao-aplicado');const {card,map}=fakeCard(),r=calculo(f);
  B.decorarCard(card,f.jutsus[0],r);
  assert.equal(map['.jutsuTcgChipCusto strong'].textContent,'10 EKO');
  assert.equal(map['.b188Selo'],undefined);
  assert.match(map['.b188Detalhes'].textContent,/por uso/);
});
test('Custo efetivo de Kai pode aparecer na capa sem alterar custo salvo',()=>{
  const f=ficha('ninjutsu_melhorado_2','reduzir-custo','incerto');const {card,map}=fakeCard(),r=B.aplicar(f,f.jutsus[0],{custoEfetivoTexto:'0'},E);
  B.decorarCard(card,f.jutsus[0],r);
  assert.equal(map['.jutsuTcgChipCusto strong'].textContent,'0 EKO');
  assert.equal(f.jutsus[0].custo,'10');
});
