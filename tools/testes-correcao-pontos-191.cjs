'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../js/17-pontos-chave-engine.js');
const M=require('../js/17-migracao-habilidades-186.js');
const U=require('../js/19-realtime-fields-utils.js');
const P=require('../js/17-preparacao-ataques.js');
let seq=0;
const ficha=(nivel=8,cla='Sarutobi',nome='Luffy')=>({nivel:String(nivel),cla,nome,destreza:'20',forca:'16',inteligencia:'16',
  jutsus:[{id:'katon_grande_bola',jutsuId:'katon_grande_bola',nome:'Katon: Grande Bola de Fogo',custo:7}],automacaoAtaques:{aquisicoes:[]}});
const evt=(tipo,rest={})=>({id:'t191_'+String(++seq).padStart(5,'0'),tipo,...rest});
const registrar=(f,r,e)=>E.registrarEvento(f,r,e,{preparacao:P});
test('prévia reconhece gasto de aquisições importadas sem debitá-las',()=>{
  const f=ficha();f.pontosChaveV1={versao:1,eventos:[{id:'hist_01',tipo:'historico',habilidadeId:'duelista',custo:0,bolsa:'historico'},
    {id:'hist_02',tipo:'historico',habilidadeId:'alerta',custo:0,bolsa:'historico'}]};
  const a=E.estimarGastosHistoricos(f);
  assert.equal(a.estimativaParcial,6);assert.equal(a.pendentes,0);assert.equal(a.gastosJaConciliados,0);
  assert.equal(E.resumo(f).chaveDisponivel,74);assert.equal(a.haHistoricos,true);
});
test('natureza Sarutobi sem tipo confirmado não recebe desconto suposto',()=>{
  const f=ficha();f.pontosChaveV1={eventos:[{id:'hist_03',tipo:'historico',habilidadeId:'natureza_chakra',escolhas:{alvoId:'katon'}}]};
  const a=E.estimarGastosHistoricos(f);assert.equal(a.pendentes,1);assert.equal(a.estimativaParcial,0);
});
test('natureza Sarutobi nova tem custo sugerido 2, evolução 4',()=>{
  const f=ficha();f.pontosChaveV1={eventos:[{id:'hist_04',tipo:'historico',habilidadeId:'natureza_chakra',escolhas:{tipoNatureza:'nova-elemental'}},
    {id:'hist_05',tipo:'historico',habilidadeId:'natureza_chakra',escolhas:{tipoNatureza:'evolucao'}}]};
  const a=E.estimarGastosHistoricos(f);assert.equal(a.estimativaParcial,6);
});
test('compras novas exigem marco futuro quando há histórico vindo do suplemento',()=>{
  const f=ficha();f.pontosChaveV1={eventos:[{id:'hist_supl',tipo:'historico',habilidadeId:'ninjutsu_melhorado_1'}]};
  assert.throws(()=>registrar(f,E.registro(f),evt('compra',{habilidadeId:'duelista'})),/Inicie o controle/);
});
test('um mesmo saco de gastos históricos não é debitado duas vezes',()=>{
  const f=ficha();let r=registrar(f,E.registro(f),evt('despesa-antiga',{custo:15,bolsa:'chave',motivo:'Conferido com o mestre'}));
  assert.throws(()=>registrar(f,r,evt('despesa-antiga',{custo:15,bolsa:'chave',motivo:'Novo registro igual'})),/já foram conciliados/);
  r=registrar(f,r,evt('estorno',{alvoId:r.eventos[0].id}));
  r=registrar(f,r,evt('despesa-antiga',{custo:13,bolsa:'chave',motivo:'Correção após revisão'}));
  assert.equal(E.resumo(f,r).chaveDisponivel,61);
});
test('união offline pode produzir saldo negativo, sem descartar transações',()=>{
  const f=ficha(4,'Lee','Shizen');
  const a={eventos:[{id:'a',tipo:'compra',habilidadeId:'sorte',custo:10,bolsa:'chave',criadoEm:'2026-11-04T00:00:00Z'}]};
  const b={eventos:[{id:'b',tipo:'compra',habilidadeId:'sorte',custo:10,bolsa:'chave',criadoEm:'2026-11-04T00:00:01Z'}]};
  const m=U.mesclarValorRemoto('pontosChaveV1',a,b);f.pontosChaveV1=m;
  const a2=E.auditarIntegridade(f);assert.equal(m.eventos.length,2);assert.equal(a2.ok,false);
  assert.equal(a2.chaveDisponivel,-10);
  assert.ok(a2.problemas.some(x=>x.codigo==='saldo-chave-negativo'));
  assert.throws(()=>registrar(f,E.registro(f),evt('compra',{habilidadeId:'duelista'})),/saldo insuficiente|conflito/);
});
test('estorno parcial é permitido quando ainda há saldo negativo, até resolver conflito',()=>{
  const f=ficha(4,'Lee','Shizen');f.pontosChaveV1={eventos:[
    {id:'a',tipo:'compra',habilidadeId:'sorte',custo:10,bolsa:'chave'},
    {id:'b',tipo:'compra',habilidadeId:'duelista',custo:2,bolsa:'chave'},
    {id:'c',tipo:'compra',habilidadeId:'alerta',custo:4,bolsa:'chave'}]};
  let r=registrar(f,E.registro(f),evt('estorno',{alvoId:'b'}));
  assert.equal(E.resumo(f,r).chaveDisponivel,-4);
  r=registrar(f,r,evt('estorno',{alvoId:'c'}));
  assert.equal(E.resumo(f,r).chaveDisponivel,0);
  assert.equal(E.auditarIntegridade(f,r).ok,true);
});
test('reconhecimento da aquisição revisa destino sem gerar nova compra',()=>{
  const f=ficha();const model=M.identificar(f);assert.ok(model);
  const ent=model.entradas.find(e=>e.habilidadeId==='ninjutsu_melhorado_2');
  const reg=M.conciliar(f,model.id,{[ent.sourceId]:{confirmar:true,alvoId:'katon_grande_bola',aplicacao:'ja-aplicado',efeito:'reduzir-custo'}},E).registro;
  f.pontosChaveV1=reg;
  const antigos=E.resumo(f).compras.length;
  const revisado=M.revisar(f,ent.sourceId,{confirmar:true,alvoId:'katon_grande_bola',aplicacao:'incerto',efeito:'dobrar-alcance'},E);
  f.pontosChaveV1=revisado.registro;
  assert.equal(E.resumo(f).compras.length,antigos);
  assert.equal(f.jutsus[0].custo,7);
  const compra=E.resumo(f).compras.find(c=>c.origemSuplementoId===ent.sourceId);
  assert.equal(compra.escolhas.efeito,'dobrar-alcance');
  assert.equal(compra.escolhas.aplicacao,'incerto');
  assert.equal(revisado.evento.tipo,'vinculo-habilidade');
  assert.ok(revisado.evento.revisaEventoId);
});
test('revisão idêntica é recusada sem adicionar eventos',()=>{
  const f=ficha();const model=M.identificar(f);const ent=model.entradas.find(e=>e.habilidadeId==='ninjutsu_aprimorado');
  f.pontosChaveV1=M.conciliar(f,model.id,{[ent.sourceId]:{confirmar:true,alvoId:'katon_grande_bola',aplicacao:'ja-aplicado',efeito:'aumentar-dado'}},E).registro;
  assert.throws(()=>M.revisar(f,ent.sourceId,{confirmar:true,alvoId:'katon_grande_bola',aplicacao:'ja-aplicado',efeito:'aumentar-dado'},E),/Nenhuma informação/);
});
test('atributo já efetivado não pode ser redirecionado de forma silenciosa',()=>{
  const f=ficha();const model=M.identificar(f);const ent=model.entradas.find(e=>e.habilidadeId==='melhoria_atributo');
  f.pontosChaveV1=M.conciliar(f,model.id,{[ent.sourceId]:{confirmar:true,alvoId:'destreza',aplicacao:'nao-aplicado'}},E).registro;
  const id=E.resumo(f).compras.find(c=>c.origemSuplementoId===ent.sourceId).id;
  f.pontosChaveV1.eventos.push({id:'ef_191',tipo:'efetivacao-beneficio',alvoId:id,habilidadeId:'melhoria_atributo'});
  assert.throws(()=>M.revisar(f,ent.sourceId,{confirmar:true,alvoId:'forca',aplicacao:'nao-aplicado'},E),/permanentemente/);
});
test('dois IDs iguais com conteúdo diferente geram alerta persistido',()=>{
  const l={eventos:[{id:'mesmo',tipo:'compra',habilidadeId:'duelista',custo:2}]};
  const r={eventos:[{id:'mesmo',tipo:'compra',habilidadeId:'duelista',custo:3}]};
  const mix=U.mesclarValorRemoto('pontosChaveV1',r,l);
  assert.deepEqual(mix.conflitosSync,['mesmo']);
  const f=ficha();f.pontosChaveV1=mix;
  assert.ok(E.auditarIntegridade(f).problemas.some(x=>x.codigo==='colisao-id-sync'));
  assert.deepEqual(E.registro(f).conflitosSync,['mesmo']);
});
