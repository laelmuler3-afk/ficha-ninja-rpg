/* GERADO AUTOMATICAMENTE — fonte: js/16-pericias.js — app 2.5.8.154. Não editar. */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* Ficha Ninja 2.5.3 — bônus automáticos das perícias com atualização localizada. */
(function () {
    "use strict";
    if (window.__bonusPericiasV214)
        return;
    window.__bonusPericiasV214 = true;
    var PERICIAS = [
        { chave: "p_acrobacia", atributo: "destreza", sigla: "DES", nome: "Acrobacia" },
        { chave: "p_atletismo", atributo: "forca", sigla: "FOR", nome: "Atletismo" },
        { chave: "p_atuacao", atributo: "carisma", sigla: "CAR", nome: "Atuação" },
        { chave: "p_chakra", atributo: "inteligencia", sigla: "INT", nome: "Chakra" },
        { chave: "p_enganacao", atributo: "carisma", sigla: "CAR", nome: "Enganação" },
        { chave: "p_furtividade", atributo: "destreza", sigla: "DES", nome: "Furtividade" },
        { chave: "p_historia", atributo: "inteligencia", sigla: "INT", nome: "História" },
        { chave: "p_intimidacao", atributo: "carisma", sigla: "CAR", nome: "Intimidação" },
        { chave: "p_investigacao", atributo: "inteligencia", sigla: "INT", nome: "Investigação" },
        { chave: "p_animais", atributo: "sabedoria", sigla: "SAB", nome: "Lidar com Animais" },
        { chave: "p_medicina", atributo: "inteligencia", sigla: "INT", nome: "Medicina" },
        { chave: "p_natureza", atributo: "sabedoria", sigla: "SAB", nome: "Natureza" },
        { chave: "p_percepcao", atributo: "sabedoria", sigla: "SAB", nome: "Percepção" },
        { chave: "p_persuasao", atributo: "carisma", sigla: "CAR", nome: "Persuasão" },
        { chave: "p_prestidigitacao", atributo: "destreza", sigla: "DES", nome: "Prestidigitação" },
        { chave: "p_sensorial", atributo: "constituicao", sigla: "CON", nome: "Sensorial" },
        { chave: "p_sobrevivencia", atributo: "sabedoria", sigla: "SAB", nome: "Sobrevivência" }
    ];
    var POR_CHAVE = new Map(PERICIAS.map(function (item) { return [item.chave, item]; }));
    var frame = null;
    var timersAtrasados = new Map();
    function numero(valor, padrao) {
        if (padrao === void 0) { padrao = 0; }
        var convertido = Number(String(valor !== null && valor !== void 0 ? valor : "").replace(",", "."));
        return Number.isFinite(convertido) ? convertido : padrao;
    }
    function campo(chave) {
        return document.querySelector("[data-save=\"".concat(chave, "\"]"));
    }
    function modificadorAtributo(chave) {
        var _a;
        var pontuacao = numero((_a = campo(chave)) === null || _a === void 0 ? void 0 : _a.value, 0);
        if (typeof window.calcularModificador === "function") {
            return numero(window.calcularModificador(pontuacao), 0);
        }
        return pontuacao > 0 ? Math.floor((pontuacao - 10) / 2) : 0;
    }
    function comSinal(valor) {
        var n = numero(valor, 0);
        return n >= 0 ? "+".concat(n) : String(n);
    }
    function garantirEstrutura(item) {
        var input = campo(item.chave);
        var label = input === null || input === void 0 ? void 0 : input.closest("label");
        if (!input || !label)
            return null;
        label.classList.add("periciaItem");
        label.dataset.pericia = item.chave;
        label.dataset.atributo = item.atributo;
        input.classList.add("periciaCheckbox");
        var nome = label.querySelector(".periciaNome");
        if (!nome) {
            nome = Array.from(label.children).find(function (el) { return el.tagName === "SPAN" && !el.classList.contains("periciaBonus"); }) || null;
            if (nome)
                nome.classList.add("periciaNome");
        }
        var bonus = label.querySelector(".periciaBonus");
        if (!bonus) {
            bonus = document.createElement("strong");
            bonus.className = "periciaBonus";
            bonus.setAttribute("aria-live", "polite");
            bonus.textContent = "+0";
            if (nome)
                label.insertBefore(bonus, nome);
            else
                label.appendChild(bonus);
        }
        return { input: input, label: label, nome: nome, bonus: bonus };
    }
    function calcular(item) {
        var _a;
        var input = campo(item.chave);
        var proficiente = Boolean(input === null || input === void 0 ? void 0 : input.checked);
        var modificador = modificadorAtributo(item.atributo);
        var proficiencia = proficiente ? numero((_a = campo("proficiencia")) === null || _a === void 0 ? void 0 : _a.value, 0) : 0;
        return {
            modificador: modificador,
            proficiente: proficiente,
            proficiencia: proficiencia,
            total: modificador + proficiencia
        };
    }
    function atualizarItem(item) {
        var estrutura = garantirEstrutura(item);
        if (!estrutura)
            return;
        var dados = calcular(item);
        estrutura.bonus.textContent = comSinal(dados.total);
        estrutura.label.classList.toggle("proficiente", dados.proficiente);
        estrutura.bonus.classList.toggle("proficiente", dados.proficiente);
        var detalhe = dados.proficiente
            ? "Modificador ".concat(comSinal(dados.modificador), " + profici\u00EAncia ").concat(comSinal(dados.proficiencia))
            : "Modificador ".concat(comSinal(dados.modificador));
        estrutura.label.title = "".concat(item.nome, " (").concat(item.sigla, "): ").concat(comSinal(dados.total), " \u2014 ").concat(detalhe);
        estrutura.label.setAttribute("aria-label", "".concat(item.nome, ", b\u00F4nus ").concat(comSinal(dados.total)).concat(dados.proficiente ? ", proficiente" : ""));
    }
    function atualizar() {
        PERICIAS.forEach(atualizarItem);
    }
    function agendar(atraso) {
        if (atraso === void 0) { atraso = 0; }
        if (atraso > 0) {
            var anterior = timersAtrasados.get(atraso);
            if (anterior)
                clearTimeout(anterior);
            var timer = setTimeout(function () {
                timersAtrasados.delete(atraso);
                agendar(0);
            }, atraso);
            timersAtrasados.set(atraso, timer);
            return;
        }
        if (frame)
            cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
            frame = null;
            atualizar();
        });
    }
    function iniciar() {
        atualizar();
        agendar(180);
    }
    var atributos = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "proficiencia"];
    var seletorAtualizacao = __spreadArray(__spreadArray([], __read(atributos.map(function (chave) { return "[data-save=\"".concat(chave, "\"]"); })), false), __read(PERICIAS.map(function (item) { return "[data-save=\"".concat(item.chave, "\"]"); })), false).join(",");
    document.addEventListener("input", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(seletorAtualizacao))
            agendar();
    }, true);
    document.addEventListener("change", function (evento) {
        var _a;
        if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(seletorAtualizacao))
            agendar();
    }, true);
    document.addEventListener("click", function (evento) {
        var _a, _b;
        if ((_b = (_a = evento.target) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, "#atributos .periciaItem"))
            agendar();
    }, true);
    document.addEventListener("shinobi:pagechange", function (evento) {
        var _a;
        if (((_a = evento.detail) === null || _a === void 0 ? void 0 : _a.id) === "atributos")
            agendar();
    });
    window.addEventListener("pageshow", function () { return agendar(80); });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    }
    else {
        iniciar();
    }
    window.atualizarBonusPericias = function () { return agendar(); };
    window.calcularBonusPericia = function (chave) {
        var item = POR_CHAVE.get(chave);
        return item ? calcular(item) : null;
    };
})();
