/* GERADO AUTOMATICAMENTE — fonte: js/17-duelista-defensivo-201.js — app 2.5.8.201. Não editar. */
/* Shinobi 2.5.8.201 — Duelista Defensivo: reação de CA para UM ataque.
 * Prévia não persistente: a CA permanente não muda e nenhuma reação é
 * consumida automaticamente (o motor ainda não controla turnos/reação).
 */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports)
        module.exports = api;
    if (root)
        root.ShinobiDuelistaDefensivo201 = api;
    if (root && root.document)
        api.instalar(root);
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
    'use strict';
    function texto(x) { return String(x == null ? '' : x); }
    function adquirida(f, livro) {
        return !!(f && livro && typeof livro.resumo === 'function' && (livro.resumo(f).compras || []).some(function (c) {
            if (c.habilidadeId !== 'duelista_defensivo')
                return false;
            var aplicacao = texto(c.escolhas && c.escolhas.aplicacao);
            return c.tipo === 'compra' || aplicacao === 'ja-aplicado' || aplicacao === 'nao-aplicado';
        }));
    }
    function armasElegiveis(f, preparacao, ataques, livro) {
        if (!preparacao || typeof preparacao.catalogoArmas !== 'function' || !ataques || typeof ataques.proficiente !== 'function')
            return [];
        return preparacao.catalogoArmas().filter(function (a) {
            return a && Array.isArray(a.propriedades) && a.propriedades.indexOf('acuidade') >= 0 &&
                (a.grupo === 'corpo-a-corpo' || a.grupo === 'arremessavel') && ataques.proficiente(f, a, livro);
        }).map(function (a) { return { id: a.id, nome: a.nome }; });
    }
    function calcular(f, livro, preparacao, ataques, calculos, armaId, estaEmpunhando, reacaoDisponivel, acertoInimigo) {
        if (!adquirida(f, livro))
            throw new Error('Duelista Defensivo não está confirmado nesta ficha.');
        var lista = armasElegiveis(f, preparacao, ataques, livro);
        var arma = lista.find(function (a) { return a.id === texto(armaId); });
        if (!arma)
            throw new Error('Escolha uma arma de Acuidade em que você seja proficiente.');
        if (estaEmpunhando !== true || reacaoDisponivel !== true)
            throw new Error('Confirme que está empunhando a arma e possui sua reação disponível.');
        var prof = calculos && calculos.proficienciaDoNivel && calculos.proficienciaDoNivel(f.nivel);
        if (!Number.isInteger(prof) || prof < 1)
            throw new Error('Proficiência da ficha inválida.');
        var base = Number(f.ca);
        if (!Number.isFinite(base) || base < 1 || base > 100)
            throw new Error('A CA atual da ficha está inválida.');
        var textoAtaque = texto(acertoInimigo).trim(), acerto = null;
        if (textoAtaque) {
            if (!/^\d{1,3}$/.test(textoAtaque))
                throw new Error('Informe um acerto inimigo inteiro ou deixe em branco.');
            acerto = Number(textoAtaque);
            if (acerto < 1 || acerto > 100)
                throw new Error('Acerto inimigo inválido.');
        }
        return { arma: arma.nome, caBase: base, bonus: prof, caTemporaria: base + prof, acertoInimigo: acerto,
            resultado: acerto === null ? 'Consulte a CA temporária para este ataque.' : acerto < base + prof ? 'Esse acerto não ultrapassa a CA temporária.' : 'Esse acerto alcança a CA temporária.' };
    }
    function instalar(root) {
        if (root.__shinobiDuelistaDefensivo201Instalado)
            return;
        root.__shinobiDuelistaDefensivo201Instalado = true;
        var doc = root.document;
        function ficha() { try {
            return typeof estado !== 'undefined' ? estado : root.estado || null;
        }
        catch (_) {
            return root.estado || null;
        } }
        function painel() { return doc.getElementById('shinobiDuelistaDefensivo201'); }
        function atualizar() {
            var p = painel(), f = ficha(), livro = root.ShinobiPontosChave;
            if (!p)
                return;
            var ativo = adquirida(f, livro);
            p.hidden = !ativo;
            if (!ativo)
                return;
            var combo = p.querySelector('[data-dd201-arma]'), lista = armasElegiveis(f, root.ShinobiPreparacaoAtaques, root.ShinobiAtaquesAutomaticos, livro);
            if (combo) {
                var antes = combo.value;
                while (combo.firstChild)
                    combo.removeChild(combo.firstChild);
                lista.forEach(function (a) { var opt = doc.createElement('option'); opt.value = a.id; opt.textContent = a.nome; combo.appendChild(opt); });
                if (lista.some(function (a) { return a.id === antes; }))
                    combo.value = antes;
            }
            var bonus = root.ShinobiCalculosConfirmados && root.ShinobiCalculosConfirmados.proficienciaDoNivel(f.nivel);
            var msg = p.querySelector('[data-dd201-status]');
            if (msg)
                msg.textContent = lista.length ? 'Reação: CA atual +' + (bonus || '?') + ' contra um ataque corpo a corpo.' : 'Nenhuma arma de Acuidade proficiente está cadastrada nas regras.';
            var b = p.querySelector('[data-dd201-calcular]');
            if (b)
                b.disabled = !lista.length;
        }
        function mostrar() {
            var p = painel(), f = ficha(), livro = root.ShinobiPontosChave;
            if (!p || !f || !livro)
                return;
            var out = p.querySelector('[data-dd201-resultado]');
            try {
                var plan = calcular(f, livro, root.ShinobiPreparacaoAtaques, root.ShinobiAtaquesAutomaticos, root.ShinobiCalculosConfirmados, p.querySelector('[data-dd201-arma]').value, !!p.querySelector('[data-dd201-empunhando]').checked, !!p.querySelector('[data-dd201-reacao]').checked, p.querySelector('[data-dd201-acerto]').value);
                if (out)
                    out.textContent = 'CA ' + plan.caBase + ' → ' + plan.caTemporaria + ' para este ataque. ' + plan.resultado;
            }
            catch (err) {
                if (out)
                    out.textContent = err.message;
            }
        }
        function iniciar() {
            var p = painel();
            if (!p)
                return;
            var b = p.querySelector('[data-dd201-calcular]');
            if (b && !b.__ligadoDD201) {
                b.__ligadoDD201 = true;
                b.addEventListener('click', mostrar);
            }
            atualizar();
        }
        if (doc.readyState === 'loading')
            doc.addEventListener('DOMContentLoaded', iniciar);
        else
            iniciar();
        ['shinobi:pontos-chave-atualizados', 'shinobi:realtime-aplicado', 'shinobi:realtime-colecao-aplicada', 'shinobi:app-pronto', 'pageshow'].forEach(function (n) { root.addEventListener(n, iniciar); });
        root.addEventListener('shinobi:ficha-persistida', function (e) { if (!e.detail || ['pontosChaveV1', 'nivel', 'ca', 'armados'].indexOf(e.detail.campo) >= 0)
            atualizar(); });
    }
    return Object.freeze({ adquirida: adquirida, armasElegiveis: armasElegiveis, calcular: calcular, instalar: instalar });
});
