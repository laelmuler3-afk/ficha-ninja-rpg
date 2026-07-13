/* ======================================================================
   Código principal do aplicativo
   ====================================================================== */
/* ===== Modal Shinobi: confirmação de uso ===== */
function modalShinobi(titulo, texto, opcoes){
  opcoes = opcoes || {};
  return new Promise(resolve=>{
    const overlay = document.createElement('div');
    overlay.className = 'modalShinobiOverlay';

    const somenteOk = opcoes.tipo === 'alerta';

    overlay.innerHTML = `
      <div class="modalShinobiBox" role="dialog" aria-modal="true">
        <h3 class="modalShinobiTitulo">${String(titulo || 'Confirmação').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</h3>
        <p class="modalShinobiTexto">${String(texto || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
        <div class="modalShinobiAcoes ${somenteOk ? 'somenteOk' : ''}">
          ${somenteOk ? '' : '<button type="button" class="modalShinobiBtn cancelar" data-resposta="0">Cancelar</button>'}
          <button type="button" class="modalShinobiBtn confirmar" data-resposta="1">${somenteOk ? 'OK' : 'Confirmar'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('[data-resposta]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const resposta = btn.dataset.resposta === '1';
        overlay.remove();
        resolve(resposta);
      });
    });
  });
}

function avisoShinobi(titulo, texto){
  return modalShinobi(titulo, texto, {tipo:'alerta'});
}

function confirmarUsoAcao(tipo, nome, detalhe){
  const texto = `${nome || 'Ação'}${detalhe ? '\n\n' + detalhe : ''}`;
  return modalShinobi(`Usar ${tipo}?`, texto);
}

/* ===== Versão interna do app ===== */
const APP_VERSION = window.APP_VERSION || "1.2.0-performance";
window.APP_VERSION = APP_VERSION;

/* Ficha Ninja RPG — otimização v2 */
const CHAVE_BASE="ficha_ninja_app_v2",CHAVE_LISTA="ficha_ninja_lista_v1",CHAVE_ATIVA="ficha_ninja_ativa_v1";function limparNomeFicha(nome){return String(nome||"Principal").trim().replace(/[^\w\-À-ÿ ]+/g,"").slice(0,32)||"Principal"}function lerListaFichas(){let lista=["Principal"];try{const salva=JSON.parse(localStorage.getItem(CHAVE_LISTA)||'["Principal"]');Array.isArray(salva)&&salva.length&&(lista=salva)}catch(e){lista=["Principal"]}try{Object.keys(localStorage).forEach(k=>{if(k.startsWith(CHAVE_BASE+"__")){const nome=k.replace(CHAVE_BASE+"__","");nome&&!lista.includes(nome)&&lista.push(nome)}})}catch(e){}return lista=[...new Set(lista.map(limparNomeFicha))],lista.includes("Principal")||lista.unshift("Principal"),localStorage.setItem(CHAVE_LISTA,JSON.stringify(lista)),lista}let fichas=lerListaFichas(),fichaAtual=limparNomeFicha(localStorage.getItem(CHAVE_ATIVA)||"Principal");function chaveFicha(nome=fichaAtual){const ficha=limparNomeFicha(nome);return"Principal"===ficha?CHAVE_BASE:CHAVE_BASE+"__"+ficha}fichas.includes(fichaAtual)||(fichas.push(fichaAtual),localStorage.setItem(CHAVE_LISTA,JSON.stringify(fichas)));let CHAVE=chaveFicha(),estado=JSON.parse(localStorage.getItem(CHAVE)||"{}"),camposSalvaveisCache=null,timerSalvar=null,avisoArmazenamentoExibido=!1;function obterCamposSalvaveis(){const campos=Array.from(document.querySelectorAll("[data-save]"));return camposSalvaveisCache&&camposSalvaveisCache.length===campos.length||(camposSalvaveisCache=campos),camposSalvaveisCache}function persistirEstadoLocal(){try{return localStorage.setItem(CHAVE,JSON.stringify(estado)),!0}catch(erro){return avisoArmazenamentoExibido||(avisoArmazenamentoExibido=!0,alert("O armazenamento da ficha está cheio. Remova algumas imagens de fundo dos jutsus ou use imagens menores para continuar salvando.")),!1}}function sincronizarEstadoDosCampos(){obterCamposSalvaveis().forEach(c=>{estado[c.dataset.save]="checkbox"===c.type?c.checked:c.value})}function salvar(){timerSalvar&&(clearTimeout(timerSalvar),timerSalvar=null),sincronizarEstadoDosCampos(),persistirEstadoLocal(),atualizarPlacar(),atualizarPerfil()}function salvarAgendado(){timerSalvar&&clearTimeout(timerSalvar),timerSalvar=setTimeout(()=>{timerSalvar=null,salvar()},180)}function salvarManual(){salvar(),alert("Ficha salva!")}function carregar(){obterCamposSalvaveis().forEach(c=>{void 0!==estado[c.dataset.save]&&("checkbox"===c.type?c.checked=estado[c.dataset.save]:c.value=estado[c.dataset.save]),c.dataset.saveListener||(c.dataset.saveListener="1",c.addEventListener("input",salvarAgendado),c.addEventListener("change",salvar))}),renderizarJutsus(),renderizarArmados(),renderizarNaturezas(),renderizarKekkeiGenkai(),renderizarInventario(),atualizarPlacar(),atualizarPerfil(),carregarAvatarSalvo(),carregarFundoPerfilSalvo()}function abrirPagina(id,botao){const pagina=document.getElementById(id);if(!pagina)return;document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa")),pagina.classList.add("ativa");const botoes=Array.from(document.querySelectorAll(".menu button"));botoes.forEach(b=>b.classList.remove("ativo"));const botaoFinal=botao||botoes.find(b=>{const onclick=b.getAttribute("onclick")||"";return onclick.includes("'"+id+"'")||onclick.includes('"'+id+'"')});if(botaoFinal&&botaoFinal.classList.add("ativo"),window.abasSwipe){const idx=window.abasSwipe.indexOf(id);idx>=0&&(window.abaSwipeAtual=idx)}}function atualizarPlacar(){let pv=document.getElementById("pv")?.value||0,chakra=document.getElementById("chakra")?.value||0;const pvView=document.getElementById("pvView"),chakraView=document.getElementById("chakraView");pvView&&(pvView.textContent=pv),chakraView&&(chakraView.textContent=chakra),atualizarHUD(),atualizarModificadoresBatalha()}function alterarValor(id,valor){const c=document.getElementById(id);c.value=Math.max(0,Number(c.value||0)+valor)}function log(txt){const l=document.getElementById("log");"Nada aconteceu ainda."===l.innerHTML&&(l.innerHTML=""),l.innerHTML="• "+txt+"<br>"+l.innerHTML}async function aplicarDano(){
  const dano=Number(document.getElementById("danoBatalha").value||0);
  const pv=document.getElementById("pv");
  const atual=Number(pv?.value||0);
  const novo=Math.max(0,atual-dano);

  const ok=await confirmarUsoAcao("ação de batalha","Aplicar dano",`Dano: ${dano}\nPV atual: ${atual}\nPV após dano: ${novo}`);
  if(!ok)return;

  if(pv)pv.value=novo;
  salvar();
  log("Dano recebido: "+dano);
}

async function gastarChakra(){
  const custo=Number(document.getElementById("custoBatalha").value||0);
  const ch=document.getElementById("chakra");
  const atual=Number(ch?.value||0);
  const novo=Math.max(0,atual-custo);

  const ok=await confirmarUsoAcao("ação de batalha","Gastar chakra",`Custo: ${custo}\nChakra atual: ${atual}\nChakra após gasto: ${novo}`);
  if(!ok)return;

  if(ch)ch.value=novo;
  salvar();
  log("Chakra gasto: "+custo);
}

async function curarPV(v){
  const pv=document.getElementById("pv");
  const atual=Number(pv?.value||0);
  const pvMax=document.getElementById("pvMax");
  const max=Number(pvMax?.value||0);
  const novo=max>0?Math.min(max,atual+v):atual+v;

  const ok=await confirmarUsoAcao("recuperação","Recuperar PV",`Recuperação: +${v} PV\nPV atual: ${atual}\nPV após recuperação: ${novo}`);
  if(!ok)return;

  if(pv)pv.value=novo;
  salvar();
  log("Recuperou "+v+" PV");
}

async function recuperarChakra(v){
  const ch=document.getElementById("chakra");
  const atual=Number(ch?.value||0);
  const chakraMax=document.getElementById("chakraMax");
  const max=Number(chakraMax?.value||0);
  const novo=max>0?Math.min(max,atual+v):atual+v;

  const ok=await confirmarUsoAcao("recuperação","Recuperar chakra",`Recuperação: +${v} chakra\nChakra atual: ${atual}\nChakra após recuperação: ${novo}`);
  if(!ok)return;

  if(ch)ch.value=novo;
  salvar();
  log("Recuperou "+v+" chakra");
}

async function resetarBatalha(){
  const ok=await confirmarUsoAcao("reset","Resetar batalha","PV e chakra voltam para o máximo.\nDano, custo, bônus temporários e histórico serão limpos.");
  if(!ok)return;

  const pv=document.getElementById("pv"),
        pvMax=document.getElementById("pvMax"),
        chakra=document.getElementById("chakra"),
        chakraMax=document.getElementById("chakraMax");

  if(pv)pv.value=pvMax?.value||0;
  if(chakra)chakra.value=chakraMax?.value||0;

  const dano=document.getElementById("danoBatalha");
  const custo=document.getElementById("custoBatalha");
  const logBox=document.getElementById("log");

  if(dano)dano.value=1;
  if(custo)custo.value=1;
  if(logBox)logBox.innerHTML="Nada aconteceu ainda.";

  salvar();

  document.querySelectorAll("[data-bonus-batalha]").forEach(input=>input.value=0);
  if(typeof bonusBatalhaAtributos!=="undefined"){
    Object.keys(bonusBatalhaAtributos).forEach(k=>bonusBatalhaAtributos[k]=0);
  }

  if(typeof atualizarModsBatalhaComBonus==="function")atualizarModsBatalhaComBonus();

  if(typeof zerarBonusDefesasBatalha==="function")zerarBonusDefesasBatalha();
  else document.querySelectorAll("[data-bonus-defesa-batalha]").forEach(input=>input.value=0);

  await avisoShinobi("Batalha resetada","A área de batalha foi restaurada.");
}
function adicionarJutsu(){estado.jutsus=estado.jutsus||[],estado.jutsus.push({nome:"",rank:"",elemento:"katon",bonusAcerto:"",dano:"",bonusDano:"",custo:"",alcance:"",raio:"",duracao:"",acao:"",resistencia:"",alvo:"",descricao:"",imagem:""}),persistirListas()}function adicionarArmado(){estado.armados=estado.armados||[],estado.armados.push({nome:"",tipo:"armado",bonusAcerto:"",dano:"",bonusDano:"",obs:"",itemInventario:"",quantidadeUso:"1"}),persistirListas()}function removerJutsu(i){estado.jutsus.splice(i,1),estado.jutsusAbertos={},persistirListas()}function removerArmado(i){estado.armados.splice(i,1),estado.ataquesAbertos={},persistirListas()}function persistirSemRender(){persistirEstadoLocal()}function persistirListas(){persistirEstadoLocal(),renderizarJutsus(),renderizarArmados()}function dadosElementoJutsu(elemento){const mapa={katon:{nome:"KATON",icone:"🔥",classe:"jutsu-katon"},raiton:{nome:"RAITON",icone:"⚡",classe:"jutsu-raiton"},fuuton:{nome:"FUUTON",icone:"🌪️",classe:"jutsu-fuuton"},suiton:{nome:"SUITON",icone:"💧",classe:"jutsu-suiton"},doton:{nome:"DOTON",icone:"🪨",classe:"jutsu-doton"},yin:{nome:"YINTON",icone:"🌑",classe:"jutsu-yin"},yang:{nome:"YOUTON",icone:"☀️",classe:"jutsu-yang"},neutro:{nome:"NEUTRO",icone:"✨",classe:"jutsu-neutro"}};return mapa[elemento]||mapa.neutro}function limparNumeroDano(valor){const texto=String(valor||"").trim().replace(",",".");if(!texto)return 0;const match=texto.match(/[-+]?\d+(\.\d+)?/);return match?Number(match[0]):0}function formatarDanoTotal(dano,bonus){const danoTexto=String(dano||"").trim(),bonusTexto=String(bonus||"").trim(),bonusNum=limparNumeroDano(bonusTexto);if(!danoTexto&&!bonusTexto)return"—";const danoEhNumero=/^[-+]?\d+([.,]\d+)?$/.test(danoTexto),bonusEhNumero=/^[-+]?\d+([.,]\d+)?$/.test(bonusTexto);return danoEhNumero&&bonusEhNumero?String(limparNumeroDano(danoTexto)+bonusNum):danoTexto&&bonusNum?danoTexto+" + "+bonusNum:danoTexto||(bonusTexto||"—")}function valorJutsu(j,campo,padrao="—"){return(j&&void 0!==j[campo]?String(j[campo]).trim():"")||padrao}function editarCampoJutsuPrompt(i,campo,rotulo,padrao=""){const j=(estado.jutsus||[])[i];if(!j)return;const atual=j[campo]||"",novo=prompt(rotulo,atual);null!==novo&&(j[campo]=novo.trim(),persistirSemRender(),renderizarJutsus())}function escolherElementoJutsuPrompt(i){const j=(estado.jutsus||[])[i];if(!j)return;const atual=j.elemento||"katon",escolha=prompt(`Escolha o elemento:\n1 - Katon\n2 - Raiton\n3 - Fuuton\n4 - Suiton\n5 - Doton\n6 - Yinton\n7 - Youton\n8 - Neutro\n\nAtual: ${atual}`,"");if(null===escolha)return;const novo={1:"katon",2:"raiton",3:"fuuton",4:"suiton",5:"doton",6:"yin",7:"yang",8:"neutro"}[String(escolha).trim()]||String(escolha).trim().toLowerCase();["katon","raiton","fuuton","suiton","doton","yin","yang","neutro"].includes(novo)?(j.elemento=novo,persistirSemRender(),renderizarJutsus()):alert("Elemento inválido.")}function jutsuAberto(i){return estado.jutsusAbertos=estado.jutsusAbertos||{},!!estado.jutsusAbertos[i]}function alternarJutsuAberto(i){estado.jutsusAbertos=estado.jutsusAbertos||{},estado.jutsusAbertos[i]=!estado.jutsusAbertos[i],persistirSemRender(),renderizarJutsus()}function renderizarJutsus(){const box=document.getElementById("listaJutsus");if(!box)return;const html=[];(estado.jutsus||[]).forEach((j,i)=>{const aberto=jutsuAberto(i),dados=dadosElementoJutsu(j.elemento||"katon"),nome=valorJutsu(j,"nome","Novo jutsu"),custo=valorJutsu(j,"custo","0"),rank=valorJutsu(j,"rank","Rank"),dano=valorJutsu(j,"dano","—"),totalDano=formatarDanoTotal(j.dano,j.bonusDano),alcance=valorJutsu(j,"alcance","—"),raio=valorJutsu(j,"raio","—"),duracao=valorJutsu(j,"duracao","—"),bonusAcerto=valorJutsu(j,"bonusAcerto","—"),bonusDano=valorJutsu(j,"bonusDano","—"),acao=valorJutsu(j,"acao","—"),resistencia=valorJutsu(j,"resistencia","—"),alvo=valorJutsu(j,"alvo","—"),descricao=valorJutsu(j,"descricao","Toque para editar efeitos"),imagem=String(j.imagem||""),estiloImagem=imagem?`style="background-image:url('${imagem}')"`:"";html.push(`\n      <div class="jutsuCard jutsuCardCompacto jutsuListaCard ${aberto?"jutsuAberto":""} ${imagem?"comImagem":"semImagem"} ${dados.classe}">\n        <div class="jutsuCartaFundo" ${estiloImagem}></div>\n        <button class="jutsuLinhaResumo" onclick="alternarJutsuAberto(${i})">\n          <span class="jutsuLinhaIcone">${dados.icone}</span>\n\n          <span class="jutsuLinhaTexto">\n            <strong>${nome}</strong>\n            <small>${dados.nome} • ${rank} • ${custo} CH</small>\n          </span>\n\n          <span class="jutsuLinhaSeta">${aberto?"▲":"▼"}</span>\n        </button>\n\n        <div class="jutsuDetalhesCompactos">\n          <div class="jutsuTopo jutsuTopoEditavel">\n            <button class="jutsuIcone jutsuEditavel" onclick="escolherElementoJutsuPrompt(${i})" title="Editar elemento">${dados.icone}</button>\n\n            <div class="jutsuTitulo jutsuNomeEditavel" onclick="editarCampoJutsuPrompt(${i},'nome','Nome do jutsu')">\n              <h3>${nome}</h3>\n              <span class="jutsuElementoLabel">${dados.nome}</span>\n            </div>\n\n            <button class="jutsuRankPill jutsuEditavel" onclick="editarCampoJutsuPrompt(${i},'rank','Rank do jutsu')">${rank}</button>\n            <button class="jutsuCustoPill jutsuEditavel" onclick="editarCampoJutsuPrompt(${i},'custo','Custo de Chakra')">${custo} CH</button>\n          </div>\n\n          <div class="jutsuCartaImagemAcoes">\n            <button type="button" onclick="abrirUploadImagemJutsu(${i})">🖼 Fundo da carta</button>\n            <button type="button" onclick="removerImagemJutsu(${i})">Remover fundo</button>\n          </div>\n\n          <div class="jutsuResumo jutsuResumoEditavel">\n            <button onclick="editarCampoJutsuPrompt(${i},'dano','Dano')"><b>Dano</b>${dano}</button>\n            <button class="danoTotalBox" onclick="editarCampoJutsuPrompt(${i},'bonusDano','Bônus de dano')"><b>Dano total</b>${totalDano}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'alcance','Alcance')"><b>Alcance</b>${alcance}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'raio','Raio / Área')"><b>Raio</b>${raio}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'duracao','Duração')"><b>Duração</b>${duracao}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'bonusAcerto','Bônus de acerto')"><b>Acerto</b>${bonusAcerto}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'bonusDano','Bônus de dano')"><b>Bônus dano</b>${bonusDano}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'acao','Tipo de ação')"><b>Ação</b>${acao}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'resistencia','Teste / Resistência')"><b>Teste</b>${resistencia}</button>\n            <button onclick="editarCampoJutsuPrompt(${i},'alvo','Alvo')"><b>Alvo</b>${alvo}</button>\n            <button class="jutsuResumoFull" onclick="editarCampoJutsuPrompt(${i},'descricao','Outros bônus / efeitos')"><b>Efeitos</b>${descricao}</button>\n          </div>\n\n          <div class="jutsuAcoes jutsuAcoesCompactas">\n            <button class="btn btnUsarJutsu" onclick="usarJutsu(${i})">USAR JUTSU</button>\n            <button class="btn perigo btnRemoverJutsu" onclick="removerJutsu(${i})">Remover</button>\n          </div>\n        </div>\n      </div>\n    `)}),box.innerHTML=html.join("")}async function usarJutsu(i){
  const j=(estado.jutsus||[])[i];
  if(!j)return;

  const custo=numeroSeguro(j.custo||0);
  const chakra=document.getElementById("chakra");
  const chakraAtual=numeroSeguro(chakra?.value||0);
  const dados=dadosElementoJutsu(j.elemento||"katon"),classe=dados.classe||"jutsu-neutro";
  const nome=j.nome||"Jutsu sem nome";
  const dano=j.dano?"Dano: "+j.dano:"";
  const detalhe=[
    `${dados.icone} ${dados.nome}`,
    custo?`Custo de chakra: ${custo}`:"Sem custo de chakra",
    dano
  ].filter(Boolean).join("\\n");

  const ok=await confirmarUsoAcao("jutsu",nome,detalhe);
  if(!ok)return;

  if(custo>chakraAtual){
    await avisoShinobi("Chakra insuficiente",`Você tem ${chakraAtual} de chakra.\\nEste jutsu precisa de ${custo}.`);
    return;
  }

  if(chakra)chakra.value=Math.max(0,chakraAtual-custo);
  salvar();

  const danoTxt=j.dano?" | Dano: "+j.dano:"";
  const custoTxt=custo?" | Chakra: -"+custo:"";
  log(`${dados.icone} Usou ${nome}${danoTxt}${custoTxt}`);
  atualizarHUD();
}function escolherTipoAtaquePrompt(i){const a=(estado.armados||[])[i];if(!a)return;const atual=a.tipo||"armado",escolha=prompt(`Tipo de ataque:\n1 - Armado\n2 - Desarmado\n\nAtual: ${atual}`,"");if(null===escolha)return;const valor=String(escolha).trim().toLowerCase(),novo="2"===valor||"desarmado"===valor?"desarmado":"armado";a.tipo=novo,persistirSemRender(),renderizarArmados()}function iconeTipoAtaque(tipo){return"desarmado"===tipo?"👊":"⚔️"}function labelTipoAtaque(tipo){return"desarmado"===tipo?"Ataque desarmado":"Ataque armado"}function editarCampoArmadoPrompt(i,campo,rotulo){const a=(estado.armados||[])[i];if(!a)return;const atual=a[campo]||"",novo=prompt(rotulo,atual);null!==novo&&(a[campo]=novo.trim(),"nome"!==campo||a.itemInventario&&String(a.itemInventario).trim()||(a.itemInventario=novo.trim(),a.quantidadeUso||(a.quantidadeUso="1")),persistirSemRender(),renderizarArmados())}function valorArmado(a,campo,padrao="—"){return(a&&void 0!==a[campo]?String(a[campo]).trim():"")||padrao}function ataqueAberto(i){return estado.ataquesAbertos=estado.ataquesAbertos||{},!!estado.ataquesAbertos[i]}function alternarAtaqueAberto(i){estado.ataquesAbertos=estado.ataquesAbertos||{},estado.ataquesAbertos[i]=!estado.ataquesAbertos[i],persistirSemRender(),renderizarArmados()}function renderizarArmados(){const box=document.getElementById("listaArmados");if(!box)return;const html=[];(estado.armados||[]).forEach((a,i)=>{const aberto=ataqueAberto(i),tipo=a.tipo||"armado",nome=valorArmado(a,"nome","Novo ataque"),acerto=valorArmado(a,"bonusAcerto",valorArmado(a,"bonus","—")),dano=valorArmado(a,"dano","—"),bonusDano=valorArmado(a,"bonusDano","—"),totalDano=formatarDanoTotal(a.dano,a.bonusDano),obs=valorArmado(a,"obs","Toque para editar observações");html.push(`\n      <div class="armadoCardCompacto ataqueListaCard ${aberto?"ataqueAberto":""}">\n        <button class="ataqueLinhaResumo" onclick="alternarAtaqueAberto(${i})">\n          <span class="ataqueLinhaIcone" onclick="event.stopPropagation(); escolherTipoAtaquePrompt(${i})">${iconeTipoAtaque(tipo)}</span>\n\n          <span class="ataqueLinhaTexto">\n            <strong>${nome}</strong>\n            <small>${labelTipoAtaque(tipo)} • Dano total: ${totalDano}</small>\n          </span>\n\n          <span class="ataqueLinhaSeta">${aberto?"▲":"▼"}</span>\n        </button>\n\n        <div class="ataqueDetalhesCompactos">\n          <div class="armadoTopo">\n            <button class="armadoIcone" onclick="escolherTipoAtaquePrompt(${i})">${iconeTipoAtaque(tipo)}</button>\n\n            <div class="armadoNome" onclick="editarCampoArmadoPrompt(${i},'nome','Nome do ataque')">\n              <h3>${nome}</h3>\n              <span onclick="event.stopPropagation(); escolherTipoAtaquePrompt(${i})">${labelTipoAtaque(tipo)}</span>\n            </div>\n          </div>\n\n          <div class="armadoResumoEditavel">\n            <button onclick="editarCampoArmadoPrompt(${i},'bonusAcerto','Bônus de acerto')"><b>Acerto</b>${acerto}</button>\n            <button onclick="editarCampoArmadoPrompt(${i},'dano','Dano')"><b>Dano</b>${dano}</button>\n            <button class="danoTotalBox" onclick="editarCampoArmadoPrompt(${i},'bonusDano','Bônus de dano')"><b>Dano total</b>${totalDano}</button>\n            <button onclick="editarCampoArmadoPrompt(${i},'bonusDano','Bônus de dano')"><b>Bônus dano</b>${bonusDano}</button>\n            <button class="armadoResumoFull" onclick="editarCampoArmadoPrompt(${i},'obs','Outros bônus / observações')"><b>Observações</b>${obs}</button>\n            <button onclick="vincularItemAtaque(${i})"><b>Item usado</b><span class="ataqueItemUsado">${iconeInventario(valorArmado(a,"itemInventario",""))} ${valorArmado(a,"itemInventario","Nenhum")}</span></button>\n            <button onclick="editarQtdUsoAtaque(${i})"><b>Qtd. por uso</b>${valorArmado(a,"quantidadeUso","1")}</button>\n          </div>\n\n          <div class="armadoAcoesCompactas ataqueAcoesUso">\n            <button class="btn btnUsarAtaqueInventario" onclick="usarAtaqueInventario(${i})">Usar ataque</button>\n            <button class="btn perigo" onclick="removerArmado(${i})">Remover</button>\n          </div>\n        </div>\n      </div>\n    `)}),box.innerHTML=html.join("")}function numeroSeguro(valor){const n=Number(valor);return Number.isFinite(n)?n:0}function limitarPorcentagem(valor){return Math.max(0,Math.min(100,valor))}function lerXP(valor){const XP_MAX_PADRAO=355000,bruto=String(valor??"").trim(),lerInteiroXP=v=>{const limpo=String(v??"").replace(/\s/g,"").replace(/[.,](?=\d{3}(?:\D|$))/g,"").replace(/[^0-9-]/g,"");return Math.max(0,numeroSeguro(limpo))};if(bruto.includes("/")){const partes=bruto.split("/");const atual=lerInteiroXP(partes[0]),maximo=Math.max(1,lerInteiroXP(partes[1])||XP_MAX_PADRAO);return{atual,maximo,texto:atual+"/"+maximo}}const atual=lerInteiroXP(bruto);return{atual,maximo:XP_MAX_PADRAO,texto:atual+"/"+XP_MAX_PADRAO}}function atualizarHUD(){const pv=document.getElementById("pv")?.value||0,pvMax=document.getElementById("pvMax")?.value||0,chakra=document.getElementById("chakra")?.value||0,chakraMax=document.getElementById("chakraMax")?.value||0,xp=lerXP(document.querySelector('[data-save="xp"]')?.value||"0/355000");definirLargura("perfilPvBarra",pv,pvMax),definirLargura("perfilChakraBarra",chakra,chakraMax),definirLargura("perfilXpBarra",xp.atual,xp.maximo);const pvTxt=document.getElementById("perfilPvView"),chTxt=document.getElementById("perfilChakraView"),xpTxt=document.getElementById("perfilXpView");pvTxt&&(pvTxt.textContent=pv+"/"+(pvMax||0)),chTxt&&(chTxt.textContent=chakra+"/"+(chakraMax||0)),xpTxt&&(xpTxt.textContent=xp.texto)}window.addEventListener("pagehide",()=>{timerSalvar&&salvar()});const NATUREZAS=[{id:"katon",icone:"🔥",nome:"KATON",classe:"katon"},{id:"raiton",icone:"⚡",nome:"RAITON",classe:"raiton"},{id:"fuuton",icone:"🌪️",nome:"FUUTON",classe:"fuuton"},{id:"suiton",icone:"💧",nome:"SUITON",classe:"suiton"},{id:"doton",icone:"🪨",nome:"DOTON",classe:"doton"},{id:"yin",icone:"🌑",nome:"YINTON",classe:"yin"},{id:"yang",icone:"☀️",nome:"YOUTON",classe:"yang"}];function renderizarNaturezas(){const box=document.getElementById("naturezasUI");if(!box)return;const html=[];NATUREZAS.forEach(n=>{const valor=Math.max(0,Math.min(6,numeroSeguro(estado[n.id]||0))),bolinhas=Array.from({length:6},(_,i)=>{const nivel=i+1,ativa=nivel<=valor?"ativa":"";return`\n        <button type="button" class="naturezaNivel" onclick="definirNatureza('${n.id}',${nivel})" aria-label="${n.nome} nível ${nivel}">\n          <span class="naturezaBolinha ${ativa}"></span>\n          <small>${nivel}</small>\n        </button>\n      `}).join("");html.push(`\n      <div class="naturezaCard ${n.classe}">\n        <div class="naturezaInfo">\n          <span class="naturezaIcone">${n.icone}</span>\n          <div>\n            <div class="naturezaNome">${n.nome}</div>\n            <span class="naturezaNivelTexto">${valor}/6</span>\n          </div>\n        </div>\n        <div class="naturezaLinha">${bolinhas}</div>\n      </div>\n    `)}),box.innerHTML=html.join("")}function definirNatureza(id,nivel){const atual=numeroSeguro(estado[id]||0);estado[id]=atual===nivel?0:nivel,persistirEstadoLocal(),renderizarNaturezas()}function textoCampo(chave,padrao){const valor=estado[chave];return void 0!==valor&&""!==String(valor).trim()?String(valor).trim():padrao}function definirLargura(id,atual,maximo){const el=document.getElementById(id);if(!el)return;const a=numeroSeguro(atual),m=Math.max(1,numeroSeguro(maximo));el.style.width=limitarPorcentagem(a/m*100)+"%"}function corNatureza(classe){return{katon:"#ff4b26",raiton:"#ffd02a",fuuton:"#53e25a",suiton:"#2aa8ff",doton:"#b8793a",yin:"#a965ff",yang:"#ffe06a"}[classe]||"#ffb15a"}function atualizarPerfil(){const cla=textoCampo("cla","Clã indefinido"),vila=textoCampo("vila","Vila indefinida"),rank=textoCampo("rank","Rank"),nivel=textoCampo("nivel","1"),setText=(id,txt)=>{const el=document.getElementById(id);el&&(el.textContent=txt)};setText("perfilResumoView",cla+" • "+vila),setText("perfilRankView",rank),setText("perfilNivelView","Nível "+nivel);const pv=document.getElementById("pv")?.value||0,pvMax=document.getElementById("pvMax")?.value||0,chakra=document.getElementById("chakra")?.value||0,chakraMax=document.getElementById("chakraMax")?.value||0,xp=lerXP(document.querySelector('[data-save="xp"]')?.value||"0/355000");setText("perfilPvView",pv+"/"+(pvMax||0)),setText("perfilChakraView",chakra+"/"+(chakraMax||0)),setText("perfilXpView",xp.texto),definirLargura("perfilPvBarra",pv,pvMax),definirLargura("perfilChakraBarra",chakra,chakraMax),definirLargura("perfilXpBarra",xp.atual,xp.maximo);const box=document.getElementById("perfilElementosView");if(box){const ativos=NATUREZAS.map(n=>({...n,valor:numeroSeguro(estado[n.id]||0)})).filter(n=>n.valor>0).sort((a,b)=>b.valor-a.valor).slice(0,4);ativos.length?box.innerHTML=ativos.map(n=>`\n        <span class="elementoPill" style="color:${corNatureza(n.classe)}">\n          ${n.icone} ${n.nome} ${n.valor}/6\n        </span>\n      `).join(""):box.innerHTML='<span class="elementoPill" style="color:#ffb15a">✨ Nenhum elemento selecionado</span>'}}function abrirUploadAvatar(){const input=document.getElementById("avatarUpload");input&&input.click()}function carregarAvatar(event){const arquivo=event.target.files&&event.target.files[0];if(!arquivo)return;if(!arquivo.type.startsWith("image/"))return void alert("Escolha uma imagem válida.");const leitor=new FileReader;leitor.onload=function(e){const imagem=e.target.result;estado.avatarNinja=imagem,persistirEstadoLocal(),aplicarAvatar(imagem)},leitor.readAsDataURL(arquivo)}function aplicarAvatar(imagem){const preview=document.getElementById("avatarPreview"),emoji=document.getElementById("avatarEmoji");preview&&emoji&&(imagem?(preview.src=imagem,preview.style.display="block",emoji.style.display="none"):(preview.removeAttribute("src"),preview.style.display="none",emoji.style.display="block"))}function carregarAvatarSalvo(){aplicarAvatar(estado.avatarNinja||"")}function abrirUploadFundoPerfil(){const menu=document.getElementById("avatarMenu"),input=document.createElement("input");input.type="file",input.accept="image/*",input.onchange=function(event){carregarFundoPerfil(event),setTimeout(()=>input.remove(),300)},document.body.appendChild(input),input.click(),setTimeout(()=>{menu&&menu.classList.remove("aberto")},250)}function compactarImagemParaFundo(arquivo,callback){const leitor=new FileReader;leitor.onload=function(e){const img=new Image;img.onload=function(){let largura=img.width,altura=img.height;largura>altura&&largura>1200?(altura=Math.round(1200*altura/largura),largura=1200):altura>=largura&&altura>1200&&(largura=Math.round(1200*largura/altura),altura=1200);try{const canvas=document.createElement("canvas");canvas.width=largura,canvas.height=altura;canvas.getContext("2d").drawImage(img,0,0,largura,altura);const imagemCompactada=canvas.toDataURL("image/jpeg",.78);callback(imagemCompactada)}catch(erro){callback(e.target.result)}},img.onerror=function(){callback(e.target.result)},img.src=e.target.result},leitor.readAsDataURL(arquivo)}function carregarFundoPerfil(event){const arquivo=event.target.files&&event.target.files[0];arquivo&&(arquivo.type&&arquivo.type.startsWith("image/")?compactarImagemParaFundo(arquivo,function(imagem){try{estado.perfilFundoImagem=imagem,persistirEstadoLocal(),aplicarFundoPerfil(imagem);const menu=document.getElementById("avatarMenu");menu&&menu.classList.remove("aberto")}catch(erro){alert("Não consegui salvar essa imagem. Tente uma imagem menor ou mais leve.")}}):alert("Escolha uma imagem válida."))}function aplicarFundoPerfil(imagem){const fundo=document.getElementById("perfilFundoImagem");fundo&&(imagem?(fundo.style.backgroundImage='url("'+imagem+'")',fundo.style.backgroundSize="cover",fundo.style.backgroundPosition="center",fundo.style.backgroundRepeat="no-repeat",fundo.classList.add("ativo")):(fundo.style.backgroundImage="none",fundo.classList.remove("ativo")))}function removerFundoPerfil(){delete estado.perfilFundoImagem;try{persistirEstadoLocal()}catch(erro){}aplicarFundoPerfil("");const menu=document.getElementById("avatarMenu");menu&&menu.classList.remove("aberto");const input=document.getElementById("perfilFundoUpload");input&&(input.value="")}function carregarFundoPerfilSalvo(){aplicarFundoPerfil(estado.perfilFundoImagem||"")}function formatarModificador(valor){const n=calcularModificador(valor);return n>=0?"+"+n:String(n)}function atualizarModificadoresBatalha(){[["forca","modForca"],["destreza","modDestreza"],["constituicao","modConstituicao"],["inteligencia","modInteligencia"],["sabedoria","modSabedoria"],["carisma","modCarisma"]].forEach(([campo,id])=>{const el=document.getElementById(id),input=document.querySelector(`[data-save="${campo}"]`);el&&(el.textContent=formatarModificador(input?.value||0))});const ca=document.querySelector('[data-save="ca"]')?.value||10,cd=document.querySelector('[data-save="cd"]')?.value||10,caView=document.getElementById("batalhaCaView"),cdView=document.getElementById("batalhaCdView");"function"==typeof atualizarDefesasTotaisBatalha?atualizarDefesasTotaisBatalha():(caView&&(caView.textContent=ca),cdView&&(cdView.textContent=cd))}function salvarListaFichas(){fichas=[...new Set((fichas||["Principal"]).map(limparNomeFicha))],fichas.includes("Principal")||fichas.unshift("Principal"),localStorage.setItem(CHAVE_LISTA,JSON.stringify(fichas))}function atualizarListaFichas(){const seletor=document.getElementById("seletorFicha");seletor&&(seletor.innerHTML="",fichas.forEach(nome=>{const opcao=document.createElement("option");opcao.value=nome,opcao.textContent=nome,nome===fichaAtual&&(opcao.selected=!0),seletor.appendChild(opcao)}))}function novaFicha(){salvar();let nome=prompt("Nome da nova ficha:");nome&&(nome=limparNomeFicha(nome),fichas.includes(nome)?alert("Já existe uma ficha com esse nome."):(fichas.push(nome),salvarListaFichas(),localStorage.setItem(chaveFicha(nome),JSON.stringify({})),fichaAtual=nome,CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),location.reload()))}function duplicarFicha(){salvar();let nome=prompt("Nome da cópia da ficha:");if(!nome)return;if(nome=limparNomeFicha(nome),fichas.includes(nome))return void alert("Já existe uma ficha com esse nome.");const copia=JSON.parse(JSON.stringify(estado||{}));localStorage.setItem(chaveFicha(nome),JSON.stringify(copia)),fichas=[...new Set([...fichas,nome])],salvarListaFichas(),fichaAtual=nome,CHAVE=chaveFicha(nome),localStorage.setItem(CHAVE_ATIVA,fichaAtual),estado=copia,atualizarListaFichas(),alert("Ficha duplicada com sucesso!"),setTimeout(()=>location.reload(),120)}function trocarFicha(nome){salvar(),fichaAtual=limparNomeFicha(nome),CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),location.reload()}function renomearFicha(){if(salvar(),"Principal"===fichaAtual)return void alert("A ficha Principal não pode ser renomeada. Para mudar o nome dela, use duplicar ficha e crie uma cópia com o novo nome.");let novoNome=prompt("Novo nome da ficha:",fichaAtual);if(!novoNome)return;if(novoNome=limparNomeFicha(novoNome),novoNome===fichaAtual)return;if(fichas.includes(novoNome))return void alert("Já existe uma ficha com esse nome.");const chaveAntiga=chaveFicha(fichaAtual),chaveNova=chaveFicha(novoNome),dados=localStorage.getItem(chaveAntiga)||JSON.stringify(estado||{});localStorage.setItem(chaveNova,dados),localStorage.removeItem(chaveAntiga),fichas=fichas.map(nome=>nome===fichaAtual?novoNome:nome),fichaAtual=novoNome,CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),salvarListaFichas(),alert("Ficha renomeada com sucesso!"),location.reload()}function excluirFicha(){if(salvar(),"Principal"===fichaAtual)return void alert("A ficha Principal não pode ser excluída.");if((fichas||[]).length<=1)return void alert("Você precisa manter pelo menos uma ficha.");prompt("Para excluir esta ficha, digite exatamente: "+fichaAtual)===fichaAtual?(localStorage.removeItem(chaveFicha(fichaAtual)),fichas=fichas.filter(nome=>nome!==fichaAtual),fichas.includes("Principal")||fichas.unshift("Principal"),fichaAtual="Principal",CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),salvarListaFichas(),alert("Ficha excluída."),location.reload()):alert("Exclusão cancelada.")}function exportarFicha(){salvar();const dados={app:"Ficha Ninja RPG",versao:"backup-1",criadoEm:(new Date).toISOString(),chave:CHAVE,estado:estado},nomeNinja=(estado.nome||"ninja").toString().trim().replace(/[^\w\-]+/g,"_")||"ninja",arquivo=new Blob([JSON.stringify(dados,null,2)],{type:"application/json"}),url=URL.createObjectURL(arquivo),link=document.createElement("a");link.href=url,link.download="ficha_"+nomeNinja+".json",document.body.appendChild(link),link.click(),link.remove(),URL.revokeObjectURL(url)}function abrirImportarFicha(){const input=document.getElementById("importarFichaInput");input&&input.click()}function importarFicha(event){const arquivo=event.target.files&&event.target.files[0];if(!arquivo)return;const leitor=new FileReader;leitor.onload=function(e){try{const dados=JSON.parse(e.target.result),novoEstado=dados.estado||dados;if(!novoEstado||"object"!=typeof novoEstado||Array.isArray(novoEstado))return void alert("Arquivo inválido. Escolha um backup da ficha.");if(!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?"))return;estado=novoEstado,persistirEstadoLocal(),alert("Ficha importada com sucesso!"),location.reload()}catch(erro){alert("Não foi possível importar. O arquivo precisa estar em formato JSON válido.")}finally{event.target.value=""}},leitor.readAsText(arquivo)}function toggleConfigMenu(){const menu=document.getElementById("configMenu");menu&&menu.classList.toggle("aberto")}function toggleAvatarMenu(){const menu=document.getElementById("avatarMenu");menu&&menu.classList.toggle("aberto")}function calcularModificador(valor){return valor=parseInt(valor||0),Math.floor((valor-10)/2)}function atualizarCAAutomatica(){const campoDestreza=document.getElementById("atributoDestreza")||document.querySelector('[data-save="destreza"]'),campoProficiencia=document.getElementById("bonusProficiencia")||document.querySelector('[data-save="proficiencia"]'),campoBonusCA=document.getElementById("bonusCA")||document.querySelector('[data-save="bonusCA"]'),campoCA=document.getElementById("campoCA")||document.querySelector('[data-save="ca"]');if(!campoCA)return;const destreza=parseInt(campoDestreza?.value||0),proficiencia=parseInt(campoProficiencia?.value||0),bonusCA=parseInt(campoBonusCA?.value||0),ca=10+calcularModificador(destreza)+proficiencia+bonusCA;campoCA.value=ca,estado.ca=String(ca),persistirEstadoLocal(),"function"==typeof atualizarDefesasTotaisBatalha&&atualizarDefesasTotaisBatalha()}function garantirKekkeiArray(){estado.kekkeiGenkai&&Array.isArray(estado.kekkeiGenkai)||(estado.kekkeiGenkai=[])}function salvarKekkeiGenkai(){garantirKekkeiArray(),persistirEstadoLocal()}function adicionarKekkeiGenkai(){garantirKekkeiArray();const nome=prompt("Nome da Kekkei Genkai:");nome&&nome.trim()&&(estado.kekkeiGenkai.push({nome:nome.trim(),nivel:0}),salvarKekkeiGenkai(),renderizarKekkeiGenkai())}function removerKekkeiGenkai(i){garantirKekkeiArray(),confirm("Remover esta Kekkei Genkai?")&&(estado.kekkeiGenkai.splice(i,1),salvarKekkeiGenkai(),renderizarKekkeiGenkai())}function definirNivelKekkei(i,nivel){if(garantirKekkeiArray(),!estado.kekkeiGenkai[i])return;const nivelAtual=Number(estado.kekkeiGenkai[i].nivel||0);estado.kekkeiGenkai[i].nivel=nivelAtual===nivel?nivel-1:nivel,salvarKekkeiGenkai(),renderizarKekkeiGenkai()}function editarNomeKekkei(i){garantirKekkeiArray();const atual=estado.kekkeiGenkai[i]?.nome||"",novo=prompt("Nome da Kekkei Genkai:",atual);null!==novo&&novo.trim()&&(estado.kekkeiGenkai[i].nome=novo.trim(),salvarKekkeiGenkai(),renderizarKekkeiGenkai())}function renderizarKekkeiGenkai(){garantirKekkeiArray();const lista=document.getElementById("kekkeiLista");if(!lista)return;const html=[];estado.kekkeiGenkai.forEach((k,i)=>{const nome=String(k.nome||"Kekkei Genkai").trim(),nivel=Number(k.nivel||0);let bolinhas="";for(let n=1;n<=6;n++)bolinhas+=`\n        <button type="button" class="kekkeiNivel ${n<=nivel?"ativo":""}" onclick="definirNivelKekkei(${i},${n})" aria-label="Nível ${n}"></button>\n      `;html.push(`\n      <div class="kekkeiNaturezaCard">\n        <div class="kekkeiInfo" onclick="editarNomeKekkei(${i})">\n          <span class="kekkeiIcone">🧬</span>\n          <div class="kekkeiTexto">\n            <div class="kekkeiNome">${nome}</div>\n            <div class="kekkeiNivelTexto">${nivel}/6</div>\n          </div>\n        </div>\n\n        <div class="kekkeiNiveis">\n          ${bolinhas}\n        </div>\n\n        <button type="button" class="removerKekkeiBtn" onclick="removerKekkeiGenkai(${i})">×</button>\n      </div>\n    `)}),lista.innerHTML=html.join("")}document.addEventListener("click",function(e){const config=document.querySelector(".configGlobal"),avatar=document.querySelector(".avatarAreaNovo");if(config&&!config.contains(e.target)){const menu=document.getElementById("configMenu");menu&&menu.classList.remove("aberto")}if(avatar&&!avatar.contains(e.target)){const menu=document.getElementById("avatarMenu");menu&&menu.classList.remove("aberto")}}),carregar(),atualizarListaFichas(),document.addEventListener("input",function(e){e.target&&["destreza","proficiencia","bonusCA"].includes(e.target.dataset.save)&&atualizarCAAutomatica()}),document.addEventListener("change",function(e){e.target&&["destreza","proficiencia","bonusCA"].includes(e.target.dataset.save)&&atualizarCAAutomatica()}),document.addEventListener("DOMContentLoaded",function(){setTimeout(atualizarCAAutomatica,200)}),document.addEventListener("DOMContentLoaded",function(){setTimeout(renderizarKekkeiGenkai,120)}),window.addEventListener("pageshow",function(){try{const salvo=JSON.parse(localStorage.getItem(CHAVE)||"{}");salvo&&"object"==typeof salvo&&(estado=salvo)}catch(e){}renderizarKekkeiGenkai()}),window.abasSwipe=["identidade","atributos","jutsus","anotacoes","inventario","batalha"],window.abaSwipeAtual=0;let swipeStartX=0,swipeStartY=0,swipeDx=0,swipeDragging=!1,swipeBloqueado=!1,swipeFrame=null;function alvoBloqueiaSwipe(el){return!!el?.closest("input, textarea, select, button, .menu, .naturezaNivel, .kekkeiNivel, .avatarMenu, .configMenu")}function sincronizarAbaSwipe(){const ativa=document.querySelector(".pagina.ativa");if(!ativa)return;const idx=window.abasSwipe.indexOf(ativa.id);idx>=0&&(window.abaSwipeAtual=idx)}function aplicarMovimentoSwipe(){swipeFrame=null;const ativa=document.querySelector(".pagina.ativa");ativa&&(ativa.style.transition="none",ativa.style.transform=`translate3d(${.28*swipeDx}px,0,0)`)}function garantirInventarioItens(){estado.inventarioItens&&Array.isArray(estado.inventarioItens)||(estado.inventarioItens=[])}function salvarInventarioItens(){garantirInventarioItens(),persistirEstadoLocal()}function adicionarItemInventario(){garantirInventarioItens();const nome=prompt("Nome do item:");if(!nome||!nome.trim())return;let quantidade=prompt("Quantidade:","1");quantidade=parseInt(quantidade||"1"),(isNaN(quantidade)||quantidade<0)&&(quantidade=1),estado.inventarioItens.push({nome:nome.trim(),quantidade:quantidade}),salvarInventarioItens(),renderizarInventario()}function editarNomeItemInventario(i){garantirInventarioItens();const atual=estado.inventarioItens[i]?.nome||"",novo=prompt("Nome do item:",atual);null!==novo&&novo.trim()&&(estado.inventarioItens[i].nome=novo.trim(),salvarInventarioItens(),renderizarInventario())}function alterarQtdItemInventario(i,valor){if(garantirInventarioItens(),!estado.inventarioItens[i])return;let qtd=parseInt(valor||0);(isNaN(qtd)||qtd<0)&&(qtd=0),estado.inventarioItens[i].quantidade=qtd,salvarInventarioItens()}function removerItemInventario(i){garantirInventarioItens(),confirm("Remover este item do inventário?")&&(estado.inventarioItens.splice(i,1),salvarInventarioItens(),renderizarInventario())}function renderizarInventario(){garantirInventarioItens();const lista=document.getElementById("listaInventario");if(!lista)return;lista.innerHTML="";const html=[];0!==estado.inventarioItens.length?(estado.inventarioItens.forEach((item,i)=>{const nome=String(item.nome||"Item").replace(/</g,"&lt;").replace(/>/g,"&gt;"),qtd=Number(item.quantidade||0);html.push(`\n      <div class="itemInventario">\n        <div class="itemInventarioNome" onclick="editarNomeItemInventario(${i})"><span class="itemInventarioIcone">${iconeInventario(nome)}</span><span>${nome}</span></div>\n        <input class="itemInventarioQtd" type="number" value="${qtd}" min="0" inputmode="numeric" onchange="alterarQtdItemInventario(${i}, this.value)" oninput="alterarQtdItemInventario(${i}, this.value)">\n        <button type="button" class="btnRemoverItemInventario" onclick="removerItemInventario(${i})">×</button>\n      </div>\n    `)}),lista.innerHTML=html.join("")):lista.innerHTML='\n      <div class="itemInventario">\n        <div class="itemInventarioNome" style="opacity:.65; cursor:default;">Nenhum item adicionado</div>\n        <input class="itemInventarioQtd" type="number" value="0" disabled>\n        <button type="button" class="btnRemoverItemInventario" disabled>×</button>\n      </div>\n    '}function iconeInventario(nome){const n=normalizarTextoInventario?normalizarTextoInventario(nome):String(nome||"").toLowerCase();return n?n.includes("shuriken")?"✴️":n.includes("kunai")?"🔪":n.includes("agulha")||n.includes("agulhas")||n.includes("senbon")?"🪡":n.includes("fio")||n.includes("fios")||n.includes("linha")||n.includes("arame")?"🧵":n.includes("comida")||n.includes("alimento")||n.includes("lanche")||n.includes("racao")||n.includes("ração")?"🍙":n.includes("pergaminho")||n.includes("scroll")?"📜":n.includes("bomba")||n.includes("explosivo")?"💣":n.includes("selo")||n.includes("papel bomba")||n.includes("tarja")?"🏷️":n.includes("pocao")||n.includes("poção")||n.includes("remedio")||n.includes("remédio")?"🧪":n.includes("bandagem")||n.includes("curativo")?"🩹":n.includes("espada")||n.includes("katana")?"🗡️":n.includes("mascara")||n.includes("máscara")?"🎭":n.includes("dinheiro")||n.includes("ryo")||n.includes("ryou")?"💰":"🎒":"🎒"}function normalizarTextoInventario(txt){return String(txt||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function buscarItemInventarioPorNome(nome){garantirInventarioItens();const alvo=normalizarTextoInventario(nome);return alvo?estado.inventarioItens.findIndex(item=>normalizarTextoInventario(item.nome)===alvo):-1}function vincularItemAtaque(i){estado.armados=estado.armados||[],garantirInventarioItens();const ataque=estado.armados[i];if(!ataque)return;let sugestao=ataque.itemInventario||ataque.nome||"";if(estado.inventarioItens.length){const lista=estado.inventarioItens.map(item=>item.nome).join(", "),escolhido=prompt("Qual item do inventário esse ataque usa?\\n\\nItens disponíveis: "+lista,sugestao);if(null===escolhido)return;ataque.itemInventario=escolhido.trim()}else{const escolhido=prompt("Qual item do inventário esse ataque usa?",sugestao);if(null===escolhido)return;ataque.itemInventario=escolhido.trim()}!ataque.itemInventario&&ataque.nome&&(ataque.itemInventario=ataque.nome),ataque.quantidadeUso||(ataque.quantidadeUso="1"),persistirSemRender(),renderizarArmados()}function editarQtdUsoAtaque(i){estado.armados=estado.armados||[];const ataque=estado.armados[i];if(!ataque)return;let atual=ataque.quantidadeUso||"1",nova=prompt("Quantos itens esse ataque consome por uso?",atual);null!==nova&&(nova=parseInt(nova||"1"),(isNaN(nova)||nova<1)&&(nova=1),ataque.quantidadeUso=String(nova),persistirSemRender(),renderizarArmados())}async function usarAtaqueInventario(i){
  estado.armados=estado.armados||[];
  garantirInventarioItens();

  const ataque=estado.armados[i];
  if(!ataque)return;

  const nomeAtaque=ataque.nome||"Ataque";
  const itemVinculado=String(ataque.itemInventario||"").trim();

  if(!itemVinculado){
    await avisoShinobi("Item não vinculado",'Antes de usar, toque em "Item usado" e vincule esse ataque a um item do inventário.');
    return;
  }

  const qtdUso=Math.max(1,parseInt(ataque.quantidadeUso||"1"));
  const idxItem=buscarItemInventarioPorNome(itemVinculado);

  if(idxItem<0){
    await avisoShinobi("Item não encontrado",`Não encontrei "${itemVinculado}" no inventário.\\nAdicione esse item no Inventário ou ajuste o nome em "Item usado".`);
    return;
  }

  const item=estado.inventarioItens[idxItem];
  const qtdAtual=parseInt(item.quantidade||0);

  if(qtdAtual<qtdUso){
    await avisoShinobi("Quantidade insuficiente",`Você tem: ${qtdAtual}\\nPrecisa: ${qtdUso}`);
    return;
  }

  const ok=await confirmarUsoAcao("ataque",nomeAtaque,`Item consumido: ${item.nome}\\nQuantidade: ${qtdUso}\\nRestará: ${qtdAtual-qtdUso}`);
  if(!ok)return;

  item.quantidade=qtdAtual-qtdUso;
  salvarInventarioItens();
  persistirSemRender();

  if(typeof registrarLog==="function")registrarLog(`${nomeAtaque} usado. Consumiu ${qtdUso}x ${item.nome}.`);
  else avisoShinobi("Ataque usado",`${nomeAtaque} usado. Consumiu ${qtdUso}x ${item.nome}.`);

  renderizarInventario();
  renderizarArmados();
}function autoExpandirCampoNotas(){const campo=document.querySelector('#anotacoes textarea[data-save="notas"]');campo&&(campo.style.height="auto",campo.style.height=Math.max(campo.scrollHeight,campo.offsetHeight)+"px")}document.addEventListener("touchstart",function(e){e.touches&&1===e.touches.length&&(swipeBloqueado=alvoBloqueiaSwipe(e.target),swipeBloqueado||(swipeStartX=e.touches[0].clientX,swipeStartY=e.touches[0].clientY,swipeDx=0,swipeDragging=!0,sincronizarAbaSwipe()))},{passive:!0}),document.addEventListener("touchmove",function(e){if(!swipeDragging||swipeBloqueado)return;const toque=e.touches[0],dx=toque.clientX-swipeStartX,dy=toque.clientY-swipeStartY;Math.abs(dy)>1.15*Math.abs(dx)||(swipeDx=dx,swipeFrame||(swipeFrame=requestAnimationFrame(aplicarMovimentoSwipe)))},{passive:!0}),document.addEventListener("touchend",function(e){if(!swipeDragging||swipeBloqueado)return;swipeDragging=!1,swipeFrame&&(cancelAnimationFrame(swipeFrame),swipeFrame=null);const dx=e.changedTouches[0].clientX-swipeStartX,ativa=document.querySelector(".pagina.ativa");if(ativa&&(ativa.style.transition="transform .14s ease-out",ativa.style.transform="translate3d(0,0,0)",setTimeout(()=>{ativa.style.transition="",ativa.style.transform=""},150)),Math.abs(dx)<85)return;const novoIndice=dx<0?window.abaSwipeAtual+1:window.abaSwipeAtual-1;novoIndice<0||novoIndice>=window.abasSwipe.length||(abrirPagina(window.abasSwipe[novoIndice]),window.abaSwipeAtual=novoIndice)},{passive:!0}),document.addEventListener("DOMContentLoaded",sincronizarAbaSwipe),document.addEventListener("DOMContentLoaded",function(){setTimeout(renderizarInventario,120)}),window.addEventListener("pageshow",function(){try{const salvo=JSON.parse(localStorage.getItem(CHAVE)||"{}");salvo&&"object"==typeof salvo&&(estado=salvo)}catch(e){}renderizarInventario()}),document.addEventListener("input",function(e){e.target&&e.target.matches('#anotacoes textarea[data-save="notas"]')&&autoExpandirCampoNotas()}),document.addEventListener("DOMContentLoaded",function(){setTimeout(autoExpandirCampoNotas,180)}),window.addEventListener("pageshow",function(){setTimeout(autoExpandirCampoNotas,180)});const bonusBatalhaAtributos={forca:0,destreza:0,constituicao:0,inteligencia:0,sabedoria:0,carisma:0};function lerBonusAtributosBatalha(){document.querySelectorAll("[data-bonus-batalha]").forEach(input=>{const chave=input.getAttribute("data-bonus-batalha");bonusBatalhaAtributos[chave]=Number(input.value||0)})}function valorAtributoComBonusBatalha(chave){return Number(document.querySelector(`[data-save="${chave}"]`)?.value||0)+Number(bonusBatalhaAtributos[chave]||0)}function modificadorComBonusBatalha(chave){return Math.floor((valorAtributoComBonusBatalha(chave)-10)/2)}function formatarModBatalha(v){return v>=0?"+"+v:String(v)}function atualizarModsBatalhaComBonus(){lerBonusAtributosBatalha(),[["forca","modForca"],["destreza","modDestreza"],["constituicao","modConstituicao"],["inteligencia","modInteligencia"],["sabedoria","modSabedoria"],["carisma","modCarisma"]].forEach(([chave,id])=>{const el=document.getElementById(id);if(!el)return;const mod=modificadorComBonusBatalha(chave),bonus=Number(bonusBatalhaAtributos[chave]||0);el.innerHTML=formatarModBatalha(mod)+(bonus?`<span class="bonusAplicadoTexto">+${bonus} atr.</span>`:"")})}async function limparBonusAtributosBatalha(){
  const ok=await confirmarUsoAcao("bônus temporários","Limpar bônus de atributos","Todos os bônus temporários de FOR, DES, CON, INT, SAB e CAR serão zerados.");
  if(!ok)return;

  document.querySelectorAll("[data-bonus-batalha]").forEach(input=>input.value=0);

  if(typeof bonusBatalhaAtributos!=="undefined"){
    Object.keys(bonusBatalhaAtributos).forEach(k=>bonusBatalhaAtributos[k]=0);
  }

  atualizarModsBatalhaComBonus();

  if(typeof logar==="function")logar("Bônus temporários de atributos removidos.");
  else if(typeof log==="function")log("Bônus temporários de atributos removidos.");
}
function numeroBatalha(valor,padrao=0){const n=Number(valor);return Number.isFinite(n)?n:padrao}function obterBaseCaBatalha(){const campoCA=document.getElementById("campoCA")||document.querySelector('[data-save="ca"]');return numeroBatalha(campoCA?.value,10)}function obterBaseCdBatalha(){const campoCD=document.querySelector('[data-save="cd"]');return numeroBatalha(campoCD?.value,10)}function obterBonusDefesaBatalha(tipo){return numeroBatalha(document.querySelector(`[data-bonus-defesa-batalha="${tipo}"]`)?.value,0)}function atualizarDefesasTotaisBatalha(){const caBase=obterBaseCaBatalha(),cdBase=obterBaseCdBatalha(),bonusCA=obterBonusDefesaBatalha("ca"),bonusCD=obterBonusDefesaBatalha("cd"),caTotal=caBase+bonusCA,cdTotal=cdBase+bonusCD,caView=document.getElementById("batalhaCaView"),cdView=document.getElementById("batalhaCdView");caView&&(caView.innerHTML=String(caTotal)+(bonusCA?`<span class="bonusDefesaTexto">+${bonusCA} bônus</span>`:"")),cdView&&(cdView.innerHTML=String(cdTotal)+(bonusCD?`<span class="bonusDefesaTexto">+${bonusCD} bônus</span>`:""))}async function zerarBonusDefesasBatalha(){
  const ok=await confirmarUsoAcao("bônus temporários","Limpar bônus de CA/CD","Os bônus temporários de CA e CD serão zerados.");
  if(!ok)return;

  document.querySelectorAll("[data-bonus-defesa-batalha]").forEach(input=>input.value=0);
  if(typeof atualizarDefesasTotaisBatalha==="function")atualizarDefesasTotaisBatalha();
  if(typeof logar==="function")logar("Bônus temporários de CA/CD removidos.");
  else if(typeof log==="function")log("Bônus temporários de CA/CD removidos.");
}
function garantirTopicosNotas(){estado.notasTopicos&&Array.isArray(estado.notasTopicos)||(estado.notasTopicos=[],estado.notas&&String(estado.notas).trim()&&estado.notasTopicos.push({titulo:"Anotações da campanha",texto:String(estado.notas||""),aberto:!0}))}function salvarTopicosNotas(){garantirTopicosNotas(),persistirEstadoLocal()}function escaparHtmlNotas(txt){return String(txt||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function adicionarTopicoNota(){garantirTopicosNotas();const titulo=prompt("Título do tópico:","Novo tópico");null!==titulo&&(estado.notasTopicos.push({titulo:titulo.trim()||"Novo tópico",texto:"",aberto:!0}),salvarTopicosNotas(),renderizarTopicosNotas())}function alternarTopicoNota(i){garantirTopicosNotas(),estado.notasTopicos[i]&&(estado.notasTopicos[i].aberto=!estado.notasTopicos[i].aberto,salvarTopicosNotas(),renderizarTopicosNotas())}function editarTituloTopicoNota(i,ev){ev&&ev.stopPropagation(),garantirTopicosNotas();const topico=estado.notasTopicos[i];if(!topico)return;const novo=prompt("Editar título do tópico:",topico.titulo||"Novo tópico");null!==novo&&(topico.titulo=novo.trim()||"Novo tópico",salvarTopicosNotas(),renderizarTopicosNotas())}function removerTopicoNota(i,ev){ev&&ev.stopPropagation(),garantirTopicosNotas(),estado.notasTopicos[i]&&confirm("Remover este tópico de notas?")&&(estado.notasTopicos.splice(i,1),salvarTopicosNotas(),renderizarTopicosNotas())}function atualizarTextoTopicoNota(i,valor){garantirTopicosNotas(),estado.notasTopicos[i]&&(estado.notasTopicos[i].texto=valor,salvarTopicosNotas())}function renderizarTopicosNotas(){garantirTopicosNotas();const lista=document.getElementById("listaTopicosNotas");if(!lista)return;const html=[];estado.notasTopicos.length?(estado.notasTopicos.forEach((topico,i)=>{const aberto=topico.aberto?"aberto":"",seta=topico.aberto?"▼":"▶",titulo=escaparHtmlNotas(topico.titulo||"Novo tópico"),texto=escaparHtmlNotas(topico.texto||"");html.push(`\n      <div class="topicoNotaCard ${aberto}">\n        <div class="topicoNotaHeader" onclick="alternarTopicoNota(${i})">\n          <span class="topicoNotaSeta">${seta}</span>\n          <span class="topicoNotaTitulo">${titulo}</span>\n          <button type="button" class="topicoNotaEditar" onclick="editarTituloTopicoNota(${i}, event)">✎</button>\n          <button type="button" class="topicoNotaRemover" onclick="removerTopicoNota(${i}, event)">×</button>\n        </div>\n        <div class="topicoNotaConteudo">\n          <textarea placeholder="Escreva as anotações deste tópico..." oninput="atualizarTextoTopicoNota(${i}, this.value)">${texto}</textarea>\n        </div>\n      </div>\n    `)}),lista.innerHTML=html.join("")):lista.innerHTML='<div class="notaVazia">Nenhum tópico criado ainda.</div>'}document.addEventListener("input",function(e){e.target&&e.target.matches("[data-bonus-batalha]")&&atualizarModsBatalhaComBonus()}),document.addEventListener("DOMContentLoaded",function(){setTimeout(atualizarModsBatalhaComBonus,180)}),window.addEventListener("pageshow",function(){setTimeout(atualizarModsBatalhaComBonus,180)}),document.addEventListener("input",function(e){e.target&&(e.target.matches("[data-bonus-defesa-batalha]")||e.target.matches('[data-save="ca"]')||e.target.matches('[data-save="cd"]')||e.target.matches('[data-save="bonusCA"]')||e.target.matches('[data-save="destreza"]')||e.target.matches('[data-save="proficiencia"]'))&&setTimeout(atualizarDefesasTotaisBatalha,30)}),document.addEventListener("change",function(e){e.target&&(e.target.matches("[data-bonus-defesa-batalha]")||e.target.matches('[data-save="ca"]')||e.target.matches('[data-save="cd"]')||e.target.matches('[data-save="bonusCA"]')||e.target.matches('[data-save="destreza"]')||e.target.matches('[data-save="proficiencia"]'))&&setTimeout(atualizarDefesasTotaisBatalha,30)}),document.addEventListener("DOMContentLoaded",function(){setTimeout(atualizarDefesasTotaisBatalha,180)}),window.addEventListener("pageshow",function(){setTimeout(atualizarDefesasTotaisBatalha,180)}),document.addEventListener("DOMContentLoaded",function(){setTimeout(renderizarTopicosNotas,180)}),window.addEventListener("pageshow",function(){setTimeout(renderizarTopicosNotas,180)});let jutsuUploadIndiceAtual=null;function abrirUploadImagemJutsu(i){jutsuUploadIndiceAtual=i;const input=document.getElementById("jutsuUploadGlobalSeguro");input?(input.value="",input.click()):alert("Campo de imagem não encontrado. Recarregue o app e tente novamente.")}function removerImagemJutsu(i){const indice=Number(i);if(estado.jutsus&&estado.jutsus[indice]){estado.jutsus[indice].imagem="",estado.jutsusAbertos=estado.jutsusAbertos||{},estado.jutsusAbertos[indice]=!0;try{persistirEstadoLocal()}catch(err){}"function"==typeof renderizarJutsus&&renderizarJutsus()}}document.addEventListener("DOMContentLoaded",function(){const input=document.getElementById("jutsuUploadGlobalSeguro");input&&!input.dataset.configurado&&(input.dataset.configurado="1",input.addEventListener("change",function(ev){carregarImagemJutsu(ev,jutsuUploadIndiceAtual)}))}),window.addEventListener("pageshow",function(){const input=document.getElementById("jutsuUploadGlobalSeguro");input&&!input.dataset.configurado&&(input.dataset.configurado="1",input.addEventListener("change",function(ev){carregarImagemJutsu(ev,jutsuUploadIndiceAtual)}))});

/* ===== Performance v3: salvamento seguro e tarefas leves ===== */
(function(){
  if(window.__performanceV3Ativa) return;
  window.__performanceV3Ativa = true;

  const idle = window.requestIdleCallback || function(fn){ return setTimeout(fn, 120); };
  const cancelIdle = window.cancelIdleCallback || clearTimeout;

  let salvarTimerV3 = null;
  let salvarIdleV3 = null;

  window.salvarLeveV3 = function(){
    if(typeof estado === 'undefined' || typeof CHAVE === 'undefined') return;

    if(salvarTimerV3) clearTimeout(salvarTimerV3);
    if(salvarIdleV3) cancelIdle(salvarIdleV3);

    salvarTimerV3 = setTimeout(function(){
      salvarIdleV3 = idle(function(){
        try{
          localStorage.setItem(CHAVE, JSON.stringify(estado));
        }catch(err){
          console.warn('Armazenamento cheio ou indisponível:', err);
          if(!window.__alertaStorageCheioV3){
            window.__alertaStorageCheioV3 = true;
            setTimeout(function(){
              alert('O armazenamento do app está quase cheio. Se estiver usando muitas imagens nos jutsus, tente remover algumas imagens ou usar imagens menores.');
              window.__alertaStorageCheioV3 = false;
            }, 80);
          }
        }
      });
    }, 180);
  };

  window.salvarImediatoV3 = function(){
    if(typeof estado === 'undefined' || typeof CHAVE === 'undefined') return;
    try{
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    }catch(err){
      console.warn('Erro ao salvar imediatamente:', err);
    }
  };

  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden'){
      window.salvarImediatoV3();
    }
  });

  window.addEventListener('pagehide', function(){
    window.salvarImediatoV3();
  });
})();

/* ===== Notas: autoajuste de altura conforme o texto ===== */
function ajustarAlturaTextareaNota(el){
  if(!el) return;

  const estilo = getComputedStyle(el);
  const maxHeight = parseFloat(estilo.maxHeight) || (window.innerHeight * 0.62);

  el.style.height = 'auto';

  const novaAltura = Math.min(el.scrollHeight + 6, maxHeight);
  el.style.height = novaAltura + 'px';

  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function ajustarTodasNotasAbertas(){
  document.querySelectorAll('#anotacoes .topicoNotaConteudo textarea').forEach(ajustarAlturaTextareaNota);
}

document.addEventListener('input', function(ev){
  if(ev.target && ev.target.matches('#anotacoes .topicoNotaConteudo textarea')){
    ajustarAlturaTextareaNota(ev.target);
  }
});

window.addEventListener('resize', function(){
  setTimeout(ajustarTodasNotasAbertas, 80);
});

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(ajustarTodasNotasAbertas, 220);
});

window.addEventListener('pageshow', function(){
  setTimeout(ajustarTodasNotasAbertas, 220);
});

if(typeof alternarTopicoNota === 'function' && !window.__alternarTopicoNotaComAutoAltura){
  window.__alternarTopicoNotaComAutoAltura = true;
  const alternarTopicoNotaOriginal = alternarTopicoNota;
  window.alternarTopicoNota = function(i){
    const r = alternarTopicoNotaOriginal(i);
    setTimeout(ajustarTodasNotasAbertas, 90);
    return r;
  };
}

if(typeof renderizarTopicosNotas === 'function' && !window.__renderizarTopicosNotasComAutoAltura){
  window.__renderizarTopicosNotasComAutoAltura = true;
  const renderizarTopicosNotasOriginal = renderizarTopicosNotas;
  window.renderizarTopicosNotas = function(){
    const r = renderizarTopicosNotasOriginal();
    setTimeout(ajustarTodasNotasAbertas, 90);
    return r;
  };
}

/* ===== Inventário: usar item com modal Shinobi ===== */
async function usarItemInventario(i){
  garantirInventarioItens();

  const item=estado.inventarioItens[i];
  if(!item)return;

  const nome=item.nome||"Item";
  const atual=Number(item.quantidade||0);

  if(atual<=0){
    await avisoShinobi("Sem quantidade", "Esse item está sem quantidade disponível.");
    return;
  }

  let quantidade=prompt(`Usar quantos de "${nome}"?`,"1");
  if(quantidade===null)return;

  quantidade=parseInt(quantidade||"1",10);
  if(isNaN(quantidade)||quantidade<1)quantidade=1;

  if(quantidade>atual){
    await avisoShinobi("Quantidade insuficiente",`Você só tem ${atual} desse item.`);
    return;
  }

  const ok=await confirmarUsoAcao("item",nome,`Quantidade: ${quantidade}\nRestará: ${atual-quantidade}`);
  if(!ok)return;

  item.quantidade=atual-quantidade;
  salvarInventarioItens();

  if(typeof registrarLog==="function")registrarLog(`Usou ${quantidade}x ${nome}.`);

  renderizarInventario();
}

/* ===== Jutsus: reforço visual por elemento após renderização ===== */
function aplicarCoresCartasJutsu(){
  const cards=document.querySelectorAll('#jutsus .jutsuListaCard');
  cards.forEach(card=>{
    const texto=(card.innerText||'').toLowerCase();

    const mapa=[
      ['katon','jutsu-katon'],
      ['fogo','jutsu-katon'],
      ['suiton','jutsu-suiton'],
      ['água','jutsu-suiton'],
      ['agua','jutsu-suiton'],
      ['raiton','jutsu-raiton'],
      ['raio','jutsu-raiton'],
      ['fuuton','jutsu-fuuton'],
      ['vento','jutsu-fuuton'],
      ['doton','jutsu-doton'],
      ['terra','jutsu-doton'],
      ['yinton','jutsu-yin'],
      ['yin','jutsu-yin'],
      ['youton','jutsu-yang'],
      ['yang','jutsu-yang']
    ];

    if(!Array.from(card.classList).some(c=>c.startsWith('jutsu-'))){
      const achado=mapa.find(([termo])=>texto.includes(termo));
      card.classList.add(achado?achado[1]:'jutsu-neutro');
    }

    if(card.style.backgroundImage && card.style.backgroundImage !== 'none'){
      card.classList.add('temImagemJutsu');
    }
  });
}

if(typeof renderizarJutsus==='function' && !window.__renderizarJutsusCoresElemento){
  window.__renderizarJutsusCoresElemento=true;
  const renderizarJutsusOriginalCores=renderizarJutsus;
  window.renderizarJutsus=function(){
    const r=renderizarJutsusOriginalCores.apply(this,arguments);
    setTimeout(aplicarCoresCartasJutsu,40);
    return r;
  };
}

document.addEventListener('DOMContentLoaded',()=>setTimeout(aplicarCoresCartasJutsu,180));
window.addEventListener('pageshow',()=>setTimeout(aplicarCoresCartasJutsu,180));

/* ===== Notas: autoaltura com limite seguro no pergaminho ===== */
function ajustarAlturaTextareaNotaSeguro(el){
  if(!el) return;

  const isMobile = window.matchMedia('(max-width:600px)').matches;
  const limiteTela = window.innerHeight * (isMobile ? 0.56 : 0.62);
  const limiteFinal = Math.min(limiteTela, isMobile ? 460 : 520);

  el.style.height = 'auto';

  const alturaConteudo = el.scrollHeight + 8;
  const novaAltura = Math.min(alturaConteudo, limiteFinal);

  el.style.height = novaAltura + 'px';
  el.style.overflowY = alturaConteudo > limiteFinal ? 'auto' : 'hidden';
}

function ajustarNotasAbertasSeguro(){
  document.querySelectorAll('#anotacoes .topicoNotaConteudo textarea').forEach(ajustarAlturaTextareaNotaSeguro);
}

document.addEventListener('input', function(ev){
  if(ev.target && ev.target.matches('#anotacoes .topicoNotaConteudo textarea')){
    ajustarAlturaTextareaNotaSeguro(ev.target);
  }
});

window.addEventListener('resize', function(){
  setTimeout(ajustarNotasAbertasSeguro, 100);
});

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(ajustarNotasAbertasSeguro, 250);
});

