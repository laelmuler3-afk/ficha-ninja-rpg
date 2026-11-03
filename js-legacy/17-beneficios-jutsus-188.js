/* GERADO AUTOMATICAMENTE — fonte: js/17-beneficios-jutsus-188.js — app 2.5.8.188. Não editar. */
/* Projetinho Shinobi 2.5.8.188 — benefícios confirmados nos jutsus.
 * Nunca modifica a ficha nem faz nova compra. Ativa apenas melhorias marcadas
 * "Ainda não apliquei", com jutsu e escolha exatos e aquisição existente.
 * Melhorado II é limitado por usos/descanso: não é desconto permanente.
 */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports)
        module.exports = api;
    if (root)
        root.ShinobiBeneficiosJutsus188 = api;
    if (root && root.document)
        api.instalar(root);
})(typeof window !== 'undefined' ? window : null, function () {
    'use strict';
    var PASSOS = { 4: 6, 6: 8, 8: 10, 10: 12 };
    function texto(x) { return String(x == null ? '' : x).trim(); }
    function identificador(j) { return texto(j && (j.jutsuId || j.catalogoId)); }
    function compras(ficha, livro) {
        if (!ficha || !livro || typeof livro.resumo !== 'function')
            return [];
        var res = livro.resumo(ficha);
        return Array.isArray(res.compras) ? res.compras : [];
    }
    function vinculos(ficha, jutsu, livro) {
        var id = identificador(jutsu);
        if (!id || /^indice:/.test(id))
            return [];
        return compras(ficha, livro).filter(function (c) {
            var op = c && c.escolhas || {};
            return texto(op.alvoId) === id && op.alvoTipo === 'jutsu' &&
                ['ninjutsu_aprimorado', 'ninjutsu_melhorado_2'].indexOf(c.habilidadeId) >= 0 &&
                ['ja-aplicado', 'nao-aplicado', 'incerto'].indexOf(op.aplicacao) >= 0;
        });
    }
    function aumentarDado(dano) {
        var original = texto(dano), achou = false, invalido = false;
        var novo = original.replace(/(^|[^\w])(\d+)d(\d+)(?!\w)/gi, function (t, prefix, n, faces) {
            var proximo = PASSOS[Number(faces)];
            if (!proximo) {
                invalido = true;
                return t;
            }
            achou = true;
            return prefix + n + 'd' + proximo;
        });
        return achou && !invalido ? novo : null;
    }
    function triplicarAlcance(alcance) {
        var val = texto(alcance), m = val.match(/^(até\s+)?(\d+(?:[,.]\d+)?)\s*(m|metros?)$/i);
        if (!m)
            return null;
        var qtd = Number(m[2].replace(',', '.')) * 3;
        if (!Number.isFinite(qtd) || qtd <= 0)
            return null;
        var valor = Number.isInteger(qtd) ? String(qtd) : String(qtd).replace('.', ',');
        return (m[1] || '') + valor + ' ' + m[3];
    }
    function aplicar(ficha, jutsu, regra, livro) {
        var saida = Object.assign({}, regra || {}), aplicados = [], preservados = [], pendentes = [];
        var encontrados = vinculos(ficha, jutsu, livro);
        var usados = new Set();
        encontrados.forEach(function (c) {
            var op = c.escolhas || {}, efeito = texto(op.efeito), tag = texto(c.nome || c.habilidadeId);
            if (op.aplicacao === 'ja-aplicado') {
                preservados.push(tag + ': valor já ajustado manualmente; não reaplicar');
                return;
            }
            if (op.aplicacao === 'incerto') {
                pendentes.push(tag + ': aguarda conferência do jogador');
                return;
            }
            if (c.habilidadeId === 'ninjutsu_melhorado_2') {
                pendentes.push(tag + ': melhoria opcional por uso e com limite por descanso; não é bônus permanente');
                return;
            }
            if (c.habilidadeId !== 'ninjutsu_aprimorado' || !efeito) {
                pendentes.push(tag + ': escolha não definida');
                return;
            }
            // Nunca aplica duas vezes a mesma transformação à mesma técnica.
            if (usados.has(efeito))
                return;
            if (efeito === 'aumentar-dado') {
                var novo = aumentarDado(saida.danoEfetivo || jutsu.dano);
                if (!novo) {
                    pendentes.push(tag + ': dano sem dado compatível; não alterado');
                    return;
                }
                saida.danoEfetivo = novo;
                aplicados.push('Ninjutsu Aprimorado: dado de dano ' + novo);
            }
            else if (efeito === 'acao-bonus') {
                saida.acaoEfetiva = 'Ação Bônus';
                aplicados.push('Ninjutsu Aprimorado: Ação Bônus (AB)');
            }
            else if (efeito === 'triplicar-alcance') {
                var alcance = triplicarAlcance(jutsu.alcance);
                if (!alcance) {
                    pendentes.push(tag + ': alcance não é uma distância simples; revisão necessária');
                    return;
                }
                saida.alcanceEfetivo = alcance;
                aplicados.push('Ninjutsu Aprimorado: alcance ' + alcance);
            }
            else {
                pendentes.push(tag + ': efeito não reconhecido; não aplicado');
                return;
            }
            usados.add(efeito);
        });
        saida.beneficios188 = { aplicados: aplicados, preservados: preservados, pendentes: pendentes };
        return saida;
    }
    function decorarCard(card, jutsu, regra) {
        if (!card || !regra || !regra.beneficios188)
            return;
        var b = regra.beneficios188, linha = card.querySelector('.jutsuLinhaTexto small');
        if (linha && b.aplicados.length) {
            var selo = card.querySelector('.b188Selo');
            if (!selo) {
                selo = card.ownerDocument.createElement('span');
                selo.className = 'b188Selo';
                linha.appendChild(selo);
            }
            selo.textContent = 'Melhoria ativa';
            selo.title = b.aplicados.join(' · ');
        }
        if (regra.acaoEfetiva) {
            var a = card.querySelector('.jutsuAcaoRapida'), pill = card.querySelector('.jutsuAcaoPill');
            if (a) {
                a.textContent = 'AB';
                a.setAttribute('data-acao', 'AB');
                a.title = 'Ação Bônus por Ninjutsu Aprimorado';
                a.setAttribute('aria-label', a.title);
            }
            if (pill) {
                pill.textContent = 'AB';
                pill.title = 'Ação Bônus por Ninjutsu Aprimorado';
            }
        }
        var antigo = card.querySelector('.b188Detalhes');
        if (antigo)
            antigo.remove();
        var textos = b.aplicados.concat(b.preservados, b.pendentes);
        if (textos.length) {
            var destino = card.querySelector('.jutsuResumo') || card;
            var aviso = card.ownerDocument.createElement('small');
            aviso.className = 'b188Detalhes';
            aviso.textContent = textos.join(' · ');
            destino.insertAdjacentElement('afterend', aviso);
        }
    }
    function instalar(root) {
        if (root.__shinobi188Instalado)
            return;
        root.__shinobi188Instalado = true;
        function recarregar() {
            if (typeof root.renderizarJutsus === 'function' && root.document.querySelector('#listaJutsus')) {
                try {
                    root.renderizarJutsus();
                }
                catch (_e) { }
            }
        }
        if (root.document.readyState === 'loading')
            root.document.addEventListener('DOMContentLoaded', recarregar);
        else
            recarregar();
        root.addEventListener('shinobi:pontos-chave-atualizados', recarregar);
        root.addEventListener('shinobi:realtime-aplicado', recarregar);
    }
    return Object.freeze({ versao: '2.5.8.188', vinculos: vinculos, aumentarDado: aumentarDado,
        triplicarAlcance: triplicarAlcance, aplicar: aplicar, decorarCard: decorarCard, instalar: instalar });
});
