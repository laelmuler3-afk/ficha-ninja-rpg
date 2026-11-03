#!/usr/bin/env node
/* Regras do mestre Keven, 02/11/2026; testes contra cálculos confirmados. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const P=require('../js/17-preparacao-ataques.js');
const C=require('../js/17-calculos-confirmados.js');
let total=0;
function teste(nome,fn){fn();total++;console.log('OK',nome);}
const F={nivel:8,forca:16,destreza:20,cla:'Sarutobi',armados:[{nome:'Wakizashi',bonusAcerto:'MANUAL',dano:'1d8',bonusDano:'7'}]};
function ver(ficha,ataque){return C.calcularPrevia(ficha,ataque,P);}
teste('o cálculo não altera a ficha nem preenche campos manuais',()=>{
 const anterior=JSON.stringify(F);const r=ver(F,F.armados[0]);assert.equal(JSON.stringify(F),anterior);assert.equal(r.modificaFicha,false);
});
teste('proficiência +3 no nível 8 e +6 no nível 20',()=>{
 assert.equal(C.proficienciaDoNivel(8),3);assert.equal(C.proficienciaDoNivel(20),6);assert.equal(C.proficienciaDoNivel(0),null);
});
teste('desarmado comum usa FOR e proficiência desde a criação',()=>{
 const r=ver(F,{nome:'Soco',tipo:'desarmado'});assert.equal(r.status,'calculado');assert.equal(r.proficiencia,'confirmada');
 assert.equal(r.variantes[0].acertoComProficiencia,6);assert.equal(r.variantes[0].dano,'1d6+3');assert.equal(r.variantes[0].danoCritico,'2d6+3');
});
teste('Taijutsu Básico: dois golpes de AB sem acerto e dano de nenhuma fonte',()=>{
 const r=ver(F,{nome:'Taijutsu Básico',tipo:'desarmado'});assert.equal(r.status,'calculado');
 assert.equal(r.variantes[0].modo,'2 golpes (ação bônus)');assert.equal(r.variantes[0].acertoComProficiencia,0);
 assert.equal(r.variantes[0].dano,'1d6');
});
teste('Taijutsu Básico Hyuuga: 1d4 sem modificadores',()=>{
 const r=ver({...F,cla:'Hyuuga'},{nome:'Taijutsu Básico',tipo:'desarmado'});
 assert.equal(r.variantes[0].dano,'1d4');assert.equal(r.variantes[0].acertoComProficiencia,0);
});
teste('Hyuuga: 1d4 limpo e acerto continua proficiente',()=>{
 const r=ver({...F,cla:'Hyuuga'},{tipo:'desarmado',nome:'Punho Suave'});
 assert.equal(r.variantes[0].dano,'1d4');assert.equal(r.variantes[0].danoCritico,'2d4');assert.equal(r.variantes[0].acertoComProficiencia,6);
 assert.ok(r.avisos.some(x=>x.includes('segundo golpe')));
});
teste('Aburame ignora bônus positivo de dano desarmado',()=>{
 const r=ver({...F,cla:'Aburame'},{tipo:'desarmado'});assert.equal(r.variantes[0].dano,'1d6');
});
teste('Aburame mantém modificador negativo no dano',()=>{
 const r=ver({...F,cla:'Aburame',forca:8},{tipo:'desarmado'});assert.equal(r.variantes[0].dano,'1d6-1');
});
teste('Wakizashi: DEX, dano 1d8 e 1d10, sem presumir proficiência',()=>{
 const r=ver(F,{nome:'Corte',itemInventario:'Wakizashi'});
 assert.equal(r.proficiencia,'nao-registrada');assert.equal(r.variantes.length,2);
 assert.deepEqual(r.variantes.map(v=>v.dano),['1d8+5','1d10+5']);
 assert.equal(r.variantes[0].acertoSemProficiencia,5);assert.equal(r.variantes[0].acertoComProficiencia,8);
});
teste('Wakizashi: proficiência adicional apenas declarada (não validada)',()=>{
 const ficha={...F,automacaoAtaques:{proficienciasExtras:[{armaId:'wakizaki',origem:'pontos-chave'}]}};
 const r=ver(ficha,{nome:'Wakizaki'});assert.equal(r.proficiencia,'registrada');assert.ok(r.avisos.some(x=>x.includes('pendente')));
});
teste('Agulha: acerto DEX, dano fixo 1 inclusive no crítico',()=>{
 const r=ver(F,{nome:'Agulhas'});assert.equal(r.variantes[0].acertoSemProficiencia,5);
 assert.equal(r.variantes[0].dano,'1');assert.equal(r.variantes[0].danoCritico,'1');
});
teste('Nunchaku: multiplicador DEX 2 sem adicional repetido',()=>{
 const r=ver(F,{nome:'Nunchaku'});assert.equal(r.variantes[0].dano,'10');assert.equal(r.variantes[0].danoCritico,'10');
});
teste('Corrente: multiplicador FOR 3 sem adicional repetido',()=>{
 const r=ver(F,{nome:'Corrente'});assert.equal(r.variantes[0].dano,'9');assert.equal(r.variantes[0].danoCritico,'9');
});
teste('Kunai/Acuidade: apresenta FOR ou DES, ambas inicialmente proficientes',()=>{
 const r=ver(F,{nome:'Kunai'});assert.equal(r.proficiencia,'confirmada');assert.deepEqual(r.variantes.map(v=>v.dano),['1d6+3','1d6+5']);
 assert.deepEqual(r.variantes.map(v=>v.acertoComProficiencia),[6,8]);
});
teste('Shuriken: dados e crítico distintos de Kunai',()=>{
 const r=ver(F,{nome:'Shuriken'});assert.equal(r.variantes[1].dano,'1d4+5');assert.equal(r.variantes[1].danoCritico,'2d4+5');
});
teste('não inventa atributo para armas sem regra explícita',()=>{
 const r=ver(F,{nome:'Katana'});assert.equal(r.status,'pendente');assert.equal(r.variantes.length,0);
});
teste('arma personalizada continua manual sem associação falsa',()=>{
 const r=ver(F,{nome:'Espada da Neblina'});assert.equal(r.status,'pendente');assert.equal(r.armaId,null);
});
teste('atributo ainda não preenchido impede cálculo, sem assumir zero',()=>{
 const r=ver({...F,destreza:0},{nome:'Agulha'});assert.equal(r.status,'pendente');assert.equal(r.variantes.length,0);
});
teste('efeitos ativos e pontos-chave são preservados e não somados provisoriamente',()=>{
 const ficha={...F,automacaoAtaques:{aquisicoes:[{habilidadeId:'duelista'}]},efeitosJutsuBatalha:[{bonus:{acerto:10}}]};
 const antes=JSON.stringify(ficha);const r=ver(ficha,{nome:'Wakizashi'});
 assert.deepEqual(r.variantes.map(x=>x.dano),['1d8+5','1d10+5']);assert.equal(JSON.stringify(ficha),antes);
});
teste('Sarutobi: desconto 4→2 somente em nova natureza elemental',()=>{
 const r=C.custoNovaNatureza(F,4,'nova-elemental');assert.equal(r.custoProposto,2);assert.equal(r.pendente,false);
 const r2=C.custoNovaNatureza(F,4,'evolucao-elemental');assert.equal(r2.custoProposto,4);assert.equal(r2.pendente,true);
});
teste('não Sarutobi não ganha desconto em novas naturezas',()=>{
 assert.equal(C.custoNovaNatureza({...F,cla:'Uchiha'},4,'nova-elemental').custoProposto,4);
});
teste('versão legada expõe cálculos equivalentes',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../js-legacy/17-calculos-confirmados.js'),'utf8');
 const w={document:{}};const ctx=vm.createContext({window:w,console,JSON,Math,Number,Array,String,Object});
 vm.runInContext(source,ctx);assert.equal(w.ShinobiCalculosConfirmados.versao,C.versao);
 const r=w.ShinobiCalculosConfirmados.calcularPrevia(F,{nome:'Wakizashi'},P);
 assert.equal(r.variantes[1].dano,'1d10+5');
});
console.log('\nPASSARAM',total,'testes de cálculos confirmados');
