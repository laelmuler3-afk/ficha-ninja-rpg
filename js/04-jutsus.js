/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

/* ===== JUTSUS: ORGANIZAÇÃO, REORDENAÇÃO POR TOQUE E RESISTÊNCIAS ===== */
(function(){
  if(window.__jutsuOrganizacaoResistenciasV2) return;
  window.__jutsuOrganizacaoResistenciasV2 = true;

  const ELEMENTOS = [
    {id:'katon',  nome:'Katon',  icone:'🔥'},
    {id:'raiton', nome:'Raiton', icone:'⚡'},
    {id:'fuuton', nome:'Fuuton', icone:'🌪️'},
    {id:'suiton', nome:'Suiton', icone:'💧'},
    {id:'doton',  nome:'Doton',  icone:'🪨'},
    {id:'yin',    nome:'Yinton',icone:'🌑'},
    {id:'yang',   nome:'Youton',icone:'☀️'},
    {id:'neutro', nome:'Neutro',icone:'✨'}
  ];
  const ORDEM_ELEMENTOS = ELEMENTOS.map(item=>item.id);
  const LIMIAR_MOVIMENTO = 12;
  const TEMPO_TOQUE_LONGO = 2000;

  let timerToqueLongo = null;
  let sessaoMover = null;

  function salvarSomenteEstado(){
    if(typeof persistirSemRender === 'function'){
      persistirSemRender();
      return;
    }
    if(typeof persistirEstadoLocal === 'function'){
      persistirEstadoLocal();
      return;
    }
    if(typeof CHAVE !== 'undefined'){
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    }
  }

  function elementoNormalizado(jutsu){
    const elemento = String(jutsu?.elemento || 'neutro').trim().toLowerCase();
    return ORDEM_ELEMENTOS.includes(elemento) ? elemento : 'neutro';
  }

  function abrirIndicadorMover(texto){
    fecharIndicadorMover();
    const indicador = document.createElement('div');
    indicador.id = 'jutsuMoverIndicador';
    indicador.className = 'jutsuMoverIndicador';
    indicador.textContent = texto;
    document.body.appendChild(indicador);
  }

  function fecharIndicadorMover(){
    const indicador = document.getElementById('jutsuMoverIndicador');
    if(indicador) indicador.remove();
  }

  function limparMarcacoesMover(){
    document.body.classList.remove('reordenandoJutsu');
    document.querySelectorAll('#listaJutsus .jutsuMovendoAgora, #listaJutsus .jutsuDestinoMover').forEach(card=>{
      card.classList.remove('jutsuMovendoAgora','jutsuDestinoMover');
    });
    fecharIndicadorMover();
  }

  function reordenarJutsu(origem, destino){
    const lista = Array.isArray(estado.jutsus) ? estado.jutsus : [];
    if(origem === destino || origem < 0 || destino < 0 || origem >= lista.length || destino >= lista.length) return;

    const abertosAntes = lista.map((_, indice)=>Boolean(estado.jutsusAbertos && estado.jutsusAbertos[indice]));
    const [jutsuMovido] = lista.splice(origem, 1);
    const [abertoMovido] = abertosAntes.splice(origem, 1);

    lista.splice(destino, 0, jutsuMovido);
    abertosAntes.splice(destino, 0, abertoMovido);

    estado.jutsus = lista;
    estado.jutsusAbertos = {};
    abertosAntes.forEach((aberto, indice)=>{
      if(aberto) estado.jutsusAbertos[indice] = true;
    });

    salvarSomenteEstado();
    if(typeof renderizarJutsus === 'function') renderizarJutsus();
  }

  window.organizarJutsusPorElemento = function(){
    const lista = Array.isArray(estado.jutsus) ? estado.jutsus : [];
    if(lista.length < 2) return;

    estado.jutsus = lista
      .map((jutsu, indice)=>({jutsu, indice}))
      .sort((a, b)=>{
        const ordemA = ORDEM_ELEMENTOS.indexOf(elementoNormalizado(a.jutsu));
        const ordemB = ORDEM_ELEMENTOS.indexOf(elementoNormalizado(b.jutsu));
        return ordemA === ordemB ? a.indice - b.indice : ordemA - ordemB;
      })
      .map(item=>item.jutsu);

    estado.jutsusAbertos = {};
    salvarSomenteEstado();
    if(typeof renderizarJutsus === 'function') renderizarJutsus();
  };

  function iniciarMovimento(card, indice, pointerId){
    sessaoMover = {indice, pointerId, alvo: indice};
    document.body.classList.add('reordenandoJutsu');
    card.classList.add('jutsuMovendoAgora');
    abrirIndicadorMover('Mova a carta até a posição desejada e solte.');
    try{ navigator.vibrate && navigator.vibrate(22); }catch(err){}
  }

  function atualizarAlvoMover(x, y){
    if(!sessaoMover) return;

    const alvo = document.elementFromPoint(x, y)?.closest?.('#listaJutsus .jutsuListaCard');
    document.querySelectorAll('#listaJutsus .jutsuDestinoMover').forEach(card=>card.classList.remove('jutsuDestinoMover'));

    if(!alvo) return;
    const indice = Number(alvo.dataset.jutsuIndex);
    if(!Number.isInteger(indice)) return;

    sessaoMover.alvo = indice;
    if(indice !== sessaoMover.indice) alvo.classList.add('jutsuDestinoMover');
  }

  function finalizarMovimento(){
    if(!sessaoMover) return;

    const {indice, alvo} = sessaoMover;
    sessaoMover = null;
    limparMarcacoesMover();

    if(Number.isInteger(indice) && Number.isInteger(alvo) && indice !== alvo){
      reordenarJutsu(indice, alvo);
    }
  }

  function configurarToqueLongo(card, indice){
    if(card.dataset.toqueLongoConfigurado === '1') return;
    card.dataset.toqueLongoConfigurado = '1';

    const areaToque = card.querySelector('.jutsuLinhaResumo');
    if(!areaToque) return;

    let inicioX = 0;
    let inicioY = 0;
    let pointerAtivo = null;
    let toqueLongoDisparado = false;

    const cancelarTimer = ()=>{
      if(timerToqueLongo){
        clearTimeout(timerToqueLongo);
        timerToqueLongo = null;
      }
    };

    areaToque.addEventListener('pointerdown', function(evento){
      if(evento.pointerType === 'mouse' && evento.button !== 0) return;
      if(sessaoMover) return;

      inicioX = evento.clientX;
      inicioY = evento.clientY;
      pointerAtivo = evento.pointerId;
      toqueLongoDisparado = false;
      card.dataset.bloquearClique = '0';

      try{ areaToque.setPointerCapture(pointerAtivo); }catch(err){}

      cancelarTimer();
      timerToqueLongo = setTimeout(()=>{
        timerToqueLongo = null;
        if(pointerAtivo !== null){
          toqueLongoDisparado = true;
          card.dataset.bloquearClique = '1';
          iniciarMovimento(card, indice, pointerAtivo);
        }
      }, TEMPO_TOQUE_LONGO);
    });

    areaToque.addEventListener('pointermove', function(evento){
      if(pointerAtivo !== evento.pointerId) return;

      if(!toqueLongoDisparado){
        const distancia = Math.hypot(evento.clientX - inicioX, evento.clientY - inicioY);
        if(distancia > LIMIAR_MOVIMENTO) cancelarTimer();
        return;
      }

      evento.preventDefault();
      atualizarAlvoMover(evento.clientX, evento.clientY);
    }, {passive:false});

    const encerrarToque = function(evento){
      if(pointerAtivo !== null && (!evento || evento.pointerId === pointerAtivo)){
        cancelarTimer();
        if(toqueLongoDisparado){
          if(evento) evento.preventDefault();
          finalizarMovimento();
        }
        try{ areaToque.releasePointerCapture(pointerAtivo); }catch(err){}
        pointerAtivo = null;
      }
    };

    areaToque.addEventListener('pointerup', encerrarToque, {passive:false});
    areaToque.addEventListener('pointercancel', encerrarToque, {passive:false});

    /* Impede que o toque longo também abra/feche a carta ao soltar. */
    areaToque.addEventListener('click', function(evento){
      if(card.dataset.bloquearClique !== '1') return;
      card.dataset.bloquearClique = '0';
      evento.preventDefault();
      evento.stopImmediatePropagation();
    }, true);
  }

  function inserirBarraOrganizacao(){
    const lista = document.getElementById('listaJutsus');
    if(!lista || document.getElementById('jutsuOrganizacaoBarra')) return;

    const barra = document.createElement('div');
    barra.id = 'jutsuOrganizacaoBarra';
    barra.className = 'jutsuOrganizacaoBarra';
    barra.innerHTML = `
      <button type="button" class="btn jutsuOrganizarBtn" onclick="organizarJutsusPorElemento()">Organizar por elemento</button>
      <span class="jutsuOrganizacaoDica">Segure uma carta por 2 segundos e arraste para mudar a posição.</span>
    `;

    lista.parentNode.insertBefore(barra, lista);
  }

  function prepararJutsus(){
    inserirBarraOrganizacao();
    const lista = document.getElementById('listaJutsus');
    if(!lista) return;

    Array.from(lista.querySelectorAll('.jutsuListaCard')).forEach((card, indice)=>{
      card.dataset.jutsuIndex = String(indice);
      /* Reordenação antiga desativada; a versão V3 usa listener delegado. */
    });
  }

  function normalizarResistencias(){
    const atual = estado.resistenciasBatalha;
    if(atual && !Array.isArray(atual) && atual.elementos && Array.isArray(atual.extras)) return atual;

    const novo = {elementos:{}, extras:[]};
    if(Array.isArray(atual)){
      atual.forEach(valor=>{
        const id = String(valor || '').trim().toLowerCase();
        if(ORDEM_ELEMENTOS.includes(id)) novo.elementos[id] = true;
        else if(valor) novo.extras.push({id:'extra_'+Date.now()+'_'+novo.extras.length, nome:String(valor)});
      });
    }

    estado.resistenciasBatalha = novo;
    return novo;
  }

  function textoResistenciasAtivas(){
    const resistencias = normalizarResistencias();
    const elementosAtivos = ELEMENTOS
      .filter(item=>resistencias.elementos[item.id])
      .map(item=>item.nome);
    const extras = resistencias.extras.map(item=>item.nome);
    const todas = elementosAtivos.concat(extras);

    return todas.length ? 'Resistências ativas: ' + todas.join(', ') : 'Nenhuma resistência adicionada.';
  }

  window.alternarResistenciaBatalha = function(id){
    const resistencias = normalizarResistencias();
    if(!ORDEM_ELEMENTOS.includes(id)) return;

    resistencias.elementos[id] = !resistencias.elementos[id];
    salvarSomenteEstado();
    renderizarResistenciasBatalha();
  };

  window.adicionarResistenciaBatalha = function(){
    const nome = prompt('Qual resistência você quer adicionar?');
    if(nome === null) return;

    const valor = nome.trim();
    if(!valor) return;

    const resistencias = normalizarResistencias();
    const jaExiste = resistencias.extras.some(item=>item.nome.toLowerCase() === valor.toLowerCase());
    if(jaExiste){
      alert('Essa resistência já foi adicionada.');
      return;
    }

    resistencias.extras.push({
      id:'extra_'+Date.now()+'_'+Math.random().toString(16).slice(2),
      nome:valor
    });

    salvarSomenteEstado();
    renderizarResistenciasBatalha();
  };

  window.removerResistenciaBatalha = function(id){
    const resistencias = normalizarResistencias();
    resistencias.extras = resistencias.extras.filter(item=>item.id !== id);
    salvarSomenteEstado();
    renderizarResistenciasBatalha();
  };

  function renderizarResistenciasBatalha(){
    const containerPai = document.querySelector('#batalha .modificadoresBatalha');
    if(!containerPai) return;

    let painel = document.getElementById('resistenciasBatalhaPainel');
    if(!painel){
      painel = document.createElement('div');
      painel.id = 'resistenciasBatalhaPainel';
      painel.className = 'resistenciasBatalhaPainel';

      const bonusAtributos = containerPai.querySelector('.bonusAtributosBatalha');
      if(bonusAtributos) containerPai.insertBefore(painel, bonusAtributos);
      else containerPai.appendChild(painel);
    }

    const resistencias = normalizarResistencias();

    painel.innerHTML = `
      <h3>Resistências</h3>
      <p class="resistenciasBatalhaAjuda">Toque em um elemento para ativar ou retirar a resistência.</p>
      <div class="resistenciasBatalhaGrid">
        ${ELEMENTOS.map(item=>{
          const ativa = resistencias.elementos[item.id] ? ' ativa' : '';
          return `<button type="button" class="resistenciaBatalhaChip${ativa}" onclick="alternarResistenciaBatalha('${item.id}')">${item.icone} ${item.nome}</button>`;
        }).join('')}
      </div>
      ${resistencias.extras.length ? `
        <div class="resistenciasExtras">
          ${resistencias.extras.map(item=>`
            <span class="resistenciaExtra">${item.nome}<button type="button" aria-label="Remover ${item.nome}" onclick="removerResistenciaBatalha('${item.id}')">×</button></span>
          `).join('')}
        </div>
      ` : ''}
      <button type="button" class="btn btnAdicionarResistencia" onclick="adicionarResistenciaBatalha()">+ Adicionar outra resistência</button>
      <p class="resistenciaResumoAtiva">${textoResistenciasAtivas()}</p>
    `;
  }

  /* A versão existente continua sendo a responsável por criar as cartas.
     Este envoltório só adiciona os controles depois que ela termina. */
  const renderizarJutsusOriginal = window.renderizarJutsus;
  if(typeof renderizarJutsusOriginal === 'function'){
    window.renderizarJutsus = function(){
      const resultado = renderizarJutsusOriginal.apply(this, arguments);
      prepararJutsus();
      return resultado;
    };
  }

  const abrirPaginaOriginal = window.abrirPagina;
  if(typeof abrirPaginaOriginal === 'function'){
    window.abrirPagina = function(id, botao){
      const resultado = abrirPaginaOriginal.apply(this, arguments);
      if(id === 'jutsus') setTimeout(prepararJutsus, 0);
      return resultado;
    };
  }

  function iniciarRecursos(){
    prepararJutsus();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', iniciarRecursos, {once:true});
  }else{
    iniciarRecursos();
  }
})();

