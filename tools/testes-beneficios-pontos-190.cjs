/* Regressões da efetivação: evita cobranças/reaplicações em fichas antigas. */
const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../js/17-pontos-chave-engine.js');
const B=require('../js/17-beneficios-pontos-chave-190.js');
function compra(id,habilidadeId,aplicacao,alvoId='',alvoTipo=''){
 return {id,tipo:'historico',habilidadeId,nome:habilidadeId,origemSuplementoId:'src_'+id,custo:0,bolsa:'historico',escolhas:{aplicacao,alvoId,alvoTipo,alvoNome:alvoId}};
}
function ficha(eventos=[],mais={}){return Object.assign({nome:'Luffy',cla:'Sarutobi',nivel:8,forca:'14',destreza:'19',constituicao:'16',inteligencia:'12',sabedoria:'10',carisma:'10',pontosChaveV1:{versao:1,eventos}},mais);}
test('Já aplicado manualmente não aumenta atributo nem iniciativa',()=>{
 const f=ficha([compra('attr','melhoria_atributo','ja-aplicado','destreza','atributo'),compra('alerta','alerta','ja-aplicado')]);
 assert.equal(B.bonusAlerta(f,E),0);assert.throws(()=>B.prepararAtributo(f,E,'attr'),/já foi aplicada/);
 assert.equal(f.destreza,'19');
});
test('Ainda não aplicado: gera plano de +1 e evento único, sem alterar a ficha original',()=>{
 const f=ficha([compra('attr','melhoria_atributo','nao-aplicado','destreza','atributo')]);
 const novo=B.prepararAtributo(f,E,'attr');
 assert.equal(novo.campo,'destreza');assert.equal(novo.antes,19);assert.equal(novo.depois,20);
 assert.equal(novo.novoRegistro.eventos.length,2);assert.equal(f.pontosChaveV1.eventos.length,1);assert.equal(f.destreza,'19');
 const aplicada=ficha(novo.novoRegistro.eventos,{destreza:'20'});
 assert.equal(B.compras(aplicada,E)[0].aplicacao190,'efetivado');
 assert.throws(()=>B.prepararAtributo(aplicada,E,'attr'),/já foi aplicada/);
 assert.equal(E.resumo(aplicada).chaveGasta,0);
});
test('Três Melhoria de Atributo compradas: efetivação de uma não bloqueia outra',()=>{
 const f=ficha([compra('a','melhoria_atributo','nao-aplicado','destreza','atributo'),compra('b','melhoria_atributo','nao-aplicado','destreza','atributo'),compra('c','melhoria_atributo','incerto','forca','atributo')],{destreza:'18'});
 const primeiro=B.prepararAtributo(f,E,'a');
 const prox=ficha(primeiro.novoRegistro.eventos,{destreza:'19'});
 assert.equal(B.prepararAtributo(prox,E,'b').depois,20);
 assert.throws(()=>B.prepararAtributo(prox,E,'c'));
});
test('Atributo acima do teto normal bloqueia; clãs específicos respeitam 24',()=>{
 const e=compra('attr','melhoria_atributo','nao-aplicado','forca','atributo');
 assert.throws(()=>B.prepararAtributo(ficha([e],{cla:'Sarutobi',forca:'20'}),E,'attr'),/limite/);
 assert.equal(B.prepararAtributo(ficha([e],{cla:'Lee',forca:'23'}),E,'attr').depois,24);
 assert.throws(()=>B.prepararAtributo(ficha([e],{cla:'Lee',forca:'24'}),E,'attr'),/limite/);
});
test('Alerta não aplicado gera +5, sem alterar iniciativa original',()=>{
 const f=ficha([compra('alerta','alerta','nao-aplicado')],{iniciativa:'5'});
 assert.equal(B.bonusAlerta(f,E),5);assert.equal(f.iniciativa,'5');
});
test('Ninjutsu Melhorado I: apenas natureza conhecida e compra ainda não aplicada',()=>{
 const conj={modificador:4};
 const f=ficha([compra('ninj','ninjutsu_melhorado_1','nao-aplicado')]);
 assert.equal(B.bonusNinjutsuMelhoradoI(f,E,{natureza:{id:'katon'},nivel:3,conjuracao:conj}),4);
 assert.equal(B.bonusNinjutsuMelhoradoI(f,E,{natureza:null,nivel:0,conjuracao:conj}),0);
 assert.equal(B.bonusNinjutsuMelhoradoI(ficha([compra('ninj','ninjutsu_melhorado_1','ja-aplicado')]),E,{natureza:{id:'katon'},nivel:3,conjuracao:conj}),0);
});
test('Compras estornadas ou eventos de efetivação estornados não seguem ativos',()=>{
 const e=compra('attr','melhoria_atributo','nao-aplicado','destreza','atributo');
 const f=ficha([e,{id:'storno',tipo:'estorno',alvoId:'attr'}]);
 assert.equal(B.compras(f,E).length,0);
});
test('Não é possível efetivar compra não atribuída a campo da ficha',()=>{
 const f=ficha([compra('attr','melhoria_atributo','nao-aplicado','jutsu-123','jutsu')]);
 assert.throws(()=>B.prepararAtributo(f,E,'attr'),/Escolha primeiro o atributo/);
});
test('Registro duplicado de efetivação também é barrado',()=>{
 const f=ficha([compra('attr','melhoria_atributo','nao-aplicado','destreza','atributo'),{id:'ef190_attr',tipo:'efetivacao-beneficio',alvoId:'attr'}]);
 assert.throws(()=>B.prepararAtributo(f,E,'attr'));
});
test('Habilidade não catalogada não interfere em outros efeitos',()=>{
 const f=ficha([compra('x','caracteristica_desconhecida','incerto')]);
 assert.equal(B.bonusAlerta(f,E),0);
 assert.equal(B.bonusNinjutsuMelhoradoI(f,E,{natureza:{id:'katon'},nivel:3,conjuracao:{modificador:5}}),0);
});
