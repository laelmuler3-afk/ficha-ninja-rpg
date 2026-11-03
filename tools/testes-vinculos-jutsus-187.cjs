'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../js/17-migracao-habilidades-186.js');
const E=require('../js/17-pontos-chave-engine.js');
const V=require('../js/17-vinculos-jutsus-187.js');
const ficha=()=>({nome:'Luffy Sarutobi',cla:'Sarutobi',nivel:8,destreza:20,forca:12,jutsus:[
 {jutsuId:'jutsu_bola_001',nome:'Katon: Grande Bola de Fogo',custo:7},
 {jutsuId:'jutsu_espada_001',nome:'Katon: Lâmina Flamejante',custo:4}],pontosChaveV1:{eventos:[]}});
function entrada(id){return V.resumo(ficha(),M,E).entradas.find(e=>e.habilidadeId===id);}
test('na aba Jutsus aparecem apenas melhorias que exigem escolher um jutsu',()=>{
 const r=V.resumo(ficha(),M,E);
 assert.equal(r.modelo.nome,'Luffy Sarutobi');
 assert.equal(r.entradas.length,2);
 assert.equal(r.pendentes,2);
 assert.ok(r.entradas.some(e=>e.habilidadeId==='ninjutsu_melhorado_2'));
 assert.ok(r.entradas.some(e=>e.habilidadeId==='ninjutsu_aprimorado'));
});
test('nenhuma aquisição é atribuída por aproximação do nome de outro personagem',()=>{
 const f=ficha();f.nome='Luffy clone';
 assert.equal(V.resumo(f,M,E).modelo,null);
 assert.equal(V.resumo(f,M,E).pendentes,0);
});
test('só permite selecionar jutsu realmente salvo e com identificador estável',()=>{
 const e=entrada('ninjutsu_melhorado_2'),f=ficha(),alvos=M.alvos(f,'jutsu');
 assert.equal(alvos.length,2);
 assert.throws(()=>V.validarEscolha(e,'outro','ja-aplicado','reduzir-custo',alvos),/jutsu existente/);
 assert.throws(()=>V.validarEscolha(e,'indice:0','ja-aplicado','reduzir-custo',[{id:'indice:0'}]),/identificador estável/);
 assert.throws(()=>V.validarEscolha(e,'jutsu_bola_001','','reduzir-custo',alvos),/já foi aplicado/);
 assert.throws(()=>V.validarEscolha(e,'jutsu_bola_001','ja-aplicado','desconhecido',alvos),/qual melhoria/);
 const ok=V.validarEscolha(e,'jutsu_bola_001','ja-aplicado','reduzir-custo',alvos);
 assert.equal(ok.alvoId,'jutsu_bola_001');assert.equal(ok.aplicacao,'ja-aplicado');
});
test('vínculo confirmado preserva custo manual de 7 EKO e histórico sem duplicar gastos',()=>{
 const f=ficha(),modelo=M.identificar(f),entry=entrada('ninjutsu_melhorado_2');
 const op=V.validarEscolha(entry,'jutsu_bola_001','ja-aplicado','reduzir-custo',M.alvos(f,'jutsu'));
 op.observacao='Grande Bola de Fogo já custa 7 EKO';
 const antes=JSON.stringify(f),res=M.conciliar(f,modelo.id,{[entry.sourceId]:op},E);
 assert.equal(JSON.stringify(f),antes);
 assert.equal(res.confirmadas,1);
 f.pontosChaveV1=res.registro;
 assert.equal(f.jutsus[0].custo,7);
 assert.equal(E.resumo(f).chaveGasta,0);
 assert.equal(E.resumo(f).compras.find(x=>x.habilidadeId==='ninjutsu_melhorado_2').escolhas.efeito,'reduzir-custo');
 assert.equal(M.conciliar(f,modelo.id,{[entry.sourceId]:op},E).confirmadas,0);
 assert.equal(V.resumo(f,M,E).pendentes,1);
});
test('outra habilidade pode ser vinculada a outro jutsu sem reduzir EKO',()=>{
 const f=ficha(),entry=entrada('ninjutsu_aprimorado');
 const op=V.validarEscolha(entry,'jutsu_espada_001','nao-aplicado','acao-bonus',M.alvos(f,'jutsu'));
 const res=M.conciliar(f,M.identificar(f).id,{[entry.sourceId]:op},E);
 assert.equal(res.registro.eventos[0].escolhas.efeito,'acao-bonus');
 assert.equal(f.jutsus[1].custo,4);
});
test('continua possível importar do Perfil sem informar subtipo de efeito',()=>{
 const f=ficha(),entry=entrada('ninjutsu_melhorado_2');
 const res=M.conciliar(f,M.identificar(f).id,{[entry.sourceId]:{confirmar:true,alvoId:'jutsu_bola_001',aplicacao:'incerto'}},E);
 assert.equal(res.confirmadas,1);
 assert.equal(res.registro.eventos[0].escolhas.efeito,'');
});
test('reconhece compra previamente registrada e cria vínculo sem outra compra',()=>{
 const f=ficha(),entry=entrada('ninjutsu_melhorado_2');
 f.pontosChaveV1.eventos.push({id:'compra_existente_1234',tipo:'historico',habilidadeId:'ninjutsu_melhorado_2',custo:0});
 const r=V.resumo(f,M,E);
 assert.equal(r.entradas.find(e=>e.sourceId===entry.sourceId).estado,'ja-registrado');
 const op=V.validarEscolha(entry,'jutsu_bola_001','ja-aplicado','reduzir-custo',M.alvos(f,'jutsu'));
 const res=M.conciliar(f,M.identificar(f).id,{[entry.sourceId]:op},E);
 assert.equal(res.registro.eventos[1].tipo,'vinculo-habilidade');
 assert.equal(res.registro.eventos[1].alvoId,'compra_existente_1234');
 f.pontosChaveV1=res.registro;
 assert.equal(E.resumo(f).compras.filter(e=>e.habilidadeId==='ninjutsu_melhorado_2').length,1);
});
