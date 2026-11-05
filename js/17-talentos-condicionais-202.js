/* Projetinho Shinobi 2.5.8.202 — talentos condicionais de combate.
 * Catálogo de Pontos-Chave, suplemento de 02/11/2026, p. 3.
 * Os alvos e o turno do inimigo não existem na ficha: apresentar decisões
 * condicionais, sem inventar um estado de inimigo ou consumir reações.
 * As rolagens são fornecidas pelo jogador, nunca feitas automaticamente.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiTalentosCondicionais202=api;
  if(root&&root.document)api.instalar(root);
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this),function(){
  'use strict';
  var IDS=['armas_grandes','sentinela','especialista_briga'];
  function texto(v){return String(v==null?'':v);}
  function adquirido(f,livro,id){
    if(!f||!livro||typeof livro.resumo!=='function'||IDS.indexOf(id)<0)return false;
    return (livro.resumo(f).compras||[]).some(function(c){
      if(c.habilidadeId!==id)return false;
      var confirmacao=texto(c.escolhas&&c.escolhas.aplicacao);
      return c.tipo==='compra'||confirmacao==='ja-aplicado'||confirmacao==='nao-aplicado';
    });
  }
  function armaElegivel(a){
    if(!a||!Array.isArray(a.propriedades))return false;
    var prop=a.propriedades.join(' ').toLowerCase();
    var duas=a.propriedades.some(function(p){return /duas\s*maos|duas\s*mãos/i.test(p);});
    var versatil=a.propriedades.some(function(p){return /versatil|versátil/i.test(p);});
    return (duas||versatil)&&!!a.dano&&/\d+d\d+/i.test(a.dano);
  }
  function armasElegiveis(preparacao){
    return preparacao&&typeof preparacao.catalogoArmas==='function'?
      preparacao.catalogoArmas().filter(armaElegivel):[];
  }
  function dadosDaArma(arma,empunhadura){
    if(!armaElegivel(arma))throw new Error('Esta arma não possui dado de dano e propriedade Duas Mãos ou Versátil.');
    var dado=texto(arma.dano),m=/\b(\d+)d(\d+)\b/i.exec(dado);
    // Wakizaki possui 1d8/1d10 conforme a empunhadura, confirmado pelo mestre.
    if(arma.id==='wakizaki'&&empunhadura==='duas')return {quantidade:1,faces:10};
    if(!m)throw new Error('O dado desta arma precisa ser confirmado pelo mestre.');
    return {quantidade:Number(m[1]),faces:Number(m[2])};
  }
  function inteiro(v,min,max,nome){
    var str=texto(v).trim();
    if(!/^\d{1,3}$/.test(str))throw new Error('Informe '+nome+' como um número inteiro.');
    var n=Number(str);
    if(n<min||n>max)throw new Error(nome+' deve estar entre '+min+' e '+max+'.');
    return n;
  }
  function calcularArmasGrandes(f,livro,preparacao,armaId,empunhadura,anterior,novo){
    if(!adquirido(f,livro,'armas_grandes'))throw new Error('Armas Grandes não foi confirmado nesta ficha.');
    var arma=armasElegiveis(preparacao).find(function(a){return a.id===texto(armaId);});
    if(!arma)throw new Error('Escolha uma arma elegível para Armas Grandes.');
    var dados=dadosDaArma(arma,empunhadura);
    var antigo=inteiro(anterior,1,2,'O dado original (1 ou 2)');
    var atual=inteiro(novo,1,dados.faces,'O novo dado');
    return {arma:arma.nome,original:antigo,novo:atual,variacao:atual-antigo,faces:dados.faces,
      formula:dados.quantidade+'d'+dados.faces,
      descricao:'Substitua apenas o dado re-rolado. O novo resultado deve ser mantido, mesmo se for 1 ou 2.'};
  }
  function avaliarSentinela(f,livro,cenario,opcoes){
    if(!adquirido(f,livro,'sentinela'))throw new Error('Sentinela não foi confirmado nesta ficha.');
    opcoes=opcoes||{};
    switch(texto(cenario)){
      case 'oportunidade-acertou':
        if(opcoes.acertou!==true)return {ativo:false,texto:'Confirme que o ataque de oportunidade acertou.'};
        return {ativo:true,deslocamento:0,texto:'Deslocamento do alvo: 0 até o fim deste turno.'};
      case 'desengajar':
        return {ativo:opcoes.reacaoDisponivel===true,texto:opcoes.reacaoDisponivel===true?
          'Desengajar não impede seu ataque de oportunidade. Confirme o alcance e resolva a reação.':
          'A habilidade permite oportunidade mesmo após Desengajar, mas sua reação precisa estar disponível.'};
      case 'ataque-proximo':
        var pode=opcoes.aUmMetroEMeio===true&&opcoes.outroAlvo===true&&opcoes.alvoSemSentinela===true&&opcoes.reacaoDisponivel===true;
        return {ativo:pode,texto:pode?'Você pode usar sua reação para atacar o agressor corpo a corpo com uma arma.':
          'Exige inimigo até 1,5 m, ataque contra outro alvo sem Sentinela e reação disponível.'};
      default:throw new Error('Situação de Sentinela desconhecida.');
    }
  }
  function avaliarBriga(f,livro,opcoes){
    if(!adquirido(f,livro,'especialista_briga'))throw new Error('Especialista em Briga não foi confirmado nesta ficha.');
    opcoes=opcoes||{};
    var pode=opcoes.noProprioTurno===true&&opcoes.acertouDesarmado===true&&opcoes.acaoBonusDisponivel===true;
    return {ativo:pode,texto:pode?'Você pode usar sua ação bônus para tentar agarrar o alvo atingido.':
      'Exige ataque desarmado acertado no seu turno e ação bônus disponível.'};
  }
  function instalar(root){
    if(root.__shinobiTalentosCondicionais202)return;root.__shinobiTalentosCondicionais202=true;
    var doc=root.document;
    function ficha(){try{return typeof estado!=='undefined'?estado:root.estado||null;}catch(_){return root.estado||null;}}
    function painel(){return doc.getElementById('talentosCondicionais202');}
    function criar(){
      if(painel())return painel();
      var antes=doc.getElementById('shinobiDuelistaDefensivo201')||doc.getElementById('shinobiSorte200');
      if(!antes||!antes.parentNode)return null;
      var p=doc.createElement('details');p.id='talentosCondicionais202';p.className='talentosCondicionais202';p.hidden=true;
      p.innerHTML='<summary>Talentos de combate <small data-tc202-quantidade></small></summary>'+
        '<section data-tc202="armas_grandes" hidden><h4>Armas Grandes</h4><p>Re-role uma vez cada dado de dano que apresentar 1 ou 2 com arma de Duas Mãos ou Versátil.</p>'+
        '<label>Arma <select data-tc202-arma></select></label><label>Empunhadura <select data-tc202-maos><option value="uma">Uma mão</option><option value="duas">Duas mãos</option></select></label>'+
        '<div class="tc202Campos"><label>Dado anterior <input type="number" min="1" max="2" data-tc202-antigo inputmode="numeric" placeholder="1 ou 2"></label><label>Novo dado <input type="number" min="1" data-tc202-novo inputmode="numeric" placeholder="Resultado"></label></div>'+
        '<button type="button" class="btn" data-tc202-calcular>Calcular troca</button><output data-tc202-saida aria-live="polite"></output></section>'+
        '<section data-tc202="sentinela" hidden><h4>Sentinela</h4><label>Situação <select data-tc202-situacao><option value="oportunidade-acertou">Ataque de oportunidade acertou</option><option value="desengajar">Inimigo usou Desengajar</option><option value="ataque-proximo">Inimigo atacou um aliado a 1,5 m</option></select></label>'+
        '<label><input type="checkbox" data-tc202-reacao> Minha reação está disponível</label><label><input type="checkbox" data-tc202-confirmar> Confirmo as condições descritas</label>'+
        '<button type="button" class="btn" data-tc202-sentinela>Ver resultado</button><output data-tc202-sentinela-saida aria-live="polite"></output></section>'+
        '<section data-tc202="especialista_briga" hidden><h4>Especialista em Briga</h4><p>Acertou um golpe desarmado no seu turno? Pode tentar agarrar como ação bônus.</p>'+
        '<label><input type="checkbox" data-tc202-briga-acerto> Acertei o golpe desarmado no meu turno</label><label><input type="checkbox" data-tc202-briga-bonus> Minha ação bônus está disponível</label>'+
        '<button type="button" class="btn" data-tc202-briga>Conferir ação</button><output data-tc202-briga-saida aria-live="polite"></output></section>'+
        '<small class="tc202Nota">Consulta de regras por situação. Não altera PV, turnos, inimigos nem consome reação automaticamente.</small>';
      antes.insertAdjacentElement('afterend',p);
      return p;
    }
    function atualizar(){
      var p=criar(),f=ficha(),livro=root.ShinobiPontosChave;
      if(!p)return;
      var ativos=IDS.filter(function(id){return adquirido(f,livro,id);});p.hidden=ativos.length===0;
      var n=p.querySelector('[data-tc202-quantidade]');if(n)n.textContent=ativos.length+' ativo(s)';
      IDS.forEach(function(id){var sec=p.querySelector('[data-tc202="'+id+'"]');if(sec)sec.hidden=ativos.indexOf(id)<0;});
      var combo=p.querySelector('[data-tc202-arma]'),pre=root.ShinobiPreparacaoAtaques;
      if(combo){var anterior=combo.value,armas=armasElegiveis(pre);
        combo.textContent='';armas.forEach(function(a){var o=doc.createElement('option');o.value=a.id;o.textContent=a.nome;combo.appendChild(o);});
        if(armas.some(function(a){return a.id===anterior;}))combo.value=anterior;
        var botao=p.querySelector('[data-tc202-calcular]');if(botao)botao.disabled=armas.length===0;
      }
    }
    function clique(e){
      var p=painel(),f=ficha(),livro=root.ShinobiPontosChave;if(!p||!f||!livro)return;
      var t=e.target;
      try{
        if(t.closest('[data-tc202-calcular]')){
          var x=calcularArmasGrandes(f,livro,root.ShinobiPreparacaoAtaques,p.querySelector('[data-tc202-arma]').value,
            p.querySelector('[data-tc202-maos]').value,p.querySelector('[data-tc202-antigo]').value,p.querySelector('[data-tc202-novo]').value);
          p.querySelector('[data-tc202-saida]').textContent=x.formula+': '+x.original+' → '+x.novo+' (dano '+(x.variacao>=0?'+':'')+x.variacao+'). '+x.descricao;
        }else if(t.closest('[data-tc202-sentinela]')){
          var s=p.querySelector('[data-tc202-situacao]').value,c=p.querySelector('[data-tc202-confirmar]').checked,reacao=p.querySelector('[data-tc202-reacao]').checked;
          var r=avaliarSentinela(f,livro,s,{acertou:c,reacaoDisponivel:reacao,aUmMetroEMeio:c,outroAlvo:c,alvoSemSentinela:c});
          p.querySelector('[data-tc202-sentinela-saida]').textContent=r.texto;
        }else if(t.closest('[data-tc202-briga]')){
          var b=avaliarBriga(f,livro,{noProprioTurno:p.querySelector('[data-tc202-briga-acerto]').checked,
            acertouDesarmado:p.querySelector('[data-tc202-briga-acerto]').checked,acaoBonusDisponivel:p.querySelector('[data-tc202-briga-bonus]').checked});
          p.querySelector('[data-tc202-briga-saida]').textContent=b.texto;
        }
      }catch(err){var out=t.closest('[data-tc202="armas_grandes"]')?p.querySelector('[data-tc202-saida]'):
        t.closest('[data-tc202="sentinela"]')?p.querySelector('[data-tc202-sentinela-saida]'):p.querySelector('[data-tc202-briga-saida]');
        if(out)out.textContent=err.message;
      }
    }
    function iniciar(){var p=criar();if(p&&!p.__tc202Ligado){p.__tc202Ligado=true;p.addEventListener('click',clique);}atualizar();}
    if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',iniciar);else iniciar();
    ['shinobi:app-pronto','shinobi:pontos-chave-atualizados','shinobi:realtime-aplicado','shinobi:realtime-colecao-aplicada','pageshow'].forEach(function(ev){root.addEventListener(ev,iniciar);});
    root.addEventListener('shinobi:ficha-persistida',function(e){if(!e.detail||!e.detail.campo||['pontosChaveV1','nivel'].indexOf(e.detail.campo)>=0)atualizar();});
  }
  return Object.freeze({versao:'2.5.8.202',adquirido:adquirido,armaElegivel:armaElegivel,armasElegiveis:armasElegiveis,
    dadosDaArma:dadosDaArma,calcularArmasGrandes:calcularArmasGrandes,avaliarSentinela:avaliarSentinela,
    avaliarBriga:avaliarBriga,instalar:instalar});
});
