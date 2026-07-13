/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

/* ===== BATALHA MAIS LIMPA V1: resistências e bônus recolhíveis ===== */
(function(){
  if(window.__batalhaLimpaV1) return;
  window.__batalhaLimpaV1 = true;

  let resistenciasAbertas = false;
  let bonusBatalhaAberto = false;

  const GRUPOS_RESUMO = [
    {
      titulo:"Elementos",
      itens:[
        {id:"katon", nome:"🔥 Katon"},
        {id:"raiton", nome:"⚡ Raiton"},
        {id:"fuuton", nome:"🌪️ Fuuton"},
        {id:"suiton", nome:"💧 Suiton"},
        {id:"doton", nome:"🪨 Doton"},
        {id:"mokuton", nome:"🌱 Mokuton"},
        {id:"youton", nome:"☀️ Youton"},
        {id:"shoton", nome:"💎 Shoton"},
        {id:"neutro", nome:"✨ Neutro"}
      ]
    },
    {
      titulo:"Atributos",
      itens:[
        {id:"forca", nome:"FOR"},
        {id:"destreza", nome:"DES"},
        {id:"constituicao", nome:"CON"},
        {id:"inteligencia", nome:"INT"},
        {id:"sabedoria", nome:"SAB"},
        {id:"carisma", nome:"CAR"}
      ]
    },
    {
      titulo:"Especiais",
      itens:[
        {id:"fisico", nome:"⚔️ Físico"},
        {id:"taijutsu", nome:"👊 Taijutsu"},
        {id:"genjutsu", nome:"👁️ Genjutsu"},
        {id:"veneno", nome:"☠️ Veneno"},
        {id:"selamento", nome:"🔒 Selamento"},
        {id:"sangramento", nome:"🩸 Sangramento"},
        {id:"atordoamento", nome:"😵 Atordoamento"},
        {id:"eletrica", nome:"⚡ Elétrica"}
      ]
    }
  ];

  function garantirResistencias(){
    estado.resistenciasBatalha = estado.resistenciasBatalha || {};
    if(Array.isArray(estado.resistenciasBatalha)){
      const novo = {};
      estado.resistenciasBatalha.forEach(x=>{
        const id = String(x || "").toLowerCase().trim();
        if(id) novo[id] = true;
      });
      estado.resistenciasBatalha = novo;
    }
    return estado.resistenciasBatalha;
  }

  function salvarBatalhaLimpa(){
    try{
      if(typeof persistirSemRender === "function") persistirSemRender();
      else if(typeof salvar === "function") salvar();
      else if(typeof persistirEstadoLocal === "function") persistirEstadoLocal();
      else if(typeof CHAVE !== "undefined") localStorage.setItem(CHAVE, JSON.stringify(estado));
    }catch(e){ console.warn(e); }
  }

  /* função duplicada removida: nomeResistencia */

  window.toggleResistenciaBatalha = function(id){
    const r = garantirResistencias();
    r[id] = !r[id];
    salvarBatalhaLimpa();
    renderizarResistenciasBatalha();
  };

  window.alternarPainelResistenciasBatalha = function(){
    resistenciasAbertas = !resistenciasAbertas;
    renderizarResistenciasBatalha();
  };

  function criarPainelResistencias(){
    const mod = document.querySelector("#batalha .modificadoresBatalha");
    if(!mod) return null;

    let painel = document.getElementById("resistenciasBatalhaPainel");
    if(!painel){
      painel = document.createElement("div");
      painel.id = "resistenciasBatalhaPainel";
      painel.className = "resistenciasBatalhaPainel";

      const bonus = mod.querySelector(".bonusAtributosBatalha");
      if(bonus) mod.insertBefore(painel, bonus);
      else mod.appendChild(painel);
    }
    return painel;
  }

  window.renderizarResistenciasBatalha = function(){
    const painel = criarPainelResistencias();
    if(!painel) return;

    const r = garantirResistencias();
    const ativos = Object.keys(r).filter(id=>r[id]).map(id=>({id,nome:nomeResistencia(id)}));

    painel.classList.toggle("aberto", resistenciasAbertas);
    painel.classList.toggle("fechado", !resistenciasAbertas);

    const ativosHtml = ativos.length
      ? `<div class="resistenciasAtivasGrid">${ativos.map(item=>`<button type="button" class="resistenciaChipResumo" onclick="toggleResistenciaBatalha('${item.id}')">${item.nome}</button>`).join("")}</div>`
      : `<div class="resistenciaVazia">Nenhuma resistência ativa.</div>`;

    const gruposHtml = resistenciasAbertas ? GRUPOS_RESUMO.map(grupo=>{
      const botoes = grupo.itens.map(item=>{
        const ativo = r[item.id] ? "ativo" : "";
        return `<button type="button" class="resistenciaChip ${ativo}" onclick="toggleResistenciaBatalha('${item.id}')">${item.nome}</button>`;
      }).join("");

      return `
        <div class="resistenciaGrupo">
          <span class="resistenciaGrupoTitulo">${grupo.titulo}</span>
          <div class="resistenciasBatalhaGrid">${botoes}</div>
        </div>
      `;
    }).join("") : "";

    painel.innerHTML = `
      <h3>Resistências</h3>
      ${ativosHtml}
      <button type="button" class="btnGerenciarResistencias" onclick="alternarPainelResistenciasBatalha()">
        ${resistenciasAbertas ? "▲ Fechar resistências" : "▼ Gerenciar resistências"}
      </button>
      ${gruposHtml}
    `;
  };

  function resumoBonusAtributos(){
    const inputs = Array.from(document.querySelectorAll(".bonusAtributoBatalha"));
    return inputs
      .map(input=>{
        const valor = Number(input.value || 0);
        const alvo = String(input.dataset.bonusBatalha || "").toUpperCase().slice(0,3);
        return valor ? {alvo, valor} : null;
      })
      .filter(Boolean);
  }

  window.alternarBonusAtributosBatalha = function(){
    bonusBatalhaAberto = !bonusBatalhaAberto;
    atualizarBonusBatalhaCompacto();
  };

  function atualizarBonusBatalhaCompacto(){
    const painel = document.querySelector("#batalha .bonusAtributosBatalha");
    if(!painel) return;

    painel.classList.toggle("aberto", bonusBatalhaAberto);
    painel.classList.toggle("fechado", !bonusBatalhaAberto);

    let resumo = painel.querySelector(".bonusResumoCompacto");
    if(!resumo){
      resumo = document.createElement("div");
      resumo.className = "bonusResumoCompacto";
      const titulo = painel.querySelector("h3");
      if(titulo && titulo.nextSibling) painel.insertBefore(resumo, titulo.nextSibling);
      else painel.prepend(resumo);
    }

    const ativos = resumoBonusAtributos();

    resumo.innerHTML = `
      ${ativos.length
        ? `<div class="bonusResumoAtivos">${ativos.map(b=>`<span class="bonusResumoChip">${b.alvo} ${b.valor > 0 ? "+" : ""}${b.valor}</span>`).join("")}</div>`
        : `<div class="bonusResumoVazio">Nenhum bônus temporário ativo.</div>`
      }
      <button type="button" class="btnGerenciarBonusBatalha" onclick="alternarBonusAtributosBatalha()">
        ${bonusBatalhaAberto ? "▲ Fechar bônus" : "▼ Gerenciar bônus"}
      </button>
    `;
  }

  document.addEventListener("input", function(ev){
    if(ev.target && ev.target.matches(".bonusAtributoBatalha")){
      setTimeout(atualizarBonusBatalhaCompacto, 60);
    }
  });

  if(typeof abrirPagina === "function" && !window.__abrirPaginaBatalhaLimpaV1){
    window.__abrirPaginaBatalhaLimpaV1 = true;
    const baseAbrir = abrirPagina;
    window.abrirPagina = function(id, botao){
      const r = baseAbrir.apply(this, arguments);
      if(id === "batalha"){
        setTimeout(renderizarResistenciasBatalha, 120);
        setTimeout(atualizarBonusBatalhaCompacto, 160);
      }
      return r;
    };
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    setTimeout(renderizarResistenciasBatalha, 350);
    setTimeout(atualizarBonusBatalhaCompacto, 380);
  });

  window.addEventListener("pageshow", ()=>{
    setTimeout(renderizarResistenciasBatalha, 350);
    setTimeout(atualizarBonusBatalhaCompacto, 380);
  });
})();

