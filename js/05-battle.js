/* Shinobi 1.8.1 — painel de combate com efeitos automáticos e Furtividade. */

/* ===== BÔNUS TEMPORÁRIOS DE ATRIBUTOS ===== */
(function(){
  if(window.__bonusBatalhaCompactoV2) return;
  window.__bonusBatalhaCompactoV2=true;

  let aberto=false;
  let frame=null;

  function bonusAtivos(){
    return Array.from(document.querySelectorAll(".bonusAtributoBatalha"))
      .map(input=>{
        const valor=Number(input.value||0);
        const alvo=String(input.dataset.bonusBatalha||"").toUpperCase().slice(0,3);
        return valor?{alvo,valor}:null;
      })
      .filter(Boolean);
  }

  window.atualizarBonusBatalhaCompacto=function(){
    const painel=document.querySelector("#batalha .bonusAtributosBatalha");
    if(!painel) return;

    painel.classList.toggle("aberto",aberto);
    painel.classList.toggle("fechado",!aberto);

    let resumo=painel.querySelector(".bonusResumoCompacto");
    if(!resumo){
      resumo=document.createElement("div");
      resumo.className="bonusResumoCompacto";
      const titulo=painel.querySelector("h3");
      titulo?.nextSibling
        ? painel.insertBefore(resumo,titulo.nextSibling)
        : painel.prepend(resumo);
    }

    const ativos=bonusAtivos();
    const efeitosJutsu=typeof window.obterEfeitosJutsuBatalhaAtivos==="function"
      ? window.obterEfeitosJutsuBatalhaAtivos()
      : [];

    const chipsJutsu=efeitosJutsu.flatMap(efeito=>{
      const chips=[];
      const ca=Number(efeito?.bonus?.ca||0);
      const furtividade=Number(efeito?.bonus?.furtividade||0);
      if(ca)chips.push({alvo:"CA",valor:ca});
      if(furtividade)chips.push({alvo:"FUR",valor:furtividade});
      return chips;
    });

    const todos=[...ativos,...chipsJutsu];
    resumo.innerHTML=`
      ${todos.length
        ? `<div class="bonusResumoAtivos">${todos.map(b=>`<span class="bonusResumoChip">${b.alvo} ${b.valor>0?"+":""}${b.valor}</span>`).join("")}</div>`
        : `<div class="bonusResumoVazio">Nenhum bônus temporário ativo.</div>`
      }
      <button type="button" class="btnGerenciarBonusBatalha" onclick="alternarBonusAtributosBatalha()">
        ${aberto?"▲ Fechar bônus":"▼ Gerenciar bônus"}
      </button>
    `;
  };

  window.alternarBonusAtributosBatalha=function(){
    aberto=!aberto;
    window.atualizarBonusBatalhaCompacto();
  };

  function agendar(){
    if(frame!==null) return;
    frame=requestAnimationFrame(()=>{
      frame=null;
      window.atualizarBonusBatalhaCompacto();
    });
  }

  if(typeof window.atualizarModsBatalhaComBonus==="function"&&!window.__modsBatalhaComResumoV2){
    window.__modsBatalhaComResumoV2=true;
    const base=window.atualizarModsBatalhaComBonus;
    window.atualizarModsBatalhaComBonus=function(){
      const resultado=base.apply(this,arguments);
      agendar();
      return resultado;
    };
  }else{
    document.addEventListener("input",evento=>{
      if(evento.target?.matches(".bonusAtributoBatalha")) agendar();
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",agendar,{once:true});
  }else{
    agendar();
  }
  window.addEventListener("pageshow",agendar);
})();

/* ===== RESISTÊNCIAS PERSISTENTES ===== */
(function(){
  if(window.__resistenciasPersistentesV4) return;
  window.__resistenciasPersistentesV4=true;

  let aberto=false;
  let frame=null;

  const GRUPOS=[
    {titulo:"Elementos",itens:[
      {id:"katon",nome:"🔥 Katon"},{id:"raiton",nome:"⚡ Raiton"},{id:"fuuton",nome:"🌪️ Fuuton"},
      {id:"suiton",nome:"💧 Suiton"},{id:"doton",nome:"🪨 Doton"},{id:"mokuton",nome:"🌱 Mokuton"},
      {id:"youton",nome:"☀️ Youton"},{id:"shoton",nome:"💎 Shoton"},{id:"neutro",nome:"✨ Neutro"}
    ]},
    {titulo:"Atributos",itens:[
      {id:"forca",nome:"FOR"},{id:"destreza",nome:"DES"},{id:"constituicao",nome:"CON"},
      {id:"inteligencia",nome:"INT"},{id:"sabedoria",nome:"SAB"},{id:"carisma",nome:"CAR"}
    ]},
    {titulo:"Especiais",itens:[
      {id:"fisico",nome:"⚔️ Físico"},{id:"taijutsu",nome:"👊 Taijutsu"},{id:"genjutsu",nome:"👁️ Genjutsu"},
      {id:"veneno",nome:"☠️ Veneno"},{id:"selamento",nome:"🔒 Selamento"},{id:"sangramento",nome:"🩸 Sangramento"},
      {id:"atordoamento",nome:"😵 Atordoamento"},{id:"eletrica",nome:"⚡ Elétrica"}
    ]}
  ];

  const NOMES=new Map(GRUPOS.flatMap(grupo=>grupo.itens.map(item=>[item.id,item.nome])));

  function salvar(){
    try{
      if(typeof sincronizarEstadoDosCampos==="function") sincronizarEstadoDosCampos();
      if(typeof persistirEstadoLocal==="function") return persistirEstadoLocal();
      if(typeof CHAVE!=="undefined"){
        localStorage.setItem(CHAVE,JSON.stringify(estado));
        return true;
      }
    }catch(erro){
      console.warn("Falha ao salvar resistências.",erro);
    }
    return false;
  }

  function obterEstado(){
    /* Migração preservada: remove as resistências antigas ativadas automaticamente. */
    if(!estado.__resistenciasV3Inicializadas){
      estado.__resistenciasV3Inicializadas=true;
      estado.resistenciasBatalha={};
      if(!estado.resistenciasEscolhidas||typeof estado.resistenciasEscolhidas!=="object"||Array.isArray(estado.resistenciasEscolhidas)){
        estado.resistenciasEscolhidas={};
      }
      salvar();
    }

    if(!estado.resistenciasEscolhidas||typeof estado.resistenciasEscolhidas!=="object"||Array.isArray(estado.resistenciasEscolhidas)){
      estado.resistenciasEscolhidas={};
    }
    return estado.resistenciasEscolhidas;
  }

  function criarPainel(){
    const container=document.querySelector("#batalha #resistenciasBatalhaHost")||document.querySelector("#batalha .modificadoresBatalha");
    if(!container) return null;

    let painel=document.getElementById("resistenciasBatalhaPainel");
    if(!painel){
      painel=document.createElement("div");
      painel.id="resistenciasBatalhaPainel";
      painel.className="resistenciasBatalhaPainel";
      const bonus=container.querySelector(".bonusAtributosBatalha");
      bonus?container.insertBefore(painel,bonus):container.appendChild(painel);
    }
    return painel;
  }

  window.toggleResistenciaBatalha=function(id){
    if(!NOMES.has(id)) return;
    const resistencias=obterEstado();
    resistencias[id]?delete resistencias[id]:resistencias[id]=true;
    salvar();
    window.renderizarResistenciasBatalha();
  };

  window.alternarPainelResistenciasBatalha=function(){
    aberto=!aberto;
    window.renderizarResistenciasBatalha();
  };

  window.renderizarResistenciasBatalha=function(){
    const painel=criarPainel();
    if(!painel) return;

    const resistencias=obterEstado();
    const ativas=Object.keys(resistencias)
      .filter(id=>resistencias[id]&&NOMES.has(id))
      .map(id=>({id,nome:NOMES.get(id)}));

    painel.classList.toggle("aberto",aberto);
    painel.classList.toggle("fechado",!aberto);

    const resumo=ativas.length
      ? `<div class="resistenciasAtivasGrid">${ativas.map(item=>`<button type="button" class="resistenciaChipResumo" onclick="toggleResistenciaBatalha('${item.id}')">${item.nome}</button>`).join("")}</div>`
      : `<div class="resistenciaVazia">Nenhuma resistência ativa.</div>`;

    const controles=aberto?GRUPOS.map(grupo=>`
      <div class="resistenciaGrupo">
        <span class="resistenciaGrupoTitulo">${grupo.titulo}</span>
        <div class="resistenciasBatalhaGrid">
          ${grupo.itens.map(item=>`<button type="button" class="resistenciaChip ${resistencias[item.id]?"ativo":""}" onclick="toggleResistenciaBatalha('${item.id}')">${item.nome}</button>`).join("")}
        </div>
      </div>
    `).join(""):"";

    painel.innerHTML=`
      <h3>Resistências</h3>
      ${resumo}
      <button type="button" class="btnGerenciarResistencias" onclick="alternarPainelResistenciasBatalha()">
        ${aberto?"▲ Fechar resistências":"▼ Gerenciar resistências"}
      </button>
      ${controles}
    `;
  };

  function agendar(){
    if(frame!==null) return;
    frame=requestAnimationFrame(()=>{
      frame=null;
      window.renderizarResistenciasBatalha();
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",agendar,{once:true});
  }else{
    agendar();
  }
  window.addEventListener("pageshow",agendar);
})();

/* ===== MOSTRADORES EXTRAS DA BATALHA ===== */
(function(){
  if(window.__mostradoresExtrasBatalhaV3) return;
  window.__mostradoresExtrasBatalhaV3=true;

  let frame=null;

  function numeroCampo(nome,fallback=0){
    const campo=document.querySelector(`[data-save="${nome}"]`);
    const bruto=campo?.value??estado?.[nome]??fallback;
    const numero=Number(bruto);
    return Number.isFinite(numero)?numero:Number(fallback||0);
  }

  function comSinal(numero){
    const valor=Number(numero||0);
    return valor>0?`+${valor}`:String(valor);
  }

  function criarExtras(){
    const grade=document.querySelector("#batalha .defesasGrid");
    if(!grade) return null;

    grade.classList.add("defesasGridComExtras");
    if(!document.getElementById("batalhaIniciativaView")){
      grade.insertAdjacentHTML("beforeend",`
        <div class="extraBatalhaBox"><span>Inic.</span><strong id="batalhaIniciativaView">0</strong></div>
        <div class="extraBatalhaBox"><span>Vel.</span><strong id="batalhaVelocidadeView">0</strong></div>
        <div class="extraBatalhaBox"><span>Prof.</span><strong id="batalhaProficienciaView">0</strong></div>
      `);
    }
    return grade;
  }

  window.atualizarMostradoresExtrasBatalha=function(){
    if(!criarExtras()) return;

    const iniciativa=document.getElementById("batalhaIniciativaView");
    const velocidade=document.getElementById("batalhaVelocidadeView");
    const proficiencia=document.getElementById("batalhaProficienciaView");

    if(iniciativa) iniciativa.textContent=comSinal(numeroCampo("iniciativa"));
    if(velocidade) velocidade.textContent=String(numeroCampo("velocidade"));
    if(proficiencia) proficiencia.textContent=comSinal(numeroCampo("proficiencia"));
  };

  function agendar(){
    if(frame!==null) return;
    frame=requestAnimationFrame(()=>{
      frame=null;
      window.atualizarMostradoresExtrasBatalha();
    });
  }

  if(typeof window.atualizarModificadoresBatalha==="function"&&!window.__modsComExtrasBatalhaV3){
    window.__modsComExtrasBatalhaV3=true;
    const base=window.atualizarModificadoresBatalha;
    window.atualizarModificadoresBatalha=function(){
      const resultado=base.apply(this,arguments);
      agendar();
      return resultado;
    };
  }

  document.addEventListener("input",evento=>{
    if(evento.target?.matches('[data-save="iniciativa"],[data-save="velocidade"],[data-save="proficiencia"]')) agendar();
  });

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",agendar,{once:true});
  }else{
    agendar();
  }
  window.addEventListener("pageshow",agendar);
})();

/* ===== NAVEGAÇÃO VERTICAL CONTÍNUA ===== */
(function(){
  if(window.__navegacaoVerticalUnicaV4) return;
  window.__navegacaoVerticalUnicaV4=true;

  const IDS=["identidade","atributos","jutsus","batalha","inventario","anotacoes"];
  const paginas=new Map();
  const botoes=new Map();

  let botoesMenu=[];
  let scrollFrame=null;
  let timerClique=null;
  let timerOrientacao=null;
  let cliqueEmAndamento=false;
  let paginaAtiva="";
  let iniciada=false;

  function atualizarReferencias(){
    paginas.clear();
    botoes.clear();

    IDS.forEach(id=>{
      const pagina=document.getElementById(id);
      if(pagina) paginas.set(id,pagina);
    });

    botoesMenu=Array.from(document.querySelectorAll(".menu button"));
    botoesMenu.forEach(botao=>{
      const acao=botao.getAttribute("onclick")||"";
      const id=IDS.find(item=>acao.includes(`'${item}'`)||acao.includes(`"${item}"`));
      if(id) botoes.set(id,botao);
    });
  }

  function alturaTopo(){
    return (document.querySelector(".topo")?.offsetHeight||0)+8;
  }

  function alturaMenu(){
    return (document.querySelector(".menu.bottomNav")?.offsetHeight||0)+28;
  }

  function offsetPagina(id){
    const pagina=paginas.get(id);
    return pagina
      ? Math.max(0,pagina.getBoundingClientRect().top+window.scrollY-alturaTopo())
      : 0;
  }

  function atualizarIndice(id){
    const indice=IDS.indexOf(id);
    if(indice>=0) window.abaSwipeAtual=indice;
  }

  function marcarAtiva(id,forcar=false){
    if(!paginas.has(id)) return;
    if(!forcar&&paginaAtiva===id){
      atualizarIndice(id);
      return;
    }

    paginas.forEach((pagina,paginaId)=>pagina.classList.toggle("ativa",paginaId===id));
    botoesMenu.forEach(botao=>botao.classList.remove("ativo"));
    botoes.get(id)?.classList.add("ativo");

    paginaAtiva=id;
    atualizarIndice(id);
  }

  function rolar(id,suave){
    if(!paginas.has(id)) return;
    const reduzir=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top:offsetPagina(id),
      behavior:suave===false||reduzir?"auto":"smooth"
    });
  }

  function detectarVisivel(){
    if(cliqueEmAndamento) return;

    const topo=alturaTopo();
    const base=window.innerHeight-alturaMenu();
    let melhorId="";
    let melhorArea=-1;
    let melhorDistancia=Infinity;

    paginas.forEach((pagina,id)=>{
      const rect=pagina.getBoundingClientRect();
      const area=Math.max(0,Math.min(rect.bottom,base)-Math.max(rect.top,topo));
      const distancia=Math.abs(rect.top-topo);

      if(area>melhorArea||(area===melhorArea&&distancia<melhorDistancia)){
        melhorId=id;
        melhorArea=area;
        melhorDistancia=distancia;
      }
    });

    if(melhorId) marcarAtiva(melhorId);
  }

  function agendarDeteccao(){
    if(scrollFrame!==null) return;
    scrollFrame=requestAnimationFrame(()=>{
      scrollFrame=null;
      detectarVisivel();
    });
  }

  const abrirAnterior=window.abrirPagina;
  window.abrirPagina=function(id,botao){
    if(!paginas.has(id)){
      return typeof abrirAnterior==="function"
        ? abrirAnterior.apply(this,arguments)
        : undefined;
    }

    cliqueEmAndamento=true;
    if(timerClique!==null) clearTimeout(timerClique);

    let resultado;
    if(typeof abrirAnterior==="function"){
      resultado=abrirAnterior.apply(this,arguments);
      paginaAtiva=id;
      atualizarIndice(id);
    }else{
      marcarAtiva(id,true);
    }

    requestAnimationFrame(()=>{
      rolar(id,true);
      timerClique=setTimeout(()=>{
        timerClique=null;
        cliqueEmAndamento=false;
        detectarVisivel();
      },520);
    });

    return resultado;
  };

  function iniciar(){
    if(iniciada){
      agendarDeteccao();
      return;
    }

    iniciada=true;
    atualizarReferencias();
    document.querySelector("main")?.classList.add("scrollPages");

    window.alvoBloqueiaSwipe=()=>true;
    window.abasSwipe=IDS.slice();

    const hash=location.hash?location.hash.replace("#",""):"";
    const inicial=paginas.has(hash)?hash:"identidade";

    marcarAtiva(inicial,true);
    requestAnimationFrame(()=>{
      rolar(inicial,false);
      detectarVisivel();
    });
  }

  window.addEventListener("scroll",agendarDeteccao,{passive:true});
  window.addEventListener("resize",agendarDeteccao,{passive:true});
  window.addEventListener("orientationchange",()=>{
    if(timerOrientacao!==null) clearTimeout(timerOrientacao);
    timerOrientacao=setTimeout(()=>{
      timerOrientacao=null;
      agendarDeteccao();
    },180);
  },{passive:true});

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  }else{
    iniciar();
  }
  window.addEventListener("pageshow",agendarDeteccao);
})();

/* ===== NOTAS: ABRIR TÓPICO SEM DESLOCAR A SEÇÃO ===== */
(function(){
  if(window.__notasFundoFixoAoAlternarV2) return;
  window.__notasFundoFixoAoAlternarV2=true;

  let timer=null;

  function manterPosicao(antes){
    const secao=document.getElementById("anotacoes");
    if(!secao||typeof antes!=="number") return;

    const delta=secao.getBoundingClientRect().top-antes;
    if(Math.abs(delta)>1) window.scrollBy({top:delta,behavior:"auto"});
  }

  if(typeof window.alternarTopicoNota==="function"){
    const base=window.alternarTopicoNota;
    window.alternarTopicoNota=function(){
      const secao=document.getElementById("anotacoes");
      const antes=secao?secao.getBoundingClientRect().top:null;
      const resultado=base.apply(this,arguments);

      requestAnimationFrame(()=>{
        manterPosicao(antes);
        if(timer!==null) clearTimeout(timer);
        timer=setTimeout(()=>{
          timer=null;
          manterPosicao(antes);
        },120);
      });

      return resultado;
    };
  }
})();
