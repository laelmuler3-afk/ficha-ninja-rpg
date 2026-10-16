/* Shinobi 1.8.5 — painel de combate com modificadores e efeitos acumulados. */

/* ===== MODIFICADORES VISÍVEIS E BÔNUS TEMPORÁRIOS ===== */
(function(){
  if(window.__modificadoresCombateVisiveisV185) return;
  window.__modificadoresCombateVisiveisV185=true;

  let frame=null;

  const ROTULOS={
    forca:"FOR",
    destreza:"DES",
    constituicao:"CON",
    inteligencia:"INT",
    sabedoria:"SAB",
    carisma:"CAR",
    ca:"CA",
    furtividade:"FUR",
    velocidade:"VEL",
    mod_forca:"MOD FOR",
    mod_destreza:"MOD DES",
    mod_constituicao:"MOD CON",
    mod_inteligencia:"MOD INT",
    mod_sabedoria:"MOD SAB",
    mod_carisma:"MOD CAR"
  };

  function numero(valor){
    const n=Number(valor||0);
    return Number.isFinite(n)?n:0;
  }

  function comSinal(valor){
    const n=numero(valor);
    return n>0?`+${n}`:String(n);
  }

  function bonusManuais(){
    return Array.from(document.querySelectorAll(".bonusAtributoBatalha"))
      .map(input=>{
        const alvo=String(input.dataset.bonusBatalha||"").toLowerCase();
        const valor=numero(input.value);
        return valor?{alvo,valor,origem:"manual"}:null;
      })
      .filter(Boolean);
  }

  function bonusDeJutsus(){
    const efeitos=typeof window.obterEfeitosJutsuBatalhaAtivos==="function"
      ? window.obterEfeitosJutsuBatalhaAtivos()
      : [];

    return efeitos.flatMap(efeito=>
      Object.entries(efeito?.bonus||{})
        .map(([alvo,valor])=>({
          alvo:String(alvo||"").toLowerCase(),
          valor:numero(valor),
          origem:"jutsu",
          nome:String(efeito?.nome||"Jutsu")
        }))
        .filter(item=>item.valor)
    );
  }

  function agruparBonus(itens){
    const mapa=new Map();

    itens.forEach(item=>{
      const alvo=item.alvo;
      if(!alvo) return;

      if(!mapa.has(alvo)){
        mapa.set(alvo,{
          alvo,
          total:0,
          manual:0,
          jutsu:0,
          fontesJutsu:new Set()
        });
      }

      const grupo=mapa.get(alvo);
      grupo.total+=item.valor;

      if(item.origem==="manual"){
        grupo.manual+=item.valor;
      }else{
        grupo.jutsu+=item.valor;
        if(item.nome) grupo.fontesJutsu.add(item.nome);
      }
    });

    return Array.from(mapa.values());
  }

  window.obterResumoBonusCombate=function(){
    return agruparBonus([...bonusManuais(),...bonusDeJutsus()]).map(item=>({
      ...item,
      fontesJutsu:Array.from(item.fontesJutsu)
    }));
  };

  window.atualizarBonusBatalhaCompacto=function(){
    const painel=document.querySelector("#batalha .bonusAtributosBatalha");
    if(!painel) return;

    let resumo=painel.querySelector(".bonusResumoCompacto");
    if(!resumo){
      resumo=document.createElement("div");
      resumo.className="bonusResumoCompacto";
      painel.appendChild(resumo);
    }

    const grupos=window.obterResumoBonusCombate();

    painel.classList.toggle("semBonusTemporario", !grupos.length);
    resumo.hidden=!grupos.length;
    resumo.innerHTML=grupos.length
      ? `
        <div class="bonusResumoTitulo">Bônus ativos acumulados</div>
        <div class="bonusResumoAtivos">
          ${grupos.map(grupo=>{
            const detalhes=[];
            if(grupo.manual) detalhes.push(`${comSinal(grupo.manual)} manual`);
            if(grupo.jutsu){
              const qtd=grupo.fontesJutsu.length;
              detalhes.push(`${comSinal(grupo.jutsu)} ${qtd>1?`${qtd} jutsus`:"jutsu"}`);
            }

            return `
              <span class="bonusResumoChip bonusResumoChipTotal">
                <b>${ROTULOS[grupo.alvo]||grupo.alvo.toUpperCase()}</b>
                <strong>${comSinal(grupo.total)}</strong>
                ${detalhes.length?`<small>${detalhes.join(" · ")}</small>`:""}
              </span>
            `;
          }).join("")}
        </div>
      `
      : "";
  };

  /*
   * Mantém compatibilidade com botões antigos. Os campos manuais agora
   * ficam dentro de um <details>, por isso não há mais um painel próprio
   * que precise ser aberto por JavaScript.
   */
  window.alternarBonusAtributosBatalha=function(){
    const detalhes=document.querySelector("#batalha .ajustesBonusAtributos");
    if(detalhes) detalhes.open=!detalhes.open;
  };

  function agendar(){
    if(frame!==null) return;
    frame=requestAnimationFrame(()=>{
      frame=null;
      window.atualizarBonusBatalhaCompacto();
    });
  }

  if(typeof window.atualizarModsBatalhaComBonus==="function"&&!window.__modsBatalhaComResumoV184){
    window.__modsBatalhaComResumoV184=true;
    const base=window.atualizarModsBatalhaComBonus;
    window.atualizarModsBatalhaComBonus=function(){
      const resultado=base.apply(this,arguments);
      agendar();
      return resultado;
    };
  }

  document.addEventListener("input",evento=>{
    if(evento.target?.matches(".bonusAtributoBatalha")) agendar();
  });

  document.addEventListener("change",evento=>{
    if(evento.target?.matches(".bonusAtributoBatalha")) agendar();
  });

  window.addEventListener("shinobi:efeitos-batalha-atualizados",agendar);

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

  function salvar(contexto={}){
    try{
      if(typeof sincronizarEstadoDosCampos==="function") sincronizarEstadoDosCampos();
      if(typeof persistirEstadoLocal==="function") return persistirEstadoLocal(contexto);
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

  window.toggleResistenciaBatalha=async function(id){
    if(!NOMES.has(id)) return;
    const resistencias=obterEstado();
    const estavaAtiva=Boolean(resistencias[id]);
    const acao=estavaAtiva?"Remover":"Adicionar";
    const mensagem=`${acao} ${NOMES.get(id)} nas resistências da ficha?`;
    const confirmado=typeof modalShinobi==="function"
      ? await modalShinobi("Confirmar alteração?",mensagem)
      : confirm(mensagem);
    if(!confirmado) return;
    estavaAtiva?delete resistencias[id]:resistencias[id]=true;
    salvar({confirmada:true,origem:"resistencias",campo:"resistenciasEscolhidas",motivo:"alteracao-confirmada"});
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
    if(velocidade){
      const base=numeroCampo("velocidade"),multiplicador=Number(window.obterMultiplicadorEfeitosJutsuBatalha?.("velocidade")||1),bonus=Number(window.obterBonusEfeitosJutsuBatalha?.("velocidade")||0),total=Math.floor(base*multiplicador*1000)/1000+bonus,detalhes=[];
      multiplicador!==1&&detalhes.push(`×${multiplicador} jutsu`),bonus&&detalhes.push(`${bonus>0?"+":""}${bonus}m jutsu`),velocidade.innerHTML=`${String(total).replace(".",",")}${detalhes.length?`<span class="bonusDefesaTexto">${detalhes.join(" · ")}</span>`:""}`;
    }
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
  if(window.__navegacaoVerticalUnicaV5) return;
  window.__navegacaoVerticalUnicaV5=true;

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
  let sequenciaNavegacao=0;

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

  function scrollAtual(){
    return window.scrollY||window.pageYOffset||document.documentElement?.scrollTop||0;
  }

  function offsetPagina(id){
    const pagina=paginas.get(id);
    return pagina
      ? Math.max(0,pagina.getBoundingClientRect().top+scrollAtual()-alturaTopo())
      : 0;
  }

  function scrollImediato(destino){
    const topo=Math.max(0,Number(destino)||0);
    const raiz=document.documentElement;
    const anterior=raiz?.style?.scrollBehavior||"";
    try{
      if(raiz?.style) raiz.style.scrollBehavior="auto";
      window.scrollTo(0,topo);
    }catch(_erro){
      try{window.scrollTo({top:topo,behavior:"auto"});}catch(_erro2){}
    }finally{
      if(raiz?.style) raiz.style.scrollBehavior=anterior;
    }
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
    if(!paginas.has(id)) return 0;
    const destino=offsetPagina(id);
    const reduzir=typeof window.matchMedia==="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const legado=window.SHINOBI_LEGACY_MODE===true;
    const usarSuave=suave!==false&&!reduzir&&!legado;

    if(!usarSuave){
      scrollImediato(destino);
      return destino;
    }

    try{window.scrollTo({top:destino,behavior:"smooth"});}
    catch(_erro){scrollImediato(destino);}
    return destino;
  }

  function finalizarNavegacao(id,token){
    if(token!==sequenciaNavegacao||!paginas.has(id)) return;
    if(timerClique!==null){clearTimeout(timerClique);timerClique=null;}

    /* O destino pode mudar alguns pixels enquanto imagens/cards terminam o
       layout. A correção final é imediata para que o botão sempre termine
       exatamente na seção solicitada, sem herdar o scroll intermediário. */
    const destino=offsetPagina(id);
    if(Math.abs(scrollAtual()-destino)>2) scrollImediato(destino);

    marcarAtiva(id,true);
    cliqueEmAndamento=false;
    agendarDeteccao();
  }

  function acompanharNavegacao(id,token,inicio,quadrosEstaveis=0){
    if(token!==sequenciaNavegacao||!cliqueEmAndamento||!paginas.has(id)) return;
    const erro=Math.abs(scrollAtual()-offsetPagina(id));
    const estaveis=erro<=2?quadrosEstaveis+1:0;
    const decorrido=Date.now()-inicio;

    if(estaveis>=2||decorrido>=1150){
      finalizarNavegacao(id,token);
      return;
    }

    requestAnimationFrame(()=>acompanharNavegacao(id,token,inicio,estaveis));
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

    const token=++sequenciaNavegacao;
    cliqueEmAndamento=true;
    if(timerClique!==null){clearTimeout(timerClique);timerClique=null;}

    let resultado;
    if(typeof abrirAnterior==="function"){
      resultado=abrirAnterior.apply(this,arguments);
      paginaAtiva=id;
      atualizarIndice(id);
    }else{
      marcarAtiva(id,true);
    }

    /* Dois frames garantem que tamanhos responsivos e conteúdo retrátil já
       estejam medidos antes de calcular o destino da barra inferior. */
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(token!==sequenciaNavegacao) return;
      marcarAtiva(id,true);
      rolar(id,true);
      const inicio=Date.now();
      acompanharNavegacao(id,token,inicio,0);
      timerClique=setTimeout(()=>finalizarNavegacao(id,token),1250);
    }));

    return resultado;
  };

  function cancelarNavegacaoPorInteracao(evento){
    if(!cliqueEmAndamento) return;
    const alvo=evento?.target;
    if(alvo?.closest?.(".menu.bottomNav")) return;
    sequenciaNavegacao+=1;
    cliqueEmAndamento=false;
    if(timerClique!==null){clearTimeout(timerClique);timerClique=null;}
    agendarDeteccao();
  }

  function iniciar(){
    if(iniciada){
      atualizarReferencias();
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
  ["touchstart","pointerdown","wheel"].forEach(tipo=>{
    window.addEventListener(tipo,cancelarNavegacaoPorInteracao,{passive:true});
  });
  window.addEventListener("orientationchange",()=>{
    if(timerOrientacao!==null) clearTimeout(timerOrientacao);
    timerOrientacao=setTimeout(()=>{
      timerOrientacao=null;
      atualizarReferencias();
      agendarDeteccao();
    },180);
  },{passive:true});

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  }else{
    iniciar();
  }
  window.addEventListener("pageshow",()=>{
    atualizarReferencias();
    agendarDeteccao();
  });
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
