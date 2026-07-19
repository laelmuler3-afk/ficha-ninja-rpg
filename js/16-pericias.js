/* Ficha Ninja 2.1.4 — bônus automáticos das perícias. */
(function(){
  "use strict";

  if(window.__bonusPericiasV214) return;
  window.__bonusPericiasV214 = true;

  const PERICIAS = [
    {chave:"p_acrobacia", atributo:"destreza", sigla:"DES", nome:"Acrobacia"},
    {chave:"p_atletismo", atributo:"forca", sigla:"FOR", nome:"Atletismo"},
    {chave:"p_atuacao", atributo:"carisma", sigla:"CAR", nome:"Atuação"},
    {chave:"p_chakra", atributo:"inteligencia", sigla:"INT", nome:"Chakra"},
    {chave:"p_enganacao", atributo:"carisma", sigla:"CAR", nome:"Enganação"},
    {chave:"p_furtividade", atributo:"destreza", sigla:"DES", nome:"Furtividade"},
    {chave:"p_historia", atributo:"inteligencia", sigla:"INT", nome:"História"},
    {chave:"p_intimidacao", atributo:"carisma", sigla:"CAR", nome:"Intimidação"},
    {chave:"p_investigacao", atributo:"inteligencia", sigla:"INT", nome:"Investigação"},
    {chave:"p_animais", atributo:"sabedoria", sigla:"SAB", nome:"Lidar com Animais"},
    {chave:"p_medicina", atributo:"inteligencia", sigla:"INT", nome:"Medicina"},
    {chave:"p_natureza", atributo:"sabedoria", sigla:"SAB", nome:"Natureza"},
    {chave:"p_percepcao", atributo:"sabedoria", sigla:"SAB", nome:"Percepção"},
    {chave:"p_persuasao", atributo:"carisma", sigla:"CAR", nome:"Persuasão"},
    {chave:"p_prestidigitacao", atributo:"destreza", sigla:"DES", nome:"Prestidigitação"},
    {chave:"p_sensorial", atributo:"constituicao", sigla:"CON", nome:"Sensorial"},
    {chave:"p_sobrevivencia", atributo:"sabedoria", sigla:"SAB", nome:"Sobrevivência"}
  ];

  const POR_CHAVE = new Map(PERICIAS.map(item=>[item.chave,item]));
  let frame = null;
  const timersAtrasados = new Map();

  function numero(valor,padrao=0){
    const convertido = Number(String(valor ?? "").replace(",","."));
    return Number.isFinite(convertido) ? convertido : padrao;
  }

  function campo(chave){
    return document.querySelector(`[data-save="${chave}"]`);
  }

  function modificadorAtributo(chave){
    const pontuacao = numero(campo(chave)?.value,0);
    if(typeof window.calcularModificador === "function"){
      return numero(window.calcularModificador(pontuacao),0);
    }
    return pontuacao > 0 ? Math.floor((pontuacao - 10) / 2) : 0;
  }

  function comSinal(valor){
    const n = numero(valor,0);
    return n >= 0 ? `+${n}` : String(n);
  }

  function garantirEstrutura(item){
    const input = campo(item.chave);
    const label = input?.closest("label");
    if(!input || !label) return null;

    label.classList.add("periciaItem");
    label.dataset.pericia = item.chave;
    label.dataset.atributo = item.atributo;
    input.classList.add("periciaCheckbox");

    let nome = label.querySelector(".periciaNome");
    if(!nome){
      nome = Array.from(label.children).find(el=>el.tagName === "SPAN" && !el.classList.contains("periciaBonus")) || null;
      if(nome) nome.classList.add("periciaNome");
    }

    let bonus = label.querySelector(".periciaBonus");
    if(!bonus){
      bonus = document.createElement("strong");
      bonus.className = "periciaBonus";
      bonus.setAttribute("aria-live","polite");
      bonus.textContent = "+0";
      if(nome) label.insertBefore(bonus,nome);
      else label.appendChild(bonus);
    }

    return {input,label,nome,bonus};
  }

  function calcular(item){
    const input = campo(item.chave);
    const proficiente = Boolean(input?.checked);
    const modificador = modificadorAtributo(item.atributo);
    const proficiencia = proficiente ? numero(campo("proficiencia")?.value,0) : 0;
    return {
      modificador,
      proficiente,
      proficiencia,
      total:modificador + proficiencia
    };
  }

  function atualizarItem(item){
    const estrutura = garantirEstrutura(item);
    if(!estrutura) return;

    const dados = calcular(item);
    estrutura.bonus.textContent = comSinal(dados.total);
    estrutura.label.classList.toggle("proficiente",dados.proficiente);
    estrutura.bonus.classList.toggle("proficiente",dados.proficiente);

    const detalhe = dados.proficiente
      ? `Modificador ${comSinal(dados.modificador)} + proficiência ${comSinal(dados.proficiencia)}`
      : `Modificador ${comSinal(dados.modificador)}`;

    estrutura.label.title = `${item.nome} (${item.sigla}): ${comSinal(dados.total)} — ${detalhe}`;
    estrutura.label.setAttribute(
      "aria-label",
      `${item.nome}, bônus ${comSinal(dados.total)}${dados.proficiente ? ", proficiente" : ""}`
    );
  }

  function atualizar(){
    PERICIAS.forEach(atualizarItem);
  }

  function agendar(atraso=0){
    if(atraso > 0){
      const anterior = timersAtrasados.get(atraso);
      if(anterior) clearTimeout(anterior);
      const timer = setTimeout(()=>{
        timersAtrasados.delete(atraso);
        agendar(0);
      },atraso);
      timersAtrasados.set(atraso,timer);
      return;
    }
    if(frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(()=>{
      frame = null;
      atualizar();
    });
  }

  function iniciar(){
    atualizar();
    agendar(180);
    agendar(700);
  }

  const atributos = ["forca","destreza","constituicao","inteligencia","sabedoria","carisma","proficiencia"];
  const seletorAtualizacao = [
    ...atributos.map(chave=>`[data-save="${chave}"]`),
    ...PERICIAS.map(item=>`[data-save="${item.chave}"]`)
  ].join(",");

  document.addEventListener("input",evento=>{
    if(evento.target?.matches(seletorAtualizacao)) agendar();
  },true);

  document.addEventListener("change",evento=>{
    if(evento.target?.matches(seletorAtualizacao)) agendar();
  },true);

  document.addEventListener("click",()=>{
    agendar(0);
    agendar(250);
    agendar(900);
  },true);

  window.addEventListener("pageshow",()=>agendar(80));

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",iniciar,{once:true});
  }else{
    iniciar();
  }

  window.atualizarBonusPericias = ()=>agendar();
  window.calcularBonusPericia = function(chave){
    const item = POR_CHAVE.get(chave);
    return item ? calcular(item) : null;
  };
})();
