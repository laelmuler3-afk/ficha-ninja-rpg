/* Projetinho Shinobi 2.5.8.197 — descansos unificados.
 * Fonte: Suplemento Shinobi (EKO: 1/4 no descanso curto, uma vez ao dia;
 * integral no longo) e descansos D&D 5e (Dados de Vida).
 * As rolagens físicas são informadas pelo jogador; este módulo não rola dados.
 * Eventos ficam no histórico append-only já mesclado pela sincronização.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiDescansos197=api;
  if(root&&root.document)api.instalar(root);
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  function numero(v,def){var n=Number(v);return Number.isFinite(n)?n:(def===undefined?0:def);}
  function inteiro(v,def){var n=numero(v,def);return Number.isInteger(n)?n:(def===undefined?0:def);}
  function nivelDaFicha(f){return Math.min(20,Math.max(1,inteiro(f&&f.nivel,1)));}
  function id(prefixo){var unico='';try{if(typeof crypto!=='undefined'&&crypto.randomUUID)unico=crypto.randomUUID().replace(/-/g,'');}catch(_e){}
    return prefixo+'_'+(unico||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12));}
  function ledger(f,livro){if(livro&&typeof livro.registro==='function')return livro.registro(f);
    var antigo=f&&f.pontosChaveV1;return {versao:1,eventos:Array.isArray(antigo&&antigo.eventos)?antigo.eventos.slice():[]};}
  function eventosOrdenados(f,livro){return ledger(f,livro).eventos.filter(function(e){return e&&e.id&&e.tipo;}).sort(function(a,b){
    return String(a.criadoEm||'').localeCompare(String(b.criadoEm||''))||String(a.id).localeCompare(String(b.id));});}
  /* Não presumir que o jogador se lembra de dados gastos antes desta versão.
   * A contagem inicia com o nível atual e é reduzida apenas por registros novos. */
  function recursos(f,livro){
    var nivel=nivelDaFicha(f),gastos=0,chakraUsado=false;
    eventosOrdenados(f,livro).forEach(function(e){
      if(e.tipo==='descanso-curto-197'){
        gastos+=Math.max(0,inteiro(e.dadosGastos,0));
        if(e.recuperouChakra===true)chakraUsado=true;
      }else if(e.tipo==='descanso-longo-197'){
        gastos=Math.max(0,gastos-Math.max(1,Math.floor(Math.max(1,inteiro(e.nivel,nivel))/2)));
        chakraUsado=false;
      }
    });
    return {nivel:nivel,dadosMaximos:nivel,dadosGastos:gastos,dadosDisponiveis:Math.max(0,nivel-gastos),
      chakraCurtoUsado:chakraUsado,chakraCurtoDisponivel:!chakraUsado};
  }
  function modificadorCon(f){var con=numero(f&&f.constituicao,0);return con>0?Math.floor((con-10)/2):0;}
  function analisarRolagens(texto){
    var str=String(texto==null?'':texto).trim();if(!str)return [];
    /* Valores individuais permitem mínimo zero por dado com CON negativo. */
    if(!/^\d+(?:[\s,;]+\d+)*$/.test(str))throw new Error('Informe somente os resultados separados por vírgulas. Ex.: 4, 7, 2.');
    var rolagens=str.split(/[\s,;]+/).map(Number);
    if(rolagens.some(function(v){return !Number.isInteger(v)||v<1||v>20;}))throw new Error('Cada resultado deve ser um inteiro entre 1 e 20.');
    return rolagens;
  }
  function projetarCurto(f,livro,rolagens,recuperarChakra){
    var dados=Array.isArray(rolagens)?rolagens:analisarRolagens(rolagens),r=recursos(f,livro);
    if(dados.length>r.dadosDisponiveis)throw new Error('Você possui apenas '+r.dadosDisponiveis+' Dados de Vida disponíveis.');
    if(dados.some(function(v){return !Number.isInteger(v)||v<1||v>20;}))throw new Error('Resultado de dado inválido.');
    var mod=modificadorCon(f),pvAtual=Math.max(0,numero(f&&f.pv,0)),pvMax=Math.max(0,numero(f&&f.pvMax,0));
    var ganhos=dados.map(function(v){return Math.max(0,v+mod);});
    var curaBruta=ganhos.reduce(function(a,b){return a+b;},0),cura=Math.max(0,Math.min(pvMax-pvAtual,curaBruta));
    var ekoAtual=Math.max(0,numero(f&&f.chakra,0)),ekoMax=Math.max(0,numero(f&&f.chakraMax,0));
    if(recuperarChakra&&r.chakraCurtoUsado)throw new Error('A recuperação de ¼ de EKO já foi usada neste ciclo de descanso longo.');
    var quarto=Math.floor(ekoMax/4),eko=recuperarChakra?Math.min(Math.max(0,ekoMax-ekoAtual),quarto):0;
    if(recuperarChakra&&eko<=0)throw new Error('Não há EKO para recuperar neste descanso curto.');
    if(!dados.length&&!recuperarChakra)throw new Error('Informe pelo menos um Dado de Vida ou selecione a recuperação de EKO.');
    return {dados:dados,dadosGastos:dados.length,modificadorCon:mod,curaBruta:curaBruta,pvRecuperados:cura,
      pvNovo:pvAtual+cura,ekoRecuperado:eko,ekoNovo:ekoAtual+eko,recuperouChakra:Boolean(recuperarChakra),
      quartoEko:quarto,restantes:r.dadosDisponiveis-dados.length};
  }
  function registrarCurto(f,livro,projecao){
    var reg=ledger(f,livro);
    reg.eventos.push({id:id('descansocurto'),tipo:'descanso-curto-197',criadoEm:new Date().toISOString(),
      dadosGastos:projecao.dadosGastos,rolagens:projecao.dados.slice(),modificadorCon:projecao.modificadorCon,
      pvRecuperados:projecao.pvRecuperados,ekoRecuperado:projecao.ekoRecuperado,
      recuperouChakra:projecao.recuperouChakra});
    return reg;
  }
  function registrarLongo(f,livro,motorJutsus){
    var reg=motorJutsus&&typeof motorJutsus.registrarDescansoLongo==='function'
      ?motorJutsus.registrarDescansoLongo(f,livro):ledger(f,livro);
    /* Registrar o ciclo para os Dados de Vida e o único 1/4 EKO diário.
     * A chamada acima também reinicia Ninjutsu Melhorado II. */
    reg.eventos.push({id:id('descansolongo'),tipo:'descanso-longo-197',criadoEm:new Date().toISOString(),
      nivel:nivelDaFicha(f),descricao:'Recupera PV, EKO e até metade dos Dados de Vida gastos.'});
    return reg;
  }
  function instalar(root){
    if(root.__shinobiDescansos197Instalado)return;
    root.__shinobiDescansos197Instalado=true;
    var ocupado=false;
    function ficha(){try{return root.estado&&typeof root.estado==='object'?root.estado:null;}catch(_e){return null;}}
    function campo(nome){return root.document.querySelector('[data-save="'+nome+'"]');}
    function mensagem(t){if(typeof root.alert==='function')root.alert(t);}
    function fecharMenu(){root.document.querySelectorAll('details.batalhaMenuOpcoes[open]').forEach(function(d){d.removeAttribute('open');});}
    function painel(){return root.document.getElementById('descansoCurto197Painel');}
    function render(){
      var f=ficha(),p=painel(),livro=root.ShinobiPontosChave;
      if(!p||!f)return;
      var r=recursos(f,livro),ind=p.querySelector('#descanso197Disponibilidade');
      if(ind)ind.textContent=r.dadosDisponiveis+'/'+r.dadosMaximos+' Dados de Vida disponíveis · EKO no descanso curto: '+(r.chakraCurtoUsado?'já recuperado':'disponível');
      var ck=p.querySelector('#descanso197Chakra');
      var podeEko=r.chakraCurtoDisponivel&&Math.floor(numero(f.chakraMax,0)/4)>0&&numero(f.chakra,0)<numero(f.chakraMax,0);
      if(ck){ck.disabled=!podeEko;if(!podeEko)ck.checked=false;}
      var exemplo=p.querySelector('#descanso197Regra');
      if(exemplo)exemplo.textContent='Informe cada dado rolado, separado por vírgula. CON '+(modificadorCon(f)>=0?'+':'')+modificadorCon(f)+' por dado. EKO: até '+Math.floor(Math.max(0,numero(f.chakraMax,0))/4)+' (¼ do máximo, uma vez por ciclo).';
    }
    root.abrirDescansoCurto197=function(){
      var p=painel();if(!p)return;
      p.hidden=!p.hidden;fecharMenu();if(!p.hidden){render();try{p.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(_){}}
    };
    root.fecharDescansoCurto197=function(){var p=painel();if(p)p.hidden=true;};
    root.confirmarDescansoCurto197=async function(){
      if(ocupado)return false;
      var f=ficha(),livro=root.ShinobiPontosChave,p=painel();if(!f||!p||typeof root.salvar!=='function')return false;
      var proj;
      try{proj=projetarCurto(f,livro,p.querySelector('#descanso197Dados').value,
        Boolean(p.querySelector('#descanso197Chakra').checked));}catch(e){mensagem(e.message);return false;}
      var confirma='Descanso curto\nDados gastos: '+proj.dadosGastos+'\nPV: +'+proj.pvRecuperados+'\nEKO: +'+proj.ekoRecuperado+'\nConfirmar recuperação?';
      ocupado=true;
      try{
        var aceito=typeof root.confirmarUsoAcao==='function'
          ?await root.confirmarUsoAcao('descanso','Descanso curto',confirma)
          :root.confirm(confirma);
        if(!aceito||f!==ficha())return false;
        /* Revalidar imediatamente para não reutilizar cargas após uma sincronização. */
        try{proj=projetarCurto(f,livro,p.querySelector('#descanso197Dados').value,
          Boolean(p.querySelector('#descanso197Chakra').checked));}catch(e){mensagem(e.message);return false;}
        var anterior={pv:f.pv,chakra:f.chakra,pontosChaveV1:f.pontosChaveV1};
        var pv=campo('pv'),eko=campo('chakra');
        f.pontosChaveV1=registrarCurto(f,livro,proj);
        if(pv)pv.value=String(proj.pvNovo);
        if(eko)eko.value=String(proj.ekoNovo);
        var salvo=root.salvar({confirmada:true,origem:'descanso-curto',campos:['pv','chakra','pontosChaveV1'],motivo:'descanso-curto'});
        if(!salvo){f.pv=anterior.pv;f.chakra=anterior.chakra;f.pontosChaveV1=anterior.pontosChaveV1;
          if(pv)pv.value=String(anterior.pv||0);if(eko)eko.value=String(anterior.chakra||0);
          mensagem('Não foi possível salvar o descanso. Nenhum dado foi consumido.');return false;}
        p.hidden=true;p.querySelector('#descanso197Dados').value='';
        if(p.querySelector('#descanso197Chakra'))p.querySelector('#descanso197Chakra').checked=false;
        if(typeof root.renderizarJutsus==='function')root.renderizarJutsus();
        root.dispatchEvent(new CustomEvent('shinobi:descanso-curto-confirmado',{detail:{dados:proj.dadosGastos,pv:proj.pvRecuperados,eko:proj.ekoRecuperado}}));
        if(typeof root.atualizarPainelBatalhaVivo==='function')root.atualizarPainelBatalhaVivo();
        return true;
      }finally{ocupado=false;render();}
    };
    function inicializar(){
      var antigo=root.document.getElementById('ninjutsuII194Descanso');if(antigo)antigo.remove();
      render();
    }
    if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',inicializar);
    else inicializar();
    root.addEventListener('shinobi:realtime-aplicado',render);
    root.addEventListener('shinobi:pontos-chave-atualizados',render);
    root.addEventListener('pageshow',inicializar);
  }
  return Object.freeze({recursos:recursos,analisarRolagens:analisarRolagens,projetarCurto:projetarCurto,
    registrarCurto:registrarCurto,registrarLongo:registrarLongo,modificadorCon:modificadorCon,instalar:instalar});
});
