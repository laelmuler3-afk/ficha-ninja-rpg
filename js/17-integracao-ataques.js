/* Projetinho Shinobi — 2.5.8.185.
 * Integração: catálogo e pontos-chave com exibição calculada opt-in por ataque.
 * Não altera os valores manuais originais nem aplica bônus temporários ou débitos.
 */
(function (root) {
  "use strict";
  if (!root || !root.document || root.__shinobiIntegracaoAtaques181) return;
  root.__shinobiIntegracaoAtaques181 = true;
  var doc = root.document;
  var P = root.ShinobiPreparacaoAtaques;
  var C = root.ShinobiCalculosConfirmados;
  var A = root.ShinobiAtaquesAutomaticos;
  var L = root.ShinobiPontosChave;
  if (!P) { console.warn("Shinobi: módulo do catálogo ainda não carregado."); return; }

  var REGRAS_PENDENTES = "Somente exceções de proficiências antigas ou concedidas pelo mestre; novas compras ficam em Perfil → Pontos-Chave.";
  var TIPOS_ORIGEM = [
    ["pontos-chave", "Pontos-chave"],
    ["pontos-de-cla", "Pontos de clã"],
    ["inicial", "Inicial / criação de ficha"],
    ["habilidade", "Outra habilidade"],
    ["mestre", "Concessão do mestre"],
    ["ficha-antiga", "Importada da ficha antiga"]
  ];

  function h(valor) { return String(valor == null ? "" : valor).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function n(valor) { return String(valor == null ? "" : valor).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g," ").trim(); }
  function ficha() { try { return typeof estado !== "undefined" && estado && typeof estado === "object" ? estado : null; } catch (_e) { return null; } }
  function dados() { return P.lerEstrutura(ficha()); }
  function descricaoOrigem(id) { var item = TIPOS_ORIGEM.find(function (tipo) { return tipo[0] === id; }); return item ? item[1] : String(id || "Origem não informada"); }
  function idNovo() {
    try { if (root.crypto && root.crypto.randomUUID) return root.crypto.randomUUID(); } catch (_e) {}
    return "reg_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,12);
  }
  function confirmar(titulo,descricao) {
    if (typeof root.modalShinobi === "function") return root.modalShinobi(titulo,descricao);
    return Promise.resolve(root.confirm(descricao));
  }
  function alterar(preparar, motivo) {
    var atual = ficha();
    if (!atual || typeof root.persistirEstadoLocal !== "function") { root.alert("Não foi possível acessar o estado da ficha."); return false; }
    var antigo = atual.automacaoAtaques;
    var novo = dados();
    try { preparar(novo); } catch (erro) { root.alert(erro.message || "Registro inválido."); return false; }
    atual.automacaoAtaques = novo;
    var ok = root.persistirEstadoLocal({confirmada:true,origem:"preparacao-ataques",campo:"automacaoAtaques",motivo:motivo||"registro-preparatorio"});
    if (ok !== true) { if (antigo === undefined) delete atual.automacaoAtaques; else atual.automacaoAtaques = antigo; return false; }
    atualizarPainel();
    atualizarCards();
    return true;
  }

  function origemProficiencia(armaId,registro) {
    if (!armaId) return {rotulo:"Arma não identificada",estado:"incerto"};
    if (armaId === "kunai" || armaId === "shuriken") return {rotulo:"Proficiência inicial (PDF, p. 1)",estado:"inicial"};
    var ledger = root.ShinobiPontosChave;
    if (ledger && ledger.proficiencias(ficha()).indexOf(armaId) >= 0) return {rotulo:"Proficiência adquirida em Pontos-Chave (compra registrada)",estado:"registrada"};
    var entrada = (registro.proficienciasExtras || []).find(function (p) { return p && p.armaId === armaId; });
    return entrada ? {rotulo:"Registrada: " + descricaoOrigem(entrada.origem) + " (a confirmar)",estado:"registrada"} :
      {rotulo:"Proficiência não registrada",estado:"incerto"};
  }
  function noInventario(ataque,armaId) {
    var atual = ficha() || {};
    var itens = Array.isArray(atual.inventarioItens) ? atual.inventarioItens : [];
    var referencia = String(ataque && ataque.itemInventario || "").trim();
    if (!referencia) return {tipo:"nao-vinculado",rotulo:"Sem item de inventário vinculado"};
    var encontrado = itens.find(function (item) {
      return n(item && item.nome) === n(referencia) ||
        (!!armaId && !!P.obterArma(item && item.nome) && P.obterArma(item.nome).id === armaId);
    });
    return encontrado ? {tipo:"encontrado",rotulo:"Inventário: " + String(encontrado.nome || referencia) + " (qtd. " + String(encontrado.quantidade == null ? "?" : encontrado.quantidade) + ")"} :
      {tipo:"ausente",rotulo:"Item vinculado não encontrado no inventário: " + referencia};
  }
  function relatorioAtaque(ataque) {
    var catalogo = P.identificarAtaque(ataque);
    var id = catalogo && catalogo.id;
    var reg = dados();
    return {catalogo:catalogo,proficiencia:origemProficiencia(id,reg),inventario:ataque && ataque.tipo === "desarmado" ? null : noInventario(ataque,id),previa:C ? C.calcularPrevia(ficha(),ataque,P) : null};
  }
  function elemento(tag,classe,texto) {
    var el = doc.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }
  function atualizarCards() {
    var lista = doc.getElementById("listaArmados"), atual = ficha();
    if (!lista || !atual) return;
    var registros = Array.isArray(atual.armados) ? atual.armados : [];
    var cards = lista.querySelectorAll(".ataqueListaCard");
    Array.prototype.forEach.call(cards,function (card, i) {
      var ataque = registros[i];
      if (!ataque) return;
      var bloco = card.querySelector(".shinobiAtaqueMetadados");
      if (!bloco) {
        var destino = card.querySelector(".ataqueDetalhesCompactos");
        if (!destino) return;
        var recolhivel = elemento("details","shinobiReferencia183");
        recolhivel.appendChild(elemento("summary","shinobiReferenciaTitulo183","Regras, proficiência e prévia automática"));
        bloco = elemento("section","shinobiAtaqueMetadados");
        bloco.setAttribute("aria-label","Referência de regras do ataque");
        recolhivel.appendChild(bloco);
        destino.appendChild(recolhivel);
      }
      var rel = relatorioAtaque(ataque);
      if (A) atualizarCalculoOficial(card,ataque,i);
      bloco.textContent = "";
      var titulo = elemento("strong","shinobiMetaTitulo", "Referência da arma e prévia de cálculo");
      bloco.appendChild(titulo);
      if (!rel.catalogo) {
        bloco.appendChild(elemento("p","shinobiMetaLinha", "Ataque personalizado: sem referência automática no catálogo."));
      } else {
        var arma = rel.catalogo;
        var props = Array.isArray(arma.propriedades) ? arma.propriedades.join(", ") : "";
        var texto = arma.id === "desarmado" ? "Ataque desarmado: padrão 1d6 + FOR (exceções por clã)." :
          arma.nome + " · dano base " + (arma.dano || "não informado") + (arma.tipoDano ? " " + arma.tipoDano : "") + (props ? " · " + props : "");
        bloco.appendChild(elemento("p","shinobiMetaLinha",texto));
        if (arma.observacao) bloco.appendChild(elemento("p","shinobiMetaLinha",arma.observacao));
        if (arma.id === "agulha") bloco.appendChild(elemento("p","shinobiMetaLinha shinobiMetaPendente","Agulha Especial: preserve a proficiência antiga até a migração autorizada pelo mestre."));
      }
      bloco.appendChild(elemento("p","shinobiMetaLinha " + (rel.proficiencia.estado === "incerto" ? "shinobiMetaPendente" : ""),rel.proficiencia.rotulo));
      if (rel.inventario) bloco.appendChild(elemento("p","shinobiMetaLinha",rel.inventario.rotulo));
      if (rel.previa) {
        var previa = rel.previa;
        var resumo = elemento("div","shinobiPreviaBloco");
        resumo.appendChild(elemento("strong","shinobiPreviaTitulo","Prévia automática (sem salvar)"));
        if (previa.status === "calculado") {
          previa.variantes.forEach(function (v) {
            var acerto = previa.proficiencia === "confirmada" ? "d20 " + (v.acertoComProficiencia>=0?"+ ":"− ") + Math.abs(v.acertoComProficiencia) :
              "d20 " + (v.acertoSemProficiencia>=0?"+ ":"− ") + Math.abs(v.acertoSemProficiencia) +
              " / c/PRO " + (v.acertoComProficiencia>=0?"+ ":"− ") + Math.abs(v.acertoComProficiencia);
            resumo.appendChild(elemento("p","shinobiPreviaFormula",v.modo + " · Acerto " + acerto + " · Dano " + v.dano + (v.danoCritico ? " · Crítico " + v.danoCritico : "")));
          });
        } else {
          resumo.appendChild(elemento("p","shinobiPreviaPendente","Prévia incompleta: faltam dados ou confirmação da regra."));
        }
        (previa.avisos||[]).forEach(function (aviso) { resumo.appendChild(elemento("small","shinobiPreviaNota",aviso)); });
        bloco.appendChild(resumo);
      }
      bloco.appendChild(elemento("small","shinobiMetaAviso","O modo automático é uma visualização calculada; os campos manuais originais são preservados."));
      if (rel.catalogo && rel.catalogo.id !== "desarmado") {
        var botao = elemento("button","shinobiMetaBotao","Registrar origem de proficiência");
        botao.type = "button";
        botao.dataset.shinobi = "ir-proficiencia";
        botao.dataset.armaId = rel.catalogo.id;
        bloco.appendChild(botao);
      }
    });
  }

  function atualizarCalculoOficial(card,ataque,indice) {
    var atual=ficha(),arma=P.identificarAtaque(ataque),calc=A.calcular(atual,ataque,P,C,L),cfg=calc.configuracao;
    var destino=card.querySelector(".ataqueDetalhesCompactos");
    var acerto=card.querySelector(".ataqueBatalha183 .ataqueValor183:first-child strong");
    var dano=card.querySelector(".ataqueBatalha183 .ataqueValor183:nth-child(2) strong");
    if(!destino||!acerto||!dano)return;
    if(!acerto.hasAttribute("data-manual185"))acerto.setAttribute("data-manual185",acerto.textContent);
    if(!dano.hasAttribute("data-manual185"))dano.setAttribute("data-manual185",dano.textContent);
    if(cfg.ativo&&calc.status==="calculado"){
      acerto.textContent=(calc.acerto>=0?"+":"")+calc.acerto;
      dano.textContent=calc.dano;
    }else{
      acerto.textContent=acerto.getAttribute("data-manual185");
      dano.textContent=dano.getAttribute("data-manual185");
    }
    var selo=card.querySelector(".shinobiAuto185Selo");
    if(!selo){selo=elemento("small","shinobiAuto185Selo");card.querySelector(".ataqueBatalha183").appendChild(selo);}
    selo.textContent=cfg.ativo&&calc.status==="calculado"?"Cálculo automático · sem alterar seus valores salvos":cfg.ativo?"Automação indisponível: mostrando valor manual":"Valores manuais";
    card.classList.toggle("shinobiAutomatico185",cfg.ativo&&calc.status==="calculado");
    var painel=card.querySelector(".shinobiAuto185Painel");
    if(!painel){
      painel=elemento("details","shinobiAuto185Painel");
      painel.innerHTML='<summary>Automação de acerto e dano</summary><div class="shinobiAuto185Campos">'+
        '<label class="shinobiAuto185Check"><input type="checkbox" data-auto185="ativo"> Usar cálculo automático neste ataque</label>'+
        '<label>Atributo<select data-auto185="atributo"><option value="">Atributo padrão</option><option value="forca">Força</option><option value="destreza">Destreza</option></select></label>'+
        '<label>Tipo de golpe<select data-auto185="modo"><option value="corpo-a-corpo">Corpo a corpo</option><option value="arremesso">Arremesso</option><option value="distancia">Disparo à distância</option><option value="secundaria">Arma secundária (ação bônus)</option></select></label>'+
        '<label>Empunhadura<select data-auto185="empunhadura"><option value="uma">Uma mão</option><option value="duas">Duas mãos</option></select></label>'+
        '<label class="shinobiAuto185Check"><input type="checkbox" data-auto185="outraArma"> Outra arma na mão livre (sem Duelista)</label>'+
        '</div><div class="shinobiAuto185Resultado" aria-live="polite"></div>';
      destino.insertBefore(painel,destino.firstChild);
    }
    painel.querySelector('[data-auto185="ativo"]').checked=cfg.ativo;
    ["atributo","modo","empunhadura"].forEach(function(chave){painel.querySelector('[data-auto185="'+chave+'"]').value=cfg[chave];});
    painel.querySelector('[data-auto185="outraArma"]').checked=cfg.outraArma;
    var box=painel.querySelector(".shinobiAuto185Resultado");box.textContent="";
    if(calc.status==="calculado"){
      box.appendChild(elemento("p","","Acerto "+(calc.acerto>=0?"+":"")+calc.acerto+" · Dano "+calc.dano+(calc.critico?" · Crítico "+calc.critico:"")));
      box.appendChild(elemento("small","","Ação Atacar: "+calc.ataquesPorAcao+" golpe(s) por ação; jutsus e ações bônus têm regras próprias."));
      calc.detalhes.forEach(function(t){box.appendChild(elemento("small","",t));});
      calc.avisos.forEach(function(t){box.appendChild(elemento("small","shinobiAuto185Pendente",t));});
    }else box.appendChild(elemento("p","shinobiAuto185Pendente",calc.motivo+" Use valores manuais até a confirmação."));
  }
  function salvarModoAutomatico(el) {
    var card=el.closest(".ataqueListaCard"),f=ficha();
    if(!card||!f||!Array.isArray(f.armados)||typeof root.persistirEstadoLocal!=="function")return;
    var i=Number(card.getAttribute("data-ataque-index")),ataque=f.armados[i];if(!ataque)return;
    var bloco=card.querySelector(".shinobiAuto185Painel");if(!bloco)return;
    var proximo={ativo:bloco.querySelector('[data-auto185="ativo"]').checked,
      atributo:bloco.querySelector('[data-auto185="atributo"]').value,
      modo:bloco.querySelector('[data-auto185="modo"]').value,
      empunhadura:bloco.querySelector('[data-auto185="empunhadura"]').value,
      outraArma:bloco.querySelector('[data-auto185="outraArma"]').checked};
    var temp=Object.assign({},ataque,{calculoAtaque185:proximo});
    var calculo=A.calcular(f,temp,P,C,L);
    if(proximo.ativo&&calculo.status!=="calculado"){
      root.alert("Ainda não é seguro automatizar este ataque: "+calculo.motivo);
      atualizarCalculoOficial(card,ataque,i);return;
    }
    if(proximo.ativo&&!ataque.calculoAtaque185?.ativo&&
        !root.confirm("Ativar cálculo automático para "+(ataque.nome||"este ataque")+"? Os valores manuais serão mantidos e poderão ser recuperados ao desativar.")){
      atualizarCalculoOficial(card,ataque,i);return;
    }
    var anterior=ataque.calculoAtaque185;
    ataque.calculoAtaque185=proximo;
    var ok=root.persistirEstadoLocal({confirmada:true,origem:"ataques-automaticos",campo:"armados",motivo:"configuracao-calculo-confirmada"});
    if(ok!==true){if(anterior===undefined)delete ataque.calculoAtaque185;else ataque.calculoAtaque185=anterior;root.alert("Não foi possível salvar o modo de cálculo.");}
    atualizarCalculoOficial(card,ataque,i);
  }
  function selecionar(opcoes, id, titulo) {
    return '<label class="shinobiPrepCampo">'+h(titulo)+'<select id="'+id+'">' + opcoes.map(function (item) { return '<option value="'+h(item[0])+'">'+h(item[1])+'</option>'; }).join("") + '</select></label>';
  }
  function criarPainel() {
    var lista = doc.getElementById("listaArmados");
    if (!lista || doc.getElementById("shinobiPrepPainel")) return;
    var painel = doc.createElement("details");
    painel.id = "shinobiPrepPainel";
    painel.className = "shinobiPrepPainel";
    painel.innerHTML = '<summary>Proficiências anteriores <span>Regras especiais</span></summary>' +
      '<div class="shinobiPrepConteudo">' +
      '<p class="shinobiPrepDescricao">' + h(REGRAS_PENDENTES) + ' As proficiências iniciais em Kunai e Shuriken são reconhecidas pelo PDF.</p>' +
      '<h3>Registrar origem de proficiência</h3>' +
      '<div class="shinobiPrepCampos">' +
      selecionar(P.catalogoArmas().map(function (arma) {return [arma.id,arma.nome];}),"shinobiPrepArma","Arma") +
      selecionar(TIPOS_ORIGEM.filter(function (item) {return ["mestre","ficha-antiga","inicial"].indexOf(item[0])>=0;}),"shinobiPrepOrigemProf","Origem") +
      '<label class="shinobiPrepCampo">Observação <input id="shinobiPrepNotaProf" type="text" maxlength="240" placeholder="Ex.: concessão do mestre na sessão 4"></label>' +
      '</div><button type="button" class="shinobiPrepPrimario" data-shinobi="registrar-proficiencia">Registrar proficiência</button>' +
      '<div id="shinobiPrepProfLista" class="shinobiPrepRegistros"></div>' +
      '<p class="shinobiPrepRodape">Os registros acompanham o backup e a sincronização da ficha. Compras antigas não serão aplicadas novamente aos atributos.</p></div>';
    var botao = lista.parentElement && lista.parentElement.querySelector('button[onclick*="adicionarArmado"]');
    if (botao && botao.parentElement) botao.insertAdjacentElement("afterend",painel);
    else lista.insertAdjacentElement("afterend",painel);
    var nivel = doc.getElementById("shinobiPrepNivel"), atual = ficha();
    if (nivel) nivel.value = String(Math.max(1,Math.min(20,parseInt(atual && atual.nivel,10) || 1)));
    atualizarPainel();
  }
  function atualizarPainel() {
    var painel = doc.getElementById("shinobiPrepPainel");
    if (!painel) return;
    var regs = dados();
    var simulacao = doc.getElementById("shinobiPrepCustoNatureza");
    if (simulacao && C) {
      var desconto = C.custoNovaNatureza(ficha(),4,"nova-elemental");
      simulacao.textContent = "Simulação de nova natureza elemental: 4 pontos-chave" +
        (desconto && desconto.descontoAplicavel ? " → 2 pontos-chave (Sarutobi)" : " (sem desconto de clã confirmado)") +
        ". Evoluir uma natureza conhecida permanece pendente; nenhum ponto foi debitado.";
    }
    var profBox = doc.getElementById("shinobiPrepProfLista");
    var habilidadeBox = doc.getElementById("shinobiPrepHabilidadeLista");
    if (profBox) {
      profBox.innerHTML = '<p class="shinobiPrepFixo">Proficiências iniciais: Kunai e Shuriken</p>' +
        (regs.proficienciasExtras.length ? regs.proficienciasExtras.map(function (item) {
          var arma = P.obterArma(item.armaId);
          return '<div class="shinobiPrepRegistro"><span><b>'+h(arma ? arma.nome : item.armaId)+'</b><small>'+h(descricaoOrigem(item.origem))+' · pendente de conferência'+(item.observacoes?' · '+h(item.observacoes):'')+'</small></span><button type="button" data-shinobi="excluir-proficiencia" data-id="'+h(item.id)+'" aria-label="Excluir registro de proficiência">×</button></div>';
        }).join("") : '<p class="shinobiPrepVazio">Nenhuma proficiência adicional registrada.</p>');
    }
    if (habilidadeBox) {
      habilidadeBox.innerHTML = regs.aquisicoes.length ? regs.aquisicoes.map(function (item) {
        var habilidade = P.buscarHabilidade(item.habilidadeId);
        return '<div class="shinobiPrepRegistro"><span><b>'+h(habilidade ? habilidade.nome : item.habilidadeId)+'</b><small>nível '+h(item.nivelAquisicao)+' · '+h(descricaoOrigem(item.origem))+' · custo de referência '+h(item.custoReferencial)+' · não debitado'+(item.escolhas && item.escolhas.descricao?' · '+h(item.escolhas.descricao):'')+'</small></span><button type="button" data-shinobi="excluir-aquisicao" data-id="'+h(item.id)+'" aria-label="Excluir registro de habilidade">×</button></div>';
      }).join("") : '<p class="shinobiPrepVazio">Nenhuma habilidade registrada nesta preparação.</p>';
    }
  }
  function registrarProficiencia() {
    var armaId = doc.getElementById("shinobiPrepArma").value;
    var origem = doc.getElementById("shinobiPrepOrigemProf").value;
    var obs = String(doc.getElementById("shinobiPrepNotaProf").value || "").trim().slice(0,240);
    var arma = P.obterArma(armaId);
    if (!arma) return root.alert("Selecione uma arma do catálogo.");
    if ((armaId === "kunai" || armaId === "shuriken") && !root.confirm("Esta arma já tem proficiência inicial pelo PDF. Registrar outra origem mesmo assim?")) return;
    if (alterar(function (regs) {
      if (regs.proficienciasExtras.some(function (p) {return p.armaId === armaId;})) throw new Error("Já existe uma origem registrada para esta arma. Exclua o registro anterior antes de alterar.");
      regs.proficienciasExtras.push({id:idNovo(),armaId:armaId,origem:origem,observacoes:obs,registradoEm:new Date().toISOString(),status:"pendente-confirmacao"});
    },"registrar-origem-proficiencia")) doc.getElementById("shinobiPrepNotaProf").value = "";
  }
  function registrarAquisicao() {
    var habilidadeId = doc.getElementById("shinobiPrepHabilidade").value;
    var nivel = Number(doc.getElementById("shinobiPrepNivel").value);
    var origem = doc.getElementById("shinobiPrepOrigemHab").value;
    var escolhas = String(doc.getElementById("shinobiPrepEscolhas").value || "").trim().slice(0,240);
    var atual = ficha();
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20) return root.alert("Informe um nível entre 1 e 20.");
    var nivelAtual = parseInt(atual && atual.nivel,10);
    if (Number.isInteger(nivelAtual) && nivelAtual > 0 && nivel > nivelAtual) return root.alert("Para registrar uma aquisição histórica, o nível não pode ultrapassar o nível atual da ficha.");
    if (alterar(function (regs) {
      var rascunho = P.criarRascunhoAquisicao(habilidadeId,{id:idNovo(),nivel:nivel,origem:origem,escolhas:{descricao:escolhas},observacoes:"Registro preparatório; sem débito automático."});
      rascunho.registradoEm = new Date().toISOString();
      regs.aquisicoes.push(rascunho);
    },"registrar-aquisicao-provisoria")) doc.getElementById("shinobiPrepEscolhas").value = "";
  }
  function excluirRegistro(tipo,id) {
    var campo = tipo === "excluir-aquisicao" ? "aquisicoes" : "proficienciasExtras";
    confirmar("Excluir registro?","O registro preparatório será excluído da ficha. Nenhum acerto, dano ou ponto-chave será alterado.").then(function (sim) {
      if (!sim) return;
      alterar(function (regs) { regs[campo] = regs[campo].filter(function (item) {return String(item.id) !== String(id);}); },"excluir-registro-preparatorio");
    });
  }
  function clicar(evento) {
    var btn = evento.target && evento.target.closest ? evento.target.closest("[data-shinobi]") : null;
    if (!btn) return;
    var acao = btn.dataset.shinobi;
    if (acao === "ir-proficiencia") {
      var painel = doc.getElementById("shinobiPrepPainel");
      if (!painel) return;
      painel.open = true;
      doc.getElementById("shinobiPrepArma").value = btn.dataset.armaId || "";
      try {painel.scrollIntoView({behavior:"smooth",block:"nearest"});} catch (_e) {painel.scrollIntoView();}
    } else if (acao === "registrar-proficiencia") registrarProficiencia();
    else if (acao === "registrar-aquisicao") registrarAquisicao();
    else if (acao === "excluir-aquisicao" || acao === "excluir-proficiencia") excluirRegistro(acao,btn.dataset.id);
  }
  function iniciar() {
    if (iniciar.executado) return;
    var lista = doc.getElementById("listaArmados");
    if (!lista) return;
    iniciar.executado = true;
    criarPainel();
    atualizarCards();
    var observador = new MutationObserver(function (mudancas) {
      var houveCardNovo = mudancas.some(function (m) {
        return Array.prototype.some.call(m.addedNodes || [],function (no) {
          return no.nodeType === 1 && (no.classList && no.classList.contains("ataqueListaCard") || no.querySelector && no.querySelector(".ataqueListaCard"));
        });
      });
      if (houveCardNovo) atualizarCards();
    });
    observador.observe(lista,{childList:true,subtree:false});
    doc.addEventListener("click",clicar);
    doc.addEventListener("change",function(e){if(A&&e.target&&e.target.matches&&e.target.matches("[data-auto185]"))salvarModoAutomatico(e.target);});
    doc.addEventListener("change",function (e) {
      var el=e.target;
      if (el && el.dataset && ["forca","destreza","nivel","cla","proficiencia"].indexOf(el.dataset.save)>=0) {
        atualizarCards();
        if (el.dataset.save === "cla") atualizarPainel();
      }
    });
    root.addEventListener("pageshow",function () {atualizarPainel();atualizarCards();});
    root.addEventListener("shinobi:app-pronto",function () {atualizarPainel();atualizarCards();});
    root.addEventListener("shinobi:ficha-persistida",function (e) {if (e.detail && e.detail.campo === "automacaoAtaques") atualizarPainel(); if (e.detail && (["pontosChaveV1","armados","automacaoAtaques","inventarioItens","forca","destreza","cla","nivel","proficiencia"].indexOf(e.detail.campo)>=0)) atualizarCards();});
    root.addEventListener("shinobi:realtime-aplicado",function (e) {if (!e.detail || !Array.isArray(e.detail.campos) || e.detail.campos.indexOf("automacaoAtaques") >= 0) atualizarPainel(); atualizarCards();});
    root.addEventListener("shinobi:pontos-chave-atualizados",atualizarCards);
    root.addEventListener("shinobi:realtime-colecao-aplicada",function (e) {if (e.detail && (e.detail.collection === "inventario" || e.detail.collection === "armados")) atualizarCards();});
    if (root.ShinobiOnline && typeof root.ShinobiOnline.on === "function") {
      try { root.ShinobiOnline.on("ficha-atualizada-nuvem",function () {atualizarPainel();atualizarCards();}); } catch (_e) {}
    }
  }
  root.ShinobiIntegracaoAtaques = Object.freeze({
    versao:"2.5.8.185",
    relatorioAtaque:relatorioAtaque,
    atualizarVisual:function () {criarPainel();atualizarPainel();atualizarCards();}
  });
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded",iniciar);
  else iniciar();
})(typeof window !== "undefined" ? window : null);
