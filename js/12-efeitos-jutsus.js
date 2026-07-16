/* Shinobi 1.8.2 — efeitos automáticos de jutsus na Área de Batalha. */
(function(){
  "use strict";

  if(window.__efeitosJutsusBatalhaV182) return;
  window.__efeitosJutsusBatalhaV182 = true;

  const VERSAO = "1.8.2";
  const CHAVE_ESTADO = "efeitosBatalhaAtivos";

  const ALIAS_NATUREZA = {
    katon:"katon", fogo:"katon",
    raiton:"raiton", raio:"raiton", relampago:"raiton", eletrico:"raiton",
    fuuton:"fuuton", futon:"fuuton", vento:"fuuton",
    suiton:"suiton", agua:"suiton",
    doton:"doton", terra:"doton",
    yin:"yin", yinton:"yin", inton:"yin",
    yang:"yang", youton:"yang"
  };

  function numero(valor, padrao=0){
    const n = Number(String(valor ?? "").trim().replace(",", "."));
    return Number.isFinite(n) ? n : padrao;
  }

  function comSinal(valor){
    const n = numero(valor, 0);
    return n > 0 ? `+${n}` : String(n);
  }

  function escaparHtml(valor){
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizar(valor){
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function slug(valor){
    return normalizar(valor)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "efeito";
  }

  function garantirLista(){
    if(!estado || typeof estado !== "object") return [];
    if(!Array.isArray(estado[CHAVE_ESTADO])) estado[CHAVE_ESTADO] = [];

    estado[CHAVE_ESTADO] = estado[CHAVE_ESTADO]
      .filter(item => item && typeof item === "object")
      .map(item => ({
        id:String(item.id || `efeito-${Date.now()}`),
        origemTipo:String(item.origemTipo || "jutsu"),
        origemId:String(item.origemId || ""),
        nome:String(item.nome || "Efeito de jutsu"),
        duracao:String(item.duracao || ""),
        bonus:{
          ca:numero(item.bonus?.ca, 0),
          furtividade:numero(item.bonus?.furtividade, 0)
        },
        aplicadoEm:numero(item.aplicadoEm, Date.now())
      }))
      .filter(item => item.bonus.ca || item.bonus.furtividade);

    return estado[CHAVE_ESTADO];
  }

  function salvarEstado(){
    try{
      if(typeof persistirEstadoLocal === "function") return persistirEstadoLocal();
      if(typeof persistirSemRender === "function") return persistirSemRender();
      if(typeof CHAVE !== "undefined"){
        localStorage.setItem(CHAVE, JSON.stringify(estado));
        return true;
      }
    }catch(erro){
      console.warn("Não foi possível salvar os efeitos da batalha.", erro);
    }
    return false;
  }

  function nivelNatureza(id){
    if(!id) return 0;
    if(window.RegrasNaturezaShinobi?.nivelNatureza){
      return numero(window.RegrasNaturezaShinobi.nivelNatureza(id), 0);
    }
    return Math.max(0, Math.min(7, Math.trunc(numero(estado?.[id], 0))));
  }

  function idNaturezaPorTexto(valor){
    const texto = normalizar(valor);
    for(const [alias, id] of Object.entries(ALIAS_NATUREZA)){
      if(texto.includes(alias)) return id;
    }
    return "";
  }

  function textoAtivoDoJutsu(jutsu){
    const descricao = String(jutsu?.descricao || "").trim();
    if(!descricao) return "";

    const regexUpgrade = /upgrade\s*\(\s*lv\s*(\d+)\s+de\s+([^)]+)\)\s*:\s*([\s\S]*?)(?=\n\s*upgrade\s*\(|$)/gi;
    const indicePrimeiroUpgrade = descricao.search(/\bupgrade\s*\(/i);
    const partes = [indicePrimeiroUpgrade >= 0 ? descricao.slice(0, indicePrimeiroUpgrade) : descricao];

    let match;
    while((match = regexUpgrade.exec(descricao)) !== null){
      const requisito = numero(match[1], 0);
      const naturezaId = idNaturezaPorTexto(match[2]);
      if(naturezaId && nivelNatureza(naturezaId) >= requisito){
        partes.push(match[3]);
      }
    }

    return partes.filter(Boolean).join("\n");
  }

  function frasesDoTexto(texto){
    return String(texto || "")
      .replace(/[•●▪]/g, ".")
      .replace(/\r/g, "\n")
      .split(/(?:\n+|(?<=[.!?;])\s+)/)
      .map(frase => normalizar(frase))
      .filter(Boolean);
  }

  function valorEncontrado(match){
    if(!match) return null;
    const texto = String(match[1] ?? "").replace(/\s+/g, "");
    if(!/^[-+]?\d+$/.test(texto)) return null;
    const n = Number(texto);
    return Number.isFinite(n) ? n : null;
  }

  function extrairBonusDaFrase(frase, alvo){
    const nomeAlvo = alvo === "ca" ? "ca" : "furtividade";
    if(!new RegExp(`\\b${nomeAlvo}\\b`, "i").test(frase)) return 0;

    const padroes = [
      new RegExp(`([+-]\\s*\\d+)\\s*(?:de|em|na|no|para)?\\s*(?:a\\s*)?${nomeAlvo}\\b`, "i"),
      new RegExp(`\\b${nomeAlvo}\\b[^.!?;]{0,90}?(?:aumenta|aumentam|ganha|ganham|recebe|recebem|obtem|obtêm|fica|ficam|tem|têm|bonus|bônus)[^.!?;]{0,55}?([+-]?\\s*\\d+)`, "i"),
      new RegExp(`(?:bonus|bônus)(?:\\s+de)?\\s*([+-]?\\s*\\d+)[^.!?;]{0,65}?\\b${nomeAlvo}\\b`, "i"),
      new RegExp(`([+-]?\\s*\\d+)\\s*(?:pontos?\\s*)?(?:de\\s*)?${nomeAlvo}\\b`, "i")
    ];

    for(const padrao of padroes){
      const valor = valorEncontrado(frase.match(padrao));
      if(valor !== null) return valor;
    }

    return 0;
  }

  function extrairEfeitosDoJutsu(jutsu){
    const texto = textoAtivoDoJutsu(jutsu);
    const bonus = {ca:0, furtividade:0};
    const fontes = [];
    const alvoJutsu = normalizar(jutsu?.alvo || "");
    const alvoEhUsuario = /\b(voce|conjurador|si mesmo|proprio usuario)\b/.test(alvoJutsu);

    frasesDoTexto(texto).forEach(frase => {
      /*
       * Nesta etapa só aplicamos bônus no próprio personagem. Isso impede
       * que uma frase como "o alvo perde 2 de CA" reduza a CA do usuário.
       */
      const fraseEhDoUsuario = /\b(voce|seu|sua|seus|suas)\b/.test(frase);
      if(!alvoEhUsuario && !fraseEhDoUsuario) return;

      const ca = extrairBonusDaFrase(frase, "ca");
      const furtividade = extrairBonusDaFrase(frase, "furtividade");

      if(ca){
        bonus.ca += ca;
        fontes.push({alvo:"ca", valor:ca, frase});
      }
      if(furtividade){
        bonus.furtividade += furtividade;
        fontes.push({alvo:"furtividade", valor:furtividade, frase});
      }
    });

    return {bonus, fontes, texto};
  }

  function chaveDoJutsu(jutsu, indice){
    const origem = String(jutsu?.catalogoId || jutsu?.id || jutsu?.nome || indice || "jutsu");
    return `jutsu:${slug(origem)}`;
  }

  function bonusAutomatico(alvo){
    return garantirLista().reduce((total, efeito) => total + numero(efeito.bonus?.[alvo], 0), 0);
  }

  function campoSalvo(nome){
    return document.querySelector(`[data-save="${nome}"]`);
  }

  function modificador(valor){
    if(typeof calcularModificador === "function") return numero(calcularModificador(valor), 0);
    return Math.floor((numero(valor, 0) - 10) / 2);
  }

  function dadosFurtividade(){
    const destreza = numero(campoSalvo("destreza")?.value ?? estado?.destreza, 0);
    const proficiencia = numero(campoSalvo("proficiencia")?.value ?? estado?.proficiencia, 0);
    const treinado = Boolean(campoSalvo("p_furtividade")?.checked ?? estado?.p_furtividade);
    const base = modificador(destreza) + (treinado ? proficiencia : 0);
    const bonusJutsu = bonusAutomatico("furtividade");

    return {
      base,
      bonusJutsu,
      total:base + bonusJutsu,
      treinado
    };
  }

  function garantirMostradorFurtividade(){
    const grade = document.querySelector("#batalha .defesasGrid");
    if(!grade) return null;

    let box = document.getElementById("batalhaFurtividadeBox");
    if(!box){
      box = document.createElement("div");
      box.id = "batalhaFurtividadeBox";
      box.className = "extraBatalhaBox furtividadeBatalhaBox";
      box.innerHTML = '<span>Furt.</span><strong id="batalhaFurtividadeView">+0</strong>';

      const velocidade = document.getElementById("batalhaVelocidadeView")?.closest("div");
      if(velocidade?.nextSibling) grade.insertBefore(box, velocidade.nextSibling);
      else grade.appendChild(box);
    }

    grade.classList.add("defesasGridComFurtividade");
    return box;
  }

  function atualizarFurtividade(){
    garantirMostradorFurtividade();
    const view = document.getElementById("batalhaFurtividadeView");
    if(!view) return;

    const dados = dadosFurtividade();
    const detalhe = [];
    if(dados.treinado) detalhe.push("prof.");
    if(dados.bonusJutsu) detalhe.push(`${comSinal(dados.bonusJutsu)} jutsu`);

    view.innerHTML = `${comSinal(dados.total)}${detalhe.length ? `<span class="bonusDefesaTexto">${detalhe.join(" · ")}</span>` : ""}`;
  }

  function atualizarDefesasComEfeitos(){
    const caBase = numero(document.getElementById("campoCA")?.value ?? campoSalvo("ca")?.value, 10);
    const cdBase = numero(campoSalvo("cd")?.value, 10);
    const bonusCaManual = numero(document.querySelector('[data-bonus-defesa-batalha="ca"]')?.value, 0);
    const bonusCdManual = numero(document.querySelector('[data-bonus-defesa-batalha="cd"]')?.value, 0);
    const bonusCaJutsu = bonusAutomatico("ca");
    const caTotal = caBase + bonusCaManual + bonusCaJutsu;
    const cdTotal = cdBase + bonusCdManual;
    const caView = document.getElementById("batalhaCaView");
    const cdView = document.getElementById("batalhaCdView");

    if(caView){
      const detalhes = [];
      if(bonusCaManual) detalhes.push(`${comSinal(bonusCaManual)} manual`);
      if(bonusCaJutsu) detalhes.push(`${comSinal(bonusCaJutsu)} jutsu`);
      caView.innerHTML = `${caTotal}${detalhes.length ? `<span class="bonusDefesaTexto">${detalhes.join(" · ")}</span>` : ""}`;
    }

    if(cdView){
      cdView.innerHTML = `${cdTotal}${bonusCdManual ? `<span class="bonusDefesaTexto">${comSinal(bonusCdManual)} manual</span>` : ""}`;
    }

    atualizarFurtividade();
  }

  function resumoBonus(efeito){
    const itens = [];
    if(efeito.bonus.ca) itens.push(`CA ${comSinal(efeito.bonus.ca)}`);
    if(efeito.bonus.furtividade) itens.push(`Furtividade ${comSinal(efeito.bonus.furtividade)}`);
    return itens;
  }

  function garantirHostEfeitos(){
    const secao = document.querySelector("#batalha .efeitosBatalhaSecao");
    if(!secao) return null;

    let host = document.getElementById("efeitosJutsuAtivos");
    if(!host){
      host = document.createElement("div");
      host.id = "efeitosJutsuAtivos";
      host.className = "efeitosJutsuAtivos";
      const bonusManual = secao.querySelector(".bonusAtributosBatalha");
      bonusManual ? secao.insertBefore(host, bonusManual) : secao.appendChild(host);
    }
    return host;
  }

  function renderizarEfeitos(){
    const host = garantirHostEfeitos();
    if(!host) return;

    const lista = garantirLista();
    host.hidden = !lista.length;
    host.innerHTML = lista.map(efeito => {
      const itens = resumoBonus(efeito);
      return `
        <article class="efeitoJutsuBatalhaCard">
          <div class="efeitoJutsuBatalhaTopo">
            <div>
              <strong>${escaparHtml(efeito.nome)}</strong>
              ${efeito.duracao ? `<small>Duração: ${escaparHtml(efeito.duracao)}</small>` : ""}
            </div>
            <button type="button" onclick="removerEfeitoJutsuBatalha('${escaparHtml(efeito.id)}')" aria-label="Encerrar ${escaparHtml(efeito.nome)}">×</button>
          </div>
          <div class="efeitoJutsuBatalhaBonus">
            ${itens.map(item => `<span>${escaparHtml(item)}</span>`).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  function atualizarTudo(){
    atualizarDefesasComEfeitos();
    renderizarEfeitos();
    if(typeof window.atualizarBonusBatalhaCompacto === "function"){
      window.atualizarBonusBatalhaCompacto();
    }
    window.dispatchEvent(new CustomEvent("shinobi:efeitos-batalha-atualizados"));
  }

  window.obterEfeitosJutsuBatalhaAtivos = function(){
    return garantirLista().map(item => ({...item, bonus:{...item.bonus}}));
  };

  window.obterBonusEfeitosJutsuBatalha = function(alvo){
    return bonusAutomatico(alvo);
  };

  window.extrairEfeitosJutsuBatalha = function(jutsu){
    return extrairEfeitosDoJutsu(jutsu);
  };

  window.aplicarEfeitosJutsuBatalha = async function(jutsu, indice){
    const extraidos = extrairEfeitosDoJutsu(jutsu);
    if(!extraidos.bonus.ca && !extraidos.bonus.furtividade){
      return {aplicado:false, bonus:extraidos.bonus};
    }

    const lista = garantirLista();
    const id = chaveDoJutsu(jutsu, indice);
    const efeito = {
      id,
      origemTipo:"jutsu",
      origemId:String(jutsu?.catalogoId || indice || ""),
      nome:String(jutsu?.nome || "Jutsu sem nome"),
      duracao:String(jutsu?.duracao || "Até ser encerrado"),
      bonus:{...extraidos.bonus},
      aplicadoEm:Date.now()
    };

    const existente = lista.findIndex(item => item.id === id);
    if(existente >= 0) lista[existente] = efeito;
    else lista.push(efeito);

    salvarEstado();
    atualizarTudo();

    const detalhes = resumoBonus(efeito).join(" · ");
    if(typeof log === "function"){
      log(`Efeito ativo: ${efeito.nome}${detalhes ? ` | ${detalhes}` : ""}`);
    }

    return {aplicado:true, renovado:existente >= 0, efeito};
  };

  window.removerEfeitoJutsuBatalha = async function(id){
    const lista = garantirLista();
    const indice = lista.findIndex(item => item.id === id);
    if(indice < 0) return;

    const efeito = lista[indice];
    const ok = typeof confirmarUsoAcao === "function"
      ? await confirmarUsoAcao("efeito de batalha", `Encerrar ${efeito.nome}`, "Os bônus desse jutsu serão removidos da Área de Batalha.")
      : confirm(`Encerrar ${efeito.nome}?`);
    if(!ok) return;

    lista.splice(indice, 1);
    salvarEstado();
    atualizarTudo();
    if(typeof log === "function") log(`Efeito encerrado: ${efeito.nome}`);
  };

  window.limparEfeitosJutsuBatalhaSemConfirmacao = function(){
    if(estado && typeof estado === "object") estado[CHAVE_ESTADO] = [];
    salvarEstado();
    atualizarTudo();
  };

  function envolverAtualizacaoDefesas(){
    if(window.__defesasComEfeitosJutsuV182) return;
    window.__defesasComEfeitosJutsuV182 = true;
    window.atualizarDefesasTotaisBatalha = atualizarDefesasComEfeitos;
  }

  function instalarResetComEfeitos(){
    if(window.__resetBatalhaComEfeitosV182) return;
    window.__resetBatalhaComEfeitosV182 = true;

    window.resetarBatalha = async function(){
      const ok = typeof confirmarUsoAcao === "function"
        ? await confirmarUsoAcao(
            "reset",
            "Resetar batalha",
            "PV e Chakra voltam para o máximo.\nDano, custo, bônus temporários, efeitos de jutsus e histórico serão limpos."
          )
        : confirm("Resetar a batalha e limpar os efeitos ativos?");
      if(!ok) return false;

      const pv = document.getElementById("pv");
      const pvMax = document.getElementById("pvMax");
      const chakra = document.getElementById("chakra");
      const chakraMax = document.getElementById("chakraMax");
      const dano = document.getElementById("danoBatalha");
      const custo = document.getElementById("custoBatalha");
      const logBox = document.getElementById("log");

      if(pv) pv.value = pvMax?.value || 0;
      if(chakra) chakra.value = chakraMax?.value || 0;
      if(dano) dano.value = 1;
      if(custo) custo.value = 1;
      if(logBox) logBox.innerHTML = "Nada aconteceu ainda.";

      document.querySelectorAll("[data-bonus-batalha]").forEach(input => { input.value = 0; });
      document.querySelectorAll("[data-bonus-defesa-batalha]").forEach(input => { input.value = 0; });

      if(typeof bonusBatalhaAtributos !== "undefined"){
        Object.keys(bonusBatalhaAtributos).forEach(chave => { bonusBatalhaAtributos[chave] = 0; });
      }

      estado[CHAVE_ESTADO] = [];

      if(typeof salvar === "function") salvar();
      else salvarEstado();

      if(typeof atualizarModsBatalhaComBonus === "function") atualizarModsBatalhaComBonus();
      if(typeof atualizarPainelBatalhaVivo === "function") atualizarPainelBatalhaVivo();
      atualizarTudo();

      if(typeof avisoShinobi === "function"){
        await avisoShinobi("Batalha resetada", "A Área de Batalha e os efeitos ativos foram restaurados.");
      }
      return true;
    };
  }

  function iniciar(){
    envolverAtualizacaoDefesas();
    instalarResetComEfeitos();
    garantirLista();
    garantirMostradorFurtividade();
    atualizarTudo();

    document.addEventListener("input", evento => {
      if(evento.target?.matches('[data-save="destreza"],[data-save="proficiencia"],[data-save="p_furtividade"],[data-save="ca"],[data-save="cd"],[data-bonus-defesa-batalha]')){
        requestAnimationFrame(atualizarTudo);
      }
    });

    document.addEventListener("change", evento => {
      if(evento.target?.matches('[data-save="destreza"],[data-save="proficiencia"],[data-save="p_furtividade"],[data-save="ca"],[data-save="cd"],[data-bonus-defesa-batalha]')){
        requestAnimationFrame(atualizarTudo);
      }
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", iniciar, {once:true});
  }else{
    iniciar();
  }

  window.addEventListener("pageshow", () => {
    envolverAtualizacaoDefesas();
    instalarResetComEfeitos();
    atualizarTudo();
  });

  window.EfeitosJutsuShinobi = {
    versao:VERSAO,
    extrair:extrairEfeitosDoJutsu,
    ativos:window.obterEfeitosJutsuBatalhaAtivos,
    bonus:window.obterBonusEfeitosJutsuBatalha
  };
})();
