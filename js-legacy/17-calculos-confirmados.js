/* GERADO AUTOMATICAMENTE — fonte: js/17-calculos-confirmados.js — app 2.5.8.182. Não editar. */
/* Projetinho Shinobi 2.5.8.182 — prévia de ataques, SEM escrita na ficha.
 * Regras: respostas do mestre Keven ao questionário de 02/11/2026,
 * questões 01–06, 13–14 e regras impressas nas pp. 1, 3 e 7.
 * Armas sem atributo confirmado não recebem fórmulas presumidas.
 */
(function (raiz, fabrica) {
    "use strict";
    var api = fabrica();
    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
    if (raiz && raiz.document)
        raiz.ShinobiCalculosConfirmados = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this), function () {
    "use strict";
    var VERSAO = "2.5.8.182";
    function normalizar(valor) {
        return String(valor == null ? "" : valor).normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }
    function valorNumerico(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "")
            return null;
        var numero = Number(valor);
        return Number.isFinite(numero) ? numero : null;
    }
    function modificadorAtributo(valor) {
        var numero = valorNumerico(valor);
        /* No app, zero significa atributo ainda não preenchido. */
        if (numero === null || numero < 1 || numero > 40)
            return null;
        return Math.floor((numero - 10) / 2);
    }
    function proficienciaDoNivel(nivel) {
        var n = valorNumerico(nivel);
        if (!Number.isInteger(n) || n < 1 || n > 20)
            return null;
        return Math.floor((n - 1) / 4) + 2;
    }
    function sinal(n) { return n >= 0 ? "+" + n : String(n); }
    function juntarDano(base, bonus) {
        if (typeof base === "number")
            return String(base + bonus);
        return String(base) + (bonus ? sinal(bonus) : "");
    }
    function criticoDano(base, bonus) {
        /* Crítico duplica quantidade de DADOS, nunca bônus fixo. */
        if (typeof base === "number")
            return String(base + bonus);
        var dado = /^(\d+)d(\d+)$/i.exec(String(base).trim());
        if (!dado)
            return null;
        return juntarDano(String(Number(dado[1]) * 2) + "d" + dado[2], bonus);
    }
    function extrairArma(ataque, preparacao) {
        if (!preparacao || typeof preparacao.identificarAtaque !== "function")
            return null;
        return preparacao.identificarAtaque(ataque);
    }
    function fonteProficiencia(ficha, armaId) {
        if (armaId === "desarmado" || armaId === "kunai" || armaId === "shuriken")
            return "confirmada";
        var itens = ficha && ficha.automacaoAtaques && ficha.automacaoAtaques.proficienciasExtras;
        if (Array.isArray(itens) && itens.some(function (p) { return p && p.armaId === armaId; }))
            return "registrada";
        return "nao-registrada";
    }
    function regraArma(arma, ficha) {
        if (!arma)
            return null;
        var id = arma.id;
        var cla = normalizar(ficha && ficha.cla);
        if (id === "desarmado") {
            if (cla.indexOf("hyuuga") >= 0 || cla.indexOf("hyuga") >= 0)
                return { atributos: ["forca"], dano: "1d4", semModDano: true, observacao: "Hyuuga: segundo golpe após acertar (ação ainda não especificada)." };
            if (cla.indexOf("aburame") >= 0)
                return { atributos: ["forca"], dano: "1d6", aburame: true, observacao: "Aburame: não soma modificador positivo ao dano." };
            return { atributos: ["forca"], dano: "1d6" };
        }
        if (id === "wakizaki")
            return { atributos: ["destreza"], dano: "1d8", duasMaos: "1d10" };
        if (id === "agulha")
            return { atributos: ["destreza"], dano: 1, semModDano: true };
        if (id === "corrente")
            return { atributos: ["forca"], multiplicador: 3, semModDano: true };
        if (id === "nunchaku")
            return { atributos: ["destreza"], multiplicador: 2, semModDano: true };
        if (Array.isArray(arma.propriedades) && arma.propriedades.indexOf("acuidade") >= 0)
            return { atributos: ["forca", "destreza"], dano: arma.dano, acuidade: true };
        return null;
    }
    function calcularPrevia(ficha, ataque, preparacao) {
        ficha = ficha && typeof ficha === "object" ? ficha : {};
        ataque = ataque && typeof ataque === "object" ? ataque : {};
        var arma = extrairArma(ataque, preparacao);
        var resultado = {
            versao: VERSAO, status: "pendente", armaId: arma ? arma.id : null,
            proficiencia: arma ? fonteProficiencia(ficha, arma.id) : "desconhecida",
            proficienciaNivel: proficienciaDoNivel(ficha.nivel),
            variantes: [], avisos: ["Somente prévia: não inclui talentos não validados, bônus temporários nem alterações de combate."],
            modificaFicha: false
        };
        if (!arma) {
            resultado.avisos.push("Ataque personalizado ou arma não identificada: cálculo manual preservado.");
            return resultado;
        }
        /* Taijutsu Básico: dois golpes como AB, sem bônus de QUALQUER fonte. */
        if (arma.id === "desarmado" && normalizar(ataque.nome).indexOf("taijutsu basico") >= 0) {
            var hyuuga = normalizar(ficha.cla).indexOf("hyuuga") >= 0 || normalizar(ficha.cla).indexOf("hyuga") >= 0;
            var dadoBasico = hyuuga ? "1d4" : "1d6";
            resultado.status = "calculado";
            resultado.proficiencia = "nao-aplicavel";
            resultado.variantes.push({ atributo: null, modo: "2 golpes (ação bônus)", acertoSemProficiencia: 0,
                acertoComProficiencia: 0, dano: dadoBasico, danoCritico: criticoDano(dadoBasico, 0), bonusAtributo: 0, bonusDano: 0 });
            resultado.avisos.push("Taijutsu Básico: nenhum bônus de acerto ou dano, inclusive atributo, proficiência e efeitos.");
            return resultado;
        }
        var regra = regraArma(arma, ficha);
        if (!regra) {
            resultado.avisos.push("O atributo desta arma ainda não foi definido pelo mestre.");
            return resultado;
        }
        if (resultado.proficienciaNivel === null) {
            resultado.avisos.push("Informe um nível válido (1 a 20) para calcular a proficiência.");
            return resultado;
        }
        resultado.avisos.push("Prévia do ataque comum na ação ATACAR; golpes de ação bônus e jutsus podem seguir regras específicas.");
        if (regra.acuidade)
            resultado.avisos.push("Acuidade: escolha Força ou Destreza ao realizar o ataque; ambas são mostradas.");
        if (regra.observacao)
            resultado.avisos.push(regra.observacao);
        if (resultado.proficiencia === "registrada")
            resultado.avisos.push("A proficiência adicional está apenas registrada: confirmação da compra ainda pendente.");
        if (resultado.proficiencia === "nao-registrada")
            resultado.avisos.push("Sem proficiência comprovada: são exibidos os resultados com e sem proficiência.");
        regra.atributos.forEach(function (atributo) {
            var mod = modificadorAtributo(ficha[atributo]);
            if (mod === null) {
                resultado.avisos.push("Preencha o atributo " + (atributo === "forca" ? "Força" : "Destreza") + " na ficha.");
                return;
            }
            var bonusDano = regra.semModDano ? 0 : regra.aburame ? Math.min(0, mod) : mod;
            var dado = regra.multiplicador ? mod * regra.multiplicador : regra.dano;
            var modos = regra.duasMaos ? [
                { nome: "1 mão", dado: dado }, { nome: "2 mãos", dado: regra.duasMaos }
            ] : [{ nome: regra.acuidade ? "usar " + (atributo === "forca" ? "FOR" : "DES") : "normal", dado: dado }];
            modos.forEach(function (modo) {
                resultado.variantes.push({
                    atributo: atributo, modo: modo.nome,
                    acertoSemProficiencia: mod,
                    acertoComProficiencia: mod + resultado.proficienciaNivel,
                    dano: juntarDano(modo.dado, bonusDano),
                    danoCritico: criticoDano(modo.dado, bonusDano),
                    bonusAtributo: mod, bonusDano: bonusDano
                });
            });
        });
        if (resultado.variantes.length)
            resultado.status = "calculado";
        return resultado;
    }
    function custoNovaNatureza(ficha, custoBase, tipo) {
        var valor = valorNumerico(custoBase);
        if (valor === null || valor < 0)
            return null;
        var novoElemento = tipo === "nova-elemental";
        var sarutobi = normalizar(ficha && ficha.cla).indexOf("sarutobi") >= 0;
        return {
            custoBase: valor, custoProposto: novoElemento && sarutobi ? valor / 2 : valor,
            descontoAplicavel: novoElemento && sarutobi,
            pendente: tipo !== "nova-elemental",
            aviso: tipo !== "nova-elemental" ? "Desconto para evoluir natureza já conhecida não confirmado." : "Apenas simulação: nenhum ponto-chave foi gasto."
        };
    }
    return Object.freeze({ versao: VERSAO, modificadorAtributo: modificadorAtributo,
        proficienciaDoNivel: proficienciaDoNivel, calcularPrevia: calcularPrevia,
        custoNovaNatureza: custoNovaNatureza });
});
