/* Shinobi 1.10.0 — camada universal de efeitos de batalha. */
(function(){
  "use strict";
  if(window.__motorUniversalEfeitosV110) return;
  window.__motorUniversalEfeitosV110=true;

  const APLICACOES_USUARIO=new Set(["usuario","ataques_usuario","ataque_usuario","armas_usuario","jutsus_usuario"]);
  const CONDICOES=new Set(["caido","atordoado","paralisado","agarrado","impedido","sangrando","queimando","cego","surdo","amedrontado","inconsciente","exaustao","imobilizado"]);
  const TIPOS_RECURSO=new Set(["pv","pv_temporario","cura","cura_periodica","custo_periodico","dano_periodico","dano_programado"]);
  let frame=null;

  function numero(v,p=0){const n=Number(String(v??"").replace(",","."));return Number.isFinite(n)?n:p;}
  function normalizar(v){return String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}
  function escapar(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function sinal(v){const n=numero(v);return n>0?`+${n}`:String(n);}
  function ativos(){return typeof window.obterEfeitosJutsuBatalhaAtivos==="function"?window.obterEfeitosJutsuBatalhaAtivos():[];}
  function efeitosUsuario(){return ativos().flatMap(item=>(item.efeitos||[]).map(e=>({...e,__item:item}))).filter(e=>e.persistente!==false&&APLICACOES_USUARIO.has(String(e.aplicaEm||"usuario")));}
  function dadoValido(v){return /^\d+d\d+(?:\s*[+-]\s*\d+)?$/i.test(String(v||"").trim());}
  function somarDados(lista){return lista.map(String).filter(dadoValido).join(" + ");}

  function perfil(){
    const efs=efeitosUsuario();
    const p={numericos:{},multiplicadores:{},dados:{},vantagens:new Set(),desvantagens:new Set(),resistencias:new Set(),imunidades:new Set(),vulnerabilidades:new Set(),condicoes:new Set(),acoes:{},recursos:[],especiais:[]};
    for(const e of efs){
      const alvo=String(e.alvo||e.tipo||"efeito"); const op=String(e.operacao||""); const tipo=String(e.tipo||""); const valor=e.valor;
      if(op==="somar"&&Number.isFinite(Number(valor))) p.numericos[alvo]=numero(p.numericos[alvo])+numero(valor);
      else if(op==="subtrair"&&Number.isFinite(Number(valor))) p.numericos[alvo]=numero(p.numericos[alvo])-numero(valor);
      else if(op==="multiplicar"&&Number.isFinite(Number(valor))) p.multiplicadores[alvo]=numero(p.multiplicadores[alvo],1)*numero(valor,1);
      if(dadoValido(valor)) (p.dados[alvo]||(p.dados[alvo]=[])).push(String(valor));
      if(tipo.includes("vantagem")||op==="vantagem") p.vantagens.add(alvo);
      if(tipo==="desvantagem"||op==="desvantagem") p.desvantagens.add(alvo);
      if(tipo==="resistencia") p.resistencias.add(alvo);
      if(tipo.startsWith("imunidade")) p.imunidades.add(alvo);
      if(tipo==="vulnerabilidade") p.vulnerabilidades.add(alvo);
      if(tipo==="condicao"&&op==="adicionar") p.condicoes.add(alvo);
      if(tipo==="remover_condicao"||op==="remover") p.condicoes.delete(alvo);
      if(tipo==="acao_extra"||tipo==="acao"||["acao","acao_bonus","ataques_acao_bonus","ataques_desarmados"].includes(alvo)) p.acoes[alvo]=(p.acoes[alvo]||0)+(Number.isFinite(Number(valor))?numero(valor):1);
      if(TIPOS_RECURSO.has(tipo)) p.recursos.push(e);
      if(!Number.isFinite(Number(valor))&&!dadoValido(valor)&&!["vantagem","desvantagem","adicionar","remover"].includes(op)) p.especiais.push(e);
    }
    return p;
  }

  window.obterPerfilUniversalEfeitos=function(){const p=perfil();return {...p,vantagens:[...p.vantagens],desvantagens:[...p.desvantagens],resistencias:[...p.resistencias],imunidades:[...p.imunidades],vulnerabilidades:[...p.vulnerabilidades],condicoes:[...p.condicoes]};};
  window.obterBonusUniversal=function(alvo){return numero(perfil().numericos[String(alvo||"")]);};
  window.obterMultiplicadorUniversal=function(alvo){return numero(perfil().multiplicadores[String(alvo||"")],1);};
  window.obterDadosExtrasUniversal=function(alvo){return somarDados(perfil().dados[String(alvo||"")]||[]);};
  window.temVantagemUniversal=function(alvo){const p=perfil();return p.vantagens.has(alvo)&&!p.desvantagens.has(alvo);};
  window.temDesvantagemUniversal=function(alvo){const p=perfil();return p.desvantagens.has(alvo)&&!p.vantagens.has(alvo);};

  function rotulo(k){return String(k||"").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());}
  function chips(titulo,valores,classe=""){
    const arr=[...valores]; if(!arr.length)return "";
    return `<div class="motorUniversalGrupo ${classe}"><strong>${escapar(titulo)}</strong><div>${arr.map(v=>`<span>${escapar(rotulo(v))}</span>`).join("")}</div></div>`;
  }
  function mapaChips(titulo,mapa,format){const itens=Object.entries(mapa).filter(([,v])=>v&&v!==1);if(!itens.length)return"";return `<div class="motorUniversalGrupo"><strong>${escapar(titulo)}</strong><div>${itens.map(([k,v])=>`<span>${escapar(rotulo(k))} ${escapar(format(v))}</span>`).join("")}</div></div>`;}

  function render(){
    const host=document.getElementById("resistenciasBatalhaHost"); if(!host)return;
    let box=document.getElementById("motorUniversalResumo");
    if(!box){box=document.createElement("div");box.id="motorUniversalResumo";box.className="motorUniversalResumo";host.appendChild(box);}
    const p=perfil();
    const dados=Object.fromEntries(Object.entries(p.dados).map(([k,v])=>[k,somarDados(v)]));
    box.innerHTML=`<h3>Efeitos mecânicos ativos</h3>
      ${mapaChips("Bônus",p.numericos,sinal)}
      ${mapaChips("Multiplicadores",p.multiplicadores,v=>`×${v}`)}
      ${mapaChips("Dados extras",dados,v=>v)}
      ${mapaChips("Ações extras",p.acoes,v=>sinal(v))}
      ${chips("Vantagens",p.vantagens)}${chips("Desvantagens",p.desvantagens,"negativo")}
      ${chips("Resistências",p.resistencias)}${chips("Imunidades",p.imunidades)}${chips("Vulnerabilidades",p.vulnerabilidades,"negativo")}
      ${chips("Condições",p.condicoes,"negativo")}`;
    box.hidden=!box.querySelector(".motorUniversalGrupo");
  }

  function agendar(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=null;render();});}
  document.addEventListener("input",agendar,true);document.addEventListener("change",agendar,true);document.addEventListener("click",()=>setTimeout(agendar,0),true);
  document.addEventListener("DOMContentLoaded",()=>setTimeout(agendar,250));window.addEventListener("pageshow",()=>setTimeout(agendar,100));
  const original=window.aplicarEfeitosJutsuBatalha;
  if(typeof original==="function") window.aplicarEfeitosJutsuBatalha=async function(...args){const r=await original.apply(this,args);agendar();return r;};
  window.atualizarMotorUniversalEfeitos=agendar;
})();
