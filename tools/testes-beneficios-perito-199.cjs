/* Shinobi 2.5.8.199 — regressões Perito e preservação dos registros. */
const test=require('node:test');
const assert=require('node:assert/strict');
const Livro=require('../js/17-pontos-chave-engine.js');
const Perito=require('../js/17-beneficios-perito-199.js');
const op=(tipo,id,nome)=>({tipo,id,nome});
const escolha=[op('pericia','p_acrobacia'),op('pericia','p_percepcao'),op('ferramenta',null,'Kit de Disfarce')];
const h=(id='per1',aplicacao='nao-aplicado',tipo='historico')=>({id,tipo,bolsa:tipo==='compra'?'chave':'historico',custo:tipo==='compra'?4:0,nivel:8,habilidadeId:'perito',escolhas:aplicacao?{aplicacao}:{}});
const ficha=(eventos=[h()],extra={})=>Object.assign({nivel:8,cla:'Sarutobi',nome:'Luffy',proficiencia:'3',p_acrobacia:true,p_percepcao:false,pontosChaveV1:{versao:1,eventos}},extra);

test('Perito registra três escolhas, sem alterar campos manuais nem pontos',()=>{
 const f=ficha();const p=Perito.preparar(f,Livro,'per1',escolha);
 assert.equal(p.novoRegistro.eventos.length,2);
 assert.deepEqual(p.nomes,['Acrobacia','Percepção','Kit de Disfarce']);
 assert.equal(f.p_acrobacia,true);assert.equal(f.p_percepcao,false);
 assert.equal(f.pontosChaveV1.eventos.length,1);
 assert.equal(Livro.resumo(f).chaveGasta,0);
 const f2=ficha(p.novoRegistro.eventos);
 assert.equal(Perito.temPericia(f2,Livro,'p_percepcao'),true);
 assert.equal(Perito.temPericia(f2,Livro,'p_acrobacia'),true);
 assert.equal(Perito.temPericia(f2,Livro,'p_atletismo'),false);
 assert.deepEqual(Perito.adquiridas(f2,Livro).ferramentas,['Kit de Disfarce']);
});
test('Compra nova sem estado aplicado habilita as escolhas',()=>{
 const f=ficha([h('novo','', 'compra')],{p_acrobacia:false});
 assert.ok(Perito.podeConfigurar(f,Livro,'novo'));
 assert.equal(Perito.preparar(f,Livro,'novo',escolha).nomes.length,3);
});
test('Perito manual ou incerto não duplica proficiências',()=>{
 for(const a of ['ja-aplicado','incerto']){
  const f=ficha([h('v',a)]);
  assert.equal(Perito.podeConfigurar(f,Livro,'v'),false);
  assert.throws(()=>Perito.preparar(f,Livro,'v',escolha),/aplicada manualmente|conferência/);
 }
});
test('Dois eventos para mesma aquisição são bloqueados antes do salvamento',()=>{
 const f=ficha();const p=Perito.preparar(f,Livro,'per1',escolha);
 assert.throws(()=>Perito.preparar(ficha(p.novoRegistro.eventos),Livro,'per1',escolha),/já recebeu/);
 assert.equal(Perito.idEvento('per1'),Perito.idEvento('per1'));
 assert.notEqual(Perito.idEvento('p.a'),Perito.idEvento('p_a'));
});
test('Compras repetidas de Perito não se confundem',()=>{
 const a=ficha([h('x'),h('y')]);const p1=Perito.preparar(a,Livro,'x',escolha);
 const b=ficha(p1.novoRegistro.eventos);const p2=Perito.preparar(b,Livro,'y',[op('pericia','p_historia'),op('pericia','p_atletismo'),op('ferramenta',null,'Kit de Alquimia')]);
 const c=ficha(p2.novoRegistro.eventos);const info=Perito.adquiridas(c,Livro);
 assert.equal(info.pericias.length,4);assert.equal(info.ferramentas.length,2);
 assert.equal(Perito.temPericia(c,Livro,'p_historia'),true);
});
test('Não permite deixar escolha vazia, duplicar perícia ou ferramenta',()=>{
 const f=ficha();
 assert.throws(()=>Perito.preparar(f,Livro,'per1',[]),/exatamente três/);
 assert.throws(()=>Perito.preparar(f,Livro,'per1',[op('pericia','p_percepcao'),op('pericia','p_percepcao'),op('pericia','p_historia')]),/mesma proficiência/);
 assert.throws(()=>Perito.preparar(f,Livro,'per1',[op('pericia','p_chave_invalida'),op('pericia','p_percepcao'),op('pericia','p_historia')]),/perícia válida/);
 assert.throws(()=>Perito.preparar(f,Livro,'per1',[op('ferramenta',null,'  '),op('pericia','p_percepcao'),op('pericia','p_historia')]),/nome da ferramenta/);
 assert.throws(()=>Perito.preparar(f,Livro,'per1',[op('ferramenta',null,'FERRAMENTA'),op('ferramenta',null,'ferramenta'),op('pericia','p_historia')]),/mesma proficiência/);
});
test('Aquisição estornada não produz perícias ativas',()=>{
 const a=ficha();const p=Perito.preparar(a,Livro,'per1',escolha);
 const estorno={id:'est-199-1',tipo:'estorno',alvoId:'per1'};
 const b=ficha(p.novoRegistro.eventos.concat([estorno]));
 assert.equal(Perito.temPericia(b,Livro,'p_percepcao'),false);
 assert.throws(()=>Perito.preparar(b,Livro,'per1',escolha),/não encontrada/);
});
test('Evento recebido da nuvem permite reconstruir perícias sem estado local de checkbox',()=>{
 const ev=Perito.preparar(ficha(),Livro,'per1',escolha).novoRegistro.eventos[1];
 const b=ficha([h(),ev],{p_acrobacia:false,p_percepcao:false});
 assert.equal(Perito.temPericia(b,Livro,'p_percepcao'),true);
 assert.equal(Perito.resumoCompra(b,'per1'),'Acrobacia, Percepção, Kit de Disfarce');
});
test('Ferramenta não vira proficiência numa perícia de nome semelhante',()=>{
 const f=ficha([h()]);const p=Perito.preparar(f,Livro,'per1',[op('ferramenta',null,'Percepção'),op('pericia','p_chakra'),op('pericia','p_natureza')]);
 const b=ficha(p.novoRegistro.eventos);
 assert.equal(Perito.temPericia(b,Livro,'p_percepcao'),false);
 assert.deepEqual(Perito.adquiridas(b,Livro).ferramentas,['Percepção']);
});
test('HTML compacta expõe três campos e botão de confirmação',()=>{
 const h=Perito.formulario('comp_abc');
 assert.equal((h.match(/data-p199-opcao/g)||[]).length,3);
 assert.match(h,/data-p199-salvar="comp_abc"/);
 assert.match(h,/Kit|Ferramenta/);
});
test('Dados de entrada não injetam HTML nos atributos da escolha',()=>{
 const html=Perito.formulario('injetar"><img src=x>');
 assert.doesNotMatch(html,/<img/);
 assert.match(html,/&lt;img/);
});