/* ===== RESISTÊNCIAS PERSISTENTES V3: somente as escolhidas ficam ativas ===== */
(function(){
  if(window.__resistenciasPersistentesV3) return;
  window.__resistenciasPersistentesV3 = true;

  let painelAberto = false;

  const GRUPOS = [
    {titulo:'Elementos',itens:[
      {id:'katon',nome:'🔥 Katon'},{id:'raiton',nome:'⚡ Raiton'},{id:'fuuton',nome:'🌪️ Fuuton'},
      {id:'suiton',nome:'💧 Suiton'},{id:'doton',nome:'🪨 Doton'},{id:'mokuton',nome:'🌱 Mokuton'},
      {id:'youton',nome:'☀️ Youton'},{id:'shoton',nome:'💎 Shoton'},{id:'neutro',nome:'✨ Neutro'}
    ]},
    {titulo:'Atributos',itens:[
      {id:'forca',nome:'FOR'},{id:'destreza',nome:'DES'},{id:'constituicao',nome:'CON'},
      {id:'inteligencia',nome:'INT'},{id:'sabedoria',nome:'SAB'},{id:'carisma',nome:'CAR'}
    ]},
    {titulo:'Especiais',itens:[
      {id:'fisico',nome:'⚔️ Físico'},{id:'taijutsu',nome:'👊 Taijutsu'},{id:'genjutsu',nome:'👁️ Genjutsu'},
      {id:'veneno',nome:'☠️ Veneno'},{id:'selamento',nome:'🔒 Selamento'},{id:'sangramento',nome:'🩸 Sangramento'},
      {id:'atordoamento',nome:'😵 Atordoamento'},{id:'eletrica',nome:'⚡ Elétrica'}
    ]}
  ];

  function salvarResistencias(){
    try{
      if(typeof sincronizarEstadoDosCampos === 'function') sincronizarEstadoDosCampos();
      if(typeof persistirEstadoLocal === 'function') return persistirEstadoLocal();
      if(typeof CHAVE !== 'undefined') { localStorage.setItem(CHAVE, JSON.stringify(estado)); return true; }
    }catch(e){ console.warn('Falha ao salvar resistências.',e); }
    return false;
  }

  function estadoResistencias(){
    /* Não reaproveita as duas resistências antigas que ficavam ativas sozinhas. */
    if(!estado.__resistenciasV3Inicializadas){
      estado.__resistenciasV3Inicializadas = true;
      estado.resistenciasBatalha = {};
      if(!estado.resistenciasEscolhidas || typeof estado.resistenciasEscolhidas !== 'object' || Array.isArray(estado.resistenciasEscolhidas)){
        estado.resistenciasEscolhidas = {};
      }
      salvarResistencias();
    }

    if(!estado.resistenciasEscolhidas || typeof estado.resistenciasEscolhidas !== 'object' || Array.isArray(estado.resistenciasEscolhidas)){
      estado.resistenciasEscolhidas = {};
    }
    return estado.resistenciasEscolhidas;
  }

  function nomeResistencia(id){
    for(const grupo of GRUPOS){
      const item=grupo.itens.find(x=>x.id===id);
      if(item) return item.nome;
    }
    return id;
  }

  function criarPainel(){
    const container=document.querySelector('#batalha .modificadoresBatalha');
    if(!container) return null;
    let painel=document.getElementById('resistenciasBatalhaPainel');
    if(!painel){
      painel=document.createElement('div');
      painel.id='resistenciasBatalhaPainel';
      painel.className='resistenciasBatalhaPainel';
      const bonus=container.querySelector('.bonusAtributosBatalha');
      if(bonus) container.insertBefore(painel,bonus); else container.appendChild(painel);
    }
    return painel;
  }

  window.toggleResistenciaBatalha=function(id){
    const resistencias=estadoResistencias();
    resistencias[id]=!resistencias[id];
    if(!resistencias[id]) delete resistencias[id];
    salvarResistencias();
    window.renderizarResistenciasBatalha();
  };

  window.alternarPainelResistenciasBatalha=function(){
    painelAberto=!painelAberto;
    window.renderizarResistenciasBatalha();
  };

  window.renderizarResistenciasBatalha=function(){
    const painel=criarPainel();
    if(!painel) return;

    const resistencias=estadoResistencias();
    const ativas=Object.keys(resistencias).filter(id=>resistencias[id]).map(id=>({id,nome:nomeResistencia(id)}));

    painel.classList.toggle('aberto',painelAberto);
    painel.classList.toggle('fechado',!painelAberto);

    const resumo=ativas.length
      ? `<div class="resistenciasAtivasGrid">${ativas.map(item=>`<button type="button" class="resistenciaChipResumo" onclick="toggleResistenciaBatalha('${item.id}')">${item.nome}</button>`).join('')}</div>`
      : `<div class="resistenciaVazia">Nenhuma resistência ativa.</div>`;

    const controles=painelAberto ? GRUPOS.map(grupo=>`
      <div class="resistenciaGrupo">
        <span class="resistenciaGrupoTitulo">${grupo.titulo}</span>
        <div class="resistenciasBatalhaGrid">
          ${grupo.itens.map(item=>`<button type="button" class="resistenciaChip ${resistencias[item.id]?'ativo':''}" onclick="toggleResistenciaBatalha('${item.id}')">${item.nome}</button>`).join('')}
        </div>
      </div>
    `).join('') : '';

    painel.innerHTML=`
      <h3>Resistências</h3>
      ${resumo}
      <button type="button" class="btnGerenciarResistencias" onclick="alternarPainelResistenciasBatalha()">${painelAberto?'▲ Fechar resistências':'▼ Gerenciar resistências'}</button>
      ${controles}
    `;
  };

  /* O reset de batalha não altera estado.resistenciasEscolhidas. */
  if(typeof window.resetarBatalha === 'function' && !window.__resetarBatalhaMantemResistenciasV3){
    window.__resetarBatalhaMantemResistenciasV3=true;
    const resetarBase=window.resetarBatalha;
    window.resetarBatalha=async function(){
      const resultado=await resetarBase.apply(this,arguments);
      setTimeout(window.renderizarResistenciasBatalha,120);
      return resultado;
    };
  }

  if(typeof window.abrirPagina === 'function' && !window.__abrirPaginaResistenciasV3){
    window.__abrirPaginaResistenciasV3=true;
    const abrirBase=window.abrirPagina;
    window.abrirPagina=function(id,botao){
      const resultado=abrirBase.apply(this,arguments);
      if(id==='batalha') setTimeout(window.renderizarResistenciasBatalha,100);
      return resultado;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(window.renderizarResistenciasBatalha,320));
  window.addEventListener('pageshow',()=>setTimeout(window.renderizarResistenciasBatalha,320));
})();

/* ===== MOSTRADORES EXTRAS BATALHA V2 - INSERE DENTRO DA GRADE DE DEFESAS ===== */
(function(){
  if(window.__mostradoresExtrasBatalhaV2) return;
  window.__mostradoresExtrasBatalhaV2 = true;

  function numeroCampo(nome, fallback){
    const el = document.querySelector(`[data-save="${nome}"]`);
    const raw = el?.value ?? estado?.[nome] ?? fallback ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : Number(fallback || 0);
  }

  function comSinal(n){
    n = Number(n || 0);
    return n > 0 ? "+" + n : String(n);
  }

  function criarExtrasNaGrade(){
    const grade = document.querySelector("#batalha .defesasGrid");
    if(!grade) return null;

    grade.classList.add("defesasGridComExtras");

    if(!document.getElementById("batalhaIniciativaView")){
      grade.insertAdjacentHTML("beforeend", `
        <div class="extraBatalhaBox">
          <span>Inic.</span>
          <strong id="batalhaIniciativaView">0</strong>
        </div>
        <div class="extraBatalhaBox">
          <span>Vel.</span>
          <strong id="batalhaVelocidadeView">0</strong>
        </div>
        <div class="extraBatalhaBox">
          <span>Prof.</span>
          <strong id="batalhaProficienciaView">0</strong>
        </div>
      `);
    }

    return grade;
  }

  window.atualizarMostradoresExtrasBatalha = function(){
    if(!criarExtrasNaGrade()) return;

    const iniciativa = numeroCampo("iniciativa", 0);
    const velocidade = numeroCampo("velocidade", 0);
    const proficiencia = numeroCampo("proficiencia", 0);

    const ini = document.getElementById("batalhaIniciativaView");
    const vel = document.getElementById("batalhaVelocidadeView");
    const prof = document.getElementById("batalhaProficienciaView");

    if(ini) ini.textContent = comSinal(iniciativa);
    if(vel) vel.textContent = velocidade;
    if(prof) prof.textContent = comSinal(proficiencia);
  };

  function agendar(){
    setTimeout(window.atualizarMostradoresExtrasBatalha, 80);
    setTimeout(window.atualizarMostradoresExtrasBatalha, 250);
  }

  if(typeof atualizarModificadoresBatalha === "function" && !window.__atualizarModsComExtrasBatalhaV2){
    window.__atualizarModsComExtrasBatalhaV2 = true;
    const base = atualizarModificadoresBatalha;
    window.atualizarModificadoresBatalha = function(){
      const r = base.apply(this, arguments);
      agendar();
      return r;
    };
  }

  if(typeof abrirPagina === "function" && !window.__abrirPaginaExtrasBatalhaV2){
    window.__abrirPaginaExtrasBatalhaV2 = true;
    const baseAbrir = abrirPagina;
    window.abrirPagina = function(id, botao){
      const r = baseAbrir.apply(this, arguments);
      if(id === "batalha") agendar();
      return r;
    };
  }

  document.addEventListener("input", function(ev){
    if(ev.target && ev.target.matches('[data-save="iniciativa"],[data-save="velocidade"],[data-save="proficiencia"]')){
      agendar();
    }
  });

  document.addEventListener("DOMContentLoaded", agendar);
  window.addEventListener("pageshow", agendar);
})();

/* === Navegação vertical contínua: página única, menu ativo sincronizado === */
(function(){
  if(window.__navegacaoVerticalUnicaV3) return;
  window.__navegacaoVerticalUnicaV3 = true;

  const paginasNavegaveis = ["identidade", "atributos", "jutsus", "anotacoes", "inventario", "batalha"];
  let scrollRaf = null;
  let atualizandoPorClique = false;

  function paginaExiste(id){
    return paginasNavegaveis.includes(id) && !!document.getElementById(id);
  }

  function botaoDaPagina(id){
    const botoes = Array.from(document.querySelectorAll(".menu button"));
    return botoes.find(function(botao){
      const acao = botao.getAttribute("onclick") || "";
      return acao.includes("'" + id + "'") || acao.includes('"' + id + '"');
    });
  }

  function alturaTopo(){
    const topo = document.querySelector(".topo");
    return (topo ? topo.offsetHeight : 0) + 8;
  }

  function alturaMenuInferior(){
    const menu = document.querySelector(".menu.bottomNav");
    return (menu ? menu.offsetHeight : 0) + 28;
  }

  function offsetPagina(id){
    const pagina = document.getElementById(id);
    if(!pagina) return 0;
    return Math.max(0, pagina.getBoundingClientRect().top + window.pageYOffset - alturaTopo());
  }

  function marcarPaginaAtiva(id){
    if(!paginaExiste(id)) return;

    document.querySelectorAll(".pagina").forEach(function(pagina){
      pagina.classList.toggle("ativa", pagina.id === id);
    });

    document.querySelectorAll(".menu button").forEach(function(botao){
      botao.classList.remove("ativo");
    });

    const botao = botaoDaPagina(id);
    if(botao) botao.classList.add("ativo");

    window.abaSwipeAtual = paginasNavegaveis.indexOf(id);
  }

  function rolarParaPagina(id, suave){
    if(!paginaExiste(id)) return;
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: offsetPagina(id),
      behavior: suave === false || reduzirMovimento ? "auto" : "smooth"
    });
  }

  function detectarPaginaVisivel(){
    if(atualizandoPorClique) return;

    const topoVisivel = alturaTopo();
    const baseVisivel = window.innerHeight - alturaMenuInferior();
    let melhorId = null;
    let melhorArea = -1;
    let melhorDistancia = Infinity;

    paginasNavegaveis.forEach(function(id){
      const pagina = document.getElementById(id);
      if(!pagina) return;

      const rect = pagina.getBoundingClientRect();
      const visivel = Math.max(0, Math.min(rect.bottom, baseVisivel) - Math.max(rect.top, topoVisivel));
      const distancia = Math.abs(rect.top - topoVisivel);

      if(visivel > melhorArea || (visivel === melhorArea && distancia < melhorDistancia)){
        melhorArea = visivel;
        melhorDistancia = distancia;
        melhorId = id;
      }
    });

    if(melhorId) marcarPaginaAtiva(melhorId);
  }

  function agendarDeteccaoPagina(){
    if(scrollRaf) return;
    scrollRaf = requestAnimationFrame(function(){
      scrollRaf = null;
      detectarPaginaVisivel();
    });
  }

  const abrirPaginaAnterior = window.abrirPagina;

  window.abrirPagina = function(id, botao){
    if(!paginaExiste(id)){
      return typeof abrirPaginaAnterior === "function" ? abrirPaginaAnterior.apply(this, arguments) : undefined;
    }

    atualizandoPorClique = true;
    let resultado;

    if(typeof abrirPaginaAnterior === "function"){
      resultado = abrirPaginaAnterior.apply(this, arguments);
    }else{
      marcarPaginaAtiva(id);
    }

    marcarPaginaAtiva(id);

    requestAnimationFrame(function(){
      rolarParaPagina(id, true);
      setTimeout(function(){
        atualizandoPorClique = false;
        detectarPaginaVisivel();
      }, 520);
    });

    return resultado;
  };

  function iniciarNavegacaoVertical(){
    const main = document.querySelector("main");
    if(main) main.classList.add("scrollPages");

    /* Bloqueia o swipe lateral antigo sem apagar nenhuma função do app. */
    try{
      window.alvoBloqueiaSwipe = function(){ return true; };
    }catch(e){}

    window.abasSwipe = paginasNavegaveis.slice();

    const hash = location.hash ? location.hash.replace("#", "") : "";
    const paginaInicial = paginaExiste(hash) ? hash : "identidade";
    marcarPaginaAtiva(paginaInicial);

    setTimeout(function(){
      rolarParaPagina(paginaInicial, false);
      detectarPaginaVisivel();
    }, 80);
  }

  window.addEventListener("scroll", agendarDeteccaoPagina, {passive:true});
  window.addEventListener("resize", agendarDeteccaoPagina, {passive:true});
  window.addEventListener("orientationchange", function(){ setTimeout(agendarDeteccaoPagina, 180); }, {passive:true});
  document.addEventListener("DOMContentLoaded", iniciarNavegacaoVertical);
  window.addEventListener("pageshow", function(){ setTimeout(iniciarNavegacaoVertical, 80); });

  if(document.readyState !== "loading") iniciarNavegacaoVertical();
})();

