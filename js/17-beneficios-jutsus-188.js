/* Projetinho Shinobi 2.5.8.188 — benefícios confirmados nos jutsus.
 * Nunca modifica a ficha nem faz nova compra. Ativa apenas melhorias marcadas
 * "Ainda não apliquei", com jutsu e escolha exatos e aquisição existente.
 * Melhorado II é limitado por usos/descanso: não é desconto permanente.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiBeneficiosJutsus188=api;
  if(root&&root.document)api.instalar(root);
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  var PASSOS={4:6,6:8,8:10,10:12};
  function texto(x){return String(x==null?'':x).trim();}
  function identificador(j){return texto(j&&(j.jutsuId||j.catalogoId));}
  function compras(ficha,livro){
    if(!ficha||!livro||typeof livro.resumo!=='function')return [];
    var res=livro.resumo(ficha);
    return Array.isArray(res.compras)?res.compras:[];
  }
  function vinculos(ficha,jutsu,livro){
    var id=identificador(jutsu);
    if(!id||/^indice:/.test(id))return [];
    return compras(ficha,livro).filter(function(c){
      var op=c&&c.escolhas||{};
      return texto(op.alvoId)===id && op.alvoTipo==='jutsu' &&
        ['ninjutsu_aprimorado','ninjutsu_melhorado_2'].indexOf(c.habilidadeId)>=0 &&
        ['ja-aplicado','nao-aplicado','incerto'].indexOf(op.aplicacao)>=0;
    });
  }
  /* Ninjutsu Melhorado II: consumos por AQUISIÇÃO, por descanso longo.
   * Os eventos pertencem ao livro-caixa sincronizado. Não alteramos jutsu.custo.
   * Compras legadas marcadas "já aplicado" exigem custo original confirmado.
   */
  function proficiencia(ficha){
    var nivel=Math.max(1,Math.min(20,Math.floor(Number(ficha&&ficha.nivel)||1)));
    return Math.floor((nivel-1)/4)+2;
  }
  function numeroCusto(valor){
    var txt=texto(valor).replace(',','.');
    if(!/^\d+(?:\.\d+)?$/.test(txt))return null;
    var n=Number(txt);return Number.isFinite(n)&&n>=0?n:null;
  }
  function eventoId(prefixo){
    var parte='';
    try{if(typeof crypto!=='undefined'&&crypto.randomUUID)parte=crypto.randomUUID().replace(/-/g,'');}catch(_e){}
    return prefixo+'_'+(parte||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12));
  }
  function eventos(ficha,livro){
    var reg=livro&&typeof livro.registro==='function'?livro.registro(ficha):null;
    return Array.isArray(reg&&reg.eventos)?reg.eventos:[];
  }
  function ultimoDescanso(eventosLista){
    return eventosLista.filter(function(e){return e&&e.tipo==='descanso-longo-melhorado-ii';})
      .sort(function(a,b){var x=texto(a.criadoEm).localeCompare(texto(b.criadoEm));return x||texto(a.id).localeCompare(texto(b.id));}).pop()||null;
  }
  function estadoMelhoradoII(ficha,jutsu,livro){
    var compra=vinculos(ficha,jutsu,livro).find(function(c){
      return c.habilidadeId==='ninjutsu_melhorado_2'&&
        ['reduzir-custo','dobrar-alcance'].indexOf(texto(c.escolhas&&c.escolhas.efeito))>=0&&
        ['ja-aplicado','nao-aplicado'].indexOf(texto(c.escolhas&&c.escolhas.aplicacao))>=0;
    });
    if(!compra)return null;
    var todos=eventos(ficha,livro),descanso=ultimoDescanso(todos),ciclo=descanso?texto(descanso.id):'inicio';
    var usos=todos.filter(function(e){return e&&e.tipo==='uso-ninjutsu-melhorado-ii'&&texto(e.compraId)===texto(compra.id)&&texto(e.cicloId||'inicio')===ciclo;}).length;
    var limite=proficiencia(ficha),restantes=Math.max(0,limite-usos),escolhas=compra.escolhas||{};
    var configuracoes=todos.filter(function(e){return e&&e.tipo==='config-ninjutsu-melhorado-ii'&&texto(e.compraId)===texto(compra.id)&&numeroCusto(e.custoOriginal)!==null;});
    configuracoes.sort(function(a,b){return texto(a.criadoEm).localeCompare(texto(b.criadoEm))||texto(a.id).localeCompare(texto(b.id));});
    var config=configuracoes[configuracoes.length-1];
    var manual=escolhas.aplicacao==='ja-aplicado';
    var custoOriginal=config?numeroCusto(config.custoOriginal):(manual?null:numeroCusto(jutsu.custo));
    var desconto=Math.floor(Math.max(1,Math.min(20,Math.floor(Number(ficha.nivel)||1)))/2);
    var custoReduzido=custoOriginal===null?null:Math.max(1,custoOriginal-desconto);
    var custoManual=numeroCusto(jutsu.custo);
    return {compraId:texto(compra.id),jutsuId:identificador(jutsu),modo:texto(escolhas.efeito),
      manual:manual,usos:usos,limite:limite,restantes:restantes,cicloId:ciclo,
      custoOriginal:custoOriginal,custoReduzido:custoReduzido,custoManual:custoManual,
      reducao:desconto,precisaCustoOriginal:escolhas.efeito==='reduzir-custo'&&custoOriginal===null};
  }
  function custoEfetivoMelhoradoII(info,base){
    if(!info||info.modo!=='reduzir-custo')return base;
    if(info.custoOriginal===null)return base;
    if(info.restantes===0)return info.custoOriginal;
    return info.manual?info.custoManual:info.custoReduzido;
  }
  function prepararUsoMelhoradoII(ficha,jutsu,livro,originalConfirmado){
    var info=estadoMelhoradoII(ficha,jutsu,livro);
    if(!info)return {info:null,custoOriginalConfig:null};
    var custoConfig=null;
    if(info.precisaCustoOriginal){
      custoConfig=numeroCusto(originalConfirmado);
      if(custoConfig===null||custoConfig<=0)throw new Error('Confirme primeiro o custo original do jutsu, sem o desconto aplicado manualmente.');
      if(info.custoManual!==null&&custoConfig<=info.custoManual)throw new Error('O custo original deve ser maior que o custo já reduzido na ficha.');
      info.custoOriginal=custoConfig;
      info.custoReduzido=Math.max(1,custoConfig-info.reducao);
      info.precisaCustoOriginal=false;
    }
    return {info:info,custoOriginalConfig:custoConfig};
  }
  function registrarUsoMelhoradoII(ficha,jutsu,livro,preparado,custoCobrado){
    var atual=estadoMelhoradoII(ficha,jutsu,livro);
    if(!preparado||!preparado.info||!atual||atual.compraId!==preparado.info.compraId)return null;
    if(atual.cicloId!==preparado.info.cicloId||atual.usos!==preparado.info.usos)throw new Error('A contagem de usos mudou. Confira novamente antes de conjurar.');
    var reg=livro.registro(ficha),agora=new Date().toISOString();
    if(preparado.custoOriginalConfig!==null){reg.eventos.push({id:eventoId('nm2config'),tipo:'config-ninjutsu-melhorado-ii',
      compraId:atual.compraId,jutsuId:atual.jutsuId,custoOriginal:preparado.custoOriginalConfig,criadoEm:agora});}
    if(atual.restantes>0){reg.eventos.push({id:eventoId('nm2uso'),tipo:'uso-ninjutsu-melhorado-ii',
      compraId:atual.compraId,jutsuId:atual.jutsuId,modo:atual.modo,cicloId:atual.cicloId,
      custoCobrado:numeroCusto(custoCobrado),criadoEm:agora});}
    return reg;
  }
  function registrarDescansoLongo(ficha,livro){
    var reg=livro.registro(ficha);
    reg.eventos.push({id:eventoId('nm2descanso'),tipo:'descanso-longo-melhorado-ii',criadoEm:new Date().toISOString(),
      descricao:'Reinicia os usos de Ninjutsu Melhorado II; não modifica PV ou EKO.'});
    return reg;
  }
  function aumentarDado(dano){
    var original=texto(dano),achou=false,invalido=false;
    var novo=original.replace(/(^|[^\w])(\d+)d(\d+)(?!\w)/gi,function(t,prefix,n,faces){
      var proximo=PASSOS[Number(faces)];
      if(!proximo){invalido=true;return t;}
      achou=true;return prefix+n+'d'+proximo;
    });
    return achou&&!invalido?novo:null;
  }
  function triplicarAlcance(alcance){
    var val=texto(alcance),m=val.match(/^(até\s+)?(\d+(?:[,.]\d+)?)\s*(m|metros?)$/i);
    if(!m)return null;
    var qtd=Number(m[2].replace(',','.'))*3;
    if(!Number.isFinite(qtd)||qtd<=0)return null;
    var valor=Number.isInteger(qtd)?String(qtd):String(qtd).replace('.',',');
    return (m[1]||'')+valor+' '+m[3];
  }
  function aplicar(ficha,jutsu,regra,livro){
    var saida=Object.assign({},regra||{}),aplicados=[],preservados=[],pendentes=[],indicadores=[];
    var encontrados=vinculos(ficha,jutsu,livro);
    var usados=new Set();
    encontrados.forEach(function(c){
      var op=c.escolhas||{},efeito=texto(op.efeito),tag=texto(c.nome||c.habilidadeId);
      if(op.aplicacao==='ja-aplicado'){
        preservados.push(tag+': valor já ajustado manualmente; não reaplicar');return;
      }
      if(op.aplicacao==='incerto'){
        pendentes.push(tag+': aguarda conferência do jogador');return;
      }
      if(c.habilidadeId==='ninjutsu_melhorado_2'){
        pendentes.push(tag+': melhoria opcional por uso e com limite por descanso; não é bônus permanente');return;
      }
      if(c.habilidadeId!=='ninjutsu_aprimorado'||!efeito){
        pendentes.push(tag+': escolha não definida');return;
      }
      // Nunca aplica duas vezes a mesma transformação à mesma técnica.
      if(usados.has(efeito))return;
      if(efeito==='aumentar-dado'){
        var novo=aumentarDado(saida.danoEfetivo||jutsu.dano);
        if(!novo){pendentes.push(tag+': dano sem dado compatível; não alterado');return;}
        saida.danoEfetivo=novo;
        aplicados.push('Ninjutsu Aprimorado: dado de dano '+novo);
        indicadores.push('Dano '+novo);
      }else if(efeito==='acao-bonus'){
        saida.acaoEfetiva='Ação Bônus';
        aplicados.push('Ninjutsu Aprimorado: Ação Bônus (AB)');
        indicadores.push('Ação AB');
      }else if(efeito==='triplicar-alcance'){
        var alcance=triplicarAlcance(jutsu.alcance);
        if(!alcance){pendentes.push(tag+': alcance não é uma distância simples; revisão necessária');return;}
        saida.alcanceEfetivo=alcance;
        aplicados.push('Ninjutsu Aprimorado: alcance '+alcance);
        indicadores.push('Alcance '+alcance);
      }else{
        pendentes.push(tag+': efeito não reconhecido; não aplicado');return;
      }
      usados.add(efeito);
    });
    var m2=estadoMelhoradoII(ficha,jutsu,livro);
    if(m2){
      saida.melhoradoII=m2;
      if(m2.modo==='reduzir-custo'){
        var novoCusto=custoEfetivoMelhoradoII(m2,numeroCusto(saida.custoEfetivoTexto));
        if(novoCusto!==null)saida.custoEfetivoTexto=String(novoCusto);
      }else if(m2.restantes>0&&m2.modo==='dobrar-alcance'){
        var textoAlcance=texto(saida.alcanceEfetivo||jutsu.alcance);
        var match=textoAlcance.match(/^(até\s+)?(\d+(?:[,.]\d+)?)\s*(m|metros?)$/i);
        if(match){var dobrado=Number(match[2].replace(',','.'))*2;
          saida.alcanceEfetivo=(match[1]||'')+String(dobrado).replace('.',',')+' '+match[3];}
      }
      indicadores.push('Ninjutsu II '+m2.usos+'/'+m2.limite);
    }
    saida.beneficios188={aplicados:aplicados,preservados:preservados,pendentes:pendentes,indicadores:indicadores};
    return saida;
  }
  /* Apenas projeta o resultado calculado na interface. Nenhuma edição no objeto
   * do jutsu ou nas compras: base e benefícios continuam separados.
   * A capa TCG usa elementos diferentes da versão expandida; atualizar só a
   * linha superior deixava o preço/ação antigos e um selo enganoso.
   */
  function decorarCard(card,jutsu,regra){
    if(!card||!regra||!regra.beneficios188)return;
    var b=regra.beneficios188,linha=card.querySelector('.jutsuLinhaTexto small');
    var selo=card.querySelector('.b188Selo');
    if(linha&&b.aplicados.length){
      if(!selo){selo=card.ownerDocument.createElement('span');selo.className='b188Selo';linha.appendChild(selo);}
      var etiquetas=Array.isArray(b.indicadores)&&b.indicadores.length?b.indicadores:b.aplicados;
      selo.textContent=etiquetas.length===1?etiquetas[0]:'Melhorias: '+etiquetas.join(' · ');
      selo.title=b.aplicados.join(' · ');
    }else if(selo){selo.remove();}

    // A capa compacta tem chips próprios: não herda o valor atualizado do
    // cabeçalho expandido. Mostrar o custo efetivo (ex.: Kai grátis), MAS
    // nunca presumir desconto permanente do Ninjutsu Melhorado II.
    var custoEfetivo=texto(regra.custoEfetivoTexto);
    var custoCapa=card.querySelector('.jutsuTcgChipCusto strong');
    if(custoCapa&&custoEfetivo)custoCapa.textContent=custoEfetivo+' EKO';
    if(regra.acaoEfetiva){
      var a=card.querySelector('.jutsuAcaoRapida');
      var pill=card.querySelector('.jutsuAcaoPill');
      var acaoCapa=card.querySelector('.jutsuTcgChipAcao strong');
      if(a){a.textContent='AB';a.setAttribute('data-acao','AB');a.title='Ação Bônus por Ninjutsu Aprimorado';a.setAttribute('aria-label',a.title);}
      if(pill){pill.textContent='AB';pill.title='Ação Bônus por Ninjutsu Aprimorado';}
      if(acaoCapa){acaoCapa.textContent='AB';acaoCapa.title='Ação Bônus por Ninjutsu Aprimorado';}
    }
    var contador=card.querySelector('.ninjutsuII194Contador');
    if(regra.melhoradoII){
      if(!contador){
        var hostContador=card.querySelector('.jutsuLinhaTexto')||card.querySelector('.jutsuLinhaTexto small');
        if(hostContador&&typeof hostContador.appendChild==='function'){
          contador=card.ownerDocument.createElement('small');contador.className='ninjutsuII194Contador';
          hostContador.appendChild(contador);
        }
      }
      contador.textContent='Melhorado II '+regra.melhoradoII.usos+'/'+regra.melhoradoII.limite+
        (regra.melhoradoII.restantes===0?' · esgotado':'');
      contador.title='Usos desde o último descanso longo';
    }else if(contador)contador.remove();
    var antigo=card.querySelector('.b188Detalhes');
    if(antigo)antigo.remove();
    var textos=b.aplicados.concat(b.preservados,b.pendentes);
    if(textos.length){
      var destino=card.querySelector('.jutsuResumo')||card;
      var aviso=card.ownerDocument.createElement('small');aviso.className='b188Detalhes';
      aviso.textContent=textos.join(' · ');
      destino.insertAdjacentElement('afterend',aviso);
    }
  }
  function instalar(root){
    if(root.__shinobi188Instalado)return;
    root.__shinobi188Instalado=true;
    function recarregar(){
      if(typeof root.renderizarJutsus==='function'&&root.document.querySelector('#listaJutsus')){
        try{root.renderizarJutsus();}catch(_e){}
      }
    }
    if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',recarregar);
    else recarregar();
    root.addEventListener('shinobi:pontos-chave-atualizados',recarregar);
    root.addEventListener('shinobi:realtime-aplicado',recarregar);
    function ficha(){try{return typeof estado!=='undefined'&&estado?estado:null;}catch(_){return null;}}
    function montarDescanso(){
      var hero=root.document.querySelector('#jutsus .jutsusHero'),f=ficha(),livro=root.ShinobiPontosChave;
      if(!hero||!f||!livro)return;
      var botao=root.document.getElementById('ninjutsuII194Descanso');
      var tem=(livro.resumo(f).compras||[]).some(function(c){return c.habilidadeId==='ninjutsu_melhorado_2';});
      if(!tem){if(botao)botao.remove();return;}
      if(!botao){botao=root.document.createElement('button');botao.type='button';botao.id='ninjutsuII194Descanso';
        botao.className='btn';botao.style.cssText='display:block;margin:9px 0;font-size:12px;max-width:100%;white-space:normal';
        botao.textContent='Restaurar usos de Ninjutsu II (descanso longo)';hero.appendChild(botao);
        botao.addEventListener('click',function(){var folha=ficha(),E=root.ShinobiPontosChave;
          if(!folha||!E||!root.confirm('Confirmar descanso longo? Os usos de Ninjutsu Melhorado II serão restaurados. PV e EKO não serão modificados.'))return;
          var anterior=folha.pontosChaveV1;folha.pontosChaveV1=registrarDescansoLongo(folha,E);
          var ok=typeof root.persistirEstadoLocal==='function'&&root.persistirEstadoLocal({confirmada:true,origem:'ninjutsu-melhorado-ii',campo:'pontosChaveV1',motivo:'descanso-longo'});
          if(!ok){folha.pontosChaveV1=anterior;root.alert('O descanso não foi salvo.');return;}
          recarregar();root.alert('Usos de Ninjutsu Melhorado II restaurados.');
        });
      }
    }
    if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',montarDescanso);
    else montarDescanso();
    root.addEventListener('shinobi:pontos-chave-atualizados',montarDescanso);
    root.addEventListener('shinobi:realtime-aplicado',montarDescanso);
    root.addEventListener('shinobi:ficha-persistida',function(e){if(e.detail&&e.detail.campo==='pontosChaveV1')montarDescanso();});

  }
  return Object.freeze({versao:'2.5.8.188',vinculos:vinculos,aumentarDado:aumentarDado,
    triplicarAlcance:triplicarAlcance,aplicar:aplicar,decorarCard:decorarCard,instalar:instalar,
    proficiencia:proficiencia,estadoMelhoradoII:estadoMelhoradoII,prepararUsoMelhoradoII:prepararUsoMelhoradoII,
    registrarUsoMelhoradoII:registrarUsoMelhoradoII,registrarDescansoLongo:registrarDescansoLongo,custoEfetivoMelhoradoII:custoEfetivoMelhoradoII});
});
