/* Shinobi 2.5.8.199 — Perito: três proficiências por aquisição.
 * Escolhas são eventos append-only em pontosChaveV1; nunca altera checkbox manual.
 * Ferramentas são registradas para consulta, sem bônus inventado em rolagens.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiPerito199=api;
  if(root&&root.document)api.instalar(root);
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this),function(){
  'use strict';
  var PERICIAS=[
    ['p_acrobacia','Acrobacia'],['p_atletismo','Atletismo'],['p_atuacao','Atuação'],
    ['p_chakra','Chakra'],['p_enganacao','Enganação'],['p_furtividade','Furtividade'],
    ['p_historia','História'],['p_intimidacao','Intimidação'],['p_investigacao','Investigação'],
    ['p_animais','Lidar com Animais'],['p_medicina','Medicina'],['p_natureza','Natureza'],
    ['p_percepcao','Percepção'],['p_persuasao','Persuasão'],['p_prestidigitacao','Prestidigitação'],
    ['p_sensorial','Sensorial'],['p_sobrevivencia','Sobrevivência']
  ];
  var POR_ID={}; PERICIAS.forEach(function(p){POR_ID[p[0]]=p[1];});
  function texto(x){return String(x==null?'':x).trim();}
  function normal(x){return texto(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');}
  function copia(x){return JSON.parse(JSON.stringify(x));}
  function esc(x){return texto(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function idEvento(id){return 'p199_perito_'+Array.from(texto(id)).map(function(c){return ('0000'+c.charCodeAt(0).toString(16)).slice(-4);}).join('');}
  function registro(f){var r=f&&f.pontosChaveV1;var saida=r&&typeof r==='object'&&!Array.isArray(r)?copia(r):{versao:1};
    saida.eventos=Array.isArray(saida.eventos)?saida.eventos:[];return saida;}
  function compra(f,livro,id){var resumo=livro&&livro.resumo&&livro.resumo(f);return (resumo&&resumo.compras||[]).find(function(c){return texto(c.id)===texto(id)&&c.habilidadeId==='perito';})||null;}
  function evento(f,id){var lista=f&&f.pontosChaveV1&&f.pontosChaveV1.eventos||[];
    return lista.find(function(e){return e&&e.tipo==='escolha-perito'&&texto(e.alvoId)===texto(id);})||null;
  }
  function elegivel(c){if(!c)return false;var a=texto(c.escolhas&&c.escolhas.aplicacao);
    return a==='nao-aplicado'||(c.tipo==='compra'&&!a);
  }
  function podeConfigurar(f,livro,id){return elegivel(compra(f,livro,id))&&!evento(f,id);}
  function normalizarEscolhas(escolhas){
    if(!Array.isArray(escolhas)||escolhas.length!==3)throw new Error('Escolha exatamente três perícias ou ferramentas.');
    var vistos={};
    return escolhas.map(function(item){
      var tipo=texto(item&&item.tipo),id=texto(item&&item.id),nome=texto(item&&item.nome),chave,valor;
      if(tipo==='pericia'&&Object.prototype.hasOwnProperty.call(POR_ID,id)){
        chave='pericia:'+id;valor={tipo:'pericia',id:id,nome:POR_ID[id]};
      }else if(tipo==='ferramenta'&&nome.length>=2&&nome.length<=60&&!/[<>\x00-\x1f]/.test(nome)){
        chave='ferramenta:'+normal(nome);valor={tipo:'ferramenta',nome:nome};
      }else throw new Error('Selecione uma perícia válida ou informe o nome da ferramenta (2 a 60 caracteres).');
      if(vistos[chave])throw new Error('Não é possível escolher a mesma proficiência duas vezes.');
      vistos[chave]=true;return valor;
    });
  }
  function preparar(f,livro,id,escolhas){
    if(!f||!livro)throw new Error('Ficha ou catálogo de Pontos-Chave indisponível.');
    var c=compra(f,livro,id);
    if(!c)throw new Error('Aquisição de Perito não encontrada ou cancelada.');
    if(!elegivel(c))throw new Error('A aquisição já foi aplicada manualmente ou precisa de conferência.');
    if(evento(f,id))throw new Error('Esta aquisição já recebeu três proficiências.');
    var itens=normalizarEscolhas(escolhas),r=registro(f),eid=idEvento(id);
    if(r.eventos.some(function(e){return e&&e.id===eid;}))throw new Error('Já existe um registro dessa aquisição.');
    var ev={id:eid,tipo:'escolha-perito',habilidadeId:'perito',alvoId:texto(id),
      escolhas:itens,origem:'perito-199',criadoEm:new Date().toISOString()};
    r.eventos.push(ev);
    return {evento:ev,novoRegistro:r,nomes:itens.map(function(e){return e.nome;})};
  }
  function adquiridas(f,livro){
    var r=livro&&livro.resumo&&livro.resumo(f),compras=r&&r.compras||[],pericias=[],ferramentas=[];
    compras.filter(function(c){return c.habilidadeId==='perito';}).forEach(function(c){
      var ev=evento(f,c.id);if(!ev||!Array.isArray(ev.escolhas))return;
      ev.escolhas.forEach(function(e){if(e.tipo==='pericia'&&POR_ID[e.id]){
        if(pericias.indexOf(e.id)<0)pericias.push(e.id);
      }else if(e.tipo==='ferramenta'&&texto(e.nome)&&!ferramentas.some(function(x){return normal(x)===normal(e.nome);}))ferramentas.push(texto(e.nome));});
    });
    return {pericias:pericias,ferramentas:ferramentas};
  }
  function temPericia(f,livro,chave){return adquiridas(f,livro).pericias.indexOf(texto(chave))>=0;}
  function formulario(id){
    var op='<option value="">Selecionar...</option>'+PERICIAS.map(function(p){return '<option value="'+p[0]+'">'+esc(p[1])+'</option>';}).join('')+
      '<option value="ferramenta">Ferramenta (informar nome)</option>';
    return '<div class="beneficio199Form" data-p199-form="'+esc(id)+'"><p>Escolha três perícias ou ferramentas. Essas escolhas não serão descontadas novamente.</p>'+[1,2,3].map(function(i){
      return '<div class="beneficio199Linha"><label>Escolha '+i+'<select data-p199-opcao aria-label="Proficiência '+i+'">'+op+'</select></label>'+
        '<input type="text" maxlength="60" data-p199-ferramenta placeholder="Nome da ferramenta" aria-label="Nome da ferramenta '+i+'" hidden></div>';
    }).join('')+'<button type="button" class="beneficio190Aplicar" data-p199-salvar="'+esc(id)+'">Confirmar três proficiências</button></div>';
  }
  function resumoCompra(f,id){var ev=evento(f,id);return ev&&Array.isArray(ev.escolhas)?ev.escolhas.map(function(x){return x.nome;}).join(', '):'';}
  function instalar(root){
    if(root.__shinobiPerito199Instalado)return;root.__shinobiPerito199Instalado=true;
    var doc=root.document,ocupado=false;
    function ficha(){try{return typeof estado!=='undefined'?estado:null;}catch(_){return null;}}
    doc.addEventListener('change',function(e){var sel=e.target&&e.target.closest&&e.target.closest('[data-p199-opcao]');if(!sel)return;
      var input=sel.closest('.beneficio199Linha').querySelector('[data-p199-ferramenta]');
      input.hidden=sel.value!=='ferramenta';if(input.hidden)input.value='';
    });
    doc.addEventListener('click',function(e){var btn=e.target&&e.target.closest&&e.target.closest('[data-p199-salvar]');if(!btn||ocupado)return;
      var f=ficha(),livro=root.ShinobiPontosChave,form=btn.closest('[data-p199-form]');if(!form||!f||!livro)return;
      var id=btn.getAttribute('data-p199-salvar'),linhas=Array.from(form.querySelectorAll('.beneficio199Linha'));
      var escolhas=linhas.map(function(el){var sel=el.querySelector('[data-p199-opcao]');return sel.value==='ferramenta'?
        {tipo:'ferramenta',nome:el.querySelector('[data-p199-ferramenta]').value}:{tipo:'pericia',id:sel.value};});
      var plano;try{plano=preparar(f,livro,id,escolhas);}catch(err){return root.alert(err.message);}
      if(!root.confirm('Perito: confirmar estas três proficiências?\n\n'+plano.nomes.join('\n')+'\n\nA ficha manual não será sobrescrita.'))return;
      if(typeof root.persistirEstadoLocal!=='function')return root.alert('Salvamento da ficha indisponível.');
      ocupado=true;var anterior=f.pontosChaveV1;
      try{
        plano=preparar(f,livro,id,escolhas);f.pontosChaveV1=plano.novoRegistro;
        if(root.persistirEstadoLocal({confirmada:true,origem:'perito-199',campo:'pontosChaveV1',antes:anterior,depois:plano.novoRegistro,motivo:'proficiencias-perito'})!==true)
          throw new Error('Falha ao salvar as proficiências.');
        if(typeof root.atualizarBonusPericias==='function')root.atualizarBonusPericias();
        try{root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados',{detail:{motivo:'perito199'}}));}catch(_){}
        root.alert('Perito confirmado: '+plano.nomes.join(', ')+'.');
      }catch(err){f.pontosChaveV1=anterior;root.alert('Não foi possível registrar Perito: '+err.message);}
      finally{ocupado=false;}
    });
    root.addEventListener('shinobi:realtime-aplicado',function(){if(typeof root.atualizarBonusPericias==='function')root.atualizarBonusPericias();});
    root.addEventListener('shinobi:realtime-colecao-aplicada',function(){if(typeof root.atualizarBonusPericias==='function')root.atualizarBonusPericias();});
    // O painel 190 pode ter sido criado antes de este módulo carregar.
    // Recalcular somente a apresentação, sem qualquer escrita no estado.
    try{root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados',{detail:{motivo:'perito199-pronto'}}));}catch(_){}
    if(typeof root.atualizarBonusPericias==='function')root.atualizarBonusPericias();
  }
  return Object.freeze({pericias:PERICIAS.slice(),idEvento:idEvento,evento:evento,compra:compra,
    elegivel:elegivel,podeConfigurar:podeConfigurar,normalizarEscolhas:normalizarEscolhas,preparar:preparar,
    adquiridas:adquiridas,temPericia:temPericia,formulario:formulario,resumoCompra:resumoCompra,instalar:instalar});
});
