/* GERADO AUTOMATICAMENTE — fonte: js/17-beneficios-vida-198.js — app 2.5.8.198. Não editar. */
/* Shinobi 2.5.8.198 — Melhoria de Vida, aplicacao confirmada.
 * Um dado de Vida do clã por aquisição. O resultado é informado pelo jogador.
 * Aumenta PV máximo, NÃO cura PV atual. Nenhum gasto antigo é debitado aqui.
 * Eventos únicos por aquisição permitem persistência e evitam aplicação repetida.
 */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports)
        module.exports = api;
    if (root)
        root.ShinobiVida198 = api;
    if (root && root.document)
        api.instalar(root);
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
    'use strict';
    function texto(x) { return String(x == null ? '' : x); }
    function numero(x) { var n = Number(x); return Number.isFinite(n) ? n : NaN; }
    function copiar(x) { return JSON.parse(JSON.stringify(x)); }
    function reg(f) { var r = f && f.pontosChaveV1; return { versao: 1, eventos: Array.isArray(r && r.eventos) ? copiar(r.eventos) : [] }; }
    function idEvento(compraId) { return 'ef198_vida_' + Array.from(texto(compraId)).map(function (c) { return ('0000' + c.charCodeAt(0).toString(16)).slice(-4); }).join(''); }
    function compraElegivel(f, livro, id) {
        var resumo = livro && livro.resumo && livro.resumo(f), lista = resumo && resumo.compras || [];
        var c = lista.find(function (x) { return texto(x.id) === texto(id); });
        if (!c || c.habilidadeId !== 'melhoria_vida')
            throw new Error('Selecione uma aquisição válida de Melhoria de Vida.');
        var op = c.escolhas || {}, aplicacao = texto(op.aplicacao);
        if (aplicacao !== 'nao-aplicado' && !(c.tipo === 'compra' && !aplicacao))
            throw new Error('Esta melhoria já foi aplicada manualmente ou precisa de conferência.');
        return c;
    }
    function preparar(f, livro, compraId, rolagem, regraCla) {
        if (!f || typeof f !== 'object')
            throw new Error('Ficha indisponível.');
        var compra = compraElegivel(f, livro, compraId), r = reg(f);
        var id = idEvento(compra.id);
        // Mesmo após um estorno, não reutilizar uma compra cujo bônus já
        // alterou permanentemente PV; eventual reversão exige correção supervisionada.
        if (r.eventos.some(function (e) { return e && (e.id === id || (e.tipo === 'efetivacao-beneficio' && texto(e.alvoId) === texto(compra.id))); }))
            throw new Error('Esta melhoria já foi efetivada. Não é permitido aplicar novamente.');
        var dado = numero(regraCla && regraCla.life && regraCla.life.die);
        if (!Number.isInteger(dado) || dado < 2 || dado > 20)
            throw new Error('Não foi possível identificar o dado de Vida do clã na progressão.');
        var resultado = numero(rolagem);
        if (!Number.isInteger(resultado) || resultado < 1 || resultado > dado)
            throw new Error('Informe um resultado inteiro entre 1 e ' + dado + ' (d' + dado + ').');
        var antes = numero(f.pvMax), atual = numero(f.pv);
        if (!Number.isFinite(antes) || antes <= 0 || !Number.isFinite(atual) || atual < 0 || atual > antes)
            throw new Error('PV atual ou máximo inválido. Corrija a ficha antes de aplicar a melhoria.');
        var depois = antes + resultado;
        var evento = { id: id, tipo: 'efetivacao-beneficio', habilidadeId: 'melhoria_vida', alvoId: texto(compra.id),
            origem: 'melhoria-vida-198', campo: 'pvMax', antes: antes, depois: depois,
            dado: '1d' + dado, rolagem: resultado, claId: texto(regraCla.id), criadoEm: new Date().toISOString(),
            observacao: 'Apenas PV máximo. PV atual preservado; não é uma cura.' };
        r.eventos.push(evento);
        return { id: id, compraId: texto(compra.id), antes: antes, depois: depois,
            pvAtual: atual, dado: dado, resultado: resultado, novoRegistro: r, event: evento };
    }
    function instalar(root) {
        if (root.__shinobiVida198Instalado)
            return;
        root.__shinobiVida198Instalado = true;
        var ocupado = false;
        function ficha() { try {
            return typeof estado !== 'undefined' ? estado : null;
        }
        catch (_) {
            return null;
        } }
        root.document.addEventListener('click', function (ev) {
            var b = ev.target && ev.target.closest && ev.target.closest('[data-b198-vida]');
            if (!b || ocupado)
                return;
            var f = ficha(), livro = root.ShinobiPontosChave;
            var regras = root.shinobiLevelUp && root.shinobiLevelUp.getClanRule && root.shinobiLevelUp.getClanRule();
            if (!f || !livro)
                return root.alert('Ficha ou Pontos-Chave indisponíveis.');
            if (!regras)
                return root.alert('Aguarde o carregamento das regras de clã e tente novamente.');
            var linha = b.closest('.beneficio190Linha'), input = linha && linha.querySelector('[data-b198-rolagem]');
            var plan;
            try {
                plan = preparar(f, livro, b.getAttribute('data-b198-vida'), input && input.value, regras);
            }
            catch (e) {
                return root.alert(e.message);
            }
            if (!root.confirm('Melhoria de Vida: resultado ' + plan.resultado + ' no d' + plan.dado + '.\n\nPV máximo: ' + plan.antes + ' → ' + plan.depois + '\nPV atual: ' + plan.pvAtual + ' (inalterado).\n\nConfirmar? Não confirme se já aumentou o PV manualmente.'))
                return;
            if (typeof root.persistirEstadoLocal !== 'function')
                return root.alert('Salvamento indisponível.');
            var campo = root.document.querySelector('[data-save="pvMax"]');
            if (campo && campo.dataset.shinobiEdicaoPendente === '1')
                return root.alert('Confirme ou descarte a edição de PV máximo antes de aplicar a melhoria.');
            ocupado = true;
            var livroAnterior = f.pontosChaveV1, valorAnterior = f.pvMax;
            try {
                // Revalidar a aquisição imediatamente antes do salvamento.
                plan = preparar(f, livro, b.getAttribute('data-b198-vida'), input && input.value, regras);
                f.pontosChaveV1 = plan.novoRegistro;
                f.pvMax = String(plan.depois);
                if (campo)
                    campo.value = String(plan.depois);
                var salvo = root.persistirEstadoLocal({ confirmada: true, origem: 'melhoria-vida-198',
                    campos: ['pvMax', 'pontosChaveV1'], motivo: 'beneficio-vida-confirmado' });
                if (salvo !== true)
                    throw new Error('O salvamento falhou.');
                if (campo) {
                    campo.dataset.shinobiValorConfirmado = String(plan.depois);
                    campo.dataset.shinobiEdicaoPendente = '0';
                }
                if (typeof root.atualizarPlacar === 'function')
                    root.atualizarPlacar();
                if (typeof root.atualizarPerfil === 'function')
                    root.atualizarPerfil();
                try {
                    root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados', { detail: { motivo: 'vida198' } }));
                }
                catch (_) { }
                root.alert('Melhoria aplicada: PV máximo +' + plan.resultado + '. PV atual preservado.');
            }
            catch (e) {
                f.pontosChaveV1 = livroAnterior;
                f.pvMax = valorAnterior;
                if (campo)
                    campo.value = texto(valorAnterior);
                root.alert('Não foi possível aplicar a melhoria: ' + e.message);
            }
            finally {
                ocupado = false;
            }
        });
    }
    return Object.freeze({ preparar: preparar, compraElegivel: compraElegivel, idEvento: idEvento, instalar: instalar });
});
