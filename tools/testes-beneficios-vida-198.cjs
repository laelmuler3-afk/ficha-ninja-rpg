/* Regressao da melhoria de Vida 198: clã, integridade, idempotência. */
const test=require('node:test');
const assert=require('node:assert/strict');
const Livro=require('../js/17-pontos-chave-engine.js');
const Vida=require('../js/17-beneficios-vida-198.js');
const regras=require('../data/progressao-ninja.json');
const clan=id=>regras.clans.find(c=>c.id===id);
const historico=(id,aplicacao='nao-aplicado')=>({id,tipo:'historico',bolsa:'historico',custo:0,habilidadeId:'melhoria_vida',escolhas:{aplicacao}});
const ficha=(eventos=[],extras={})=>Object.assign({nivel:8,cla:'Sarutobi',nome:'Luffy',pv:'38',pvMax:'55',pontosChaveV1:{versao:1,eventos}},extras);

test('Melhoria de Vida: d10 do Sarutobi, aumenta apenas maximo',()=>{
 const f=ficha([historico('vida1')]);
 const p=Vida.preparar(f,Livro,'vida1',7,clan('sarutobi'));
 assert.equal(p.dado,10);assert.equal(p.antes,55);assert.equal(p.depois,62);
 assert.equal(p.pvAtual,38);assert.equal(f.pvMax,'55');assert.equal(f.pv,'38');
 assert.equal(p.novoRegistro.eventos[1].rolagem,7);
 assert.equal(p.novoRegistro.eventos[1].tipo,'efetivacao-beneficio');
 assert.equal(p.novoRegistro.eventos[1].campo,'pvMax');
 assert.equal(Livro.resumo(f).chaveGasta,0);
});
test('Todos os clãs recebem seu dado de Vida, não apenas Sarutobi',()=>{
 for(const c of regras.clans){
  const f=ficha([historico('v_'+c.id)],{cla:c.id});
  const p=Vida.preparar(f,Livro,'v_'+c.id,c.life.die,c);
  assert.equal(p.depois,55+c.life.die,c.id);
 }
});
test('Valores fora do dado são rejeitados sem gravar',()=>{
 const f=ficha([historico('vida1')]);
 for(const n of [0,11,-1,1.5,'',NaN])assert.throws(()=>Vida.preparar(f,Livro,'vida1',n,clan('sarutobi')));
 assert.equal(f.pontosChaveV1.eventos.length,1);
});
test('Compra marcada como ja aplicada manualmente não é reaplicada',()=>{
 assert.throws(()=>Vida.preparar(ficha([historico('v','ja-aplicado')]),Livro,'v',7,clan('sarutobi')),/já foi aplicada/);
 assert.throws(()=>Vida.preparar(ficha([historico('v','incerto')]),Livro,'v',7,clan('sarutobi')),/conferência/);
});
test('Compra nova não pede reconstrução de gastos antigos',()=>{
 const f=ficha([{id:'nova',tipo:'compra',bolsa:'chave',custo:2,nivel:8,habilidadeId:'melhoria_vida',escolhas:{}}]);
 assert.equal(Vida.preparar(f,Livro,'nova',2,clan('lee')).depois,57);
});
test('Após efetivada, mesma aquisição nunca pode aplicar novamente',()=>{
 const f=ficha([historico('vida1')]);
 const a=Vida.preparar(f,Livro,'vida1',4,clan('sarutobi'));
 const proxima=ficha(a.novoRegistro.eventos,{pvMax:'59'});
 assert.throws(()=>Vida.preparar(proxima,Livro,'vida1',5,clan('sarutobi')),/já foi efetivada/);
});
test('Estorno de evento de efetivação não reaplica PV já aumentado',()=>{
 const f=ficha([historico('vida1')]);
 const a=Vida.preparar(f,Livro,'vida1',2,clan('sarutobi'));
 const evs=a.novoRegistro.eventos.concat([{id:'est',tipo:'estorno',alvoId:a.id}]);
 assert.throws(()=>Vida.preparar(ficha(evs,{pvMax:'57'}),Livro,'vida1',2,clan('sarutobi')),/já foi efetivada/);
});
test('Aquisições distintas podem elevar PV máximo separadamente',()=>{
 const f=ficha([historico('a'),historico('b')]);
 const a=Vida.preparar(f,Livro,'a',4,clan('sarutobi'));
 const f2=ficha(a.novoRegistro.eventos,{pvMax:'59'});
 const b=Vida.preparar(f2,Livro,'b',7,clan('sarutobi'));
 assert.equal(b.depois,66);assert.notEqual(a.id,b.id);
});
test('Regra de clã ausente e PV inválidos bloqueiam aplicação',()=>{
 const f=ficha([historico('v')]);
 assert.throws(()=>Vida.preparar(f,Livro,'v',2,null),/dado de Vida/);
 assert.throws(()=>Vida.preparar(ficha([historico('v')],{pv:'70'}),Livro,'v',2,clan('sarutobi')),/PV atual ou máximo/);
});
test('Aquisição cancelada não pode ser usada',()=>{
 const f=ficha([historico('v'),{id:'est',tipo:'estorno',alvoId:'v'}]);
 assert.throws(()=>Vida.preparar(f,Livro,'v',2,clan('sarutobi')),/aquisição válida/);
});
test('ID de evento é estável e distinto para IDs parecidos',()=>{
 assert.equal(Vida.idEvento('a'),Vida.idEvento('a'));
 assert.notEqual(Vida.idEvento('a.b'),Vida.idEvento('a_b'));
});
