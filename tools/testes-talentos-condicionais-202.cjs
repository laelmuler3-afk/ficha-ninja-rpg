'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const T=require('../js/17-talentos-condicionais-202.js');
const Livro=require('../js/17-pontos-chave-engine.js');
const P=require('../js/17-preparacao-ataques.js');
const f=(habilidades=[],nivel=8)=>({nivel,pontosChaveV1:{versao:1,eventos:habilidades.map((id,i)=>({id:'h'+i,tipo:'compra',habilidadeId:id,nivel,custo:2,bolsa:'chave',escolhas:{}}))}});
const hist=(id,aplicacao)=>({id:'his1',tipo:'historico',habilidadeId:id,escolhas:{aplicacao},custo:0});
test('Habilidades só aparecem quando adquiridas e confirmadas',()=>{
  assert.equal(T.adquirido(f(),'','armas_grandes'),false);
  assert.equal(T.adquirido(f(),Livro,'sentinela'),false);
  assert.equal(T.adquirido(f(['sentinela']),Livro,'sentinela'),true);
  assert.equal(T.adquirido(f(),Livro,'sentinela'),false);
  assert.equal(T.adquirido({nivel:8,pontosChaveV1:{eventos:[hist('sentinela','incerto')]}},Livro,'sentinela'),false);
  assert.equal(T.adquirido({nivel:8,pontosChaveV1:{eventos:[hist('sentinela','ja-aplicado')]}},Livro,'sentinela'),true);
});
test('Armas Grandes exige arma Duas Mãos ou Versátil com dados',()=>{
  const armas=T.armasElegiveis(P);
  assert.ok(armas.some(a=>a.id==='katana'));
  assert.ok(armas.some(a=>a.id==='wakizaki'));
  assert.ok(!armas.some(a=>a.id==='kunai'));
  assert.ok(!armas.some(a=>a.id==='corrente'));
  assert.ok(!armas.some(a=>a.id==='nunchaku'));
});
test('Armas Grandes permite re-rolar 1 ou 2 uma única vez, sem alterar ficha',()=>{
  const ficha=f(['armas_grandes']),antes=JSON.stringify(ficha);
  const r=T.calcularArmasGrandes(ficha,Livro,P,'katana','duas','1','9');
  assert.equal(r.variacao,8);assert.equal(r.formula,'1d12');assert.equal(r.novo,9);
  assert.equal(JSON.stringify(ficha),antes);
});
test('Wakizaki respeita uma e duas mãos no limite de dados',()=>{
  const ficha=f(['armas_grandes']);
  assert.equal(T.calcularArmasGrandes(ficha,Livro,P,'wakizaki','uma','2','8').faces,8);
  assert.equal(T.calcularArmasGrandes(ficha,Livro,P,'wakizaki','duas','2','10').faces,10);
  assert.throws(()=>T.calcularArmasGrandes(ficha,Livro,P,'wakizaki','uma','2','10'),/entre 1 e 8/);
});
test('Armas Grandes invalida dado anterior 3, novo 0 e nova rolagem além do dado',()=>{
  const ficha=f(['armas_grandes']);
  for(const [a,b] of [['3','5'],['1','0'],['1','13'],['1','1.5'],['','2']])
    assert.throws(()=>T.calcularArmasGrandes(ficha,Livro,P,'katana','duas',a,b));
  assert.equal(T.calcularArmasGrandes(ficha,Livro,P,'katana','duas',1,1).variacao,0);
});
test('Armas Grandes não funciona em Kunai nem com talento incerto',()=>{
  assert.throws(()=>T.calcularArmasGrandes(f(['armas_grandes']),Livro,P,'kunai','uma','1','3'),/elegível/);
  assert.throws(()=>T.calcularArmasGrandes(f(),Livro,P,'katana','duas','1','3'),/não foi confirmado/);
});
test('Sentinela zera deslocamento só depois de acertar oportunidade',()=>{
  const ficha=f(['sentinela']);
  assert.deepEqual(T.avaliarSentinela(ficha,Livro,'oportunidade-acertou',{acertou:true}).deslocamento,0);
  assert.equal(T.avaliarSentinela(ficha,Livro,'oportunidade-acertou',{acertou:false}).ativo,false);
});
test('Sentinela ignora Desengajar mas não dispensa reação',()=>{
  const ficha=f(['sentinela']);
  assert.equal(T.avaliarSentinela(ficha,Livro,'desengajar',{reacaoDisponivel:true}).ativo,true);
  assert.equal(T.avaliarSentinela(ficha,Livro,'desengajar',{reacaoDisponivel:false}).ativo,false);
});
test('Sentinela: ataque em aliado precisa cumprir todas as condições',()=>{
  const ficha=f(['sentinela']);const ok={aUmMetroEMeio:true,outroAlvo:true,alvoSemSentinela:true,reacaoDisponivel:true};
  assert.equal(T.avaliarSentinela(ficha,Livro,'ataque-proximo',ok).ativo,true);
  for(const campo of Object.keys(ok))assert.equal(T.avaliarSentinela(ficha,Livro,'ataque-proximo',{...ok,[campo]:false}).ativo,false,campo);
  assert.throws(()=>T.avaliarSentinela(f(),Livro,'ataque-proximo',ok),/não foi confirmado/);
});
test('Especialista em Briga exige ataque desarmado no próprio turno e ação bônus',()=>{
  const ficha=f(['especialista_briga']);const ok={noProprioTurno:true,acertouDesarmado:true,acaoBonusDisponivel:true};
  assert.equal(T.avaliarBriga(ficha,Livro,ok).ativo,true);
  for(const campo of Object.keys(ok))assert.equal(T.avaliarBriga(ficha,Livro,{...ok,[campo]:false}).ativo,false,campo);
  assert.throws(()=>T.avaliarBriga(f(),Livro,ok),/não foi confirmado/);
});
test('Nenhum cálculo consome reação, altera PV, cria compra ou modifica a ficha',()=>{
  const ficha=f(['armas_grandes','sentinela','especialista_briga']);const antes=JSON.stringify(ficha);
  T.calcularArmasGrandes(ficha,Livro,P,'bastao','duas','1','6');
  T.avaliarSentinela(ficha,Livro,'oportunidade-acertou',{acertou:true});
  T.avaliarBriga(ficha,Livro,{noProprioTurno:true,acertouDesarmado:true,acaoBonusDisponivel:true});
  assert.equal(JSON.stringify(ficha),antes);
});
test('Integração do carregamento inclui CSS, JS moderno, JS legado e service worker',()=>{
  const fs=require('node:fs'),path=require('node:path'),read=s=>fs.readFileSync(path.join(__dirname,'..',s),'utf8');
  assert.match(read('index.html'),/talentos-condicionais-202\.css/);
  assert.match(read('js/00-compat-loader.js'),/17-talentos-condicionais-202\.js/);
  assert.match(read('service-worker.js'),/css\/talentos-condicionais-202\.css/);
  assert.match(read('service-worker.js'),/js-legacy\/17-talentos-condicionais-202\.js/);
  assert.match(read('version.json'),/2\.5\.8\.202/);
});
