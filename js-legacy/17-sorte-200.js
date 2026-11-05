/* GERADO AUTOMATICAMENTE — fonte: js/17-sorte-200.js — app 2.5.8.200. Não editar. */
/* Projetinho Shinobi 2.5.8.200 — Sorte: três pontos por descanso longo.
 * Eventos persistidos no livro-caixa da ficha: recuperação derivada do descanso
 * longo existente; não há recurso paralelo em localStorage.
 * Nenhuma rolagem automática: o jogador decide quando consumir o ponto.
 */
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports)
        module.exports = api;
    if (root)
        root.ShinobiSorte200 = api;
    if (root && root.document)
        api.instalar(root);
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
    'use strict';
    var LIMITE = 3;
    var TIPOS = { ataque: 'Jogada de ataque', habilidade: 'Teste de habilidade', resistencia: 'Teste de resistência', defesa: 'Ataque contra você' };
    function texto(v) { return String(v == null ? '' : v); }
    function id() {
        var idCripto = '';
        try {
            if (typeof crypto !== 'undefined' && crypto.randomUUID)
                idCripto = crypto.randomUUID().replace(/-/g, '');
        }
        catch (_e) { }
        return 'sorte200_' + (idCripto || Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12));
    }
    function eventos(ficha, livro) {
        var reg = livro && typeof livro.registro === 'function' ? livro.registro(ficha) : ficha && ficha.pontosChaveV1;
        return Array.isArray(reg && reg.eventos) ? reg.eventos.slice() : [];
    }
    function ordenar(a, b) { return texto(a.criadoEm).localeCompare(texto(b.criadoEm)) || texto(a.id).localeCompare(texto(b.id)); }
    function adquirida(ficha, livro) {
        if (!ficha || !livro || typeof livro.resumo !== 'function')
            return false;
        return (livro.resumo(ficha).compras || []).some(function (c) {
            if (c.habilidadeId !== 'sorte')
                return false;
            var aplicacao = texto(c.escolhas && c.escolhas.aplicacao);
            return c.tipo === 'compra' || aplicacao === 'ja-aplicado' || aplicacao === 'nao-aplicado';
        });
    }
    function status(ficha, livro) {
        var possui = adquirida(ficha, livro), evs = eventos(ficha, livro).filter(function (e) { return e && e.id && e.tipo; }), anulados = {};
        evs.forEach(function (e) { if (e.tipo === 'estorno' && e.alvoId)
            anulados[texto(e.alvoId)] = true; });
        var descansos = evs.filter(function (e) { return e.tipo === 'descanso-longo-197' && !anulados[texto(e.id)]; });
        // Descansos no mesmo milissegundo preservam a ordem do histórico local.
        // Entre instantes distintos, prevalece o timestamp mais recente.
        var ultimo = descansos.reduce(function (melhor, e) { return !melhor || texto(e.criadoEm) >= texto(melhor.criadoEm) ? e : melhor; }, null);
        var ciclo = ultimo ? texto(ultimo.id) : 'inicio';
        // Cada utilização aponta para o descanso que iniciou seu próprio ciclo.
        // Em sincronizações offline, uma utilização antiga não reaparece depois de
        // um descanso mais recente, mesmo que o relógio dos dispositivos divirja.
        var consumos = evs.filter(function (e) { return e.tipo === 'uso-sorte-200' && !anulados[texto(e.id)] && texto(e.cicloId || 'inicio') === ciclo; });
        var usos = consumos.length;
        return { adquirida: possui, limite: LIMITE, usos: usos, restantes: possui ? Math.max(0, LIMITE - usos) : 0,
            cicloId: ciclo, conflito: usos > LIMITE, consumos: consumos.map(function (e) { return { id: texto(e.id), tipo: e.modalidade, criadoEm: e.criadoEm }; }) };
    }
    function validarD20(valor) {
        var s = texto(valor).trim();
        if (!s)
            return null;
        if (!/^\d{1,2}$/.test(s))
            throw new Error('Informe um resultado de d20 entre 1 e 20, ou deixe em branco.');
        var n = Number(s);
        if (!Number.isInteger(n) || n < 1 || n > 20)
            throw new Error('O d20 deve estar entre 1 e 20.');
        return n;
    }
    function preparar(ficha, livro, modalidade, d20) {
        var s = status(ficha, livro), tipo = texto(modalidade);
        if (!s.adquirida)
            throw new Error('Sorte não está confirmada nesta ficha.');
        if (!Object.prototype.hasOwnProperty.call(TIPOS, tipo))
            throw new Error('Escolha onde o ponto de Sorte será usado.');
        if (s.conflito)
            throw new Error('Há gastos simultâneos de Sorte além do limite. Confira a sincronização antes de continuar.');
        if (s.restantes < 1)
            throw new Error('Os três pontos de Sorte foram gastos. Recupere-os no próximo descanso longo.');
        var valor = validarD20(d20), reg = livro && typeof livro.registro === 'function' ? livro.registro(ficha) : null;
        if (!reg || !Array.isArray(reg.eventos))
            throw new Error('Histórico de Pontos-Chave indisponível.');
        var ev = { id: id(), tipo: 'uso-sorte-200', habilidadeId: 'sorte', cicloId: s.cicloId, modalidade: tipo,
            criadoEm: new Date().toISOString(), origem: 'sorte-200' };
        if (valor !== null)
            ev.d20Extra = valor;
        reg.eventos.push(ev);
        return { registro: reg, evento: ev, restantes: s.restantes - 1, titulo: TIPOS[tipo] };
    }
    function instalar(root) {
        if (root.__shinobiSorte200Instalado)
            return;
        root.__shinobiSorte200Instalado = true;
        var doc = root.document, ocupado = false;
        function ficha() { try {
            return typeof estado !== 'undefined' && estado && typeof estado === 'object' ? estado : root.estado || null;
        }
        catch (_) {
            return root.estado || null;
        } }
        function painel() { return doc.getElementById('shinobiSorte200'); }
        function atualizar() {
            var p = painel(), f = ficha(), livro = root.ShinobiPontosChave;
            if (!p)
                return;
            var s = status(f, livro);
            p.hidden = !s.adquirida;
            if (!s.adquirida)
                return;
            var cont = p.querySelector('[data-sorte200-contador]'), aviso = p.querySelector('[data-sorte200-aviso]');
            if (cont)
                cont.textContent = s.restantes + '/' + s.limite;
            if (aviso)
                aviso.textContent = s.conflito ? 'Conflito de sincronização: há ' + s.usos + ' gastos neste descanso. Nenhum novo gasto será permitido.' :
                    s.restantes ? 'Role um d20 extra e escolha o resultado conforme a regra.' : 'Sem pontos: recupera no descanso longo.';
            var botao = p.querySelector('[data-sorte200-gastar]');
            if (botao)
                botao.disabled = ocupado || s.restantes === 0 || s.conflito;
            p.classList.toggle('sorte200Esgotada', s.restantes === 0);
        }
        function gastar() {
            if (ocupado)
                return;
            var p = painel(), f = ficha(), livro = root.ShinobiPontosChave;
            if (!p || !f || !livro)
                return;
            var tipo = p.querySelector('[data-sorte200-tipo]').value;
            var input = p.querySelector('[data-sorte200-d20]'), valor = input && input.value;
            var plano;
            try {
                plano = preparar(f, livro, tipo, valor);
            }
            catch (e) {
                root.alert(e.message);
                atualizar();
                return;
            }
            var msg = 'Gastar 1 ponto de Sorte em ' + plano.titulo.toLowerCase() + '?\nRestarão ' + plano.restantes + ' de 3.' +
                (plano.evento.d20Extra ? '\nd20 extra informado: ' + plano.evento.d20Extra + '.' : '\nRole o d20 extra à mesa.');
            if (!root.confirm(msg))
                return;
            if (typeof root.persistirEstadoLocal !== 'function') {
                root.alert('Salvamento da ficha indisponível.');
                return;
            }
            ocupado = true;
            var anterior = f.pontosChaveV1;
            try {
                // Recalcular após confirmação, antes de modificar o estado.
                plano = preparar(f, livro, tipo, valor);
                f.pontosChaveV1 = plano.registro;
                var salvo = root.persistirEstadoLocal({ confirmada: true, origem: 'sorte-200', campo: 'pontosChaveV1',
                    antes: anterior, depois: plano.registro, motivo: 'consumo-ponto-sorte' });
                if (salvo !== true)
                    throw new Error('O registro do ponto de Sorte não pôde ser salvo.');
                if (input)
                    input.value = '';
                try {
                    root.dispatchEvent(new CustomEvent('shinobi:pontos-chave-atualizados', { detail: { motivo: 'sorte200' } }));
                }
                catch (_e) { }
            }
            catch (e) {
                if (anterior === undefined)
                    delete f.pontosChaveV1;
                else
                    f.pontosChaveV1 = anterior;
                root.alert(e.message);
            }
            finally {
                ocupado = false;
                atualizar();
            }
        }
        function iniciar() {
            var p = painel();
            if (!p)
                return;
            var b = p.querySelector('[data-sorte200-gastar]');
            if (b && !b.__sorte200Ligado) {
                b.__sorte200Ligado = true;
                b.addEventListener('click', gastar);
            }
            atualizar();
        }
        if (doc.readyState === 'loading')
            doc.addEventListener('DOMContentLoaded', iniciar);
        else
            iniciar();
        ['shinobi:pontos-chave-atualizados', 'shinobi:realtime-aplicado', 'shinobi:realtime-colecao-aplicada', 'shinobi:descanso-curto-confirmado', 'shinobi:descanso-longo-confirmado', 'pageshow'].forEach(function (n) { root.addEventListener(n, atualizar); });
        root.addEventListener('shinobi:ficha-persistida', function (e) { if (!e.detail || !e.detail.campo || ['pontosChaveV1', 'nivel'].indexOf(e.detail.campo) >= 0)
            atualizar(); });
        doc.addEventListener('shinobi:pagechange', function (e) { if (e.detail && e.detail.id === 'batalha')
            atualizar(); });
    }
    return Object.freeze({ versao: '2.5.8.200', limite: LIMITE, tipos: TIPOS, adquirida: adquirida, status: status, validarD20: validarD20, preparar: preparar, instalar: instalar });
});
