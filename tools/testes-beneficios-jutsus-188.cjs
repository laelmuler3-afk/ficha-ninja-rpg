'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../js/17-beneficios-jutsus-188.js');
const E=require('../js/17-pontos-chave-engine.js');
const M=require('../js/17-migracao-habilidades-186.js');
const jutsu=()=>({jutsuId:'bola-123',nome:'Katon: Grande Bola de Fogo',custo:'7',dano:'2d6',acao:'Ação',alcance:'até 18 metros'});
const ficha=(efeito,aplicacao='nao-aplicado',tipo='ninjutsu_aprimorado')=>({
  nome:'Luffy Sarutobi',cla:'Sarutobi',nivel:8,jutsus:[jutsu()],
  pontosChaveV1:{eventos:[{id:'original-123',tipo:'historico',habilidadeId:tipo,custo:0,escolhas:{alvoId:'bola-123',alvoTipo:'jutsu',aplicacao,efeito}}]}
});
const regra=()=>({danoEfetivo:'2d6',custoEfetivoTexto:'7',bonusNatureza:1});
test('aprimoramento de dado confirmado e ainda não aplicado é mostrado sem modificar a ficha',()=>{
  const f=ficha('aumentar-dado'),antes=JSON.stringify(f);
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.danoEfetivo,'2d8');
  assert.equal(r.custoEfetivoTexto,'7');
  assert.equal(r.beneficios188.aplicados.length,1);
  assert.equal(JSON.stringify(f),antes);
});
test('estado já aplicado preserva o dano atual e o custo manual',()=>{
  const f=ficha('aumentar-dado','ja-aplicado');
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.danoEfetivo,'2d6');assert.equal(r.custoEfetivoTexto,'7');
  assert.equal(r.beneficios188.aplicados.length,0);
  assert.equal(r.beneficios188.preservados.length,1);
});
test('incerto nunca aplica uma melhoria',()=>{
  const f=ficha('aumentar-dado','incerto');
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.danoEfetivo,'2d6');assert.equal(r.beneficios188.pendentes.length,1);
});
test('melhoria vinculada a outro jutsu não interfere no alvo atual',()=>{
  const f=ficha('acao-bonus');f.jutsus[0].jutsuId='outro-123';
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.acaoEfetiva,undefined);assert.equal(r.beneficios188.aplicados.length,0);
});
test('jutsu sem ID estável não recebe benefícios por nome',()=>{
  const f=ficha('acao-bonus');const j={nome:'Katon: Grande Bola de Fogo'};
  assert.equal(B.vinculos(f,j,E).length,0);
});
test('Ninjutsu Melhorado II deriva custo por uso sem reescrever a ficha',()=>{
  const f=ficha('reduzir-custo','nao-aplicado','ninjutsu_melhorado_2');
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.custoEfetivoTexto,'3');
  assert.equal(f.jutsus[0].custo,'7');
  assert.equal(r.melhoradoII.restantes,3);
});
test('Ninjutsu Melhorado II já aplicado preserva custo 7, sem duplicar desconto',()=>{
  const f=ficha('reduzir-custo','ja-aplicado','ninjutsu_melhorado_2');
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.custoEfetivoTexto,'7');assert.equal(r.beneficios188.preservados.length,1);
});
test('mudança para ação bônus aparece como regra efetiva sem reescrever ação salva',()=>{
  const f=ficha('acao-bonus');const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.acaoEfetiva,'Ação Bônus');assert.equal(f.jutsus[0].acao,'Ação');
});
test('triplicar alcance aceita distância simples e preserva campo atual',()=>{
  const f=ficha('triplicar-alcance');const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.alcanceEfetivo,'até 54 metros');
  assert.equal(f.jutsus[0].alcance,'até 18 metros');
});
test('alcance complexo fica pendente, sem inferir formato ou alterar distância',()=>{
  const f=ficha('triplicar-alcance');f.jutsus[0].alcance='linha de 24 metros por 3 metros';
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.alcanceEfetivo,undefined);
  assert.equal(r.beneficios188.pendentes.length,1);
});
test('formulas com dados desconhecidos não são modificadas',()=>{
  const f=ficha('aumentar-dado');const r=B.aplicar(f,f.jutsus[0],{danoEfetivo:'1d20',custoEfetivoTexto:'7'},E);
  assert.equal(r.danoEfetivo,'1d20');assert.equal(r.beneficios188.pendentes.length,1);
});
test('melhorias repetidas com mesmo efeito não duplicam a aplicação',()=>{
  const f=ficha('aumentar-dado');f.pontosChaveV1.eventos.push({...f.pontosChaveV1.eventos[0],id:'outra-compra'});
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.danoEfetivo,'2d8');assert.equal(r.beneficios188.aplicados.length,1);
});
test('habilidades não confirmadas não são adquiridas automaticamente pelo suplemento',()=>{
  const f={nome:'Luffy Sarutobi',cla:'Sarutobi',nivel:8,jutsus:[jutsu()]};
  assert.ok(M.identificar(f));
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.beneficios188.aplicados.length,0);
});
test('compras estornadas não geram benefício',()=>{
  const f=ficha('aumentar-dado');f.pontosChaveV1.eventos.push({id:'cancelamento',tipo:'estorno',alvoId:'original-123'});
  const r=B.aplicar(f,f.jutsus[0],regra(),E);
  assert.equal(r.danoEfetivo,'2d6');assert.equal(r.beneficios188.aplicados.length,0);
});
test('funções de parse são conservadoras',()=>{
  assert.equal(B.aumentarDado('1d6 + 2d8 fogo'),'1d8 + 2d10 fogo');
  assert.equal(B.aumentarDado('sem dano'),null);
  assert.equal(B.triplicarAlcance('9 m'),'27 m');
  assert.equal(B.triplicarAlcance('9m/18m'),null);
});
test('reconhecimento confirmado na versão 187 é lido diretamente pelo novo motor',()=>{
 const f={nome:'Luffy Sarutobi',cla:'Sarutobi',nivel:8,jutsus:[jutsu()],pontosChaveV1:{eventos:[]}};
 const modelo=M.identificar(f),entrada=modelo.entradas.find(x=>x.habilidadeId==='ninjutsu_aprimorado');
 const r=M.conciliar(f,modelo.id,{[entrada.sourceId]:{confirmar:true,alvoId:'bola-123',aplicacao:'nao-aplicado',efeito:'acao-bonus'}},E);
 f.pontosChaveV1=r.registro;
 const a=B.aplicar(f,f.jutsus[0],regra(),E);
 assert.equal(a.acaoEfetiva,'Ação Bônus');
 assert.equal(E.resumo(f).chaveGasta,0);
});
test('vínculo em compra existente não gera compra adicional nem deixa de aplicar efeito',()=>{
 const f=ficha('acao-bonus');
 f.pontosChaveV1.eventos=[
  {id:'compraInicial',tipo:'historico',habilidadeId:'ninjutsu_aprimorado',custo:0},
  {id:'link186',tipo:'vinculo-habilidade',alvoId:'compraInicial',origemSuplementoId:'suplemento-test',escolhas:{alvoId:'bola-123',alvoTipo:'jutsu',aplicacao:'nao-aplicado',efeito:'acao-bonus'}}
 ];
 const a=B.aplicar(f,f.jutsus[0],regra(),E);
 assert.equal(a.acaoEfetiva,'Ação Bônus');
 assert.equal(E.resumo(f).compras.length,1);
});
