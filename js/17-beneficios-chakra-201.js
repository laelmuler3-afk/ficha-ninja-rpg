/* Shinobi 2.5.8.201 — Melhoria de Chakra: dado de Chakra do clã MAXIMIZADO.
 * Corrige a palavra "Vida" no suplemento conforme confirmação do mestre.
 * Cada aquisição aumenta somente chakraMax; chakra atual não é recuperado.
 * Escrita atômica local de campo+evento; mesmo ID não aplica duas vezes.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiChakra201=api;
  if(root&&root.document)api.instalar(root);
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this),function(){
  'use strict';
  function texto(x){return String(x==null?'':x);}
  function numero(x){if(x==null||texto(x).trim()==='')return NaN;var n=Number(x);return Number.isFinite(n)?n:NaN;}
  function copiar(v){return JSON.parse(JSON.stringify(v));}
  function registro(f){var r=f&&f.pontosChaveV1;var saida={versao:1,eventos:Array.isArray(r&&r.eventos)?copiar(r.eventos):[]};
    if(r&&Array.isArray(r.conflitosSync))saida.conflitosSync=copiar(r.conflitosSync);return saida;}
  function idEvento(compraId){return 'ef201_chakra_'+Array.from(texto(compraId)).map(function(c){return ('0000'+c.charCodeAt(0).toString(16)).slice(-4);}).join('');}
  function compraElegivel(f,livro,id){
    var resumo=livro&&livro.resumo&&livro.resumo(f),lista=resumo&&resumo.compras||[];
    var compra=lista.find(function(c){return texto(c.id)===texto(id);});
    if(!compra||compra.habilidadeId!=='melhoria_chakra')throw new Error('Selecione uma aquisição válida de Melhoria de Chakra.');
    var s=texto(compra.escolhas&&compra.escolhas.aplicacao);
    if(s!=='nao-aplicado'&&!(compra.tipo==='compra'&&!s))throw new Error('Esta melhoria já foi aplicada manualmente ou precisa de conferência.');
    return compra;
  }
  function preparar(f,livro,id,cla){
    if(!f||typeof f!=='object')throw new Error('Ficha indisponível.');
    var compra=compraElegivel(f,livro,id),r=registro(f),eid=idEvento(compra.id);
    if(r.eventos.some(function(e){return e&&(texto(e.id)===eid||(e.tipo==='efetivacao-beneficio'&&e.habilidadeId==='melhoria_chakra'&&texto(e.alvoId)===texto(compra.id)));}))
      throw new Error('Esta Melhoria de Chakra já foi efetivada. Não é permitido aplicar novamente.');
    var dado=numero(cla&&cla.chakra&&cla.chakra.die);
    if(!Number.isInteger(dado)||dado<2||dado>20)throw new Error('Não foi possível identificar o dado de Chakra do clã.');
    var antes=numero(f.chakraMax),atual=numero(f.chakra);
    if(!Number.isFinite(antes)||antes<=0||!Number.isFinite(atual)||atual<0||atual>antes)
      throw new Error('EKO atual ou máximo inválido. Confira a ficha antes de aplicar.');
    var depois=antes+dado;
    var ev={id:eid,tipo:'efetivacao-beneficio',habilidadeId:'melhoria_chakra',alvoId:texto(compra.id),
      origem:'melhoria-chakra-201',campo:'chakraMax',antes:antes,depois:depois,dado:'1d'+dado,
      resultadoMaximizado:dado,claId:texto(cla.id),criadoEm:new Date().toISOString(),
      observacao:'Dado de Chakra maximizado; apenas EKO máximo. EKO atual preservado.'};
    r.eventos.push(ev);
    return {id:eid,compraId:texto(compra.id),antes:antes,depois:depois,ekoAtual:atual,dado:dado,ganho:dado,novoRegistro:r,evento:ev};
  }
  function instalar(root){
    if(root.__shinobiChakra201Instalado)return;root.__shinobiChakra201Instalado=true;
    var ocupado=false,doc=root.document;
    function ficha(){try{return typeof estado!=='undefined'?estado:root.estado||null;}catch(_){return root.estado||null;}}
    doc.addEventListener('click',function(e){
      var b=e.target&&e.target.closest&&e.target.closest('[data-b201-chakra]');if(!b||ocupado)return;
      var f=ficha(),livro=root.ShinobiPontosChave;
      var cla=root.shinobiLevelUp&&root.shinobiLevelUp.getClanRule&&root.shinobiLevelUp.getClanRule();
      if(!f||!livro)return root.alert('Ficha ou Pontos-Chave indisponíveis.');
      if(!cla)return root.alert('Aguarde as regras de clã carregarem antes de aplicar a melhoria.');
      var id=b.getAttribute('data-b201-chakra'),plano;
      try{plano=preparar(f,livro,id,cla);}catch(erro){return root.alert(erro.message);}
      if(!root.confirm('Melhoria de Chakra: dado maximizado 1d'+plano.dado+' = +'+plano.ganho+' EKO máximo.\n\nEKO máximo: '+plano.antes+' → '+plano.depois+'\nEKO atual: '+plano.ekoAtual+' (inalterado).\n\nConfirmar? NÃO confirme se já aumentou o EKO máximo manualmente.'))return;
      if(typeof root.persistirEstadoLocal!=='function')return root.alert('Salvamento indisponível.');
      var campo=doc.querySelector('[data-save="chakraMax"]');
      if(campo&&campo.dataset.shinobiEdicaoPendente==='1')return root.alert('Confirme ou descarte a edição pendente de EKO máximo antes de aplicar.');
      ocupado=true;var anterior=f.pontosChaveV1,antigo=f.chakraMax;
      try{
        plano=preparar(f,livro,id,cla);
        f.pontosChaveV1=plano.novoRegistro;f.chakraMax=String(plano.depois);
        if(campo)campo.value=String(plano.depois);
        var salvo=root.persistirEstadoLocal({confirmada:true,origem:'melhoria-chakra-201',
          campos:['chakraMax','pontosChaveV1'],motivo:'beneficio-chakra-confirmado'});
        if(salvo!==true)throw new Error('O salvamento falhou.');
        if(campo){campo.dataset.shinobiValorConfirmado=String(plano.depois);campo.dataset.shinobiEdicaoPendente='0';}
        if(typeof root.atualizarPlacar==='function')root.atualizarPlacar();
        if(typeof root.atualizarPerfil==='function')root.atualizarPerfil();
        if(typeof root.atualizarHUD==='function')root.atualizarHUD();
        try{root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados',{detail:{motivo:'chakra201'}}));}catch(_e){}
        root.alert('Melhoria aplicada: EKO máximo +'+plano.ganho+'. EKO atual preservado.');
      }catch(erro){
        if(anterior===undefined)delete f.pontosChaveV1;else f.pontosChaveV1=anterior;
        f.chakraMax=antigo;if(campo)campo.value=texto(antigo);
        root.alert('Não foi possível aplicar a Melhoria de Chakra: '+erro.message);
      }finally{ocupado=false;}
    });
  }
  return Object.freeze({preparar:preparar,compraElegivel:compraElegivel,idEvento:idEvento,instalar:instalar});
});
