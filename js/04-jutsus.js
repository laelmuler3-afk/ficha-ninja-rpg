/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

/* Shinobi 1.3.4 — jutsus revisados e sem sistemas antigos duplicados. */

/* ===== JUTSUS: ORGANIZAÇÃO POR ELEMENTO ===== */
(function(){
  if(window.__jutsuOrganizacaoV3) return;
  window.__jutsuOrganizacaoV3 = true;

  const ORDEM_ELEMENTOS = [
    "katon",
    "raiton",
    "fuuton",
    "suiton",
    "doton",
    "yin",
    "yang",
    "neutro"
  ];

  function salvarOrganizacaoJutsus(){
    if(typeof persistirSemRender === "function"){
      persistirSemRender();
      return;
    }

    if(typeof persistirEstadoLocal === "function"){
      persistirEstadoLocal();
      return;
    }

    if(typeof CHAVE !== "undefined"){
      localStorage.setItem(
        CHAVE,
        JSON.stringify(estado)
      );
    }
  }

  function elementoNormalizado(jutsu){
    const elemento = String(
      jutsu?.elemento || "neutro"
    ).trim().toLowerCase();

    return ORDEM_ELEMENTOS.includes(elemento)
      ? elemento
      : "neutro";
  }

  window.organizarJutsusPorElemento = function(){
    const lista = Array.isArray(estado.jutsus)
      ? estado.jutsus
      : [];

    if(lista.length < 2) return;

    estado.jutsus = lista
      .map((jutsu, indice)=>({
        jutsu,
        indice
      }))
      .sort((a, b)=>{
        const ordemA = ORDEM_ELEMENTOS.indexOf(
          elementoNormalizado(a.jutsu)
        );

        const ordemB = ORDEM_ELEMENTOS.indexOf(
          elementoNormalizado(b.jutsu)
        );

        return ordemA === ordemB
          ? a.indice - b.indice
          : ordemA - ordemB;
      })
      .map(item=>item.jutsu);

    estado.jutsusAbertos = {};
    salvarOrganizacaoJutsus();

    if(typeof renderizarJutsus === "function"){
      renderizarJutsus();
    }
  };

  function inserirBarraOrganizacao(){
    const lista = document.getElementById(
      "listaJutsus"
    );

    if(
      !lista ||
      document.getElementById(
        "jutsuOrganizacaoBarra"
      )
    ){
      return;
    }

    const barra = document.createElement("div");
    barra.id = "jutsuOrganizacaoBarra";
    barra.className = "jutsuOrganizacaoBarra";

    barra.innerHTML = `
      <button
        type="button"
        class="btn jutsuOrganizarBtn"
        onclick="organizarJutsusPorElemento()"
      >
        Organizar por elemento
      </button>

      <span class="jutsuOrganizacaoDica">
        Segure uma carta e arraste para mudar a posição.
      </span>
    `;

    lista.parentNode.insertBefore(barra, lista);
  }

  const renderizarJutsusBaseOrganizacao =
    window.renderizarJutsus;

  if(typeof renderizarJutsusBaseOrganizacao === "function"){
    window.renderizarJutsus = function(){
      const resultado =
        renderizarJutsusBaseOrganizacao.apply(
          this,
          arguments
        );

      inserirBarraOrganizacao();
      return resultado;
    };
  }

  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      inserirBarraOrganizacao,
      {once:true}
    );
  }else{
    inserirBarraOrganizacao();
  }
})();

