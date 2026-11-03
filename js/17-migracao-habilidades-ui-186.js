/* UI de conciliação assistida — 2.5.8.186.
 * Exibe somente a ficha atualmente aberta. Nada é aplicado ou gravado sem confirmação.
 */
(function(root){
  'use strict';
  if(!root||!root.document||root.__shinobiMig186UI)return;
  root.__shinobiMig186UI=true;
  var doc=root.document,M=root.ShinobiMigracaoHabilidades186,E=root.ShinobiPontosChave;
  if(!M||!E)return;
  var painel=null,assinatura='',salvando=false;
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function ficha(){try{return typeof estado!=='undefined'&&estado&&typeof estado==='object'?estado:null;}catch(_){return null;}}
  function listaOpcao(entrada,f){
    var alvo=entrada.tipoAlvo,arr=M.alvos(f,alvo);
    if(!alvo||alvo==='armas')return '';
    var opts='<option value="">— Selecionar destino —</option>'+arr.map(function(x){return '<option value="'+esc(x.id)+'"'+(entrada.sugestao===x.id?' selected':'')+'>'+esc(x.nome)+(x.extra?' · '+esc(x.extra):'')+'</option>';}).join('');
    var ajuda=alvo==='jutsu'?'Escolha o jutsu que recebeu a melhoria. O custo exibido é o valor atual, não será alterado.':
      alvo==='atributo'?'Escolha qual atributo foi aumentado. O número atual NÃO mudará.':
      alvo==='natureza'?'Escolha a natureza adquirida ou evoluída. O nível atual não mudará.':
      'Confirme o elemento beneficiado.';
    var natureza=alvo==='natureza'?'<label>Tipo de aquisição<select data-mig186-tipo><option value="">— Não determinado —</option><option value="nova-elemental">Nova natureza elemental</option><option value="evolucao">Evolução de natureza conhecida</option><option value="nova-nao-elemental">Outra natureza</option></select></label>':'';
    return '<label>'+esc(ajuda)+'<select data-mig186-alvo>'+opts+'</select></label>'+natureza;
  }
  function linha(e,f){
    var bloqueado=e.estado==='nao-catalogado',concluido=e.estado==='importado'||e.estado==='vinculado';
    var estado='A conferir',classe='pendente';
    if(concluido){estado='Confirmado';classe='concluido';}
    else if(bloqueado){estado='Regra pendente';classe='pendente';}
    else if(e.estado==='ja-registrado'){estado='Já registrado';classe='existente';}
    var observacao=e.observacao?'<p class="mig186Aviso">'+esc(e.observacao)+'</p>':'';
    var origem=e.estado==='ja-registrado'?'<p class="mig186Nota">Esta habilidade já consta no histórico. A confirmação apenas vincula sua escolha; não cria outra aquisição.</p>':'';
    var campos=concluido||bloqueado?'':
      '<div class="mig186Formulario">'+listaOpcao(e,f)+
      '<label>O benefício na ficha atual está...<select data-mig186-aplicacao><option value="">— Escolha uma situação —</option><option value="ja-aplicado">Já aplicado manualmente</option><option value="nao-aplicado">Ainda não aplicado</option><option value="incerto">Não sei / preciso conferir</option></select></label>'+ 
      '<label>Observação (opcional)<input type="text" maxlength="240" data-mig186-obs placeholder="Ex.: custo do jutsu já está em 7 EKO"></label>'+ 
      '<label class="mig186Confirmar"><input type="checkbox" data-mig186-confirmar> Confirmo esta aquisição e suas informações</label></div>';
    return '<details class="mig186Linha '+classe+'" data-mig186-id="'+esc(e.sourceId)+'">'+
      '<summary class="mig186Cabeca"><div><strong>'+e.ordem+'. '+esc(e.rotulo)+'</strong><small>'+esc(e.habilidadeId?'Suplemento · p. '+f.__pagina:'Ainda não catalogada · suplemento p. '+f.__pagina)+'</small></div><span>'+estado+'</span></summary>'+observacao+origem+
      (bloqueado?'<p class="mig186Nota">Esta característica será mantida para futura revisão com o mestre. Não é importada como habilidade automática.</p>':'')+campos+'</details>';
  }
  function iniciar(){
    var host=doc.querySelector('#shinobiPontos184 .shinobiPontos184Corpo');
    if(!host)return;
    if(!painel||!painel.isConnected){
      painel=doc.createElement('details');painel.id='mig186';painel.className='shinobiPontos184Secao mig186';
      painel.innerHTML='<summary>Reconhecer habilidades antigas <span class="mig186Mini">Suplemento Shinobi</span></summary>'+ 
        '<div class="mig186Conteudo" id="mig186Conteudo"></div>';
      host.insertBefore(painel,host.querySelector('.shinobiPontos184Secao'));
      painel.addEventListener('click',clicar);
      assinatura='';
    }
    atualizar();
  }
  function atualizar(forcar){
    var f=ficha();if(!painel||!f)return;
    var modelo=M.identificar(f),s=String(f.nome||'')+'|'+String(f.cla||'')+'|'+String(f.nivel||'')+'|'+
      (f.pontosChaveV1&&Array.isArray(f.pontosChaveV1.eventos)?f.pontosChaveV1.eventos.map(function(e){return e.id;}).join(','):'')+
      '|'+(modelo?modelo.id:'nenhum');
    if(!forcar&&s===assinatura)return;
    if(painel.open&&!forcar&&assinatura&&modelo&&assinatura.split('|')[0]===String(f.nome||'')){
      // Não destrói rascunhos ao receber eventos de outros campos da ficha.
      return;
    }
    assinatura=s;
    var box=doc.getElementById('mig186Conteudo');if(!box)return;
    if(!modelo){
      box.innerHTML='<p class="mig186Nota">Nenhuma correspondência exata entre o nome desta ficha e as quatro fichas do suplemento. Não será feita associação pelo nome de outra pessoa ou por aproximação.</p>'+ 
        '<p class="mig186Nota">Confira o nome e o clã no Perfil. Se seu personagem não estiver no suplemento, você pode registrar as habilidades anteriores pelo histórico normal de Pontos-Chave.</p>';
      return;
    }
    var entradas=M.entradasValidas(modelo,f,E);var concluidos=entradas.filter(function(x){return x.estado==='importado'||x.estado==='vinculado';}).length;
    var revisar=entradas.filter(function(x){return x.estado==='nao-catalogado';}).length;
    var completos=entradas.filter(function(x){return x.estado!=='nao-catalogado'&&x.estado!=='importado'&&x.estado!=='vinculado';}).length;
    var fView=Object.assign({},f,{__pagina:modelo.pagina});
    box.innerHTML='<p class="mig186Nota"><strong>'+esc(modelo.nome)+'</strong> · lista da página '+modelo.pagina+' do suplemento. '+
      'Verifique se esta ficha é realmente sua. São '+entradas.length+' registros; '+concluidos+' confirmados, '+completos+' disponíveis e '+revisar+' exigem revisão.</p>'+ 
      '<p class="mig186Aviso"><strong>Sem cobrança e sem bônus duplicados:</strong> confirmar registra apenas o histórico e o destino. Não altera atributos, PV, EKO, jutsus, ataques nem pontos disponíveis. Valores já ajustados manualmente ficam como estão.</p>'+ 
      (Number(f.nivel||0)<8?'<p class="mig186Aviso">A ficha atual está abaixo do nível 8 do suplemento; a confirmação ficará bloqueada.</p>':'')+
      '<div class="mig186Lista">'+entradas.map(function(e){return linha(e,fView);}).join('')+'</div>'+ 
      '<label class="mig186Identidade"><input type="checkbox" id="mig186ConfirmarFicha"> Confirmo que a ficha aberta pertence a '+esc(modelo.nome)+' e conferi a lista do suplemento.</label>'+ 
      '<button type="button" class="shinobiPontos184Principal" data-mig186-action="salvar"'+(Number(f.nivel||0)<8?' disabled':'')+'>Registrar habilidades selecionadas</button>'+ 
      '<p class="mig186Nota">A origem e o destino ficam registrados no histórico da ficha. Ajustes de saldo antigo continuam sendo conferidos separadamente com o mestre.</p>';
  }
  function clicar(evt){
    var btn=evt.target&&evt.target.closest?evt.target.closest('[data-mig186-action]'):null;
    if(!btn||btn.getAttribute('data-mig186-action')!=='salvar'||salvando)return;
    var f=ficha(),modelo=M.identificar(f);
    if(!modelo)return root.alert('Identidade da ficha não reconhecida.');
    if(!doc.getElementById('mig186ConfirmarFicha').checked)return root.alert('Confirme a identidade da ficha antes de continuar.');
    var decisao={},linhas=painel.querySelectorAll('[data-mig186-id]');
    linhas.forEach(function(el){var marcado=el.querySelector('[data-mig186-confirmar]');if(!marcado||!marcado.checked)return;
      var tipo=el.querySelector('[data-mig186-tipo]'),alvo=el.querySelector('[data-mig186-alvo]'),aplicacao=el.querySelector('[data-mig186-aplicacao]'),obs=el.querySelector('[data-mig186-obs]');
      decisao[el.getAttribute('data-mig186-id')]={confirmar:true,tipoNatureza:tipo?tipo.value:'',alvoId:alvo?alvo.value:'',
        aplicacao:aplicacao?aplicacao.value:'',observacao:obs?obs.value:''};
    });
    var total=Object.keys(decisao).length;
    if(total<1)return root.alert('Marque pelo menos uma habilidade e informe sua situação.');
    var resultado;
    try{resultado=M.conciliar(f,modelo.id,decisao,E);}catch(err){return root.alert(err.message||'Não foi possível conciliar as habilidades.');}
    if(!resultado.confirmadas)return root.alert('Nenhuma aquisição nova para confirmar.');
    if(!root.confirm('Vincular '+resultado.confirmadas+' habilidade(s) à ficha '+modelo.nome+'? Nada será descontado nem aplicado novamente.'))return;
    if(typeof root.persistirEstadoLocal!=='function')return root.alert('Salvamento indisponível.');
    salvando=true;
    var anterior=f.pontosChaveV1;
    f.pontosChaveV1=resultado.registro;
    try{
      var ok=root.persistirEstadoLocal({confirmada:true,origem:'migracao-assistida-186',campo:'pontosChaveV1',
        antes:anterior,depois:resultado.registro,motivo:'conciliacao-suplemento-shinobi'});
      if(ok!==true){if(anterior===undefined)delete f.pontosChaveV1;else f.pontosChaveV1=anterior;
        root.alert('Falha no salvamento. Os registros foram restaurados.');return;}
      assinatura='';atualizar(true);
      if(root.ShinobiPontosChaveUI&&root.ShinobiPontosChaveUI.atualizar)root.ShinobiPontosChaveUI.atualizar();
      try{root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados',{detail:{motivo:'migracao-assistida-186'}}));}catch(_){}
      root.alert(resultado.confirmadas+' habilidade(s) vinculada(s) ao histórico. Nenhuma estatística foi alterada.');
    }catch(err){if(anterior===undefined)delete f.pontosChaveV1;else f.pontosChaveV1=anterior;
      root.alert('Não foi possível concluir a migração: '+(err.message||'erro desconhecido'));}
    finally{salvando=false;}
  }
  root.ShinobiMigracaoHabilidadesUI186={atualizar:iniciar};
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',iniciar);else iniciar();
  root.addEventListener('pageshow',iniciar);
  root.addEventListener('shinobi:app-pronto',iniciar);
  root.addEventListener('shinobi:pontos-chave-atualizados',function(){if(!salvando)iniciar();});
  root.addEventListener('shinobi:realtime-aplicado',function(){if(!salvando)iniciar();});
  root.addEventListener('shinobi:ficha-persistida',function(e){if(!salvando&&e.detail&&['pontosChaveV1','nome','cla','nivel'].indexOf(e.detail.campo)>=0)iniciar();});
})(typeof window!=='undefined'?window:null);
