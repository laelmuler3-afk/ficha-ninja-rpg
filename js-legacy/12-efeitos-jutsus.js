/* GERADO AUTOMATICAMENTE — fonte: js/12-efeitos-jutsus.js — app 2.5.8.154. Não editar. */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
/* Shinobi 1.10.0 — motor estruturado com reparo de efeitos automáticos em fichas antigas. */
(function () {
    "use strict";
    if (window.__motorEfeitosEstruturadosV110)
        return;
    window.__motorEfeitosEstruturadosV110 = true;
    var VERSAO = "1.10.0";
    var VERSAO_EFEITOS = "1.2.0";
    var CHAVE_ESTADO = "efeitosBatalhaAtivos";
    var URL_REGISTRO = "data/efeitos-jutsus.json?v=".concat(encodeURIComponent(window.APP_VERSION || VERSAO), "-").concat(VERSAO_EFEITOS);
    var ATRIBUTOS = {
        forca: { rotulo: "FOR", id: "modForca" },
        destreza: { rotulo: "DES", id: "modDestreza" },
        constituicao: { rotulo: "CON", id: "modConstituicao" },
        inteligencia: { rotulo: "INT", id: "modInteligencia" },
        sabedoria: { rotulo: "SAB", id: "modSabedoria" },
        carisma: { rotulo: "CAR", id: "modCarisma" }
    };
    var ALVOS_AUTOMATICOS = new Set(__spreadArray([
        "ca", "furtividade", "velocidade"
    ], __read(Object.keys(ATRIBUTOS).map(function (chave) { return "mod_".concat(chave); })), false));
    var CONDICOES_DE_ESCOPO = new Set([
        "contra_ataques",
        "contra_ataques_distancia"
    ]);
    var CONDICOES_COM_CONFIRMACAO = new Set([
        "resultado",
        "apos_ataque_escolhido"
    ]);
    var ROTULOS_ALVO = {
        ca: "CA",
        furtividade: "Furtividade",
        velocidade: "Velocidade",
        mod_forca: "Mod. FOR",
        mod_destreza: "Mod. DES",
        mod_constituicao: "Mod. CON",
        mod_inteligencia: "Mod. INT",
        mod_sabedoria: "Mod. SAB",
        mod_carisma: "Mod. CAR",
        jogada_ataque: "Jogada de ataque",
        jogada_ataque_desarmado: "Ataque desarmado",
        dano: "Dano",
        dano_corpo_a_corpo: "Dano corpo a corpo",
        dano_desarmado: "Dano desarmado",
        bonus_ataque_dano: "Ataque e dano",
        acao: "Ações",
        acao_bonus: "Ações bônus",
        ataque_desarmado: "Ataques desarmados",
        ataques_acao_bonus: "Ataques na ação bônus",
        pv: "PV",
        pv_temporario: "PV temporários",
        chakra: "Chakra",
        empurrao: "Empurrão",
        caido: "Caído",
        atordoado: "Atordoado",
        paralisado: "Paralisado",
        agarrado: "Agarrado",
        impedido: "Impedido",
        sangrando: "Sangrando",
        queimando: "Queimando",
        cego: "Cego",
        surdo: "Surdo",
        amedrontado: "Amedrontado",
        inconsciente: "Inconsciente",
        exaustao: "Exaustão"
    };
    var APLICACOES_USUARIO = new Set([
        "usuario", "ataques_usuario", "ataque_usuario", "armas_usuario", "jutsus_usuario"
    ]);
    var APLICACOES_EXTERNAS = new Set([
        "alvo", "aliado", "aliados", "aliados_area", "usuario_ou_aliado",
        "inimigos_area", "todos_area", "alvos_area", "criaturas_area",
        "criaturas_hostis", "criaturas_adjacentes_alvo", "atacante", "invocacao"
    ]);
    var APLICACOES_COM_NOME_DE_ALVO = new Set([
        "alvo", "aliado", "usuario_ou_aliado", "atacante"
    ]);
    var registro = null;
    var registroPorId = new Map();
    var registroPorNome = new Map();
    var registroPorNomeFlexivel = new Map();
    var promessaRegistro = null;
    var renderizando = false;
    var quadroAtualizacao = null;
    function numero(valor, padrao) {
        if (padrao === void 0) { padrao = 0; }
        var texto = String(valor !== null && valor !== void 0 ? valor : "").trim().replace(",", ".");
        if (!texto)
            return padrao;
        var n = Number(texto);
        return Number.isFinite(n) ? n : padrao;
    }
    function comSinal(valor) {
        var n = numero(valor, 0);
        return n > 0 ? "+".concat(n) : String(n);
    }
    function escaparHtml(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function normalizar(valor) {
        return String(valor !== null && valor !== void 0 ? valor : "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }
    function slug(valor) {
        return normalizar(valor)
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "efeito";
    }
    function chaveNomeFlexivel(valor) {
        return normalizar(valor)
            .replace(/\([^)]*\)/g, " ")
            .replace(/\brequer\s+(?:tutor|habilidade)\b/g, " ")
            .replace(/silenciosos/g, "silensiosos")
            .replace(/[^a-z0-9]+/g, "")
            .trim();
    }
    function clonar(valor) {
        try {
            return JSON.parse(JSON.stringify(valor));
        }
        catch (_erro) {
            return valor;
        }
    }
    function salvarEstado(contexto) {
        if (contexto === void 0) { contexto = {}; }
        try {
            if (typeof persistirEstadoLocal === "function")
                return persistirEstadoLocal(contexto);
            if (typeof persistirSemRender === "function")
                return persistirSemRender(contexto);
            if (typeof CHAVE !== "undefined") {
                localStorage.setItem(CHAVE, JSON.stringify(estado));
                return true;
            }
        }
        catch (erro) {
            console.warn("Não foi possível salvar os efeitos da batalha.", erro);
        }
        return false;
    }
    function emitirEfeitoItemConfirmado(item, _a) {
        var _b, _c;
        var _d = _a === void 0 ? {} : _a, _e = _d.deleted, deleted = _e === void 0 ? false : _e, _f = _d.reason, reason = _f === void 0 ? "alteracao-confirmada" : _f;
        var itemId = String((item === null || item === void 0 ? void 0 : item.id) || "").trim();
        if (!itemId)
            return;
        try {
            window.dispatchEvent(new CustomEvent("shinobi:colecao-item-confirmado", { detail: {
                    confirmed: true,
                    collection: "efeitosBatalha",
                    itemId: itemId,
                    value: deleted ? undefined : clonar(item),
                    identityKey: ((_c = (_b = window.ShinobiItemIdentity) === null || _b === void 0 ? void 0 : _b.identityKey) === null || _c === void 0 ? void 0 : _c.call(_b, "efeitosBatalha", item)) || "",
                    deleted: Boolean(deleted),
                    source: "efeitos-jutsu",
                    reason: reason
                } }));
        }
        catch (_erro) { }
    }
    function nivelNatureza(id) {
        var _a;
        if (!id)
            return 0;
        if ((_a = window.RegrasNaturezaShinobi) === null || _a === void 0 ? void 0 : _a.nivelNatureza) {
            return numero(window.RegrasNaturezaShinobi.nivelNatureza(id), 0);
        }
        return Math.max(0, Math.min(7, Math.trunc(numero(estado === null || estado === void 0 ? void 0 : estado[id], 0))));
    }
    function condicaoNaturezaAtiva(condicao) {
        if (!condicao || condicao.tipo !== "natureza_nivel")
            return false;
        return nivelNatureza(condicao.natureza) >= numero(condicao.minimo, 0);
    }
    function efeitoDesbloqueado(efeito) {
        if (!(efeito === null || efeito === void 0 ? void 0 : efeito.condicao))
            return true;
        if (efeito.condicao.tipo === "natureza_nivel")
            return condicaoNaturezaAtiva(efeito.condicao);
        return true;
    }
    function condicaoPermiteAutomatico(efeito) {
        if (!(efeito === null || efeito === void 0 ? void 0 : efeito.condicao))
            return true;
        var tipo = String(efeito.condicao.tipo || "");
        if (tipo === "natureza_nivel")
            return condicaoNaturezaAtiva(efeito.condicao);
        /* Condições de escopo continuam sendo bônus válidos; o texto informa quando usar. */
        if (CONDICOES_DE_ESCOPO.has(tipo))
            return true;
        if (CONDICOES_COM_CONFIRMACAO.has(tipo))
            return efeito.condicaoAtendida === true;
        return efeito.condicaoAtendida === true;
    }
    function carregarRegistro() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (registro)
                    return [2 /*return*/, registro];
                if (promessaRegistro)
                    return [2 /*return*/, promessaRegistro];
                promessaRegistro = fetch(URL_REGISTRO, { cache: "no-store" })
                    .then(function (resposta) {
                    if (!resposta.ok)
                        throw new Error("HTTP ".concat(resposta.status));
                    return resposta.json();
                })
                    .then(function (dados) {
                    var lista = Array.isArray(dados === null || dados === void 0 ? void 0 : dados.jutsus) ? dados.jutsus : [];
                    registro = dados;
                    registroPorId = new Map(lista
                        .filter(function (item) { return String((item === null || item === void 0 ? void 0 : item.catalogoId) || "").trim(); })
                        .map(function (item) { return [String(item.catalogoId), item]; }));
                    registroPorNome = new Map(lista
                        .filter(function (item) { return normalizar(item === null || item === void 0 ? void 0 : item.nome); })
                        .map(function (item) { return [normalizar(item.nome), item]; }));
                    registroPorNomeFlexivel = new Map(lista
                        .filter(function (item) { return chaveNomeFlexivel(item === null || item === void 0 ? void 0 : item.nome); })
                        .map(function (item) { return [chaveNomeFlexivel(item.nome), item]; }));
                    return dados;
                })
                    .catch(function (erro) {
                    console.warn("Registro estruturado de efeitos indisponível.", erro);
                    registro = { jutsus: [] };
                    registroPorId = new Map();
                    registroPorNome = new Map();
                    registroPorNomeFlexivel = new Map();
                    return registro;
                });
                return [2 /*return*/, promessaRegistro];
            });
        });
    }
    function registroDoJutsu(jutsu) {
        return registroPorId.get(String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId) || (jutsu === null || jutsu === void 0 ? void 0 : jutsu.id) || ""))
            || registroPorNome.get(normalizar(jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome))
            || registroPorNomeFlexivel.get(chaveNomeFlexivel(jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome))
            || null;
    }
    function registroDoItemAtivo(item) {
        return registroPorId.get(String((item === null || item === void 0 ? void 0 : item.origemId) || ""))
            || registroPorNome.get(normalizar(item === null || item === void 0 ? void 0 : item.nome))
            || registroPorNomeFlexivel.get(chaveNomeFlexivel(item === null || item === void 0 ? void 0 : item.nome))
            || null;
    }
    function ordenarValorParaAssinatura(valor) {
        if (Array.isArray(valor))
            return valor.map(ordenarValorParaAssinatura);
        if (valor && typeof valor === "object") {
            return Object.keys(valor)
                .sort()
                .reduce(function (saida, chave) {
                saida[chave] = ordenarValorParaAssinatura(valor[chave]);
                return saida;
            }, {});
        }
        return valor;
    }
    function assinaturaEfeitos(efeitos) {
        var campos = [
            "id", "polaridade", "aplicaEm", "tipo", "alvo", "operacao", "valor", "unidade",
            "automatico", "persistente", "acumulo", "duracao", "grupoEscolha", "opcao", "condicao"
        ];
        var canonicos = (Array.isArray(efeitos) ? efeitos : [])
            .map(function (efeito, indice) { return normalizarEfeito(efeito, indice); })
            .map(function (efeito) {
            var saida = {};
            campos.forEach(function (chave) {
                if (efeito[chave] !== undefined)
                    saida[chave] = ordenarValorParaAssinatura(efeito[chave]);
            });
            return saida;
        })
            .sort(function (a, b) { return String(a.id || "").localeCompare(String(b.id || "")); });
        return JSON.stringify(canonicos);
    }
    function efeitoAutomaticoObrigatorioDoCatalogo(efeito) {
        var e = normalizarEfeito(efeito);
        return Boolean(e.automatico
            && ALVOS_AUTOMATICOS.has(e.alvo)
            && ["somar", "multiplicar"].includes(e.operacao));
    }
    function chaveSemanticaEfeito(efeito) {
        var e = normalizarEfeito(efeito);
        return [
            e.aplicaEm, e.tipo, e.alvo, e.operacao, e.grupoEscolha || "", e.opcao || "",
            JSON.stringify(ordenarValorParaAssinatura(e.condicao || {}))
        ].join("|");
    }
    function mesclarEfeitosManuaisComCatalogo(jutsu, item) {
        var atuais = Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.efeitosEstruturados)
            ? jutsu.efeitosEstruturados.map(function (efeito, indice) { return normalizarEfeito(efeito, indice); })
            : [];
        var canonicos = (Array.isArray(item === null || item === void 0 ? void 0 : item.efeitos) ? item.efeitos : [])
            .map(function (efeito, indice) { return normalizarEfeito(efeito, indice); });
        /*
         * O catálogo é a fonte das regras. Fichas antigas podem manter efeitos extras
         * personalizados, mas não podem perder nenhum efeito oficial por causa de uma
         * edição antiga ou de uma migração incompleta.
         */
        var atuaisPorId = new Map(atuais.map(function (efeito) { return [efeito.id, efeito]; }));
        var atuaisPorSemantica = new Map(atuais.map(function (efeito) { return [chaveSemanticaEfeito(efeito), efeito]; }));
        var consumidos = new Set();
        var mesclados = canonicos.map(function (canonico) {
            var manual = atuaisPorId.get(canonico.id)
                || atuaisPorSemantica.get(chaveSemanticaEfeito(canonico));
            if (!manual)
                return canonico;
            consumidos.add(manual.id);
            var combinado = __assign(__assign({}, manual), canonico);
            if (manual.condicaoAtendida !== undefined)
                combinado.condicaoAtendida = manual.condicaoAtendida;
            return normalizarEfeito(combinado);
        });
        atuais.forEach(function (efeito) {
            if (consumidos.has(efeito.id))
                return;
            var jaExiste = mesclados.some(function (itemMesclado) {
                return itemMesclado.id === efeito.id || chaveSemanticaEfeito(itemMesclado) === chaveSemanticaEfeito(efeito);
            });
            if (!jaExiste)
                mesclados.push(efeito);
        });
        return mesclados;
    }
    function migrarJutsusDoCatalogo() {
        return __awaiter(this, void 0, void 0, function () {
            var lista, alterou;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, carregarRegistro()];
                    case 1:
                        _a.sent();
                        lista = Array.isArray(estado === null || estado === void 0 ? void 0 : estado.jutsus) ? estado.jutsus : [];
                        alterou = false;
                        lista.forEach(function (jutsu) {
                            if (!jutsu)
                                return;
                            var item = registroDoJutsu(jutsu);
                            if (!item)
                                return;
                            var efeitosEsperados = jutsu.efeitosEditadosManualmente
                                ? mesclarEfeitosManuaisComCatalogo(jutsu, item)
                                : clonar(item.efeitos || []);
                            var precisaMigrar = !Array.isArray(jutsu.efeitosEstruturados)
                                || String(jutsu.efeitosVersao || "") !== VERSAO_EFEITOS
                                || assinaturaEfeitos(jutsu.efeitosEstruturados) !== assinaturaEfeitos(efeitosEsperados);
                            if (!precisaMigrar)
                                return;
                            jutsu.efeitosEstruturados = efeitosEsperados;
                            jutsu.efeitosConfig = Object.fromEntries(Object.entries(item).filter(function (_a) {
                                var _b = __read(_a, 1), chave = _b[0];
                                return ![
                                    "catalogoId", "nome", "elemento", "classificacao", "revisado", "pagina", "efeitos"
                                ].includes(chave);
                            }));
                            jutsu.classificacaoEfeitos = String(item.classificacao || "");
                            jutsu.efeitosVersao = VERSAO_EFEITOS;
                            jutsu.efeitosAssinatura = assinaturaEfeitos(jutsu.efeitosEstruturados);
                            if (jutsu.efeitosEditadosManualmente)
                                jutsu.efeitosAutomaticosReparados = true;
                            alterou = true;
                        });
                        if (alterou)
                            salvarEstado();
                        return [2 /*return*/, alterou];
                }
            });
        });
    }
    function resolverAplicacaoParaItemAtivo(efeito, item) {
        var e = normalizarEfeito(efeito);
        if (e.aplicaEm === "usuario_ou_aliado") {
            e.aplicaEm = String((item === null || item === void 0 ? void 0 : item.aplicacao) || "usuario") === "usuario" ? "usuario" : "aliado";
        }
        return e;
    }
    function efeitosDoRegistroParaAtivo(item, itemRegistro) {
        var origem = (Array.isArray(itemRegistro === null || itemRegistro === void 0 ? void 0 : itemRegistro.efeitos) ? itemRegistro.efeitos : [])
            .map(function (efeito, indice) { return resolverAplicacaoParaItemAtivo(normalizarEfeito(efeito, indice), item); })
            .filter(function (efeito) { return efeito.persistente !== false && efeito.tipo !== "encerrar_efeitos"; });
        var atuais = Array.isArray(item === null || item === void 0 ? void 0 : item.efeitos)
            ? item.efeitos.map(function (efeito, indice) { return normalizarEfeito(efeito, indice); })
            : bonusLegadoParaEfeitos(item === null || item === void 0 ? void 0 : item.bonus);
        var atuaisPorId = new Map(atuais.map(function (efeito) { return [efeito.id, efeito]; }));
        origem.forEach(function (efeito) {
            var anterior = atuaisPorId.get(efeito.id);
            if ((anterior === null || anterior === void 0 ? void 0 : anterior.condicaoAtendida) !== undefined)
                efeito.condicaoAtendida = anterior.condicaoAtendida;
        });
        /*
         * Efeitos de escolha não podem ser ativados em bloco durante uma migração.
         * Mantemos a opção que já estava ativa e acrescentamos somente os efeitos
         * sem escolha. Nos registros legados, os bônus parciais são substituídos
         * pela definição completa e segura do catálogo.
         */
        var escolhasAtuais = new Set(atuais
            .filter(function (efeito) { return efeito.grupoEscolha && efeito.opcao; })
            .map(function (efeito) { return "".concat(efeito.grupoEscolha, ":").concat(efeito.opcao); }));
        var selecionados = origem.filter(function (efeito) {
            if (!efeito.grupoEscolha || !efeito.opcao)
                return true;
            return escolhasAtuais.has("".concat(efeito.grupoEscolha, ":").concat(efeito.opcao));
        });
        var ids = new Set(selecionados.map(function (efeito) { return efeito.id; }));
        atuais.forEach(function (efeito) {
            if (efeito.grupoEscolha && efeito.opcao && !ids.has(efeito.id)) {
                selecionados.push(efeito);
                ids.add(efeito.id);
            }
        });
        return selecionados;
    }
    function migrarEfeitosAtivosDoCatalogo() {
        return __awaiter(this, void 0, void 0, function () {
            var alterou;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, carregarRegistro()];
                    case 1:
                        _a.sent();
                        if (!estado || typeof estado !== "object" || !Array.isArray(estado[CHAVE_ESTADO]))
                            return [2 /*return*/, false];
                        alterou = false;
                        estado[CHAVE_ESTADO].forEach(function (item) {
                            if (!item || String(item.origemTipo || "jutsu") !== "jutsu")
                                return;
                            var itemRegistro = registroDoItemAtivo(item);
                            if (!itemRegistro)
                                return;
                            var efeitos = efeitosDoRegistroParaAtivo(item, itemRegistro);
                            var assinaturaEsperada = assinaturaEfeitos(efeitos);
                            var assinaturaAtual = assinaturaEfeitos(item.efeitos);
                            var origemCanonica = String(itemRegistro.catalogoId || item.origemId || "");
                            var precisaReparar = String(item.efeitosVersao || "") !== VERSAO_EFEITOS
                                || assinaturaAtual !== assinaturaEsperada
                                || String(item.efeitosAssinatura || "") !== assinaturaEsperada
                                || String(item.origemId || "") !== origemCanonica;
                            if (!precisaReparar)
                                return;
                            item.origemId = origemCanonica;
                            item.efeitos = efeitos;
                            item.bonus = calcularBonusDoItem(efeitos);
                            item.multiplicadores = calcularMultiplicadoresDoItem(efeitos);
                            item.efeitosVersao = VERSAO_EFEITOS;
                            item.efeitosAssinatura = assinaturaEsperada;
                            alterou = true;
                        });
                        if (alterou)
                            salvarEstado();
                        return [2 /*return*/, alterou];
                }
            });
        });
    }
    function normalizarEfeito(efeito, indice) {
        if (indice === void 0) { indice = 0; }
        var e = efeito && typeof efeito === "object" ? clonar(efeito) : {};
        return __assign(__assign({}, e), { id: String(e.id || "efeito-".concat(indice + 1)), polaridade: ["buff", "debuff", "custo", "neutro"].includes(e.polaridade) ? e.polaridade : "neutro", aplicaEm: String(e.aplicaEm || "usuario"), tipo: String(e.tipo || "especial"), alvo: String(e.alvo || "efeito"), operacao: String(e.operacao || "adicionar"), texto: String(e.texto || ROTULOS_ALVO[e.alvo] || "Efeito do jutsu"), automatico: Boolean(e.automatico), persistente: e.persistente !== false, acumulo: String(e.acumulo || "renova_mesma_origem") });
    }
    function bonusLegadoParaEfeitos(bonus) {
        if (!bonus || typeof bonus !== "object")
            return [];
        return Object.entries(bonus)
            .filter(function (_a) {
            var _b = __read(_a, 2), valor = _b[1];
            return numero(valor, 0) !== 0;
        })
            .map(function (_a, indice) {
            var _b = __read(_a, 2), alvo = _b[0], valor = _b[1];
            return normalizarEfeito({
                id: "legado-".concat(alvo, "-").concat(indice),
                polaridade: numero(valor, 0) >= 0 ? "buff" : "debuff",
                aplicaEm: "usuario",
                tipo: "bonus_numerico",
                alvo: alvo,
                operacao: "somar",
                valor: numero(valor, 0),
                texto: "".concat(ROTULOS_ALVO[alvo] || alvo, " ").concat(comSinal(valor)),
                automatico: true,
                persistente: true
            }, indice);
        });
    }
    function garantirLista() {
        if (!estado || typeof estado !== "object")
            return [];
        if (!Array.isArray(estado[CHAVE_ESTADO]))
            estado[CHAVE_ESTADO] = [];
        var lista = estado[CHAVE_ESTADO];
        var quantidadeOriginal = lista.length;
        var porId = new Map();
        lista
            .filter(function (item) { return item && typeof item === "object"; })
            .forEach(function (item, indice) {
            var efeitos = Array.isArray(item.efeitos)
                ? item.efeitos.map(normalizarEfeito)
                : bonusLegadoParaEfeitos(item.bonus);
            if (!efeitos.length)
                return;
            /*
             * Campos do módulo online precisam sobreviver a cada normalização. A
             * implementação anterior recriava o objeto sem onlineEffectId e
             * onlineRoomId. Ao reabrir o app, o mesmo buff parecia não publicado e
             * era enviado novamente para a sala.
             */
            var normalizado = __assign(__assign({}, item), { id: String(item.id || "efeito-".concat(indice, "-").concat(Date.now())), origemTipo: String(item.origemTipo || "jutsu"), origemId: String(item.origemId || ""), nome: String(item.nome || "Efeito de jutsu"), duracao: String(item.duracao || ""), alvoNome: String(item.alvoNome || ""), aplicacao: String(item.aplicacao || "usuario"), efeitosVersao: String(item.efeitosVersao || ""), efeitosAssinatura: String(item.efeitosAssinatura || assinaturaEfeitos(efeitos)), efeitos: efeitos, bonus: calcularBonusDoItem(efeitos), multiplicadores: calcularMultiplicadoresDoItem(efeitos), aplicadoEm: numero(item.aplicadoEm, Date.now()), onlineEffectId: String(item.onlineEffectId || ""), onlineRoomId: String(item.onlineRoomId || ""), onlinePublicadoEm: numero(item.onlinePublicadoEm, 0), onlineSyncPendente: Boolean(item.onlineSyncPendente), onlineErro: numero(item.onlineErro, 0), duracaoOriginal: String(item.duracaoOriginal || ""), duracaoRodadasTotal: numero(item.duracaoRodadasTotal, 0), duracaoRodadasRestantes: numero(item.duracaoRodadasRestantes, 0), rodadaAtivacao: numero(item.rodadaAtivacao, 0), turnoAtivacao: numero(item.turnoAtivacao, 0), expiraNaRodada: numero(item.expiraNaRodada, 0), expiraNoTurno: numero(item.expiraNoTurno, 0) });
            var anterior = porId.get(normalizado.id);
            if (!anterior) {
                porId.set(normalizado.id, normalizado);
                return;
            }
            /* Repara fichas que já receberam cópias locais repetidas. Mantém a
               ativação mais recente e reaproveita o vínculo online conhecido. */
            var maisNovo = normalizado.aplicadoEm >= anterior.aplicadoEm ? normalizado : anterior;
            var outro = maisNovo === normalizado ? anterior : normalizado;
            if (!maisNovo.onlineEffectId && outro.onlineEffectId)
                maisNovo.onlineEffectId = outro.onlineEffectId;
            if (!maisNovo.onlineRoomId && outro.onlineRoomId)
                maisNovo.onlineRoomId = outro.onlineRoomId;
            if (!maisNovo.onlinePublicadoEm && outro.onlinePublicadoEm)
                maisNovo.onlinePublicadoEm = outro.onlinePublicadoEm;
            if (maisNovo.onlineEffectId)
                maisNovo.onlineSyncPendente = false;
            porId.set(normalizado.id, maisNovo);
        });
        var normalizada = Array.from(porId.values());
        var reparouDuplicatas = normalizada.length < quantidadeOriginal;
        /* Mantém a mesma referência para não perder inserções durante o cálculo de acúmulo. */
        lista.splice.apply(lista, __spreadArray([0, lista.length], __read(normalizada), false));
        if (reparouDuplicatas) {
            setTimeout(function () {
                try {
                    if (window.__shinobiSheetTransition === true)
                        return;
                    if (typeof persistirEstadoLocal === "function") {
                        persistirEstadoLocal({ emitir: false, confirmada: false, origem: "efeitos", motivo: "reparo-ids-efeitos" });
                    }
                    else if (typeof CHAVE !== "undefined") {
                        localStorage.setItem(CHAVE, JSON.stringify(estado));
                    }
                }
                catch (_erro) { }
            }, 0);
        }
        return lista;
    }
    function efeitoAutomaticoNoUsuario(efeito) {
        return Boolean((efeito === null || efeito === void 0 ? void 0 : efeito.automatico)
            && APLICACOES_USUARIO.has(efeito.aplicaEm)
            && ALVOS_AUTOMATICOS.has(efeito.alvo)
            && efeitoDesbloqueado(efeito)
            && condicaoPermiteAutomatico(efeito));
    }
    function calcularBonusDoItem(efeitos) {
        var bonus = {};
        (efeitos || []).forEach(function (efeito) {
            if (!efeitoAutomaticoNoUsuario(efeito))
                return;
            if (efeito.operacao !== "somar")
                return;
            var valor = numero(efeito.valor, 0);
            if (valor)
                bonus[efeito.alvo] = numero(bonus[efeito.alvo], 0) + valor;
        });
        return bonus;
    }
    function calcularMultiplicadoresDoItem(efeitos) {
        var multiplicadores = {};
        (efeitos || []).forEach(function (efeito) {
            if (!efeitoAutomaticoNoUsuario(efeito))
                return;
            if (efeito.operacao !== "multiplicar")
                return;
            var valor = numero(efeito.valor, 1);
            if (valor > 0)
                multiplicadores[efeito.alvo] = numero(multiplicadores[efeito.alvo], 1) * valor;
        });
        return multiplicadores;
    }
    function bonusAutomatico(alvo) {
        return garantirLista().reduce(function (total, item) { var _a; return total + numero((_a = item.bonus) === null || _a === void 0 ? void 0 : _a[alvo], 0); }, 0);
    }
    function multiplicadorAutomatico(alvo) {
        return garantirLista().reduce(function (total, item) { var _a; return total * numero((_a = item.multiplicadores) === null || _a === void 0 ? void 0 : _a[alvo], 1); }, 1);
    }
    function campoSalvo(nome) {
        return document.querySelector("[data-save=\"".concat(nome, "\"]"));
    }
    function modificador(valor) {
        if (typeof calcularModificador === "function")
            return numero(calcularModificador(valor), 0);
        return Math.floor((numero(valor, 0) - 10) / 2);
    }
    function bonusManualAtributo(chave) {
        var _a;
        return numero((_a = document.querySelector("[data-bonus-batalha=\"".concat(chave, "\"]"))) === null || _a === void 0 ? void 0 : _a.value, 0);
    }
    function dadosFurtividade() {
        var _a, _b, _c, _d, _e, _f;
        var destreza = numero((_b = (_a = campoSalvo("destreza")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : estado === null || estado === void 0 ? void 0 : estado.destreza, 0);
        var proficiencia = numero((_d = (_c = campoSalvo("proficiencia")) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : estado === null || estado === void 0 ? void 0 : estado.proficiencia, 0);
        var treinado = Boolean((_f = (_e = campoSalvo("p_furtividade")) === null || _e === void 0 ? void 0 : _e.checked) !== null && _f !== void 0 ? _f : estado === null || estado === void 0 ? void 0 : estado.p_furtividade);
        var bonusAtributoManual = bonusManualAtributo("destreza");
        var bonusModDestreza = bonusAutomatico("mod_destreza");
        var baseModDestreza = destreza > 0 ? modificador(destreza + bonusAtributoManual) : 0;
        var base = baseModDestreza + bonusModDestreza + (treinado ? proficiencia : 0);
        var bonusJutsu = bonusAutomatico("furtividade");
        return { base: base, bonusJutsu: bonusJutsu, total: base + bonusJutsu, treinado: treinado, bonusModDestreza: bonusModDestreza };
    }
    function garantirMostradorFurtividade() {
        var _a;
        var grade = document.querySelector("#batalha .defesasGrid");
        if (!grade)
            return null;
        var box = document.getElementById("batalhaFurtividadeBox");
        if (!box) {
            box = document.createElement("div");
            box.id = "batalhaFurtividadeBox";
            box.className = "extraBatalhaBox furtividadeBatalhaBox";
            box.innerHTML = '<span>Furt.</span><strong id="batalhaFurtividadeView">+0</strong>';
            var velocidade = (_a = document.getElementById("batalhaVelocidadeView")) === null || _a === void 0 ? void 0 : _a.closest("div");
            if (velocidade === null || velocidade === void 0 ? void 0 : velocidade.nextSibling)
                grade.insertBefore(box, velocidade.nextSibling);
            else
                grade.appendChild(box);
        }
        grade.classList.add("defesasGridComFurtividade");
        return box;
    }
    function atualizarFurtividade() {
        garantirMostradorFurtividade();
        var view = document.getElementById("batalhaFurtividadeView");
        if (!view)
            return;
        var dados = dadosFurtividade();
        var detalhe = [];
        if (dados.treinado)
            detalhe.push("prof.");
        if (dados.bonusModDestreza)
            detalhe.push("".concat(comSinal(dados.bonusModDestreza), " mod. DES"));
        if (dados.bonusJutsu)
            detalhe.push("".concat(comSinal(dados.bonusJutsu), " jutsu"));
        view.innerHTML = "".concat(comSinal(dados.total)).concat(detalhe.length ? "<span class=\"bonusDefesaTexto\">".concat(detalhe.join(" · "), "</span>") : "");
    }
    function atualizarVelocidadeComEfeitos() {
        var _a, _b;
        var view = document.getElementById("batalhaVelocidadeView");
        if (!view)
            return;
        var base = numero((_b = (_a = campoSalvo("velocidade")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : estado === null || estado === void 0 ? void 0 : estado.velocidade, 0);
        var multiplicador = multiplicadorAutomatico("velocidade");
        var bonus = bonusAutomatico("velocidade");
        var total = Math.floor(base * multiplicador * 1000) / 1000 + bonus;
        var detalhes = [];
        if (multiplicador !== 1)
            detalhes.push("\u00D7".concat(multiplicador, " jutsu"));
        if (bonus)
            detalhes.push("".concat(comSinal(bonus), "m jutsu"));
        view.innerHTML = "".concat(String(total).replace(".", ",")).concat(detalhes.length ? "<span class=\"bonusDefesaTexto\">".concat(detalhes.join(" · "), "</span>") : "");
    }
    function atualizarModificadoresComEfeitos() {
        Object.entries(ATRIBUTOS).forEach(function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), chave = _d[0], dados = _d[1];
            var el = document.getElementById(dados.id);
            if (!el)
                return;
            var atributo = numero((_c = (_b = campoSalvo(chave)) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : estado === null || estado === void 0 ? void 0 : estado[chave], 0);
            var bonusManual = bonusManualAtributo(chave);
            var bonusJutsu = bonusAutomatico("mod_".concat(chave));
            var total = (atributo > 0 ? modificador(atributo + bonusManual) : 0) + bonusJutsu;
            var detalhes = [];
            if (bonusManual)
                detalhes.push("".concat(comSinal(bonusManual), " atr."));
            if (bonusJutsu)
                detalhes.push("".concat(comSinal(bonusJutsu), " jutsu"));
            el.innerHTML = "".concat(comSinal(total)).concat(detalhes.length ? "<span class=\"bonusAplicadoTexto\">".concat(detalhes.join(" · "), "</span>") : "");
        });
    }
    function atualizarDefesasComEfeitos() {
        var _a, _b, _c, _d, _e, _f;
        var caBase = numero((_b = (_a = document.getElementById("campoCA")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : (_c = campoSalvo("ca")) === null || _c === void 0 ? void 0 : _c.value, 10);
        var cdBase = numero((_d = campoSalvo("cd")) === null || _d === void 0 ? void 0 : _d.value, 10);
        var bonusCaManual = numero((_e = document.querySelector('[data-bonus-defesa-batalha="ca"]')) === null || _e === void 0 ? void 0 : _e.value, 0);
        var bonusCdManual = numero((_f = document.querySelector('[data-bonus-defesa-batalha="cd"]')) === null || _f === void 0 ? void 0 : _f.value, 0);
        var bonusCaJutsu = bonusAutomatico("ca");
        var caTotal = caBase + bonusCaManual + bonusCaJutsu;
        var cdTotal = cdBase + bonusCdManual;
        var caView = document.getElementById("batalhaCaView");
        var cdView = document.getElementById("batalhaCdView");
        if (caView) {
            var detalhes = [];
            if (bonusCaManual)
                detalhes.push("".concat(comSinal(bonusCaManual), " manual"));
            if (bonusCaJutsu)
                detalhes.push("".concat(comSinal(bonusCaJutsu), " jutsu"));
            caView.innerHTML = "".concat(caTotal).concat(detalhes.length ? "<span class=\"bonusDefesaTexto\">".concat(detalhes.join(" · "), "</span>") : "");
        }
        if (cdView) {
            cdView.innerHTML = "".concat(cdTotal).concat(bonusCdManual ? "<span class=\"bonusDefesaTexto\">".concat(comSinal(bonusCdManual), " manual</span>") : "");
        }
        atualizarVelocidadeComEfeitos();
        atualizarModificadoresComEfeitos();
        atualizarFurtividade();
    }
    function efeitoParaTexto(efeito) {
        var rotulo = ROTULOS_ALVO[efeito.alvo] || efeito.alvo.replace(/_/g, " ");
        var valor = efeito.valor;
        var texto;
        if (efeito.tipo === "bonus_numerico" && typeof valor === "number") {
            texto = "".concat(rotulo, " ").concat(comSinal(valor)).concat(efeito.unidade ? " ".concat(efeito.unidade) : "");
        }
        else if (efeito.operacao === "multiplicar" && valor !== undefined) {
            texto = "".concat(rotulo, " \u00D7").concat(valor);
        }
        else {
            texto = efeito.texto || rotulo;
        }
        if (efeito.condicao) {
            var condicao = textoCondicao(efeito.condicao);
            if (CONDICOES_COM_CONFIRMACAO.has(String(efeito.condicao.tipo || "")) && efeito.condicaoAtendida !== true) {
                return "".concat(texto, " (condi\u00E7\u00E3o n\u00E3o confirmada: ").concat(condicao, ")");
            }
            if (CONDICOES_DE_ESCOPO.has(String(efeito.condicao.tipo || ""))) {
                return "".concat(texto, " (").concat(condicao, ")");
            }
        }
        return texto;
    }
    function polaridadeDoItem(item) {
        var pols = new Set(item.efeitos.map(function (e) { return e.polaridade; }));
        if (pols.has("buff") && (pols.has("debuff") || pols.has("custo")))
            return "misto";
        if (pols.has("debuff"))
            return "debuff";
        if (pols.has("buff"))
            return "buff";
        if (pols.has("custo"))
            return "custo";
        return "neutro";
    }
    function garantirHostEfeitos() {
        var secao = document.querySelector("#batalha .efeitosBatalhaSecao");
        if (!secao)
            return null;
        var host = document.getElementById("efeitosJutsuAtivos");
        if (!host) {
            host = document.createElement("div");
            host.id = "efeitosJutsuAtivos";
            host.className = "efeitosJutsuAtivos";
            var bonusManual = secao.querySelector(".bonusAtributosBatalha");
            bonusManual ? secao.insertBefore(host, bonusManual) : secao.appendChild(host);
        }
        return host;
    }
    function construirResumoBonusGerais(lista) {
        var diretos = ALVOS_AUTOMATICOS;
        var chips = [];
        var vistos = new Set();
        lista.forEach(function (item) {
            item.efeitos
                .filter(function (e) { return e.persistente !== false && efeitoDesbloqueado(e) && APLICACOES_USUARIO.has(e.aplicaEm); })
                .filter(function (e) { return e.polaridade === "buff" && !diretos.has(e.alvo); })
                .forEach(function (efeito) {
                var texto = efeitoParaTexto(efeito);
                var chave = normalizar(texto);
                if (!texto || vistos.has(chave))
                    return;
                vistos.add(chave);
                chips.push("<span class=\"efeitoResumoGeralChip\">".concat(escaparHtml(texto), "</span>"));
            });
        });
        if (!chips.length)
            return "";
        return "<div class=\"efeitosResumoGeral\"><strong>Outros b\u00F4nus ativos</strong><div>".concat(chips.join(""), "</div></div>");
    }
    function renderizarEfeitos() {
        var host = garantirHostEfeitos();
        if (!host)
            return;
        var lista = garantirLista();
        host.hidden = !lista.length;
        var resumoGeral = construirResumoBonusGerais(lista);
        host.innerHTML = resumoGeral + lista.map(function (item) {
            var polaridade = polaridadeDoItem(item);
            var persistentes = item.efeitos.filter(function (e) { return e.persistente !== false && efeitoDesbloqueado(e); });
            var usuario = persistentes.filter(function (e) { return APLICACOES_USUARIO.has(e.aplicaEm); });
            var externos = persistentes.filter(function (e) { return !APLICACOES_USUARIO.has(e.aplicaEm); });
            var classe = "efeitoPolaridade-".concat(polaridade);
            var destino = externos.length && !usuario.length
                ? (item.alvoNome ? "Alvo: ".concat(item.alvoNome) : "Aplicado ao alvo")
                : externos.length
                    ? (item.alvoNome ? "Voc\u00EA + ".concat(item.alvoNome) : "Você + alvo")
                    : "Aplicado em você";
            return "\n        <article class=\"efeitoJutsuBatalhaCard ".concat(classe, "\">\n          <div class=\"efeitoJutsuBatalhaTopo\">\n            <div>\n              <div class=\"efeitoJutsuBadges\">\n                <span class=\"efeitoJutsuBadge efeitoJutsuBadge-").concat(polaridade, "\">").concat(polaridade.toUpperCase(), "</span>\n                <span class=\"efeitoJutsuDestino\">").concat(escaparHtml(destino), "</span>\n              </div>\n              <strong>").concat(escaparHtml(item.nome), "</strong>\n              ").concat(item.duracao ? "<small>Dura\u00E7\u00E3o: ".concat(escaparHtml(item.duracao), "</small>") : "", "\n            </div>\n            <button type=\"button\" data-remover-efeito-id=\"").concat(escaparHtml(item.id), "\" aria-label=\"Encerrar ").concat(escaparHtml(item.nome), "\">\u00D7</button>\n          </div>\n          <div class=\"efeitoJutsuBatalhaBonus\">\n            ").concat(persistentes.map(function (efeito) { return "<span class=\"efeitoChip-".concat(escaparHtml(efeito.polaridade), "\">").concat(escaparHtml(efeitoParaTexto(efeito)), "</span>"); }).join(""), "\n          </div>\n        </article>");
        }).join("");
        host.querySelectorAll("[data-remover-efeito-id]").forEach(function (botao) {
            botao.addEventListener("click", function () {
                var id = botao.dataset.removerEfeitoId || "";
                if (id)
                    removerEfeitoJutsuBatalha(id);
            });
        });
    }
    function atualizarTudo() {
        atualizarDefesasComEfeitos();
        renderizarEfeitos();
        if (typeof window.atualizarBonusBatalhaCompacto === "function")
            window.atualizarBonusBatalhaCompacto();
        window.dispatchEvent(new CustomEvent("shinobi:efeitos-batalha-atualizados"));
    }
    function agendarAtualizacao() {
        if (quadroAtualizacao !== null)
            return;
        quadroAtualizacao = requestAnimationFrame(function () {
            quadroAtualizacao = null;
            atualizarTudo();
        });
    }
    function obterEfeitosDoJutsu(jutsu) {
        var _a;
        var item = registroDoJutsu(jutsu);
        var proprios = Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.efeitosEstruturados) ? jutsu.efeitosEstruturados : [];
        if (proprios.length) {
            var efeitos = (jutsu === null || jutsu === void 0 ? void 0 : jutsu.efeitosEditadosManualmente) && item
                ? mesclarEfeitosManuaisComCatalogo(jutsu, item)
                : proprios;
            return efeitos.map(normalizarEfeito).filter(efeitoDesbloqueado);
        }
        if ((_a = item === null || item === void 0 ? void 0 : item.efeitos) === null || _a === void 0 ? void 0 : _a.length)
            return item.efeitos.map(normalizarEfeito).filter(efeitoDesbloqueado);
        return extrairFallback(jutsu);
    }
    function configDoJutsu(jutsu) {
        if ((jutsu === null || jutsu === void 0 ? void 0 : jutsu.efeitosConfig) && typeof jutsu.efeitosConfig === "object")
            return clonar(jutsu.efeitosConfig);
        var item = registroDoJutsu(jutsu);
        if (!item)
            return {};
        return Object.fromEntries(Object.entries(item).filter(function (_a) {
            var _b = __read(_a, 1), k = _b[0];
            return !["catalogoId", "nome", "elemento", "classificacao", "revisado", "pagina", "efeitos"].includes(k);
        }));
    }
    function extrairFallback(jutsu) {
        var _a;
        /* Fallback para jutsus manuais e fichas antigas sem catalogoId. */
        var texto = normalizar([jutsu === null || jutsu === void 0 ? void 0 : jutsu.descricao, (_a = jutsu === null || jutsu === void 0 ? void 0 : jutsu.upgrade) === null || _a === void 0 ? void 0 : _a.efeito, jutsu === null || jutsu === void 0 ? void 0 : jutsu.bonus, jutsu === null || jutsu === void 0 ? void 0 : jutsu.efeitos].filter(Boolean).join(". "));
        var efeitos = [];
        var vistos = new Set();
        function adicionar(alvo, valor, _a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.operacao, operacao = _c === void 0 ? "somar" : _c, _d = _b.unidade, unidade = _d === void 0 ? "" : _d, _e = _b.textoEfeito, textoEfeito = _e === void 0 ? "" : _e, _f = _b.automatico, automatico = _f === void 0 ? true : _f;
            var numeroValor = numero(valor, operacao === "multiplicar" ? 1 : 0);
            if ((operacao === "somar" && !numeroValor) || (operacao === "multiplicar" && numeroValor === 1))
                return;
            var chave = "".concat(alvo, "|").concat(operacao, "|").concat(numeroValor);
            if (vistos.has(chave))
                return;
            vistos.add(chave);
            efeitos.push(normalizarEfeito({
                id: "fallback-".concat(slug(alvo), "-").concat(efeitos.length + 1),
                polaridade: "buff", aplicaEm: "usuario", tipo: operacao === "multiplicar" ? "multiplicador" : "bonus_numerico",
                alvo: alvo,
                operacao: operacao,
                valor: numeroValor,
                unidade: unidade,
                texto: textoEfeito || "".concat(ROTULOS_ALVO[alvo] || alvo, " ").concat(operacao === "multiplicar" ? "\u00D7".concat(numeroValor) : comSinal(numeroValor)),
                automatico: automatico,
                persistente: true, duracao: String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.duracao) || "")
            }, efeitos.length));
        }
        function primeiroValor(padroes) {
            var e_1, _a;
            try {
                for (var padroes_1 = __values(padroes), padroes_1_1 = padroes_1.next(); !padroes_1_1.done; padroes_1_1 = padroes_1.next()) {
                    var rx = padroes_1_1.value;
                    var m = texto.match(rx);
                    if (m === null || m === void 0 ? void 0 : m[1])
                        return numero(String(m[1]).replace(/\s+/g, ""), 0);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (padroes_1_1 && !padroes_1_1.done && (_a = padroes_1.return)) _a.call(padroes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return 0;
        }
        adicionar("ca", primeiroValor([
            /\bca\b[^.;\n]{0,55}?\+\s*(\d+(?:[.,]\d+)?)/,
            /\+\s*(\d+(?:[.,]\d+)?)[^.;\n]{0,35}?\bca\b/
        ]));
        adicionar("furtividade", primeiroValor([
            /furtividade[^.;\n]{0,45}?\+\s*(\d+(?:[.,]\d+)?)/,
            /\+\s*(\d+(?:[.,]\d+)?)[^.;\n]{0,35}?furtividade/
        ]));
        adicionar("velocidade", primeiroValor([
            /(?:velocidade|deslocamento|movimento)[^.;\n]{0,55}?\+\s*(\d+(?:[.,]\d+)?)\s*(?:m|metros?)?/,
            /\+\s*(\d+(?:[.,]\d+)?)\s*(?:m|metros?)[^.;\n]{0,35}?(?:velocidade|deslocamento|movimento)/
        ]), { unidade: "m" });
        if (/(?:velocidade|deslocamento|movimento)[^.;\n]{0,30}?(?:e|fica|torna-se)?\s*dobrad/.test(texto)) {
            adicionar("velocidade", 2, { operacao: "multiplicar", textoEfeito: "Velocidade ×2" });
        }
        var atributos = { forca: "mod_forca", destreza: "mod_destreza", constituicao: "mod_constituicao", inteligencia: "mod_inteligencia", sabedoria: "mod_sabedoria", carisma: "mod_carisma" };
        Object.entries(atributos).forEach(function (_a) {
            var _b = __read(_a, 2), nome = _b[0], alvo = _b[1];
            var valor = primeiroValor([
                new RegExp("(?:".concat(nome, "|modificador\\s+de\\s+").concat(nome, ")[^.;\\n]{0,40}?\\+\\s*(\\d+(?:[.,]\\d+)?)")),
                new RegExp("\\+\\s*(\\d+(?:[.,]\\d+)?)[^.;\\n]{0,35}?(?:".concat(nome, "|modificador\\s+de\\s+").concat(nome, ")"))
            ]);
            adicionar(alvo, valor);
        });
        return efeitos;
    }
    function rotuloOpcao(opcao, efeitos) {
        var _a;
        var mapa = {
            pv_temporario: "10 PV temporários",
            ca: "+1 de CA",
            velocidade: "+1,5 m de Velocidade",
            ataque_dano: "+1 em ataque e dano",
            acerto: "+3 de acerto",
            dano_maximizado: "Dano maximizado",
            agilidade_gato: "Agilidade de Gato",
            forca_touro: "Força do Touro",
            vigor_urso: "Vigor do Urso"
        };
        return mapa[opcao] || ((_a = efeitos.find(function (e) { return e.opcao === opcao; })) === null || _a === void 0 ? void 0 : _a.texto) || opcao.replace(/_/g, " ");
    }
    function selecionarEscolhas(efeitos, config) {
        var e_2, _a;
        var grupos = new Map();
        efeitos.forEach(function (efeito) {
            if (!efeito.grupoEscolha || !efeito.opcao)
                return;
            if (!grupos.has(efeito.grupoEscolha))
                grupos.set(efeito.grupoEscolha, new Set());
            grupos.get(efeito.grupoEscolha).add(efeito.opcao);
        });
        if (!grupos.size)
            return efeitos;
        var escolhidos = efeitos.filter(function (e) { return !e.grupoEscolha || !e.opcao; });
        var _loop_1 = function (grupo, opcoesSet) {
            var opcoes = Array.from(opcoesSet);
            var podeTodos = condicaoNaturezaAtiva(config === null || config === void 0 ? void 0 : config.escolhaTodosCondicao);
            var linhas = opcoes.map(function (opcao, i) { return "".concat(i + 1, " - ").concat(rotuloOpcao(opcao, efeitos)); });
            if (podeTodos)
                linhas.push("".concat(opcoes.length + 1, " - Todos os efeitos"));
            var resposta = prompt("Escolha o efeito de ".concat(grupo.replace(/_/g, " "), "\n\n").concat(linhas.join("\n")), "1");
            if (resposta === null)
                return { value: null };
            var indice = Math.trunc(numero(resposta, 1)) - 1;
            if (podeTodos && indice === opcoes.length) {
                escolhidos.push.apply(escolhidos, __spreadArray([], __read(efeitos.filter(function (e) { return e.grupoEscolha === grupo; })), false));
            }
            else {
                var opcao_1 = opcoes[Math.max(0, Math.min(opcoes.length - 1, indice))];
                escolhidos.push.apply(escolhidos, __spreadArray([], __read(efeitos.filter(function (e) { return e.grupoEscolha === grupo && e.opcao === opcao_1; })), false));
            }
        };
        try {
            for (var grupos_1 = __values(grupos), grupos_1_1 = grupos_1.next(); !grupos_1_1.done; grupos_1_1 = grupos_1.next()) {
                var _b = __read(grupos_1_1.value, 2), grupo = _b[0], opcoesSet = _b[1];
                var state_1 = _loop_1(grupo, opcoesSet);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (grupos_1_1 && !grupos_1_1.done && (_a = grupos_1.return)) _a.call(grupos_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return escolhidos;
    }
    function textoCondicao(condicao) {
        var tipo = String((condicao === null || condicao === void 0 ? void 0 : condicao.tipo) || "");
        if (tipo === "contra_ataques")
            return "contra ataques";
        if (tipo === "contra_ataques_distancia")
            return "contra ataques à distância";
        if (tipo === "apos_ataque_escolhido")
            return "após realizar o ataque indicado";
        if (tipo === "resultado")
            return String((condicao === null || condicao === void 0 ? void 0 : condicao.valor) || "quando o resultado indicado acontecer");
        return String((condicao === null || condicao === void 0 ? void 0 : condicao.valor) || tipo.replace(/_/g, " "));
    }
    function resolverCondicoesAutomaticas(efeitos, jutsu) {
        return efeitos.map(function (efeito) {
            var _a;
            var e = normalizarEfeito(efeito);
            var tipo = String(((_a = e.condicao) === null || _a === void 0 ? void 0 : _a.tipo) || "");
            if (!e.automatico || !CONDICOES_COM_CONFIRMACAO.has(tipo))
                return e;
            var pergunta = "".concat((jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || "Este jutsu", ": a condi\u00E7\u00E3o foi atendida?\n\n").concat(e.texto || textoCondicao(e.condicao), "\n\nOK = aplicar o b\u00F4nus agora\nCancelar = registrar sem somar o b\u00F4nus");
            e.condicaoAtendida = confirm(pergunta);
            return e;
        });
    }
    function resolverDestino(efeitos) {
        var _a;
        var aplicarNoUsuario = true;
        var temFlexivel = efeitos.some(function (e) { return e.aplicaEm === "usuario_ou_aliado"; });
        if (temFlexivel) {
            aplicarNoUsuario = confirm("Este jutsu pode afetar você ou outro alvo.\n\nOK = aplicar em você\nCancelar = registrar no outro alvo");
        }
        var resolvidos = efeitos.map(function (efeito) {
            var e = clonar(efeito);
            if (e.aplicaEm === "usuario_ou_aliado")
                e.aplicaEm = aplicarNoUsuario ? "usuario" : "aliado";
            return normalizarEfeito(e);
        });
        var temAlvoNomeavel = resolvidos.some(function (e) { return APLICACOES_COM_NOME_DE_ALVO.has(e.aplicaEm); });
        var alvoNome = "";
        if (temAlvoNomeavel) {
            alvoNome = String((_a = prompt("Nome do alvo ou aliado (opcional):", "Alvo")) !== null && _a !== void 0 ? _a : "").trim();
        }
        return { efeitos: resolvidos, alvoNome: alvoNome, aplicarNoUsuario: aplicarNoUsuario };
    }
    function encerrarEfeitosRequeridos(efeitos) {
        var nomes = [];
        efeitos.filter(function (e) { return e.tipo === "encerrar_efeitos" && Array.isArray(e.valor); }).forEach(function (e) { return nomes.push.apply(nomes, __spreadArray([], __read(e.valor), false)); });
        if (!nomes.length)
            return [];
        var normalizados = new Set(nomes.map(normalizar));
        var lista = garantirLista();
        var removidos = [];
        for (var i = lista.length - 1; i >= 0; i--) {
            if (normalizados.has(normalizar(lista[i].nome)))
                removidos.push.apply(removidos, __spreadArray([], __read(lista.splice(i, 1)), false));
        }
        return removidos;
    }
    function idDoJutsu(jutsu, indice, config, destino, efeitos) {
        var base = "jutsu:".concat(slug((jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId) || (jutsu === null || jutsu === void 0 ? void 0 : jutsu.id) || (jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || indice || "jutsu"));
        /*
         * O mesmo debuff pode permanecer ativo em alvos diferentes. O nome do
         * alvo entra na chave somente quando o efeito não modifica o usuário.
         */
        var persistentes = efeitosPersistentes(efeitos || []);
        var temUsuario = persistentes.some(function (e) { return APLICACOES_USUARIO.has(e.aplicaEm); });
        var temExterno = persistentes.some(function (e) { return APLICACOES_EXTERNAS.has(e.aplicaEm); });
        if (temExterno && !temUsuario && (destino === null || destino === void 0 ? void 0 : destino.alvoNome)) {
            base += ":alvo-".concat(slug(destino.alvoNome));
        }
        if (!(config === null || config === void 0 ? void 0 : config.acumulaConsigo))
            return base;
        var lista = garantirLista().filter(function (item) { return item.id === base || item.id.startsWith("".concat(base, ":instancia-")); });
        var limite = Math.max(1, Math.trunc(numero(config.limiteInstancias, 99)));
        if (lista.length >= limite)
            return null;
        var numeroInstancia = 1;
        var usados = new Set(lista.map(function (item) { var _a; return numero((_a = item.id.match(/:instancia-(\d+)$/)) === null || _a === void 0 ? void 0 : _a[1], 0); }));
        while (usados.has(numeroInstancia))
            numeroInstancia++;
        return "".concat(base, ":instancia-").concat(numeroInstancia);
    }
    function duracaoEfetiva(jutsu, persistentes) {
        var _a;
        var duracaoJutsu = String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.duracao) || "").trim();
        var duracaoEfeito = String(((_a = (persistentes || []).find(function (e) { return String((e === null || e === void 0 ? void 0 : e.duracao) || "").trim(); })) === null || _a === void 0 ? void 0 : _a.duracao) || "").trim();
        if (!duracaoJutsu || /^instant/i.test(normalizar(duracaoJutsu))) {
            return duracaoEfeito || "Até ser encerrado";
        }
        return duracaoJutsu;
    }
    function efeitosPersistentes(efeitos) {
        return efeitos.filter(function (e) { return e.persistente !== false && e.tipo !== "encerrar_efeitos"; });
    }
    function resumoEfeitos(efeitos) {
        var buffs = efeitos.filter(function (e) { return e.polaridade === "buff"; }).map(efeitoParaTexto);
        var debuffs = efeitos.filter(function (e) { return e.polaridade === "debuff"; }).map(efeitoParaTexto);
        var custos = efeitos.filter(function (e) { return e.polaridade === "custo"; }).map(efeitoParaTexto);
        var partes = [];
        if (buffs.length)
            partes.push("BUFFS\n\u2022 ".concat(buffs.join("\n• ")));
        if (debuffs.length)
            partes.push("DEBUFFS / ALVO\n\u2022 ".concat(debuffs.join("\n• ")));
        if (custos.length)
            partes.push("CUSTOS / CONSEQU\u00CANCIAS\n\u2022 ".concat(custos.join("\n• ")));
        return partes.join("\n\n");
    }
    window.obterEfeitosJutsuBatalhaAtivos = function () {
        return garantirLista().map(function (item) { return (__assign(__assign({}, item), { bonus: __assign({}, item.bonus), multiplicadores: __assign({}, item.multiplicadores), efeitos: clonar(item.efeitos) })); });
    };
    window.obterBonusEfeitosJutsuBatalha = function (alvo) { return bonusAutomatico(alvo); };
    window.obterMultiplicadorEfeitosJutsuBatalha = function (alvo) { return multiplicadorAutomatico(alvo); };
    window.extrairEfeitosJutsuBatalha = function (jutsu) { return { efeitos: obterEfeitosDoJutsu(jutsu), config: configDoJutsu(jutsu) }; };
    window.aplicarEfeitosJutsuBatalha = function (jutsu, indice) {
        return __awaiter(this, void 0, void 0, function () {
            var efeitos, config, destino, efeitosEncerrados, persistentes, resumo, lista, id, mensagem, renovado, itemAtivo, onlineEffectIdAnterior, item_1, existente, anterior, curto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, carregarRegistro()];
                    case 1:
                        _a.sent();
                        efeitos = obterEfeitosDoJutsu(jutsu);
                        if (!efeitos.length)
                            return [2 /*return*/, { aplicado: false, efeitos: [] }];
                        config = configDoJutsu(jutsu);
                        efeitos = selecionarEscolhas(efeitos, config);
                        if (efeitos === null)
                            return [2 /*return*/, { aplicado: false, cancelado: true, efeitos: [] }];
                        efeitos = resolverCondicoesAutomaticas(efeitos, jutsu);
                        destino = resolverDestino(efeitos);
                        efeitos = destino.efeitos;
                        efeitosEncerrados = encerrarEfeitosRequeridos(efeitos);
                        persistentes = efeitosPersistentes(efeitos);
                        resumo = resumoEfeitos(efeitos);
                        lista = garantirLista();
                        id = idDoJutsu(jutsu, indice, config, destino, efeitos);
                        if (!((config === null || config === void 0 ? void 0 : config.acumulaConsigo) && id === null)) return [3 /*break*/, 5];
                        mensagem = "O limite de ".concat(config.limiteInstancias || 1, " inst\u00E2ncias ativas deste jutsu j\u00E1 foi atingido.");
                        if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 3];
                        return [4 /*yield*/, avisoShinobi("Limite de acúmulo", mensagem)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        alert(mensagem);
                        _a.label = 4;
                    case 4: return [2 /*return*/, { aplicado: false, limite: true, efeitos: efeitos }];
                    case 5:
                        renovado = false;
                        itemAtivo = null;
                        onlineEffectIdAnterior = "";
                        if (persistentes.length) {
                            item_1 = {
                                id: id || "jutsu:".concat(slug((jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || indice)),
                                origemTipo: "jutsu",
                                origemId: String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.catalogoId) || indice || ""),
                                nome: String((jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || "Jutsu sem nome"),
                                duracao: duracaoEfetiva(jutsu, persistentes),
                                alvoNome: destino.alvoNome,
                                aplicacao: destino.aplicarNoUsuario ? "usuario" : "alvo",
                                efeitosVersao: VERSAO_EFEITOS,
                                efeitosAssinatura: assinaturaEfeitos(persistentes),
                                efeitos: persistentes,
                                bonus: calcularBonusDoItem(persistentes),
                                multiplicadores: calcularMultiplicadoresDoItem(persistentes),
                                aplicadoEm: Date.now()
                            };
                            existente = lista.findIndex(function (x) { return x.id === item_1.id; });
                            if (existente >= 0) {
                                anterior = lista[existente] || {};
                                onlineEffectIdAnterior = String(anterior.onlineEffectId || "");
                                /* O vínculo antigo é devolvido ao módulo online para que uma renovação
                                   encerre o contador anterior antes de publicar o novo. */
                                if (onlineEffectIdAnterior)
                                    item_1.onlineEffectId = onlineEffectIdAnterior;
                                lista[existente] = item_1;
                                renovado = true;
                            }
                            else
                                lista.push(item_1);
                            itemAtivo = item_1;
                        }
                        if (persistentes.length || efeitosEncerrados.length) {
                            salvarEstado({ confirmada: true, origem: "efeitos-jutsu", campo: CHAVE_ESTADO, motivo: "alteracao-confirmada" });
                            efeitosEncerrados.forEach(function (item) { return emitirEfeitoItemConfirmado(item, { deleted: true, reason: "efeito-encerrado-por-jutsu" }); });
                            if (itemAtivo)
                                emitirEfeitoItemConfirmado(itemAtivo, { reason: renovado ? "efeito-renovado" : "efeito-aplicado" });
                            atualizarTudo();
                        }
                        if (typeof log === "function") {
                            curto = efeitos.slice(0, 4).map(efeitoParaTexto).join(" · ");
                            log("Efeitos de ".concat((jutsu === null || jutsu === void 0 ? void 0 : jutsu.nome) || "Jutsu", ": ").concat(curto).concat(efeitos.length > 4 ? " · …" : ""));
                        }
                        if (!(resumo && typeof avisoShinobi === "function")) return [3 /*break*/, 7];
                        return [4 /*yield*/, avisoShinobi(persistentes.length ? "Efeitos aplicados" : "Efeitos do jutsu", resumo)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, {
                            aplicado: persistentes.length > 0,
                            renovado: renovado,
                            efeitos: efeitos,
                            persistentes: persistentes,
                            itemId: (itemAtivo === null || itemAtivo === void 0 ? void 0 : itemAtivo.id) || null,
                            duracao: (itemAtivo === null || itemAtivo === void 0 ? void 0 : itemAtivo.duracao) || duracaoEfetiva(jutsu, persistentes),
                            aplicadoEm: (itemAtivo === null || itemAtivo === void 0 ? void 0 : itemAtivo.aplicadoEm) || Date.now(),
                            onlineEffectIdAnterior: onlineEffectIdAnterior || null
                        }];
                }
            });
        });
    };
    window.removerEfeitoJutsuBatalha = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var lista, indice, item, ok, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        lista = garantirLista();
                        indice = lista.findIndex(function (item) { return item.id === id; });
                        if (indice < 0)
                            return [2 /*return*/];
                        item = lista[indice];
                        if (!(typeof confirmarUsoAcao === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, confirmarUsoAcao("efeito de batalha", "Encerrar ".concat(item.nome), "Os modificadores automáticos deste efeito serão removidos.")];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = confirm("Encerrar ".concat(item.nome, "?"));
                        _b.label = 3;
                    case 3:
                        ok = _a;
                        if (!ok)
                            return [2 /*return*/];
                        lista.splice(indice, 1);
                        salvarEstado({ confirmada: true, origem: "efeitos-jutsu", campo: CHAVE_ESTADO, motivo: "alteracao-confirmada" });
                        emitirEfeitoItemConfirmado(item, { deleted: true, reason: "efeito-encerrado" });
                        atualizarTudo();
                        if (typeof log === "function")
                            log("Efeito encerrado: ".concat(item.nome));
                        return [2 /*return*/];
                }
            });
        });
    };
    window.limparEfeitosJutsuBatalhaSemConfirmacao = function () {
        if (estado && typeof estado === "object")
            estado[CHAVE_ESTADO] = [];
        salvarEstado();
        atualizarTudo();
    };
    function listarEfeitosEditaveis(jutsu) {
        var efeitos = Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.efeitosEstruturados) ? jutsu.efeitosEstruturados : [];
        return efeitos.map(function (e, i) { return "".concat(i + 1, ". [").concat(String(e.polaridade || "neutro").toUpperCase(), " / ").concat(e.aplicaEm || "usuario", "] ").concat(e.texto || efeitoParaTexto(e)); }).join("\n");
    }
    window.editarEfeitosJutsuEstruturados = function (indice) {
        return __awaiter(this, void 0, void 0, function () {
            var jutsu, lista, escolha, polaridade, aplicaEm, alvo, operacao, valorTexto, texto, valorNumerico, automatico, numeroItem, item;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, carregarRegistro()];
                    case 1:
                        _b.sent();
                        jutsu = (_a = estado === null || estado === void 0 ? void 0 : estado.jutsus) === null || _a === void 0 ? void 0 : _a[indice];
                        if (!jutsu)
                            return [2 /*return*/];
                        if (!Array.isArray(jutsu.efeitosEstruturados))
                            jutsu.efeitosEstruturados = [];
                        lista = listarEfeitosEditaveis(jutsu) || "Nenhum efeito estruturado.";
                        escolha = prompt("EFEITOS AUTOM\u00C1TICOS \u2014 ".concat(jutsu.nome || "Jutsu", "\n\n").concat(lista, "\n\n1 = Adicionar\n2 = Remover\n3 = Restaurar do cat\u00E1logo\n4 = Apenas visualizar\n\nOp\u00E7\u00E3o:"), "4");
                        if (escolha === null || escolha === "4")
                            return [2 /*return*/];
                        if (escolha === "1") {
                            polaridade = normalizar(prompt("Polaridade: buff, debuff, custo ou neutro", "buff") || "buff");
                            aplicaEm = normalizar(prompt("Aplicação: usuario, alvo ou usuario_ou_aliado", "usuario") || "usuario").replace(/\s+/g, "_");
                            alvo = normalizar(prompt("O que afeta? Ex.: ca, velocidade, furtividade, mod_forca, dano, paralisado", "ca") || "efeito").replace(/\s+/g, "_");
                            operacao = normalizar(prompt("Operação: somar, multiplicar, vantagem, desvantagem, adicionar ou reduzir", "somar") || "adicionar");
                            valorTexto = prompt("Valor. Ex.: 2, 1d6, metade ou deixe vazio:", "");
                            texto = prompt("Descrição curta do efeito:", "".concat(ROTULOS_ALVO[alvo] || alvo));
                            if (texto === null)
                                return [2 /*return*/];
                            valorNumerico = valorTexto !== null && /^[-+]?\d+(?:[.,]\d+)?$/.test(String(valorTexto).trim())
                                ? numero(valorTexto, 0)
                                : String(valorTexto || "").trim() || undefined;
                            automatico = APLICACOES_USUARIO.has(aplicaEm) && ALVOS_AUTOMATICOS.has(alvo) && ["somar", "multiplicar"].includes(operacao)
                                ? confirm("Aplicar este valor automaticamente na Área de Batalha?")
                                : false;
                            jutsu.efeitosEstruturados.push(normalizarEfeito({
                                id: "manual:".concat(Date.now()),
                                polaridade: ["buff", "debuff", "custo", "neutro"].includes(polaridade) ? polaridade : "neutro",
                                aplicaEm: aplicaEm,
                                tipo: automatico ? "bonus_numerico" : "especial",
                                alvo: alvo,
                                operacao: operacao,
                                valor: valorNumerico, texto: String(texto || "Efeito personalizado"),
                                automatico: automatico,
                                persistente: true
                            }));
                            jutsu.efeitosEditadosManualmente = true;
                        }
                        else if (escolha === "2") {
                            numeroItem = Math.trunc(numero(prompt("Qual n\u00FAmero remover?\n\n".concat(lista), "1"), 0)) - 1;
                            if (numeroItem >= 0 && numeroItem < jutsu.efeitosEstruturados.length) {
                                jutsu.efeitosEstruturados.splice(numeroItem, 1);
                                jutsu.efeitosEditadosManualmente = true;
                            }
                        }
                        else if (escolha === "3") {
                            item = registroDoJutsu(jutsu);
                            if (!item) {
                                alert("Este jutsu não possui uma definição no catálogo.");
                                return [2 /*return*/];
                            }
                            jutsu.efeitosEstruturados = clonar(item.efeitos || []);
                            jutsu.efeitosEditadosManualmente = false;
                            jutsu.efeitosVersao = VERSAO_EFEITOS;
                            jutsu.efeitosAssinatura = assinaturaEfeitos(jutsu.efeitosEstruturados);
                        }
                        else {
                            alert("Opção inválida.");
                            return [2 /*return*/];
                        }
                        salvarEstado({ confirmada: true, origem: "jutsus", campo: "jutsus", motivo: "alteracao-confirmada" });
                        if (typeof renderizarJutsus === "function")
                            renderizarJutsus();
                        return [2 /*return*/];
                }
            });
        });
    };
    function decorarCardsJutsu() {
        var cards = Array.from(document.querySelectorAll("#listaJutsus .jutsuCard"));
        cards.forEach(function (card, indice) {
            var _a;
            var acoes = card.querySelector(".jutsuAcoes");
            if (!acoes || acoes.querySelector(".btnEfeitosEstruturados"))
                return;
            var jutsu = (_a = estado === null || estado === void 0 ? void 0 : estado.jutsus) === null || _a === void 0 ? void 0 : _a[indice];
            var qtd = Array.isArray(jutsu === null || jutsu === void 0 ? void 0 : jutsu.efeitosEstruturados) ? jutsu.efeitosEstruturados.length : 0;
            var botao = document.createElement("button");
            botao.type = "button";
            botao.className = "btn btnEfeitosEstruturados";
            botao.textContent = "EFEITOS AUTO (".concat(qtd, ")");
            botao.onclick = function () { return window.editarEfeitosJutsuEstruturados(indice); };
            acoes.insertBefore(botao, acoes.lastElementChild);
        });
    }
    function instalarRenderJutsus() {
        if (window.__renderJutsusEfeitosV196 || typeof window.renderizarJutsus !== "function")
            return;
        window.__renderJutsusEfeitosV196 = true;
        var base = window.renderizarJutsus;
        window.renderizarJutsus = function () {
            var resultado = base.apply(this, arguments);
            requestAnimationFrame(decorarCardsJutsu);
            return resultado;
        };
        try {
            renderizarJutsus = window.renderizarJutsus;
        }
        catch (_erro) { }
    }
    function instalarAtualizadores() {
        if (!window.__modsEfeitosEstruturadosV196 && typeof window.atualizarModsBatalhaComBonus === "function") {
            window.__modsEfeitosEstruturadosV196 = true;
            var base_1 = window.atualizarModsBatalhaComBonus;
            window.atualizarModsBatalhaComBonus = function () {
                var resultado = base_1.apply(this, arguments);
                atualizarModificadoresComEfeitos();
                atualizarFurtividade();
                return resultado;
            };
            try {
                atualizarModsBatalhaComBonus = window.atualizarModsBatalhaComBonus;
            }
            catch (_erro) { }
        }
        if (!window.__extrasEfeitosEstruturadosV196 && typeof window.atualizarMostradoresExtrasBatalha === "function") {
            window.__extrasEfeitosEstruturadosV196 = true;
            var base_2 = window.atualizarMostradoresExtrasBatalha;
            window.atualizarMostradoresExtrasBatalha = function () {
                var resultado = base_2.apply(this, arguments);
                atualizarVelocidadeComEfeitos();
                return resultado;
            };
            try {
                atualizarMostradoresExtrasBatalha = window.atualizarMostradoresExtrasBatalha;
            }
            catch (_erro) { }
        }
        window.atualizarDefesasTotaisBatalha = atualizarDefesasComEfeitos;
        try {
            atualizarDefesasTotaisBatalha = atualizarDefesasComEfeitos;
        }
        catch (_erro) { }
    }
    function instalarReset() {
        if (window.__resetEfeitosEstruturadosV196)
            return;
        window.__resetEfeitosEstruturadosV196 = true;
        window.resetarBatalha = function () {
            return __awaiter(this, void 0, void 0, function () {
                var ok, _a, pv, pvMax, chakra, chakraMax, dano, custo, logBox, efeitosAntesReset, contextoReset;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(typeof confirmarUsoAcao === "function")) return [3 /*break*/, 2];
                            return [4 /*yield*/, confirmarUsoAcao("reset", "Resetar batalha", "PV e Chakra voltam ao máximo. Efeitos, bônus temporários e histórico serão limpos.")];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _a = confirm("Resetar a batalha e limpar os efeitos ativos?");
                            _b.label = 3;
                        case 3:
                            ok = _a;
                            if (!ok)
                                return [2 /*return*/, false];
                            pv = document.getElementById("pv"), pvMax = document.getElementById("pvMax");
                            chakra = document.getElementById("chakra"), chakraMax = document.getElementById("chakraMax");
                            dano = document.getElementById("danoBatalha"), custo = document.getElementById("custoBatalha"), logBox = document.getElementById("log");
                            if (pv)
                                pv.value = (pvMax === null || pvMax === void 0 ? void 0 : pvMax.value) || 0;
                            if (chakra)
                                chakra.value = (chakraMax === null || chakraMax === void 0 ? void 0 : chakraMax.value) || 0;
                            if (dano)
                                dano.value = 1;
                            if (custo)
                                custo.value = 1;
                            if (logBox)
                                logBox.innerHTML = "Nada aconteceu ainda.";
                            if (typeof window.shinobiZerarBonusBatalhaPersistidos === "function")
                                window.shinobiZerarBonusBatalhaPersistidos("todos");
                            else
                                document.querySelectorAll("[data-bonus-batalha],[data-bonus-defesa-batalha]").forEach(function (input) { input.value = 0; });
                            if (typeof bonusBatalhaAtributos !== "undefined")
                                Object.keys(bonusBatalhaAtributos).forEach(function (chave) { bonusBatalhaAtributos[chave] = 0; });
                            efeitosAntesReset = Array.isArray(estado[CHAVE_ESTADO]) ? estado[CHAVE_ESTADO].map(clonar) : [];
                            estado[CHAVE_ESTADO] = [];
                            contextoReset = { confirmada: true, origem: "batalha", campos: ["pv", "chakra", CHAVE_ESTADO], motivo: "alteracao-confirmada" };
                            if (typeof salvar === "function")
                                salvar(contextoReset);
                            else
                                salvarEstado(contextoReset);
                            efeitosAntesReset.forEach(function (item) { return emitirEfeitoItemConfirmado(item, { deleted: true, reason: "reset-batalha" }); });
                            if (typeof atualizarModsBatalhaComBonus === "function")
                                atualizarModsBatalhaComBonus();
                            if (typeof atualizarPainelBatalhaVivo === "function")
                                atualizarPainelBatalhaVivo();
                            atualizarTudo();
                            /* Fecha o menu de opções como confirmação visual do reset concluído. */
                            document.querySelectorAll("details.batalhaMenuOpcoes[open]").forEach(function (menu) {
                                menu.removeAttribute("open");
                            });
                            if (!(typeof avisoShinobi === "function")) return [3 /*break*/, 5];
                            return [4 /*yield*/, avisoShinobi("Batalha resetada", "A Área de Batalha e os efeitos ativos foram restaurados.")];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5: return [2 /*return*/, true];
                    }
                });
            });
        };
    }
    function iniciar() {
        return __awaiter(this, void 0, void 0, function () {
            var seletor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        instalarAtualizadores();
                        instalarReset();
                        instalarRenderJutsus();
                        return [4 /*yield*/, carregarRegistro()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, migrarJutsusDoCatalogo()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, migrarEfeitosAtivosDoCatalogo()];
                    case 3:
                        _a.sent();
                        garantirLista();
                        garantirMostradorFurtividade();
                        atualizarTudo();
                        decorarCardsJutsu();
                        seletor = [
                            '[data-save="forca"]', '[data-save="destreza"]', '[data-save="constituicao"]',
                            '[data-save="inteligencia"]', '[data-save="sabedoria"]', '[data-save="carisma"]',
                            '[data-save="velocidade"]', '[data-save="proficiencia"]', '[data-save="p_furtividade"]',
                            '[data-save="ca"]', '[data-save="cd"]', '[data-bonus-batalha]', '[data-bonus-defesa-batalha]'
                        ].join(",");
                        document.addEventListener("input", function (evento) { var _a; if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(seletor))
                            agendarAtualizacao(); });
                        document.addEventListener("change", function (evento) { var _a; if ((_a = evento.target) === null || _a === void 0 ? void 0 : _a.matches(seletor))
                            agendarAtualizacao(); });
                        return [2 /*return*/];
                }
            });
        });
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    else
        iniciar();
    window.addEventListener("pageshow", function () {
        instalarAtualizadores();
        instalarReset();
        instalarRenderJutsus();
        carregarRegistro()
            .then(migrarJutsusDoCatalogo)
            .then(migrarEfeitosAtivosDoCatalogo)
            .then(function () {
            atualizarTudo();
            decorarCardsJutsu();
        });
    });
    window.EfeitosJutsuShinobi = {
        versao: VERSAO,
        versaoEfeitos: VERSAO_EFEITOS,
        carregarRegistro: carregarRegistro,
        migrar: migrarJutsusDoCatalogo,
        migrarAtivos: migrarEfeitosAtivosDoCatalogo,
        extrair: obterEfeitosDoJutsu,
        ativos: window.obterEfeitosJutsuBatalhaAtivos,
        bonus: window.obterBonusEfeitosJutsuBatalha,
        multiplicador: window.obterMultiplicadorEfeitosJutsuBatalha,
        assinatura: assinaturaEfeitos,
        repararAtivos: migrarEfeitosAtivosDoCatalogo,
        localizar: registroDoJutsu,
        atualizar: atualizarTudo,
        condicaoPermiteAutomatico: condicaoPermiteAutomatico,
        auditarCatalogo: function () {
            var lista = Array.isArray(registro === null || registro === void 0 ? void 0 : registro.jutsus) ? registro.jutsus : [];
            return lista.map(function (item) { return ({
                catalogoId: item.catalogoId,
                nome: item.nome,
                totalEfeitos: Array.isArray(item.efeitos) ? item.efeitos.length : 0,
                automaticos: (item.efeitos || []).filter(function (e) { return e.automatico; }).length
            }); });
        }
    };
})();