/* ===== BÔNUS MÚLTIPLOS NO MESMO BOTÃO ===== */
(function(){
 if(window.__bonusMultiMoverV3)return; window.__bonusMultiMoverV3=true;

 const ALVOS={
   ca:{label:"CA",selector:'#campoCA,[data-save="ca"]'},
   cd:{label:"CD",selector:'[data-save="cd"]'},
   proficiencia:{label:"Prof.",selector:'#bonusProficiencia,[data-save="proficiencia"]'},
   velocidade:{label:"Vel.",selector:'[data-save="velocidade"]'},
   iniciativa:{label:"Inic.",selector:'[data-save="iniciativa"]'},
   forca:{label:"FOR",selector:'[data-save="forca"]'},
   destreza:{label:"DES",selector:'[data-save="destreza"]'},
   constituicao:{label:"CON",selector:'[data-save="constituicao"]'},
   inteligencia:{label:"INT",selector:'[data-save="inteligencia"]'},
   sabedoria:{label:"SAB",selector:'[data-save="sabedoria"]'},
   carisma:{label:"CAR",selector:'[data-save="carisma"]'}
 };
 const ORDEM=["ca","cd","proficiencia","velocidade","iniciativa","forca","destreza","constituicao","inteligencia","sabedoria","carisma"];
 const num=v=>{const n=parseInt(String(v??"0").replace(",","."),10);return Number.isFinite(n)?n:0};
 let aplicandoBonus=false;
 let migracaoAlterouEstado=false;

 function salvarSeguro(){
   try{
     if(typeof persistirSemRender==="function")persistirSemRender();
     else if(typeof persistirEstadoLocal==="function")persistirEstadoLocal();
     else if(typeof CHAVE!=="undefined")localStorage.setItem(CHAVE,JSON.stringify(estado));
   }catch(e){console.warn("Não foi possível salvar os bônus.",e)}
 }

 function somasBonus(lista){
   const somas={};
   lista.forEach(b=>{
     if(!b||!ALVOS[b.alvo])return;
     const valor=num(b.valor);
     if(valor)somas[b.alvo]=(somas[b.alvo]||0)+valor;
   });
   return somas;
 }

 function normalizarListaBonus(){
   estado.bonusAtivos=Array.isArray(estado.bonusAtivos)?estado.bonusAtivos:[];

   // Migração única do sistema antigo, sem duplicar bônus a cada abertura.
   if(!estado.bonusMigracaoV3Concluida){
     const alvoAntigo=String(estado.bonusGeralAlvo||"");
     const valorAntigo=num(estado.bonusGeralValor);
     if(alvoAntigo&&ALVOS[alvoAntigo]&&valorAntigo){
       const jaExiste=estado.bonusAtivos.some(b=>b&&b.alvo===alvoAntigo&&num(b.valor)===valorAntigo);
       if(!jaExiste)estado.bonusAtivos.push({nome:"Bônus",alvo:alvoAntigo,valor:valorAntigo});
     }

     const bonusCAAntigo=num(estado.bonusCA||0);
     if(bonusCAAntigo){
       const jaExisteCA=estado.bonusAtivos.some(b=>b&&b.alvo==="ca"&&num(b.valor)===bonusCAAntigo);
       if(!jaExisteCA)estado.bonusAtivos.push({nome:"Bônus CA",alvo:"ca",valor:bonusCAAntigo});
     }

     estado.bonusGeralAlvo="";
     estado.bonusGeralValor="0";
     estado.bonusCA="0";
     estado.bonusMigracaoV3Concluida=true;
     migracaoAlterouEstado=true;
   }

   // Elimina duplicatas exatas criadas pelas versões anteriores.
   const vistos=new Set();
   estado.bonusAtivos=estado.bonusAtivos.filter(b=>{
     if(!b||!ALVOS[b.alvo]||!num(b.valor))return false;
     const chave=[String(b.nome||"Bônus").trim(),b.alvo,num(b.valor)].join("|");
     if(vistos.has(chave)){migracaoAlterouEstado=true;return false}
     vistos.add(chave);
     b.nome=String(b.nome||"Bônus").trim()||"Bônus";
     b.valor=num(b.valor);
     return true;
   });

   return estado.bonusAtivos;
 }

 function valorEstadoOuCampo(id){
   if(estado[id]!==undefined&&estado[id]!==null&&estado[id]!=="")return num(estado[id]);
   const el=document.querySelector(ALVOS[id]?.selector||"");
   return num(el?.value||0);
 }

 function garantirBasesBonus(){
   const lista=normalizarListaBonus();
   const somas=somasBonus(lista);
   estado.bonusBaseValores=estado.bonusBaseValores&&typeof estado.bonusBaseValores==="object"?estado.bonusBaseValores:{};

   const VERSAO_BASE_BONUS=4;
   const migrando=num(estado.bonusBaseVersao||0)<VERSAO_BASE_BONUS;

   ORDEM.forEach(id=>{
     if(id==="ca")return;

     const temBase=Object.prototype.hasOwnProperty.call(estado.bonusBaseValores,id)
       && estado.bonusBaseValores[id]!==null
       && estado.bonusBaseValores[id]!=="";
     const bonus=num(somas[id]||0);
     let base=temBase?num(estado.bonusBaseValores[id]):valorEstadoOuCampo(id);

     if(migrando&&bonus>0){
       // A versão anterior podia subtrair o bônus de um valor que já era a base.
       // Ex.: base 4 com bônus +5 virava -1 e aparecia como 4. Recupera 4.
       if(temBase&&base<0){
         base=base+bonus;
       }

       // Recupera o acúmulo legado observado na iniciativa: 14, 19, 24... com +5.
       if(!temBase&&id==="iniciativa"&&bonus===5&&base>=14){
         const resto=((base%5)+5)%5;
         base=resto===0?5:resto;
       }
     }

     const baseTexto=String(base);
     if(!temBase||String(estado.bonusBaseValores[id])!==baseTexto||String(estado[id]??"")!==baseTexto){
       estado.bonusBaseValores[id]=baseTexto;
       estado[id]=baseTexto;
       migracaoAlterouEstado=true;
     }
   });

   if(migrando){
     estado.bonusBaseVersao=VERSAO_BASE_BONUS;
     migracaoAlterouEstado=true;
   }

   return somas;
 }


 function cardResumo(){
   const card=document.getElementById("bonusGeralCard");
   const res=document.getElementById("bonusGeralResumo");
   if(!card||!res)return;
   const lista=normalizarListaBonus();
   const total=lista.reduce((a,b)=>a+num(b.valor),0);
   card.classList.toggle("ativo",lista.length>0);
   if(!lista.length){res.innerHTML="Definir";return}
   if(lista.length===1){
     const b=lista[0],v=num(b.valor),al=ALVOS[b.alvo].label;
     res.innerHTML=`${al} ${v>0?"+":""}${v}<small>${b.nome||"Bônus ativo"}</small>`;
     return;
   }
   res.innerHTML=`${lista.length} bônus<small>${total>0?"+":""}${total} total</small>`;
 }

 function limparDestaques(){
   document.querySelectorAll("#identidade .bonusAplicadoAoAlvo").forEach(el=>el.classList.remove("bonusAplicadoAoAlvo"));
 }

 function aplicar(){
   if(aplicandoBonus)return;
   aplicandoBonus=true;
   try{
     normalizarListaBonus();
     const somas=garantirBasesBonus();
     const bases={};
     limparDestaques();

     // O estado mantém somente a base. A soma existe apenas na apresentação.
     ORDEM.forEach(id=>{
       if(id==="ca")return;
       const base=num(estado.bonusBaseValores[id]??valorEstadoOuCampo(id));
       bases[id]=base;
       estado[id]=String(base);
       const el=document.querySelector(ALVOS[id].selector);
       if(el)el.value=String(base+num(somas[id]||0));
     });

     // O bônus de CA continua no campo oculto usado pelo cálculo automático.
     const campoBonusCA=document.getElementById("bonusCA")||document.querySelector('[data-save="bonusCA"]');
     if(campoBonusCA)campoBonusCA.value=String(somas.ca||0);

     Object.entries(somas).forEach(([id,valor])=>{
       if(!valor)return;
       if(id==="ca"){
         document.getElementById("campoCA")?.closest("div")?.classList.add("bonusAplicadoAoAlvo");
         return;
       }
       const el=document.querySelector(ALVOS[id]?.selector||"");
       el?.closest("div")?.classList.add("bonusAplicadoAoAlvo");
     });

     if(typeof atualizarCAAutomatica==="function")atualizarCAAutomatica();
     if(typeof atualizarHUD==="function")atualizarHUD();
     if(typeof atualizarPlacar==="function")atualizarPlacar();
     if(typeof atualizarModificadoresBatalha==="function")atualizarModificadoresBatalha();
     if(typeof atualizarDefesasTotaisBatalha==="function")atualizarDefesasTotaisBatalha();

     // Algumas rotinas de atualização leem o estado-base. Reafirma o total visual
     // depois delas para impedir que tablet/celular volte a mostrar apenas a base.
     ORDEM.forEach(id=>{
       if(id==="ca")return;
       const el=document.querySelector(ALVOS[id].selector);
       if(el)el.value=String(num(bases[id])+num(somas[id]||0));
     });

     cardResumo();

     if(migracaoAlterouEstado){
       migracaoAlterouEstado=false;
       salvarSeguro();
     }
   }finally{
     aplicandoBonus=false;
   }
 }

 function norm(x){
   x=String(x||"").trim().toLowerCase();
   return {"inic":"iniciativa","iniciativa":"iniciativa","prof":"proficiencia","prof.":"proficiencia","proficiência":"proficiencia","proficiencia":"proficiencia","vel":"velocidade","velocidade":"velocidade","ca":"ca","cd":"cd","for":"forca","força":"forca","forca":"forca","des":"destreza","destreza":"destreza","con":"constituicao","constituição":"constituicao","constituicao":"constituicao","int":"inteligencia","inteligência":"inteligencia","inteligencia":"inteligencia","sab":"sabedoria","sabedoria":"sabedoria","car":"carisma","carisma":"carisma"}[x]||x;
 }
 function textoAlvos(){return ORDEM.map(id=>`${id} = ${ALVOS[id].label}`).join("\n")}

 function addBonus(){
   garantirBasesBonus();
   const nome=prompt("Nome/origem do bônus. Ex: Modo Sábio, item, jutsu:","Bônus"); if(nome===null)return;
   let alvo=prompt("Onde aplicar?\n\n"+textoAlvos()+"\n\nDigite a opção:","iniciativa"); if(alvo===null)return;
   alvo=norm(alvo);
   if(!ALVOS[alvo]){alert("Opção não encontrada. Use iniciativa, CA, CD, FOR, DES, CON, INT, SAB ou CAR.");return}
   const vt=prompt("Valor do bônus. Ex: 5 ou -2:","1"); if(vt===null)return;
   const valor=num(vt); if(!valor){alert("Digite um valor diferente de zero.");return}
   normalizarListaBonus().push({nome:String(nome||"Bônus").trim()||"Bônus",alvo,valor});
   salvarSeguro();
   aplicar();
 }

 function verBonus(){
   const lista=normalizarListaBonus();
   if(!lista.length){alert("Nenhum bônus ativo.");return}
   alert("Bônus ativos:\n\n"+lista.map((b,i)=>`${i+1}. ${b.nome||"Bônus"} — ${ALVOS[b.alvo]?.label||b.alvo} ${num(b.valor)>0?"+":""}${num(b.valor)}`).join("\n"));
 }

 function removerBonus(){
   const lista=normalizarListaBonus();
   if(!lista.length){alert("Nenhum bônus ativo para remover.");return}
   const texto=lista.map((b,i)=>`${i+1}. ${b.nome||"Bônus"} — ${ALVOS[b.alvo]?.label||b.alvo} ${num(b.valor)>0?"+":""}${num(b.valor)}`).join("\n");
   const esc=prompt("Qual bônus remover?\n\n"+texto+"\n\nDigite o número:","1"); if(esc===null)return;
   const idx=parseInt(esc,10)-1;
   if(idx<0||idx>=lista.length){alert("Número inválido.");return}
   lista.splice(idx,1);
   salvarSeguro();
   aplicar();
 }

 window.editarBonusGeralPerfil=function(){
   const e=prompt("Bônus ativos\n\n1 = Adicionar bônus\n2 = Ver bônus ativos\n3 = Remover bônus\n4 = Limpar todos\n\nDigite uma opção:","1");
   if(e===null)return;
   if(e==="1")addBonus();
   else if(e==="2")verBonus();
   else if(e==="3")removerBonus();
   else if(e==="4"&&confirm("Remover todos os bônus ativos?")){
     estado.bonusAtivos=[];
     estado.bonusCA="0";
     salvarSeguro();
     aplicar();
   }else if(e!=="4")alert("Opção inválida.");
 };

 function garantirCard(){
   const antigo=document.querySelector("#identidade .bonusCaCard");
   if(!antigo)return;
   antigo.id="bonusGeralCard";
   antigo.classList.add("bonusGeralCard");
   antigo.setAttribute("onclick","editarBonusGeralPerfil()");
   if(!document.getElementById("bonusGeralResumo")){
     antigo.innerHTML='<label>Bônus</label><div id="bonusGeralResumo" class="bonusGeralResumo">Definir</div><input id="bonusCA" data-save="bonusCA" type="hidden" value="0">';
   }
 }

 // Impede que o salvar geral grave o valor visual já somado como novo valor-base.
 if(typeof sincronizarEstadoDosCampos==="function"&&!window.__sincronizarCamposBonusV3){
   window.__sincronizarCamposBonusV3=true;
   const sincronizarOriginal=sincronizarEstadoDosCampos;
   window.sincronizarEstadoDosCampos=function(){
     const trocas=[];
     if(estado.bonusBaseValores&&typeof estado.bonusBaseValores==="object"){
       ORDEM.forEach(id=>{
         if(id==="ca")return;
         const el=document.querySelector(ALVOS[id].selector);
         if(!el||estado.bonusBaseValores[id]===undefined)return;
         trocas.push([el,el.value]);
         el.value=String(estado.bonusBaseValores[id]);
       });
     }
     try{
       const retorno=sincronizarOriginal.apply(this,arguments);
       if(estado.bonusBaseValores){
         ORDEM.forEach(id=>{
           if(id!=="ca"&&estado.bonusBaseValores[id]!==undefined)estado[id]=String(estado.bonusBaseValores[id]);
         });
       }
       return retorno;
     }finally{
       trocas.forEach(([el,valor])=>{el.value=valor});
     }
   };
 }

 // Ao editar manualmente um campo bonificado, considera o número digitado como total
 // visível e recalcula o valor-base uma única vez.
 let timerAplicarBonusCampo = null;

 document.addEventListener("input",ev=>{
   if(
     aplicandoBonus ||
     !ev.target ||
     !ev.target.matches(
       '#identidade input[data-save]:not(#bonusCA)'
     )
   ){
     return;
   }

   const id=ev.target.dataset.save;
   if(!ALVOS[id]||id==="ca")return;

   const soma=num(
     somasBonus(normalizarListaBonus())[id]||0
   );

   estado.bonusBaseValores=
     estado.bonusBaseValores &&
     typeof estado.bonusBaseValores==="object"
       ? estado.bonusBaseValores
       : {};

   estado.bonusBaseValores[id]=String(
     num(ev.target.value)-soma
   );

   estado[id]=estado.bonusBaseValores[id];

   if(timerAplicarBonusCampo){
     clearTimeout(timerAplicarBonusCampo);
   }

   timerAplicarBonusCampo=setTimeout(()=>{
     timerAplicarBonusCampo=null;
     salvarSeguro();
     aplicar();
   },100);
 });

 function iniciar(){
   garantirCard();
   aplicar();
 }

 let timerInicializacaoBonus = null;

 function agendarInicializacaoBonus(atraso=160){
   if(timerInicializacaoBonus){
     clearTimeout(timerInicializacaoBonus);
   }

   timerInicializacaoBonus=setTimeout(()=>{
     timerInicializacaoBonus=null;
     iniciar();
   },atraso);
 }

 if(typeof carregar==="function"&&!window.__carregarBonusV3){
   window.__carregarBonusV3=true;
   const carregarOriginal=carregar;

   window.carregar=function(){
     const r=carregarOriginal.apply(this,arguments);
     agendarInicializacaoBonus();
     return r;
   };
 }

 if(document.readyState==="loading"){
   document.addEventListener(
     "DOMContentLoaded",
     ()=>agendarInicializacaoBonus(),
     {once:true}
   );
 }else{
   agendarInicializacaoBonus();
 }

 window.addEventListener(
   "pageshow",
   ()=>agendarInicializacaoBonus()
 );

})();