window.addEventListener('pageshow', function(){
  setTimeout(ajustarNotasAbertasSeguro, 250);
});

if(typeof alternarTopicoNota === 'function' && !window.__notasAlturaLimitadaV2){
  window.__notasAlturaLimitadaV2 = true;
  const alternarTopicoNotaBaseV2 = alternarTopicoNota;
  window.alternarTopicoNota = function(i){
    const r = alternarTopicoNotaBaseV2.apply(this, arguments);
    setTimeout(ajustarNotasAbertasSeguro, 120);
    return r;
  };
}

if(typeof renderizarTopicosNotas === 'function' && !window.__renderNotasAlturaLimitadaV2){
  window.__renderNotasAlturaLimitadaV2 = true;
  const renderizarTopicosNotasBaseV2 = renderizarTopicosNotas;
  window.renderizarTopicosNotas = function(){
    const r = renderizarTopicosNotasBaseV2.apply(this, arguments);
    setTimeout(ajustarNotasAbertasSeguro, 120);
    return r;
  };
}

/* ===== Formatador automático de imagem para cartas de jutsu ===== */
/* Converte a imagem para WebP/JPEG leve antes de salvar no app. */

function formatarImagemCartaJutsu(arquivo, opcoes = {}){
  return new Promise((resolve, reject)=>{
    if(!arquivo || !arquivo.type || !arquivo.type.startsWith('image/')){
      reject(new Error('Arquivo inválido.'));
      return;
    }

    const maxLargura = opcoes.maxLargura || 720;
    const maxAltura = opcoes.maxAltura || 960;
    const qualidadeWebp = opcoes.qualidadeWebp || 0.68;
    const qualidadeJpeg = opcoes.qualidadeJpeg || 0.72;

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));

    reader.onload = function(e){
      const img = new Image();

      img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'));

      img.onload = function(){
        let largura = img.width;
        let altura = img.height;

        const escala = Math.min(maxLargura / largura, maxAltura / altura, 1);

        largura = Math.max(1, Math.round(largura * escala));
        altura = Math.max(1, Math.round(altura * escala));

        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext('2d', { alpha:false });

        ctx.fillStyle = '#101010';
        ctx.fillRect(0, 0, largura, altura);
        ctx.drawImage(img, 0, 0, largura, altura);

        let dataUrl = '';

        try{
          dataUrl = canvas.toDataURL('image/webp', qualidadeWebp);

          if(!dataUrl || !dataUrl.startsWith('data:image/webp')){
            dataUrl = canvas.toDataURL('image/jpeg', qualidadeJpeg);
          }
        }catch(err){
          dataUrl = canvas.toDataURL('image/jpeg', qualidadeJpeg);
        }

        resolve(dataUrl);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(arquivo);
  });
}

