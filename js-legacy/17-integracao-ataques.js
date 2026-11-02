/* GERADO AUTOMATICAMENTE — fonte: js/17-integracao-ataques.js — app 2.5.8.181. Não editar. */
/* Projetinho Shinobi — 2.5.8.181.
 * Integração preparatória: catálogo ↔ inventário ↔ ataques ↔ origem de proficiências.
 * Nenhum cálculo de acerto/dano, débito de pontos ou bônus é aplicado.
 * Os lançamentos são registros históricos provisórios até a decisão do mestre.
 */
(function (root) {
    "use strict";
    if (!root || !root.document || root.__shinobiIntegracaoAtaques181)
        return;
    root.__shinobiIntegracaoAtaques181 = true;
    var doc = root.document;
    var P = root.ShinobiPreparacaoAtaques;
    if (!P) {
        console.warn("Shinobi: módulo do catálogo ainda não carregado.");
        return;
    }
    var REGRAS_PENDENTES = "Registro preparatório: não modifica bônus, dano ou saldo de pontos-chave.";
    var TIPOS_ORIGEM = [
        ["pontos-chave", "Pontos-chave"],
        ["pontos-de-cla", "Pontos de clã"],
        ["inicial", "Inicial / criação de ficha"],
        ["habilidade", "Outra habilidade"],
        ["mestre", "Concessão do mestre"],
        ["ficha-antiga", "Importada da ficha antiga"]
    ];
    function h(valor) { return String(valor == null ? "" : valor).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
    function n(valor) { return String(valor == null ? "" : valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").trim(); }
    function ficha() { try {
        return typeof estado !== "undefined" && estado && typeof estado === "object" ? estado : null;
    }
    catch (_e) {
        return null;
    } }
    function dados() { return P.lerEstrutura(ficha()); }
    function descricaoOrigem(id) { var item = TIPOS_ORIGEM.find(function (tipo) { return tipo[0] === id; }); return item ? item[1] : String(id || "Origem não informada"); }
    function idNovo() {
        try {
            if (root.crypto && root.crypto.randomUUID)
                return root.crypto.randomUUID();
        }
        catch (_e) { }
        return "reg_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
    }
    function confirmar(titulo, descricao) {
        if (typeof root.modalShinobi === "function")
            return root.modalShinobi(titulo, descricao);
        return Promise.resolve(root.confirm(descricao));
    }
    function alterar(preparar, motivo) {
        var atual = ficha();
        if (!atual || typeof root.persistirEstadoLocal !== "function") {
            root.alert("Não foi possível acessar o estado da ficha.");
            return false;
        }
        var antigo = atual.automacaoAtaques;
        var novo = dados();
        try {
            preparar(novo);
        }
        catch (erro) {
            root.alert(erro.message || "Registro inválido.");
            return false;
        }
        atual.automacaoAtaques = novo;
        var ok = root.persistirEstadoLocal({ confirmada: true, origem: "preparacao-ataques", campo: "automacaoAtaques", motivo: motivo || "registro-preparatorio" });
        if (ok !== true) {
            if (antigo === undefined)
                delete atual.automacaoAtaques;
            else
                atual.automacaoAtaques = antigo;
            return false;
        }
        atualizarPainel();
        atualizarCards();
        return true;
    }
    function origemProficiencia(armaId, registro) {
        if (!armaId)
            return { rotulo: "Arma não identificada", estado: "incerto" };
        if (armaId === "kunai" || armaId === "shuriken")
            return { rotulo: "Proficiência inicial (PDF, p. 1)", estado: "inicial" };
        var entrada = (registro.proficienciasExtras || []).find(function (p) { return p && p.armaId === armaId; });
        return entrada ? { rotulo: "Registrada: " + descricaoOrigem(entrada.origem) + " (a confirmar)", estado: "registrada" } :
            { rotulo: "Proficiência não registrada", estado: "incerto" };
    }
    function noInventario(ataque, armaId) {
        var atual = ficha() || {};
        var itens = Array.isArray(atual.inventarioItens) ? atual.inventarioItens : [];
        var referencia = String(ataque && ataque.itemInventario || "").trim();
        if (!referencia)
            return { tipo: "nao-vinculado", rotulo: "Sem item de inventário vinculado" };
        var encontrado = itens.find(function (item) {
            return n(item && item.nome) === n(referencia) ||
                (!!armaId && !!P.obterArma(item && item.nome) && P.obterArma(item.nome).id === armaId);
        });
        return encontrado ? { tipo: "encontrado", rotulo: "Inventário: " + String(encontrado.nome || referencia) + " (qtd. " + String(encontrado.quantidade == null ? "?" : encontrado.quantidade) + ")" } :
            { tipo: "ausente", rotulo: "Item vinculado não encontrado no inventário: " + referencia };
    }
    function relatorioAtaque(ataque) {
        var catalogo = P.identificarAtaque(ataque);
        var id = catalogo && catalogo.id;
        var reg = dados();
        return { catalogo: catalogo, proficiencia: origemProficiencia(id, reg), inventario: ataque && ataque.tipo === "desarmado" ? null : noInventario(ataque, id) };
    }
    function elemento(tag, classe, texto) {
        var el = doc.createElement(tag);
        if (classe)
            el.className = classe;
        if (texto !== undefined)
            el.textContent = texto;
        return el;
    }
    function atualizarCards() {
        var lista = doc.getElementById("listaArmados"), atual = ficha();
        if (!lista || !atual)
            return;
        var registros = Array.isArray(atual.armados) ? atual.armados : [];
        var cards = lista.querySelectorAll(".ataqueListaCard");
        Array.prototype.forEach.call(cards, function (card, i) {
            var ataque = registros[i];
            if (!ataque)
                return;
            var bloco = card.querySelector(".shinobiAtaqueMetadados");
            if (!bloco) {
                var destino = card.querySelector(".ataqueDetalhesCompactos");
                if (!destino)
                    return;
                bloco = elemento("section", "shinobiAtaqueMetadados");
                bloco.setAttribute("aria-label", "Referência de regras do ataque");
                destino.appendChild(bloco);
            }
            var rel = relatorioAtaque(ataque);
            bloco.textContent = "";
            var titulo = elemento("strong", "shinobiMetaTitulo", "Referência da arma — preparação");
            bloco.appendChild(titulo);
            if (!rel.catalogo) {
                bloco.appendChild(elemento("p", "shinobiMetaLinha", "Ataque personalizado: sem referência automática no catálogo."));
            }
            else {
                var arma = rel.catalogo;
                var props = Array.isArray(arma.propriedades) ? arma.propriedades.join(", ") : "";
                var texto = arma.id === "desarmado" ? "Ataque desarmado: dano-base aguardando confirmação." :
                    arma.nome + " · dano base " + (arma.dano || "não informado") + (arma.tipoDano ? " " + arma.tipoDano : "") + (props ? " · " + props : "");
                bloco.appendChild(elemento("p", "shinobiMetaLinha", texto));
                if (arma.observacao)
                    bloco.appendChild(elemento("p", "shinobiMetaLinha shinobiMetaPendente", arma.observacao));
                if (arma.id === "agulha")
                    bloco.appendChild(elemento("p", "shinobiMetaLinha shinobiMetaPendente", "Agulha é Especial no catálogo. A compra comum da ficha-exemplo depende do mestre."));
            }
            bloco.appendChild(elemento("p", "shinobiMetaLinha " + (rel.proficiencia.estado === "incerto" ? "shinobiMetaPendente" : ""), rel.proficiencia.rotulo));
            if (rel.inventario)
                bloco.appendChild(elemento("p", "shinobiMetaLinha", rel.inventario.rotulo));
            bloco.appendChild(elemento("small", "shinobiMetaAviso", "Acerto e dano acima continuam manuais."));
            if (rel.catalogo && rel.catalogo.id !== "desarmado") {
                var botao = elemento("button", "shinobiMetaBotao", "Registrar origem de proficiência");
                botao.type = "button";
                botao.dataset.shinobi = "ir-proficiencia";
                botao.dataset.armaId = rel.catalogo.id;
                bloco.appendChild(botao);
            }
        });
    }
    function selecionar(opcoes, id, titulo) {
        return '<label class="shinobiPrepCampo">' + h(titulo) + '<select id="' + id + '">' + opcoes.map(function (item) { return '<option value="' + h(item[0]) + '">' + h(item[1]) + '</option>'; }).join("") + '</select></label>';
    }
    function criarPainel() {
        var lista = doc.getElementById("listaArmados");
        if (!lista || doc.getElementById("shinobiPrepPainel"))
            return;
        var painel = doc.createElement("details");
        painel.id = "shinobiPrepPainel";
        painel.className = "shinobiPrepPainel";
        painel.innerHTML = '<summary>Preparação de ataques e pontos-chave <span>Regras pendentes</span></summary>' +
            '<div class="shinobiPrepConteudo">' +
            '<p class="shinobiPrepDescricao">' + h(REGRAS_PENDENTES) + ' As proficiências iniciais em Kunai e Shuriken são reconhecidas pelo PDF.</p>' +
            '<h3>Registrar origem de proficiência</h3>' +
            '<div class="shinobiPrepCampos">' +
            selecionar(P.catalogoArmas().map(function (arma) { return [arma.id, arma.nome]; }), "shinobiPrepArma", "Arma") +
            selecionar(TIPOS_ORIGEM, "shinobiPrepOrigemProf", "Origem") +
            '<label class="shinobiPrepCampo">Observação <input id="shinobiPrepNotaProf" type="text" maxlength="240" placeholder="Ex.: concessão do mestre na sessão 4"></label>' +
            '</div><button type="button" class="shinobiPrepPrimario" data-shinobi="registrar-proficiencia">Registrar proficiência</button>' +
            '<div id="shinobiPrepProfLista" class="shinobiPrepRegistros"></div>' +
            '<h3>Histórico provisório de pontos-chave</h3>' +
            '<p class="shinobiPrepDescricao">Somente histórico. Nenhum custo é descontado e os requisitos ainda não são aplicados.</p>' +
            '<div class="shinobiPrepCampos">' +
            selecionar(P.catalogoHabilidades().map(function (item) { return [item.id, item.nome + " (" + item.custo + " pontos de referência)"]; }), "shinobiPrepHabilidade", "Habilidade") +
            '<label class="shinobiPrepCampo">Nível de aquisição <input id="shinobiPrepNivel" type="number" min="1" max="20" inputmode="numeric" value="1"></label>' +
            selecionar(TIPOS_ORIGEM, "shinobiPrepOrigemHab", "Origem") +
            '<label class="shinobiPrepCampo">Escolhas / detalhes <input id="shinobiPrepEscolhas" type="text" maxlength="240" placeholder="Ex.: Wakizashi e Agulha"></label>' +
            '</div><button type="button" class="shinobiPrepPrimario" data-shinobi="registrar-aquisicao">Registrar habilidade (sem gastar pontos)</button>' +
            '<div id="shinobiPrepHabilidadeLista" class="shinobiPrepRegistros"></div>' +
            '<p class="shinobiPrepRodape">Os registros acompanham o backup e a sincronização da ficha. Compras antigas não serão aplicadas novamente aos atributos.</p></div>';
        var botao = lista.parentElement && lista.parentElement.querySelector('button[onclick*="adicionarArmado"]');
        if (botao && botao.parentElement)
            botao.insertAdjacentElement("afterend", painel);
        else
            lista.insertAdjacentElement("afterend", painel);
        var nivel = doc.getElementById("shinobiPrepNivel"), atual = ficha();
        if (nivel)
            nivel.value = String(Math.max(1, Math.min(20, parseInt(atual && atual.nivel, 10) || 1)));
        atualizarPainel();
    }
    function atualizarPainel() {
        var painel = doc.getElementById("shinobiPrepPainel");
        if (!painel)
            return;
        var regs = dados();
        var profBox = doc.getElementById("shinobiPrepProfLista");
        var habilidadeBox = doc.getElementById("shinobiPrepHabilidadeLista");
        if (profBox) {
            profBox.innerHTML = '<p class="shinobiPrepFixo">Proficiências iniciais: Kunai e Shuriken</p>' +
                (regs.proficienciasExtras.length ? regs.proficienciasExtras.map(function (item) {
                    var arma = P.obterArma(item.armaId);
                    return '<div class="shinobiPrepRegistro"><span><b>' + h(arma ? arma.nome : item.armaId) + '</b><small>' + h(descricaoOrigem(item.origem)) + ' · pendente de conferência' + (item.observacoes ? ' · ' + h(item.observacoes) : '') + '</small></span><button type="button" data-shinobi="excluir-proficiencia" data-id="' + h(item.id) + '" aria-label="Excluir registro de proficiência">×</button></div>';
                }).join("") : '<p class="shinobiPrepVazio">Nenhuma proficiência adicional registrada.</p>');
        }
        if (habilidadeBox) {
            habilidadeBox.innerHTML = regs.aquisicoes.length ? regs.aquisicoes.map(function (item) {
                var habilidade = P.buscarHabilidade(item.habilidadeId);
                return '<div class="shinobiPrepRegistro"><span><b>' + h(habilidade ? habilidade.nome : item.habilidadeId) + '</b><small>nível ' + h(item.nivelAquisicao) + ' · ' + h(descricaoOrigem(item.origem)) + ' · custo de referência ' + h(item.custoReferencial) + ' · não debitado' + (item.escolhas && item.escolhas.descricao ? ' · ' + h(item.escolhas.descricao) : '') + '</small></span><button type="button" data-shinobi="excluir-aquisicao" data-id="' + h(item.id) + '" aria-label="Excluir registro de habilidade">×</button></div>';
            }).join("") : '<p class="shinobiPrepVazio">Nenhuma habilidade registrada nesta preparação.</p>';
        }
    }
    function registrarProficiencia() {
        var armaId = doc.getElementById("shinobiPrepArma").value;
        var origem = doc.getElementById("shinobiPrepOrigemProf").value;
        var obs = String(doc.getElementById("shinobiPrepNotaProf").value || "").trim().slice(0, 240);
        var arma = P.obterArma(armaId);
        if (!arma)
            return root.alert("Selecione uma arma do catálogo.");
        if ((armaId === "kunai" || armaId === "shuriken") && !root.confirm("Esta arma já tem proficiência inicial pelo PDF. Registrar outra origem mesmo assim?"))
            return;
        if (alterar(function (regs) {
            if (regs.proficienciasExtras.some(function (p) { return p.armaId === armaId; }))
                throw new Error("Já existe uma origem registrada para esta arma. Exclua o registro anterior antes de alterar.");
            regs.proficienciasExtras.push({ id: idNovo(), armaId: armaId, origem: origem, observacoes: obs, registradoEm: new Date().toISOString(), status: "pendente-confirmacao" });
        }, "registrar-origem-proficiencia"))
            doc.getElementById("shinobiPrepNotaProf").value = "";
    }
    function registrarAquisicao() {
        var habilidadeId = doc.getElementById("shinobiPrepHabilidade").value;
        var nivel = Number(doc.getElementById("shinobiPrepNivel").value);
        var origem = doc.getElementById("shinobiPrepOrigemHab").value;
        var escolhas = String(doc.getElementById("shinobiPrepEscolhas").value || "").trim().slice(0, 240);
        var atual = ficha();
        if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20)
            return root.alert("Informe um nível entre 1 e 20.");
        var nivelAtual = parseInt(atual && atual.nivel, 10);
        if (Number.isInteger(nivelAtual) && nivelAtual > 0 && nivel > nivelAtual)
            return root.alert("Para registrar uma aquisição histórica, o nível não pode ultrapassar o nível atual da ficha.");
        if (alterar(function (regs) {
            var rascunho = P.criarRascunhoAquisicao(habilidadeId, { id: idNovo(), nivel: nivel, origem: origem, escolhas: { descricao: escolhas }, observacoes: "Registro preparatório; sem débito automático." });
            rascunho.registradoEm = new Date().toISOString();
            regs.aquisicoes.push(rascunho);
        }, "registrar-aquisicao-provisoria"))
            doc.getElementById("shinobiPrepEscolhas").value = "";
    }
    function excluirRegistro(tipo, id) {
        var campo = tipo === "excluir-aquisicao" ? "aquisicoes" : "proficienciasExtras";
        confirmar("Excluir registro?", "O registro preparatório será excluído da ficha. Nenhum acerto, dano ou ponto-chave será alterado.").then(function (sim) {
            if (!sim)
                return;
            alterar(function (regs) { regs[campo] = regs[campo].filter(function (item) { return String(item.id) !== String(id); }); }, "excluir-registro-preparatorio");
        });
    }
    function clicar(evento) {
        var btn = evento.target && evento.target.closest ? evento.target.closest("[data-shinobi]") : null;
        if (!btn)
            return;
        var acao = btn.dataset.shinobi;
        if (acao === "ir-proficiencia") {
            var painel = doc.getElementById("shinobiPrepPainel");
            if (!painel)
                return;
            painel.open = true;
            doc.getElementById("shinobiPrepArma").value = btn.dataset.armaId || "";
            try {
                painel.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            catch (_e) {
                painel.scrollIntoView();
            }
        }
        else if (acao === "registrar-proficiencia")
            registrarProficiencia();
        else if (acao === "registrar-aquisicao")
            registrarAquisicao();
        else if (acao === "excluir-aquisicao" || acao === "excluir-proficiencia")
            excluirRegistro(acao, btn.dataset.id);
    }
    function iniciar() {
        if (iniciar.executado)
            return;
        var lista = doc.getElementById("listaArmados");
        if (!lista)
            return;
        iniciar.executado = true;
        criarPainel();
        atualizarCards();
        var observador = new MutationObserver(function (mudancas) {
            var houveCardNovo = mudancas.some(function (m) {
                return Array.prototype.some.call(m.addedNodes || [], function (no) {
                    return no.nodeType === 1 && (no.classList && no.classList.contains("ataqueListaCard") || no.querySelector && no.querySelector(".ataqueListaCard"));
                });
            });
            if (houveCardNovo)
                atualizarCards();
        });
        observador.observe(lista, { childList: true, subtree: false });
        doc.addEventListener("click", clicar);
        root.addEventListener("pageshow", function () { atualizarPainel(); atualizarCards(); });
        root.addEventListener("shinobi:app-pronto", function () { atualizarPainel(); atualizarCards(); });
        root.addEventListener("shinobi:ficha-persistida", function (e) { if (e.detail && e.detail.campo === "automacaoAtaques")
            atualizarPainel(); if (e.detail && (e.detail.campo === "automacaoAtaques" || e.detail.campo === "inventarioItens"))
            atualizarCards(); });
        root.addEventListener("shinobi:realtime-aplicado", function (e) { if (!e.detail || !Array.isArray(e.detail.campos) || e.detail.campos.indexOf("automacaoAtaques") >= 0)
            atualizarPainel(); atualizarCards(); });
        root.addEventListener("shinobi:realtime-colecao-aplicada", function (e) { if (e.detail && (e.detail.collection === "inventario" || e.detail.collection === "armados"))
            atualizarCards(); });
        if (root.ShinobiOnline && typeof root.ShinobiOnline.on === "function") {
            try {
                root.ShinobiOnline.on("ficha-atualizada-nuvem", function () { atualizarPainel(); atualizarCards(); });
            }
            catch (_e) { }
        }
    }
    root.ShinobiIntegracaoAtaques = Object.freeze({
        versao: "2.5.8.181",
        relatorioAtaque: relatorioAtaque,
        atualizarVisual: function () { criarPainel(); atualizarPainel(); atualizarCards(); }
    });
    if (doc.readyState === "loading")
        doc.addEventListener("DOMContentLoaded", iniciar);
    else
        iniciar();
})(typeof window !== "undefined" ? window : null);
