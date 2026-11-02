'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const BASE=path.resolve(__dirname,'..');
const mod=require(path.join(BASE,'js/17-preparacao-ataques.js'));
let n=0;
function teste(nome,fn){fn();n++;console.log('OK',String(n).padStart(2,'0'),nome);}

teste('catálogo possui 21 armas da tabela do PDF',()=>assert.equal(mod.catalogoArmas().length,21));
teste('wakizashi resolve pelo apelido (sem atribuir Acuidade)',()=>{
 const w=mod.obterArma('Wakizashi');assert.equal(w.id,'wakizaki');assert.equal(w.dano,'1d8');assert.deepEqual(w.propriedades,['versatil']);
});
teste('agulha permanece Especial, com dano fixo impresso na tabela',()=>{
 const a=mod.obterArma('Agulhas'); assert.equal(a.id,'agulha');assert.equal(a.dano,'1');assert.ok(a.propriedades.includes('especial'));assert.deepEqual(a.alcance,[15,30]);
});
teste('Kunai e Shuriken têm dados e alcances distintos',()=>{
 assert.equal(mod.obterArma('Kunai').dano,'1d6');assert.equal(mod.obterArma('Shuriken').dano,'1d4');
 assert.deepEqual(mod.obterArma('Kunai').alcance,[9,18]);assert.deepEqual(mod.obterArma('Shuriken').alcance,[18,36]);
});
teste('Corrente e Nunchaku são fórmulas textuais pendentes',()=>{
 assert.match(mod.obterArma('Corrente').dano,/Força x3/);assert.match(mod.obterArma('Nunchaku').dano,/Destreza x2/);
});
teste('nomes personalizados não são associados automaticamente a armas erradas',()=>assert.equal(mod.obterArma('Lâmina Ninja da Névoa'),null));
teste('ataque desarmado tem dado indefinido e aviso',()=>{
 const a=mod.identificarAtaque({tipo:'desarmado',nome:'Chute'});assert.equal(a.id,'desarmado'); assert.equal(a.dano,null);
});
teste('arma vinculada ao inventário tem prioridade na identificação',()=>{
 assert.equal(mod.identificarAtaque({nome:'Ataque elétrico',itemInventario:'Wakizaki'}).id,'wakizaki');
});
teste('exposição de catálogos devolve cópias, sem mutabilidade compartilhada',()=>{
 const c=mod.catalogoArmas();c[0].nome='Alterado'; assert.equal(mod.obterArma('Kunai').nome,'Kunai');
});
teste('catálogo de habilidades não concede bônus automaticamente',()=>{
 assert.equal(mod.buscarHabilidade('pontaria').custo,2);assert.equal(typeof mod.aplicarBonus,'undefined');
});
teste('rascunho de aquisição não realiza pagamento nem alteração em ficha',()=>{
 const escolhas={armas:['wakizaki','agulha']};const item=mod.criarRascunhoAquisicao('habilidade_com_armas',{nivel:8,escolhas});
 assert.equal(item.status,'aguardando-regras-do-mestre');assert.equal(item.custoReferencial,2); assert.equal(item.nivelAquisicao,8);
 escolhas.armas.push('katana');assert.equal(item.escolhas.armas.length,2);
});
teste('rascunho exige nível válido',()=>assert.throws(()=>mod.criarRascunhoAquisicao('pontaria',{nivel:0}),/nível/));
teste('não sobrescreve histórico existente de progressão',()=>{
 const ficha={nivel:'8',proficiencia:'3',progressaoFixa:{level:8,keyPointsTotal:22},armados:[]};
 const antes=JSON.stringify(ficha);const visto=mod.inspecionarFicha(ficha);
 assert.equal(JSON.stringify(ficha),antes);assert.equal(visto.progresso.pontosChaveNaProgressao,22);
 assert.equal(visto.progresso.interpretacaoPontosChave,'aguardando-regras-do-mestre');
});
teste('preserva campos manuais e IDs na inspeção',()=>{
 const ficha={armados:[{ataqueId:'abc',nome:'Wakizashi',tipo:'armado',bonusAcerto:'+7',dano:'1d8',bonusDano:'5'}]};
 const antes=JSON.stringify(ficha);const v=mod.inspecionarFicha(ficha).ataques[0];
 assert.equal(v.ataqueId,'abc');assert.deepEqual(v.manual,{bonusAcerto:'+7',dano:'1d8',bonusDano:'5'});
 assert.equal(JSON.stringify(ficha),antes);
});
teste('não adiciona automaticamente registros de pontos-chave em fichas antigas',()=>{
 const ficha={nivel:'8',armados:[]};mod.inspecionarFicha(ficha);assert.equal(ficha.automacaoAtaques,undefined);
});
teste('lê uma estrutura existente sem modificá-la',()=>{
 const ficha={automacaoAtaques:{versao:1,aquisicoes:[{id:'1'}],proficienciasExtras:['agulha'],ajustesMestre:[]}};
 const copia=mod.lerEstrutura(ficha);copia.aquisicoes[0].id='2';assert.equal(ficha.automacaoAtaques.aquisicoes[0].id,'1');
});
teste('integra módulo ao carregador principal e precache para uso offline',()=>{
 const loader=fs.readFileSync(path.join(BASE,'js/00-compat-loader.js'),'utf8');
 const sw=fs.readFileSync(path.join(BASE,'service-worker.js'),'utf8');
 assert.ok(loader.includes('"17-preparacao-ataques.js"'));assert.ok(sw.includes('js/17-preparacao-ataques.js'));assert.ok(sw.includes('js-legacy/17-preparacao-ataques.js'));
});
teste('módulo expõe a API no navegador sem tocar dados do personagem',()=>{
 const codigo=fs.readFileSync(path.join(BASE,'js/17-preparacao-ataques.js'),'utf8');
 const context=vm.createContext({window:{document:{}},console});
 vm.runInContext("let estado={nivel:'8',armados:[{nome:'Kunai',bonusAcerto:'+5',dano:'1d6'}]};",context);
 vm.runInContext(codigo,context);
 const api=context.window.ShinobiPreparacaoAtaques;
 assert.equal(api.inspecionarFichaAtual().ataques[0].armaCatalogada.id,'kunai');
 assert.equal(vm.runInContext('estado.armados[0].bonusAcerto',context),'+5');
 assert.equal(vm.runInContext('estado.automacaoAtaques',context),undefined);
});
teste('API do build legado gera o mesmo diagnóstico',()=>{
 const codigo=fs.readFileSync(path.join(BASE,'js-legacy/17-preparacao-ataques.js'),'utf8');
 const context=vm.createContext({window:{document:{}},console});
 vm.runInContext("let estado={nivel:'8',armados:[{nome:'Agulha',tipo:'armado'}]};",context);
 vm.runInContext(codigo,context);
 assert.equal(context.window.ShinobiPreparacaoAtaques.inspecionarFichaAtual().ataques[0].armaCatalogada.id,'agulha');
});
console.log(`\n${n} testes aprovados.`);