/* Resistências V2 removidas: Resistências Persistentes V3 é a versão ativa. */

/* ===== BÔNUS MÚLTIPLOS NO MESMO BOTÃO + MOVER JUTSUS V2 ===== */
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

 function baseDoAlvo(id){
   garantirBasesBonus();
   return num(estado.bonusBaseValores[id]??valorEstadoOuCampo(id));
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
 document.addEventListener("input",ev=>{
   if(aplicandoBonus||!ev.target||!ev.target.matches('#identidade input[data-save]:not(#bonusCA)'))return;
   const id=ev.target.dataset.save;
   if(!ALVOS[id]||id==="ca")return;
   const soma=num(somasBonus(normalizarListaBonus())[id]||0);
   estado.bonusBaseValores=estado.bonusBaseValores&&typeof estado.bonusBaseValores==="object"?estado.bonusBaseValores:{};
   estado.bonusBaseValores[id]=String(num(ev.target.value)-soma);
   estado[id]=estado.bonusBaseValores[id];
   setTimeout(()=>{salvarSeguro();aplicar()},90);
 });

 function iniciar(){
   garantirCard();
   aplicar();
 }

 if(typeof carregar==="function"&&!window.__carregarBonusV3){
   window.__carregarBonusV3=true;
   const carregarOriginal=carregar;
   window.carregar=function(){
     const r=carregarOriginal.apply(this,arguments);
     setTimeout(iniciar,120);
     return r;
   };
 }

 document.addEventListener("DOMContentLoaded",()=>setTimeout(iniciar,350));
 window.addEventListener("pageshow",()=>setTimeout(iniciar,350));

 /* Mover Jutsus V2 removido: Ajuste Mover Jutsu V3 é a versão ativa. */
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

  if(typeof renderizarJutsus === "function" && !window.__renderizarJutsusMoverV3){
    window.__renderizarJutsusMoverV3 = true;
    const base = renderizarJutsus;
    window.renderizarJutsus = function(){
      const r = base.apply(this, arguments);
      setTimeout(prepararMoverV3, 120);
      return r;
    };
  }

  document.addEventListener("DOMContentLoaded", ()=>setTimeout(prepararMoverV3, 500));
  window.addEventListener("pageshow", ()=>setTimeout(prepararMoverV3, 500));
})();
