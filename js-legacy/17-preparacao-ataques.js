/* GERADO AUTOMATICAMENTE — fonte: js/17-preparacao-ataques.js — app 2.5.8.182. Não editar. */
/* Projetinho Shinobi — preparação não destrutiva da futura automação de ataques.
 * Fonte das propriedades: DOC-20261102-WA0002.pdf, pp. 1-3 e 7.
 * Este módulo é SOMENTE LEITURA: nenhuma fórmula provisória é aplicada à ficha,
 * nenhum ponto-chave é gasto e nenhum dado é salvo automaticamente.
 * Os bônus temporários continuam pertencendo ao motor de efeitos já existente.
 */
(function (raiz, fabrica) {
    "use strict";
    var api = fabrica(raiz);
    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
    if (raiz && typeof raiz.document !== "undefined")
        raiz.ShinobiPreparacaoAtaques = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this), function (raiz) {
    "use strict";
    var VERSAO_ESQUEMA = 1;
    var CONDICAO = "aguardando-regras-do-mestre";
    var FONTE = "Regras Shinobi — PDF de 02/11/2026, página 7";
    var ARMAS = [
        { id: "kunai", nome: "Kunai", grupo: "arremessavel", dano: "1d6", tipoDano: "cortante ou perfurante", propriedades: ["acuidade", "leve", "arremesso"], alcance: [9, 18] },
        { id: "shuriken", nome: "Shuriken", grupo: "arremessavel", dano: "1d4", tipoDano: "perfurante", propriedades: ["acuidade", "leve", "arremesso"], alcance: [18, 36] },
        { id: "shuriken_vento", nome: "Shuriken de Vento Demoníaca", grupo: "arremessavel", dano: "1d10", tipoDano: "cortante", propriedades: ["especial", "arremesso"], alcance: [18, 36] },
        { id: "agulha", nome: "Agulha", grupo: "arremessavel", dano: "1", tipoDano: "perfurante", propriedades: ["especial", "arremesso"], alcance: [15, 30] },
        { id: "papel_bomba", nome: "Papel Bomba", grupo: "arremessavel", dano: "1d6", tipoDano: "fogo", propriedades: ["especial"] },
        { id: "arco_curto", nome: "Arco Curto", grupo: "distancia", dano: "1d6", tipoDano: "perfurante", propriedades: [] },
        { id: "arco_longo", nome: "Arco Longo", grupo: "distancia", dano: "1d8", tipoDano: "perfurante", propriedades: [] },
        { id: "arco_composto", nome: "Arco Composto", grupo: "distancia", dano: "1d10", tipoDano: "perfurante", propriedades: [] },
        { id: "funda", nome: "Funda", grupo: "distancia", dano: "1d6", tipoDano: "contusão", propriedades: ["leve", "recarga"] },
        { id: "balista", nome: "Balista", grupo: "distancia", dano: "5d10", tipoDano: "perfurante", propriedades: ["especial", "pesado", "recarga"] },
        { id: "dispositivo_disparo", nome: "Dispositivo de Disparo", grupo: "distancia", dano: null, tipoDano: null, propriedades: ["especial", "recarga"] },
        { id: "zarabatana", nome: "Zarabatana", grupo: "distancia", dano: "1", tipoDano: "perfurante", propriedades: ["especial", "recarga"] },
        { id: "bastao", nome: "Bastão", grupo: "corpo-a-corpo", dano: "1d6", tipoDano: "contusão", propriedades: ["leve", "duas maos", "alcance"] },
        { id: "foice_curta", nome: "Foice Curta", grupo: "corpo-a-corpo", dano: "1d6", tipoDano: "cortante", propriedades: ["acuidade", "leve"] },
        { id: "lanca", nome: "Lança", grupo: "corpo-a-corpo", dano: "1d8", tipoDano: "perfurante", propriedades: ["duas maos", "alcance"] },
        { id: "chicote", nome: "Chicote", grupo: "corpo-a-corpo", dano: "1d8", tipoDano: "cortante", propriedades: ["leve", "alcance"] },
        { id: "tanto", nome: "Tanto", grupo: "corpo-a-corpo", dano: "1d6", tipoDano: "cortante", propriedades: ["leve", "arremesso"], alcance: [18, 27] },
        { id: "wakizaki", nome: "Wakizaki (Wakizashi)", grupo: "corpo-a-corpo", dano: "1d8", tipoDano: "cortante", propriedades: ["versatil"], observacao: "A ficha-exemplo da p. 52 mostra 1d8/1d10. Confirmado pelo mestre: utiliza Destreza; duas mãos alteram o dado para 1d10." },
        { id: "katana", nome: "Katana", grupo: "corpo-a-corpo", dano: "1d12", tipoDano: "cortante", propriedades: ["duas maos", "pesada"] },
        { id: "corrente", nome: "Corrente", grupo: "corpo-a-corpo", dano: "Modificador de Força x3", tipoDano: null, propriedades: ["pesada", "duas maos"], observacao: "Confirmado pelo mestre: dano fixo pelo multiplicador; não soma o atributo novamente." },
        { id: "nunchaku", nome: "Nunchaku", grupo: "corpo-a-corpo", dano: "Modificador de Destreza x2", tipoDano: null, propriedades: ["leve", "duas maos"], observacao: "Confirmado pelo mestre: dano fixo pelo multiplicador; não soma o atributo novamente." }
    ];
    /* Catálogo informativo; nenhum efeito é ativado por adquirir uma entrada. */
    var HABILIDADES = [
        { id: "habilidade_com_armas", nome: "Habilidade com Armas", custo: 2, area: "proficiência", pagina: 3, escolhas: "2 armas não especiais" },
        { id: "versatilidade_com_armas", nome: "Versatilidade com Armas", custo: 4, area: "proficiência", pagina: 3, escolhas: "1 arma especial" },
        { id: "duelista", nome: "Duelista", custo: 2, area: "dano", pagina: 3 },
        { id: "pontaria", nome: "Pontaria", custo: 2, area: "acerto", pagina: 3 },
        { id: "combate_com_duas_armas", nome: "Combate com Duas Armas", custo: 2, area: "dano", pagina: 3 },
        { id: "ambidestria", nome: "Ambidestria", custo: 2, area: "combate", pagina: 3 },
        { id: "especialista_em_shuriken", nome: "Especialista em Shuriken", custo: 4, area: "armas", pagina: 3, requisito: "Destreza 15" },
        { id: "armas_grandes", nome: "Armas Grandes", custo: 2, area: "dano", pagina: 3 },
        { id: "duelista_defensivo", nome: "Duelista Defensivo", custo: 2, area: "defesa", pagina: 3 },
        { id: "melhoria_atributo", nome: "Melhoria de Atributo", custo: 2, area: "atributos", pagina: 2 },
        { id: "melhoria_deslocamento", nome: "Melhoria de Deslocamento", custo: 2, area: "movimento", pagina: 2 },
        { id: "melhoria_vida", nome: "Melhoria de Vida", custo: 2, area: "recursos", pagina: 2 },
        { id: "melhoria_chakra", nome: "Melhoria de Chakra", custo: 2, area: "recursos", pagina: 2 },
        { id: "velocidade_ataque", nome: "Velocidade de Ataque", custo: 4, area: "ataques", pagina: 2, requisito: "Nível 15" },
        { id: "primeiro_portao", nome: "Primeiro Portão", custo: 4, area: "taijutsu", pagina: 2 },
        { id: "terceiro_portao", nome: "Terceiro Portão", custo: 4, area: "taijutsu", pagina: 2, requisito: "Primeiro Portão e nível 5" },
        { id: "quinto_portao", nome: "Quinto Portão", custo: 6, area: "taijutsu", pagina: 2, requisito: "Terceiro Portão e nível 10" },
        { id: "setimo_portao", nome: "Sétimo Portão", custo: 8, area: "taijutsu", pagina: 2, requisito: "Quinto Portão e nível 15" },
        { id: "oitavo_portao", nome: "Oitavo Portão", custo: 10, area: "taijutsu", pagina: 2, requisito: "Sétimo Portão e nível 18" },
        { id: "fanatico", nome: "Fanático", custo: 6, area: "criticos", pagina: 4, requisito: "Nível 8" }
    ];
    var APELIDOS = {
        "wakizashi": "wakizaki", "wakizaki katana uma mao": "wakizaki",
        "wakizashi katana uma mao": "wakizaki", "agulhas": "agulha", "senbon": "agulha",
        "shuriken de vento": "shuriken_vento", "shuriken de vento demoniaca": "shuriken_vento",
        "shuriken de vento demoniaco": "shuriken_vento", "foice": "foice_curta", "tanto katana curtinha": "tanto",
        "katana duas maos": "katana", "nunchakus": "nunchaku", "lancas": "lanca"
    };
    function copiar(valor) { return JSON.parse(JSON.stringify(valor)); }
    function normalizar(texto) { return String(texto == null ? "" : texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").trim(); }
    function textoValor(valor) { return valor === null || valor === undefined ? "" : String(valor); }
    function numero(valor, alternativa) {
        if (valor === null || valor === undefined || String(valor).trim() === "")
            return alternativa;
        var n = Number(String(valor).replace(",", "."));
        return Number.isFinite(n) ? n : alternativa;
    }
    function inteiro(valor, alternativa) { var n = numero(valor, alternativa); return Number.isInteger(n) ? n : alternativa; }
    var ARMAS_POR_ID = {};
    var NOMES = {};
    ARMAS.forEach(function (item) { ARMAS_POR_ID[item.id] = item; NOMES[normalizar(item.nome)] = item.id; NOMES[normalizar(item.id)] = item.id; });
    Object.keys(APELIDOS).forEach(function (chave) { NOMES[normalizar(chave)] = APELIDOS[chave]; });
    function obterArma(referencia) {
        var nome = normalizar(referencia);
        var id = NOMES[nome] || null;
        return id ? copiar(ARMAS_POR_ID[id]) : null;
    }
    function identificarAtaque(item) {
        if (!item || typeof item !== "object")
            return null;
        if (normalizar(item.tipo) === "desarmado")
            return { id: "desarmado", nome: "Ataque desarmado", grupo: "desarmado", dano: null, origem: "Dano-base depende do clã; ver prévia confirmada do mestre" };
        return obterArma(item.itemInventario) || obterArma(item.nome) || null;
    }
    function catalogoArmas() { return copiar(ARMAS); }
    function catalogoHabilidades() { return copiar(HABILIDADES); }
    function buscarHabilidade(id) { var alvo = String(id || "").trim(); var encontrado = HABILIDADES.find(function (item) { return item.id === alvo; }); return encontrado ? copiar(encontrado) : null; }
    /* Estrutura FUTURA, ainda não aplicada nem persistida automaticamente. */
    function criarEstruturaVazia() { return { versao: VERSAO_ESQUEMA, aquisicoes: [], proficienciasExtras: [], ajustesMestre: [] }; }
    function lerEstrutura(ficha) {
        var registro = ficha && ficha.automacaoAtaques;
        if (!registro || typeof registro !== "object" || Array.isArray(registro))
            return criarEstruturaVazia();
        return {
            versao: VERSAO_ESQUEMA,
            aquisicoes: Array.isArray(registro.aquisicoes) ? copiar(registro.aquisicoes) : [],
            proficienciasExtras: Array.isArray(registro.proficienciasExtras) ? copiar(registro.proficienciasExtras) : [],
            ajustesMestre: Array.isArray(registro.ajustesMestre) ? copiar(registro.ajustesMestre) : []
        };
    }
    function criarRascunhoAquisicao(habilidadeId, opcoes) {
        var habilidade = buscarHabilidade(habilidadeId);
        if (!habilidade)
            throw new Error("Habilidade não cadastrada no catálogo de preparação.");
        opcoes = opcoes || {};
        var nivel = inteiro(opcoes.nivel, 0);
        if (nivel < 1 || nivel > 20)
            throw new Error("Informe um nível de aquisição entre 1 e 20.");
        return {
            id: String(opcoes.id || ""), habilidadeId: habilidade.id, area: habilidade.area,
            custoReferencial: habilidade.custo, nivelAquisicao: nivel,
            origem: String(opcoes.origem || "pontos-chave"),
            escolhas: copiar(opcoes.escolhas || {}), observacoes: String(opcoes.observacoes || ""),
            status: CONDICAO
        };
    }
    function progressoSomenteLeitura(ficha) {
        var progresso = ficha && ficha.progressaoFixa || {};
        return {
            nivel: inteiro(ficha && ficha.nivel, inteiro(progresso.level, 1)),
            proficienciaRegistrada: numero(ficha && ficha.proficiencia, numero(progresso.proficiency, null)),
            pontosChaveNaProgressao: numero(progresso.keyPointsTotal, null),
            pontosClaRegistrados: numero(progresso.clanPointsEarned, null),
            interpretacaoPontosChave: CONDICAO
        };
    }
    function resumirAtaque(ataque, indice) {
        var catalogado = identificarAtaque(ataque);
        var avisos = ["Cálculos disponíveis na prévia apenas quando os atributos e condições forem conhecidos."];
        if (!catalogado)
            avisos.push("Ataque personalizado ou nome de arma não identificado no catálogo.");
        if (catalogado && catalogado.id === "agulha")
            avisos.push("Agulha é Especial; proficiência antiga é preservada até migração para o sistema novo.");
        if (catalogado && catalogado.id === "wakizaki")
            avisos.push("Wakizashi: Destreza para acerto e dano, 1d10 ao empunhar com duas mãos.");
        if (catalogado && (catalogado.id === "corrente" || catalogado.id === "nunchaku"))
            avisos.push("Dano por multiplicador fixo, sem somar modificador novamente.");
        return {
            indice: indice, ataqueId: String(ataque && ataque.ataqueId || ""),
            nome: String(ataque && ataque.nome || ""), tipo: String(ataque && ataque.tipo || "armado"),
            itemInventario: String(ataque && ataque.itemInventario || ""),
            manual: { bonusAcerto: textoValor(ataque && ataque.bonusAcerto), dano: textoValor(ataque && ataque.dano), bonusDano: textoValor(ataque && ataque.bonusDano) },
            armaCatalogada: catalogado, status: CONDICAO, avisos: avisos
        };
    }
    function inspecionarFicha(ficha) {
        ficha = ficha && typeof ficha === "object" && !Array.isArray(ficha) ? ficha : {};
        return {
            versao: VERSAO_ESQUEMA, status: CONDICAO,
            progresso: progressoSomenteLeitura(ficha),
            ataques: (Array.isArray(ficha.armados) ? ficha.armados : []).map(resumirAtaque),
            pontosChave: lerEstrutura(ficha),
            jutsusCadastrados: Array.isArray(ficha.jutsus) ? ficha.jutsus.length : 0,
            camposMantidosManuais: ["armados[].bonusAcerto", "armados[].dano", "armados[].bonusDano"]
        };
    }
    /* Acessa a ficha carregada no app somente quando chamado; NUNCA modifica estado. */
    function inspecionarFichaAtual() {
        var ficha = {};
        try {
            if (typeof estado !== "undefined" && estado && typeof estado === "object")
                ficha = estado;
        }
        catch (_erro) { }
        var resultado = inspecionarFicha(ficha);
        try {
            if (raiz && typeof raiz.obterEfeitosJutsuBatalhaAtivos === "function") {
                var ativos = raiz.obterEfeitosJutsuBatalhaAtivos();
                resultado.efeitosTemporariosExistentes = Array.isArray(ativos) ? ativos.length : 0;
            }
        }
        catch (_erro) {
            resultado.efeitosTemporariosExistentes = null;
        }
        return resultado;
    }
    return Object.freeze({
        versao: VERSAO_ESQUEMA, status: CONDICAO, fonteArmas: FONTE,
        catalogoArmas: catalogoArmas, catalogoHabilidades: catalogoHabilidades,
        obterArma: obterArma, identificarAtaque: identificarAtaque, buscarHabilidade: buscarHabilidade,
        criarEstruturaVazia: criarEstruturaVazia, lerEstrutura: lerEstrutura,
        criarRascunhoAquisicao: criarRascunhoAquisicao,
        inspecionarFicha: inspecionarFicha, inspecionarFichaAtual: inspecionarFichaAtual
    });
});
