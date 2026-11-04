'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../js/17-pontos-chave-engine.js');
const M=require('../js/17-motor-beneficios-192.js');
const P=require('../js/17-preparacao-ataques.js');
let n=0;
const id=()=>`futuro_${String(++n).padStart(5,'0')}`;
const ficha=(nivel=8)=>({nivel,cla:'Sarutobi',nome:'Luffy',destreza:20,forca:15,velocidade:9,pontosChaveV1:{versao:1,eventos:[
  {id:'historico_a',tipo:'historico',habilidadeId:'melhoria_deslocamento',escolhas:{aplicacao:'ja-aplicado'}},
  {id:'historico_b',tipo:'historico',habilidadeId:'duelista',escolhas:{aplicacao:'nao-aplicado'}},
  {id:'compra_antes',tipo:'compra',habilidadeId:'pontaria',custo:2,bolsa:'chave'},
  {id:'convertido_antes',tipo:'conversao',quantidade:1}
]}});
function registrar(f,e){return E.registrarEvento(f,E.registro(f),{id:id(),...e},{preparacao:P});}
test('fichas antigas pedem marco antes de novo débito, sem apagar aquisições',()=>{
  const f=ficha();assert.equal(E.precisaMarco(f),true);
  assert.throws(()=>registrar(f,{tipo:'compra',habilidadeId:'alerta'}),/Inicie o controle/);
  const r=registrar(f,{tipo:'inicio-controle',saldoChave:0,saldoCla:0});
  assert.equal(E.resumo(f,r).controleIniciado,true);
  assert.equal(E.resumo(f,r).chaveDisponivel,0);
  assert.equal(E.resumo(f,r).claDisponivel,0);
  assert.equal(E.resumo(f,r).compras.length,3);
  assert.equal(r.eventos.length,5);
  assert.ok(r.eventos[4].anterioresIds.includes('convertido_antes'));
});
test('ganhos posteriores ao marco contam normalmente',()=>{
  const f=ficha(8);f.pontosChaveV1=registrar(f,{tipo:'inicio-controle',saldoChave:0,saldoCla:0});
  f.nivel=9;const r=E.resumo(f);
  assert.equal(r.chaveDisponivel,24);assert.equal(r.claDisponivel,0);
  f.pontosChaveV1=registrar(f,{tipo:'compra',habilidadeId:'alerta',nivel:9});
  assert.equal(E.resumo(f).chaveDisponivel,20);
  assert.equal(E.resumo(f).compras.length,4);
  f.nivel=10;assert.equal(E.resumo(f).chaveDisponivel,46);
  assert.equal(E.resumo(f).claDisponivel,3);
});
test('despesa antiga anterior não é debitada, mas aquisições ficam preservadas',()=>{
  const f=ficha();f.pontosChaveV1.eventos.push({id:'despesa-antiga_1',tipo:'despesa-antiga',custo:25,bolsa:'chave'});
  f.pontosChaveV1=registrar(f,{tipo:'inicio-controle',saldoChave:0,saldoCla:0});
  assert.equal(E.resumo(f).chaveGasta,0);assert.equal(E.resumo(f).compras.length,3);
  assert.throws(()=>registrar(f,{tipo:'despesa-antiga',custo:10,bolsa:'chave',motivo:'Não se exige'}),/não é necessário/);
});
test('não permite iniciar segundo marco ou estornar o marco',()=>{
  const f=ficha();f.pontosChaveV1=registrar(f,{tipo:'inicio-controle',saldoChave:0,saldoCla:0});
  assert.throws(()=>registrar(f,{tipo:'inicio-controle',saldoChave:0,saldoCla:0}),/já foi iniciado/);
  const a=f.pontosChaveV1.eventos.at(-1);
  assert.throws(()=>registrar(f,{tipo:'estorno',alvoId:a.id}),/não pode ser estornado/);
});
test('créditos adicionais e conversão após o marco respeitam saldos',()=>{
  const f=ficha();f.pontosChaveV1=registrar(f,{tipo:'inicio-controle',saldoChave:0,saldoCla:0});
  f.pontosChaveV1=registrar(f,{tipo:'credito-extra',bolsa:'cla',quantidade:2,motivo:'Decisão do mestre'});
  f.pontosChaveV1=registrar(f,{tipo:'conversao',quantidade:1});
  assert.equal(E.resumo(f).claDisponivel,1);
  assert.equal(E.resumo(f).chaveDisponivel,2);
  assert.throws(()=>registrar(f,{tipo:'compra',habilidadeId:'alerta',nivel:8}),/saldo insuficiente/);
});
test('novo registro começa pela progressão normal sem exigir marco',()=>{
  const f={nivel:4,cla:'Lee',nome:'Novo',pontosChaveV1:{eventos:[]}};
  assert.equal(E.precisaMarco(f),false);
  assert.equal(E.resumo(f).chaveDisponivel,10);
  const r=registrar(f,{tipo:'compra',habilidadeId:'alerta',nivel:4});
  assert.equal(E.resumo(f,r).chaveDisponivel,6);
});
test('melhoria de deslocamento só soma quando não está aplicada manualmente',()=>{
  const f=ficha();f.pontosChaveV1.eventos.push({id:'hist_extra',tipo:'historico',habilidadeId:'melhoria_deslocamento',escolhas:{aplicacao:'nao-aplicado'}});
  const r=M.avaliar(f,E);
  assert.equal(r.deslocamentoExtra,1.5);
  assert.ok(r.manuais.some(x=>x.id==='historico_a'));
  assert.equal(f.velocidade,9);
});
test('compras novas de melhoria de deslocamento geram bônus derivado, não mutação',()=>{
  const f={nivel:4,cla:'Lee',nome:'Novo',velocidade:12,pontosChaveV1:{eventos:[]}};
  f.pontosChaveV1=registrar(f,{tipo:'compra',habilidadeId:'melhoria_deslocamento',nivel:4});
  assert.equal(M.avaliar(f,E).deslocamentoExtra,1.5);
  assert.equal(f.velocidade,12);
});
test('compra ambígua de PV/EKO nunca é aplicada automaticamente',()=>{
  const f={nivel:4,cla:'Lee',nome:'Novo',pvMax:32,chakraMax:50,pontosChaveV1:{eventos:[]}};
  f.pontosChaveV1=registrar(f,{tipo:'compra',habilidadeId:'melhoria_vida',nivel:4});
  const r=M.avaliar(f,E);
  assert.equal(r.pendentes.some(x=>x.habilidadeId==='melhoria_vida'),true);
  assert.equal(f.pvMax,32);assert.equal(f.chakraMax,50);
});
test('marco duplicado por sincronização fica em alerta e bloqueia despesas',()=>{
  const f=ficha();const ev=f.pontosChaveV1.eventos;
  const antigos=ev.map(x=>x.id);
  ev.push({id:'marco_A',tipo:'inicio-controle',nivel:8,saldoChave:0,saldoCla:0,anterioresIds:antigos});
  ev.push({id:'marco_B',tipo:'inicio-controle',nivel:8,saldoChave:0,saldoCla:0,anterioresIds:antigos});
  const auditoria=E.auditarIntegridade(f);assert.equal(auditoria.ok,false);
  assert.ok(auditoria.problemas.some(x=>x.codigo==='marco-inicial-duplicado'));
  assert.throws(()=>registrar(f,{tipo:'compra',habilidadeId:'alerta'}),/conflito|Inicie o controle/);
});