async function carregarImagemJutsu(event, i){
  const arquivo = event?.target?.files?.[0];
  if(!arquivo) return;

  const indice = Number.isInteger(Number(i)) ? Number(i) : Number(window.jutsuUploadIndiceAtual ?? -1);

  if(!estado.jutsus || !estado.jutsus[indice]){
    if(typeof avisoShinobi === 'function') await avisoShinobi('Jutsu não encontrado', 'Reabra a carta e tente adicionar a imagem novamente.');
    else alert('Jutsu não encontrado.');
    return;
  }

  try{
    const antesKB = Math.round(arquivo.size / 1024);
    const imagemFormatada = await formatarImagemCartaJutsu(arquivo, {
      maxLargura: 720,
      maxAltura: 960,
      qualidadeWebp: 0.68,
      qualidadeJpeg: 0.72
    });

    const depoisKB = Math.round((imagemFormatada.length * 0.75) / 1024);

    estado.jutsus[indice].imagem = imagemFormatada;
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    estado.jutsusAbertos[indice] = true;

    try{
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    }catch(err){
      if(typeof avisoShinobi === 'function'){
        await avisoShinobi('Imagem ainda pesada', 'A imagem foi reduzida, mas o armazenamento do app está cheio. Tente remover algumas imagens antigas ou usar uma imagem mais simples.');
      }else{
        alert('A imagem ainda ficou pesada para salvar.');
      }
      return;
    }

    if(typeof renderizarJutsus === 'function') renderizarJutsus();

    console.log(`Imagem do jutsu otimizada: ${antesKB}KB → ~${depoisKB}KB`);
  }catch(err){
    console.error(err);
    if(typeof avisoShinobi === 'function') await avisoShinobi('Erro na imagem', 'Não consegui formatar essa imagem. Tente outra imagem.');
    else alert('Não consegui formatar essa imagem.');
  }finally{
    if(event?.target) event.target.value = '';
  }
}

