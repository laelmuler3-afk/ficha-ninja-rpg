/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

/* ======================================================================
   Kekkei Genkai e jutsus dinâmicos
   ====================================================================== */
(function(){
  "use strict";

  if(window.__kekkeiJutsuDinamicoAtivo) return;
  window.__kekkeiJutsuDinamicoAtivo = true;

  const ELEMENTOS_JUTSU_FIXOS = [
    {valor:"katon",  nome:"KATON",  icone:"🔥", classe:"jutsu-katon"},
    {valor:"raiton", nome:"RAITON", icone:"⚡", classe:"jutsu-raiton"},
    {valor:"fuuton", nome:"FUUTON", icone:"🌪️", classe:"jutsu-fuuton"},
    {valor:"suiton", nome:"SUITON", icone:"💧", classe:"jutsu-suiton"},
    {valor:"doton",  nome:"DOTON",  icone:"🪨", classe:"jutsu-doton"},
    {valor:"yin",    nome:"YINTON", icone:"🌑", classe:"jutsu-yin"},
    {valor:"yang",   nome:"YOUTON", icone:"☀️", classe:"jutsu-yang"},
    {valor:"neutro", nome:"NEUTRO", icone:"✨", classe:"jutsu-neutro"}
  ];

  function normalizarKekkeiJutsu(valor){
    return String(valor || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function criarIdKekkeiJutsu(){
    return "kg_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,10);
  }

  /* Mantém compatibilidade com Kekkei Genkai já salvas e cria um ID estável
     para que renomear a Kekkei atualize automaticamente os jutsus vinculados. */
  window.garantirKekkeiArray = function(){
    if(!estado.kekkeiGenkai || !Array.isArray(estado.kekkeiGenkai)){
      estado.kekkeiGenkai = [];
    }

    const idsUsados = new Set();
    estado.kekkeiGenkai.forEach(function(kekkei){
      if(!kekkei || typeof kekkei !== "object") return;

      let id = String(kekkei.id || "").trim();
      if(!id || idsUsados.has(id)){
        do{ id = criarIdKekkeiJutsu(); }while(idsUsados.has(id));
        kekkei.id = id;
      }
      idsUsados.add(id);
    });
  };

  function kekkeisDisponiveisParaJutsu(){
    window.garantirKekkeiArray();
    return (estado.kekkeiGenkai || [])
      .filter(function(kekkei){
        return kekkei && String(kekkei.nome || "").trim();
      })
      .map(function(kekkei){
        return {
          id:String(kekkei.id),
          nome:String(kekkei.nome).trim()
        };
      });
  }

  window.dadosElementoJutsu = function(elemento){
    const valor = String(elemento || "neutro");
    const fixo = ELEMENTOS_JUTSU_FIXOS.find(function(item){
      return item.valor === valor;
    });

    if(fixo){
      return {nome:fixo.nome, icone:fixo.icone, classe:fixo.classe};
    }

    if(valor.indexOf("kekkei:") === 0){
      const referencia = valor.slice(7);
      const kekkeis = kekkeisDisponiveisParaJutsu();
      const kekkei = kekkeis.find(function(item){
        return item.id === referencia;
      }) || kekkeis.find(function(item){
        return normalizarKekkeiJutsu(item.nome) === normalizarKekkeiJutsu(referencia);
      });

      return {
        nome:kekkei ? kekkei.nome.toUpperCase() : "KEKKEI GENKAI REMOVIDA",
        icone:"🧬",
        classe:"jutsu-kekkei"
      };
    }

    return {nome:"NEUTRO", icone:"✨", classe:"jutsu-neutro"};
  };

  window.escolherElementoJutsuPrompt = function(indice){
    const jutsu = (estado.jutsus || [])[indice];
    if(!jutsu) return;

    const kekkeis = kekkeisDisponiveisParaJutsu();
    const linhas = ELEMENTOS_JUTSU_FIXOS.map(function(item, posicao){
      return (posicao + 1) + " - " + item.nome.charAt(0) + item.nome.slice(1).toLowerCase();
    });

    kekkeis.forEach(function(kekkei, posicao){
      linhas.push((ELEMENTOS_JUTSU_FIXOS.length + posicao + 1) + " - Kekkei Genkai: " + kekkei.nome);
    });

    const atual = window.dadosElementoJutsu(jutsu.elemento || "katon").nome;
    const mensagem = [
      "Escolha a natureza do jutsu:",
      "",
      linhas.join("\n"),
      "",
      "Atual: " + atual
    ].join("\n");

    const escolha = prompt(mensagem, "");
    if(escolha === null) return;

    const texto = String(escolha).trim();
    if(!texto) return;

    const numero = Number(texto);
    let novoElemento = "";

    if(Number.isInteger(numero)){
      if(numero >= 1 && numero <= ELEMENTOS_JUTSU_FIXOS.length){
        novoElemento = ELEMENTOS_JUTSU_FIXOS[numero - 1].valor;
      }else{
        const indiceKekkei = numero - ELEMENTOS_JUTSU_FIXOS.length - 1;
        if(kekkeis[indiceKekkei]){
          novoElemento = "kekkei:" + kekkeis[indiceKekkei].id;
        }
      }
    }else{
      const textoNormalizado = normalizarKekkeiJutsu(texto);
      const fixoDigitado = ELEMENTOS_JUTSU_FIXOS.find(function(item){
        return normalizarKekkeiJutsu(item.valor) === textoNormalizado ||
               normalizarKekkeiJutsu(item.nome) === textoNormalizado;
      });

      if(fixoDigitado){
        novoElemento = fixoDigitado.valor;
      }else{
        const nomeSemPrefixo = texto.replace(/^kekkei\s*genkai\s*:\s*/i, "");
        const kekkeiDigitada = kekkeis.find(function(item){
          return normalizarKekkeiJutsu(item.nome) === normalizarKekkeiJutsu(nomeSemPrefixo);
        });
        if(kekkeiDigitada){
          novoElemento = "kekkei:" + kekkeiDigitada.id;
        }
      }
    }

    if(!novoElemento){
      alert("Opção inválida. Escolha um dos números ou digite o nome de uma Kekkei Genkai cadastrada.");
      return;
    }

    jutsu.elemento = novoElemento;
    if(typeof persistirSemRender === "function") persistirSemRender();
    else if(typeof persistirEstadoLocal === "function") persistirEstadoLocal();

    if(typeof renderizarJutsus === "function") renderizarJutsus();
  };
})();


/* ======================================================================
   Atualização imediata da barra de XP
   ====================================================================== */
(function(){
  function ligarAtualizacaoXp(){
    const campo=document.getElementById("xpPerfilInput");
    if(!campo||campo.dataset.xpBarListener==="1") return;
    campo.dataset.xpBarListener="1";
    const atualizar=function(){
      if(typeof atualizarPerfil==="function") atualizarPerfil();
      else if(typeof atualizarHUD==="function") atualizarHUD();
    };
    campo.addEventListener("input",atualizar);
    campo.addEventListener("change",atualizar);
    atualizar();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ligarAtualizacaoXp);
  else ligarAtualizacaoXp();
})();


/* ======================================================================
   Ajuste do menu do avatar e enquadramento do fundo
   ====================================================================== */
(function(){
  "use strict";

  const AJUSTE_PADRAO = Object.freeze({modo:"cover", x:50, y:50, zoom:100});
  let imagemFundoAtual = "";
  let ajusteTemporario = null;
  let menuPaiOriginal = null;
  let menuProximoOriginal = null;
  let medicaoEmAndamento = false;
  let previewFundo = null;

  function numeroLimitado(valor, minimo, maximo, padrao){
    const n = Number(valor);
    return Number.isFinite(n) ? Math.min(maximo, Math.max(minimo, n)) : padrao;
  }

  function campoPersistido(id){
    return document.getElementById(id);
  }

  function obterAjusteFundo(){
    const modo = campoPersistido("perfilFundoModo")?.value;
    return {
      modo: modo === "contain" ? "contain" : "cover",
      x: numeroLimitado(campoPersistido("perfilFundoPosX")?.value, 0, 100, AJUSTE_PADRAO.x),
      y: numeroLimitado(campoPersistido("perfilFundoPosY")?.value, 0, 100, AJUSTE_PADRAO.y),
      zoom: numeroLimitado(campoPersistido("perfilFundoZoom")?.value, 70, 200, AJUSTE_PADRAO.zoom)
    };
  }

  function gravarAjusteFundo(ajuste){
    const valores = {
      perfilFundoModo: ajuste.modo === "contain" ? "contain" : "cover",
      perfilFundoPosX: String(numeroLimitado(ajuste.x, 0, 100, 50)),
      perfilFundoPosY: String(numeroLimitado(ajuste.y, 0, 100, 50)),
      perfilFundoZoom: String(numeroLimitado(ajuste.zoom, 70, 200, 100))
    };
    Object.entries(valores).forEach(function([id, valor]){
      const campo = campoPersistido(id);
      if(!campo) return;
      campo.value = valor;
      campo.dispatchEvent(new Event("input", {bubbles:true}));
      campo.dispatchEvent(new Event("change", {bubbles:true}));
    });
  }

  function ajusteAtivo(){
    return ajusteTemporario || obterAjusteFundo();
  }

  function extrairUrlFundo(valor){
    const texto = String(valor || "").trim();
    if(!texto || texto === "none") return "";
    const inicio = texto.indexOf("url(");
    if(inicio < 0) return "";
    let url = texto.slice(inicio + 4, texto.lastIndexOf(")")).trim();
    if((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))){
      url = url.slice(1, -1);
    }
    return url.replace(/\\(["'\\])/g, "$1");
  }

  function sincronizarImagemFundoAtual(){
    const fundo = document.getElementById("perfilFundoImagem");
    if(!fundo) return "";
    if(!imagemFundoAtual){
      imagemFundoAtual = extrairUrlFundo(fundo.style.backgroundImage) || extrairUrlFundo(getComputedStyle(fundo).backgroundImage);
    }
    if(imagemFundoAtual && !fundo.dataset.imgWidth && !medicaoEmAndamento){
      medicaoEmAndamento = true;
      const medidor = new Image();
      medidor.decoding = "async";
      medidor.onload = function(){
        medicaoEmAndamento = false;
        fundo.dataset.imgWidth = String(medidor.naturalWidth || 0);
        fundo.dataset.imgHeight = String(medidor.naturalHeight || 0);
        aplicarEnquadramentoFundo();
      };
      medidor.onerror = function(){ medicaoEmAndamento = false; };
      medidor.src = imagemFundoAtual;
    }
    return imagemFundoAtual;
  }

  function aplicarEnquadramentoNoElemento(alvo, ajuste){
    const fundo = document.getElementById("perfilFundoImagem");
    const imagem = sincronizarImagemFundoAtual();
    if(!alvo || !fundo || !imagem) return;

    if(alvo !== fundo){
      alvo.style.setProperty("background-image", 'url("' + imagem.replace(/"/g, '%22') + '")', "important");
    }
    alvo.style.setProperty("background-position", ajuste.x + "% " + ajuste.y + "%", "important");
    alvo.style.setProperty("background-repeat", "no-repeat", "important");

    const iw = Number(fundo.dataset.imgWidth || 0);
    const ih = Number(fundo.dataset.imgHeight || 0);
    const largura = alvo.clientWidth;
    const altura = alvo.clientHeight;

    if(iw > 0 && ih > 0 && largura > 0 && altura > 0){
      const base = ajuste.modo === "contain"
        ? Math.min(largura / iw, altura / ih)
        : Math.max(largura / iw, altura / ih);
      const escala = base * (ajuste.zoom / 100);
      alvo.style.setProperty("background-size", Math.max(1, iw * escala) + "px " + Math.max(1, ih * escala) + "px", "important");
    }else{
      alvo.style.setProperty("background-size", ajuste.modo, "important");
    }
  }

  function aplicarEnquadramentoFundo(){
    const fundo = document.getElementById("perfilFundoImagem");
    if(!fundo) return;
    const ajuste = ajusteAtivo();
    aplicarEnquadramentoNoElemento(fundo, ajuste);
    if(previewFundo) aplicarEnquadramentoNoElemento(previewFundo, ajuste);
  }

  window.aplicarFundoPerfil = function(imagem){
    const fundo = document.getElementById("perfilFundoImagem");
    imagemFundoAtual = imagem || "";

    if(!fundo) return;
    if(!imagem){
      fundo.style.setProperty("background-image", "none", "important");
      fundo.style.removeProperty("background-size");
      fundo.style.removeProperty("background-position");
      fundo.classList.remove("ativo");
      delete fundo.dataset.imgWidth;
      delete fundo.dataset.imgHeight;
      return;
    }

    fundo.style.setProperty("background-image", 'url("' + imagem.replace(/"/g, '%22') + '")', "important");
    fundo.classList.add("ativo");

    const medidor = new Image();
    medidor.decoding = "async";
    medidor.onload = function(){
      if(imagemFundoAtual !== imagem) return;
      fundo.dataset.imgWidth = String(medidor.naturalWidth || 0);
      fundo.dataset.imgHeight = String(medidor.naturalHeight || 0);
      aplicarEnquadramentoFundo();
    };
    medidor.onerror = aplicarEnquadramentoFundo;
    medidor.src = imagem;
    aplicarEnquadramentoFundo();
  };

  function guardarLocalMenu(menu){
    if(menuPaiOriginal) return;
    menuPaiOriginal = menu.parentNode;
    menuProximoOriginal = menu.nextSibling;
  }

  function levarMenuParaBody(menu){
    guardarLocalMenu(menu);
    if(menu.parentNode !== document.body) document.body.appendChild(menu);
  }

  function restaurarLocalMenu(menu){
    if(!menuPaiOriginal || !menu || menu.parentNode === menuPaiOriginal) return;
    if(menuProximoOriginal && menuProximoOriginal.parentNode === menuPaiOriginal){
      menuPaiOriginal.insertBefore(menu, menuProximoOriginal);
    }else{
      menuPaiOriginal.appendChild(menu);
    }
  }

  function limparPosicaoMenuAvatar(){
    const menu = document.getElementById("avatarMenu");
    if(!menu) return;
    ["display","visibility","position","left","top","right","bottom","width","transform"].forEach(function(prop){
      menu.style.removeProperty(prop);
    });
    restaurarLocalMenu(menu);
  }

  function fecharMenuAvatar(){
    const menu = document.getElementById("avatarMenu");
    if(!menu) return;
    menu.classList.remove("aberto");
    limparPosicaoMenuAvatar();
  }

  function posicionarMenuAvatar(){
    const menu = document.getElementById("avatarMenu");
    const avatar = document.querySelector("#identidade .avatarNovo");
    if(!menu || !avatar || !menu.classList.contains("aberto")) return;

    levarMenuParaBody(menu);
    menu.style.setProperty("position", "fixed", "important");
    menu.style.setProperty("visibility", "hidden", "important");
    menu.style.setProperty("display", "grid", "important");
    menu.style.setProperty("left", "10px", "important");
    menu.style.setProperty("top", "10px", "important");
    menu.style.setProperty("transform", "none", "important");

    requestAnimationFrame(function(){
      const a = avatar.getBoundingClientRect();
      const visual = window.visualViewport;
      const origemX = visual ? visual.offsetLeft : 0;
      const origemY = visual ? visual.offsetTop : 0;
      const larguraTela = visual ? visual.width : window.innerWidth;
      const alturaTela = visual ? visual.height : window.innerHeight;
      const margem = 12;
      const larguraMenu = Math.min(menu.offsetWidth || 214, Math.max(120, larguraTela - margem * 2));
      const alturaMenu = Math.min(menu.offsetHeight || 210, Math.max(80, alturaTela - margem * 2));
      const direita = origemX + larguraTela - margem;
      const inferior = origemY + alturaTela - margem;
      let esquerda;
      let topo;

      if(larguraTela <= 520){
        esquerda = origemX + (larguraTela - larguraMenu) / 2;
        topo = a.bottom + 10;
        if(topo + alturaMenu > inferior) topo = a.top - alturaMenu - 10;
      }else if(a.right + 12 + larguraMenu <= direita){
        esquerda = a.right + 12;
        topo = a.top;
      }else if(a.left - larguraMenu - 12 >= origemX + margem){
        esquerda = a.left - larguraMenu - 12;
        topo = a.top;
      }else{
        esquerda = a.left + (a.width - larguraMenu) / 2;
        topo = a.bottom + 10;
      }

      esquerda = Math.max(origemX + margem, Math.min(esquerda, direita - larguraMenu));
      topo = Math.max(origemY + margem, Math.min(topo, inferior - alturaMenu));

      menu.style.setProperty("width", larguraMenu + "px", "important");
      menu.style.setProperty("left", esquerda + "px", "important");
      menu.style.setProperty("top", topo + "px", "important");
      menu.style.setProperty("visibility", "visible", "important");
    });
  }

  window.toggleAvatarMenu = function(){
    const menu = document.getElementById("avatarMenu");
    if(!menu) return;
    if(menu.classList.contains("aberto")){
      fecharMenuAvatar();
    }else{
      menu.classList.add("aberto");
      posicionarMenuAvatar();
    }
  };

  function fecharAjusteFundo(restaurar){
    const overlay = document.querySelector(".ajusteFundoOverlay");
    if(restaurar){
      ajusteTemporario = null;
      aplicarEnquadramentoFundo();
    }
    previewFundo = null;
    document.body.classList.remove("ajustandoFundoPerfil");
    if(overlay) overlay.remove();
  }

  window.abrirAjusteFundoPerfil = function(){
    const fundo = document.getElementById("perfilFundoImagem");
    const imagemSincronizada = sincronizarImagemFundoAtual();
    const temImagem = imagemSincronizada || (fundo && getComputedStyle(fundo).backgroundImage !== "none");
    const menu = document.getElementById("avatarMenu");
    if(menu) menu.classList.remove("aberto");

    if(!temImagem){
      if(typeof window.avisar === "function") window.avisar("Nenhum fundo definido", "Adicione uma imagem de fundo antes de ajustar o enquadramento.");
      else alert("Adicione uma imagem de fundo antes de ajustar o enquadramento.");
      return;
    }

    ajusteTemporario = {...obterAjusteFundo()};

    const overlay = document.createElement("div");
    overlay.className = "ajusteFundoOverlay";
    overlay.innerHTML = `
      <div class="ajusteFundoPainel" role="dialog" aria-modal="true" aria-label="Ajustar imagem de fundo">
        <div class="ajusteFundoCabecalho">
          <h3>Ajustar fundo</h3>
          <button type="button" class="ajusteFundoFechar" data-acao="cancelar" aria-label="Fechar">×</button>
        </div>
        <div class="ajusteFundoPreview" aria-label="Prévia do enquadramento">
          <div class="ajusteFundoPreviewImagem"></div>
          <div class="ajusteFundoPreviewGrade"></div>
          <span class="ajusteFundoPreviewDica">Arraste para reposicionar</span>
        </div>
        <label>Exibição
          <select data-ajuste="modo">
            <option value="cover">Preencher a área</option>
            <option value="contain">Mostrar imagem inteira</option>
          </select>
        </label>
        <label>Horizontal
          <input data-ajuste="x" type="range" min="0" max="100" step="1">
          <span class="ajusteFundoValor" data-valor="x"></span>
        </label>
        <label>Vertical
          <input data-ajuste="y" type="range" min="0" max="100" step="1">
          <span class="ajusteFundoValor" data-valor="y"></span>
        </label>
        <label>Zoom
          <input data-ajuste="zoom" type="range" min="70" max="200" step="1">
          <span class="ajusteFundoValor" data-valor="zoom"></span>
        </label>
        <div class="ajusteFundoAcoes">
          <button type="button" data-acao="resetar">Centralizar</button>
          <button type="button" data-acao="cancelar">Cancelar</button>
          <button type="button" class="aplicar" data-acao="aplicar">Aplicar</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.body.classList.add("ajustandoFundoPerfil");
    previewFundo = overlay.querySelector(".ajusteFundoPreviewImagem");

    const atualizarCampos = function(){
      overlay.querySelector('[data-ajuste="modo"]').value = ajusteTemporario.modo;
      ["x","y","zoom"].forEach(function(campo){
        overlay.querySelector('[data-ajuste="' + campo + '"]').value = ajusteTemporario[campo];
        overlay.querySelector('[data-valor="' + campo + '"]').textContent = ajusteTemporario[campo] + "%";
      });
    };

    overlay.addEventListener("input", function(evento){
      const campo = evento.target && evento.target.dataset ? evento.target.dataset.ajuste : "";
      if(!campo) return;
      ajusteTemporario[campo] = campo === "modo" ? evento.target.value : Number(evento.target.value);
      atualizarCampos();
      aplicarEnquadramentoFundo();
    });

    overlay.addEventListener("change", function(evento){
      const campo = evento.target && evento.target.dataset ? evento.target.dataset.ajuste : "";
      if(campo === "modo"){
        ajusteTemporario.modo = evento.target.value;
        aplicarEnquadramentoFundo();
      }
    });

    overlay.addEventListener("click", function(evento){
      if(evento.target === overlay){
        fecharAjusteFundo(true);
        return;
      }
      const acao = evento.target && evento.target.dataset ? evento.target.dataset.acao : "";
      if(acao === "resetar"){
        ajusteTemporario = {...AJUSTE_PADRAO};
        atualizarCampos();
        aplicarEnquadramentoFundo();
      }else if(acao === "cancelar"){
        fecharAjusteFundo(true);
      }else if(acao === "aplicar"){
        gravarAjusteFundo(ajusteTemporario);
        ajusteTemporario = null;
        aplicarEnquadramentoFundo();
        fecharAjusteFundo(false);
      }
    });


    const areaPreview = overlay.querySelector(".ajusteFundoPreview");
    let arrastePreview = null;
    areaPreview.addEventListener("pointerdown", function(evento){
      arrastePreview = {
        id:evento.pointerId,
        inicioX:evento.clientX,
        inicioY:evento.clientY,
        x:ajusteTemporario.x,
        y:ajusteTemporario.y
      };
      areaPreview.classList.add("arrastando");
      areaPreview.setPointerCapture?.(evento.pointerId);
      evento.preventDefault();
    });
    areaPreview.addEventListener("pointermove", function(evento){
      if(!arrastePreview || evento.pointerId !== arrastePreview.id) return;
      const retangulo = areaPreview.getBoundingClientRect();
      ajusteTemporario.x = numeroLimitado(arrastePreview.x - ((evento.clientX - arrastePreview.inicioX) / Math.max(1, retangulo.width)) * 100, 0, 100, 50);
      ajusteTemporario.y = numeroLimitado(arrastePreview.y - ((evento.clientY - arrastePreview.inicioY) / Math.max(1, retangulo.height)) * 100, 0, 100, 50);
      atualizarCampos();
      aplicarEnquadramentoFundo();
      evento.preventDefault();
    });
    const finalizarArraste = function(evento){
      if(!arrastePreview || (evento.pointerId !== undefined && evento.pointerId !== arrastePreview.id)) return;
      areaPreview.releasePointerCapture?.(arrastePreview.id);
      arrastePreview = null;
      areaPreview.classList.remove("arrastando");
    };
    areaPreview.addEventListener("pointerup", finalizarArraste);
    areaPreview.addEventListener("pointercancel", finalizarArraste);
    atualizarCampos();
    aplicarEnquadramentoFundo();
  };

  const carregarFundoAnterior = window.carregarFundoPerfil;
  if(typeof carregarFundoAnterior === "function"){
    window.carregarFundoPerfil = async function(evento){
      ajusteTemporario = null;
      gravarAjusteFundo(AJUSTE_PADRAO);
      await carregarFundoAnterior(evento);
      aplicarEnquadramentoFundo();
    };
  }

  const menuObservado = document.getElementById("avatarMenu");
  if(menuObservado){
    guardarLocalMenu(menuObservado);
    menuObservado.addEventListener("click", function(evento){ evento.stopPropagation(); });
    new MutationObserver(function(){
      if(!menuObservado.classList.contains("aberto")) limparPosicaoMenuAvatar();
    }).observe(menuObservado, {attributes:true, attributeFilter:["class"]});
  }

  let timerResize = null;
  window.addEventListener("resize", function(){
    clearTimeout(timerResize);
    timerResize = setTimeout(function(){
      posicionarMenuAvatar();
      aplicarEnquadramentoFundo();
    }, 80);
  });
  window.addEventListener("scroll", posicionarMenuAvatar, {passive:true});
  window.visualViewport?.addEventListener("resize", posicionarMenuAvatar);
  window.visualViewport?.addEventListener("scroll", posicionarMenuAvatar);

  function iniciarFundoJaCarregado(){
    if(sincronizarImagemFundoAtual()) aplicarEnquadramentoFundo();
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(iniciarFundoJaCarregado, 120); }, {once:true});
  }else{
    setTimeout(iniciarFundoJaCarregado, 120);
  }
  window.addEventListener("pageshow", function(){ setTimeout(iniciarFundoJaCarregado, 100); });
})();
