"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../js/17-pontos-chave-engine.js');
const P=require('../js/17-preparacao-ataques.js');
const U=require('../js/19-realtime-fields-utils.js');
const ficha=(nivel=8,cla='Lee')=>({nivel:String(nivel),cla,destreza:'20',inteligencia:'20',sabedoria:'18',automacaoAtaques:{aquisicoes:[]}});
let c=0;const event=(type,rest={})=>({id:'pc_test_'+String(++c).padStart(5,'0'),tipo:type,...rest});
const push=(f,r,e)=>E.registrarEvento(f,r,e,{preparacao:P});
test('catálogo ampliado preserva custos do PDF',()=>{
 assert.equal(E.catalogo().length,51);assert.equal(E.habilidade('natureza_chakra').custo,4);
 assert.equal(E.habilidade('versatilidade_com_armas').custo,4);
 assert.equal(E.habilidade('habilidade_com_armas').custo,2);
});
test('níveis 1-3 não dão pontos-chave e clã começa no nível 3',()=>{
 assert.equal(E.resumo(ficha(1)).chaveRecebida,0);
 assert.equal(E.resumo(ficha(2)).claRecebida,0);
 assert.equal(E.resumo(ficha(3)).claDisponivel,3);
});
test('créditos são ganhos adicionais por nível, não totais acumulados',()=>{
 const r=E.resumo(ficha(8));assert.equal(r.chaveDisponivel,74);assert.equal(r.claDisponivel,6);
});
test('créditos por nível podem ser corrigidos com justificativa',()=>{
 let f=ficha(),r=E.registro(f);
 r=push(f,r,event('ajuste-nivel',{nivel:8,quantidade:28,bolsa:'chave',motivo:'Decisão do mestre'}));
 assert.equal(E.resumo(f,r).chaveRecebida,80);
 r=push(f,r,event('ajuste-nivel',{nivel:8,quantidade:30,bolsa:'chave',motivo:'Ajuste novo'}));
 assert.equal(E.resumo(f,r).chaveRecebida,82); // substitui 28, não soma
});
test('não é permitido ajustar nível não alcançado',()=>{
 assert.throws(()=>push(ficha(8),E.registro(ficha(8)),event('ajuste-nivel',{nivel:9,quantidade:99,bolsa:'chave',motivo:'x'})),/nível/);
});
test('compra debita saldo e registra nível + escolhas sem alterar a ficha',()=>{
 const f=ficha();const antes=JSON.stringify(f);const r=push(f,E.registro(f),event('compra',{habilidadeId:'duelista',nivel:8}));
 assert.equal(E.resumo(f,r).chaveDisponivel,72);
 assert.equal(r.eventos[0].nome,'Duelista');assert.equal(r.eventos[0].custo,2);
 assert.equal(JSON.stringify(f),antes);
});
test('compra sem saldo é rejeitada',()=>{
 const f=ficha(3);assert.throws(()=>push(f,E.registro(f),event('compra',{habilidadeId:'duelista'})),/saldo/);
});
test('repetição de habilidade única é bloqueada',()=>{
 const f=ficha();let r=push(f,E.registro(f),event('compra',{habilidadeId:'duelista'}));
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'duelista'})),/já foi/);
});
test('pré-requisito de Portão e nível mínimo são conferidos',()=>{
 const f=ficha();let r=E.registro(f);
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'terceiro_portao'})),/antes/);
 r=push(f,r,event('compra',{habilidadeId:'primeiro_portao'}));
 r=push(f,r,event('compra',{habilidadeId:'terceiro_portao'}));
 assert.equal(E.resumo(f,r).chaveGasta,8);
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'quinto_portao'})),/nível 10/);
});
test('estorno recupera pontos sem apagar o histórico',()=>{
 const f=ficha();let r=push(f,E.registro(f),event('compra',{habilidadeId:'duelista'}));const id=r.eventos[0].id;
 r=push(f,r,event('estorno',{alvoId:id}));assert.equal(E.resumo(f,r).chaveDisponivel,74);
 assert.equal(r.eventos.length,2);
 assert.throws(()=>push(f,r,event('estorno',{alvoId:id})),/estornada/);
});
test('não estorna o requisito se houver uma habilidade dependente',()=>{
 const f=ficha();let r=push(f,E.registro(f),event('compra',{habilidadeId:'primeiro_portao'}));
 const id=r.eventos[0].id;r=push(f,r,event('compra',{habilidadeId:'terceiro_portao'}));
 assert.throws(()=>push(f,r,event('estorno',{alvoId:id})),/exigida/);
});
test('clã converte um ponto em dois pontos-chave',()=>{
 const f=ficha();const r=push(f,E.registro(f),event('conversao',{quantidade:2}));
 assert.equal(E.resumo(f,r).claDisponivel,4);assert.equal(E.resumo(f,r).chaveDisponivel,78);
});
test('conversão maior que o saldo de clã é rejeitada',()=>{
 const f=ficha();assert.throws(()=>push(f,E.registro(f),event('conversao',{quantidade:10})),/saldo/);
});
test('Sarutobi: desconto somente para aprender nova natureza elemental',()=>{
 const f=ficha(8,'Sarutobi');let r=push(f,E.registro(f),event('compra',{habilidadeId:'natureza_chakra',detalhes:'Katon',tipoNatureza:'nova-elemental'}));
 assert.equal(r.eventos[0].custo,2);
 r=push(f,r,event('compra',{habilidadeId:'natureza_chakra',detalhes:'Katon',tipoNatureza:'evolucao'}));
 assert.equal(r.eventos[1].custo,4);
});
test('outros clãs pagam quatro por nova natureza elemental',()=>{
 const f=ficha();const r=push(f,E.registro(f),event('compra',{habilidadeId:'natureza_chakra',detalhes:'Katon',tipoNatureza:'nova-elemental'}));
 assert.equal(r.eventos[0].custo,4);
});
test('proficiência com armas não especiais exige duas armas diferentes',()=>{
 const f=ficha();const r=push(f,E.registro(f),event('compra',{habilidadeId:'habilidade_com_armas',detalhes:'Wakizaki, Foice Curta'}));
 assert.deepEqual(E.proficiencias(f,r),['wakizaki','foice_curta']);
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'habilidade_com_armas',detalhes:'Wakizaki, Agulha'})),/Especial/);
});
test('Agulha somente por talento de armas especiais',()=>{
 const f=ficha();const r=push(f,E.registro(f),event('compra',{habilidadeId:'versatilidade_com_armas',detalhes:'Agulha'}));
 assert.deepEqual(E.proficiencias(f,r),['agulha']);
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'versatilidade_com_armas',detalhes:'Kunai'})),/Especial/);
});
test('pontos gastos em habilidades antigas não são cobrados automaticamente',()=>{
 const f=ficha();f.automacaoAtaques.aquisicoes=[{id:'old0001',habilidadeId:'duelista',nivelAquisicao:7}];
 const reg=E.registro(f),r=E.resumo(f,reg);
 assert.equal(r.legados,1);assert.equal(r.chaveDisponivel,74);
 assert.throws(()=>push(f,reg,event('compra',{habilidadeId:'duelista'})),/já foi/);
});
test('gastos históricos são reconciliados só por ação confirmada',()=>{
 const f=ficha();const r=push(f,E.registro(f),event('despesa-antiga',{custo:14,bolsa:'chave',motivo:'Talentos antigos já gastos'}));
 assert.equal(E.resumo(f,r).chaveDisponivel,60);assert.equal(E.resumo(f,r).gastosAntigos,14);
});
test('registro histórico não debita pontos e impede duplicação de habilidade única',()=>{
 const f=ficha();const r=push(f,E.registro(f),event('historico',{habilidadeId:'duelista',nivel:5}));
 assert.equal(E.resumo(f,r).chaveDisponivel,74);
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'duelista'})),/já foi/);
});
test('requisitos de atributo validados',()=>{
 const f=ficha();f.destreza='14';assert.throws(()=>push(f,E.registro(f),event('compra',{habilidadeId:'especialista_em_shuriken'})),/destreza 15/);
});
test('limite de compras repetidas por proficiência é respeitado',()=>{
 const f=ficha(4);let r=E.registro(f);
 r=push(f,r,event('compra',{habilidadeId:'melhoria_chakra'}));
 r=push(f,r,event('compra',{habilidadeId:'melhoria_chakra'}));
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'melhoria_chakra'})),/Limite/);
});
test('conciliação granular preserva eventos de dois dispositivos',()=>{
 const a={versao:1,eventos:[{id:'idA',tipo:'historico',criadoEm:'2026-11-03T01:00:00Z'}]};
 const b={versao:1,eventos:[{id:'idB',tipo:'historico',criadoEm:'2026-11-03T01:00:01Z'}]};
 const mix=U.mesclarValorRemoto('pontosChaveV1',a,b);assert.equal(mix.eventos.length,2);
 assert.deepEqual(mix.eventos.map(e=>e.id),['idA','idB']);
});
test('IDs de transações repetidos são recusados',()=>{
 const f=ficha();const op=event('historico',{habilidadeId:'duelista'}),r=push(f,E.registro(f),op);
 assert.throws(()=>push(f,r,op),/já foi registrada/);
});
test('leitura do ledger não altera ficha nem campos do sincronizador',()=>{
 const f=ficha();const original=JSON.stringify(f);E.resumo(f);E.registro(f);E.proficiencias(f);
 assert.equal(JSON.stringify(f),original);
});
test('habilidade com custo não confirmado fica bloqueada',()=>{
 const f=ficha();assert.equal(E.habilidade('padrao_hipnotico').custo,null);
 assert.throws(()=>push(f,E.registro(f),event('compra',{habilidadeId:'padrao_hipnotico'})),/não informa custo/);
});
test('exige confirmação externa para talentos com pré-requisito não verificável',()=>{
 const f=ficha();assert.throws(()=>push(f,E.registro(f),event('compra',{habilidadeId:'kinjutsu'})),/Requisito ainda não verificável/);
});
test('natureza elemental já aprendida não pode ser cobrada como nova',()=>{
 const f=ficha(8,'Sarutobi');f.katon='2';
 assert.throws(()=>push(f,E.registro(f),event('compra',{habilidadeId:'natureza_chakra',detalhes:'Fogo',tipoNatureza:'nova-elemental'})),/já foi aprendida/);
});
test('segunda aquisição da mesma natureza nova não ganha desconto outra vez',()=>{
 const f=ficha(8,'Sarutobi');let r=push(f,E.registro(f),event('compra',{habilidadeId:'natureza_chakra',detalhes:'Fogo',tipoNatureza:'nova-elemental'}));
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'natureza_chakra',detalhes:'Katon',tipoNatureza:'nova-elemental'})),/já foi aprendida/);
});
test('aquisições antigas exigem conciliação explícita antes de novos débitos',()=>{
 const f=ficha();f.automacaoAtaques.aquisicoes=[{id:'old001',habilidadeId:'melhoria_vida',nivelAquisicao:7}];
 let r=E.registro(f);assert.throws(()=>push(f,r,event('compra',{habilidadeId:'duelista'})),/Reconcilie/);
 r=push(f,r,event('despesa-antiga',{custo:0,bolsa:'chave',motivo:'Nenhum gasto anterior'}));
 r=push(f,r,event('compra',{habilidadeId:'duelista'}));
 assert.equal(E.resumo(f,r).chaveDisponivel,72);
});
test('estorno de despesa antiga permite refazer a conciliação, mas bloqueia novas compras',()=>{
 const f=ficha();f.automacaoAtaques.aquisicoes=[{id:'old001',habilidadeId:'melhoria_vida',nivelAquisicao:7}];
 let r=push(f,E.registro(f),event('despesa-antiga',{custo:0,bolsa:'chave',motivo:'Revisão'}));
 const id=r.eventos[0].id;r=push(f,r,event('estorno',{alvoId:id}));
 assert.throws(()=>push(f,r,event('compra',{habilidadeId:'duelista'})),/Reconcilie/);
});
