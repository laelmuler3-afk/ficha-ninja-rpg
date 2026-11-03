#!/usr/bin/env node
/* Preparação 2.5.8.181 — testes de contrato (sem navegador). */
"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const P=require('../js/17-preparacao-ataques.js');
const C=require('../js/17-calculos-confirmados.js');
const Campos=require('../js/19-realtime-fields-utils.js');
let total=0;
function teste(nome,fn){fn();total++;console.log('OK',nome);}
function preparar(estado){
  const document={readyState:'loading',addEventListener(){}};
  const janela={document,ShinobiPreparacaoAtaques:P,ShinobiCalculosConfirmados:C};
  const contexto={window:janela,document,estado,console,Date,Math,JSON};
  vm.runInNewContext(fs.readFileSync(path.join(root,'js/17-integracao-ataques.js'),'utf8'),contexto,{filename:'17-integracao-ataques.js'});
  return janela.ShinobiIntegracaoAtaques;
}
const ataque={nome:'Corte de sombra',tipo:'armado',itemInventario:'Wakizaki',bonusAcerto:'8',dano:'1d8',bonusDano:'7'};
const ficha={nivel:'8',armados:[{...ataque}],inventarioItens:[{nome:'Wakizaki',quantidade:2}]};
const original=JSON.stringify(ficha);
const ui=preparar(ficha);
teste('carrega o módulo sem abrir a interface antes de a página estar pronta',()=>assert.equal(ui.versao,'2.5.8.183'));
teste('identifica o Wakizashi por item de inventário mesmo quando ataque tem outro nome',()=>assert.equal(ui.relatorioAtaque(ficha.armados[0]).catalogo.id,'wakizaki'));
teste('reconhece vínculo com inventário e quantidade',()=>assert.match(ui.relatorioAtaque(ficha.armados[0]).inventario.rotulo,/qtd. 2/));
teste('não inventa proficiência para Wakizashi',()=>assert.equal(ui.relatorioAtaque(ficha.armados[0]).proficiencia.estado,'incerto'));
teste('não altera ataque ou inventário ao consultar referência',()=>assert.equal(JSON.stringify(ficha),original));
teste('registra origem em estrutura existente sem calcular acerto',()=>{
 ficha.automacaoAtaques=P.criarEstruturaVazia();
 ficha.automacaoAtaques.proficienciasExtras.push({id:'a1',armaId:'wakizaki',origem:'pontos-chave',observacoes:'Aquisição histórica'});
 assert.equal(ui.relatorioAtaque(ficha.armados[0]).proficiencia.estado,'registrada');
 assert.equal(ficha.armados[0].bonusAcerto,'8');
 assert.equal(ficha.armados[0].dano,'1d8');
 assert.equal(ficha.armados[0].bonusDano,'7');
});
teste('confere Kunai e Shuriken como proficiências iniciais',()=>{
 assert.equal(ui.relatorioAtaque({nome:'Kunai',tipo:'armado'}).proficiencia.estado,'inicial');
 assert.equal(ui.relatorioAtaque({nome:'Shuriken',tipo:'armado'}).proficiencia.estado,'inicial');
});
teste('não confunde Agulha com proficiência inicial',()=>assert.equal(ui.relatorioAtaque({nome:'Agulha',tipo:'armado'}).proficiencia.estado,'incerto'));
teste('reconhece ataque desarmado sem alterar seu registro original',()=>assert.equal(ui.relatorioAtaque({nome:'Soco',tipo:'desarmado'}).catalogo.dano,null));
teste('não soma proficiência automaticamente mesmo na aquisição de habilidade',()=>{
 ficha.automacaoAtaques.aquisicoes.push(P.criarRascunhoAquisicao('habilidade_com_armas',{id:'r2',nivel:4,origem:'pontos-chave',escolhas:{descricao:'Wakizashi e Agulha'}}));
 assert.equal(ui.relatorioAtaque({nome:'Agulha',tipo:'armado'}).proficiencia.estado,'incerto');
});
teste('campo automacaoAtaques é aceito pela sincronização granular',()=>{
 assert.equal(Campos.campoPermitido('automacaoAtaques'),true);
 assert.ok(Campos.camposAlterados({automacaoAtaques:{}},{automacaoAtaques:ficha.automacaoAtaques}).includes('automacaoAtaques'));
});
teste('módulo novo consta no carregador moderno e legado',()=>assert.match(fs.readFileSync(path.join(root,'js/00-compat-loader.js'),'utf8'),/17-integracao-ataques\.js/));
teste('módulo de fórmulas confirmado carrega antes da interface',()=>{
 const t=fs.readFileSync(path.join(root,'js/00-compat-loader.js'),'utf8');
 assert.ok(t.indexOf('17-calculos-confirmados.js')>t.indexOf('17-preparacao-ataques.js'));
 assert.ok(t.indexOf('17-calculos-confirmados.js')<t.indexOf('17-integracao-ataques.js'));
});
teste('entrada do novo módulo está no manifest legado',()=>assert.ok(JSON.parse(fs.readFileSync(path.join(root,'js-legacy/manifest.json'),'utf8')).sources['js/17-integracao-ataques.js']));
teste('fórmulas foram publicadas no manifest legado',()=>assert.ok(JSON.parse(fs.readFileSync(path.join(root,'js-legacy/manifest.json'),'utf8')).sources['js/17-calculos-confirmados.js']));
teste('cache offline contempla os novos cálculos em ambos os modos',()=>{
 const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
 for(const f of ['js/17-calculos-confirmados.js','js-legacy/17-calculos-confirmados.js']) assert.ok(sw.includes(f),f);
});
teste('cache offline conhece o novo CSS, JS moderno e legado',()=>{
 const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
 for(const f of ['preparacao-ataques.css','js/17-integracao-ataques.js','js-legacy/17-integracao-ataques.js']) assert.ok(sw.includes(f),f);
});
teste('sem mudança em fórmulas manuais',()=>assert.deepEqual(ficha.armados[0],ataque));
console.log('\nPASSARAM',total,'testes de integração preparatória');
