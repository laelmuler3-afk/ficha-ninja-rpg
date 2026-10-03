/* GERADO AUTOMATICAMENTE — fonte: js/23-security-hardening.js — app 2.5.8.154. Não editar. */
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
/*
 * Ficha Ninja RPG — validação defensiva de backups locais.
 * Mantido em módulo separado para não ampliar o arquivo legado 01-core.js.
 */
(function () {
    "use strict";
    var LIMITE_ARQUIVO_BYTES = 8 * 1024 * 1024;
    var LIMITE_PROFUNDIDADE = 24;
    var LIMITE_NOS = 100000;
    var LIMITE_CHAVES_OBJETO = 2000;
    var LIMITE_ITENS_ARRAY = 10000;
    var LIMITE_TEXTO = 500000;
    var CHAVES_PROIBIDAS = new Set(["__proto__", "prototype", "constructor"]);
    function validarArvore(valor, caminho, profundidade, contador) {
        if (caminho === void 0) { caminho = "estado"; }
        if (profundidade === void 0) { profundidade = 0; }
        if (contador === void 0) { contador = { total: 0 }; }
        contador.total += 1;
        if (contador.total > LIMITE_NOS)
            throw new Error("O backup contém dados demais.");
        if (profundidade > LIMITE_PROFUNDIDADE)
            throw new Error("Estrutura profunda demais em ".concat(caminho, "."));
        if (valor === null || typeof valor === "boolean")
            return;
        if (typeof valor === "number") {
            if (!Number.isFinite(valor))
                throw new Error("N\u00FAmero inv\u00E1lido em ".concat(caminho, "."));
            return;
        }
        if (typeof valor === "string") {
            if (valor.length > LIMITE_TEXTO)
                throw new Error("Texto excessivamente grande em ".concat(caminho, "."));
            return;
        }
        if (Array.isArray(valor)) {
            if (valor.length > LIMITE_ITENS_ARRAY)
                throw new Error("Lista excessivamente grande em ".concat(caminho, "."));
            valor.forEach(function (item, indice) { return validarArvore(item, "".concat(caminho, "[").concat(indice, "]"), profundidade + 1, contador); });
            return;
        }
        if (typeof valor !== "object")
            throw new Error("Tipo n\u00E3o permitido em ".concat(caminho, "."));
        var chaves = Object.keys(valor);
        if (chaves.length > LIMITE_CHAVES_OBJETO)
            throw new Error("Objeto excessivamente grande em ".concat(caminho, "."));
        chaves.forEach(function (chave) {
            if (CHAVES_PROIBIDAS.has(chave))
                throw new Error("Chave perigosa encontrada em ".concat(caminho, "."));
            validarArvore(valor[chave], "".concat(caminho, ".").concat(chave), profundidade + 1, contador);
        });
    }
    function extrairEstadoBackup(dados) {
        if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
            throw new Error("O conteúdo principal do backup precisa ser um objeto.");
        }
        var possuiEnvelope = Object.prototype.hasOwnProperty.call(dados, "estado");
        var novoEstado = possuiEnvelope ? dados.estado : dados;
        if (!novoEstado || typeof novoEstado !== "object" || Array.isArray(novoEstado)) {
            throw new Error("O backup não contém um estado de ficha válido.");
        }
        validarArvore(novoEstado);
        return novoEstado;
    }
    function clonarSeguro(valor) {
        if (valor == null)
            return valor;
        if (typeof structuredClone === "function")
            return structuredClone(valor);
        return JSON.parse(JSON.stringify(valor));
    }
    function aplicarVinculoDaFichaDestino(importado) {
        var onlineAtual = (estado === null || estado === void 0 ? void 0 : estado.__online) && typeof estado.__online === "object" ? clonarSeguro(estado.__online) : null;
        /* __online descreve o vínculo da ficha que já existe neste aparelho.
           Um arquivo importado fornece conteúdo, nunca autorização para assumir o
           characterId/sheetId de outra ficha. Se a ficha atual ainda não possui
           vínculo online, a identidade será criada normalmente pelo motor online. */
        if (onlineAtual && Object.keys(onlineAtual).length) {
            importado.__online = onlineAtual;
            importado.__online.name = String(typeof fichaAtual !== "undefined" ? fichaAtual : (onlineAtual.name || "Principal"));
        }
        else {
            delete importado.__online;
        }
        return importado;
    }
    function importarFichaSegura(event) {
        var _this = this;
        var _a;
        var input = event === null || event === void 0 ? void 0 : event.target;
        var arquivo = (_a = input === null || input === void 0 ? void 0 : input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!arquivo)
            return;
        /* A importação é assíncrona (FileReader + IndexedDB). Guardamos o destino
           exato no momento em que o usuário escolheu o arquivo para que uma troca
           de ficha durante a leitura nunca faça o backup cair em outra ficha. */
        var destinoNome = String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal");
        var destinoChave = String(typeof CHAVE !== "undefined" ? CHAVE : "");
        var destinoAindaAtivo = function () {
            return window.__shinobiSheetTransition !== true &&
                String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal") === destinoNome &&
                String(typeof CHAVE !== "undefined" ? CHAVE : "") === destinoChave;
        };
        if (arquivo.size > LIMITE_ARQUIVO_BYTES) {
            alert("O backup ultrapassa o limite de 8 MB. Verifique se o arquivo é realmente uma ficha exportada pelo aplicativo.");
            input.value = "";
            return;
        }
        var leitor = new FileReader();
        leitor.onerror = function () {
            alert("Não foi possível ler o arquivo selecionado.");
            input.value = "";
        };
        leitor.onload = function (evento) { return __awaiter(_this, void 0, void 0, function () {
            var estadoAnterior, dados, novoEstado, importado, erro_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!destinoAindaAtivo())
                            return [2 /*return*/];
                        estadoAnterior = clonarSeguro(estado);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        dados = JSON.parse(String(((_a = evento.target) === null || _a === void 0 ? void 0 : _a.result) || ""));
                        novoEstado = extrairEstadoBackup(dados);
                        if (!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?"))
                            return [2 /*return*/];
                        importado = aplicarVinculoDaFichaDestino(clonarSeguro(novoEstado));
                        estado = importado;
                        if (!(typeof window.shinobiMigrarEstadoImagensParaIndexedDB === "function")) return [3 /*break*/, 3];
                        return [4 /*yield*/, window.shinobiMigrarEstadoImagensParaIndexedDB({ persistir: false })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!destinoAindaAtivo())
                            return [2 /*return*/];
                        if (!persistirEstadoLocal({ emitir: false, origem: "importacao", motivo: "importacao-local" })) {
                            throw new Error("O armazenamento local não aceitou os dados importados.");
                        }
                        alert("Ficha importada com sucesso!");
                        location.reload();
                        return [3 /*break*/, 6];
                    case 4:
                        erro_1 = _b.sent();
                        console.error("Falha ao importar backup:", erro_1);
                        if (destinoAindaAtivo())
                            estado = estadoAnterior;
                        alert("N\u00E3o foi poss\u00EDvel importar a ficha. ".concat((erro_1 === null || erro_1 === void 0 ? void 0 : erro_1.message) || "O arquivo precisa ser um JSON válido."));
                        return [3 /*break*/, 6];
                    case 5:
                        input.value = "";
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        leitor.readAsText(arquivo);
    }
    function escolherOrigemImportacao() {
        return new Promise(function (resolve) {
            var overlay = document.createElement("div");
            overlay.className = "modalShinobiOverlay";
            overlay.innerHTML = "\n        <div class=\"modalShinobiBox\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"ekoImportarTitulo\">\n          <h3 id=\"ekoImportarTitulo\" class=\"modalShinobiTitulo\">Importar ficha</h3>\n          <p class=\"modalShinobiTexto\">Escolha de onde deseja trazer a ficha.</p>\n          <div class=\"modalShinobiAcoes\" style=\"grid-template-columns:1fr;\">\n            <button type=\"button\" class=\"modalShinobiBtn confirmar\" data-origem-importacao=\"dispositivo\">Do dispositivo</button>\n            <button type=\"button\" class=\"modalShinobiBtn\" data-origem-importacao=\"nuvem\">Da nuvem</button>\n            <button type=\"button\" class=\"modalShinobiBtn cancelar\" data-origem-importacao=\"cancelar\">Cancelar</button>\n          </div>\n        </div>";
            document.body.appendChild(overlay);
            var concluir = function (origem) {
                overlay.remove();
                resolve(origem);
            };
            overlay.querySelectorAll("[data-origem-importacao]").forEach(function (botao) {
                botao.addEventListener("click", function () { return concluir(botao.dataset.origemImportacao || "cancelar"); });
            });
            overlay.addEventListener("click", function (evento) { if (evento.target === overlay)
                concluir("cancelar"); });
        });
    }
    function aguardarPainelNuvem(limiteMs) {
        var _a;
        if (limiteMs === void 0) { limiteMs = 6000; }
        if ((_a = window.ShinobiOnlineUI) === null || _a === void 0 ? void 0 : _a.abrir)
            return Promise.resolve(true);
        return new Promise(function (resolve) {
            var finalizado = false;
            var concluir = function (valor) {
                if (finalizado)
                    return;
                finalizado = true;
                clearTimeout(timer);
                window.removeEventListener("shinobi:online-stack-ready", aoCarregar);
                resolve(valor);
            };
            var aoCarregar = function () { return setTimeout(function () { var _a; return concluir(Boolean((_a = window.ShinobiOnlineUI) === null || _a === void 0 ? void 0 : _a.abrir)); }, 0); };
            var timer = setTimeout(function () { var _a; return concluir(Boolean((_a = window.ShinobiOnlineUI) === null || _a === void 0 ? void 0 : _a.abrir)); }, limiteMs);
            window.addEventListener("shinobi:online-stack-ready", aoCarregar, { once: true });
        });
    }
    function abrirImportarFichaSeguro() {
        return __awaiter(this, void 0, void 0, function () {
            var origem, input, disponivel;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, escolherOrigemImportacao()];
                    case 1:
                        origem = _c.sent();
                        if (origem === "dispositivo") {
                            input = document.getElementById("importarFichaInput");
                            input === null || input === void 0 ? void 0 : input.click();
                            return [2 /*return*/];
                        }
                        if (origem !== "nuvem")
                            return [2 /*return*/];
                        return [4 /*yield*/, aguardarPainelNuvem()];
                    case 2:
                        disponivel = _c.sent();
                        if (!!disponivel) return [3 /*break*/, 6];
                        if (!(typeof window.avisoShinobi === "function")) return [3 /*break*/, 4];
                        return [4 /*yield*/, window.avisoShinobi("Nuvem indisponível", "A ficha continua funcionando normalmente, mas o módulo online não pôde ser carregado agora.")];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        alert("O módulo online não pôde ser carregado agora.");
                        _c.label = 5;
                    case 5: return [2 /*return*/];
                    case 6:
                        (_b = (_a = window.ShinobiOnlineUI) === null || _a === void 0 ? void 0 : _a.abrir) === null || _b === void 0 ? void 0 : _b.call(_a, "sincronizacao");
                        return [2 /*return*/];
                }
            });
        });
    }
    window.abrirImportarFicha = abrirImportarFichaSeguro;
    window.importarFicha = importarFichaSegura;
    window.validarBackupFicha = extrairEstadoBackup;
})();
