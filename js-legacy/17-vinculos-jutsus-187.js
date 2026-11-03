/* GERADO AUTOMATICAMENTE — fonte: js/17-vinculos-jutsus-187.js — app 2.5.8.187. Não editar. */
/* Projetinho Shinobi 2.5.8.187 — vínculos de habilidades nos próprios Jutsus.
 * Somente confirmação assistida: nunca altera custos, dados de dano, atributos ou saldo.
 * Utiliza o mesmo registro append-only de pontosChaveV1 e o mesmo catálogo do suplemento.
 */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports)
        module.exports = api;
    if (root)
        root.ShinobiVinculosJutsus187 = api;
    if (root && root.document)
        api.instalar(root);
})(typeof window !== 'undefined' ? window : null, function () {
    'use strict';
    function safe(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
    function obterFicha() { try {
        return typeof estado !== 'undefined' && estado && typeof estado === 'object' ? estado : null;
    }
    catch (_) {
        return null;
    } }
    function efeitoPorHabilidade(id) {
        if (id === 'ninjutsu_melhorado_2')
            return [
                { id: 'reduzir-custo', rotulo: 'Reduzir custo de EKO no uso' },
                { id: 'dobrar-alcance', rotulo: 'Dobrar alcance no uso' }
            ];
        if (id === 'ninjutsu_aprimorado')
            return [
                { id: 'aumentar-dado', rotulo: 'Aumentar o dado de dano' },
                { id: 'acao-bonus', rotulo: 'Alterar conjuração para ação bônus' },
                { id: 'triplicar-alcance', rotulo: 'Triplicar alcance' }
            ];
        return [];
    }
    function resumo(f, M, E) {
        if (!f || !M || !E || typeof M.identificar !== 'function')
            return { modelo: null, entradas: [], pendentes: 0, confirmados: 0 };
        var modelo = M.identificar(f);
        if (!modelo)
            return { modelo: null, entradas: [], pendentes: 0, confirmados: 0 };
        var lista = M.entradasValidas(modelo, f, E).filter(function (e) { return e.tipoAlvo === 'jutsu'; });
        var confirmados = lista.filter(function (e) { return e.estado === 'vinculado' || e.estado === 'importado'; }).length;
        return { modelo: modelo, entradas: lista, pendentes: lista.length - confirmados, confirmados: confirmados };
    }
    function validarEscolha(entrada, alvoId, aplicacao, efeito, alvos) {
        if (!entrada || entrada.tipoAlvo !== 'jutsu')
            throw new Error('Habilidade não pode ser vinculada a jutsu por esta tela.');
        if (!alvoId || !alvos.some(function (a) { return a.id === alvoId; }))
            throw new Error('Escolha um jutsu existente na ficha.');
        if (/^indice:/.test(alvoId))
            throw new Error('Este jutsu ainda não possui identificador estável. Salve-o primeiro e tente novamente.');
        if (['ja-aplicado', 'nao-aplicado', 'incerto'].indexOf(aplicacao) < 0)
            throw new Error('Informe se o benefício já foi aplicado.');
        var efeitos = efeitoPorHabilidade(entrada.habilidadeId);
        if (efeitos.length && !efeitos.some(function (x) { return x.id === efeito; }))
            throw new Error('Escolha qual melhoria foi adquirida para este jutsu.');
        return { confirmar: true, alvoId: alvoId, aplicacao: aplicacao, efeito: efeito };
    }
    function instalar(root) {
        if (root.__shinobiVinculos187Instalado)
            return;
        root.__shinobiVinculos187Instalado = true;
        var doc = root.document, M = root.ShinobiMigracaoHabilidades186, E = root.ShinobiPontosChave;
        if (!M || !E) {
            root.__shinobiVinculos187Instalado = false;
            return;
        }
        var painel = null, assinatura = '', salvando = false;
        function montar() {
            var destino = doc.querySelector('#jutsus .jutsusHero');
            if (!destino)
                return;
            if (!painel || !painel.isConnected) {
                painel = doc.createElement('details');
                painel.id = 'shinobiVinculos187';
                painel.className = 'shinobiVinculos187';
                painel.innerHTML = '<summary><span class="v187Titulo">Melhorias de Pontos-Chave <small>Vincular aos seus jutsus</small></span><span class="v187Contador" id="v187Contador">Conferir</span></summary><div class="v187Corpo" id="v187Corpo"></div>';
                destino.insertAdjacentElement('afterend', painel);
                painel.addEventListener('click', clicar);
                assinatura = '';
            }
            atualizar();
        }
        function titulo(e) { return e.rotulo || e.habilidadeId || 'Habilidade'; }
        function linha(e, alvos) {
            var terminado = e.estado === 'importado' || e.estado === 'vinculado';
            var nome = titulo(e);
            var resumoAtual = terminado ? 'Confirmado' : e.estado === 'ja-registrado' ? 'Compra já registrada' : 'Vincular destino';
            var corpo = '';
            if (!terminado) {
                var efeitoOpcoes = efeitoPorHabilidade(e.habilidadeId);
                var efeitos = efeitoOpcoes.length ? '<label>Melhoria escolhida<select data-v187-efeito><option value="">— Selecione o benefício —</option>' + efeitoOpcoes.map(function (x) { return '<option value="' + safe(x.id) + '">' + safe(x.rotulo) + '</option>'; }).join('') + '</select></label>' : '';
                var listaJutsus = '<option value="">— Selecione o jutsu da ficha —</option>' + alvos.map(function (j) { return '<option value="' + safe(j.id) + '">' + safe(j.nome) + (j.extra ? ' · ' + safe(j.extra) : '') + '</option>'; }).join('');
                corpo = '<div class="v187Campos">' + efeitos +
                    '<label>Jutsu beneficiado<select data-v187-alvo>' + listaJutsus + '</select></label>' +
                    '<label>Situação atual<select data-v187-aplicacao><option value="">— Informe a situação —</option><option value="ja-aplicado">Já apliquei manualmente</option><option value="nao-aplicado">Ainda não apliquei</option><option value="incerto">Preciso conferir</option></select></label>' +
                    '<label>Observação (opcional)<input data-v187-obs type="text" maxlength="240" placeholder="Ex.: Grande Bola de Fogo já custa 7 EKO"></label>' +
                    '<label class="v187Check"><input type="checkbox" data-v187-confirmar> Confirmo esta escolha</label></div>';
            }
            else {
                corpo = '<p class="v187Nota">Esta aquisição já foi associada a um registro da ficha. Nenhum desconto ou bônus foi reaplicado.</p>';
            }
            return '<details class="v187Linha" data-v187-id="' + safe(e.sourceId) + '"><summary><strong>' + safe(nome) + '</strong><span>' + safe(resumoAtual) + '</span></summary>' + corpo + '</details>';
        }
        function atualizar(forcar) {
            var f = obterFicha();
            if (!painel || !f)
                return;
            var dados = resumo(f, M, E), chave = [String(f.nome || ''), String(f.cla || ''), String(f.nivel || ''),
                (f.jutsus || []).map(function (j) { return String(j.jutsuId || j.catalogoId || '') + ':' + String(j.nome || '') + ':' + String(j.custo || ''); }).join(','),
                (f.pontosChaveV1 && f.pontosChaveV1.eventos || []).map(function (e) { return String(e.id); }).join(',')].join('|');
            if (!forcar && chave === assinatura)
                return;
            // O formulário em edição nunca é reconstruído enquanto o jogador escolhe.
            if (!forcar && painel.open && assinatura && painel.querySelector('[data-v187-confirmar]:checked'))
                return;
            assinatura = chave;
            var contador = doc.getElementById('v187Contador'), corpo = doc.getElementById('v187Corpo');
            if (!corpo)
                return;
            if (!dados.modelo) {
                if (contador)
                    contador.textContent = 'Conferir';
                corpo.innerHTML = '<p class="v187Nota">Esta ficha não corresponde exatamente ao nome e clã de uma das quatro fichas do suplemento. Nenhuma habilidade será atribuída automaticamente a outro personagem.</p>' + botaoPerfil();
                return;
            }
            if (contador)
                contador.textContent = dados.pendentes ? dados.pendentes + ' pendente' + (dados.pendentes > 1 ? 's' : '') : 'Em dia';
            var alvos = M.alvos(f, 'jutsu');
            var aviso = '<p class="v187Nota"><strong>' + safe(dados.modelo.nome) + '</strong> · ' + dados.confirmados + ' confirmado(s), ' + dados.pendentes + ' pendente(s). Você pode vincular melhorias compradas aos jutsus já salvos.</p>' +
                '<p class="v187Aviso">Esta etapa <strong>não altera</strong> custos de EKO, dano, atributos nem saldo de pontos-chave. Se você já reduziu um custo manualmente, marque “Já apliquei manualmente”.</p>';
            if (Number(f.nivel || 0) < 8)
                aviso += '<p class="v187Aviso">Esta lista é do suplemento de nível 8; a confirmação estará indisponível enquanto a ficha estiver em nível inferior.</p>';
            var lista = dados.entradas.length ? dados.entradas.map(function (e) { return linha(e, alvos); }).join('') : '<p class="v187Nota">Nenhuma habilidade direcionada a jutsus consta na lista deste personagem. Outras aquisições podem ser conferidas no Perfil.</p>';
            corpo.innerHTML = aviso + '<div class="v187Lista">' + lista + '</div>' +
                (dados.pendentes ? '<label class="v187Identidade"><input type="checkbox" id="v187Identidade"> Confirmo que esta é a ficha de ' + safe(dados.modelo.nome) + '.</label><button type="button" class="v187Salvar" data-v187-acao="salvar"' + (Number(f.nivel || 0) < 8 ? ' disabled' : '') + '>Confirmar vínculos selecionados</button>' : '') + botaoPerfil();
        }
        function botaoPerfil() { return '<button type="button" class="v187Perfil" data-v187-acao="perfil">Conferir todas as habilidades no Perfil</button>'; }
        function clicar(evento) {
            var botao = evento.target && evento.target.closest && evento.target.closest('[data-v187-acao]');
            if (!botao || salvando)
                return;
            var acao = botao.getAttribute('data-v187-acao');
            if (acao === 'perfil') {
                if (typeof root.abrirPagina === 'function')
                    root.abrirPagina('identidade');
                var pontos = doc.getElementById('shinobiPontos184');
                if (pontos)
                    pontos.open = true;
                if (root.ShinobiMigracaoHabilidadesUI186)
                    root.ShinobiMigracaoHabilidadesUI186.atualizar();
                var mig = doc.getElementById('mig186');
                if (mig) {
                    mig.open = true;
                    try {
                        mig.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    catch (_) { }
                }
                return;
            }
            if (acao !== 'salvar')
                return;
            var f = obterFicha(), dados = resumo(f, M, E);
            if (!f || !dados.modelo)
                return root.alert('A ficha não corresponde a um personagem do suplemento.');
            if (!doc.getElementById('v187Identidade') || !doc.getElementById('v187Identidade').checked)
                return root.alert('Confirme a identidade da ficha.');
            var alvos = M.alvos(f, 'jutsu'), escolhas = {}, erro = '';
            painel.querySelectorAll('[data-v187-id]').forEach(function (row) {
                if (erro)
                    return;
                var marcado = row.querySelector('[data-v187-confirmar]');
                if (!marcado || !marcado.checked)
                    return;
                var id = row.getAttribute('data-v187-id'), e = dados.entradas.find(function (x) { return x.sourceId === id; });
                var a = row.querySelector('[data-v187-alvo]'), p = row.querySelector('[data-v187-aplicacao]'), v = row.querySelector('[data-v187-efeito]'), obs = row.querySelector('[data-v187-obs]');
                try {
                    var op = validarEscolha(e, a && a.value, p && p.value, v && v.value, alvos);
                    op.observacao = String(obs && obs.value || '').trim();
                    escolhas[id] = op;
                }
                catch (ex) {
                    erro = ex.message || 'Escolha inválida.';
                }
            });
            if (erro)
                return root.alert(erro);
            if (!Object.keys(escolhas).length)
                return root.alert('Selecione e confirme ao menos uma melhoria.');
            var calculo;
            try {
                calculo = M.conciliar(f, dados.modelo.id, escolhas, E);
            }
            catch (e) {
                return root.alert(e.message || 'Não foi possível registrar os vínculos.');
            }
            if (!calculo.confirmadas)
                return root.alert('Essas melhorias já estão confirmadas.');
            if (!root.confirm('Registrar ' + calculo.confirmadas + ' vínculo(s) de jutsu sem alterar custos ou atributos?'))
                return;
            if (typeof root.persistirEstadoLocal !== 'function')
                return root.alert('Salvamento indisponível.');
            salvando = true;
            var anterior = f.pontosChaveV1;
            try {
                f.pontosChaveV1 = calculo.registro;
                var ok = root.persistirEstadoLocal({ confirmada: true, origem: 'vinculos-jutsus-187', campo: 'pontosChaveV1', antes: anterior, depois: calculo.registro, motivo: 'vincular-habilidades-jutsu' });
                if (ok !== true) {
                    if (anterior === undefined)
                        delete f.pontosChaveV1;
                    else
                        f.pontosChaveV1 = anterior;
                    return root.alert('O salvamento falhou; nenhum vínculo foi confirmado.');
                }
                assinatura = '';
                atualizar(true);
                if (root.ShinobiPontosChaveUI && root.ShinobiPontosChaveUI.atualizar)
                    root.ShinobiPontosChaveUI.atualizar();
                try {
                    root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados', { detail: { motivo: 'vinculos-jutsus-187' } }));
                }
                catch (_) { }
                root.alert('Melhoria(s) vinculada(s). Os valores dos jutsus foram preservados.');
            }
            catch (e) {
                if (anterior === undefined)
                    delete f.pontosChaveV1;
                else
                    f.pontosChaveV1 = anterior;
                root.alert('Falha na vinculação: ' + (e.message || 'erro desconhecido'));
            }
            finally {
                salvando = false;
            }
        }
        root.ShinobiVinculosJutsusUI187 = { atualizar: montar };
        if (doc.readyState === 'loading')
            doc.addEventListener('DOMContentLoaded', montar);
        else
            montar();
        root.addEventListener('pageshow', montar);
        root.addEventListener('shinobi:app-pronto', montar);
        root.addEventListener('shinobi:pontos-chave-atualizados', function () { if (!salvando)
            montar(); });
        root.addEventListener('shinobi:ficha-persistida', function (e) { if (!salvando && e.detail && ['pontosChaveV1', 'jutsus', 'nome', 'cla', 'nivel'].indexOf(e.detail.campo) >= 0)
            montar(); });
        root.addEventListener('shinobi:realtime-aplicado', function () { if (!salvando)
            montar(); });
        root.addEventListener('shinobi:realtime-colecao-aplicada', function (e) { if (!salvando && e.detail && e.detail.collection === 'jutsus')
            montar(); });
    }
    return Object.freeze({ versao: '2.5.8.187', resumo: resumo, efeitoPorHabilidade: efeitoPorHabilidade, validarEscolha: validarEscolha, instalar: instalar });
});
