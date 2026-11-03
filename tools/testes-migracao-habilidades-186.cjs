'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../js/17-migracao-habilidades-186.js');
const P=require('../js/17-pontos-chave-engine.js');
function ficha(nome,cla){return {nome,cla,nivel:8,forca:12,destreza:20,chakraMax:112,jutsus:[{jutsuId:'j_katon',nome:'Katon: Grande Bola de Fogo',custo:'7'},{jutsuId:'j1',nome:'Katon: Lâmina Flamejante',custo:'4'}],armados:[{nome:'Wakizaki',bonusAcerto:'+8',dano:'1d8',bonusDano:'+7'}]};}
const luffy=()=>ficha('Luffy Sarutobi','Sarutobi');
function entrada(modelo,id,n){return modelo.entradas.filter(e=>e.habilidadeId===id)[n||0];}
function d(alvoId='',aplicacao='incerto'){return {confirmar:true,alvoId,aplicacao,observacao:'valor já conferido'};}
test('suplemento registra as quatro fichas e mantém ocorrências repetidas',()=>{
 const modelos=M.modelos();assert.deepEqual(modelos.map(x=>x.nome),['Shizen Lee','Liu Hyuuga','Sora Aoki','Luffy Sarutobi']);
 assert.equal(modelos.find(x=>x.id==='luffy').entradas.filter(x=>x.habilidadeId==='melhoria_atributo').length,8);
 assert.equal(modelos.find(x=>x.id==='liu').entradas.filter(x=>x.habilidadeId==='natureza_chakra').length,3);
 assert.equal(modelos.find(x=>x.id==='shizen').entradas.find(x=>x.rotulo==='SEGREDO').estado,undefined);
});
test('só sugere modelo quando o nome da ficha confere',()=>{
 assert.equal(M.identificar(luffy()).id,'luffy');assert.equal(M.identificar(ficha('outro','Sarutobi')),null);
 assert.equal(M.identificar(ficha('Luffy Sarutobi','Uchiha')),null);
 assert.equal(M.identificar(ficha('Sora Aoki','Out Clan')).id,'sora');
});
test('não modifica ficha na leitura de prévia',()=>{
 const f=luffy(),antes=JSON.stringify(f),lista=M.entradasValidas(M.identificar(f),f,P);
 assert.equal(lista.length,17);assert.equal(JSON.stringify(f),antes);
});
test('registrar talento antigo não altera campos atuais nem desconta pontos',()=>{
 const f=luffy(),antes=JSON.stringify(f),m=M.identificar(f),item=entrada(m,'ninjutsu_melhorado_2');
 const {registro,confirmadas}=M.conciliar(f,m.id,{[item.sourceId]:d('j_katon','ja-aplicado')},P);
 assert.equal(confirmadas,1);assert.equal(JSON.stringify(f),antes);
 const e=registro.eventos[0];assert.equal(e.tipo,'historico');assert.equal(e.escolhas.alvoId,'j_katon');
 assert.equal(e.escolhas.aplicacao,'ja-aplicado');
 assert.equal(P.resumo({...f,pontosChaveV1:registro}).chaveGasta,0);
 assert.equal(P.resumo({...f,pontosChaveV1:registro}).compras.filter(x=>x.habilidadeId==='ninjutsu_melhorado_2').length,1);
});
test('reimportar a mesma aquisição é idempotente',()=>{
 const f=luffy(),m=M.identificar(f),item=entrada(m,'duelista'),opts={[item.sourceId]:d('','ja-aplicado')};
 const r=M.conciliar(f,m.id,opts,P);f.pontosChaveV1=r.registro;
 const outra=M.conciliar(f,m.id,opts,P);assert.equal(outra.confirmadas,0);assert.equal(outra.registro.eventos.length,1);
});
test('migração exige confirmação e alvo para habilidade direcionada',()=>{
 const f=luffy(),m=M.identificar(f),item=entrada(m,'melhoria_atributo');
 assert.throws(()=>M.conciliar(f,m.id,{[item.sourceId]:d('', 'ja-aplicado')},P),/destino/);
 assert.equal(M.conciliar(f,m.id,{[item.sourceId]:d('', 'incerto')},P).confirmadas,1);
 assert.throws(()=>M.conciliar(f,m.id,{[item.sourceId]:d('errado','ja-aplicado')},P),/não existe/);
});
test('não vincula personagem diferente, clã incompatível ou nível anterior ao suplemento',()=>{
 const f=luffy(),m=M.identificar(f),item=entrada(m,'duelista'),op={[item.sourceId]:d('','ja-aplicado')};
 assert.throws(()=>M.conciliar(f,'shizen',op,P),/não correspondem/);
 assert.throws(()=>M.conciliar({...f,nivel:7},m.id,op,P),/nível 8/);
});
test('não migra talento de clã sem catálogo confirmado',()=>{
 const f=ficha('Liu Hyuuga','Hyuuga'),m=M.identificar(f),item=m.entradas.find(x=>x.rotulo==='Byakugan');
 assert.equal(item.habilidadeId,'');
 assert.throws(()=>M.conciliar(f,m.id,{[item.sourceId]:d()},P),/não está no catálogo/);
});
test('vincular compra antiga não cria duplicata nem outra despesa',()=>{
 const f=luffy(),m=M.identificar(f),item=entrada(m,'duelista');
 f.pontosChaveV1={versao:1,eventos:[{id:'compra_001',tipo:'compra',habilidadeId:'duelista',custo:2,bolsa:'chave',nome:'Duelista',criadoEm:'2026-11-02T00:00:00Z'}]};
 const itens=M.entradasValidas(m,f,P);assert.equal(itens.find(x=>x.sourceId===item.sourceId).estado,'ja-registrado');
 const r=M.conciliar(f,m.id,{[item.sourceId]:d('','ja-aplicado')},P);assert.equal(r.registro.eventos.length,2);
 assert.equal(r.registro.eventos[1].tipo,'vinculo-habilidade');
 const resum=P.resumo({...f,pontosChaveV1:r.registro});assert.equal(resum.compras.length,1);
 assert.equal(resum.compras[0].escolhas.aplicacao,'ja-aplicado');assert.equal(resum.chaveGasta,2);
 assert.equal(M.entradasValidas(m,{...f,pontosChaveV1:r.registro},P).find(x=>x.sourceId===item.sourceId).estado,'importado');
});
test('proficiência especial legada de Agulha e Wakizaki é preservada sem custo',()=>{
 const f=luffy(),m=M.identificar(f),item=entrada(m,'habilidade_com_armas');
 const r=M.conciliar(f,m.id,{[item.sourceId]:d('','ja-aplicado')},P);
 assert.deepEqual(P.proficiencias({...f,pontosChaveV1:r.registro}).sort(),['agulha','wakizaki']);
 assert.equal(r.registro.eventos[0].escolhas.alvoId,'wakizaki,agulha');
});
test('migração de talentos repetidos não perde contagem e não soma modificadores',()=>{
 const f=luffy(),m=M.identificar(f),o={};
 m.entradas.filter(e=>e.habilidadeId==='melhoria_atributo').forEach((e,i)=>{o[e.sourceId]=d(i%2?'forca':'destreza','ja-aplicado')});
 const r=M.conciliar(f,m.id,o,P);
 assert.equal(r.confirmadas,8);assert.equal(r.registro.eventos.length,8);
 assert.equal(P.resumo({...f,pontosChaveV1:r.registro}).compras.filter(e=>e.habilidadeId==='melhoria_atributo').length,8);
 assert.equal(f.destreza,20);assert.equal(f.forca,12);
});
test('reconciliação em lote é atômica quando alguma escolha falha',()=>{
 const f=luffy(),m=M.identificar(f),a=entrada(m,'duelista'),b=entrada(m,'melhoria_atributo');
 assert.throws(()=>M.conciliar(f,m.id,{[a.sourceId]:d('','ja-aplicado'),[b.sourceId]:d('','ja-aplicado')},P),/destino/);
 assert.equal(f.pontosChaveV1,undefined);
});
test('recupera jutsus por IDs existentes e apresenta custo atual',()=>{
 const j=M.alvos(luffy(),'jutsu');assert.equal(j[0].id,'j_katon');assert.match(j[0].extra,/7/);
});
test('estorno permite reconfirmar habilidade antiga sem registrar compras duplicadas',()=>{
 const f=luffy(),m=M.identificar(f),item=entrada(m,'duelista'),opts={[item.sourceId]:d('','ja-aplicado')};
 const primeira=M.conciliar(f,m.id,opts,P);
 f.pontosChaveV1=primeira.registro;
 f.pontosChaveV1.eventos.push({id:'estorno_a',tipo:'estorno',alvoId:primeira.registro.eventos[0].id,criadoEm:new Date().toISOString()});
 assert.equal(M.entradasValidas(m,f,P).find(x=>x.sourceId===item.sourceId).estado,'pendente');
 const nova=M.conciliar(f,m.id,opts,P);
 assert.match(nova.registro.eventos.at(-1).id,/_r2$/);
 assert.equal(P.resumo({...f,pontosChaveV1:nova.registro}).compras.filter(x=>x.habilidadeId==='duelista').length,1);
});
test('estorno de vínculo preserva compra original e permite criar novo vínculo',()=>{
 const f=luffy(),m=M.identificar(f),item=entrada(m,'duelista'),opts={[item.sourceId]:d('','ja-aplicado')};
 f.pontosChaveV1={versao:1,eventos:[{id:'compra_001',tipo:'compra',habilidadeId:'duelista',custo:2,bolsa:'chave'}]};
 const primeira=M.conciliar(f,m.id,opts,P);f.pontosChaveV1=primeira.registro;
 f.pontosChaveV1.eventos.push({id:'estorno_b',tipo:'estorno',alvoId:primeira.registro.eventos[1].id});
 assert.equal(M.entradasValidas(m,f,P).find(x=>x.sourceId===item.sourceId).estado,'ja-registrado');
 const nova=M.conciliar(f,m.id,opts,P);
 assert.match(nova.registro.eventos.at(-1).id,/_r2$/);
 assert.equal(P.resumo({...f,pontosChaveV1:nova.registro}).compras.filter(x=>x.habilidadeId==='duelista').length,1);
});
