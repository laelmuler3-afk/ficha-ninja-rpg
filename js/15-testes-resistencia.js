/* Ficha Ninja 2.1.3 — testes de resistência integrados à progressão. */
(function(){
  "use strict";

  if(window.__testesResistenciaBatalhaV213) return;
  window.__testesResistenciaBatalhaV213 = true;

  const ATRIBUTOS = [
    {chave:"forca", sigla:"FOR", nome:"Força", view:"saveForcaView", estado:"saveForcaEstado", detalhe:"saveForcaDetalhe"},
    {chave:"destreza", sigla:"DES", nome:"Destreza", view:"saveDestrezaView", estado:"saveDestrezaEstado", detalhe:"saveDestrezaDetalhe"},
    {chave:"constituicao", sigla:"CON", nome:"Constituição", view:"saveConstituicaoView", estado:"saveConstituicaoEstado", detalhe:"saveConstituicaoDetalhe"},
    {chave:"inteligencia", sigla:"INT", nome:"Inteligência", view:"saveInteligenciaView", estado:"saveInteligenciaEstado", detalhe:"saveInteligenciaDetalhe"},
    {chave:"sabedoria", sigla:"SAB", nome:"Sabedoria", view:"saveSabedoriaView", estado:"saveSabedoriaEstado", detalhe:"saveSabedoriaDetalhe"},
    {chave:"carisma", sigla:"CAR", nome:"Carisma", view:"saveCarismaView", estado:"saveCarismaEstado", detalhe:"saveCarismaDetalhe"}
  ];

  const CHAVE_ESCOLHA_RESISTENCIA = "resistencia_nivel_7";
  const ESCOLHAS_POR_ATRIBUTO = {
    ferocidade:["forca"],
    evasao:["destreza"],
    resistencia:["constituicao"],
    discernimento:["inteligencia","sabedoria"]
  };
  const ROTULOS_ESCOLHAS = {
    ferocidade:"Ferocidade",
    evasao:"Evasão",
    resistencia:"Resistência",
    discernimento:"Discernimento"
  };
  const CHAVES_MANUAIS_ANTIGAS = [
    "save_forca_prof",
    "save_destreza_prof",
    "save_constituicao_prof",
    "save_inteligencia_prof",
    "save_sabedoria_prof",
    "save_carisma_prof"
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

  function normalizarToken(valor){
    return String(valor ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g,"_")
      .replace(/^_+|_+$/g,"");
  }

  function normalizarListaEscolhas(valor){
    if(Array.isArray(valor)) return valor.flatMap(normalizarListaEscolhas);
    if(valor && typeof valor === "object"){
      if("value" in valor) return normalizarListaEscolhas(valor.value);
      if("selected" in valor) return normalizarListaEscolhas(valor.selected);
      return Object.entries(valor)
        .filter(([,ativo])=>Boolean(ativo))
        .map(([id])=>normalizarToken(id))
        .filter(Boolean);
    }
    const texto = String(valor ?? "").trim();
    if(!texto) return [];
    return texto
      .split(/[;,|]/)
      .map(normalizarToken)
      .filter(Boolean);
  }

  function escolhasSalvasResistencia(){
    let valor = null;
    try{
      valor = estado?.progressaoFixa?.choices?.[CHAVE_ESCOLHA_RESISTENCIA] ?? null;
      if(valor == null){
        const historico = Array.isArray(estado?.progressaoFixa?.history)
          ? estado.progressaoFixa.history
          : [];
        const registro = [...historico].reverse().find(item=>
          item?.choice?.id === CHAVE_ESCOLHA_RESISTENCIA
        );
        valor = registro?.choice?.value ?? null;
      }
    }catch(erro){
      valor = null;
    }

    const permitidas = new Set(Object.keys(ESCOLHAS_POR_ATRIBUTO));
    return [...new Set(normalizarListaEscolhas(valor).filter(id=>permitidas.has(id)))];
  }

  function perfilProficiencias(){
    const escolhas = escolhasSalvasResistencia();
    const atributos = new Set();
    escolhas.forEach(id=>{
      (ESCOLHAS_POR_ATRIBUTO[id] || []).forEach(chave=>atributos.add(chave));
    });
    return {escolhas, atributos};
  }

  function escolhaQueConcede(chave,perfil){
    return perfil.escolhas.find(id=>(ESCOLHAS_POR_ATRIBUTO[id] || []).includes(chave)) || "";
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

  function dadosTeste(config,perfilEfeito,perfilProf){
    const pontuacaoBase = numero(campoSalvo(config.chave)?.value,0);
    const bonusManual = bonusManualAtributo(config.chave);
    const modificadorBase = modificadorPontuacao(pontuacaoBase + bonusManual);
    const bonusModJutsu = bonusModificadorJutsu(config.chave);
    const modificadorFinal = modificadorBase + bonusModJutsu;
    const escolhaOrigem = escolhaQueConcede(config.chave,perfilProf);
    const proficiente = Boolean(escolhaOrigem);
    const bonusProf = proficiente ? numero(campoSalvo("proficiencia")?.value,0) : 0;
    const bonusTeste = bonusEspecificoTeste(config.chave);
    return {
      pontuacaoBase,
      bonusManual,
      modificadorBase,
      bonusModJutsu,
      modificadorFinal,
      proficiente,
      escolhaOrigem,
      bonusProf,
      bonusTeste,
      total:modificadorFinal + bonusProf + bonusTeste,
      rolagem:estadoRolagem(config.chave,perfilEfeito)
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

  function textoOrigem(dados){
    return dados.escolhaOrigem ? ROTULOS_ESCOLHAS[dados.escolhaOrigem] || dados.escolhaOrigem : "";
  }

  function atualizar(){
    const perfilEfeito = perfilEfeitos();
    const perfilProf = perfilProficiencias();

    ATRIBUTOS.forEach(config=>{
      const card = document.querySelector(`[data-teste-resistencia="${config.chave}"]`);
      const view = document.getElementById(config.view);
      const estadoView = document.getElementById(config.estado);
      const detalhe = document.getElementById(config.detalhe);
      if(!card || !view) return;

      const dados = dadosTeste(config,perfilEfeito,perfilProf);
      view.textContent = comSinal(dados.total);
      if(estadoView) estadoView.textContent = textoEstado(dados);
      if(detalhe) detalhe.textContent = textoDetalhe(config,dados);

      card.classList.toggle("proficiente",dados.proficiente);
      card.classList.toggle("comVantagem",dados.rolagem === "vantagem");
      card.classList.toggle("comDesvantagem",dados.rolagem === "desvantagem");
      card.classList.toggle("vantagemAnulada",dados.rolagem === "anulada");

      const origem = textoOrigem(dados);
      card.title = `${config.nome}: ${comSinal(dados.total)} — ${textoDetalhe(config,dados)}${origem ? ` — ${origem}` : ""}`;
    });
  }

  function agendar(){
    if(frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(()=>{
      frame = null;
      atualizar();
    });
  }

  function persistirLimpezaMarcadoresAntigos(){
    try{
      if(typeof estado === "undefined" || !estado || typeof estado !== "object") return;
      let alterou = false;
      CHAVES_MANUAIS_ANTIGAS.forEach(chave=>{
        if(Object.prototype.hasOwnProperty.call(estado,chave)){
          delete estado[chave];
          alterou = true;
        }
      });
      if(!estado.__testesResistenciaAutomaticosV213){
        estado.__testesResistenciaAutomaticosV213 = true;
        alterou = true;
      }
      if(alterou){
        if(typeof persistirEstadoLocal === "function") persistirEstadoLocal();
        else if(typeof CHAVE !== "undefined") localStorage.setItem(CHAVE,JSON.stringify(estado));
      }
    }catch(erro){
      console.warn("Não foi possível limpar os marcadores antigos de resistência.",erro);
    }
  }

  function instalarObservador(){
    const host = document.getElementById("resistenciasBatalhaHost");
    if(!host || observador) return;
    observador = new MutationObserver(agendar);
    observador.observe(host,{childList:true,subtree:true,characterData:true});
  }

  function iniciar(){
    persistirLimpezaMarcadoresAntigos();
    instalarObservador();
    agendar();
    setTimeout(agendar,250);
    setTimeout(agendar,900);
  }

  const seletor = [
    ...ATRIBUTOS.map(item=>`[data-save="${item.chave}"]`),
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
  window.obterResistenciasProficientesAutomaticas = function(){
    return [...perfilProficiencias().atributos];
  };
  window.calcularTesteResistenciaBatalha = function(chave){
    const config = ATRIBUTOS.find(item=>item.chave === chave);
    return config ? dadosTeste(config,perfilEfeitos(),perfilProficiencias()) : null;
  };
})();
