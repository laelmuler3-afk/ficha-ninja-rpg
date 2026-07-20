/* Ficha Ninja 2.1.8 — aplicação inteligente de dano. */
(function(){
  "use strict";

  if(window.__danoInteligenteV218) return;
  window.__danoInteligenteV218 = true;

  const TIPOS = [
    {id:"fisico", nome:"Físico", icone:"⚔️"},
    {id:"taijutsu", nome:"Taijutsu", icone:"👊"},
    {id:"katon", nome:"Katon", icone:"🔥"},
    {id:"raiton", nome:"Raiton", icone:"⚡"},
    {id:"fuuton", nome:"Fuuton", icone:"🌪️"},
    {id:"suiton", nome:"Suiton", icone:"💧"},
    {id:"doton", nome:"Doton", icone:"🪨"},
    {id:"mokuton", nome:"Mokuton", icone:"🌱"},
    {id:"youton", nome:"Youton", icone:"☀️"},
    {id:"shoton", nome:"Shoton", icone:"💎"},
    {id:"neutro", nome:"Neutro", icone:"✨"},
    {id:"genjutsu", nome:"Genjutsu", icone:"👁️"},
    {id:"veneno", nome:"Veneno", icone:"☠️"},
    {id:"selamento", nome:"Selamento", icone:"🔒"},
    {id:"sangramento", nome:"Sangramento", icone:"🩸"},
    {id:"atordoamento", nome:"Atordoamento", icone:"😵"},
    {id:"eletrica", nome:"Elétrica", icone:"⚡"},
    {id:"outro", nome:"Outro / sem redução automática", icone:"◈"}
  ];

  const TIPO_POR_ID = new Map(TIPOS.map(tipo => [tipo.id, tipo]));

  function numeroInteiro(valor){
    const numero = Number(String(valor ?? "").replace(",", "."));
    return Number.isFinite(numero) ? Math.max(0, Math.floor(numero)) : 0;
  }

  function campo(id){
    return document.getElementById(id);
  }

  function obterResistenciasManuais(){
    try{
      const salvas = typeof estado !== "undefined" ? estado?.resistenciasEscolhidas : null;
      return salvas && typeof salvas === "object" && !Array.isArray(salvas) ? salvas : {};
    }catch(_erro){
      return {};
    }
  }

  function obterProtecoesAutomaticas(){
    try{
      const api = window.RegrasNaturezaShinobi;
      if(typeof api?.idsResistenciasAutomaticas !== "function"){
        return {resistencias:new Map(), imunidades:new Map()};
      }
      const resultado = api.idsResistenciasAutomaticas();
      return {
        resistencias:resultado?.resistencias instanceof Map ? resultado.resistencias : new Map(),
        imunidades:resultado?.imunidades instanceof Map ? resultado.imunidades : new Map()
      };
    }catch(erro){
      console.warn("Não foi possível consultar as proteções automáticas.", erro);
      return {resistencias:new Map(), imunidades:new Map()};
    }
  }

  function calcularDanoInteligente({danoBruto, tipoId, ignorarReducao=false}){
    const bruto = numeroInteiro(danoBruto);
    const tipo = TIPO_POR_ID.get(tipoId) || TIPO_POR_ID.get("outro");
    const manuais = obterResistenciasManuais();
    const automaticas = obterProtecoesAutomaticas();

    const temImunidade = tipo.id !== "outro" && automaticas.imunidades.has(tipo.id);
    const temResistenciaManual = tipo.id !== "outro" && Boolean(manuais[tipo.id]);
    const temResistenciaAutomatica = tipo.id !== "outro" && automaticas.resistencias.has(tipo.id);
    const temResistencia = temResistenciaManual || temResistenciaAutomatica;

    let danoFinal = bruto;
    let regra = "normal";
    let explicacao = "Nenhuma resistência identificada.";

    if(ignorarReducao){
      regra = "ignorado";
      explicacao = "A redução foi ignorada por decisão do mestre.";
    }else if(temImunidade){
      danoFinal = 0;
      regra = "imunidade";
      explicacao = `Imunidade a ${tipo.nome} identificada.`;
    }else if(temResistencia){
      danoFinal = Math.floor(bruto / 2);
      regra = "resistencia";
      explicacao = `Resistência a ${tipo.nome} identificada: metade do dano.`;
    }else if(tipo.id === "outro"){
      explicacao = "Tipo sem redução automática.";
    }

    return {
      bruto,
      danoFinal,
      tipo,
      regra,
      explicacao,
      temImunidade,
      temResistencia,
      origemResistencia:temResistenciaManual && temResistenciaAutomatica
        ? "manual e automática"
        : temResistenciaAutomatica
          ? "automática"
          : temResistenciaManual
            ? "manual"
            : ""
    };
  }

  function classeResultado(regra){
    if(regra === "imunidade") return "imunidade";
    if(regra === "resistencia") return "resistencia";
    if(regra === "ignorado") return "ignorado";
    return "normal";
  }

  function atualizarPreviaDano(){
    const previa = campo("danoInteligentePrevia");
    if(!previa) return null;

    const resultado = calcularDanoInteligente({
      danoBruto:campo("danoBatalha")?.value,
      tipoId:campo("tipoDanoBatalha")?.value || "fisico",
      ignorarReducao:Boolean(campo("ignorarReducaoDano")?.checked)
    });

    previa.className = `danoInteligentePrevia ${classeResultado(resultado.regra)}`;
    previa.innerHTML = `
      <div class="danoInteligentePreviaTopo">
        <span>${resultado.tipo.icone} ${resultado.tipo.nome}</span>
        <strong>${resultado.bruto} → ${resultado.danoFinal}</strong>
      </div>
      <p>${resultado.explicacao}</p>
      ${resultado.regra === "resistencia"
        ? `<small>${resultado.bruto} ÷ 2 = ${resultado.danoFinal} (arredondado para baixo)</small>`
        : ""}
    `;

    return resultado;
  }

  function detalheConfirmacao(resultado, pvAtual, pvDepois){
    const linhas = [
      `Tipo: ${resultado.tipo.nome}`,
      `Dano informado: ${resultado.bruto}`,
      resultado.explicacao,
      `Dano final: ${resultado.danoFinal}`,
      `PV atual: ${pvAtual}`,
      `PV após dano: ${pvDepois}`
    ];
    return linhas.join("\n");
  }

  async function aplicarDanoInteligente(){
    const resultado = atualizarPreviaDano() || calcularDanoInteligente({
      danoBruto:campo("danoBatalha")?.value,
      tipoId:campo("tipoDanoBatalha")?.value || "fisico",
      ignorarReducao:Boolean(campo("ignorarReducaoDano")?.checked)
    });

    if(resultado.bruto <= 0){
      if(typeof window.avisoShinobi === "function"){
        await window.avisoShinobi("Dano inválido", "Informe um valor de dano maior que zero.");
      }
      return;
    }

    const pv = campo("pv");
    const atual = numeroInteiro(pv?.value);
    const novo = Math.max(0, atual - resultado.danoFinal);

    const confirmar = typeof window.confirmarUsoAcao === "function"
      ? window.confirmarUsoAcao(
          "ação de batalha",
          "Aplicar dano",
          detalheConfirmacao(resultado, atual, novo)
        )
      : Promise.resolve(confirm(`${detalheConfirmacao(resultado, atual, novo)}\n\nAplicar este dano?`));

    const ok = await confirmar;
    if(!ok) return;

    if(pv) pv.value = String(novo);
    if(typeof window.salvar === "function") window.salvar();

    const sufixo = resultado.regra === "resistencia"
      ? " (resistência)"
      : resultado.regra === "imunidade"
        ? " (imunidade)"
        : resultado.regra === "ignorado"
          ? " (redução ignorada)"
          : "";

    const mensagemLog = `Dano ${resultado.tipo.nome}: ${resultado.bruto} → ${resultado.danoFinal}${sufixo}`;
    if(typeof window.log === "function") window.log(mensagemLog);
    else if(typeof window.registrarLog === "function") window.registrarLog(mensagemLog);

    if(typeof window.atualizarPainelBatalhaVivo === "function"){
      window.atualizarPainelBatalhaVivo();
    }
    if(typeof window.fecharAcaoBatalha === "function") window.fecharAcaoBatalha();
  }

  function prepararFormulario(){
    const select = campo("tipoDanoBatalha");
    if(select && !select.dataset.preenchido){
      select.innerHTML = TIPOS.map(tipo =>
        `<option value="${tipo.id}">${tipo.icone} ${tipo.nome}</option>`
      ).join("");
      select.value = "fisico";
      select.dataset.preenchido = "1";
    }
    atualizarPreviaDano();
  }

  const abrirAcaoBase = typeof window.abrirAcaoBatalha === "function"
    ? window.abrirAcaoBatalha
    : null;

  if(abrirAcaoBase){
    window.abrirAcaoBatalha = function(tipo){
      const resultado = abrirAcaoBase.apply(this, arguments);
      if(tipo === "dano") requestAnimationFrame(prepararFormulario);
      return resultado;
    };
  }

  document.addEventListener("input", evento => {
    if(evento.target?.matches("#danoBatalha, #ignorarReducaoDano")) atualizarPreviaDano();
  }, true);

  document.addEventListener("change", evento => {
    if(evento.target?.matches("#tipoDanoBatalha, #ignorarReducaoDano")) atualizarPreviaDano();
  }, true);

  function iniciar(){
    prepararFormulario();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", iniciar, {once:true});
  }else{
    iniciar();
  }
  window.addEventListener("pageshow", prepararFormulario);

  window.aplicarDano = aplicarDanoInteligente;
  try{ aplicarDano = aplicarDanoInteligente; }catch(_erro){}
  window.atualizarPreviaDano = atualizarPreviaDano;
  window.DanoInteligenteShinobi = {
    versao:"2.1.8",
    tipos:TIPOS.map(tipo => ({...tipo})),
    calcular:calcularDanoInteligente,
    atualizarPrevia:atualizarPreviaDano
  };
})();
