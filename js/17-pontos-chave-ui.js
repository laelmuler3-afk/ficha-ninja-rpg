/* Shinobi 2.5.8.184 — área de Pontos-Chave no Perfil / Progressão.
 * Nenhum efeito de talento é aplicado diretamente à ficha nesta etapa.
 */
(function(root){
  "use strict";
  if(!root||!root.document||root.__shinobiPontosChaveUI184)return;
  root.__shinobiPontosChaveUI184=true;
  var doc=root.document,E=root.ShinobiPontosChave,P=root.ShinobiPreparacaoAtaques;
  if(!E)return;
  function escape(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
  function ficha(){try{return typeof estado!=="undefined"&&estado&&typeof estado==="object"?estado:null;}catch(_){return null;}}
  function idNovo(){try{if(root.crypto&&root.crypto.randomUUID)return root.crypto.randomUUID();}catch(_){}return "pc_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,12);}
  function numeroCampo(id){var el=doc.getElementById(id);return el?Number(el.value):NaN;}
  function valorCampo(id){var el=doc.getElementById(id);return el?String(el.value||"").trim():"";}
  function salvar(novo,motivo){
    var f=ficha();if(!f||typeof root.persistirEstadoLocal!=="function"){root.alert("A ficha não está disponível para salvamento.");return false;}
    var anterior=f.pontosChaveV1;
    f.pontosChaveV1=novo;
    var ok=root.persistirEstadoLocal({confirmada:true,origem:"pontos-chave",campo:"pontosChaveV1",antes:anterior,depois:novo,motivo:motivo});
    if(ok!==true){if(anterior===undefined)delete f.pontosChaveV1;else f.pontosChaveV1=anterior;root.alert("Falha ao salvar a transação. Nada foi confirmado.");return false;}
    atualizar();
    try{root.dispatchEvent(new CustomEvent("shinobi:pontos-chave-atualizados",{detail:{motivo:motivo}}));}catch(_){}
    return true;
  }
  function transacionar(entrada,motivo){
    var atual=ficha();if(!atual)return false;
    var reg=E.registro(atual),novo;
    try{novo=E.registrarEvento(atual,reg,Object.assign({id:idNovo()},entrada),{preparacao:P});}catch(e){root.alert(e.message||"Não foi possível registrar a operação.");return false;}
    return salvar(novo,motivo);
  }
  function formatarNumero(v){return Number.isFinite(v)?String(v):"—";}
  function criar(){
    if(doc.getElementById("shinobiPontos184"))return;
    var linha=doc.querySelector("#identidade .xpLinhaNova");if(!linha)return;
    var painel=doc.createElement("details");painel.id="shinobiPontos184";painel.className="shinobiPontos184";
    painel.innerHTML='<summary><span class="shinobiPontos184Titulo">Pontos-Chave <small>Histórico e evolução</small></span><span id="pontos184ResumoTopo" class="shinobiPontos184Tag">Conferir</span></summary>'+ 
      '<div class="shinobiPontos184Corpo">'+
      '<p class="shinobiPontos184Nota">Os saldos são estimativas até conferir gastos anteriores com o mestre. Os créditos seguem a tabela do livro e podem ser ajustados por decisão do mestre. Compras novas entram no saldo, mas seus efeitos ainda não são aplicados automaticamente à ficha.</p>'+ 
      '<div class="shinobiPontos184Saldos"><div><span>Pontos-chave (estimados)</span><strong id="pontos184SaldoChave">—</strong></div><div><span>Pontos de clã (estimados)</span><strong id="pontos184SaldoCla">—</strong></div></div>'+ 
      '<p id="pontos184Totais" class="shinobiPontos184Nota"></p>'+ 
      '<details class="shinobiPontos184Secao" open><summary>Adquirir ou registrar habilidade</summary><div class="shinobiPontos184Campos">'+
      '<label>Habilidade<select id="pontos184Habilidade"><option value="">Selecione uma habilidade</option>'+E.catalogo().map(function(x){return '<option value="'+escape(x.id)+'">'+escape(x.nome)+' · '+(x.custo==null?'custo pendente':x.custo+' pts')+'</option>';}).join("")+'</select></label>'+ 
      '<label>Nível de aquisição<input id="pontos184Nivel" type="number" min="1" max="20" inputmode="numeric"></label>'+ 
      '<label class="shinobiPontos184Largo">Escolhas / detalhes<input id="pontos184Detalhes" maxlength="240" placeholder="Ex.: Wakizaki, Foice Curta; Katon; Destreza"></label>'+ 
      '<label class="shinobiPontos184Largo">Natureza de Chakra<select id="pontos184TipoNatureza"><option value="nova-elemental">Aprender nova natureza elemental</option><option value="evolucao">Aumentar nível de natureza conhecida</option><option value="nova-nao-elemental">Outra nova natureza</option></select></label>'+ 
      '<label class="shinobiPontos184Check"><input id="pontos184TempoLivre" type="checkbox"> Confirmo que a aquisição ocorreu em tempo livre, fora de missão.</label>'+ 
      '</div><button class="shinobiPontos184Principal" type="button" data-pontos184="comprar">Comprar com pontos-chave</button><button class="shinobiPontos184Secundario" type="button" data-pontos184="historico">Registrar habilidade antiga sem débito</button>'+ 
      '<p class="shinobiPontos184Nota">Talentos antigos podem ser registrados como histórico, mas não devem ser comprados novamente. Requisitos conhecidos são verificados; efeitos e requisitos não catalogados ainda dependem do mestre.</p></details>'+ 
      '<details class="shinobiPontos184Secao"><summary>Conversão e créditos do mestre</summary><div class="shinobiPontos184Campos">'+
      '<label>Converter pontos de clã (1:2)<input id="pontos184Converter" type="number" min="1" max="100" value="1" inputmode="numeric"></label>'+ 
      '<div class="shinobiPontos184AcaoCampo"><button type="button" class="shinobiPontos184Secundario" data-pontos184="converter">Converter em pontos-chave</button></div>'+ 
      '<label>Alterar créditos no nível<input id="pontos184NivelAjuste" type="number" min="1" max="20" inputmode="numeric"></label>'+ 
      '<label>Tipo de pontos<select id="pontos184Bolsa"><option value="chave">Pontos-chave</option><option value="cla">Pontos de clã</option></select></label>'+ 
      '<label>Quantidade concedida nesse nível<input id="pontos184Credito" type="number" min="0" max="200" inputmode="numeric"></label>'+ 
      '<label class="shinobiPontos184Largo">Justificativa do mestre<input id="pontos184Motivo" maxlength="180" placeholder="Ex.: ajuste autorizado na campanha"></label>'+ 
      '</div><button type="button" class="shinobiPontos184Secundario" data-pontos184="ajustar">Registrar ajuste por nível</button>'+ 
      '<div class="shinobiPontos184Campos"><label>Gastos antigos já realizados<input id="pontos184GastoAntigo" type="number" min="0" inputmode="numeric"></label><label>Reserva usada<select id="pontos184BolsaAntiga"><option value="chave">Pontos-chave</option><option value="cla">Pontos de clã</option></select></label><label class="shinobiPontos184Largo">Descrição dos gastos antigos<input id="pontos184MotivoAntigo" maxlength="180" placeholder="Ex.: total pago por talentos já anotados na ficha"></label></div><button type="button" class="shinobiPontos184Secundario" data-pontos184="reconciliar">Reconciliar gasto anterior (sem reaplicar talentos)</button>'+ 
      '<p class="shinobiPontos184Nota">Cada novo ajuste substitui o valor anterior daquele nível. Esta tela registra a decisão informada; não autentica a identidade do mestre.</p></details>'+ 
      '<details class="shinobiPontos184Secao"><summary>Histórico e conferência</summary><div id="pontos184Historico" class="shinobiPontos184Historico"></div></details>'+ 
      '</div>';
    linha.insertAdjacentElement("afterend",painel);
    var nivel=doc.getElementById("pontos184Nivel"),ajuste=doc.getElementById("pontos184NivelAjuste");
    if(nivel)nivel.value=String(E.resumo(ficha()).nivel);
    if(ajuste)ajuste.value=String(E.resumo(ficha()).nivel);
    painel.addEventListener("click",clicar);
    painel.addEventListener("change",function(e){if(e.target.id==="pontos184Habilidade")alterarAjuda();});
    alterarAjuda();atualizar();
  }
  function alterarAjuda(){
    var h=E.habilidade(valorCampo("pontos184Habilidade")),el=doc.getElementById("pontos184Detalhes"),natureza=doc.getElementById("pontos184TipoNatureza");
    if(el&&h){
      var p={"armas-comuns":"Ex.: Wakizaki, Foice Curta (duas não especiais)","arma-especial":"Ex.: Agulha (uma especial)","atributo":"Ex.: Destreza","natureza":"Ex.: Katon","elemento":"Ex.: Fogo","tipo-ataque":"Ex.: ataques com armas"};
      el.placeholder=p[h.escolha]||"Observações opcionais sobre a aquisição";
    }
    if(natureza)natureza.closest("label").hidden=!h||h.escolha!=="natureza";
  }
  function atualizar(){
    var painel=doc.getElementById("shinobiPontos184");if(!painel)return;
    var f=ficha()||{},r=E.resumo(f);
    function set(id,val){var e=doc.getElementById(id);if(e)e.textContent=val;}
    set("pontos184ResumoTopo",formatarNumero(r.chaveDisponivel)+" estimados");
    set("pontos184SaldoChave",formatarNumero(r.chaveDisponivel));
    set("pontos184SaldoCla",formatarNumero(r.claDisponivel));
    set("pontos184Totais","Saldo teórico até conferir os gastos antigos · Até o nível "+r.nivel+": "+r.chaveRecebida+" pontos-chave concedidos, "+r.chaveGasta+" gastos; "+r.claRecebida+" pontos de clã concedidos, "+r.pontosClaConvertidos+" convertidos. "+r.legados+" registro(s) histórico(s) sem débito.");
    var host=doc.getElementById("pontos184Historico");if(!host)return;
    var eventos=E.registro(f).eventos,anulados={};eventos.forEach(function(e){if(e.tipo==="estorno")anulados[e.alvoId]=true;});
    var html=eventos.slice().reverse().map(function(e){
      var titulo="",valor="",estornado=!!anulados[e.id];
      if(e.tipo==="compra"){titulo=e.nome||e.habilidadeId;valor="−"+e.custo+" pontos-chave";}
      else if(e.tipo==="historico"){titulo="Histórico: "+(e.nome||e.habilidadeId);valor="Sem débito";}
      else if(e.tipo==="conversao"){titulo="Conversão de clã";valor="−"+e.quantidade+" de clã, +"+(2*e.quantidade)+" chave";}
      else if(e.tipo==="ajuste-nivel"){titulo="Crédito definido no nível "+e.nivel;valor=e.quantidade+" pontos de "+(e.bolsa==="cla"?"clã":"chave");}
      else if(e.tipo==="credito-extra"){titulo="Crédito extra";valor="+"+e.quantidade+" de "+(e.bolsa==="cla"?"clã":"chave");}
      else if(e.tipo==="despesa-antiga"){titulo="Revisão de gasto anterior";valor="−"+e.custo+" de "+(e.bolsa==="cla"?"clã":"chave");}
      else if(e.tipo==="estorno"){titulo="Estorno";valor="Transação "+e.alvoId;}
      var botao=e.tipo!=="estorno"&&!estornado?'<button type="button" data-pontos184="estornar" data-id="'+escape(e.id)+'" aria-label="Estornar registro">Estornar</button>':"";
      return '<div class="shinobiPontos184Linha"><div><strong>'+escape(titulo)+'</strong><small>'+escape(valor)+(estornado?' · ESTORNADO':'')+'</small></div>'+botao+'</div>';
    }).join("");
    var antigos=(f.automacaoAtaques&&f.automacaoAtaques.aquisicoes)||[];
    if(Array.isArray(antigos)&&antigos.length)html+='<p class="shinobiPontos184Nota">'+antigos.length+' registro(s) da preparação anterior foram preservados, sem custos retroativos.</p>';
    host.innerHTML=html||'<p class="shinobiPontos184Nota">Nenhuma operação registrada ainda.</p>';
  }
  function clicar(ev){
    var btn=ev.target&&ev.target.closest?ev.target.closest("[data-pontos184]"):null;if(!btn)return;
    var acao=btn.getAttribute("data-pontos184"),f=ficha();if(!f)return;
    if(acao==="comprar"||acao==="historico"){
      var id=valorCampo("pontos184Habilidade"),nivel=numeroCampo("pontos184Nivel"),detalhes=valorCampo("pontos184Detalhes");
      var h=E.habilidade(id);if(!h)return root.alert("Selecione uma habilidade.");
      if(acao==="comprar"){
        if(!doc.getElementById("pontos184TempoLivre").checked)return root.alert("Confirme a aquisição em tempo livre antes de comprar.");
        var avaliacao;try{avaliacao=E.avaliarCompra(f,E.registro(f),{habilidadeId:id,nivel:nivel,detalhes:detalhes,tipoNatureza:valorCampo("pontos184TipoNatureza")},{preparacao:P});}catch(e){return root.alert(e.message);}
        if(!root.confirm("Comprar "+h.nome+" por "+avaliacao.custo+" pontos-chave? A aquisição será registrada, mas os efeitos ainda NÃO serão aplicados automaticamente."))return;
        if(transacionar({tipo:"compra",habilidadeId:id,nivel:nivel,detalhes:detalhes,tipoNatureza:valorCampo("pontos184TipoNatureza")},"compra-habilidade")){doc.getElementById("pontos184Detalhes").value="";doc.getElementById("pontos184TempoLivre").checked=false;}
      }else{
        if(!root.confirm("Registrar "+h.nome+" como habilidade anterior, sem descontar pontos? Não deve ser usada para novas compras."))return;
        transacionar({tipo:"historico",habilidadeId:id,nivel:nivel,detalhes:detalhes},"historico-habilidade");
      }
    }else if(acao==="converter"){
      var quant=numeroCampo("pontos184Converter");if(!root.confirm("Converter "+quant+" ponto(s) de clã em "+(2*quant)+" ponto(s)-chave?"))return;
      transacionar({tipo:"conversao",quantidade:quant},"converter-pontos-cla");
    }else if(acao==="ajustar"){
      var n=numeroCampo("pontos184NivelAjuste"),q=numeroCampo("pontos184Credito"),bolsa=valorCampo("pontos184Bolsa"),motivo=valorCampo("pontos184Motivo");
      if(!root.confirm("Registrar decisão do mestre: conceder "+q+" pontos de "+(bolsa==="cla"?"clã":"chave")+" no nível "+n+"? Substituirá o valor anterior deste nível."))return;
      transacionar({tipo:"ajuste-nivel",nivel:n,quantidade:q,bolsa:bolsa,motivo:motivo},"ajuste-credito-mestre");
    }else if(acao==="reconciliar"){
      var gasto=numeroCampo("pontos184GastoAntigo"),reserva=valorCampo("pontos184BolsaAntiga"),razao=valorCampo("pontos184MotivoAntigo");
      if(!root.confirm("Registrar "+gasto+" ponto(s) de "+(reserva==="cla"?"clã":"chave")+" como despesas ANTERIORES já realizadas? Não altera talentos nem atributos."))return;
      transacionar({tipo:"despesa-antiga",custo:gasto,bolsa:reserva,motivo:razao},"reconciliar-gasto-antigo");
    }else if(acao==="estornar"){
      var alvo=btn.getAttribute("data-id");if(!root.confirm("Estornar esta transação? O histórico será preservado e o saldo será recalculado."))return;
      transacionar({tipo:"estorno",alvoId:alvo},"estorno-pontos-chave");
    }
  }
  function iniciar(){criar();atualizar();}
  root.ShinobiPontosChaveUI={versao:"2.5.8.184",atualizar:iniciar};
  if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",iniciar);else iniciar();
  root.addEventListener("pageshow",iniciar);
  root.addEventListener("shinobi:app-pronto",iniciar);
  root.addEventListener("shinobi:ficha-persistida",function(e){if(e.detail&&["pontosChaveV1","automacaoAtaques","nivel","cla","progressaoFixa"].indexOf(e.detail.campo)>=0)iniciar();});
  root.addEventListener("shinobi:realtime-aplicado",function(e){if(!e.detail||!Array.isArray(e.detail.campos)||e.detail.campos.some(function(c){return ["pontosChaveV1","automacaoAtaques","nivel","cla"].indexOf(c)>=0;}))iniciar();});
})(typeof window!=="undefined"?window:null);
