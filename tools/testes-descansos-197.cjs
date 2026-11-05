'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../js/17-descansos-197.js');
const J=require('../js/17-beneficios-jutsus-188.js');
const P=require('../js/17-pontos-chave-engine.js');
const f=(extras={})=>({nivel:8,cla:'Sarutobi',nome:'Luffy',constituicao:14,pv:20,pvMax:55,chakra:18,chakraMax:40,pontosChaveV1:{versao:1,eventos:[]},...extras});
test('reconhece resultados separados por vírgula, espaço e ponto e vírgula',()=>{
 assert.deepEqual(R.analisarRolagens('4, 7; 2  6'),[4,7,2,6]);
 assert.deepEqual(R.analisarRolagens(''),[]);
});
test('não aceita notação de dano ou resultados arbitrários; não rola automaticamente',()=>{
 for(const invalido of ['1d8','3.2','-1','0','21','5, abc'])assert.throws(()=>R.analisarRolagens(invalido));
});
test('cura com CON por dado, sem exceder PV máximo',()=>{
 const x=R.projetarCurto(f(),P,[4,7],true);
 assert.equal(x.dadosGastos,2);assert.equal(x.modificadorCon,2);assert.equal(x.pvRecuperados,15);
 assert.equal(x.ekoRecuperado,10);assert.equal(x.pvNovo,35);assert.equal(x.ekoNovo,28);
});
test('Constituição negativa usa mínimo zero por Dado de Vida',()=>{
 const x=R.projetarCurto(f({constituicao:6,pv:0}),P,[1,2,8],false);
 assert.equal(x.pvRecuperados,6); // 1-2=0, 2-2=0, 8-2=6
});
test('PV e EKO sempre param nos máximos registrados',()=>{
 const x=R.projetarCurto(f({pv:54,chakra:39}),P,[8],true);
 assert.equal(x.pvNovo,55);assert.equal(x.ekoNovo,40);
});
test('não concede EKO em descanso curto repetido',()=>{
 const folha=f();const p=R.projetarCurto(folha,P,[3],true);
 folha.pontosChaveV1=R.registrarCurto(folha,P,p);
 assert.equal(R.recursos(folha,P).chakraCurtoUsado,true);
 assert.throws(()=>R.projetarCurto(folha,P,[],true),/já foi usada/);
 assert.equal(R.projetarCurto(folha,P,[4],false).dadosGastos,1);
});
test('aceita recuperação somente de EKO sem obrigar Dados de Vida',()=>{
 const x=R.projetarCurto(f(),P,[],true);
 assert.equal(x.dadosGastos,0);assert.equal(x.ekoRecuperado,10);
 assert.throws(()=>R.projetarCurto(f(),P,[],false));
});
test('limita dados disponíveis ao nível, inclusive em múltiplos descansos',()=>{
 const folha=f({nivel:2});const p=R.projetarCurto(folha,P,[2,3],false);
 folha.pontosChaveV1=R.registrarCurto(folha,P,p);
 assert.equal(R.recursos(folha,P).dadosDisponiveis,0);
 assert.throws(()=>R.projetarCurto(folha,P,[1],false),/apenas 0/);
});
test('descanso longo recupera metade dos dados gastos e reinicia 1/4 EKO',()=>{
 const folha=f();folha.pontosChaveV1=R.registrarCurto(folha,P,R.projetarCurto(folha,P,[1,2,3,4,5,6],true));
 assert.equal(R.recursos(folha,P).dadosDisponiveis,2);
 folha.pontosChaveV1=R.registrarLongo(folha,P,J);
 assert.equal(R.recursos(folha,P).dadosDisponiveis,6); // 6 gastos - 4 recuperados = 2 gastos
 assert.equal(R.recursos(folha,P).chakraCurtoUsado,false);
 assert.equal(folha.pontosChaveV1.eventos.filter(x=>x.tipo==='descanso-longo-melhorado-ii').length,1);
});
test('descanso longo não repõe mais que o gasto, nem duplica gastos',()=>{
 const folha=f();folha.pontosChaveV1=R.registrarCurto(folha,P,R.projetarCurto(folha,P,[3,4],false));
 folha.pontosChaveV1=R.registrarLongo(folha,P,J);
 assert.equal(R.recursos(folha,P).dadosDisponiveis,8);
 folha.pontosChaveV1=R.registrarLongo(folha,P,J);
 assert.equal(R.recursos(folha,P).dadosDisponiveis,8);
});
test('limite de Dados de Vida acompanha o nível seguinte sem alterar o histórico',()=>{
 const folha=f({nivel:8});folha.pontosChaveV1=R.registrarCurto(folha,P,R.projetarCurto(folha,P,[1,2],false));
 folha.nivel=9;assert.equal(R.recursos(folha,P).dadosDisponiveis,7);
});
test('descansos não afetam saldo de Pontos-Chave, nem as aquisições',()=>{
 const folha=f();const antes=P.resumo(folha);
 folha.pontosChaveV1=R.registrarCurto(folha,P,R.projetarCurto(folha,P,[2],true));
 folha.pontosChaveV1=R.registrarLongo(folha,P,J);
 const depois=P.resumo(folha);
 assert.equal(antes.chaveDisponivel,depois.chaveDisponivel);
 assert.equal(antes.claDisponivel,depois.claDisponivel);
 assert.equal(antes.compras.length,depois.compras.length);
});
test('descanso longo renova cargas de Ninjutsu Melhorado II',()=>{
 const folha=f();
 folha.jutsus=[];
 folha.pontosChaveV1.eventos.push({id:'compra1',tipo:'historico',habilidadeId:'ninjutsu_melhorado_2',nivel:8,escolhas:{alvoTipo:'jutsu',alvoId:'katon1',efeito:'reduzir-custo',aplicacao:'nao-aplicado'}});
 const jutsu={jutsuId:'katon1',custo:'10'};
 const origem=J.estadoMelhoradoII(folha,jutsu,P);
 assert.equal(origem.restantes,3);
 const preparado=J.prepararUsoMelhoradoII(folha,jutsu,P);
 folha.pontosChaveV1=J.registrarUsoMelhoradoII(folha,jutsu,P,preparado,6);
 assert.equal(J.estadoMelhoradoII(folha,jutsu,P).restantes,2);
 folha.pontosChaveV1=R.registrarLongo(folha,P,J);
 assert.equal(J.estadoMelhoradoII(folha,jutsu,P).restantes,3);
});
test('histórico append-only mantém IDs únicos e é mesclável entre dispositivos',()=>{
 const f1=f();f1.pontosChaveV1=R.registrarCurto(f1,P,R.projetarCurto(f1,P,[2],false));
 const f2=f();f2.pontosChaveV1=R.registrarCurto(f2,P,R.projetarCurto(f2,P,[4],false));
 const ids=f1.pontosChaveV1.eventos.concat(f2.pontosChaveV1.eventos).map(e=>e.id);
 assert.equal(new Set(ids).size,ids.length);
});
test('interface apontando para o menu de Combate, sem descanso solto em Jutsus',()=>{
 const fs=require('node:fs');const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 assert.match(html,/onclick="abrirDescansoCurto197\(\)"/);
 assert.match(html,/Descanso longo/);
 assert.match(html,/id="descanso197Dados"/);
 const js=fs.readFileSync(require('node:path').join(__dirname,'../js/17-beneficios-jutsus-188.js'),'utf8');
 assert.doesNotMatch(js,/Restaurar usos de Ninjutsu II \(descanso longo\)/);
});