async function carregarFundoCartaJutsu(i, ev){
  return carregarImagemJutsu(ev, i);
}

async function uploadFundoJutsu(i, ev){
  return carregarImagemJutsu(ev, i);
}

if(typeof abrirUploadImagemJutsu === 'function' && !window.__abrirUploadImagemJutsuFormatado){
  window.__abrirUploadImagemJutsuFormatado = true;
  const abrirUploadImagemJutsuBase = abrirUploadImagemJutsu;
  window.abrirUploadImagemJutsu = function(i){
    window.jutsuUploadIndiceAtual = i;
    return abrirUploadImagemJutsuBase.apply(this, arguments);
  };
}

/* ===== CORREÇÃO SEGURA: troca/remoção de imagem de jutsu sem corromper salvamento ===== */
/* Mantém a imagem antiga se a nova não couber. Ao remover, só atualiza a tela depois que a remoção foi salva. */

(function(){
  if(window.__jutsuImagemSalvamentoSeguroV4) return;
  window.__jutsuImagemSalvamentoSeguroV4 = true;

  function alertaJutsuSeguro(titulo, texto){
    if(typeof avisoShinobi === "function") return avisoShinobi(titulo, texto);
    alert(texto || titulo);
    return Promise.resolve();
  }

  function clonarEstadoSeguro(){
    return JSON.parse(JSON.stringify(estado));
  }

  function salvarEstadoTeste(novoEstado){
    localStorage.setItem(CHAVE, JSON.stringify(novoEstado));
  }

  function aplicarImagemNoEstadoAtual(indice, imagem){
    estado.jutsus[indice].imagem = imagem || "";
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    estado.jutsusAbertos[indice] = true;
  }

  function salvarImagemJutsuTransacional(indice, imagem){
    const novoEstado = clonarEstadoSeguro();

    novoEstado.jutsus = novoEstado.jutsus || [];
    if(!novoEstado.jutsus[indice]) throw new Error("Jutsu não encontrado.");

    novoEstado.jutsus[indice].imagem = imagem || "";
    novoEstado.jutsusAbertos = novoEstado.jutsusAbertos || {};
    novoEstado.jutsusAbertos[indice] = true;

    salvarEstadoTeste(novoEstado);
    aplicarImagemNoEstadoAtual(indice, imagem || "");
  }

  function criarImagemOtimizada(arquivo, opcoes){
    opcoes = opcoes || {};

    return new Promise((resolve, reject)=>{
      if(!arquivo || !arquivo.type || !arquivo.type.startsWith("image/")){
        reject(new Error("Arquivo inválido."));
        return;
      }

      const reader = new FileReader();

      reader.onerror = ()=>reject(new Error("Não foi possível ler a imagem."));

      reader.onload = function(e){
        const img = new Image();

        img.onerror = ()=>reject(new Error("Não foi possível carregar a imagem."));

        img.onload = function(){
          const maxLargura = opcoes.maxLargura || 420;
          const maxAltura = opcoes.maxAltura || 630;
          const qualidade = opcoes.qualidade || .52;

          let largura = img.width;
          let altura = img.height;

          const escala = Math.min(maxLargura / largura, maxAltura / altura, 1);

          largura = Math.max(1, Math.round(largura * escala));
          altura = Math.max(1, Math.round(altura * escala));

          const canvas = document.createElement("canvas");
          canvas.width = largura;
          canvas.height = altura;

          const ctx = canvas.getContext("2d", {alpha:false});
          ctx.fillStyle = "#111";
          ctx.fillRect(0, 0, largura, altura);
          ctx.drawImage(img, 0, 0, largura, altura);

          let dataUrl = "";

          try{
            dataUrl = canvas.toDataURL("image/webp", qualidade);
            if(!dataUrl || !dataUrl.startsWith("data:image/webp")){
              dataUrl = canvas.toDataURL("image/jpeg", qualidade);
            }
          }catch(err){
            dataUrl = canvas.toDataURL("image/jpeg", qualidade);
          }

          resolve(dataUrl);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(arquivo);
    });
  }

  async function gerarImagemQueCaiba(arquivo, indice){
    const tentativas = [
      {maxLargura:520, maxAltura:780, qualidade:.58},
      {maxLargura:440, maxAltura:660, qualidade:.52},
      {maxLargura:360, maxAltura:540, qualidade:.46},
      {maxLargura:300, maxAltura:450, qualidade:.40},
      {maxLargura:240, maxAltura:360, qualidade:.34}
    ];

    let ultimaImagem = "";

    for(const tentativa of tentativas){
      const imagem = await criarImagemOtimizada(arquivo, tentativa);
      ultimaImagem = imagem;

      try{
        salvarImagemJutsuTransacional(indice, imagem);
        return imagem;
      }catch(err){
        // tenta uma versão mais leve
      }
    }

    throw new Error("Imagem não coube no armazenamento.");
  }

  window.carregarImagemJutsu = async function(event, i){
    const arquivo = event?.target?.files?.[0];

    let indice = Number(i);
    if(!Number.isInteger(indice)){
      indice = Number(window.jutsuUploadIndiceAtual);
    }

    try{
      if(typeof jutsuUploadIndiceAtual !== "undefined" && !Number.isInteger(indice)){
        indice = Number(jutsuUploadIndiceAtual);
      }
    }catch(err){}

    if(!arquivo) return;

    if(!estado.jutsus || !estado.jutsus[indice]){
      await alertaJutsuSeguro("Jutsu não encontrado", "Reabra a carta e tente adicionar a imagem novamente.");
      if(event?.target) event.target.value = "";
      return;
    }

    try{
      await gerarImagemQueCaiba(arquivo, indice);

      if(typeof renderizarJutsus === "function") renderizarJutsus();

    }catch(err){
      console.error(err);

      await alertaJutsuSeguro(
        "Armazenamento cheio",
        "Não consegui salvar a nova imagem sem ultrapassar o limite do app. A imagem antiga foi mantida. Remova imagens de outras cartas ou use uma imagem mais simples."
      );
    }finally{
      if(event?.target) event.target.value = "";
    }
  };

  window.removerImagemJutsu = async function(i){
    const indice = Number(i);

    if(!estado.jutsus || !estado.jutsus[indice]) return;

    try{
      salvarImagemJutsuTransacional(indice, "");

      if(typeof renderizarJutsus === "function") renderizarJutsus();

    }catch(err){
      console.error(err);

      await alertaJutsuSeguro(
        "Não foi possível remover",
        "O app não conseguiu salvar a remoção da imagem. Tente recarregar a página e remover novamente."
      );
    }
  };

  window.carregarFundoCartaJutsu = function(i, ev){
    return window.carregarImagemJutsu(ev, i);
  };

  window.uploadFundoJutsu = function(i, ev){
    return window.carregarImagemJutsu(ev, i);
  };

  if(typeof abrirUploadImagemJutsu === "function" && !window.__abrirUploadImagemJutsuSeguroV4){
    window.__abrirUploadImagemJutsuSeguroV4 = true;
    const abrirUploadImagemJutsuBaseV4 = abrirUploadImagemJutsu;

    window.abrirUploadImagemJutsu = function(i){
      window.jutsuUploadIndiceAtual = i;
      try{
        if(typeof jutsuUploadIndiceAtual !== "undefined") jutsuUploadIndiceAtual = i;
      }catch(err){}
      return abrirUploadImagemJutsuBaseV4.apply(this, arguments);
    };
  }
})();

/* ===== ARMAZENAMENTO OTIMIZADO DE IMAGENS (INDEXEDDB) ===== */
/* As imagens saem do localStorage e passam para o banco de imagens do navegador.
   Isso libera a memória da ficha e evita o limite baixo do localStorage. */
(function(){
  if(window.__fichaNinjaImagensIndexedDBV5) return;
  window.__fichaNinjaImagensIndexedDBV5 = true;

  const DB_NOME = "FichaNinjaImagens";
  const DB_VERSAO = 1;
  const STORE_IMAGENS = "imagens";
  const urlsEmMemoria = new Map();
  let promessaBanco = null;

  function avisar(titulo, texto){
    if(typeof avisoShinobi === "function") return avisoShinobi(titulo, texto);
    alert(texto || titulo);
    return Promise.resolve();
  }

  function imagemDataUrl(valor){
    return typeof valor === "string" && /^data:image\//i.test(valor);
  }

  function idNovo(tipo){
    const unico = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2));
    return tipo + ":" + unico;
  }

  function abrirBanco(){
    if(promessaBanco) return promessaBanco;

    promessaBanco = new Promise((resolve, reject)=>{
      if(!window.indexedDB){
        reject(new Error("IndexedDB indisponível neste navegador."));
        return;
      }

      const pedido = indexedDB.open(DB_NOME, DB_VERSAO);

      pedido.onupgradeneeded = function(){
        const banco = pedido.result;
        if(!banco.objectStoreNames.contains(STORE_IMAGENS)){
          banco.createObjectStore(STORE_IMAGENS, {keyPath:"id"});
        }
      };

      pedido.onsuccess = ()=>resolve(pedido.result);
      pedido.onerror = ()=>reject(pedido.error || new Error("Não foi possível abrir o banco de imagens."));
    });

    return promessaBanco;
  }

  async function salvarBlob(id, blob){
    const banco = await abrirBanco();
    return new Promise((resolve, reject)=>{
      const tx = banco.transaction(STORE_IMAGENS, "readwrite");
      tx.objectStore(STORE_IMAGENS).put({id, blob, atualizadoEm:Date.now()});
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error("Não foi possível salvar a imagem."));
      tx.onabort = ()=>reject(tx.error || new Error("O banco de imagens foi interrompido."));
    });
  }

  async function obterBlob(id){
    if(!id) return null;
    const banco = await abrirBanco();
    return new Promise((resolve, reject)=>{
      const tx = banco.transaction(STORE_IMAGENS, "readonly");
      const pedido = tx.objectStore(STORE_IMAGENS).get(id);
      pedido.onsuccess = ()=>resolve(pedido.result?.blob || null);
      pedido.onerror = ()=>reject(pedido.error || new Error("Não foi possível ler a imagem."));
    });
  }

  async function apagarBlob(id){
    if(!id) return;
    const banco = await abrirBanco();
    return new Promise((resolve, reject)=>{
      const tx = banco.transaction(STORE_IMAGENS, "readwrite");
      tx.objectStore(STORE_IMAGENS).delete(id);
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error("Não foi possível apagar a imagem."));
    });
  }

  async function listarIdsDoBanco(){
    const banco = await abrirBanco();
    return new Promise((resolve, reject)=>{
      const tx = banco.transaction(STORE_IMAGENS, "readonly");
      const pedido = tx.objectStore(STORE_IMAGENS).getAllKeys();
      pedido.onsuccess = ()=>resolve(pedido.result || []);
      pedido.onerror = ()=>reject(pedido.error || new Error("Não foi possível listar as imagens."));
    });
  }

  function urlParaBlob(id, blob){
    if(!blob) return "";
    const existente = urlsEmMemoria.get(id);
    if(existente) return existente;
    const url = URL.createObjectURL(blob);
    urlsEmMemoria.set(id, url);
    return url;
  }

  function limparUrlEmMemoria(id){
    const url = urlsEmMemoria.get(id);
    if(url){
      try{ URL.revokeObjectURL(url); }catch(err){}
      urlsEmMemoria.delete(id);
    }
  }

  async function dataUrlParaBlob(dataUrl){
    const resposta = await fetch(dataUrl);
    return resposta.blob();
  }

  function blobParaDataUrl(blob){
    return new Promise((resolve, reject)=>{
      const leitor = new FileReader();
      leitor.onerror = ()=>reject(new Error("Não foi possível preparar a imagem para o backup."));
      leitor.onload = ()=>resolve(leitor.result);
      leitor.readAsDataURL(blob);
    });
  }

  function copiarEstado(){
    return JSON.parse(JSON.stringify(estado || {}));
  }

  function estadoParaLocalStorage(){
    const copia = copiarEstado();

    (copia.jutsus || []).forEach(jutsu=>{
      if(jutsu && jutsu.imagemId){
        jutsu.imagem = "";
      }
      if(jutsu && typeof jutsu.imagem === "string" && jutsu.imagem.startsWith("blob:")){
        jutsu.imagem = "";
      }
    });

    if(copia.avatarNinjaId) copia.avatarNinja = "";
    if(copia.perfilFundoImagemId) copia.perfilFundoImagem = "";

    return copia;
  }

  /* A função original salvava todo o Base64 das imagens dentro da ficha.
     Daqui em diante, salva apenas os IDs das imagens. */
  window.persistirEstadoLocal = function(){
    try{
      localStorage.setItem(CHAVE, JSON.stringify(estadoParaLocalStorage()));
      try{ avisoArmazenamentoExibido = false; }catch(err){}
      return true;
    }catch(erro){
      try{
        if(!avisoArmazenamentoExibido){
          avisoArmazenamentoExibido = true;
          avisar("Armazenamento cheio", "Não foi possível salvar os dados da ficha. Tente executar a opção de otimizar armazenamento no menu de configurações.");
        }
      }catch(err){
        alert("Não foi possível salvar os dados da ficha.");
      }
      return false;
    }
  };

  async function otimizarArquivoParaBlob(arquivo, opcoes){
    opcoes = opcoes || {};

    if(!arquivo || !(arquivo instanceof Blob)){
      throw new Error("Arquivo de imagem inválido.");
    }

    const maxLargura = opcoes.maxLargura || 640;
    const maxAltura = opcoes.maxAltura || 900;
    const qualidade = typeof opcoes.qualidade === "number" ? opcoes.qualidade : .72;

    const urlOrigem = URL.createObjectURL(arquivo);

    try{
      const img = new Image();
      img.decoding = "async";

      await new Promise((resolve, reject)=>{
        img.onload = resolve;
        img.onerror = ()=>reject(new Error("Não foi possível abrir essa imagem."));
        img.src = urlOrigem;
      });

      const escala = Math.min(maxLargura / img.width, maxAltura / img.height, 1);
      const largura = Math.max(1, Math.round(img.width * escala));
      const altura = Math.max(1, Math.round(img.height * escala));
      const canvas = document.createElement("canvas");
      canvas.width = largura;
      canvas.height = altura;

      const ctx = canvas.getContext("2d", {alpha:false});
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, largura, altura);
      ctx.drawImage(img, 0, 0, largura, altura);

      const transformar = (tipo, qualidadeFinal)=>new Promise(resolve=>{
        canvas.toBlob(blob=>resolve(blob), tipo, qualidadeFinal);
      });

      let blob = await transformar("image/webp", qualidade);
      if(!blob || !blob.size){
        blob = await transformar("image/jpeg", Math.min(.78, qualidade + .05));
      }

      if(!blob || !blob.size){
        throw new Error("Não foi possível otimizar essa imagem.");
      }

      return blob;
    }finally{
      try{ URL.revokeObjectURL(urlOrigem); }catch(err){}
    }
  }

  async function migrarEstadoAtualParaIndexedDB(){
    await abrirBanco();

    const pendentes = [];
    const jutsus = Array.isArray(estado.jutsus) ? estado.jutsus : [];

    for(const jutsu of jutsus){
      if(jutsu && imagemDataUrl(jutsu.imagem)){
        const blobOriginal = await dataUrlParaBlob(jutsu.imagem);
        const blobOtimizado = await otimizarArquivoParaBlob(blobOriginal, {maxLargura:640, maxAltura:900, qualidade:.72});
        const id = idNovo("jutsu");
        await salvarBlob(id, blobOtimizado);
        pendentes.push({alvo:jutsu, campo:"imagem", campoId:"imagemId", id, blob:blobOtimizado});
      }
    }

    if(imagemDataUrl(estado.avatarNinja)){
      const blobOriginal = await dataUrlParaBlob(estado.avatarNinja);
      const blobOtimizado = await otimizarArquivoParaBlob(blobOriginal, {maxLargura:480, maxAltura:480, qualidade:.76});
      const id = idNovo("avatar");
      await salvarBlob(id, blobOtimizado);
      pendentes.push({alvo:estado, campo:"avatarNinja", campoId:"avatarNinjaId", id, blob:blobOtimizado});
    }

    if(imagemDataUrl(estado.perfilFundoImagem)){
      const blobOriginal = await dataUrlParaBlob(estado.perfilFundoImagem);
      const blobOtimizado = await otimizarArquivoParaBlob(blobOriginal, {maxLargura:960, maxAltura:720, qualidade:.70});
      const id = idNovo("perfil-fundo");
      await salvarBlob(id, blobOtimizado);
      pendentes.push({alvo:estado, campo:"perfilFundoImagem", campoId:"perfilFundoImagemId", id, blob:blobOtimizado});
    }

    if(!pendentes.length) return false;

    const antes = pendentes.map(item=>({
      alvo:item.alvo,
      campo:item.campo,
      campoId:item.campoId,
      valor:item.alvo[item.campo],
      valorId:item.alvo[item.campoId]
    }));

    pendentes.forEach(item=>{
      item.alvo[item.campoId] = item.id;
      item.alvo[item.campo] = "";
      urlParaBlob(item.id, item.blob);
    });

    if(!persistirEstadoLocal()){
      antes.forEach(item=>{
        item.alvo[item.campo] = item.valor;
        if(item.valorId) item.alvo[item.campoId] = item.valorId;
        else delete item.alvo[item.campoId];
      });
      throw new Error("Não foi possível concluir a migração do armazenamento.");
    }

    return true;
  }

  async function hidratarImagensDoIndexedDB(){
    try{
      await abrirBanco();

      for(const jutsu of (estado.jutsus || [])){
        if(jutsu?.imagemId && !urlsEmMemoria.has(jutsu.imagemId)){
          const blob = await obterBlob(jutsu.imagemId);
          if(blob) urlParaBlob(jutsu.imagemId, blob);
        }
      }

      if(estado.avatarNinjaId){
        const blobAvatar = await obterBlob(estado.avatarNinjaId);
        if(blobAvatar && typeof aplicarAvatar === "function"){
          aplicarAvatar(urlParaBlob(estado.avatarNinjaId, blobAvatar));
        }
      }

      if(estado.perfilFundoImagemId){
        const blobFundo = await obterBlob(estado.perfilFundoImagemId);
        if(blobFundo && typeof aplicarFundoPerfil === "function"){
          aplicarFundoPerfil(urlParaBlob(estado.perfilFundoImagemId, blobFundo));
        }
      }

      if(typeof renderizarJutsus === "function") renderizarJutsus();
    }catch(err){
      console.warn("Não foi possível carregar as imagens otimizadas.", err);
    }
  }

  /* O renderizador original continua intacto; ele só recebe URLs temporárias na hora de desenhar as cartas. */
  if(typeof renderizarJutsus === "function"){
    const renderizarJutsusBaseIndexedDB = renderizarJutsus;

    window.renderizarJutsus = function(){
      const restaurar = [];

      (estado.jutsus || []).forEach(jutsu=>{
        if(jutsu?.imagemId){
          restaurar.push({jutsu, imagem:jutsu.imagem});
          jutsu.imagem = urlsEmMemoria.get(jutsu.imagemId) || "";
        }
      });

      const resultado = renderizarJutsusBaseIndexedDB.apply(this, arguments);

      restaurar.forEach(item=>{
        item.jutsu.imagem = item.imagem || "";
      });

      return resultado;
    };
  }

  async function salvarNovaImagemDeJutsu(arquivo, indice){
    if(!estado.jutsus || !estado.jutsus[indice]) throw new Error("Jutsu não encontrado.");

    const blob = await otimizarArquivoParaBlob(arquivo, {maxLargura:640, maxAltura:900, qualidade:.72});
    const novoId = idNovo("jutsu");
    const jutsu = estado.jutsus[indice];
    const anterior = {imagem:jutsu.imagem, imagemId:jutsu.imagemId};

    await salvarBlob(novoId, blob);
    jutsu.imagemId = novoId;
    jutsu.imagem = "";
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    estado.jutsusAbertos[indice] = true;
    urlParaBlob(novoId, blob);

    if(!persistirEstadoLocal()){
      limparUrlEmMemoria(novoId);
      await apagarBlob(novoId).catch(()=>{});
      jutsu.imagem = anterior.imagem || "";
      if(anterior.imagemId) jutsu.imagemId = anterior.imagemId;
      else delete jutsu.imagemId;
      throw new Error("Não foi possível salvar a imagem na ficha.");
    }

    setTimeout(limparImagensOrfas, 500);
  }

  window.carregarImagemJutsu = async function(evento, indiceRecebido){
    const arquivo = evento?.target?.files?.[0];
    let indice = Number(indiceRecebido);

    if(!Number.isInteger(indice)) indice = Number(window.jutsuUploadIndiceAtual);
    try{
      if(!Number.isInteger(indice)) indice = Number(jutsuUploadIndiceAtual);
    }catch(err){}

    if(!arquivo) return;

    try{
      await salvarNovaImagemDeJutsu(arquivo, indice);
      if(typeof renderizarJutsus === "function") renderizarJutsus();
    }catch(err){
      console.error(err);
      await avisar(
        "Não foi possível salvar a imagem",
        "A imagem anterior foi mantida. Tente novamente após tocar em “Otimizar armazenamento” no menu de configurações."
      );
    }finally{
      if(evento?.target) evento.target.value = "";
    }
  };

  window.removerImagemJutsu = async function(indiceRecebido){
    const indice = Number(indiceRecebido);
    const jutsu = estado.jutsus?.[indice];
    if(!jutsu) return;

    const anterior = {imagem:jutsu.imagem, imagemId:jutsu.imagemId};
    jutsu.imagem = "";
    delete jutsu.imagemId;
    estado.jutsusAbertos = estado.jutsusAbertos || {};
    estado.jutsusAbertos[indice] = true;

    if(!persistirEstadoLocal()){
      jutsu.imagem = anterior.imagem || "";
      if(anterior.imagemId) jutsu.imagemId = anterior.imagemId;
      return avisar("Não foi possível remover", "A remoção da imagem não foi salva. A imagem anterior foi mantida.");
    }

    if(typeof renderizarJutsus === "function") renderizarJutsus();
    setTimeout(limparImagensOrfas, 500);
  };

  window.carregarFundoCartaJutsu = function(indice, evento){
    return window.carregarImagemJutsu(evento, indice);
  };

  window.uploadFundoJutsu = function(indice, evento){
    return window.carregarImagemJutsu(evento, indice);
  };

  function prepararInputDeImagemJutsu(){
    const antigo = document.getElementById("jutsuUploadGlobalSeguro");
    if(!antigo || antigo.dataset.indexeddbPronto) return;

    const novo = antigo.cloneNode(true);
    novo.dataset.indexeddbPronto = "1";
    antigo.replaceWith(novo);

    novo.addEventListener("change", evento=>{
      let indice = Number(window.jutsuUploadIndiceAtual);
      try{
        if(!Number.isInteger(indice)) indice = Number(jutsuUploadIndiceAtual);
      }catch(err){}
      window.carregarImagemJutsu(evento, indice);
    });
  }

  window.abrirUploadImagemJutsu = function(indice){
    window.jutsuUploadIndiceAtual = indice;
    try{ jutsuUploadIndiceAtual = indice; }catch(err){}

    prepararInputDeImagemJutsu();
    const input = document.getElementById("jutsuUploadGlobalSeguro");
    if(!input){
      avisar("Campo de imagem não encontrado", "Recarregue o app e tente novamente.");
      return;
    }

    input.value = "";
    input.click();
  };

  async function salvarImagemPerfil(campo, campoId, arquivo, opcoes){
    const blob = await otimizarArquivoParaBlob(arquivo, opcoes);
    const novoId = idNovo(campo === "avatarNinja" ? "avatar" : "perfil-fundo");
    const anterior = {valor:estado[campo], id:estado[campoId]};

    await salvarBlob(novoId, blob);
    estado[campoId] = novoId;
    estado[campo] = "";
    const url = urlParaBlob(novoId, blob);

    if(!persistirEstadoLocal()){
      limparUrlEmMemoria(novoId);
      await apagarBlob(novoId).catch(()=>{});
      estado[campo] = anterior.valor || "";
      if(anterior.id) estado[campoId] = anterior.id;
      else delete estado[campoId];
      throw new Error("Não foi possível salvar a imagem do perfil.");
    }

    return url;
  }

  window.carregarAvatar = async function(evento){
    const arquivo = evento?.target?.files?.[0];
    if(!arquivo) return;

    try{
      const url = await salvarImagemPerfil("avatarNinja", "avatarNinjaId", arquivo, {maxLargura:480, maxAltura:480, qualidade:.76});
      if(typeof aplicarAvatar === "function") aplicarAvatar(url);
      setTimeout(limparImagensOrfas, 500);
    }catch(err){
      console.error(err);
      await avisar("Não foi possível salvar o avatar", "O avatar anterior foi mantido.");
    }finally{
      if(evento?.target) evento.target.value = "";
    }
  };

  window.carregarFundoPerfil = async function(evento){
    const arquivo = evento?.target?.files?.[0];
    if(!arquivo) return;

    try{
      const url = await salvarImagemPerfil("perfilFundoImagem", "perfilFundoImagemId", arquivo, {maxLargura:960, maxAltura:720, qualidade:.70});
      if(typeof aplicarFundoPerfil === "function") aplicarFundoPerfil(url);
      const menu = document.getElementById("avatarMenu");
      if(menu) menu.classList.remove("aberto");
      setTimeout(limparImagensOrfas, 500);
    }catch(err){
      console.error(err);
      await avisar("Não foi possível salvar o fundo", "O fundo anterior foi mantido.");
    }finally{
      if(evento?.target) evento.target.value = "";
    }
  };

  window.removerFundoPerfil = async function(){
    const anterior = {valor:estado.perfilFundoImagem, id:estado.perfilFundoImagemId};
    delete estado.perfilFundoImagem;
    delete estado.perfilFundoImagemId;

    if(!persistirEstadoLocal()){
      estado.perfilFundoImagem = anterior.valor || "";
      if(anterior.id) estado.perfilFundoImagemId = anterior.id;
      await avisar("Não foi possível remover", "A remoção do fundo não foi salva.");
      return;
    }

    if(typeof aplicarFundoPerfil === "function") aplicarFundoPerfil("");
    fecharMenuAvatar();
    setTimeout(limparImagensOrfas, 500);
  };

  async function estadoComImagensParaBackup(){
    const backup = estadoParaLocalStorage();

    for(let i = 0; i < (backup.jutsus || []).length; i++){
      const jutsu = backup.jutsus[i];
      const id = estado.jutsus?.[i]?.imagemId;
      if(id){
        const blob = await obterBlob(id);
        if(blob) jutsu.imagem = await blobParaDataUrl(blob);
        delete jutsu.imagemId;
      }
    }

    if(estado.avatarNinjaId){
      const blob = await obterBlob(estado.avatarNinjaId);
      if(blob) backup.avatarNinja = await blobParaDataUrl(blob);
      delete backup.avatarNinjaId;
    }

    if(estado.perfilFundoImagemId){
      const blob = await obterBlob(estado.perfilFundoImagemId);
      if(blob) backup.perfilFundoImagem = await blobParaDataUrl(blob);
      delete backup.perfilFundoImagemId;
    }

    return backup;
  }

  window.exportarFicha = async function(){
    try{
      if(typeof salvar === "function") salvar();

      const estadoBackup = await estadoComImagensParaBackup();
      const dados = {
        app:"Ficha Ninja RPG",
        versao:"backup-2",
        criadoEm:(new Date).toISOString(),
        chave:CHAVE,
        estado:estadoBackup
      };

      const nomeNinja = (estado.nome || "ninja").toString().trim().replace(/[^\w\-]+/g, "_") || "ninja";
      const arquivo = new Blob([JSON.stringify(dados, null, 2)], {type:"application/json"});
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ficha_" + nomeNinja + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 1000);
    }catch(err){
      console.error(err);
      await avisar("Não foi possível exportar", "Tente novamente em alguns segundos.");
    }
  };

  window.importarFicha = function(evento){
    const arquivo = evento?.target?.files?.[0];
    if(!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = async function(e){
      const estadoAnterior = estado;

      try{
        const dados = JSON.parse(e.target.result);
        const novoEstado = dados.estado || dados;

        if(!novoEstado || typeof novoEstado !== "object" || Array.isArray(novoEstado)){
          throw new Error("Arquivo inválido.");
        }

        if(!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?")) return;

        estado = novoEstado;
        await migrarEstadoAtualParaIndexedDB();

        if(!persistirEstadoLocal()){
          throw new Error("Não foi possível salvar a ficha importada.");
        }

        alert("Ficha importada com sucesso!");
        location.reload();
      }catch(err){
        console.error(err);
        estado = estadoAnterior;
        await avisar("Não foi possível importar", "O arquivo não pôde ser salvo neste aparelho.");
      }finally{
        if(evento?.target) evento.target.value = "";
      }
    };
    leitor.readAsText(arquivo);
  };

  async function coletarIdsEmUso(){
    const usados = new Set();
    const prefixo = typeof CHAVE_BASE !== "undefined" ? CHAVE_BASE : "ficha_ninja_app_v2";

    Object.keys(localStorage).forEach(chave=>{
      if(chave !== prefixo && !chave.startsWith(prefixo + "__")) return;

      try{
        const ficha = JSON.parse(localStorage.getItem(chave) || "{}");
        (ficha.jutsus || []).forEach(jutsu=>{
          if(jutsu?.imagemId) usados.add(jutsu.imagemId);
        });
        if(ficha.avatarNinjaId) usados.add(ficha.avatarNinjaId);
        if(ficha.perfilFundoImagemId) usados.add(ficha.perfilFundoImagemId);
      }catch(err){}
    });

    (estado.jutsus || []).forEach(jutsu=>{
      if(jutsu?.imagemId) usados.add(jutsu.imagemId);
    });
    if(estado.avatarNinjaId) usados.add(estado.avatarNinjaId);
    if(estado.perfilFundoImagemId) usados.add(estado.perfilFundoImagemId);

    return usados;
  }

  async function limparImagensOrfas(){
    try{
      const [idsDoBanco, idsEmUso] = await Promise.all([listarIdsDoBanco(), coletarIdsEmUso()]);
      const orfas = idsDoBanco.filter(id=>!idsEmUso.has(id));
      await Promise.all(orfas.map(id=>{
        limparUrlEmMemoria(id);
        return apagarBlob(id).catch(()=>{});
      }));
      return orfas.length;
    }catch(err){
      return 0;
    }
  }

  window.otimizarArmazenamentoImagens = async function(){
    try{
      if(navigator.storage && navigator.storage.persist){
        try{ await navigator.storage.persist(); }catch(err){}
      }

      const migrou = await migrarEstadoAtualParaIndexedDB();
      await hidratarImagensDoIndexedDB();
      const removidas = await limparImagensOrfas();

      await avisar(
        "Armazenamento otimizado",
        (migrou ? "As imagens da ficha foram movidas para o armazenamento otimizado. " : "As imagens já estão no armazenamento otimizado. ") +
        (removidas ? removidas + " imagem(ns) antiga(s) sem uso foram removidas." : "")
      );
    }catch(err){
      console.error(err);
      await avisar(
        "Não foi possível otimizar",
        "O navegador não liberou o armazenamento otimizado. Feche outras abas do app, recarregue esta página e tente novamente."
      );
    }
  };

  let imagensInicializadasNestaSessao = false;
  let inicializacaoImagensEmAndamento = null;

  function executarQuandoNavegadorEstiverLivre(tarefa, timeout = 1200){
    if("requestIdleCallback" in window){
      window.requestIdleCallback(
        ()=>tarefa(),
        {timeout}
      );
      return;
    }

    setTimeout(tarefa, 120);
  }

  async function inicializarImagensEmSegundoPlano(){
    if(imagensInicializadasNestaSessao) return;
    if(inicializacaoImagensEmAndamento) return inicializacaoImagensEmAndamento;

    inicializacaoImagensEmAndamento = (async()=>{
      try{
        if(navigator.storage && navigator.storage.persist){
          try{ await navigator.storage.persist(); }catch(err){}
        }

        await migrarEstadoAtualParaIndexedDB();
        await hidratarImagensDoIndexedDB();

        imagensInicializadasNestaSessao = true;
        setTimeout(limparImagensOrfas, 1400);
      }catch(err){
        console.error("Falha na inicialização das imagens.", err);
      }finally{
        inicializacaoImagensEmAndamento = null;
      }
    })();

    return inicializacaoImagensEmAndamento;
  }

  function iniciarArmazenamentoOtimizado(){
    prepararInputDeImagemJutsu();

    executarQuandoNavegadorEstiverLivre(
      inicializarImagensEmSegundoPlano,
      900
    );
  }

  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      iniciarArmazenamentoOtimizado,
      {once:true}
    );
  }else{
    iniciarArmazenamentoOtimizado();
  }

  window.addEventListener("pageshow", (evento)=>{
    prepararInputDeImagemJutsu();

    if(evento.persisted || !imagensInicializadasNestaSessao){
      executarQuandoNavegadorEstiverLivre(
        inicializarImagensEmSegundoPlano,
        700
      );
    }
  });

  window.addEventListener("beforeunload", ()=>{
    urlsEmMemoria.forEach(url=>{
      try{ URL.revokeObjectURL(url); }catch(err){}
    });
  });
})();

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
      configurarToqueLongo(card, indice);
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
      if(id === 'batalha') setTimeout(renderizarResistenciasBatalha, 0);
      return resultado;
    };
  }

  function iniciarRecursos(){
    prepararJutsus();
    renderizarResistenciasBatalha();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', iniciarRecursos, {once:true});
  }else{
    iniciarRecursos();
  }
})();