/* ===== AJUSTE MOVER JUTSU V3: toque menor e não abre ao soltar ===== */
(function(){
  if(window.__ajusteMoverJutsuV3) return;
  window.__ajusteMoverJutsuV3 = true;

  let timer = null;
  let ativo = false;
  let origem = null;
  let alvo = null;
  let ghost = null;
  let bloquearProximoClick = false;
  let inicioX = 0;
  let inicioY = 0;

  function salvarMove(){
    try{
      if(typeof persistirSemRender === "function") persistirSemRender();
      else if(typeof salvar === "function") salvar();
      else if(typeof persistirEstadoLocal === "function") persistirEstadoLocal();
      else if(typeof CHAVE !== "undefined") localStorage.setItem(CHAVE, JSON.stringify(estado));
    }catch(e){ console.warn(e); }
  }

  function prepararMoverV3(){
    const lista = document.getElementById("listaJutsus");
    if(!lista || lista.dataset.moverTouchV3) return;

    lista.dataset.moverTouchV3 = "1";

    function atualizarIndices(){
      Array.from(lista.querySelectorAll(".jutsuListaCard")).forEach((card, i)=>{
        card.dataset.jutsuIndex = String(i);
      });
    }

    atualizarIndices();

    lista.addEventListener("pointerdown", function(ev){
      const resumo = ev.target.closest(".jutsuLinhaResumo");
      const card = ev.target.closest(".jutsuListaCard");
      if(!resumo || !card) return;

      atualizarIndices();

      const idx = Number(card.dataset.jutsuIndex);
      if(!Number.isInteger(idx)) return;

      inicioX = ev.clientX;
      inicioY = ev.clientY;
      clearTimeout(timer);

      timer = setTimeout(function(){
        ativo = true;
        bloquearProximoClick = true;
        origem = idx;
        alvo = idx;

        lista.classList.add("modoMoverJutsus");
        card.classList.add("jutsuPressionando");

        ghost = card.cloneNode(true);
        ghost.classList.add("jutsuGhostMover");
        ghost.style.left = ev.clientX + "px";
        ghost.style.top = ev.clientY + "px";
        document.body.appendChild(ghost);

        try{ card.setPointerCapture(ev.pointerId); }catch(e){}
      }, 1200);
    }, true);

    lista.addEventListener("pointermove", function(ev){
      if(!ativo){
        if(Math.abs(ev.clientX - inicioX) > 14 || Math.abs(ev.clientY - inicioY) > 14){
          clearTimeout(timer);
        }
        return;
      }

      ev.preventDefault();

      if(ghost){
        ghost.style.left = ev.clientX + "px";
        ghost.style.top = ev.clientY + "px";
      }

      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const card = el?.closest?.("#listaJutsus .jutsuListaCard");

      document.querySelectorAll(".jutsuDropAlvo").forEach(x=>x.classList.remove("jutsuDropAlvo"));

      if(card){
        alvo = Number(card.dataset.jutsuIndex);
        card.classList.add("jutsuDropAlvo");
      }
    }, {passive:false, capture:true});

    function finalizar(ev){
      clearTimeout(timer);

      if(!ativo) return;

      if(ev){
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation?.();
      }

      lista.classList.remove("modoMoverJutsus");

      document.querySelectorAll(".jutsuPressionando,.jutsuDropAlvo").forEach(x=>{
        x.classList.remove("jutsuPressionando","jutsuDropAlvo");
      });

      if(ghost){
        ghost.remove();
        ghost = null;
      }

      if(origem !== null && alvo !== null && origem !== alvo && estado.jutsus){
        const item = estado.jutsus.splice(origem, 1)[0];
        estado.jutsus.splice(alvo, 0, item);

        estado.jutsusAbertos = {};

        salvarMove();

        if(typeof renderizarJutsus === "function") renderizarJutsus();
      }

      setTimeout(function(){
        ativo = false;
        origem = null;
        alvo = null;
      }, 120);

      setTimeout(function(){
        bloquearProximoClick = false;
      }, 500);
    }

    lista.addEventListener("pointerup", finalizar, true);
    lista.addEventListener("pointercancel", finalizar, true);

    lista.addEventListener("click", function(ev){
      if(bloquearProximoClick){
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation?.();
        bloquearProximoClick = false;
      }
    }, true);
  }

  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      prepararMoverV3,
      {once:true}
    );
  }else{
    prepararMoverV3();
  }
})();
