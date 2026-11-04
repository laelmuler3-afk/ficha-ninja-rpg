/* Projetinho Shinobi 2.5.8.192 — motor central de benefícios passivos.
 * Não edita a ficha, não consome pontos e não altera compras reconhecidas.
 * Benefício manual já aplicado nunca entra novamente na projeção.
 * Benefícios ainda sem regra confirmada permanecem pendentes para evolução futura.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiBeneficios192=api;
  if(root&&root.document)api.instalar(root);
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this),function(){
  'use strict';
  function texto(s){return String(s==null?'':s);}
  function compras(ficha,livro){
    return livro&&typeof livro.resumo==='function'?(livro.resumo(ficha).compras||[]):[];
  }
  function efetivadas(ficha){
    var eventos=ficha&&ficha.pontosChaveV1&&ficha.pontosChaveV1.eventos||[],anuladas=new Set();
    eventos.forEach(function(e){if(e&&e.tipo==='estorno')anuladas.add(texto(e.alvoId));});
    var saida=new Set();
    eventos.forEach(function(e){if(e&&e.tipo==='efetivacao-beneficio'&&!anuladas.has(texto(e.id)))saida.add(texto(e.alvoId));});
    return saida;
  }
  function classificacao(compra,efetivadasId){
    if(efetivadasId.has(texto(compra.id)))return 'registrado-no-atributo';
    var op=compra.escolhas||{};
    if(op.aplicacao==='ja-aplicado')return 'manual';
    if(op.aplicacao==='nao-aplicado')return 'automatico';
    // Compras novas são registradas pelo próprio aplicativo; benefícios
    // derivados e não destrutivos podem entrar diretamente no cálculo.
    if(compra.tipo==='compra'&&!op.aplicacao)return 'automatico';
    return 'pendente';
  }
  function avaliar(ficha,livro){
    var resultado={deslocamentoExtra:0,iniciativaExtra:0,aplicados:[],manuais:[],pendentes:[]};
    var regs=efetivadas(ficha);
    compras(ficha,livro).forEach(function(c){
      var estado=classificacao(c,regs),n=texto(c.nome||c.habilidadeId);
      if(estado==='manual'||estado==='registrado-no-atributo'){
        resultado.manuais.push({id:c.id,habilidadeId:c.habilidadeId,nome:n});return;
      }
      if(estado!=='automatico'){
        resultado.pendentes.push({id:c.id,habilidadeId:c.habilidadeId,nome:n});return;
      }
      if(c.habilidadeId==='melhoria_deslocamento'){
        resultado.deslocamentoExtra+=1.5;
        resultado.aplicados.push({id:c.id,habilidadeId:c.habilidadeId,descricao:'+1,5 m de deslocamento'});
      }else if(c.habilidadeId==='alerta'){
        resultado.iniciativaExtra+=5;
        resultado.aplicados.push({id:c.id,habilidadeId:c.habilidadeId,descricao:'+5 de iniciativa'});
      }else if(c.habilidadeId==='melhoria_vida'||c.habilidadeId==='melhoria_chakra'){
        // PV/EKO dependem de dado, maximização ou confirmação manual.
        resultado.pendentes.push({id:c.id,habilidadeId:c.habilidadeId,nome:n,motivo:'Requer valor escolhido/rolagem e confirmação antes de alterar PV ou EKO.'});
      }
      // Talentos de armas e ninjutsu continuam calculados pelos módulos
      // especializados até a integração completa do motor de regras.
    });
    return resultado;
  }
  function instalar(root){
    if(root.__shinobiBeneficios192Instalado)return;
    root.__shinobiBeneficios192Instalado=true;
    function atualizar(){
      // Mostra a diferença de forma discreta ao lado do valor BASE do Perfil.
      // O input e a ficha persistida permanecem intocados.
      var cont=root.document.querySelector('[data-stat="vel"]');
      if(cont){
        var badge=cont.querySelector('.shinobiBonusDesloc192');
        var f=null;
        try{f=typeof estado!=='undefined'?estado:null;}catch(_e){}
        var extra=f?avaliar(f,root.ShinobiPontosChave).deslocamentoExtra:0;
        if(extra){
          if(!badge){badge=root.document.createElement('small');badge.className='shinobiBonusDesloc192';cont.appendChild(badge);}
          badge.textContent='+'+String(extra).replace('.',',')+' m de talentos';
          badge.title='Bônus automático. O campo acima continua mostrando a velocidade-base registrada.';
        }else if(badge){badge.remove();}
      }
      if(typeof root.atualizarMostradoresExtrasBatalha==='function'){
        try{root.atualizarMostradoresExtrasBatalha();}catch(_e){}
      }
    }
    if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',atualizar);
    else atualizar();
    root.addEventListener('shinobi:pontos-chave-atualizados',atualizar);
    root.addEventListener('shinobi:realtime-aplicado',atualizar);
    root.addEventListener('shinobi:ficha-persistida',function(e){
      if(!e.detail||['pontosChaveV1','velocidade','nivel'].indexOf(e.detail.campo)>=0)atualizar();
    });
  }
  return Object.freeze({versao:'2.5.8.192',avaliar:avaliar,compras:compras,classificacao:classificacao,instalar:instalar});
});
