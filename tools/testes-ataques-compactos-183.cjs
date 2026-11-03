#!/usr/bin/env node
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const core=fs.readFileSync(path.join(root,'js/01-core.js'),'utf8');
const a=core.indexOf('/* 2.5.8.183: abertura de ataques');
const b=core.indexOf('function numeroSeguro(valor)',a);
assert.ok(a>0 && b>a,'Renderizador de ataques disponível');
const trecho=core.slice(a,b);
function montar(){
 const lista={innerHTML:''};let salvou=0,usos=0;
 const contexto={
    estado:{armados:[
     {nome:'Wakizashi',tipo:'armado',bonusAcerto:'+8',dano:'1d8',bonusDano:'+7',itemInventario:'Wakizaki',quantidadeUso:'1'},
     {nome:'Soco',tipo:'desarmado',bonusAcerto:'+7',dano:'1d6',bonusDano:'+4',obs:'Sem equipamento'}
    ]},
    document:{getElementById(id){return id==='listaArmados'?lista:null},querySelector(){return {focus(){}}}},
    escaparHtmlShinobi:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
    valorArmado:(a,k,defaultValue='—')=>a[k]===undefined||a[k]===''?defaultValue:String(a[k]),
    formatarDanoTotal:(base,plus)=>String(base)+((plus&&plus!=='0')?' + '+String(plus).replace(/^\+/,''):''),
    visualIconeAtaque:()=>'<span>⚔️</span>',visualIconeItemAtaque:()=>'<span>🎒</span>',
    labelTipoAtaque:type=>type==='desarmado'?'Ataque desarmado':'Ataque armado',
    persistirEstadoLocal(){salvou++},
    usarAtaqueInventario(){usos++}
 };
 vm.createContext(contexto);
 vm.runInContext(trecho,contexto,{filename:'01-core.js:ataques-183'});
 return {contexto,lista,info:()=>({salvou,usos})};
}
test('cartões mostram nome, acerto, dano total e ação em visualização fechada',()=>{
 const {contexto,lista}=montar();vm.runInContext('renderizarArmados()',contexto);
 assert.match(lista.innerHTML,/Wakizashi/);
 assert.match(lista.innerHTML,/ataqueBatalha183/);
 assert.match(lista.innerHTML,/Acerto<\/span><strong>\+8/);
 assert.match(lista.innerHTML,/Dano total<\/span><strong>1d8 \+ 7/);
 assert.match(lista.innerHTML,/usarAtaqueInventario\(0\)/);
 assert.equal((lista.innerHTML.match(/ataqueCard183 /g)||[]).length,2);
 assert.match(lista.innerHTML,/aria-expanded="false"/);
});
test('expansão é estado local de interface, sem alterar ficha ou persistir',()=>{
 const {contexto,lista,info}=montar(),antes=JSON.stringify(contexto.estado);
 vm.runInContext('renderizarArmados(); alternarAtaqueAberto(0)',contexto);
 assert.match(lista.innerHTML,/ataqueCard183 ataque-armado ataqueAberto/);
 assert.match(lista.innerHTML,/aria-expanded="true"/);
 assert.equal(info().salvou,0);
 assert.equal(JSON.stringify(contexto.estado),antes);
 vm.runInContext('alternarAtaqueAberto(0)',contexto);
 assert.match(lista.innerHTML,/aria-expanded="false"/);
});
test('edição e remoção ficam no menu/detalhes, sem botões destrutivos principais',()=>{
 const {contexto,lista}=montar();vm.runInContext('renderizarArmados()',contexto);
 assert.match(lista.innerHTML,/<details class="ataqueOpcoes183">/);
 assert.match(lista.innerHTML,/<details class="ataqueEdicao183">/);
 assert.match(lista.innerHTML,/removerArmado\(0\)/);
 assert.match(lista.innerHTML,/editarCampoArmadoPrompt\(0,'bonusAcerto'/);
});
test('não injeta HTML ao renderizar nome personalizado',()=>{
 const {contexto,lista}=montar();contexto.estado.armados[0].nome='<img src=x onerror=alert(1)>';
 vm.runInContext('renderizarArmados()',contexto);
 assert.doesNotMatch(lista.innerHTML,/<img src=x onerror=/);
 assert.match(lista.innerHTML,/&lt;img/);
});
test('integração anexa regras a details recolhível sem perder referência',()=>{
 const integrado=fs.readFileSync(path.join(root,'js/17-integracao-ataques.js'),'utf8');
 assert.match(integrado,/elemento\("details","shinobiReferencia183"\)/);
 assert.match(integrado,/recolhivel\.appendChild\(bloco\)/);
 assert.match(integrado,/versao:"2\.5\.8\.184"/);
});
test('ataque desarmado funciona sem item e não altera inventário', async()=>{
 const i=core.indexOf('async function usarAtaqueInventario(i)');
 const bloco=core.slice(i,core.indexOf('window.addEventListener("pageshow"',i));
 assert.ok(i>0 && bloco.includes('ataque.tipo'));
 const mensagens=[];
 const estado={armados:[{nome:'Soco',tipo:'desarmado',itemInventario:'',quantidadeUso:'1'}],inventarioItens:[]};
 const contexto={estado,garantirInventarioItens(){},confirmarUsoAcao:async()=>true,
   registrarLog:texto=>mensagens.push(texto),avisoShinobi:async(_t,descricao)=>mensagens.push(descricao),
   salvarInventarioItens(){throw Error('Não deveria consumir estoque')},
   persistirSemRender(){throw Error('Não deveria persistir')},
   renderizarInventario(){throw Error('Não deveria atualizar inventário')},
   renderizarArmados(){throw Error('Não deveria re-renderizar')},
   buscarItemInventarioPorNome(){throw Error('Não deveria procurar item')}
 };
 vm.createContext(contexto);
 vm.runInContext(bloco+'; this.executar=usarAtaqueInventario;',contexto);
 await contexto.executar(0);
 assert.equal(estado.inventarioItens.length,0);
 assert.match(mensagens.join(' '),/Soco usado/);
});
test('CSS e cache offline carregados depois dos estilos antigos',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
 assert.match(html,/ataques-compactos-183\.css\?v=2\.5\.8\.184/);
 assert.ok(html.indexOf('css/jutsus.css')<html.indexOf('css/ataques-compactos-183.css'));
 assert.match(sw,/\.\/css\/ataques-compactos-183\.css\?v=/);
 assert.ok(fs.existsSync(path.join(root,'css/ataques-compactos-183.css')));
});
