/* Ficha Ninja 2.1.2 — testes de resistência no padrão d20/D&D. */
(function(){
  "use strict";

  if(window.__testesResistenciaBatalhaV212) return;
  window.__testesResistenciaBatalhaV212 = true;

  const ATRIBUTOS = [
    {chave:"forca", sigla:"FOR", nome:"Força", prof:"save_forca_prof", view:"saveForcaView", estado:"saveForcaEstado", detalhe:"saveForcaDetalhe"},
    {chave:"destreza", sigla:"DES", nome:"Destreza", prof:"save_destreza_prof", view:"saveDestrezaView", estado:"saveDestrezaEstado", detalhe:"saveDestrezaDetalhe"},
    {chave:"constituicao", sigla:"CON", nome:"Constituição", prof:"save_constituicao_prof", view:"saveConstituicaoView", estado:"saveConstituicaoEstado", detalhe:"saveConstituicaoDetalhe"},
    {chave:"inteligencia", sigla:"INT", nome:"Inteligência", prof:"save_inteligencia_prof", view:"saveInteligenciaView", estado:"saveInteligenciaEstado", detalhe:"saveInteligenciaDetalhe"},
    {chave:"sabedoria", sigla:"SAB", nome:"Sabedoria", prof:"save_sabedoria_prof", view:"saveSabedoriaView", estado:"saveSabedoriaEstado", detalhe:"saveSabedoriaDetalhe"},
    {chave:"carisma", sigla:"CAR", nome:"Carisma", prof:"save_carisma_prof", view:"saveCarismaView", estado:"saveCarismaEstado", detalhe:"saveCarismaDetalhe"}
  ];

  let frame = null;
  let observador = null;

  function numero(valor, padrao=0){
    const convertido = Number(String(valor ?? "").replace(",","."));
    return Number.isFinite(convertido) ? convertido : padrao;
  }

  function campoSalvo(chave){
    return document.querySelector(`[data-save="${chave}"]`);
  }

  function comSinal(valor){
    const n = numero(valor,0);
    return n >= 0 ? `+${n}` : String(n);
  }

  function modificadorPontuacao(pontuacao){
    const valor = numero(pontuacao,0);
    if(valor <= 0) return 0;
    if(typeof window.calcularModificador === "function") return numero(window.calcularModificador(valor),0);
    return Math.floor((valor - 10) / 2);
  }

  function bonusManualAtributo(chave){
    return numero(document.querySelector(`[data-bonus-batalha="${chave}"]`)?.value,0);
  }

  function bonusModificadorJutsu(chave){
    return numero(window.obterBonusEfeitosJutsuBatalha?.(`mod_${chave}`),0);
  }

  function bonusEspecificoTeste(chave){
    if(typeof window.obterBonusUniversal !== "function") return 0;
    const alvos = [
      `tr_${chave}`,
      `save_${chave}`,
      `teste_resistencia_${chave}`,
      `resistencia_${chave}`,
      "tr_geral",
      "teste_resistencia",
      "testes_resistencia",
      "save_geral"
    ];
    return alvos.reduce((total,alvo)=>total + numero(window.obterBonusUniversal(alvo),0),0);
  }

  function perfilEfeitos(){
    try{
      return typeof window.obterPerfilUniversalEfeitos === "function"
        ? window.obterPerfilUniversalEfeitos()
        : {vantagens:[],desvantagens:[]};
    }catch(erro){
      return {vantagens:[],desvantagens:[]};
    }
  }

  function alvoAbrangeAtributo(alvo,chave){
    const texto = String(alvo || "").toLowerCase();
    if([`tr_${chave}`,`save_${chave}`,`teste_resistencia_${chave}`,`resistencia_${chave}`].includes(texto)) return true;
    if(texto.startsWith("tr_")) return texto.slice(3).split("_").includes(chave);
    return ["tr_geral","teste_resistencia","testes_resistencia","save_geral","proximo_teste_resistencia"].includes(texto);
  }

  function estadoRolagem(chave,perfil){
    const vantagens = Array.isArray(perfil?.vantagens) ? perfil.vantagens : [];
    const desvantagens = Array.isArray(perfil?.desvantagens) ? perfil.desvantagens : [];
    const vantagem = vantagens.some(alvo=>alvoAbrangeAtributo(alvo,chave));
    const desvantagem = desvantagens.some(alvo=>alvoAbrangeAtributo(alvo,chave));
    if(vantagem && desvantagem) return "anulada";
    if(vantagem) return "vantagem";
    if(desvantagem) return "desvantagem";
    return "";
  }

  function dadosTeste(config,perfil){
    const pontuacaoBase = numero(campoSalvo(config.chave)?.value,0);
    const bonusManual = bonusManualAtributo(config.chave);
    const modificadorBase = modificadorPontuacao(pontuacaoBase + bonusManual);
    const bonusModJutsu = bonusModificadorJutsu(config.chave);
    const modificadorFinal = modificadorBase + bonusModJutsu;
    const proficiente = Boolean(campoSalvo(config.prof)?.checked);
    const bonusProf = proficiente ? numero(campoSalvo("proficiencia")?.value,0) : 0;
    const bonusTeste = bonusEspecificoTeste(config.chave);
    return {
      pontuacaoBase,
      bonusManual,
      modificadorBase,
      bonusModJutsu,
      modificadorFinal,
      proficiente,
      bonusProf,
      bonusTeste,
      total:modificadorFinal + bonusProf + bonusTeste,
      rolagem:estadoRolagem(config.chave,perfil)
    };
  }

  function textoEstado(dados){
    const partes=[];
    if(dados.proficiente) partes.push("PROF.");
    if(dados.rolagem === "vantagem") partes.push("VANT.");
    if(dados.rolagem === "desvantagem") partes.push("DESV.");
    if(dados.rolagem === "anulada") partes.push("ANUL.");
    return partes.join(" ");
  }

  function textoDetalhe(config,dados){
    const partes=[`Mod. ${comSinal(dados.modificadorFinal)}`];
    if(dados.proficiente) partes.push(`Prof. ${comSinal(dados.bonusProf)}`);
    if(dados.bonusTeste) partes.push(`Efeito ${comSinal(dados.bonusTeste)}`);
    return partes.join(" · ") || config.nome;
  }

  function atualizar(){
    const perfil = perfilEfeitos();
    ATRIBUTOS.forEach(config=>{
      const card = document.querySelector(`[data-teste-resistencia="${config.chave}"]`);
      const view = document.getElementById(config.view);
      const estadoView = document.getElementById(config.estado);
      const detalhe = document.getElementById(config.detalhe);
      if(!card || !view) return;

      const dados = dadosTeste(config,perfil);
      view.textContent = comSinal(dados.total);
      if(estadoView) estadoView.textContent = textoEstado(dados);
      if(detalhe) detalhe.textContent = textoDetalhe(config,dados);

      card.classList.toggle("proficiente",dados.proficiente);
      card.classList.toggle("comVantagem",dados.rolagem === "vantagem");
      card.classList.toggle("comDesvantagem",dados.rolagem === "desvantagem");
      card.classList.toggle("vantagemAnulada",dados.rolagem === "anulada");
      card.title = `${config.nome}: ${comSinal(dados.total)} — ${textoDetalhe(config,dados)}`;
    });
  }

  function agendar(){
    if(frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(()=>{
      frame = null;
      atualizar();
    });
  }

  function instalarObservador(){
    const host = document.getElementById("resistenciasBatalhaHost");
    if(!host || observador) return;
    observador = new MutationObserver(agendar);
    observador.observe(host,{childList:true,subtree:true,characterData:true});
  }

  function iniciar(){
    instalarObservador();
    agendar();
    setTimeout(agendar,250);
    setTimeout(agendar,900);
  }

  const seletor = [
    ...ATRIBUTOS.map(item=>`[data-save="${item.chave}"]`),
    ...ATRIBUTOS.map(item=>`[data-save="${item.prof}"]`),
    '[data-save="proficiencia"]',
    '[data-bonus-batalha]'
  ].join(",");

  document.addEventListener("input",evento=>{
    if(evento.target?.matches(seletor)) agendar();
  },true);
  document.addEventListener("change",evento=>{
    if(evento.target?.matches(seletor)) agendar();
  },true);
  document.addEventListener("click",()=>setTimeout(agendar,0),true);

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  else iniciar();

  window.addEventListener("pageshow",()=>setTimeout(iniciar,80));
  window.atualizarTestesResistenciaBatalha = agendar;
  window.calcularTesteResistenciaBatalha = function(chave){
    const config = ATRIBUTOS.find(item=>item.chave === chave);
    return config ? dadosTeste(config,perfilEfeitos()) : null;
  };
})();
