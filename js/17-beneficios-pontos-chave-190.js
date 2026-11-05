/* Shinobi 2.5.8.190 — efetivação segura de benefícios confirmados.
 * Lê as aquisições existentes; não reimporta nem debita pontos.
 * Somente "não aplicado" é elegível para benefício adicional.
 * Uma efetivação de atributo exige confirmação e grava atributo+evento no mesmo snapshot local.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiBeneficiosPontos190=api;
  if(root&&root.document)api.instalar(root);
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this),function(){
  'use strict';
  var VERSAO='2.5.8.190';
  var ATRIBUTOS={forca:'Força',destreza:'Destreza',constituicao:'Constituição',inteligencia:'Inteligência',sabedoria:'Sabedoria',carisma:'Carisma'};
  function copia(o){return JSON.parse(JSON.stringify(o));}
  function texto(x){return String(x==null?'':x).trim();}
  function normal(x){return texto(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function registro(f){var r=f&&f.pontosChaveV1;return {versao:1,eventos:Array.isArray(r&&r.eventos)?copia(r.eventos):[]};}
  function cancelados(reg){return new Set(reg.eventos.filter(function(e){return e&&e.tipo==='estorno';}).map(function(e){return texto(e.alvoId);}));}
  function efetivacoes(f){var reg=registro(f),anulados=cancelados(reg),ativos=new Map();
    reg.eventos.forEach(function(e){if(e&&e.tipo==='efetivacao-beneficio'&&!anulados.has(texto(e.id)))ativos.set(texto(e.alvoId),e);});return ativos;
  }
  function compras(f,livro){if(!livro||typeof livro.resumo!=='function')return [];
    var r=livro.resumo(f),mapa=efetivacoes(f);return (r.compras||[]).map(function(c){var item=Object.assign({},c);var ev=mapa.get(texto(c.id));
      item.efetivacao190=ev||null;item.aplicacao190=ev?'efetivado':texto((c.escolhas||{}).aplicacao)||'sem-conferencia';return item;});
  }
  function candidatos(f,livro){return compras(f,livro).filter(function(c){return !!c.habilidadeId;});}
  function temConfirmadaNaoAplicada(f,livro,id){return candidatos(f,livro).some(function(c){return c.habilidadeId===id&&c.aplicacao190==='nao-aplicado';});}
  function bonusAlerta(f,livro){return temConfirmadaNaoAplicada(f,livro,'alerta')?5:0;}
  function bonusNinjutsuMelhoradoI(f,livro,regra){
    if(!temConfirmadaNaoAplicada(f,livro,'ninjutsu_melhorado_1'))return 0;
    if(!regra||!regra.natureza||Number(regra.nivel)<1)return 0;
    var mod=Number(regra.conjuracao&&regra.conjuracao.modificador);
    return Number.isFinite(mod)?mod:0;
  }
  function tetoAtributo(f,atributo){var cla=normal(f&&f.cla),especiais={akimichi:'constituicao',lee:'forca',nara:'inteligencia',izuna:'carisma',yamanaka:'sabedoria'};
    return especiais[cla]===atributo?24:20;
  }
  function prepararAtributo(f,livro,id){
    var c=candidatos(f,livro).find(function(x){return texto(x.id)===texto(id);});
    if(!c||c.habilidadeId!=='melhoria_atributo')throw new Error('Selecione uma compra confirmada de Melhoria de Atributo.');
    if(c.aplicacao190!=='nao-aplicado')throw new Error('A melhoria já foi aplicada, está incerta ou ainda precisa ser confirmada.');
    var escolha=c.escolhas||{},at=texto(escolha.alvoId);
    if(escolha.alvoTipo!=='atributo'||!Object.prototype.hasOwnProperty.call(ATRIBUTOS,at))throw new Error('Escolha primeiro o atributo beneficiado no reconhecimento do suplemento.');
    var atual=Number(f[at]),teto=tetoAtributo(f,at);
    if(!Number.isInteger(atual)||atual<1||atual>=teto)throw new Error('O atributo atual é inválido ou já atingiu o limite permitido ('+teto+').');
    var reg=registro(f),eventoId='ef190_'+texto(id).replace(/[^a-zA-Z0-9_-]/g,'_');
    if(reg.eventos.some(function(e){return e&&e.id===eventoId;}))throw new Error('Esta melhoria já possui um registro de efetivação.');
    reg.eventos.push({id:eventoId,tipo:'efetivacao-beneficio',alvoId:texto(id),habilidadeId:c.habilidadeId,origem:'confirmacao-beneficio-190',
      campo:at,antes:atual,depois:atual+1,criadoEm:new Date().toISOString(),
      observacao:'Benefício aplicado uma vez, com confirmação do usuário. Não estornar sem conciliar o atributo.'});
    return {compraId:texto(id),campo:at,nome:ATRIBUTOS[at],antes:atual,depois:atual+1,novoRegistro:reg};
  }
  function classificar(c){
    var s=c.aplicacao190;
    if(s==='efetivado')return 'Aplicado e registrado';
    if(s==='ja-aplicado')return 'Já aplicado manualmente — preservado';
    if(s==='incerto')return 'Aguardando conferência';
    if(s==='nao-aplicado'&&c.habilidadeId==='melhoria_atributo')return 'Pode aplicar +1 após confirmar';
    if((s==='nao-aplicado'||(s==='sem-conferencia'&&c.tipo==='compra'))&&c.habilidadeId==='melhoria_vida')return 'Informe o dado de Vida e confirme o aumento do PV máximo';
    if((s==='nao-aplicado'||(s==='sem-conferencia'&&c.tipo==='compra'))&&c.habilidadeId==='melhoria_chakra')return 'Confirme o dado de Chakra maximizado para aumentar o EKO máximo';
    if(s==='nao-aplicado'&&['alerta','ninjutsu_melhorado_1','ninjutsu_aprimorado','duelista','pontaria','combate_com_duas_armas','especialista_em_shuriken'].indexOf(c.habilidadeId)>=0)return 'Benefício derivado (quando elegível)';
    if(s==='nao-aplicado')return 'Benefício ainda não integrado — mantido pendente';
    return 'Aquisição registrada — confirmar aplicação e destino';
  }
  function instalar(root){
    if(root.__shinobiBeneficios190Instalado)return;root.__shinobiBeneficios190Instalado=true;
    var doc=root.document,guardando=false,assinatura='';
    function ficha(){try{return typeof estado!=='undefined'&&estado&&typeof estado==='object'?estado:null;}catch(_){return null;}}
    function esc(s){return texto(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
    function montar(){
      var host=doc.querySelector('#shinobiPontos184 .shinobiPontos184Corpo'),f=ficha();if(!host||!f)return;
      var painel=doc.getElementById('shinobiBeneficios190');
      if(!painel){painel=doc.createElement('details');painel.id='shinobiBeneficios190';painel.className='shinobiPontos184Secao beneficio190';
        painel.innerHTML='<summary>Benefícios reconhecidos <span class="beneficio190Contador">Conferir</span></summary><div class="beneficio190Conteudo"></div>';
        var migracao=doc.getElementById('mig186');if(migracao)migracao.insertAdjacentElement('afterend',painel);else host.insertBefore(painel,host.firstElementChild);
        painel.addEventListener('click',function(ev){
          var botao=ev.target.closest('[data-b190-ativar]');if(!botao||guardando)return;
          var fichaAtual=ficha(),livro=root.ShinobiPontosChave;if(!fichaAtual||!livro)return;
          var operacao;try{operacao=prepararAtributo(fichaAtual,livro,botao.getAttribute('data-b190-ativar'));}
          catch(e){return root.alert(e.message);}
          if(!root.confirm('Aplicar '+operacao.nome+' '+operacao.antes+' → '+operacao.depois+'?\n\nIsso altera o atributo uma única vez e registra a origem nos Pontos-Chave. NÃO confirme se já recebeu o +1 manualmente.'))return;
          if(typeof root.persistirEstadoLocal!=='function')return root.alert('Salvamento da ficha indisponível.');
          guardando=true;
          var anterior=fichaAtual.pontosChaveV1,antigo=fichaAtual[operacao.campo],campo=doc.querySelector('[data-save="'+operacao.campo+'"]');
          if(campo&&campo.dataset.shinobiEdicaoPendente==='1'){
            guardando=false;return root.alert('Existe uma edição não salva neste atributo. Confirme ou descarte a edição antes de aplicar a habilidade.');
          }
          try{
            fichaAtual[operacao.campo]=String(operacao.depois);fichaAtual.pontosChaveV1=operacao.novoRegistro;
            var salvo=root.persistirEstadoLocal({confirmada:true,origem:'beneficios-pontos-190',
              campos:[operacao.campo,'pontosChaveV1'],motivo:'melhoria-atributo-efetivada'});
            if(salvo!==true)throw new Error('O salvamento falhou. Nenhum benefício foi confirmado.');
            if(campo){campo.value=String(operacao.depois);campo.dataset.shinobiValorConfirmado=String(operacao.depois);campo.dataset.shinobiEdicaoPendente='0';}
            assinatura='';atualizar();
            if(typeof root.atualizarPerfil==='function')root.atualizarPerfil();
            if(typeof root.atualizarPlacar==='function')root.atualizarPlacar();
            if(typeof root.renderizarArmados==='function')root.renderizarArmados();
            if(typeof root.renderizarJutsus==='function')root.renderizarJutsus();
            try{root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados',{detail:{motivo:'beneficio190'}}));}catch(_){}
            root.alert('Melhoria aplicada uma vez e registrada no histórico.');
          }catch(e){fichaAtual[operacao.campo]=antigo;if(anterior===undefined)delete fichaAtual.pontosChaveV1;else fichaAtual.pontosChaveV1=anterior;root.alert('Não foi possível aplicar a melhoria: '+e.message);}
          finally{guardando=false;}
        });
      }
      atualizar();
    }
    function atualizar(){
      var painel=doc.getElementById('shinobiBeneficios190'),f=ficha(),livro=root.ShinobiPontosChave;if(!painel||!f||!livro)return;
      var lista=candidatos(f,livro),id=texto(f.nome)+'|'+texto(f.cla)+'|'+String((f.pontosChaveV1&&f.pontosChaveV1.eventos||[]).map(function(e){return e.id;}).join(','))+'|'+String((f.automacaoAtaques&&f.automacaoAtaques.aquisicoes||[]).length);
      if(id===assinatura)return;assinatura=id;
      var perito=root.ShinobiPerito199;
      var pendentes=lista.filter(function(c){return !(c.habilidadeId==='perito'&&perito&&perito.evento(f,c.id))&&(c.aplicacao190==='nao-aplicado'||c.aplicacao190==='incerto'||c.aplicacao190==='sem-conferencia');}).length;
      var badge=painel.querySelector('.beneficio190Contador');if(badge)badge.textContent=pendentes?pendentes+' a revisar':'Em dia';
      var body=painel.querySelector('.beneficio190Conteudo');if(!body)return;
      var html='<p>As habilidades são reconhecidas por aquisição. <strong>Já aplicado</strong> mantém os valores manuais; <strong>Ainda não aplicado</strong> libera apenas os cálculos implementados.</p>';
      html+='<p>Atributos pendentes podem receber +1 com confirmação. A ação registra a efetivação e preserva os demais valores da ficha.</p>';
      html+=lista.map(function(c){var situacao=classificar(c),op=c.escolhas||{},botao='';
        if(c.habilidadeId==='melhoria_atributo'&&c.aplicacao190==='nao-aplicado'&&op.alvoTipo==='atributo'&&Object.prototype.hasOwnProperty.call(ATRIBUTOS,texto(op.alvoId)))
          botao='<button class="beneficio190Aplicar" type="button" data-b190-ativar="'+esc(c.id)+'">Aplicar +1 em '+esc(ATRIBUTOS[op.alvoId])+'</button>';
        if(c.habilidadeId==='melhoria_vida'&&(c.aplicacao190==='nao-aplicado'||(c.aplicacao190==='sem-conferencia'&&c.tipo==='compra')))
          botao='<div class="beneficio198Rolagem"><label>Resultado do dado <input type="number" min="1" max="20" inputmode="numeric" data-b198-rolagem aria-label="Resultado do dado de Vida"></label><button type="button" class="beneficio190Aplicar" data-b198-vida="'+esc(c.id)+'">Aplicar aos PV máximos</button></div>';
        if(c.habilidadeId==='melhoria_chakra'&&(c.aplicacao190==='nao-aplicado'||(c.aplicacao190==='sem-conferencia'&&c.tipo==='compra')))
          botao='<button type="button" class="beneficio190Aplicar" data-b201-chakra="'+esc(c.id)+'">Aplicar dado máximo ao EKO máximo</button>';
        if(c.habilidadeId==='perito'&&perito){
          var selecionadas=perito.resumoCompra(f,c.id);
          if(selecionadas)situacao='Proficiências confirmadas: '+selecionadas;
          else if(perito.podeConfigurar(f,livro,c.id)){
            situacao='Escolha três perícias ou ferramentas';
            botao+=perito.formulario(c.id);
          }
        }
        return '<div class="beneficio190Linha"><strong>'+esc(c.nome||c.habilidadeId)+'</strong><small>'+esc(situacao)+(op.alvoNome?' · '+esc(op.alvoNome):'')+'</small>'+botao+'</div>';
      }).join('');
      if(!lista.length)html+='<p>Não há compras confirmadas. Use “Reconhecer habilidades antigas” acima.</p>';
      html+='<p class="beneficio190Aviso">Os usos de Ninjutsu Melhorado II são controlados na carta e no descanso longo. Melhoria de Vida aumenta PV máximo após rolagem; Melhoria de Chakra acrescenta o dado máximo ao EKO máximo após confirmação. Outros benefícios ainda pendentes permanecem sem aplicação.</p>';
      body.innerHTML=html;
    }
    root.ShinobiBeneficiosPontosUI190={atualizar:montar};
    if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',montar);else montar();
    root.addEventListener('pageshow',function(){assinatura='';montar();});
    root.addEventListener('shinobi:app-pronto',function(){assinatura='';montar();});
    root.addEventListener('shinobi:pontos-chave-atualizados',function(){assinatura='';montar();});
    root.addEventListener('shinobi:realtime-aplicado',function(){assinatura='';montar();});
    root.addEventListener('shinobi:ficha-persistida',function(e){if(!guardando&&e.detail&&['pontosChaveV1','nome','cla','nivel'].indexOf(e.detail.campo)>=0){assinatura='';montar();}});
    root.addEventListener('shinobi:realtime-colecao-aplicada',function(){assinatura='';montar();});
  }
  return Object.freeze({versao:VERSAO,compras:compras,candidatos:candidatos,efetivacoes:efetivacoes,
    temConfirmadaNaoAplicada:temConfirmadaNaoAplicada,bonusAlerta:bonusAlerta,
    bonusNinjutsuMelhoradoI:bonusNinjutsuMelhoradoI,tetoAtributo:tetoAtributo,
    prepararAtributo:prepararAtributo,classificar:classificar,instalar:instalar});
});
