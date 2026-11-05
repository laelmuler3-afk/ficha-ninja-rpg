'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const B=require('../js/17-beneficios-jutsus-188.js');
const Livro=require('../js/17-pontos-chave-engine.js');

function fichaComAprimorado(){
  return {nivel:8,cla:'Sarutobi',katon:0,jutsus:[{jutsuId:'bola',nome:'Katon: Grande Bola de Fogo',elemento:'katon',rank:'B',dano:'8d6',custo:'7',alcance:'até 30 metros',acao:'Ação'}],
    pontosChaveV1:{eventos:[{id:'hist-1',tipo:'historico',habilidadeId:'ninjutsu_aprimorado',custo:0,escolhas:{alvoTipo:'jutsu',alvoId:'bola',aplicacao:'nao-aplicado',efeito:'aumentar-dado'}}]}};
}
function cardFake(){
  const rotulos=['Dano','Dano total','Alcance','Bônus dano'];
  const buttons=rotulos.map(rotulo=>{
    const value={className:'jutsuCampoValor',textContent:'ANTIGO'};
    const titulo={childNodes:[{nodeType:1,textContent:'⚔'},{nodeType:3,textContent:rotulo}],textContent:'⚔'+rotulo};
    const dados={'.jutsuCampoValor':value,'b':titulo};
    return {rotulo,value,titulo,dados,
      querySelector(s){return dados[s]||null;},
      appendChild(node){dados['.'+node.className]=node;node.remove=()=>{delete dados['.'+node.className];};}};
  });
  const metadata={textContent:''};
  const resumoLinha={querySelector(s){return s==='.jutsuMetadadosTexto'?metadata:null;}};
  const card={classList:{toggle(){}},querySelectorAll(s){return s==='.jutsuResumo button'?buttons:[];},
    querySelector(s){return s==='.jutsuLinhaTexto small'?resumoLinha:null;}};
  return {card,buttons,metadata};
}
function prepararAmbiente(){
  const ficha=fichaComAprimorado();const fake=cardFake();
  const document={readyState:'loading',createElement(tag){return {tagName:tag, textContent:'',className:'',remove(){}};},
    querySelectorAll(selector){return selector==='#listaJutsus .jutsuCard'?[fake.card]:[];},
    querySelector(){return null;},getElementById(){return null;},addEventListener(){}};
  const window={renderizarJutsus(){},addEventListener(){},ShinobiPontosChave:Livro,
    ShinobiBeneficiosJutsus188:{aplicar:B.aplicar,decorarCard(){}}};
  const contexto={window,document,estado:ficha,console,Map,Set,CustomEvent:class{},requestAnimationFrame(){},setTimeout(){}};
  const fonte=fs.readFileSync(path.join(__dirname,'../js/10-regras-natureza.js'),'utf8');
  vm.runInNewContext(fonte,contexto,{filename:'js/10-regras-natureza.js'});
  return {window,document,ficha,...fake};
}
test('o motor encontra rótulos apesar do ícone ⚔ e atualiza dano real na carta expandida',()=>{
  const ambiente=prepararAmbiente();
  ambiente.window.renderizarJutsus();
  const dano=ambiente.buttons.find(x=>x.rotulo==='Dano');
  const total=ambiente.buttons.find(x=>x.rotulo==='Dano total');
  assert.equal(dano.value.textContent,'8d8');
  assert.equal(total.value.textContent,'8d8');
  assert.equal(dano.titulo.textContent,'⚔Dano','preserva o ícone e o título original');
  assert.equal(ambiente.ficha.jutsus[0].dano,'8d6','não modifica o dado de origem');
});
test('a carta mantém a classe original .jutsuCampoValor, exigida pelo CSS',()=>{
  const ambiente=prepararAmbiente();ambiente.window.renderizarJutsus();
  assert.equal(ambiente.buttons.find(x=>x.rotulo==='Dano').value.className,'jutsuCampoValor');
  assert.equal(ambiente.buttons.find(x=>x.rotulo==='Alcance').value.className,'jutsuCampoValor');
});
function elemento(classe){
  return {className:classe||'',textContent:'',title:'',remove(){this.removido=true;},setAttribute(){},appendChild(x){this.children=(this.children||[]).concat(x);},insertAdjacentElement(){}};
}
test('contador e melhoria aparecem em faixa própria, fora do <small> ocultado pelo TCG',()=>{
  const ficha=fichaComAprimorado();
  ficha.pontosChaveV1.eventos.push({id:'ii',tipo:'historico',habilidadeId:'ninjutsu_melhorado_2',custo:0,
    escolhas:{alvoTipo:'jutsu',alvoId:'bola',aplicacao:'nao-aplicado',efeito:'reduzir-custo'}});
  const linha=elemento('jutsuLinhaTexto'),small=elemento('small'),chip=elemento('chip');
  let faixa=null;
  linha.querySelector=s=>s==='.jutsuTcgBar'?elemento('jutsuTcgBar'):null;
  linha.insertBefore=(e)=>{faixa=e;};
  const mapa={'.jutsuLinhaTexto':linha,'.jutsuLinhaTexto small':small,'.jutsuTcgChipCusto strong':chip,'.jutsuResumo':elemento('jutsuResumo')};
  const card={ownerDocument:{createElement:()=>elemento()},querySelector:s=>s==='.jutsuIndicadoresAtivos195'?faixa:mapa[s]||null};
  const calculo=B.aplicar(ficha,ficha.jutsus[0],{danoEfetivo:'8d6',custoEfetivoTexto:'7'},Livro);
  B.decorarCard(card,ficha.jutsus[0],calculo);
  assert.match(faixa.textContent,/Ninjutsu Aprimorado ativo/);
  assert.match(faixa.textContent,/Ninjutsu Melhorado II ativo · 3\/3/);
  assert.equal(faixa.className,'jutsuIndicadoresAtivos195');
});
test('descanso fica fora do grid de três colunas do cabeçalho',()=>{
  const src=fs.readFileSync(path.join(__dirname,'../js/17-beneficios-jutsus-188.js'),'utf8');
  assert.match(src,/hero\.insertAdjacentElement\('afterend',botao\)/);
  assert.doesNotMatch(src,/hero\.appendChild\(botao\)/);
});