/* ===== RESISTÊNCIAS V2: elementais, atributos e especiais tocáveis ===== */
(function(){
  if(window.__resistenciasBatalhaV2) return;
  window.__resistenciasBatalhaV2 = true;

  const GRUPOS_RESISTENCIAS_V2 = [
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

  function salvarResistenciasV2(){
    try{
      if(typeof persistirSemRender === "function") persistirSemRender();
      else if(typeof salvar === "function") salvar();
      else if(typeof persistirEstadoLocal === "function") persistirEstadoLocal();
      else if(typeof CHAVE !== "undefined") localStorage.setItem(CHAVE, JSON.stringify(estado));
    }catch(err){
      console.warn("Não foi possível salvar resistências agora.", err);
    }
  }

  function garantirResistenciasV2(){
    estado.resistenciasBatalha = estado.resistenciasBatalha || {};

    // Compatibilidade com versão anterior, caso tenha vindo como array/lista.
    if(Array.isArray(estado.resistenciasBatalha)){
      const antigo = estado.resistenciasBatalha;
      estado.resistenciasBatalha = {};
      antigo.forEach(item=>{
        const chave = String(item || "").toLowerCase().trim();
        if(chave) estado.resistenciasBatalha[chave] = true;
      });
    }

    return estado.resistenciasBatalha;
  }

  function nomePorIdResistenciaV2(id){
    for(const grupo of GRUPOS_RESISTENCIAS_V2){
      const item = grupo.itens.find(i=>i.id === id);
      if(item) return item.nome;
    }
    return id;
  }

  window.toggleResistenciaBatalha = function(id){
    const resistencias = garantirResistenciasV2();
    resistencias[id] = !resistencias[id];

    salvarResistenciasV2();
    renderizarResistenciasBatalha();
  };

  window.adicionarResistenciaPersonalizada = function(){
    // Desativado de propósito: agora todas as resistências principais são botões tocáveis.
    renderizarResistenciasBatalha();
  };

  window.removerResistenciaPersonalizada = function(id){
    const resistencias = garantirResistenciasV2();
    delete resistencias[id];
    salvarResistenciasV2();
    renderizarResistenciasBatalha();
  };

  function criarPainelResistenciasV2(){
    const mod = document.querySelector("#batalha .modificadoresBatalha");
    if(!mod) return null;

    let painel = document.getElementById("resistenciasBatalhaPainel");

    if(!painel){
      painel = document.createElement("div");
      painel.id = "resistenciasBatalhaPainel";
      painel.className = "resistenciasBatalhaPainel";

      const bonusAtributos = mod.querySelector(".bonusAtributosBatalha");
      if(bonusAtributos) mod.insertBefore(painel, bonusAtributos);
      else mod.appendChild(painel);
    }

    return painel;
  }

  window.renderizarResistenciasBatalha = function(){
    const painel = criarPainelResistenciasV2();
    if(!painel) return;

    const resistencias = garantirResistenciasV2();

    const gruposHtml = GRUPOS_RESISTENCIAS_V2.map(grupo=>{
      const botoes = grupo.itens.map(item=>{
        const ativo = resistencias[item.id] ? "ativo" : "";
        return `<button type="button" class="resistenciaChip ${ativo}" onclick="toggleResistenciaBatalha('${item.id}')">${item.nome}</button>`;
      }).join("");

      return `
        <div class="resistenciaGrupo">
          <span class="resistenciaGrupoTitulo">${grupo.titulo}</span>
          <div class="resistenciasBatalhaGrid">${botoes}</div>
        </div>
      `;
    }).join("");

    const ativos = [];
    Object.keys(resistencias).forEach(id=>{
      if(resistencias[id]) ativos.push(nomePorIdResistenciaV2(id));
    });

    painel.innerHTML = `
      <h3>Resistências</h3>
      ${gruposHtml}
      <div class="resistenciaResumo">
        ${ativos.length ? "Resistências ativas: " + ativos.join(", ") : "Nenhuma resistência ativa."}
      </div>
    `;
  };

  if(typeof abrirPagina === "function" && !window.__abrirPaginaResistenciasV2){
    window.__abrirPaginaResistenciasV2 = true;
    const abrirPaginaBaseV2 = abrirPagina;

    window.abrirPagina = function(id, botao){
      const r = abrirPaginaBaseV2.apply(this, arguments);
      if(id === "batalha") setTimeout(renderizarResistenciasBatalha, 80);
      return r;
    };
  }

  document.addEventListener("DOMContentLoaded", ()=>setTimeout(renderizarResistenciasBatalha, 250));
  window.addEventListener("pageshow", ()=>setTimeout(renderizarResistenciasBatalha, 250));
})();

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

 /* mover jutsus por toque longo */
 let timer=null,ativo=false,origem=null,alvo=null,ghost=null;
 /* função duplicada removida: salvarMove */
 function preparar(){
   const lista=document.getElementById("listaJutsus"); if(!lista)return;
   Array.from(lista.querySelectorAll(".jutsuListaCard")).forEach((c,i)=>c.dataset.jutsuIndex=String(i));
   if(lista.dataset.moverTouchV2)return; lista.dataset.moverTouchV2="1";
   lista.addEventListener("pointerdown",ev=>{
     const resumo=ev.target.closest(".jutsuLinhaResumo"),card=ev.target.closest(".jutsuListaCard"); if(!resumo||!card)return;
     const idx=Number(card.dataset.jutsuIndex); if(!Number.isInteger(idx))return; clearTimeout(timer);
     timer=setTimeout(()=>{ativo=true;origem=idx;alvo=idx;lista.classList.add("modoMoverJutsus");card.classList.add("jutsuPressionando");ghost=card.cloneNode(true);ghost.classList.add("jutsuGhostMover");ghost.style.left=ev.clientX+"px";ghost.style.top=ev.clientY+"px";document.body.appendChild(ghost);try{card.setPointerCapture(ev.pointerId)}catch(e){}},2000);
   });
   lista.addEventListener("pointermove",ev=>{
     if(!ativo)return; ev.preventDefault(); if(ghost){ghost.style.left=ev.clientX+"px";ghost.style.top=ev.clientY+"px"}
     const el=document.elementFromPoint(ev.clientX,ev.clientY),card=el?.closest?.("#listaJutsus .jutsuListaCard");
     document.querySelectorAll(".jutsuDropAlvo").forEach(x=>x.classList.remove("jutsuDropAlvo"));
     if(card){alvo=Number(card.dataset.jutsuIndex);card.classList.add("jutsuDropAlvo")}
   },{passive:false});
   function fim(ev){
     clearTimeout(timer);
     if(!ativo)return;
     if(ev){ev.preventDefault();ev.stopPropagation()}
     lista.classList.remove("modoMoverJutsus");
     document.querySelectorAll(".jutsuPressionando,.jutsuDropAlvo").forEach(x=>x.classList.remove("jutsuPressionando","jutsuDropAlvo"));
     if(ghost){ghost.remove();ghost=null}
     if(origem!==null&&alvo!==null&&origem!==alvo&&estado.jutsus){const item=estado.jutsus.splice(origem,1)[0];estado.jutsus.splice(alvo,0,item);estado.jutsusAbertos={};estado.jutsusAbertos[alvo]=true;salvarMove();if(typeof renderizarJutsus==="function")renderizarJutsus()}
     setTimeout(()=>{ativo=false;origem=null;alvo=null},80);
   }
   lista.addEventListener("pointerup",fim,true); lista.addEventListener("pointercancel",fim,true);
   lista.addEventListener("click",ev=>{if(ativo){ev.preventDefault();ev.stopPropagation()}},true);
 }
 if(typeof renderizarJutsus==="function"&&!window.__renderizarJutsusMoverTouchV2){window.__renderizarJutsusMoverTouchV2=true;const baseR=renderizarJutsus;window.renderizarJutsus=function(){const r=baseR.apply(this,arguments);setTimeout(preparar,120);return r}}
 document.addEventListener("DOMContentLoaded",()=>setTimeout(preparar,500)); window.addEventListener("pageshow",()=>setTimeout(preparar,500));
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

/* ===== Inventário visual compacto com ícones embutidos ===== */
(function(){
  const ICONES_INVENTARIO_EMBUTIDOS = {"repelente": "data:image/webp;base64,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", "pergaminho-de-selamento": "data:image/webp;base64,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", "moeda-de-ouro": "data:image/webp;base64,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", "moeda-de-prata": "data:image/webp;base64,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", "moeda-de-bronze": "data:image/webp;base64,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", "moeda-de-diamante": "data:image/webp;base64,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", "kunai": "data:image/webp;base64,UklGRoANAABXRUJQVlA4WAoAAAAQAAAAswAAswAAQUxQSE0FAAABsMVsm2Hb1j80Pbdt27Zt69i2bdu2bdvnbNu2ZkY6lUql8ufPezHPnqu6Rvq/20lETIA8/uFgOBz+66YbbvrRcDj00mgDVrzlrIuO+h1JVW25auKaI/vuOf9LEFhxhB+90DlPgKCsogV4lWvOIWQK5oaXOOYCMoUjL3HL+USKJ17plFMY02LDc10y+FjObWj6+cgju9DQasMpDhl9OWo7Gn8y74+1ibQc2NYdvZhpPcaRO6gw4w5x2ZuxGqa8cUUNcJU3fl/Hg974cx13u+x+h2XmXDb0mI288ccq8MbTc6L1mLcTZ76UCho2c8b0T5O2ltPnZ3wx9S+U1gPHiS83oqF1De/tOwOldUsmztwNay9znjP2JNO2Rs4QX+7B2NpKcI74cp5gtGsNP7lAnHkWiVY1wQfFm0/CKK26DP64Xc8dj6RiChaX4vazQ3Hn4CorZPD9ny6KT0d/M6VQOk28OvgVmeLi1f7fSJS1zHZu+RuJstbYDuLVhUeylbGGXcSr6z6oSlllB3HrOTSUzewkbl3j/oayFm4e+uVYUqExO4tbT0Ipm/nrnFtOJFDW0n9H4tTeiSxZocAHxKvrMqZw4kvi1udpKpT4iLj1zRhlk3685xcSZZW/9sSro58mLdU8Tdx6AYFSiFtnfx61UGZ/t0zfhFI2cJB4dfoRlLIax2u65VckymrUjcSrm1yTrIwZ64pXN2wwyiZdX5w6ujOjlA1sK06duR2Mshp/Pu+Umcs1U3rMyeLT0eVkSis/GLmkN9yIQGmLPxWHrrHR+l8GpXik747eMUcAqFE88oqeLzZ995u/DxqCUj7xMnFjf9B/1RUXRyAEo00dv068uNaaS/zfnDPtWgriwsWD938lYMtp3zjRAy957Q1AjFSaOFoc+CoghES1YTzvgNFfU1AqDnqgOPB5RKpuOMkDp1ldOX1/xgEb3x6tqsQLxYGb0lCz8V5xYO9pmqoC8eAsicr7Lkgeu5PqPbC+msMuRqsTB361OuPN3Xd+jlR3e/ddSKjvX503//2s9f2383alob7/dN3cnYEJuLzXcUNSfSTe1XHnmU7EGzuOiUy8udsGSx77Keqvda9R89cbCfjruRYnw17bZXtYYDLyJ7tsa5qJsMguHTb8QtaJgG2lw9ckMoFK2E46vDfOTOCYc6TbmUCLnCXdfqxZdQbnSMffgNYWePeCdHz/j1aZjvmwdP5bSFRt8DHp/mfWZYnf7Cvdv9EN0Soy+O9QHHgSgXqVh/7WFweuRaBeTfeuKS6ctliP5riWuLD3BawWAxbFiVQbAjsNxIlr51oi7C5uvBerI/OMncSPv6tDI+eII89JiQoTXCiOHHyBXEHiB08QTx5NQ/uJD4svd7fQmikf6PlitWuStZVpPtUTX84TaDlz6UCc2TvFcksNfx6JO2nZjIunxJ3vjtaKwjpD8edNtNLkh9YSh65+k7URWFpXPPoFEsUNDltHXPo6K6ewh/h09xgoHfnHXuLT/ktJpRJPF69uREPhxNPFrWvmUCbDk8Stg1vNimSueYY4FqNkw9fFs4daCTM+Lq7NFMhctWHfNb1LV80Cdw7Ft28ns6rKxSPx7eLvsq6CaThzRpx7Jg0rV1hb3Hu8hpUpuo64d3ULrNQS31hf3Ns7n7QSDewnDh6irNBgP/HwKK1kzDNmxcWXY4+Rl3ieOPnWxzJ4gTh597Gy3CKf2V28/F3yMoWv98XL/c/YsszNXxc/H0cDNHbxtPh55gspQ+a6WXH0ZjQk2GRaPL19jomwgbh6mpR4xybi655GDhZvvxsOEnc3rxjK4zUCAFZQOCAMCAAAECoAnQEqtAC0AD55PJhJpKMiIST12cCQDwlpbuFs/gAZhE46/pf4l72Pka+Q+4PLQ6izHVxsujSWaAHkxf3Xjl+tPYE/m/9/6zPobfsQQzsc/TPMZ/qm7P/YsTAqf7c5SmZmZmUvaFruRlH1NESvGFHWpr/JNwwkw7DoH4aqkhZTPeUvz6p9bnE9QUHDVc2HSGoFB4nEk7TV2QL1Vdpt1wiMja4Le6jb9gq51R7rf5WBUU9D7nGEoTYwZQvFQ942Kr+1V74La0VX2FPfH1PvZfWQ0y0gnw8nrirouLDobzbbBbbUrWWZYvR0J4ffvbBoSfGCzXFkVt+2M/DHNgLoTr4qVznNSsg08bPbRLO+IwR/JZnkgL/59ChplNM82eeERXzuNavf0nJTATQQluU2JPhOMDBLxD1MY2egOU2nq1D4IVOBbpUM/5kYZeVltStfyLK0A6B+VQgAAP7x3EGTFNthVw73S0JOnJQ1vFRIW+hDSq1tZrpDukNZdDhvMyiSjg8/3OCAC1xFa/lzd4/5DZmPFTbCEO3adF/xr495GG1ZQdMSP0p8KHobdALIuBqADmRW+PH/k9VJabupTbjKs7hSDXfzbknaa+soycW964r2ngFkraNlsuMSdgsloxyaEkLVECg5j7ABSZuYcoGN1FT7SNV2G8pFApHuaRQSm4GvTjM4f2mvU+mxhv396HjjsCmadCVRRIuXbUNMyS58qH1h3T3IWScgbUWOzOPhuDKs8S6UOJxOKKsoE6lF+LOQioMmYMU2V1M2w4Ea7xEMP11MGkSuiMuCFrJ+GQegRFq+7d4gy28q6xZx4hhdwUCL6k3NB+4daJOuSrVZF6MFqwl/YgTjejkgMkvxlOPZZjDl8Y7W1xFRfi7z9kAVzrPfqjgCfbZfdHBl8Mv2VF+ZQQvtFls+Ypw020rHMAEz26oPyVesPfsywpTk3nNRgYJ50Ix89kG8yKqVPKkldqJ9r4yzWBu73KuUieJhpFstVmCLqY/SP7KSdf9024s9qxRkY8N1mYyhX1/LqKNgwV/g0eG25YxjTnC82jwS+QdS5tAQtghtzlHIyjHRPzbqDY2OxN7VzvWHWMo+c674j7Ty2MIMZtIpN3+RBrTkqzQX8rqhvdjZmVHsaO4x1GhhxkWecxdx0n++4kRn4d0ju7rgROO0y23+G9yPek6h2z0UaTA0Zl9AIu5w291rNb424jSQDikjcTiwcSoyomjYGwmZvBQXVCSpZOsGQv2kSH+2bEJEUtZ+A6XOwsvF/cztkVXCq4h0oW7J6pJXLR5xGrRUB2wtSbZVH/aMQLNQv0Y1nnmLZv1VSgY3SjJvkBgH8pLXZvyB+QdMX4/ibiiDQs+Wd+prFK3bpJPQpaSzYI4TExkymzDkW+ha/Ggy1nTtEeqk4f110uPNFTfjiKwv2MbHB5M8M6yi+/cZB2+Nqo1ZfEKEWyxuDxfpZ1ShQchtyJlV4aYR4YNKR+drmysjkrnaKNIra8omfKD7dxLwhagYprP4nHRdstP6eO1vJgD8Is8zRSR9LOP7SsLQ+HiUUIh4TPgqJ0n3pN0J9517BvAOW6ayIsLRHkVFubbQ1dC9jYGP19q98FnwkNv8BG2Wxu9O6ZPSiLivziFWZumfMsN+oJPV6cbdAN63qU+nybciWLlq92VUXe6yepjPVKTPiFjpkHlYkIw6y58QqepEgWQW6oztyR2Kazbv2K31VK007mLubynfTir6aQG1mth5ZC8abFwU0Ah5UlQw6wP9CvFm7ijIkmRXf8/91Ksu2i0tb0JuwC9GOd1yol60/dcE9RqHbcLhcdcUREDuaqt2QtEo/+YHLngR3TTMfVDVvfVl6zaSSXqf8jip79kl2b7haC8+JlFyQgnUidbWhHv5GI9oYEJh4p2KcQT3gH1IgZ0v0dgFxvnfdXz8TsjZlAbfpxIGsKSClSza8Sxac6uhvupOkW0h7CJsZhIeIptCKTsOCoqRMM/KvsxDkn9QG5d9vzzPRRRiwCPzBQ7/cJrVinPZttFWVGKmdK5XEcxSvOIwFxMJ/9WnbhX1zRkd2TmPKBjErMjG/Y6LT1SntCMUNGQK5KwX609mkiEHEy9ey76l0PUoXSqHLkSwiTUpb4HjhgWCXVI94pbkT80C/TA0dnb1lvpCr9Cr+h0lMnH9ESRC2Q5CLMf1PYtBfqdYLiOkHClTCvOPTtSTiixuiAbceFd+6RerO3tlvN9wZJ2d8A276+s+PQlwZOCJjUL3CgSre8t86/4AnOq3WikpCF+YBRJeK1JtSFeCw/acq6rdBY9c7nUrDGHQq4QMcDj6enXu/se35pUfssOHq7UzCIIuX1TyudPzfvZJAfXasjN/Vj9f8FGgLccXVHdo4LxKVPACTQ3qUG8yFFjaP00ydT4VbVsEM+Qpb1HmhJJ1dK3mSTPN841XrJJJ5JUO4UhmWHr6dvzuPgH7YcG9DAu9W7XuvY8kmQ/s5Mrx64SgWRFNcw8Xgl3cnWQccchyAUI2xMEqWOhK9mZ4/R3dMR8u66vOPtmx86otW6KnqEXRDn7wFPNlF8IuV3x4N+2p+PEA9TChme1vH2C5kc7igRVTckXs8SIO7crzt6ikwWKdUwxA6g8Sb2V7gEVIjg6eqvsmFu+3i12MrUXSj/vVwC/01jNsTzQ+9xvJI34hX2DwnCUedOt55TG/RzLrX/uaFni42Qk4cW8du3YDyvlRx2zSxmdRiraDjKlpskUbvwUAAAAAAAA=", "shuriken": "data:image/webp;base64,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", "agulhas": "data:image/webp;base64,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", "fio-de-nilon": "data:image/webp;base64,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", "pedra-da-familia": "data:image/webp;base64,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", "papel-bomba": "data:image/webp;base64,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", "comida": "data:image/webp;base64,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", "esfera": "data:image/webp;base64,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", "pilula-de-chakra": "data:image/webp;base64,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"};
  const ALIASES_INVENTARIO = {
    "pilula de chakra":"pilula-de-chakra",
    "pilula chakra":"pilula-de-chakra",
    "pílula de chakra":"pilula-de-chakra",
    "chakra":"pilula-de-chakra",
    "esfera":"esfera",
    "esferas de metal":"esfera",
    "comida":"comida",
    "alimento":"comida",
    "papel bomba":"papel-bomba",
    "papeis bomba":"papel-bomba",
    "papéis bomba":"papel-bomba",
    "bomba":"papel-bomba",
    "pedra da familia":"pedra-da-familia",
    "pedra da família":"pedra-da-familia",
    "pedra de familia":"pedra-da-familia",
    "pedra de família":"pedra-da-familia",
    "fio de nilon":"fio-de-nilon",
    "fio de nylon":"fio-de-nilon",
    "nylon":"fio-de-nilon",
    "nilon":"fio-de-nilon",
    "agulha":"agulhas",
    "agulhas":"agulhas",
    "senbon":"agulhas",
    "shuriken":"shuriken",
    "kunai":"kunai",
    "moeda de diamante":"moeda-de-diamante",
    "diamante":"moeda-de-diamante",
    "moeda de ouro":"moeda-de-ouro",
    "ouro":"moeda-de-ouro",
    "moeda de prata":"moeda-de-prata",
    "prata":"moeda-de-prata",
    "moeda de bronze":"moeda-de-bronze",
    "bronze":"moeda-de-bronze",
    "repelente":"repelente",
    "pergaminho de selamento":"pergaminho-de-selamento",
    "pergaminho selamento":"pergaminho-de-selamento",
    "selamento":"pergaminho-de-selamento"
  };

  function normalizarInventarioVisual(valor){
    return String(valor||"")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g,"")
      .replace(/\s+/g," ");
  }

  function escaparInventarioVisual(valor){
    return String(valor==null?"":valor)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function slugIconeInventarioVisual(nome){
    const alvo=normalizarInventarioVisual(nome);
    if(!alvo)return "";
    if(ALIASES_INVENTARIO[alvo])return ALIASES_INVENTARIO[alvo];

    const chaves=Object.keys(ALIASES_INVENTARIO).sort(function(a,b){return b.length-a.length;});
    for(const chave of chaves){
      if(chave.length>2 && alvo.includes(chave))return ALIASES_INVENTARIO[chave];
    }
    return "";
  }

  function imagemInventarioVisual(nome, classeExtra){
    const slug=slugIconeInventarioVisual(nome);
    const src=slug ? ICONES_INVENTARIO_EMBUTIDOS[slug] : "";
    if(src){
      return `<img class="itemInventarioImg ${classeExtra||""}" src="${src}" alt="" loading="lazy" decoding="async">`;
    }
    const fallback=(typeof iconeInventario==="function" ? iconeInventario(nome) : "🎒");
    return `<span class="itemInventarioIconeFallback ${classeExtra||""}">${fallback}</span>`;
  }

  function quantidadeInventarioVisual(item){
    let qtd=parseInt(item&&item.quantidade!=null?item.quantidade:0,10);
    if(isNaN(qtd)||qtd<0)qtd=0;
    return qtd;
  }

  window.abrirDetalheItemInventario = function(i){
    garantirInventarioItens();
    window.__inventarioDetalheAberto = (window.__inventarioDetalheAberto===i ? null : i);
    renderizarInventario();
  };

  window.fecharDetalheItemInventario = function(){
    window.__inventarioDetalheAberto = null;
    renderizarInventario();
  };

  window.ajustarQtdItemInventario = function(i,delta){
    garantirInventarioItens();
    if(!estado.inventarioItens[i])return;
    const atual=quantidadeInventarioVisual(estado.inventarioItens[i]);
    const novo=Math.max(0, atual + Number(delta||0));
    alterarQtdItemInventario(i, novo);
    renderizarInventario();
  };

  window.confirmarQtdItemInventarioVisual = function(i,valor){
    alterarQtdItemInventario(i,valor);
    renderizarInventario();
  };

  window.renderizarInventario = function(){
    garantirInventarioItens();
    const lista=document.getElementById("listaInventario");
    if(!lista)return;

    const itens=estado.inventarioItens||[];
    if(!itens.length){
      lista.innerHTML='<div class="itemInventarioVazio">Nenhum item adicionado</div>';
      window.__inventarioDetalheAberto=null;
      return;
    }

    if(window.__inventarioDetalheAberto!=null && !itens[window.__inventarioDetalheAberto]){
      window.__inventarioDetalheAberto=null;
    }

    const html=[];
    itens.forEach(function(item,i){
      const nomeOriginal=String(item&&item.nome?item.nome:"Item");
      const nome=escaparInventarioVisual(nomeOriginal);
      const qtd=quantidadeInventarioVisual(item);
      const aberto=window.__inventarioDetalheAberto===i;

      html.push(`
        <div class="itemInventario itemInventarioVisualCard ${aberto?"itemInventarioAberto":""}" role="button" tabindex="0" onclick="abrirDetalheItemInventario(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirDetalheItemInventario(${i})}">
          <div class="itemInventarioImagemWrap">
            ${imagemInventarioVisual(nomeOriginal)}
            <span class="itemInventarioQuantidadeBadge">${qtd}</span>
          </div>
          <div class="itemInventarioNomeMini" title="${nome}">${nome}</div>
        </div>
      `);

      if(aberto){
        html.push(`
          <div class="itemInventarioDetalhe">
            <div class="itemInventarioDetalheImagem">
              ${imagemInventarioVisual(nomeOriginal,"itemInventarioImgGrande")}
            </div>
            <div class="itemInventarioDetalheConteudo">
              <div class="itemInventarioDetalheNome">${nome}</div>
              <div class="itemInventarioQtdControle">
                <button type="button" onclick="event.stopPropagation();ajustarQtdItemInventario(${i},-1)">−</button>
                <input type="number" min="0" inputmode="numeric" value="${qtd}" onchange="confirmarQtdItemInventarioVisual(${i},this.value)">
                <button type="button" onclick="event.stopPropagation();ajustarQtdItemInventario(${i},1)">+</button>
              </div>
              <div class="itemInventarioAcoes">
                <button type="button" onclick="event.stopPropagation();usarItemInventario(${i})">Usar</button>
                <button type="button" onclick="event.stopPropagation();editarNomeItemInventario(${i})">Editar</button>
                <button type="button" class="btnExcluirItemVisual" onclick="event.stopPropagation();removerItemInventario(${i})">Excluir</button>
              </div>
            </div>
          </div>
        `);
      }
    });

    lista.innerHTML=html.join("");
  };
})();


/* ======================================================================
   Kekkei Genkai e jutsus dinâmicos
   ====================================================================== */
(function(){
  "use strict";

  if(window.__kekkeiJutsuDinamicoAtivo) return;
  window.__kekkeiJutsuDinamicoAtivo = true;

  const ELEMENTOS_JUTSU_FIXOS = [
    {valor:"katon",  nome:"KATON",  icone:"🔥", classe:"jutsu-katon"},
    {valor:"raiton", nome:"RAITON", icone:"⚡", classe:"jutsu-raiton"},
    {valor:"fuuton", nome:"FUUTON", icone:"🌪️", classe:"jutsu-fuuton"},
    {valor:"suiton", nome:"SUITON", icone:"💧", classe:"jutsu-suiton"},
    {valor:"doton",  nome:"DOTON",  icone:"🪨", classe:"jutsu-doton"},
    {valor:"yin",    nome:"YINTON", icone:"🌑", classe:"jutsu-yin"},
    {valor:"yang",   nome:"YOUTON", icone:"☀️", classe:"jutsu-yang"},
    {valor:"neutro", nome:"NEUTRO", icone:"✨", classe:"jutsu-neutro"}
  ];

  function normalizarKekkeiJutsu(valor){
    return String(valor || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function criarIdKekkeiJutsu(){
    return "kg_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,10);
  }

  /* Mantém compatibilidade com Kekkei Genkai já salvas e cria um ID estável
     para que renomear a Kekkei atualize automaticamente os jutsus vinculados. */
  window.garantirKekkeiArray = function(){
    if(!estado.kekkeiGenkai || !Array.isArray(estado.kekkeiGenkai)){
      estado.kekkeiGenkai = [];
    }

    const idsUsados = new Set();
    estado.kekkeiGenkai.forEach(function(kekkei){
      if(!kekkei || typeof kekkei !== "object") return;

      let id = String(kekkei.id || "").trim();
      if(!id || idsUsados.has(id)){
        do{ id = criarIdKekkeiJutsu(); }while(idsUsados.has(id));
        kekkei.id = id;
      }
      idsUsados.add(id);
    });
  };

  function kekkeisDisponiveisParaJutsu(){
    window.garantirKekkeiArray();
    return (estado.kekkeiGenkai || [])
      .filter(function(kekkei){
        return kekkei && String(kekkei.nome || "").trim();
      })
      .map(function(kekkei){
        return {
          id:String(kekkei.id),
          nome:String(kekkei.nome).trim()
        };
      });
  }

  window.dadosElementoJutsu = function(elemento){
    const valor = String(elemento || "neutro");
    const fixo = ELEMENTOS_JUTSU_FIXOS.find(function(item){
      return item.valor === valor;
    });

    if(fixo){
      return {nome:fixo.nome, icone:fixo.icone, classe:fixo.classe};
    }

    if(valor.indexOf("kekkei:") === 0){
      const referencia = valor.slice(7);
      const kekkeis = kekkeisDisponiveisParaJutsu();
      const kekkei = kekkeis.find(function(item){
        return item.id === referencia;
      }) || kekkeis.find(function(item){
        return normalizarKekkeiJutsu(item.nome) === normalizarKekkeiJutsu(referencia);
      });

      return {
        nome:kekkei ? kekkei.nome.toUpperCase() : "KEKKEI GENKAI REMOVIDA",
        icone:"🧬",
        classe:"jutsu-kekkei"
      };
    }

    return {nome:"NEUTRO", icone:"✨", classe:"jutsu-neutro"};
  };

  window.escolherElementoJutsuPrompt = function(indice){
    const jutsu = (estado.jutsus || [])[indice];
    if(!jutsu) return;

    const kekkeis = kekkeisDisponiveisParaJutsu();
    const linhas = ELEMENTOS_JUTSU_FIXOS.map(function(item, posicao){
      return (posicao + 1) + " - " + item.nome.charAt(0) + item.nome.slice(1).toLowerCase();
    });

    kekkeis.forEach(function(kekkei, posicao){
      linhas.push((ELEMENTOS_JUTSU_FIXOS.length + posicao + 1) + " - Kekkei Genkai: " + kekkei.nome);
    });

    const atual = window.dadosElementoJutsu(jutsu.elemento || "katon").nome;
    const mensagem = [
      "Escolha a natureza do jutsu:",
      "",
      linhas.join("\n"),
      "",
      "Atual: " + atual
    ].join("\n");

    const escolha = prompt(mensagem, "");
    if(escolha === null) return;

    const texto = String(escolha).trim();
    if(!texto) return;

    const numero = Number(texto);
    let novoElemento = "";

    if(Number.isInteger(numero)){
      if(numero >= 1 && numero <= ELEMENTOS_JUTSU_FIXOS.length){
        novoElemento = ELEMENTOS_JUTSU_FIXOS[numero - 1].valor;
      }else{
        const indiceKekkei = numero - ELEMENTOS_JUTSU_FIXOS.length - 1;
        if(kekkeis[indiceKekkei]){
          novoElemento = "kekkei:" + kekkeis[indiceKekkei].id;
        }
      }
    }else{
      const textoNormalizado = normalizarKekkeiJutsu(texto);
      const fixoDigitado = ELEMENTOS_JUTSU_FIXOS.find(function(item){
        return normalizarKekkeiJutsu(item.valor) === textoNormalizado ||
               normalizarKekkeiJutsu(item.nome) === textoNormalizado;
      });

      if(fixoDigitado){
        novoElemento = fixoDigitado.valor;
      }else{
        const nomeSemPrefixo = texto.replace(/^kekkei\s*genkai\s*:\s*/i, "");
        const kekkeiDigitada = kekkeis.find(function(item){
          return normalizarKekkeiJutsu(item.nome) === normalizarKekkeiJutsu(nomeSemPrefixo);
        });
        if(kekkeiDigitada){
          novoElemento = "kekkei:" + kekkeiDigitada.id;
        }
      }
    }

    if(!novoElemento){
      alert("Opção inválida. Escolha um dos números ou digite o nome de uma Kekkei Genkai cadastrada.");
      return;
    }

    jutsu.elemento = novoElemento;
    if(typeof persistirSemRender === "function") persistirSemRender();
    else if(typeof persistirEstadoLocal === "function") persistirEstadoLocal();

    if(typeof renderizarJutsus === "function") renderizarJutsus();
  };
})();


/* ======================================================================
   Atualização imediata da barra de XP
   ====================================================================== */
(function(){
  function ligarAtualizacaoXp(){
    const campo=document.getElementById("xpPerfilInput");
    if(!campo||campo.dataset.xpBarListener==="1") return;
    campo.dataset.xpBarListener="1";
    const atualizar=function(){
      if(typeof atualizarPerfil==="function") atualizarPerfil();
      else if(typeof atualizarHUD==="function") atualizarHUD();
    };
    campo.addEventListener("input",atualizar);
    campo.addEventListener("change",atualizar);
    atualizar();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",ligarAtualizacaoXp);
  else ligarAtualizacaoXp();
})();


/* ======================================================================
   Ajuste do menu do avatar e enquadramento do fundo
   ====================================================================== */
(function(){
  "use strict";

  const AJUSTE_PADRAO = Object.freeze({modo:"cover", x:50, y:50, zoom:100});
  let imagemFundoAtual = "";
  let ajusteTemporario = null;
  let menuPaiOriginal = null;
  let menuProximoOriginal = null;
  let medicaoEmAndamento = false;
  let previewFundo = null;

  function numeroLimitado(valor, minimo, maximo, padrao){
    const n = Number(valor);
    return Number.isFinite(n) ? Math.min(maximo, Math.max(minimo, n)) : padrao;
  }

  function campoPersistido(id){
    return document.getElementById(id);
  }

  function obterAjusteFundo(){
    const modo = campoPersistido("perfilFundoModo")?.value;
    return {
      modo: modo === "contain" ? "contain" : "cover",
      x: numeroLimitado(campoPersistido("perfilFundoPosX")?.value, 0, 100, AJUSTE_PADRAO.x),
      y: numeroLimitado(campoPersistido("perfilFundoPosY")?.value, 0, 100, AJUSTE_PADRAO.y),
      zoom: numeroLimitado(campoPersistido("perfilFundoZoom")?.value, 70, 200, AJUSTE_PADRAO.zoom)
    };
  }

  function gravarAjusteFundo(ajuste){
    const valores = {
      perfilFundoModo: ajuste.modo === "contain" ? "contain" : "cover",
      perfilFundoPosX: String(numeroLimitado(ajuste.x, 0, 100, 50)),
      perfilFundoPosY: String(numeroLimitado(ajuste.y, 0, 100, 50)),
      perfilFundoZoom: String(numeroLimitado(ajuste.zoom, 70, 200, 100))
    };
    Object.entries(valores).forEach(function([id, valor]){
      const campo = campoPersistido(id);
      if(!campo) return;
      campo.value = valor;
      campo.dispatchEvent(new Event("input", {bubbles:true}));
      campo.dispatchEvent(new Event("change", {bubbles:true}));
    });
  }

  function ajusteAtivo(){
    return ajusteTemporario || obterAjusteFundo();
  }

  function extrairUrlFundo(valor){
    const texto = String(valor || "").trim();
    if(!texto || texto === "none") return "";
    const inicio = texto.indexOf("url(");
    if(inicio < 0) return "";
    let url = texto.slice(inicio + 4, texto.lastIndexOf(")")).trim();
    if((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))){
      url = url.slice(1, -1);
    }
    return url.replace(/\\(["'\\])/g, "$1");
  }

  function sincronizarImagemFundoAtual(){
    const fundo = document.getElementById("perfilFundoImagem");
    if(!fundo) return "";
    if(!imagemFundoAtual){
      imagemFundoAtual = extrairUrlFundo(fundo.style.backgroundImage) || extrairUrlFundo(getComputedStyle(fundo).backgroundImage);
    }
    if(imagemFundoAtual && !fundo.dataset.imgWidth && !medicaoEmAndamento){
      medicaoEmAndamento = true;
      const medidor = new Image();
      medidor.decoding = "async";
      medidor.onload = function(){
        medicaoEmAndamento = false;
        fundo.dataset.imgWidth = String(medidor.naturalWidth || 0);
        fundo.dataset.imgHeight = String(medidor.naturalHeight || 0);
        aplicarEnquadramentoFundo();
      };
      medidor.onerror = function(){ medicaoEmAndamento = false; };
      medidor.src = imagemFundoAtual;
    }
    return imagemFundoAtual;
  }

  function aplicarEnquadramentoNoElemento(alvo, ajuste){
    const fundo = document.getElementById("perfilFundoImagem");
    const imagem = sincronizarImagemFundoAtual();
    if(!alvo || !fundo || !imagem) return;

    if(alvo !== fundo){
      alvo.style.setProperty("background-image", 'url("' + imagem.replace(/"/g, '%22') + '")', "important");
    }
    alvo.style.setProperty("background-position", ajuste.x + "% " + ajuste.y + "%", "important");
    alvo.style.setProperty("background-repeat", "no-repeat", "important");

    const iw = Number(fundo.dataset.imgWidth || 0);
    const ih = Number(fundo.dataset.imgHeight || 0);
    const largura = alvo.clientWidth;
    const altura = alvo.clientHeight;

    if(iw > 0 && ih > 0 && largura > 0 && altura > 0){
      const base = ajuste.modo === "contain"
        ? Math.min(largura / iw, altura / ih)
        : Math.max(largura / iw, altura / ih);
      const escala = base * (ajuste.zoom / 100);
      alvo.style.setProperty("background-size", Math.max(1, iw * escala) + "px " + Math.max(1, ih * escala) + "px", "important");
    }else{
      alvo.style.setProperty("background-size", ajuste.modo, "important");
    }
  }

  function aplicarEnquadramentoFundo(){
    const fundo = document.getElementById("perfilFundoImagem");
    if(!fundo) return;
    const ajuste = ajusteAtivo();
    aplicarEnquadramentoNoElemento(fundo, ajuste);
    if(previewFundo) aplicarEnquadramentoNoElemento(previewFundo, ajuste);
  }

  window.aplicarFundoPerfil = function(imagem){
    const fundo = document.getElementById("perfilFundoImagem");
    imagemFundoAtual = imagem || "";

    if(!fundo) return;
    if(!imagem){
      fundo.style.setProperty("background-image", "none", "important");
      fundo.style.removeProperty("background-size");
      fundo.style.removeProperty("background-position");
      fundo.classList.remove("ativo");
      delete fundo.dataset.imgWidth;
      delete fundo.dataset.imgHeight;
      return;
    }

    fundo.style.setProperty("background-image", 'url("' + imagem.replace(/"/g, '%22') + '")', "important");
    fundo.classList.add("ativo");

    const medidor = new Image();
    medidor.decoding = "async";
    medidor.onload = function(){
      if(imagemFundoAtual !== imagem) return;
      fundo.dataset.imgWidth = String(medidor.naturalWidth || 0);
      fundo.dataset.imgHeight = String(medidor.naturalHeight || 0);
      aplicarEnquadramentoFundo();
    };
    medidor.onerror = aplicarEnquadramentoFundo;
    medidor.src = imagem;
    aplicarEnquadramentoFundo();
  };

  function guardarLocalMenu(menu){
    if(menuPaiOriginal) return;
    menuPaiOriginal = menu.parentNode;
    menuProximoOriginal = menu.nextSibling;
  }

  function levarMenuParaBody(menu){
    guardarLocalMenu(menu);
    if(menu.parentNode !== document.body) document.body.appendChild(menu);
  }

  function restaurarLocalMenu(menu){
    if(!menuPaiOriginal || !menu || menu.parentNode === menuPaiOriginal) return;
    if(menuProximoOriginal && menuProximoOriginal.parentNode === menuPaiOriginal){
      menuPaiOriginal.insertBefore(menu, menuProximoOriginal);
    }else{
      menuPaiOriginal.appendChild(menu);
    }
  }

  function limparPosicaoMenuAvatar(){
    const menu = document.getElementById("avatarMenu");
    if(!menu) return;
    ["display","visibility","position","left","top","right","bottom","width","transform"].forEach(function(prop){
      menu.style.removeProperty(prop);
    });
    restaurarLocalMenu(menu);
  }

  function fecharMenuAvatar(){
    const menu = document.getElementById("avatarMenu");
    if(!menu) return;
    menu.classList.remove("aberto");
    limparPosicaoMenuAvatar();
  }

  function posicionarMenuAvatar(){
    const menu = document.getElementById("avatarMenu");
    const avatar = document.querySelector("#identidade .avatarNovo");
    if(!menu || !avatar || !menu.classList.contains("aberto")) return;

    levarMenuParaBody(menu);
    menu.style.setProperty("position", "fixed", "important");
    menu.style.setProperty("visibility", "hidden", "important");
    menu.style.setProperty("display", "grid", "important");
    menu.style.setProperty("left", "10px", "important");
    menu.style.setProperty("top", "10px", "important");
    menu.style.setProperty("transform", "none", "important");

    requestAnimationFrame(function(){
      const a = avatar.getBoundingClientRect();
      const visual = window.visualViewport;
      const origemX = visual ? visual.offsetLeft : 0;
      const origemY = visual ? visual.offsetTop : 0;
      const larguraTela = visual ? visual.width : window.innerWidth;
      const alturaTela = visual ? visual.height : window.innerHeight;
      const margem = 12;
      const larguraMenu = Math.min(menu.offsetWidth || 214, Math.max(120, larguraTela - margem * 2));
      const alturaMenu = Math.min(menu.offsetHeight || 210, Math.max(80, alturaTela - margem * 2));
      const direita = origemX + larguraTela - margem;
      const inferior = origemY + alturaTela - margem;
      let esquerda;
      let topo;

      if(larguraTela <= 520){
        esquerda = origemX + (larguraTela - larguraMenu) / 2;
        topo = a.bottom + 10;
        if(topo + alturaMenu > inferior) topo = a.top - alturaMenu - 10;
      }else if(a.right + 12 + larguraMenu <= direita){
        esquerda = a.right + 12;
        topo = a.top;
      }else if(a.left - larguraMenu - 12 >= origemX + margem){
        esquerda = a.left - larguraMenu - 12;
        topo = a.top;
      }else{
        esquerda = a.left + (a.width - larguraMenu) / 2;
        topo = a.bottom + 10;
      }

      esquerda = Math.max(origemX + margem, Math.min(esquerda, direita - larguraMenu));
      topo = Math.max(origemY + margem, Math.min(topo, inferior - alturaMenu));

      menu.style.setProperty("width", larguraMenu + "px", "important");
      menu.style.setProperty("left", esquerda + "px", "important");
      menu.style.setProperty("top", topo + "px", "important");
      menu.style.setProperty("visibility", "visible", "important");
    });
  }

  window.toggleAvatarMenu = function(){
    const menu = document.getElementById("avatarMenu");
    if(!menu) return;
    if(menu.classList.contains("aberto")){
      fecharMenuAvatar();
    }else{
      menu.classList.add("aberto");
      posicionarMenuAvatar();
    }
  };

  function fecharAjusteFundo(restaurar){
    const overlay = document.querySelector(".ajusteFundoOverlay");
    if(restaurar){
      ajusteTemporario = null;
      aplicarEnquadramentoFundo();
    }
    previewFundo = null;
    document.body.classList.remove("ajustandoFundoPerfil");
    if(overlay) overlay.remove();
  }

  window.abrirAjusteFundoPerfil = function(){
    const fundo = document.getElementById("perfilFundoImagem");
    const imagemSincronizada = sincronizarImagemFundoAtual();
    const temImagem = imagemSincronizada || (fundo && getComputedStyle(fundo).backgroundImage !== "none");
    const menu = document.getElementById("avatarMenu");
    if(menu) menu.classList.remove("aberto");

    if(!temImagem){
      if(typeof window.avisar === "function") window.avisar("Nenhum fundo definido", "Adicione uma imagem de fundo antes de ajustar o enquadramento.");
      else alert("Adicione uma imagem de fundo antes de ajustar o enquadramento.");
      return;
    }

    ajusteTemporario = {...obterAjusteFundo()};

    const overlay = document.createElement("div");
    overlay.className = "ajusteFundoOverlay";
    overlay.innerHTML = `
      <div class="ajusteFundoPainel" role="dialog" aria-modal="true" aria-label="Ajustar imagem de fundo">
        <div class="ajusteFundoCabecalho">
          <h3>Ajustar fundo</h3>
          <button type="button" class="ajusteFundoFechar" data-acao="cancelar" aria-label="Fechar">×</button>
        </div>
        <div class="ajusteFundoPreview" aria-label="Prévia do enquadramento">
          <div class="ajusteFundoPreviewImagem"></div>
          <div class="ajusteFundoPreviewGrade"></div>
          <span class="ajusteFundoPreviewDica">Arraste para reposicionar</span>
        </div>
        <label>Exibição
          <select data-ajuste="modo">
            <option value="cover">Preencher a área</option>
            <option value="contain">Mostrar imagem inteira</option>
          </select>
        </label>
        <label>Horizontal
          <input data-ajuste="x" type="range" min="0" max="100" step="1">
          <span class="ajusteFundoValor" data-valor="x"></span>
        </label>
        <label>Vertical
          <input data-ajuste="y" type="range" min="0" max="100" step="1">
          <span class="ajusteFundoValor" data-valor="y"></span>
        </label>
        <label>Zoom
          <input data-ajuste="zoom" type="range" min="70" max="200" step="1">
          <span class="ajusteFundoValor" data-valor="zoom"></span>
        </label>
        <div class="ajusteFundoAcoes">
          <button type="button" data-acao="resetar">Centralizar</button>
          <button type="button" data-acao="cancelar">Cancelar</button>
          <button type="button" class="aplicar" data-acao="aplicar">Aplicar</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.body.classList.add("ajustandoFundoPerfil");
    previewFundo = overlay.querySelector(".ajusteFundoPreviewImagem");

    const atualizarCampos = function(){
      overlay.querySelector('[data-ajuste="modo"]').value = ajusteTemporario.modo;
      ["x","y","zoom"].forEach(function(campo){
        overlay.querySelector('[data-ajuste="' + campo + '"]').value = ajusteTemporario[campo];
        overlay.querySelector('[data-valor="' + campo + '"]').textContent = ajusteTemporario[campo] + "%";
      });
    };

    overlay.addEventListener("input", function(evento){
      const campo = evento.target && evento.target.dataset ? evento.target.dataset.ajuste : "";
      if(!campo) return;
      ajusteTemporario[campo] = campo === "modo" ? evento.target.value : Number(evento.target.value);
      atualizarCampos();
      aplicarEnquadramentoFundo();
    });

    overlay.addEventListener("change", function(evento){
      const campo = evento.target && evento.target.dataset ? evento.target.dataset.ajuste : "";
      if(campo === "modo"){
        ajusteTemporario.modo = evento.target.value;
        aplicarEnquadramentoFundo();
      }
    });

    overlay.addEventListener("click", function(evento){
      if(evento.target === overlay){
        fecharAjusteFundo(true);
        return;
      }
      const acao = evento.target && evento.target.dataset ? evento.target.dataset.acao : "";
      if(acao === "resetar"){
        ajusteTemporario = {...AJUSTE_PADRAO};
        atualizarCampos();
        aplicarEnquadramentoFundo();
      }else if(acao === "cancelar"){
        fecharAjusteFundo(true);
      }else if(acao === "aplicar"){
        gravarAjusteFundo(ajusteTemporario);
        ajusteTemporario = null;
        aplicarEnquadramentoFundo();
        fecharAjusteFundo(false);
      }
    });


    const areaPreview = overlay.querySelector(".ajusteFundoPreview");
    let arrastePreview = null;
    areaPreview.addEventListener("pointerdown", function(evento){
      arrastePreview = {
        id:evento.pointerId,
        inicioX:evento.clientX,
        inicioY:evento.clientY,
        x:ajusteTemporario.x,
        y:ajusteTemporario.y
      };
      areaPreview.classList.add("arrastando");
      areaPreview.setPointerCapture?.(evento.pointerId);
      evento.preventDefault();
    });
    areaPreview.addEventListener("pointermove", function(evento){
      if(!arrastePreview || evento.pointerId !== arrastePreview.id) return;
      const retangulo = areaPreview.getBoundingClientRect();
      ajusteTemporario.x = numeroLimitado(arrastePreview.x - ((evento.clientX - arrastePreview.inicioX) / Math.max(1, retangulo.width)) * 100, 0, 100, 50);
      ajusteTemporario.y = numeroLimitado(arrastePreview.y - ((evento.clientY - arrastePreview.inicioY) / Math.max(1, retangulo.height)) * 100, 0, 100, 50);
      atualizarCampos();
      aplicarEnquadramentoFundo();
      evento.preventDefault();
    });
    const finalizarArraste = function(evento){
      if(!arrastePreview || (evento.pointerId !== undefined && evento.pointerId !== arrastePreview.id)) return;
      areaPreview.releasePointerCapture?.(arrastePreview.id);
      arrastePreview = null;
      areaPreview.classList.remove("arrastando");
    };
    areaPreview.addEventListener("pointerup", finalizarArraste);
    areaPreview.addEventListener("pointercancel", finalizarArraste);
    atualizarCampos();
    aplicarEnquadramentoFundo();
  };

  const carregarFundoAnterior = window.carregarFundoPerfil;
  if(typeof carregarFundoAnterior === "function"){
    window.carregarFundoPerfil = async function(evento){
      ajusteTemporario = null;
      gravarAjusteFundo(AJUSTE_PADRAO);
      await carregarFundoAnterior(evento);
      aplicarEnquadramentoFundo();
    };
  }

  const menuObservado = document.getElementById("avatarMenu");
  if(menuObservado){
    guardarLocalMenu(menuObservado);
    menuObservado.addEventListener("click", function(evento){ evento.stopPropagation(); });
    new MutationObserver(function(){
      if(!menuObservado.classList.contains("aberto")) limparPosicaoMenuAvatar();
    }).observe(menuObservado, {attributes:true, attributeFilter:["class"]});
  }

  let timerResize = null;
  window.addEventListener("resize", function(){
    clearTimeout(timerResize);
    timerResize = setTimeout(function(){
      posicionarMenuAvatar();
      aplicarEnquadramentoFundo();
    }, 80);
  });
  window.addEventListener("scroll", posicionarMenuAvatar, {passive:true});
  window.visualViewport?.addEventListener("resize", posicionarMenuAvatar);
  window.visualViewport?.addEventListener("scroll", posicionarMenuAvatar);

  function iniciarFundoJaCarregado(){
    if(sincronizarImagemFundoAtual()) aplicarEnquadramentoFundo();
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(iniciarFundoJaCarregado, 120); }, {once:true});
  }else{
    setTimeout(iniciarFundoJaCarregado, 120);
  }
  window.addEventListener("pageshow", function(){ setTimeout(iniciarFundoJaCarregado, 100); });
})();

/* ===== SHINOBI: SERVICE WORKER E ATUALIZAÇÃO CONTROLADA ===== */
(function(){
  "use strict";

  if(window.__shinobiAtualizacaoSWAtiva) return;
  window.__shinobiAtualizacaoSWAtiva = true;

  if(!("serviceWorker" in navigator)) return;

  const SW_URL = "./service-worker.js";
  const INTERVALO_VERIFICACAO = 60 * 60 * 1000;

  let registroAtual = null;
  let recarregando = false;
  let verificacaoEmAndamento = false;

  function obterAvisoAtualizacao(){
    let aviso = document.getElementById("shinobiAvisoAtualizacao");
    if(aviso) return aviso;

    aviso = document.createElement("section");
    aviso.id = "shinobiAvisoAtualizacao";
    aviso.className = "shinobiAvisoAtualizacao";
    aviso.hidden = true;
    aviso.setAttribute("role", "status");
    aviso.setAttribute("aria-live", "polite");

    aviso.innerHTML = `
      <div class="shinobiAvisoAtualizacao__texto">
        <strong>Nova versão disponível</strong>
        <span>Atualize para receber as correções mais recentes.</span>
      </div>

      <button
        id="shinobiBotaoAtualizar"
        class="shinobiAvisoAtualizacao__botao"
        type="button"
      >
        Atualizar agora
      </button>
    `;

    document.body.appendChild(aviso);
    return aviso;
  }

  function salvarFichaAntesDeAtualizar(){
    try{
      if(typeof window.salvarImediatoV3 === "function"){
        window.salvarImediatoV3();
        return;
      }

      if(typeof window.salvar === "function"){
        window.salvar();
      }
    }catch(erro){
      console.warn(
        "Não foi possível executar o salvamento antes da atualização.",
        erro
      );
    }
  }

  function mostrarAvisoAtualizacao(registro){
    if(!registro || !registro.waiting) return;

    registroAtual = registro;

    const aviso = obterAvisoAtualizacao();
    const botao = aviso.querySelector("#shinobiBotaoAtualizar");

    aviso.hidden = false;

    window.requestAnimationFrame(function(){
      aviso.classList.add("visivel");
    });

    if(!botao || botao.dataset.configurado === "1") return;

    botao.dataset.configurado = "1";

    botao.addEventListener("click", function(){
      if(!registroAtual || !registroAtual.waiting) return;

      salvarFichaAntesDeAtualizar();

      botao.disabled = true;
      botao.textContent = "Atualizando...";

      registroAtual.waiting.postMessage({
        type: "SKIP_WAITING"
      });

      window.setTimeout(function(){
        if(!recarregando){
          window.location.reload();
        }
      }, 8000);
    });
  }

  function acompanharRegistro(registro){
    if(!registro) return;

    if(registro.waiting && navigator.serviceWorker.controller){
      mostrarAvisoAtualizacao(registro);
    }

    registro.addEventListener("updatefound", function(){
      const workerNovo = registro.installing;
      if(!workerNovo) return;

      workerNovo.addEventListener("statechange", function(){
        if(
          workerNovo.state === "installed" &&
          navigator.serviceWorker.controller
        ){
          mostrarAvisoAtualizacao(registro);
        }
      });
    });
  }

  async function verificarAtualizacao(){
    if(
      !registroAtual ||
      verificacaoEmAndamento ||
      !navigator.onLine
    ){
      return;
    }

    verificacaoEmAndamento = true;

    try{
      await registroAtual.update();

      if(
        registroAtual.waiting &&
        navigator.serviceWorker.controller
      ){
        mostrarAvisoAtualizacao(registroAtual);
      }
    }catch(erro){
      console.warn(
        "Não foi possível verificar uma atualização agora.",
        erro
      );
    }finally{
      verificacaoEmAndamento = false;
    }
  }

  async function registrarServiceWorker(){
    try{
      const registro = await navigator.serviceWorker.register(SW_URL, {
        scope: "./",
        updateViaCache: "none"
      });

      registroAtual = registro;
      acompanharRegistro(registro);

      await navigator.serviceWorker.ready;
      await verificarAtualizacao();

      window.setInterval(
        verificarAtualizacao,
        INTERVALO_VERIFICACAO
      );
    }catch(erro){
      console.error(
        "Falha ao registrar o service worker do Shinobi.",
        erro
      );
    }
  }

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    function(){
      if(recarregando) return;

      recarregando = true;
      window.location.reload();
    }
  );

  document.addEventListener(
    "visibilitychange",
    function(){
      if(document.visibilityState === "visible"){
        verificarAtualizacao();
      }
    }
  );

  window.addEventListener("online", verificarAtualizacao);

  if(document.readyState === "complete"){
    registrarServiceWorker();
  }else{
    window.addEventListener(
      "load",
      registrarServiceWorker,
      {once: true}
    );
  }
})();