/* === Notas: abrir tópico sem deslocar o fundo === */
(function(){
  if(window.__notasFundoFixoAoAlternarV1) return;
  window.__notasFundoFixoAoAlternarV1 = true;

  function manterPosicaoSecao(antesTop){
    const secao = document.getElementById('anotacoes');
    if(!secao || typeof antesTop !== 'number') return;
    const depoisTop = secao.getBoundingClientRect().top;
    const delta = depoisTop - antesTop;
    if(Math.abs(delta) > 1){
      window.scrollBy({ top: delta, behavior: 'auto' });
    }
  }

  function ajustarNotasDepois(){
    if(typeof ajustarNotasAbertasSeguro === 'function'){
      try{ ajustarNotasAbertasSeguro(); }catch(e){}
    }else if(typeof ajustarTodasNotasAbertas === 'function'){
      try{ ajustarTodasNotasAbertas(); }catch(e){}
    }
  }

  if(typeof window.alternarTopicoNota === 'function'){
    const alternarBase = window.alternarTopicoNota;
    window.alternarTopicoNota = function(){
      const secao = document.getElementById('anotacoes');
      const antesTop = secao ? secao.getBoundingClientRect().top : null;
      const resultado = alternarBase.apply(this, arguments);
      requestAnimationFrame(function(){
        ajustarNotasDepois();
        manterPosicaoSecao(antesTop);
        setTimeout(function(){
          ajustarNotasDepois();
          manterPosicaoSecao(antesTop);
        }, 80);
      });
      return resultado;
    };
  }
})();