test('Cálculo real das perícias inclui Perito sem marcar checkbox manual e sem acumular duas proficiências',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
 const per=Perito.preparar(ficha(),Livro,'per1',escolha);
 const estado=ficha(per.novoRegistro.eventos,{p_acrobacia:true,p_percepcao:false,destreza:'16',sabedoria:'14'});
 const campos={p_acrobacia:{checked:true},p_percepcao:{checked:false},destreza:{value:'16'},sabedoria:{value:'14'},proficiencia:{value:'3'}};
 const window={ShinobiPerito199:Perito,ShinobiPontosChave:Livro,addEventListener(){}};
 const document={readyState:'loading',addEventListener(){},querySelector(seletor){let chave=seletor.match(/^\[data-save="([^"]+)"\]$/);return chave?campos[chave[1]]||null:null;}};
 const ctx={window,document,estado,Map,Boolean,Number,String,Math,Set,Array,requestAnimationFrame(){},cancelAnimationFrame(){},setTimeout(){}};
 const codigo=fs.readFileSync(path.join(__dirname,'../js/16-pericias.js'),'utf8');
 vm.runInNewContext(codigo,ctx);
 const a=window.calcularBonusPericia('p_acrobacia');
 const p=window.calcularBonusPericia('p_percepcao');
 const n=window.calcularBonusPericia('p_furtividade');
 assert.equal(a.total,6,'a perícia já proficiente não recebe a proficiência uma segunda vez');
 assert.equal(p.total,5,'perícia Perito recebe sabedoria + proficiência');
 assert.equal(p.perito,true);
 assert.equal(n.total,3,'uma perícia não escolhida recebe apenas o modificador');
 assert.equal(campos.p_percepcao.checked,false,'o campo original não é modificado');
});


test('A escolha preserva avisos e metadados de conflitos da sincronização',()=>{
 const f=ficha();f.pontosChaveV1.conflitosSync=['conflito-existente'];f.pontosChaveV1.origemControle='marco-confirmado';
 const p=Perito.preparar(f,Livro,'per1',escolha);
 assert.deepEqual(p.novoRegistro.conflitosSync,['conflito-existente']);
 assert.equal(p.novoRegistro.origemControle,'marco-confirmado');
});
