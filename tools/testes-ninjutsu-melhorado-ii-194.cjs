'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const B=require('../js/17-beneficios-jutsus-188.js');
const E=require('../js/17-pontos-chave-engine.js');
function ficha({nivel=8,manual=false,modo='reduzir-custo',custo=10}={}){
  return {nivel,cla:'Sarutobi',jutsus:[{jutsuId:'bola1',nome:'Katon: Grande Bola de Fogo',custo:String(custo),alcance:'até 45 metros'}],pontosChaveV1:{eventos:[{id:'compra-II',tipo:'historico',habilidadeId:'ninjutsu_melhorado_2',custo:0,escolhas:{alvoTipo:'jutsu',alvoId:'bola1',aplicacao:manual?'ja-aplicado':'nao-aplicado',efeito:modo}}]}};
}
const j=f=>f.jutsus[0];
function usar(f,original){const pre=B.prepararUsoMelhoradoII(f,j(f),E,original); f.pontosChaveV1=B.registrarUsoMelhoradoII(f,j(f),E,pre,original!=null?7:6);return B.estadoMelhoradoII(f,j(f),E);}
test('contagem determinada pela proficiência e muda com o nível',()=>{
 assert.equal(B.proficiencia({nivel:1}),2);assert.equal(B.proficiencia({nivel:8}),3);assert.equal(B.proficiencia({nivel:9}),4);assert.equal(B.proficiencia({nivel:20}),6);
});
test('redução usa metade do nível, não bônus de proficiência',()=>{
 const f=ficha();const x=B.estadoMelhoradoII(f,j(f),E); assert.equal(x.reducao,4);assert.equal(x.custoReduzido,6);
});
test('três usos e o quarto volta ao custo original',()=>{
 const f=ficha();for(let i=1;i<=3;i++){const s=usar(f);assert.equal(s.usos,i);assert.equal(s.restantes,3-i)}
 const s=B.estadoMelhoradoII(f,j(f),E);assert.equal(B.custoEfetivoMelhoradoII(s,0),10);
 const n=usar(f);assert.equal(n.usos,3);assert.equal(n.restantes,0);
});
test('subir de nível aumenta o limite sem apagar eventos',()=>{
 const f=ficha();for(let i=0;i<3;i++)usar(f);assert.equal(B.estadoMelhoradoII(f,j(f),E).restantes,0);
 f.nivel=9;assert.equal(B.estadoMelhoradoII(f,j(f),E).restantes,1);
});
test('descanso longo restaura usos sem apagar histórico',()=>{
 const f=ficha();usar(f);usar(f);assert.equal(B.estadoMelhoradoII(f,j(f),E).usos,2);
 f.pontosChaveV1=B.registrarDescansoLongo(f,E);assert.equal(B.estadoMelhoradoII(f,j(f),E).usos,0);
 assert.equal(f.pontosChaveV1.eventos.filter(e=>e.tipo==='uso-ninjutsu-melhorado-ii').length,2);
});
test('custo manual preservado até esgotar, original confirmado',()=>{
 const f=ficha({manual:true,custo:7});let x=B.estadoMelhoradoII(f,j(f),E);
 assert.equal(x.precisaCustoOriginal,true);
 assert.throws(()=>B.prepararUsoMelhoradoII(f,j(f),E),/custo original/);
 x=usar(f,10);assert.equal(x.custoOriginal,10);assert.equal(B.custoEfetivoMelhoradoII(x,7),7);
 usar(f);x=usar(f);assert.equal(B.custoEfetivoMelhoradoII(x,7),10);
 assert.equal(j(f).custo,'7','o custo manual não pode ser reescrito');
});
test('custo de origem inválido não gera evento',()=>{
 const f=ficha({manual:true,custo:7});assert.throws(()=>B.prepararUsoMelhoradoII(f,j(f),E,6),/maior/);
 assert.equal(f.pontosChaveV1.eventos.length,1);
});
test('conjuração cancelada não consome contador porque preparar é puro',()=>{
 const f=ficha();B.prepararUsoMelhoradoII(f,j(f),E);assert.equal(B.estadoMelhoradoII(f,j(f),E).usos,0);
});
test('mudança no contador entre preparar e registrar impede dupla gravação',()=>{
 const f=ficha();const op=B.prepararUsoMelhoradoII(f,j(f),E);usar(f);
 assert.throws(()=>B.registrarUsoMelhoradoII(f,j(f),E,op,6),/contagem de usos mudou/);
});
test('modo dobrar alcance não modifica custo e compartilha limite por aquisição',()=>{
 const f=ficha({modo:'dobrar-alcance'});const x=B.estadoMelhoradoII(f,j(f),E);
 assert.equal(x.modo,'dobrar-alcance');assert.equal(B.custoEfetivoMelhoradoII(x,10),10);
 usar(f);assert.equal(B.estadoMelhoradoII(f,j(f),E).restantes,2);
});
test('compra com escolha incerta não é ativada',()=>{
 const f=ficha();f.pontosChaveV1.eventos[0].escolhas.aplicacao='incerto';assert.equal(B.estadoMelhoradoII(f,j(f),E),null);
});
test('outro jutsu sem compra vinculada não consome a habilidade',()=>{
 const f=ficha();assert.equal(B.estadoMelhoradoII(f,{jutsuId:'outro',custo:10},E),null);
});
