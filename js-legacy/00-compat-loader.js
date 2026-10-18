/* GERADO AUTOMATICAMENTE — fonte: js/00-compat-loader.js — app 2.5.8.174. Não editar. */
(function () {
    "use strict";
    if (window.__shinobiCompatLoader)
        return;
    window.__shinobiCompatLoader = true;
    var version = String(window.APP_VERSION || document.documentElement.getAttribute("data-app-version") || "2.5.8.174");
    function modernSyntax() {
        try {
            new Function("var a={x:1}; return a?.x ?? 0;");
            return true;
        }
        catch (_e) {
            return false;
        }
    }
    var legacy = !modernSyntax();
    window.SHINOBI_LEGACY_MODE = legacy;
    document.documentElement.setAttribute("data-shinobi-legacy", legacy ? "1" : "0");
    if (legacy) {
        var l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = "css/legacy-compat.css?v=" + encodeURIComponent(version);
        document.head.appendChild(l);
    }
    var files = [
        "00-shinobi-ui.js", "00-item-identity.js", "01-core.js", "01-sheet-manager.js", "02-runtime.js", "03-images.js", "04-jutsus.js", "05-armados-item-level.js", "05-kekkei-item-level.js", "09-catalogo.js", "05-battle.js", "06-inventory.js", "06-wallet-item-level.js", "07-profile.js", "10-regras-natureza.js", "11-batalha-ui.js", "12-efeitos-jutsus.js", "13-motor-universal.js", "14-level-up.js", "15-testes-resistencia.js", "16-pericias.js", "17-dano-inteligente.js", "22-organizacao-retratil.js", "23-security-hardening.js", "24-terminologia-eko.js", "08-post-render-loader.js"
    ];
    function load(i) {
        if (i >= files.length) {
            try {
                window.dispatchEvent(new CustomEvent("shinobi:compat-ready"));
            }
            catch (_e) { }
            return;
        }
        var sc = document.createElement("script");
        sc.src = (legacy ? "js-legacy/" : "js/") + files[i] + "?v=" + encodeURIComponent(version);
        sc.async = false;
        sc.onload = function () { load(i + 1); };
        sc.onerror = function () { console.error("Falha ao carregar módulo", files[i]); load(i + 1); };
        document.head.appendChild(sc);
    }
    if (legacy) {
        var pf = document.createElement("script");
        pf.src = "js-legacy/00-polyfills.js?v=" + encodeURIComponent(version);
        pf.async = false;
        pf.onload = function () { load(0); };
        pf.onerror = function () { load(0); };
        document.head.appendChild(pf);
    }
    else
        load(0);
})();
