/* GERADO AUTOMATICAMENTE — fonte: js/03-images.js — app 2.5.8.154. Não editar. */
/* Shinobi 1.3.3 — armazenamento de imagens revisado e otimizado. */
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
/* ===== ARMAZENAMENTO OTIMIZADO DE IMAGENS (INDEXEDDB) ===== */
/* As imagens saem do localStorage e passam para o banco de imagens do navegador.
   Isso libera a memória da ficha e evita o limite baixo do localStorage. */
(function () {
    if (window.__fichaNinjaImagensIndexedDBV5)
        return;
    window.__fichaNinjaImagensIndexedDBV5 = true;
    var DB_NOME = "FichaNinjaImagens";
    var DB_VERSAO = 1;
    var STORE_IMAGENS = "imagens";
    var RETENCAO_IMAGEM_ORFA_MS = 7 * 24 * 60 * 60 * 1000;
    var urlsEmMemoria = new Map();
    var promessaBanco = null;
    function avisar(titulo, texto) {
        if (typeof avisoShinobi === "function")
            return avisoShinobi(titulo, texto);
        alert(texto || titulo);
        return Promise.resolve();
    }
    function imagemDataUrl(valor) {
        return typeof valor === "string" && /^data:image\//i.test(valor);
    }
    function idNovo(tipo) {
        var unico = (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2));
        return tipo + ":" + unico;
    }
    function nomeFichaAtualSeguro() {
        try {
            return String(typeof fichaAtual !== "undefined" ? fichaAtual : "Principal").trim() || "Principal";
        }
        catch (_erro) {
            return "Principal";
        }
    }
    function emitirImagemConfirmada(target, imageId, deleted) {
        if (imageId === void 0) { imageId = ""; }
        if (deleted === void 0) { deleted = false; }
        var alvo = target && typeof target === "object" ? target : null;
        if (!alvo)
            return;
        var online = (estado === null || estado === void 0 ? void 0 : estado.__online) && typeof estado.__online === "object" ? estado.__online : {};
        var detail = {
            sheetName: nomeFichaAtualSeguro(),
            target: JSON.parse(JSON.stringify(alvo)),
            imageId: String(imageId || ""),
            deleted: deleted === true,
            savedAt: Date.now(),
            characterId: String(online.characterId || online.realtimeId || ""),
            ownerUid: String(online.characterOwnerUid || online.realtimeOwnerUid || online.ownerUid || "")
        };
        try {
            window.dispatchEvent(new CustomEvent("shinobi:imagem-confirmada", { detail: detail }));
        }
        catch (_erro) { }
    }
    function abrirBanco() {
        if (promessaBanco)
            return promessaBanco;
        promessaBanco = new Promise(function (resolve, reject) {
            if (!window.indexedDB) {
                reject(new Error("IndexedDB indisponível neste navegador."));
                return;
            }
            var pedido = indexedDB.open(DB_NOME, DB_VERSAO);
            pedido.onupgradeneeded = function () {
                var banco = pedido.result;
                if (!banco.objectStoreNames.contains(STORE_IMAGENS)) {
                    banco.createObjectStore(STORE_IMAGENS, { keyPath: "id" });
                }
            };
            pedido.onsuccess = function () { return resolve(pedido.result); };
            pedido.onerror = function () {
                promessaBanco = null;
                reject(pedido.error ||
                    new Error("Não foi possível abrir o banco de imagens."));
            };
            pedido.onblocked = function () {
                promessaBanco = null;
                reject(new Error("O banco de imagens está aberto em outra versão do aplicativo."));
            };
        });
        return promessaBanco;
    }
    function salvarBlob(id, blob) {
        return __awaiter(this, void 0, void 0, function () {
            var banco;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, abrirBanco()];
                    case 1:
                        banco = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = banco.transaction(STORE_IMAGENS, "readwrite");
                                tx.objectStore(STORE_IMAGENS).put({ id: id, blob: blob, atualizadoEm: Date.now() });
                                tx.oncomplete = function () { return resolve(); };
                                tx.onerror = function () { return reject(tx.error || new Error("Não foi possível salvar a imagem.")); };
                                tx.onabort = function () { return reject(tx.error || new Error("O banco de imagens foi interrompido.")); };
                            })];
                }
            });
        });
    }
    function obterBlob(id) {
        return __awaiter(this, void 0, void 0, function () {
            var banco;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!id)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, abrirBanco()];
                    case 1:
                        banco = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = banco.transaction(STORE_IMAGENS, "readonly");
                                var pedido = tx.objectStore(STORE_IMAGENS).get(id);
                                pedido.onsuccess = function () { var _a; return resolve(((_a = pedido.result) === null || _a === void 0 ? void 0 : _a.blob) || null); };
                                pedido.onerror = function () { return reject(pedido.error || new Error("Não foi possível ler a imagem.")); };
                            })];
                }
            });
        });
    }
    function apagarBlob(id) {
        return __awaiter(this, void 0, void 0, function () {
            var banco;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!id)
                            return [2 /*return*/];
                        return [4 /*yield*/, abrirBanco()];
                    case 1:
                        banco = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = banco.transaction(STORE_IMAGENS, "readwrite");
                                tx.objectStore(STORE_IMAGENS).delete(id);
                                tx.oncomplete = function () { return resolve(); };
                                tx.onerror = function () { return reject(tx.error || new Error("Não foi possível apagar a imagem.")); };
                            })];
                }
            });
        });
    }
    function listarIdsDoBanco() {
        return __awaiter(this, void 0, void 0, function () {
            var banco;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, abrirBanco()];
                    case 1:
                        banco = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = banco.transaction(STORE_IMAGENS, "readonly");
                                var pedido = tx.objectStore(STORE_IMAGENS).getAllKeys();
                                pedido.onsuccess = function () { return resolve(pedido.result || []); };
                                pedido.onerror = function () { return reject(pedido.error || new Error("Não foi possível listar as imagens.")); };
                            })];
                }
            });
        });
    }
    function listarRegistrosDoBanco() {
        return __awaiter(this, void 0, void 0, function () {
            var banco;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, abrirBanco()];
                    case 1:
                        banco = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var tx = banco.transaction(STORE_IMAGENS, "readonly");
                                var pedido = tx.objectStore(STORE_IMAGENS).getAll();
                                pedido.onsuccess = function () { return resolve(pedido.result || []); };
                                pedido.onerror = function () { return reject(pedido.error || new Error("Não foi possível listar os registros de imagens.")); };
                            })];
                }
            });
        });
    }
    function urlParaBlob(id, blob) {
        if (!blob)
            return "";
        var existente = urlsEmMemoria.get(id);
        if (existente)
            return existente;
        var url = URL.createObjectURL(blob);
        urlsEmMemoria.set(id, url);
        return url;
    }
    function limparUrlEmMemoria(id) {
        var url = urlsEmMemoria.get(id);
        if (url) {
            try {
                URL.revokeObjectURL(url);
            }
            catch (err) { }
            urlsEmMemoria.delete(id);
        }
    }
    function alvoImagemAtual(target) {
        var tipo = String((target === null || target === void 0 ? void 0 : target.type) || "");
        if (tipo === "avatar")
            return { tipo: tipo, id: (estado === null || estado === void 0 ? void 0 : estado.avatarNinjaId) || "" };
        if (tipo === "profile-cover")
            return { tipo: tipo, id: (estado === null || estado === void 0 ? void 0 : estado.perfilFundoImagemId) || "" };
        if (tipo === "jutsu-cover") {
            var jutsuId_1 = String((target === null || target === void 0 ? void 0 : target.jutsuId) || "");
            var jutsu = ((estado === null || estado === void 0 ? void 0 : estado.jutsus) || []).find(function (item) { return String((item === null || item === void 0 ? void 0 : item.jutsuId) || "") === jutsuId_1; });
            return { tipo: tipo, id: (jutsu === null || jutsu === void 0 ? void 0 : jutsu.imagemId) || "", jutsu: jutsu };
        }
        return { tipo: "", id: "" };
    }
    function aplicarImagemRemota() {
        return __awaiter(this, arguments, void 0, function (_a) {
            var atual, novoId, url, jutsu;
            var _b = _a === void 0 ? {} : _a, target = _b.target, blob = _b.blob, _c = _b.deleted, deleted = _c === void 0 ? false : _c, _d = _b.version, version = _d === void 0 ? "" : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        atual = alvoImagemAtual(target);
                        if (!atual.tipo)
                            return [2 /*return*/, false];
                        novoId = deleted ? "" : "cloud:".concat(atual.tipo, ":").concat(String(version || Date.now()));
                        url = "";
                        if (!!deleted) return [3 /*break*/, 2];
                        if (!(blob instanceof Blob))
                            throw new Error("Blob remoto de imagem inválido.");
                        return [4 /*yield*/, salvarBlob(novoId, blob)];
                    case 1:
                        _e.sent();
                        url = urlParaBlob(novoId, blob);
                        _e.label = 2;
                    case 2:
                        if (atual.tipo === "avatar") {
                            if (deleted) {
                                delete estado.avatarNinjaId;
                                estado.avatarNinja = "";
                            }
                            else {
                                estado.avatarNinjaId = novoId;
                                estado.avatarNinja = "";
                            }
                            if (typeof persistirEstadoLocal === "function")
                                persistirEstadoLocal({ emitir: false, origem: "imagem-remota" });
                            if (typeof aplicarAvatar === "function")
                                aplicarAvatar(deleted ? "" : url);
                            return [2 /*return*/, true];
                        }
                        if (atual.tipo === "profile-cover") {
                            if (deleted) {
                                delete estado.perfilFundoImagemId;
                                delete estado.perfilFundoImagem;
                            }
                            else {
                                estado.perfilFundoImagemId = novoId;
                                estado.perfilFundoImagem = "";
                            }
                            if (typeof persistirEstadoLocal === "function")
                                persistirEstadoLocal({ emitir: false, origem: "imagem-remota" });
                            if (typeof aplicarFundoPerfil === "function")
                                aplicarFundoPerfil(deleted ? "" : url);
                            return [2 /*return*/, true];
                        }
                        jutsu = atual.jutsu;
                        if (!jutsu)
                            return [2 /*return*/, false];
                        if (deleted) {
                            delete jutsu.imagemId;
                            jutsu.imagem = "";
                        }
                        else {
                            jutsu.imagemId = novoId;
                            jutsu.imagem = "";
                        }
                        if (typeof persistirEstadoLocal === "function")
                            persistirEstadoLocal({ emitir: false, origem: "imagem-remota" });
                        if (typeof renderizarJutsus === "function")
                            renderizarJutsus();
                        return [2 /*return*/, true];
                }
            });
        });
    }
    function temImagemLocal(target) {
        return __awaiter(this, void 0, void 0, function () {
            var atual, _a, _erro_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        atual = alvoImagemAtual(target);
                        if (!atual.id)
                            return [2 /*return*/, false];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = Boolean;
                        return [4 /*yield*/, obterBlob(atual.id)];
                    case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    case 3:
                        _erro_1 = _b.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    window.ShinobiImagensLocal = Object.freeze({
        obterBlob: obterBlob,
        salvarBlob: salvarBlob,
        apagarBlob: apagarBlob,
        temImagemLocal: temImagemLocal,
        aplicarRemota: aplicarImagemRemota
    });
    function dataUrlParaBlob(dataUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var resposta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(dataUrl)];
                    case 1:
                        resposta = _a.sent();
                        return [2 /*return*/, resposta.blob()];
                }
            });
        });
    }
    function blobParaDataUrl(blob) {
        return new Promise(function (resolve, reject) {
            var leitor = new FileReader();
            leitor.onerror = function () { return reject(new Error("Não foi possível preparar a imagem para o backup.")); };
            leitor.onload = function () { return resolve(leitor.result); };
            leitor.readAsDataURL(blob);
        });
    }
    function copiarEstado() {
        return JSON.parse(JSON.stringify(estado || {}));
    }
    function estadoParaLocalStorage(origem) {
        var fonte = origem && typeof origem === "object" ? origem : estado;
        var copia = JSON.parse(JSON.stringify(fonte || {}));
        (copia.jutsus || []).forEach(function (jutsu) {
            if (jutsu && jutsu.imagemId) {
                jutsu.imagem = "";
            }
            if (jutsu && typeof jutsu.imagem === "string" && jutsu.imagem.startsWith("blob:")) {
                jutsu.imagem = "";
            }
        });
        if (copia.avatarNinjaId)
            copia.avatarNinja = "";
        if (copia.perfilFundoImagemId)
            copia.perfilFundoImagem = "";
        return copia;
    }
    /* A persistência principal pertence ao core. Este módulo apenas prepara uma
       cópia leve do estado, removendo Base64/blob URLs sem quebrar eventos de
       autosave, contexto de confirmação ou a fila de sincronização online. */
    window.shinobiPrepararEstadoPersistencia = function (valor) {
        return estadoParaLocalStorage(valor);
    };
    function otimizarArquivoParaBlob(arquivo, opcoes) {
        return __awaiter(this, void 0, void 0, function () {
            var maxLargura, maxAltura, qualidade, urlOrigem, img_1, escala, largura, altura, canvas_1, ctx, transformar, blob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opcoes = opcoes || {};
                        if (!arquivo || !(arquivo instanceof Blob)) {
                            throw new Error("Arquivo de imagem inválido.");
                        }
                        maxLargura = opcoes.maxLargura || 640;
                        maxAltura = opcoes.maxAltura || 900;
                        qualidade = typeof opcoes.qualidade === "number" ? opcoes.qualidade : .72;
                        urlOrigem = URL.createObjectURL(arquivo);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 6, 7]);
                        img_1 = new Image();
                        img_1.decoding = "async";
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                img_1.onload = resolve;
                                img_1.onerror = function () { return reject(new Error("Não foi possível abrir essa imagem.")); };
                                img_1.src = urlOrigem;
                            })];
                    case 2:
                        _a.sent();
                        escala = Math.min(maxLargura / img_1.width, maxAltura / img_1.height, 1);
                        largura = Math.max(1, Math.round(img_1.width * escala));
                        altura = Math.max(1, Math.round(img_1.height * escala));
                        canvas_1 = document.createElement("canvas");
                        canvas_1.width = largura;
                        canvas_1.height = altura;
                        ctx = canvas_1.getContext("2d", { alpha: false });
                        ctx.fillStyle = "#111";
                        ctx.fillRect(0, 0, largura, altura);
                        ctx.drawImage(img_1, 0, 0, largura, altura);
                        transformar = function (tipo, qualidadeFinal) { return new Promise(function (resolve) {
                            canvas_1.toBlob(function (blob) { return resolve(blob); }, tipo, qualidadeFinal);
                        }); };
                        return [4 /*yield*/, transformar("image/webp", qualidade)];
                    case 3:
                        blob = _a.sent();
                        if (!(!blob || !blob.size)) return [3 /*break*/, 5];
                        return [4 /*yield*/, transformar("image/jpeg", Math.min(.78, qualidade + .05))];
                    case 4:
                        blob = _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!blob || !blob.size) {
                            throw new Error("Não foi possível otimizar essa imagem.");
                        }
                        return [2 /*return*/, blob];
                    case 6:
                        try {
                            URL.revokeObjectURL(urlOrigem);
                        }
                        catch (err) { }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    function migrarEstadoAtualParaIndexedDB() {
        return __awaiter(this, arguments, void 0, function (opcoes) {
            var persistirAoFinal, pendentes, jutsus, jutsus_1, jutsus_1_1, jutsu, blobOriginal, blobOtimizado, id, e_1_1, blobOriginal, blobOtimizado, id, blobOriginal, blobOtimizado, id, antes;
            var e_1, _a;
            if (opcoes === void 0) { opcoes = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        persistirAoFinal = (opcoes === null || opcoes === void 0 ? void 0 : opcoes.persistir) !== false;
                        return [4 /*yield*/, abrirBanco()];
                    case 1:
                        _b.sent();
                        pendentes = [];
                        jutsus = Array.isArray(estado.jutsus) ? estado.jutsus : [];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, 10, 11]);
                        jutsus_1 = __values(jutsus), jutsus_1_1 = jutsus_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!jutsus_1_1.done) return [3 /*break*/, 8];
                        jutsu = jutsus_1_1.value;
                        if (!(jutsu && imagemDataUrl(jutsu.imagem))) return [3 /*break*/, 7];
                        return [4 /*yield*/, dataUrlParaBlob(jutsu.imagem)];
                    case 4:
                        blobOriginal = _b.sent();
                        return [4 /*yield*/, otimizarArquivoParaBlob(blobOriginal, { maxLargura: 640, maxAltura: 900, qualidade: .72 })];
                    case 5:
                        blobOtimizado = _b.sent();
                        id = idNovo("jutsu");
                        return [4 /*yield*/, salvarBlob(id, blobOtimizado)];
                    case 6:
                        _b.sent();
                        pendentes.push({ alvo: jutsu, campo: "imagem", campoId: "imagemId", id: id, blob: blobOtimizado });
                        _b.label = 7;
                    case 7:
                        jutsus_1_1 = jutsus_1.next();
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (jutsus_1_1 && !jutsus_1_1.done && (_a = jutsus_1.return)) _a.call(jutsus_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        if (!imagemDataUrl(estado.avatarNinja)) return [3 /*break*/, 15];
                        return [4 /*yield*/, dataUrlParaBlob(estado.avatarNinja)];
                    case 12:
                        blobOriginal = _b.sent();
                        return [4 /*yield*/, otimizarArquivoParaBlob(blobOriginal, { maxLargura: 480, maxAltura: 480, qualidade: .76 })];
                    case 13:
                        blobOtimizado = _b.sent();
                        id = idNovo("avatar");
                        return [4 /*yield*/, salvarBlob(id, blobOtimizado)];
                    case 14:
                        _b.sent();
                        pendentes.push({ alvo: estado, campo: "avatarNinja", campoId: "avatarNinjaId", id: id, blob: blobOtimizado });
                        _b.label = 15;
                    case 15:
                        if (!imagemDataUrl(estado.perfilFundoImagem)) return [3 /*break*/, 19];
                        return [4 /*yield*/, dataUrlParaBlob(estado.perfilFundoImagem)];
                    case 16:
                        blobOriginal = _b.sent();
                        return [4 /*yield*/, otimizarArquivoParaBlob(blobOriginal, { maxLargura: 960, maxAltura: 720, qualidade: .70 })];
                    case 17:
                        blobOtimizado = _b.sent();
                        id = idNovo("perfil-fundo");
                        return [4 /*yield*/, salvarBlob(id, blobOtimizado)];
                    case 18:
                        _b.sent();
                        pendentes.push({ alvo: estado, campo: "perfilFundoImagem", campoId: "perfilFundoImagemId", id: id, blob: blobOtimizado });
                        _b.label = 19;
                    case 19:
                        if (!pendentes.length)
                            return [2 /*return*/, false];
                        antes = pendentes.map(function (item) { return ({
                            alvo: item.alvo,
                            campo: item.campo,
                            campoId: item.campoId,
                            valor: item.alvo[item.campo],
                            valorId: item.alvo[item.campoId]
                        }); });
                        pendentes.forEach(function (item) {
                            item.alvo[item.campoId] = item.id;
                            item.alvo[item.campo] = "";
                            urlParaBlob(item.id, item.blob);
                        });
                        if (persistirAoFinal && !persistirEstadoLocal()) {
                            antes.forEach(function (item) {
                                item.alvo[item.campo] = item.valor;
                                if (item.valorId)
                                    item.alvo[item.campoId] = item.valorId;
                                else
                                    delete item.alvo[item.campoId];
                            });
                            throw new Error("Não foi possível concluir a migração do armazenamento.");
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    }
    function hidratarImagensDoIndexedDB() {
        return __awaiter(this, void 0, void 0, function () {
            var precisaRenderizarJutsus_1, tarefas, _loop_1, _a, _b, jutsu, err_1;
            var e_2, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, abrirBanco()];
                    case 1:
                        _d.sent();
                        precisaRenderizarJutsus_1 = false;
                        tarefas = [];
                        _loop_1 = function (jutsu) {
                            if (!(jutsu === null || jutsu === void 0 ? void 0 : jutsu.imagemId))
                                return "continue";
                            tarefas.push((function () { return __awaiter(_this, void 0, void 0, function () {
                                var blob;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (urlsEmMemoria.has(jutsu.imagemId)) {
                                                precisaRenderizarJutsus_1 = true;
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, obterBlob(jutsu.imagemId)];
                                        case 1:
                                            blob = _a.sent();
                                            if (blob) {
                                                urlParaBlob(jutsu.imagemId, blob);
                                                precisaRenderizarJutsus_1 = true;
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })());
                        };
                        try {
                            for (_a = __values((estado.jutsus || [])), _b = _a.next(); !_b.done; _b = _a.next()) {
                                jutsu = _b.value;
                                _loop_1(jutsu);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        if (estado.avatarNinjaId) {
                            tarefas.push((function () { return __awaiter(_this, void 0, void 0, function () {
                                var url, blob;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = urlsEmMemoria.get(estado.avatarNinjaId) || "";
                                            if (!!url) return [3 /*break*/, 2];
                                            return [4 /*yield*/, obterBlob(estado.avatarNinjaId)];
                                        case 1:
                                            blob = _a.sent();
                                            if (blob) {
                                                url = urlParaBlob(estado.avatarNinjaId, blob);
                                            }
                                            _a.label = 2;
                                        case 2:
                                            if (url && typeof aplicarAvatar === "function") {
                                                aplicarAvatar(url);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })());
                        }
                        if (estado.perfilFundoImagemId) {
                            tarefas.push((function () { return __awaiter(_this, void 0, void 0, function () {
                                var url, blob;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            url = urlsEmMemoria.get(estado.perfilFundoImagemId) || "";
                                            if (!!url) return [3 /*break*/, 2];
                                            return [4 /*yield*/, obterBlob(estado.perfilFundoImagemId)];
                                        case 1:
                                            blob = _a.sent();
                                            if (blob) {
                                                url = urlParaBlob(estado.perfilFundoImagemId, blob);
                                            }
                                            _a.label = 2;
                                        case 2:
                                            if (url && typeof aplicarFundoPerfil === "function") {
                                                aplicarFundoPerfil(url);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })());
                        }
                        return [4 /*yield*/, Promise.all(tarefas)];
                    case 2:
                        _d.sent();
                        if (precisaRenderizarJutsus_1 &&
                            typeof renderizarJutsus === "function") {
                            renderizarJutsus();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _d.sent();
                        console.warn("Não foi possível carregar as imagens otimizadas.", err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    /* O renderizador original continua intacto; ele só recebe URLs temporárias na hora de desenhar as cartas. */
    if (typeof renderizarJutsus === "function") {
        var renderizarJutsusBaseIndexedDB_1 = renderizarJutsus;
        window.renderizarJutsus = function () {
            var restaurar = [];
            (estado.jutsus || []).forEach(function (jutsu) {
                if (jutsu === null || jutsu === void 0 ? void 0 : jutsu.imagemId) {
                    restaurar.push({ jutsu: jutsu, imagem: jutsu.imagem });
                    jutsu.imagem = urlsEmMemoria.get(jutsu.imagemId) || "";
                }
            });
            var resultado = renderizarJutsusBaseIndexedDB_1.apply(this, arguments);
            restaurar.forEach(function (item) {
                item.jutsu.imagem = item.imagem || "";
            });
            return resultado;
        };
    }
    function salvarNovaImagemDeJutsu(arquivo, indice) {
        return __awaiter(this, void 0, void 0, function () {
            var blob, novoId, jutsu, anterior;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!estado.jutsus || !estado.jutsus[indice])
                            throw new Error("Jutsu não encontrado.");
                        return [4 /*yield*/, otimizarArquivoParaBlob(arquivo, { maxLargura: 640, maxAltura: 900, qualidade: .72 })];
                    case 1:
                        blob = _c.sent();
                        novoId = idNovo("jutsu");
                        jutsu = estado.jutsus[indice];
                        anterior = { imagem: jutsu.imagem, imagemId: jutsu.imagemId };
                        return [4 /*yield*/, salvarBlob(novoId, blob)];
                    case 2:
                        _c.sent();
                        jutsu.imagemId = novoId;
                        jutsu.imagem = "";
                        estado.jutsusAbertos = estado.jutsusAbertos || {};
                        estado.jutsusAbertos[indice] = true;
                        urlParaBlob(novoId, blob);
                        if (!!persistirEstadoLocal()) return [3 /*break*/, 4];
                        limparUrlEmMemoria(novoId);
                        return [4 /*yield*/, apagarBlob(novoId).catch(function () { })];
                    case 3:
                        _c.sent();
                        jutsu.imagem = anterior.imagem || "";
                        if (anterior.imagemId)
                            jutsu.imagemId = anterior.imagemId;
                        else
                            delete jutsu.imagemId;
                        throw new Error("Não foi possível salvar a imagem na ficha.");
                    case 4:
                        try {
                            (_b = (_a = window.ShinobiJutsusItemLevel) === null || _a === void 0 ? void 0 : _a.garantirIdsNovos) === null || _b === void 0 ? void 0 : _b.call(_a, estado.jutsus);
                        }
                        catch (_erro) { }
                        if (jutsu.jutsuId)
                            emitirImagemConfirmada({ type: "jutsu-cover", jutsuId: jutsu.jutsuId }, novoId, false);
                        agendarLimpezaImagensOrfas();
                        return [2 /*return*/];
                }
            });
        });
    }
    window.carregarImagemJutsu = function (evento, indiceRecebido) {
        return __awaiter(this, void 0, void 0, function () {
            var arquivo, indice, err_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        arquivo = (_b = (_a = evento === null || evento === void 0 ? void 0 : evento.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
                        indice = Number(indiceRecebido);
                        if (!Number.isInteger(indice))
                            indice = Number(window.jutsuUploadIndiceAtual);
                        try {
                            if (!Number.isInteger(indice))
                                indice = Number(jutsuUploadIndiceAtual);
                        }
                        catch (err) { }
                        if (!arquivo)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 5, 6]);
                        return [4 /*yield*/, salvarNovaImagemDeJutsu(arquivo, indice)];
                    case 2:
                        _c.sent();
                        if (typeof renderizarJutsus === "function")
                            renderizarJutsus();
                        return [3 /*break*/, 6];
                    case 3:
                        err_2 = _c.sent();
                        console.error(err_2);
                        return [4 /*yield*/, avisar("Não foi possível salvar a imagem", "A imagem anterior foi mantida. Tente novamente após tocar em “Otimizar armazenamento” no menu de configurações.")];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (evento === null || evento === void 0 ? void 0 : evento.target)
                            evento.target.value = "";
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    window.removerImagemJutsu = function (indiceRecebido) {
        return __awaiter(this, void 0, void 0, function () {
            var indice, jutsu, anterior;
            var _a;
            return __generator(this, function (_b) {
                indice = Number(indiceRecebido);
                jutsu = (_a = estado.jutsus) === null || _a === void 0 ? void 0 : _a[indice];
                if (!jutsu)
                    return [2 /*return*/];
                anterior = { imagem: jutsu.imagem, imagemId: jutsu.imagemId };
                jutsu.imagem = "";
                delete jutsu.imagemId;
                estado.jutsusAbertos = estado.jutsusAbertos || {};
                estado.jutsusAbertos[indice] = true;
                if (!persistirEstadoLocal()) {
                    jutsu.imagem = anterior.imagem || "";
                    if (anterior.imagemId)
                        jutsu.imagemId = anterior.imagemId;
                    return [2 /*return*/, avisar("Não foi possível remover", "A remoção da imagem não foi salva. A imagem anterior foi mantida.")];
                }
                if (typeof renderizarJutsus === "function")
                    renderizarJutsus();
                if (jutsu.jutsuId)
                    emitirImagemConfirmada({ type: "jutsu-cover", jutsuId: jutsu.jutsuId }, "", true);
                agendarLimpezaImagensOrfas();
                return [2 /*return*/];
            });
        });
    };
    function prepararInputDeImagemJutsu() {
        var antigo = document.getElementById("jutsuUploadGlobalSeguro");
        if (!antigo || antigo.dataset.indexeddbPronto)
            return;
        var novo = antigo.cloneNode(true);
        novo.dataset.indexeddbPronto = "1";
        antigo.replaceWith(novo);
        novo.addEventListener("change", function (evento) {
            var indice = Number(window.jutsuUploadIndiceAtual);
            try {
                if (!Number.isInteger(indice))
                    indice = Number(jutsuUploadIndiceAtual);
            }
            catch (err) { }
            window.carregarImagemJutsu(evento, indice);
        });
    }
    window.abrirUploadImagemJutsu = function (indice) {
        window.jutsuUploadIndiceAtual = indice;
        try {
            jutsuUploadIndiceAtual = indice;
        }
        catch (err) { }
        prepararInputDeImagemJutsu();
        var input = document.getElementById("jutsuUploadGlobalSeguro");
        if (!input) {
            avisar("Campo de imagem não encontrado", "Recarregue o app e tente novamente.");
            return;
        }
        input.value = "";
        input.click();
    };
    function salvarImagemPerfil(campo, campoId, arquivo, opcoes) {
        return __awaiter(this, void 0, void 0, function () {
            var blob, novoId, anterior, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, otimizarArquivoParaBlob(arquivo, opcoes)];
                    case 1:
                        blob = _a.sent();
                        novoId = idNovo(campo === "avatarNinja" ? "avatar" : "perfil-fundo");
                        anterior = { valor: estado[campo], id: estado[campoId] };
                        return [4 /*yield*/, salvarBlob(novoId, blob)];
                    case 2:
                        _a.sent();
                        estado[campoId] = novoId;
                        estado[campo] = "";
                        url = urlParaBlob(novoId, blob);
                        if (!!persistirEstadoLocal()) return [3 /*break*/, 4];
                        limparUrlEmMemoria(novoId);
                        return [4 /*yield*/, apagarBlob(novoId).catch(function () { })];
                    case 3:
                        _a.sent();
                        estado[campo] = anterior.valor || "";
                        if (anterior.id)
                            estado[campoId] = anterior.id;
                        else
                            delete estado[campoId];
                        throw new Error("Não foi possível salvar a imagem do perfil.");
                    case 4:
                        emitirImagemConfirmada({ type: campo === "avatarNinja" ? "avatar" : "profile-cover" }, novoId, false);
                        return [2 /*return*/, url];
                }
            });
        });
    }
    window.carregarAvatar = function (evento) {
        return __awaiter(this, void 0, void 0, function () {
            var arquivo, url, err_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        arquivo = (_b = (_a = evento === null || evento === void 0 ? void 0 : evento.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
                        if (!arquivo)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 5, 6]);
                        return [4 /*yield*/, salvarImagemPerfil("avatarNinja", "avatarNinjaId", arquivo, { maxLargura: 480, maxAltura: 480, qualidade: .76 })];
                    case 2:
                        url = _c.sent();
                        if (typeof aplicarAvatar === "function")
                            aplicarAvatar(url);
                        agendarLimpezaImagensOrfas();
                        return [3 /*break*/, 6];
                    case 3:
                        err_3 = _c.sent();
                        console.error(err_3);
                        return [4 /*yield*/, avisar("Não foi possível salvar o avatar", "O avatar anterior foi mantido.")];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (evento === null || evento === void 0 ? void 0 : evento.target)
                            evento.target.value = "";
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    window.carregarFundoPerfil = function (evento) {
        return __awaiter(this, void 0, void 0, function () {
            var arquivo, url, menu, err_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        arquivo = (_b = (_a = evento === null || evento === void 0 ? void 0 : evento.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
                        if (!arquivo)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 5, 6]);
                        return [4 /*yield*/, salvarImagemPerfil("perfilFundoImagem", "perfilFundoImagemId", arquivo, { maxLargura: 960, maxAltura: 720, qualidade: .70 })];
                    case 2:
                        url = _c.sent();
                        if (typeof aplicarFundoPerfil === "function")
                            aplicarFundoPerfil(url);
                        menu = document.getElementById("avatarMenu");
                        if (menu)
                            menu.classList.remove("aberto");
                        agendarLimpezaImagensOrfas();
                        return [3 /*break*/, 6];
                    case 3:
                        err_4 = _c.sent();
                        console.error(err_4);
                        return [4 /*yield*/, avisar("Não foi possível salvar o fundo", "O fundo anterior foi mantido.")];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (evento === null || evento === void 0 ? void 0 : evento.target)
                            evento.target.value = "";
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    window.removerFundoPerfil = function () {
        return __awaiter(this, void 0, void 0, function () {
            var anterior;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        anterior = { valor: estado.perfilFundoImagem, id: estado.perfilFundoImagemId };
                        delete estado.perfilFundoImagem;
                        delete estado.perfilFundoImagemId;
                        if (!!persistirEstadoLocal()) return [3 /*break*/, 2];
                        estado.perfilFundoImagem = anterior.valor || "";
                        if (anterior.id)
                            estado.perfilFundoImagemId = anterior.id;
                        return [4 /*yield*/, avisar("Não foi possível remover", "A remoção do fundo não foi salva.")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (typeof aplicarFundoPerfil === "function")
                            aplicarFundoPerfil("");
                        emitirImagemConfirmada({ type: "profile-cover" }, "", true);
                        fecharMenuAvatar();
                        agendarLimpezaImagensOrfas();
                        return [2 /*return*/];
                }
            });
        });
    };
    function estadoComImagensParaBackup() {
        return __awaiter(this, void 0, void 0, function () {
            var backup, i, jutsu, id, blob, _a, blob, _b, blob, _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        backup = estadoParaLocalStorage();
                        i = 0;
                        _f.label = 1;
                    case 1:
                        if (!(i < (backup.jutsus || []).length)) return [3 /*break*/, 6];
                        jutsu = backup.jutsus[i];
                        id = (_e = (_d = estado.jutsus) === null || _d === void 0 ? void 0 : _d[i]) === null || _e === void 0 ? void 0 : _e.imagemId;
                        if (!id) return [3 /*break*/, 5];
                        return [4 /*yield*/, obterBlob(id)];
                    case 2:
                        blob = _f.sent();
                        if (!blob) return [3 /*break*/, 4];
                        _a = jutsu;
                        return [4 /*yield*/, blobParaDataUrl(blob)];
                    case 3:
                        _a.imagem = _f.sent();
                        _f.label = 4;
                    case 4:
                        delete jutsu.imagemId;
                        _f.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (!estado.avatarNinjaId) return [3 /*break*/, 10];
                        return [4 /*yield*/, obterBlob(estado.avatarNinjaId)];
                    case 7:
                        blob = _f.sent();
                        if (!blob) return [3 /*break*/, 9];
                        _b = backup;
                        return [4 /*yield*/, blobParaDataUrl(blob)];
                    case 8:
                        _b.avatarNinja = _f.sent();
                        _f.label = 9;
                    case 9:
                        delete backup.avatarNinjaId;
                        _f.label = 10;
                    case 10:
                        if (!estado.perfilFundoImagemId) return [3 /*break*/, 14];
                        return [4 /*yield*/, obterBlob(estado.perfilFundoImagemId)];
                    case 11:
                        blob = _f.sent();
                        if (!blob) return [3 /*break*/, 13];
                        _c = backup;
                        return [4 /*yield*/, blobParaDataUrl(blob)];
                    case 12:
                        _c.perfilFundoImagem = _f.sent();
                        _f.label = 13;
                    case 13:
                        delete backup.perfilFundoImagemId;
                        _f.label = 14;
                    case 14: return [2 /*return*/, backup];
                }
            });
        });
    }
    window.exportarFicha = function () {
        return __awaiter(this, void 0, void 0, function () {
            var estadoBackup, dados, nomeNinja, arquivo, url_1, link, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        if (typeof salvar === "function")
                            salvar();
                        return [4 /*yield*/, estadoComImagensParaBackup()];
                    case 1:
                        estadoBackup = _a.sent();
                        dados = {
                            app: "Ficha Ninja RPG",
                            versao: "backup-2",
                            criadoEm: (new Date).toISOString(),
                            chave: CHAVE,
                            estado: estadoBackup
                        };
                        nomeNinja = (estado.nome || "ninja").toString().trim().replace(/[^\w\-]+/g, "_") || "ninja";
                        arquivo = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
                        url_1 = URL.createObjectURL(arquivo);
                        link = document.createElement("a");
                        link.href = url_1;
                        link.download = "ficha_" + nomeNinja + ".json";
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        setTimeout(function () { return URL.revokeObjectURL(url_1); }, 1000);
                        return [3 /*break*/, 4];
                    case 2:
                        err_5 = _a.sent();
                        console.error(err_5);
                        return [4 /*yield*/, avisar("Não foi possível exportar", "Tente novamente em alguns segundos.")];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /* API mínima para o importador defensivo carregado depois deste módulo.
       A função opera sobre o `estado` atual e move qualquer data:image para
       IndexedDB antes que a ficha seja persistida no localStorage. */
    window.shinobiMigrarEstadoImagensParaIndexedDB = migrarEstadoAtualParaIndexedDB;
    window.importarFicha = function (evento) {
        var _a, _b;
        var arquivo = (_b = (_a = evento === null || evento === void 0 ? void 0 : evento.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
        if (!arquivo)
            return;
        var leitor = new FileReader();
        leitor.onload = function (e) {
            return __awaiter(this, void 0, void 0, function () {
                var estadoAnterior, dados, novoEstado, err_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            estadoAnterior = estado;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 5, 6]);
                            dados = JSON.parse(e.target.result);
                            novoEstado = dados.estado || dados;
                            if (!novoEstado || typeof novoEstado !== "object" || Array.isArray(novoEstado)) {
                                throw new Error("Arquivo inválido.");
                            }
                            if (!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?"))
                                return [2 /*return*/];
                            estado = novoEstado;
                            return [4 /*yield*/, migrarEstadoAtualParaIndexedDB()];
                        case 2:
                            _a.sent();
                            if (!persistirEstadoLocal()) {
                                throw new Error("Não foi possível salvar a ficha importada.");
                            }
                            alert("Ficha importada com sucesso!");
                            location.reload();
                            return [3 /*break*/, 6];
                        case 3:
                            err_6 = _a.sent();
                            console.error(err_6);
                            estado = estadoAnterior;
                            return [4 /*yield*/, avisar("Não foi possível importar", "O arquivo não pôde ser salvo neste aparelho.")];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            if (evento === null || evento === void 0 ? void 0 : evento.target)
                                evento.target.value = "";
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        leitor.readAsText(arquivo);
    };
    function coletarIdsEmUso() {
        return __awaiter(this, void 0, void 0, function () {
            var usados, prefixo;
            return __generator(this, function (_a) {
                usados = new Set();
                prefixo = typeof CHAVE_BASE !== "undefined" ? CHAVE_BASE : "ficha_ninja_app_v2";
                Object.keys(localStorage).forEach(function (chave) {
                    if (chave !== prefixo && !chave.startsWith(prefixo + "__"))
                        return;
                    try {
                        var ficha = JSON.parse(localStorage.getItem(chave) || "{}");
                        (ficha.jutsus || []).forEach(function (jutsu) {
                            if (jutsu === null || jutsu === void 0 ? void 0 : jutsu.imagemId)
                                usados.add(jutsu.imagemId);
                        });
                        if (ficha.avatarNinjaId)
                            usados.add(ficha.avatarNinjaId);
                        if (ficha.perfilFundoImagemId)
                            usados.add(ficha.perfilFundoImagemId);
                    }
                    catch (err) { }
                });
                (estado.jutsus || []).forEach(function (jutsu) {
                    if (jutsu === null || jutsu === void 0 ? void 0 : jutsu.imagemId)
                        usados.add(jutsu.imagemId);
                });
                if (estado.avatarNinjaId)
                    usados.add(estado.avatarNinjaId);
                if (estado.perfilFundoImagemId)
                    usados.add(estado.perfilFundoImagemId);
                return [2 /*return*/, usados];
            });
        });
    }
    function limparImagensOrfas() {
        return __awaiter(this, void 0, void 0, function () {
            var registros, idsEmUso_1, limite_1, orfas, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, listarRegistrosDoBanco()];
                    case 1:
                        registros = _a.sent();
                        return [4 /*yield*/, coletarIdsEmUso()];
                    case 2:
                        idsEmUso_1 = _a.sent();
                        limite_1 = Date.now() - RETENCAO_IMAGEM_ORFA_MS;
                        orfas = registros.filter(function (registro) {
                            var id = String((registro === null || registro === void 0 ? void 0 : registro.id) || "");
                            if (!id || idsEmUso_1.has(id))
                                return false;
                            var atualizado = Number(registro === null || registro === void 0 ? void 0 : registro.atualizadoEm);
                            return Number.isFinite(atualizado) && atualizado > 0 && atualizado <= limite_1;
                        });
                        return [4 /*yield*/, Promise.all(orfas.map(function (registro) {
                                var id = String((registro === null || registro === void 0 ? void 0 : registro.id) || "");
                                limparUrlEmMemoria(id);
                                return apagarBlob(id).catch(function () { });
                            }))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, orfas.length];
                    case 4:
                        err_7 = _a.sent();
                        return [2 /*return*/, 0];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    var timerLimpezaImagensOrfas = null;
    function agendarLimpezaImagensOrfas(atraso) {
        var _this = this;
        if (atraso === void 0) { atraso = 1600; }
        if (timerLimpezaImagensOrfas) {
            clearTimeout(timerLimpezaImagensOrfas);
        }
        timerLimpezaImagensOrfas = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timerLimpezaImagensOrfas = null;
                        return [4 /*yield*/, limparImagensOrfas()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, atraso);
    }
    window.otimizarArmazenamentoImagens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_8, migrou, removidas, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 11]);
                        if (!(navigator.storage && navigator.storage.persist)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.storage.persist()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_8 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, migrarEstadoAtualParaIndexedDB()];
                    case 5:
                        migrou = _a.sent();
                        return [4 /*yield*/, hidratarImagensDoIndexedDB()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, limparImagensOrfas()];
                    case 7:
                        removidas = _a.sent();
                        return [4 /*yield*/, avisar("Armazenamento otimizado", (migrou ? "As imagens da ficha foram movidas para o armazenamento otimizado. " : "As imagens já estão no armazenamento otimizado. ") +
                                (removidas ? removidas + " imagem(ns) antiga(s) sem uso foram removidas." : ""))];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        err_9 = _a.sent();
                        console.error(err_9);
                        return [4 /*yield*/, avisar("Não foi possível otimizar", "O navegador não liberou o armazenamento otimizado. Feche outras abas do app, recarregue esta página e tente novamente.")];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    var imagensInicializadasNestaSessao = false;
    var inicializacaoImagensEmAndamento = null;
    function executarQuandoNavegadorEstiverLivre(tarefa, timeout) {
        if (timeout === void 0) { timeout = 1200; }
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(function () { return tarefa(); }, { timeout: timeout });
            return;
        }
        setTimeout(tarefa, 120);
    }
    function inicializarImagensEmSegundoPlano() {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (imagensInicializadasNestaSessao)
                    return [2 /*return*/];
                if (inicializacaoImagensEmAndamento)
                    return [2 /*return*/, inicializacaoImagensEmAndamento];
                inicializacaoImagensEmAndamento = (function () { return __awaiter(_this, void 0, void 0, function () {
                    var err_10, err_11;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 7, 8, 9]);
                                if (!(navigator.storage && navigator.storage.persist)) return [3 /*break*/, 4];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, navigator.storage.persist()];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_10 = _a.sent();
                                return [3 /*break*/, 4];
                            case 4: return [4 /*yield*/, migrarEstadoAtualParaIndexedDB()];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, hidratarImagensDoIndexedDB()];
                            case 6:
                                _a.sent();
                                imagensInicializadasNestaSessao = true;
                                agendarLimpezaImagensOrfas(2200);
                                return [3 /*break*/, 9];
                            case 7:
                                err_11 = _a.sent();
                                console.error("Falha na inicialização das imagens.", err_11);
                                return [3 /*break*/, 9];
                            case 8:
                                inicializacaoImagensEmAndamento = null;
                                return [7 /*endfinally*/];
                            case 9: return [2 /*return*/];
                        }
                    });
                }); })();
                return [2 /*return*/, inicializacaoImagensEmAndamento];
            });
        });
    }
    function iniciarArmazenamentoOtimizado() {
        prepararInputDeImagemJutsu();
        executarQuandoNavegadorEstiverLivre(inicializarImagensEmSegundoPlano, 900);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciarArmazenamentoOtimizado, { once: true });
    }
    else {
        iniciarArmazenamentoOtimizado();
    }
    window.addEventListener("pageshow", function (evento) {
        prepararInputDeImagemJutsu();
        if (evento.persisted || !imagensInicializadasNestaSessao) {
            executarQuandoNavegadorEstiverLivre(inicializarImagensEmSegundoPlano, 700);
        }
    });
    window.addEventListener("beforeunload", function () {
        if (timerLimpezaImagensOrfas) {
            clearTimeout(timerLimpezaImagensOrfas);
            timerLimpezaImagensOrfas = null;
        }
        urlsEmMemoria.forEach(function (url) {
            try {
                URL.revokeObjectURL(url);
            }
            catch (err) { }
        });
        urlsEmMemoria.clear();
    });
})();
