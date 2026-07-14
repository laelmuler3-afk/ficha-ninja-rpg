/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

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
const APP_VERSION = window.APP_VERSION || "1.3.9-notes-fix";
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
}function escolherTipoAtaquePrompt(i){const a=(estado.armados||[])[i];if(!a)return;const atual=a.tipo||"armado",escolha=prompt(`Tipo de ataque:\n1 - Armado\n2 - Desarmado\n\nAtual: ${atual}`,"");if(null===escolha)return;const valor=String(escolha).trim().toLowerCase(),novo="2"===valor||"desarmado"===valor?"desarmado":"armado";a.tipo=novo,persistirSemRender(),renderizarArmados()}function iconeTipoAtaque(tipo){return"desarmado"===tipo?"👊":"⚔️"}function labelTipoAtaque(tipo){return"desarmado"===tipo?"Ataque desarmado":"Ataque armado"}function editarCampoArmadoPrompt(i,campo,rotulo){const a=(estado.armados||[])[i];if(!a)return;const atual=a[campo]||"",novo=prompt(rotulo,atual);null!==novo&&(a[campo]=novo.trim(),"nome"!==campo||a.itemInventario&&String(a.itemInventario).trim()||(a.itemInventario=novo.trim(),a.quantidadeUso||(a.quantidadeUso="1")),persistirSemRender(),renderizarArmados())}function valorArmado(a,campo,padrao="—"){return(a&&void 0!==a[campo]?String(a[campo]).trim():"")||padrao}function ataqueAberto(i){return estado.ataquesAbertos=estado.ataquesAbertos||{},!!estado.ataquesAbertos[i]}function alternarAtaqueAberto(i){estado.ataquesAbertos=estado.ataquesAbertos||{},estado.ataquesAbertos[i]=!estado.ataquesAbertos[i],persistirSemRender(),renderizarArmados()}function renderizarArmados(){const box=document.getElementById("listaArmados");if(!box)return;const html=[];(estado.armados||[]).forEach((a,i)=>{const aberto=ataqueAberto(i),tipo=a.tipo||"armado",nome=valorArmado(a,"nome","Novo ataque"),acerto=valorArmado(a,"bonusAcerto",valorArmado(a,"bonus","—")),dano=valorArmado(a,"dano","—"),bonusDano=valorArmado(a,"bonusDano","—"),totalDano=formatarDanoTotal(a.dano,a.bonusDano),obs=valorArmado(a,"obs","Toque para editar observações");html.push(`\n      <div class="armadoCardCompacto ataqueListaCard ${aberto?"ataqueAberto":""}">\n        <button class="ataqueLinhaResumo" onclick="alternarAtaqueAberto(${i})">\n          <span class="ataqueLinhaIcone" onclick="event.stopPropagation(); escolherTipoAtaquePrompt(${i})">${iconeTipoAtaque(tipo)}</span>\n\n          <span class="ataqueLinhaTexto">\n            <strong>${nome}</strong>\n            <small>${labelTipoAtaque(tipo)} • Dano total: ${totalDano}</small>\n          </span>\n\n          <span class="ataqueLinhaSeta">${aberto?"▲":"▼"}</span>\n        </button>\n\n        <div class="ataqueDetalhesCompactos">\n          <div class="armadoTopo">\n            <button class="armadoIcone" onclick="escolherTipoAtaquePrompt(${i})">${iconeTipoAtaque(tipo)}</button>\n\n            <div class="armadoNome" onclick="editarCampoArmadoPrompt(${i},'nome','Nome do ataque')">\n              <h3>${nome}</h3>\n              <span onclick="event.stopPropagation(); escolherTipoAtaquePrompt(${i})">${labelTipoAtaque(tipo)}</span>\n            </div>\n          </div>\n\n          <div class="armadoResumoEditavel">\n            <button onclick="editarCampoArmadoPrompt(${i},'bonusAcerto','Bônus de acerto')"><b>Acerto</b>${acerto}</button>\n            <button onclick="editarCampoArmadoPrompt(${i},'dano','Dano')"><b>Dano</b>${dano}</button>\n            <button class="danoTotalBox" onclick="editarCampoArmadoPrompt(${i},'bonusDano','Bônus de dano')"><b>Dano total</b>${totalDano}</button>\n            <button onclick="editarCampoArmadoPrompt(${i},'bonusDano','Bônus de dano')"><b>Bônus dano</b>${bonusDano}</button>\n            <button class="armadoResumoFull" onclick="editarCampoArmadoPrompt(${i},'obs','Outros bônus / observações')"><b>Observações</b>${obs}</button>\n            <button onclick="vincularItemAtaque(${i})"><b>Item usado</b><span class="ataqueItemUsado">${iconeInventario(valorArmado(a,"itemInventario",""))} ${valorArmado(a,"itemInventario","Nenhum")}</span></button>\n            <button onclick="editarQtdUsoAtaque(${i})"><b>Qtd. por uso</b>${valorArmado(a,"quantidadeUso","1")}</button>\n          </div>\n\n          <div class="armadoAcoesCompactas ataqueAcoesUso">\n            <button class="btn btnUsarAtaqueInventario" onclick="usarAtaqueInventario(${i})">Usar ataque</button>\n            <button class="btn perigo" onclick="removerArmado(${i})">Remover</button>\n          </div>\n        </div>\n      </div>\n    `)}),box.innerHTML=html.join("")}function numeroSeguro(valor){const n=Number(valor);return Number.isFinite(n)?n:0}function limitarPorcentagem(valor){return Math.max(0,Math.min(100,valor))}function lerXP(valor){const XP_MAX_PADRAO=355000,bruto=String(valor??"").trim(),lerInteiroXP=v=>{const limpo=String(v??"").replace(/\s/g,"").replace(/[.,](?=\d{3}(?:\D|$))/g,"").replace(/[^0-9-]/g,"");return Math.max(0,numeroSeguro(limpo))};if(bruto.includes("/")){const partes=bruto.split("/");const atual=lerInteiroXP(partes[0]),maximo=Math.max(1,lerInteiroXP(partes[1])||XP_MAX_PADRAO);return{atual,maximo,texto:atual+"/"+maximo}}const atual=lerInteiroXP(bruto);return{atual,maximo:XP_MAX_PADRAO,texto:atual+"/"+XP_MAX_PADRAO}}function atualizarHUD(){const pv=document.getElementById("pv")?.value||0,pvMax=document.getElementById("pvMax")?.value||0,chakra=document.getElementById("chakra")?.value||0,chakraMax=document.getElementById("chakraMax")?.value||0,xp=lerXP(document.querySelector('[data-save="xp"]')?.value||"0/355000");definirLargura("perfilPvBarra",pv,pvMax),definirLargura("perfilChakraBarra",chakra,chakraMax),definirLargura("perfilXpBarra",xp.atual,xp.maximo);const pvTxt=document.getElementById("perfilPvView"),chTxt=document.getElementById("perfilChakraView"),xpTxt=document.getElementById("perfilXpView");pvTxt&&(pvTxt.textContent=pv+"/"+(pvMax||0)),chTxt&&(chTxt.textContent=chakra+"/"+(chakraMax||0)),xpTxt&&(xpTxt.textContent=xp.texto)}window.addEventListener("pagehide",()=>{timerSalvar&&salvar()});const NATUREZAS=[{id:"katon",icone:"🔥",nome:"KATON",classe:"katon"},{id:"raiton",icone:"⚡",nome:"RAITON",classe:"raiton"},{id:"fuuton",icone:"🌪️",nome:"FUUTON",classe:"fuuton"},{id:"suiton",icone:"💧",nome:"SUITON",classe:"suiton"},{id:"doton",icone:"🪨",nome:"DOTON",classe:"doton"},{id:"yin",icone:"🌑",nome:"YINTON",classe:"yin"},{id:"yang",icone:"☀️",nome:"YOUTON",classe:"yang"}];function renderizarNaturezas(){const box=document.getElementById("naturezasUI");if(!box)return;const html=[];NATUREZAS.forEach(n=>{const valor=Math.max(0,Math.min(6,numeroSeguro(estado[n.id]||0))),bolinhas=Array.from({length:6},(_,i)=>{const nivel=i+1,ativa=nivel<=valor?"ativa":"";return`\n        <button type="button" class="naturezaNivel" onclick="definirNatureza('${n.id}',${nivel})" aria-label="${n.nome} nível ${nivel}">\n          <span class="naturezaBolinha ${ativa}"></span>\n          <small>${nivel}</small>\n        </button>\n      `}).join("");html.push(`\n      <div class="naturezaCard ${n.classe}">\n        <div class="naturezaInfo">\n          <span class="naturezaIcone">${n.icone}</span>\n          <div>\n            <div class="naturezaNome">${n.nome}</div>\n            <span class="naturezaNivelTexto">${valor}/6</span>\n          </div>\n        </div>\n        <div class="naturezaLinha">${bolinhas}</div>\n      </div>\n    `)}),box.innerHTML=html.join("")}function definirNatureza(id,nivel){const atual=numeroSeguro(estado[id]||0);estado[id]=atual===nivel?0:nivel,persistirEstadoLocal(),renderizarNaturezas()}function textoCampo(chave,padrao){const valor=estado[chave];return void 0!==valor&&""!==String(valor).trim()?String(valor).trim():padrao}function definirLargura(id,atual,maximo){const el=document.getElementById(id);if(!el)return;const a=numeroSeguro(atual),m=Math.max(1,numeroSeguro(maximo));el.style.width=limitarPorcentagem(a/m*100)+"%"}function corNatureza(classe){return{katon:"#ff4b26",raiton:"#ffd02a",fuuton:"#53e25a",suiton:"#2aa8ff",doton:"#b8793a",yin:"#a965ff",yang:"#ffe06a"}[classe]||"#ffb15a"}function atualizarPerfil(){const cla=textoCampo("cla","Clã indefinido"),vila=textoCampo("vila","Vila indefinida"),rank=textoCampo("rank","Rank"),nivel=textoCampo("nivel","1"),setText=(id,txt)=>{const el=document.getElementById(id);el&&(el.textContent=txt)};setText("perfilResumoView",cla+" • "+vila),setText("perfilRankView",rank),setText("perfilNivelView","Nível "+nivel);const pv=document.getElementById("pv")?.value||0,pvMax=document.getElementById("pvMax")?.value||0,chakra=document.getElementById("chakra")?.value||0,chakraMax=document.getElementById("chakraMax")?.value||0,xp=lerXP(document.querySelector('[data-save="xp"]')?.value||"0/355000");setText("perfilPvView",pv+"/"+(pvMax||0)),setText("perfilChakraView",chakra+"/"+(chakraMax||0)),setText("perfilXpView",xp.texto),definirLargura("perfilPvBarra",pv,pvMax),definirLargura("perfilChakraBarra",chakra,chakraMax),definirLargura("perfilXpBarra",xp.atual,xp.maximo);const box=document.getElementById("perfilElementosView");if(box){const ativos=NATUREZAS.map(n=>({...n,valor:numeroSeguro(estado[n.id]||0)})).filter(n=>n.valor>0).sort((a,b)=>b.valor-a.valor).slice(0,4);ativos.length?box.innerHTML=ativos.map(n=>`\n        <span class="elementoPill" style="color:${corNatureza(n.classe)}">\n          ${n.icone} ${n.nome} ${n.valor}/6\n        </span>\n      `).join(""):box.innerHTML='<span class="elementoPill" style="color:#ffb15a">✨ Nenhum elemento selecionado</span>'}}function abrirUploadAvatar(){const input=document.getElementById("avatarUpload");input&&input.click()}function carregarAvatar(event){const arquivo=event.target.files&&event.target.files[0];if(!arquivo)return;if(!arquivo.type.startsWith("image/"))return void alert("Escolha uma imagem válida.");const leitor=new FileReader;leitor.onload=function(e){const imagem=e.target.result;estado.avatarNinja=imagem,persistirEstadoLocal(),aplicarAvatar(imagem)},leitor.readAsDataURL(arquivo)}function aplicarAvatar(imagem){const preview=document.getElementById("avatarPreview"),emoji=document.getElementById("avatarEmoji");preview&&emoji&&(imagem?(preview.src=imagem,preview.style.display="block",emoji.style.display="none"):(preview.removeAttribute("src"),preview.style.display="none",emoji.style.display="block"))}function carregarAvatarSalvo(){aplicarAvatar(estado.avatarNinja||"")}function abrirUploadFundoPerfil(){const menu=document.getElementById("avatarMenu"),input=document.createElement("input");input.type="file",input.accept="image/*",input.onchange=function(event){carregarFundoPerfil(event),setTimeout(()=>input.remove(),300)},document.body.appendChild(input),input.click(),setTimeout(()=>{menu&&menu.classList.remove("aberto")},250)}function compactarImagemParaFundo(arquivo,callback){const leitor=new FileReader;leitor.onload=function(e){const img=new Image;img.onload=function(){let largura=img.width,altura=img.height;largura>altura&&largura>1200?(altura=Math.round(1200*altura/largura),largura=1200):altura>=largura&&altura>1200&&(largura=Math.round(1200*largura/altura),altura=1200);try{const canvas=document.createElement("canvas");canvas.width=largura,canvas.height=altura;canvas.getContext("2d").drawImage(img,0,0,largura,altura);const imagemCompactada=canvas.toDataURL("image/jpeg",.78);callback(imagemCompactada)}catch(erro){callback(e.target.result)}},img.onerror=function(){callback(e.target.result)},img.src=e.target.result},leitor.readAsDataURL(arquivo)}function carregarFundoPerfil(event){const arquivo=event.target.files&&event.target.files[0];arquivo&&(arquivo.type&&arquivo.type.startsWith("image/")?compactarImagemParaFundo(arquivo,function(imagem){try{estado.perfilFundoImagem=imagem,persistirEstadoLocal(),aplicarFundoPerfil(imagem);const menu=document.getElementById("avatarMenu");menu&&menu.classList.remove("aberto")}catch(erro){alert("Não consegui salvar essa imagem. Tente uma imagem menor ou mais leve.")}}):alert("Escolha uma imagem válida."))}function aplicarFundoPerfil(imagem){const fundo=document.getElementById("perfilFundoImagem");fundo&&(imagem?(fundo.style.backgroundImage='url("'+imagem+'")',fundo.style.backgroundSize="cover",fundo.style.backgroundPosition="center",fundo.style.backgroundRepeat="no-repeat",fundo.classList.add("ativo")):(fundo.style.backgroundImage="none",fundo.classList.remove("ativo")))}function removerFundoPerfil(){delete estado.perfilFundoImagem;try{persistirEstadoLocal()}catch(erro){}aplicarFundoPerfil("");const menu=document.getElementById("avatarMenu");menu&&menu.classList.remove("aberto");const input=document.getElementById("perfilFundoUpload");input&&(input.value="")}function carregarFundoPerfilSalvo(){aplicarFundoPerfil(estado.perfilFundoImagem||"")}function formatarModificador(valor){const n=calcularModificador(valor);return n>=0?"+"+n:String(n)}function atualizarModificadoresBatalha(){[["forca","modForca"],["destreza","modDestreza"],["constituicao","modConstituicao"],["inteligencia","modInteligencia"],["sabedoria","modSabedoria"],["carisma","modCarisma"]].forEach(([campo,id])=>{const el=document.getElementById(id),input=document.querySelector(`[data-save="${campo}"]`);el&&(el.textContent=formatarModificador(input?.value||0))});const ca=document.querySelector('[data-save="ca"]')?.value||10,cd=document.querySelector('[data-save="cd"]')?.value||10,caView=document.getElementById("batalhaCaView"),cdView=document.getElementById("batalhaCdView");"function"==typeof atualizarDefesasTotaisBatalha?atualizarDefesasTotaisBatalha():(caView&&(caView.textContent=ca),cdView&&(cdView.textContent=cd))}function salvarListaFichas(){fichas=[...new Set((fichas||["Principal"]).map(limparNomeFicha))],fichas.includes("Principal")||fichas.unshift("Principal"),localStorage.setItem(CHAVE_LISTA,JSON.stringify(fichas))}function atualizarListaFichas(){const seletor=document.getElementById("seletorFicha");seletor&&(seletor.innerHTML="",fichas.forEach(nome=>{const opcao=document.createElement("option");opcao.value=nome,opcao.textContent=nome,nome===fichaAtual&&(opcao.selected=!0),seletor.appendChild(opcao)}))}function novaFicha(){salvar();let nome=prompt("Nome da nova ficha:");nome&&(nome=limparNomeFicha(nome),fichas.includes(nome)?alert("Já existe uma ficha com esse nome."):(fichas.push(nome),salvarListaFichas(),localStorage.setItem(chaveFicha(nome),JSON.stringify({})),fichaAtual=nome,CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),location.reload()))}function duplicarFicha(){salvar();let nome=prompt("Nome da cópia da ficha:");if(!nome)return;if(nome=limparNomeFicha(nome),fichas.includes(nome))return void alert("Já existe uma ficha com esse nome.");const copia=JSON.parse(JSON.stringify(estado||{}));localStorage.setItem(chaveFicha(nome),JSON.stringify(copia)),fichas=[...new Set([...fichas,nome])],salvarListaFichas(),fichaAtual=nome,CHAVE=chaveFicha(nome),localStorage.setItem(CHAVE_ATIVA,fichaAtual),estado=copia,atualizarListaFichas(),alert("Ficha duplicada com sucesso!"),setTimeout(()=>location.reload(),120)}function trocarFicha(nome){salvar(),fichaAtual=limparNomeFicha(nome),CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),location.reload()}function renomearFicha(){if(salvar(),"Principal"===fichaAtual)return void alert("A ficha Principal não pode ser renomeada. Para mudar o nome dela, use duplicar ficha e crie uma cópia com o novo nome.");let novoNome=prompt("Novo nome da ficha:",fichaAtual);if(!novoNome)return;if(novoNome=limparNomeFicha(novoNome),novoNome===fichaAtual)return;if(fichas.includes(novoNome))return void alert("Já existe uma ficha com esse nome.");const chaveAntiga=chaveFicha(fichaAtual),chaveNova=chaveFicha(novoNome),dados=localStorage.getItem(chaveAntiga)||JSON.stringify(estado||{});localStorage.setItem(chaveNova,dados),localStorage.removeItem(chaveAntiga),fichas=fichas.map(nome=>nome===fichaAtual?novoNome:nome),fichaAtual=novoNome,CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),salvarListaFichas(),alert("Ficha renomeada com sucesso!"),location.reload()}function excluirFicha(){if(salvar(),"Principal"===fichaAtual)return void alert("A ficha Principal não pode ser excluída.");if((fichas||[]).length<=1)return void alert("Você precisa manter pelo menos uma ficha.");prompt("Para excluir esta ficha, digite exatamente: "+fichaAtual)===fichaAtual?(localStorage.removeItem(chaveFicha(fichaAtual)),fichas=fichas.filter(nome=>nome!==fichaAtual),fichas.includes("Principal")||fichas.unshift("Principal"),fichaAtual="Principal",CHAVE=chaveFicha(),localStorage.setItem(CHAVE_ATIVA,fichaAtual),salvarListaFichas(),alert("Ficha excluída."),location.reload()):alert("Exclusão cancelada.")}function exportarFicha(){salvar();const dados={app:"Ficha Ninja RPG",versao:"backup-1",criadoEm:(new Date).toISOString(),chave:CHAVE,estado:estado},nomeNinja=(estado.nome||"ninja").toString().trim().replace(/[^\w\-]+/g,"_")||"ninja",arquivo=new Blob([JSON.stringify(dados,null,2)],{type:"application/json"}),url=URL.createObjectURL(arquivo),link=document.createElement("a");link.href=url,link.download="ficha_"+nomeNinja+".json",document.body.appendChild(link),link.click(),link.remove(),URL.revokeObjectURL(url)}function abrirImportarFicha(){const input=document.getElementById("importarFichaInput");input&&input.click()}function importarFicha(event){const arquivo=event.target.files&&event.target.files[0];if(!arquivo)return;const leitor=new FileReader;leitor.onload=function(e){try{const dados=JSON.parse(e.target.result),novoEstado=dados.estado||dados;if(!novoEstado||"object"!=typeof novoEstado||Array.isArray(novoEstado))return void alert("Arquivo inválido. Escolha um backup da ficha.");if(!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?"))return;estado=novoEstado,persistirEstadoLocal(),alert("Ficha importada com sucesso!"),location.reload()}catch(erro){alert("Não foi possível importar. O arquivo precisa estar em formato JSON válido.")}finally{event.target.value=""}},leitor.readAsText(arquivo)}function toggleConfigMenu(){const menu=document.getElementById("configMenu");menu&&menu.classList.toggle("aberto")}function toggleAvatarMenu(){const menu=document.getElementById("avatarMenu");menu&&menu.classList.toggle("aberto")}function calcularModificador(valor){return valor=parseInt(valor||0),Math.floor((valor-10)/2)}function atualizarCAAutomatica(){const campoDestreza=document.getElementById("atributoDestreza")||document.querySelector('[data-save="destreza"]'),campoProficiencia=document.getElementById("bonusProficiencia")||document.querySelector('[data-save="proficiencia"]'),campoBonusCA=document.getElementById("bonusCA")||document.querySelector('[data-save="bonusCA"]'),campoCA=document.getElementById("campoCA")||document.querySelector('[data-save="ca"]');if(!campoCA)return;const destreza=parseInt(campoDestreza?.value||0),proficiencia=parseInt(campoProficiencia?.value||0),bonusCA=parseInt(campoBonusCA?.value||0),ca=10+calcularModificador(destreza)+proficiencia+bonusCA;campoCA.value=ca,estado.ca=String(ca),persistirEstadoLocal(),"function"==typeof atualizarDefesasTotaisBatalha&&atualizarDefesasTotaisBatalha()}function garantirKekkeiArray(){estado.kekkeiGenkai&&Array.isArray(estado.kekkeiGenkai)||(estado.kekkeiGenkai=[])}function salvarKekkeiGenkai(){garantirKekkeiArray(),persistirEstadoLocal()}function adicionarKekkeiGenkai(){garantirKekkeiArray();const nome=prompt("Nome da Kekkei Genkai:");nome&&nome.trim()&&(estado.kekkeiGenkai.push({nome:nome.trim(),nivel:0}),salvarKekkeiGenkai(),renderizarKekkeiGenkai())}function removerKekkeiGenkai(i){garantirKekkeiArray(),confirm("Remover esta Kekkei Genkai?")&&(estado.kekkeiGenkai.splice(i,1),salvarKekkeiGenkai(),renderizarKekkeiGenkai())}function definirNivelKekkei(i,nivel){if(garantirKekkeiArray(),!estado.kekkeiGenkai[i])return;const nivelAtual=Number(estado.kekkeiGenkai[i].nivel||0);estado.kekkeiGenkai[i].nivel=nivelAtual===nivel?nivel-1:nivel,salvarKekkeiGenkai(),renderizarKekkeiGenkai()}function editarNomeKekkei(i){garantirKekkeiArray();const atual=estado.kekkeiGenkai[i]?.nome||"",novo=prompt("Nome da Kekkei Genkai:",atual);null!==novo&&novo.trim()&&(estado.kekkeiGenkai[i].nome=novo.trim(),salvarKekkeiGenkai(),renderizarKekkeiGenkai())}function renderizarKekkeiGenkai(){garantirKekkeiArray();const lista=document.getElementById("kekkeiLista");if(!lista)return;const html=[];estado.kekkeiGenkai.forEach((k,i)=>{const nome=String(k.nome||"Kekkei Genkai").trim(),nivel=Number(k.nivel||0);let bolinhas="";for(let n=1;n<=6;n++)bolinhas+=`\n        <button type="button" class="kekkeiNivel ${n<=nivel?"ativo":""}" onclick="definirNivelKekkei(${i},${n})" aria-label="Nível ${n}"></button>\n      `;html.push(`\n      <div class="kekkeiNaturezaCard">\n        <div class="kekkeiInfo" onclick="editarNomeKekkei(${i})">\n          <span class="kekkeiIcone">🧬</span>\n          <div class="kekkeiTexto">\n            <div class="kekkeiNome">${nome}</div>\n            <div class="kekkeiNivelTexto">${nivel}/6</div>\n          </div>\n        </div>\n\n        <div class="kekkeiNiveis">\n          ${bolinhas}\n        </div>\n\n        <button type="button" class="removerKekkeiBtn" onclick="removerKekkeiGenkai(${i})">×</button>\n      </div>\n    `)}),lista.innerHTML=html.join("")}document.addEventListener("click",function(e){const config=document.querySelector(".configGlobal"),avatar=document.querySelector(".avatarAreaNovo");if(config&&!config.contains(e.target)){const menu=document.getElementById("configMenu");menu&&menu.classList.remove("aberto")}if(avatar&&!avatar.contains(e.target)){const menu=document.getElementById("avatarMenu");menu&&menu.classList.remove("aberto")}}),carregar(),atualizarListaFichas(),document.addEventListener("input",function(e){e.target&&["destreza","proficiencia","bonusCA"].includes(e.target.dataset.save)&&atualizarCAAutomatica()}),document.addEventListener("change",function(e){e.target&&["destreza","proficiencia","bonusCA"].includes(e.target.dataset.save)&&atualizarCAAutomatica()}),document.addEventListener("DOMContentLoaded",function(){setTimeout(atualizarCAAutomatica,200)}),window.addEventListener("pageshow",function(){try{const salvo=JSON.parse(localStorage.getItem(CHAVE)||"{}");salvo&&"object"==typeof salvo&&(estado=salvo)}catch(e){}renderizarKekkeiGenkai()});function garantirInventarioItens(){estado.inventarioItens&&Array.isArray(estado.inventarioItens)||(estado.inventarioItens=[])}function salvarInventarioItens(){garantirInventarioItens(),persistirEstadoLocal()}function adicionarItemInventario(){garantirInventarioItens();const nome=prompt("Nome do item:");if(!nome||!nome.trim())return;let quantidade=prompt("Quantidade:","1");quantidade=parseInt(quantidade||"1"),(isNaN(quantidade)||quantidade<0)&&(quantidade=1),estado.inventarioItens.push({nome:nome.trim(),quantidade:quantidade}),salvarInventarioItens(),renderizarInventario()}function editarNomeItemInventario(i){garantirInventarioItens();const atual=estado.inventarioItens[i]?.nome||"",novo=prompt("Nome do item:",atual);null!==novo&&novo.trim()&&(estado.inventarioItens[i].nome=novo.trim(),salvarInventarioItens(),renderizarInventario())}function alterarQtdItemInventario(i,valor){if(garantirInventarioItens(),!estado.inventarioItens[i])return;let qtd=parseInt(valor||0);(isNaN(qtd)||qtd<0)&&(qtd=0),estado.inventarioItens[i].quantidade=qtd,salvarInventarioItens()}function removerItemInventario(i){garantirInventarioItens(),confirm("Remover este item do inventário?")&&(estado.inventarioItens.splice(i,1),salvarInventarioItens(),renderizarInventario())}function renderizarInventario(){garantirInventarioItens();const lista=document.getElementById("listaInventario");if(!lista)return;lista.innerHTML="";const html=[];0!==estado.inventarioItens.length?(estado.inventarioItens.forEach((item,i)=>{const nome=String(item.nome||"Item").replace(/</g,"&lt;").replace(/>/g,"&gt;"),qtd=Number(item.quantidade||0);html.push(`\n      <div class="itemInventario">\n        <div class="itemInventarioNome" onclick="editarNomeItemInventario(${i})"><span class="itemInventarioIcone">${iconeInventario(nome)}</span><span>${nome}</span></div>\n        <input class="itemInventarioQtd" type="number" value="${qtd}" min="0" inputmode="numeric" onchange="alterarQtdItemInventario(${i}, this.value)" oninput="alterarQtdItemInventario(${i}, this.value)">\n        <button type="button" class="btnRemoverItemInventario" onclick="removerItemInventario(${i})">×</button>\n      </div>\n    `)}),lista.innerHTML=html.join("")):lista.innerHTML='\n      <div class="itemInventario">\n        <div class="itemInventarioNome" style="opacity:.65; cursor:default;">Nenhum item adicionado</div>\n        <input class="itemInventarioQtd" type="number" value="0" disabled>\n        <button type="button" class="btnRemoverItemInventario" disabled>×</button>\n      </div>\n    '}function iconeInventario(nome){const n=normalizarTextoInventario?normalizarTextoInventario(nome):String(nome||"").toLowerCase();return n?n.includes("shuriken")?"✴️":n.includes("kunai")?"🔪":n.includes("agulha")||n.includes("agulhas")||n.includes("senbon")?"🪡":n.includes("fio")||n.includes("fios")||n.includes("linha")||n.includes("arame")?"🧵":n.includes("comida")||n.includes("alimento")||n.includes("lanche")||n.includes("racao")||n.includes("ração")?"🍙":n.includes("pergaminho")||n.includes("scroll")?"📜":n.includes("bomba")||n.includes("explosivo")?"💣":n.includes("selo")||n.includes("papel bomba")||n.includes("tarja")?"🏷️":n.includes("pocao")||n.includes("poção")||n.includes("remedio")||n.includes("remédio")?"🧪":n.includes("bandagem")||n.includes("curativo")?"🩹":n.includes("espada")||n.includes("katana")?"🗡️":n.includes("mascara")||n.includes("máscara")?"🎭":n.includes("dinheiro")||n.includes("ryo")||n.includes("ryou")?"💰":"🎒":"🎒"}function normalizarTextoInventario(txt){return String(txt||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function buscarItemInventarioPorNome(nome){garantirInventarioItens();const alvo=normalizarTextoInventario(nome);return alvo?estado.inventarioItens.findIndex(item=>normalizarTextoInventario(item.nome)===alvo):-1}function vincularItemAtaque(i){estado.armados=estado.armados||[],garantirInventarioItens();const ataque=estado.armados[i];if(!ataque)return;let sugestao=ataque.itemInventario||ataque.nome||"";if(estado.inventarioItens.length){const lista=estado.inventarioItens.map(item=>item.nome).join(", "),escolhido=prompt("Qual item do inventário esse ataque usa?\\n\\nItens disponíveis: "+lista,sugestao);if(null===escolhido)return;ataque.itemInventario=escolhido.trim()}else{const escolhido=prompt("Qual item do inventário esse ataque usa?",sugestao);if(null===escolhido)return;ataque.itemInventario=escolhido.trim()}!ataque.itemInventario&&ataque.nome&&(ataque.itemInventario=ataque.nome),ataque.quantidadeUso||(ataque.quantidadeUso="1"),persistirSemRender(),renderizarArmados()}function editarQtdUsoAtaque(i){estado.armados=estado.armados||[];const ataque=estado.armados[i];if(!ataque)return;let atual=ataque.quantidadeUso||"1",nova=prompt("Quantos itens esse ataque consome por uso?",atual);null!==nova&&(nova=parseInt(nova||"1"),(isNaN(nova)||nova<1)&&(nova=1),ataque.quantidadeUso=String(nova),persistirSemRender(),renderizarArmados())}async function usarAtaqueInventario(i){
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
}window.addEventListener("pageshow",function(){try{const salvo=JSON.parse(localStorage.getItem(CHAVE)||"{}");salvo&&"object"==typeof salvo&&(estado=salvo)}catch(e){}renderizarInventario()});const bonusBatalhaAtributos={forca:0,destreza:0,constituicao:0,inteligencia:0,sabedoria:0,carisma:0};function lerBonusAtributosBatalha(){document.querySelectorAll("[data-bonus-batalha]").forEach(input=>{const chave=input.getAttribute("data-bonus-batalha");bonusBatalhaAtributos[chave]=Number(input.value||0)})}function valorAtributoComBonusBatalha(chave){return Number(document.querySelector(`[data-save="${chave}"]`)?.value||0)+Number(bonusBatalhaAtributos[chave]||0)}function modificadorComBonusBatalha(chave){return Math.floor((valorAtributoComBonusBatalha(chave)-10)/2)}function formatarModBatalha(v){return v>=0?"+"+v:String(v)}function atualizarModsBatalhaComBonus(){lerBonusAtributosBatalha(),[["forca","modForca"],["destreza","modDestreza"],["constituicao","modConstituicao"],["inteligencia","modInteligencia"],["sabedoria","modSabedoria"],["carisma","modCarisma"]].forEach(([chave,id])=>{const el=document.getElementById(id);if(!el)return;const mod=modificadorComBonusBatalha(chave),bonus=Number(bonusBatalhaAtributos[chave]||0);el.innerHTML=formatarModBatalha(mod)+(bonus?`<span class="bonusAplicadoTexto">+${bonus} atr.</span>`:"")})}async function limparBonusAtributosBatalha(){
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
/* ===== NOTAS: editor interno compatível com o app instalado ===== */
function garantirTopicosNotas(){
  if(
    estado.notasTopicos &&
    Array.isArray(estado.notasTopicos)
  ){
    return;
  }

  estado.notasTopicos = [];

  if(estado.notas && String(estado.notas).trim()){
    estado.notasTopicos.push({
      titulo: "Anotações da campanha",
      texto: String(estado.notas || ""),
      aberto: true
    });
  }
}

function salvarTopicosNotas(){
  garantirTopicosNotas();

  if(typeof persistirEstadoLocal === "function"){
    persistirEstadoLocal();
    return;
  }

  if(typeof persistirSemRender === "function"){
    persistirSemRender();
  }
}

function escaparHtmlNotas(txt){
  return String(txt || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function garantirEstilosEditorNotas(){
  if(document.getElementById("editorTopicoNotaStyles")){
    return;
  }

  const estilo = document.createElement("style");
  estilo.id = "editorTopicoNotaStyles";
  estilo.textContent = `
    .editorTopicoNotaBox{
      width:min(94vw,520px);
      max-height:min(90vh,720px);
      overflow:auto;
    }

    .editorTopicoNotaCampo{
      display:grid;
      gap:7px;
      margin:0 0 14px;
    }

    .editorTopicoNotaCampo label{
      color:#ffd08a;
      font-weight:900;
      font-size:13px;
      letter-spacing:.25px;
    }

    .editorTopicoNotaCampo input,
    .editorTopicoNotaCampo textarea{
      width:100%;
      box-sizing:border-box;
      border:1px solid rgba(255,177,90,.32);
      background:rgba(5,7,10,.78);
      color:#fff4dc;
      font:inherit;
      padding:11px 12px;
      outline:none;
    }

    .editorTopicoNotaCampo input:focus,
    .editorTopicoNotaCampo textarea:focus{
      border-color:rgba(255,208,138,.82);
      box-shadow:0 0 0 2px rgba(255,177,90,.12);
    }

    .editorTopicoNotaCampo textarea{
      min-height:150px;
      max-height:42vh;
      resize:vertical;
      line-height:1.45;
    }

    .editorTopicoNotaAjuda{
      margin:-5px 0 14px;
      color:#cdbfa8;
      font-size:12px;
      line-height:1.35;
    }
  `;

  document.head.appendChild(estilo);
}

function abrirEditorTopicoNota(opcoes = {}){
  garantirEstilosEditorNotas();

  const modalAnterior = document.querySelector(
    ".editorTopicoNotaOverlay"
  );

  if(modalAnterior){
    modalAnterior.remove();
  }

  return new Promise(resolve=>{
    const overlay = document.createElement("div");
    overlay.className =
      "modalShinobiOverlay editorTopicoNotaOverlay";

    const tituloModal =
      opcoes.modo === "editar"
        ? "Editar tópico"
        : "Novo tópico";

    const textoBotao =
      opcoes.modo === "editar"
        ? "Salvar"
        : "Criar tópico";

    const tituloInicial = escaparHtmlNotas(
      opcoes.titulo || "Novo tópico"
    );

    const textoInicial = escaparHtmlNotas(
      opcoes.texto || ""
    );

    overlay.innerHTML = `
      <form class="modalShinobiBox editorTopicoNotaBox">
        <h3 class="modalShinobiTitulo">
          ${tituloModal}
        </h3>

        <div class="editorTopicoNotaCampo">
          <label for="editorTopicoNotaTitulo">
            Tema do tópico
          </label>

          <input
            id="editorTopicoNotaTitulo"
            type="text"
            maxlength="120"
            value="${tituloInicial}"
            autocomplete="off"
          >
        </div>

        <div class="editorTopicoNotaCampo">
          <label for="editorTopicoNotaTexto">
            Anotações
          </label>

          <textarea
            id="editorTopicoNotaTexto"
            placeholder="Escreva as informações deste tópico..."
          >${textoInicial}</textarea>
        </div>

        <p class="editorTopicoNotaAjuda">
          Você também poderá continuar escrevendo diretamente
          no tópico depois de criá-lo.
        </p>

        <div class="modalShinobiAcoes">
          <button
            type="button"
            class="modalShinobiBtn cancelar"
            data-acao="cancelar"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="modalShinobiBtn confirmar"
          >
            ${textoBotao}
          </button>
        </div>
      </form>
    `;

    const formulario = overlay.querySelector("form");
    const campoTitulo = overlay.querySelector(
      "#editorTopicoNotaTitulo"
    );

    const campoTexto = overlay.querySelector(
      "#editorTopicoNotaTexto"
    );

    let finalizado = false;

    function finalizar(resultado){
      if(finalizado) return;
      finalizado = true;

      document.removeEventListener(
        "keydown",
        tratarTeclado
      );

      overlay.remove();
      resolve(resultado);
    }

    function tratarTeclado(evento){
      if(evento.key === "Escape"){
        evento.preventDefault();
        finalizar(null);
      }
    }

    overlay.addEventListener("click", evento=>{
      if(evento.target === overlay){
        finalizar(null);
      }
    });

    overlay
      .querySelector('[data-acao="cancelar"]')
      .addEventListener("click", ()=>{
        finalizar(null);
      });

    formulario.addEventListener("submit", evento=>{
      evento.preventDefault();

      finalizar({
        titulo:
          String(campoTitulo.value || "").trim() ||
          "Novo tópico",

        texto: String(campoTexto.value || "")
      });
    });

    document.addEventListener(
      "keydown",
      tratarTeclado
    );

    document.body.appendChild(overlay);

    requestAnimationFrame(()=>{
      campoTitulo.focus();
      campoTitulo.select();
    });
  });
}

async function adicionarTopicoNota(){
  garantirTopicosNotas();

  const dados = await abrirEditorTopicoNota({
    modo: "adicionar",
    titulo: "Novo tópico",
    texto: ""
  });

  if(!dados) return;

  estado.notasTopicos.push({
    titulo: dados.titulo,
    texto: dados.texto,
    aberto: true
  });

  salvarTopicosNotas();
  renderizarTopicosNotas();
}

function alternarTopicoNota(i){
  garantirTopicosNotas();

  if(!estado.notasTopicos[i]){
    return;
  }

  estado.notasTopicos[i].aberto =
    !estado.notasTopicos[i].aberto;

  salvarTopicosNotas();
  renderizarTopicosNotas();
}

async function editarTituloTopicoNota(i, ev){
  if(ev){
    ev.stopPropagation();
  }

  garantirTopicosNotas();

  const topico = estado.notasTopicos[i];
  if(!topico) return;

  const dados = await abrirEditorTopicoNota({
    modo: "editar",
    titulo: topico.titulo || "Novo tópico",
    texto: topico.texto || ""
  });

  if(!dados) return;

  topico.titulo = dados.titulo;
  topico.texto = dados.texto;

  salvarTopicosNotas();
  renderizarTopicosNotas();
}

async function removerTopicoNota(i, ev){
  if(ev){
    ev.stopPropagation();
  }

  garantirTopicosNotas();

  const topico = estado.notasTopicos[i];
  if(!topico) return;

  let confirmado = false;

  if(typeof modalShinobi === "function"){
    confirmado = await modalShinobi(
      "Remover tópico",
      `O tópico “${topico.titulo || "Novo tópico"}” será removido.`,
      {}
    );
  }else{
    confirmado = window.confirm(
      "Remover este tópico de notas?"
    );
  }

  if(!confirmado) return;

  estado.notasTopicos.splice(i, 1);
  salvarTopicosNotas();
  renderizarTopicosNotas();
}

function atualizarTextoTopicoNota(i, valor){
  garantirTopicosNotas();

  if(!estado.notasTopicos[i]){
    return;
  }

  estado.notasTopicos[i].texto = valor;
  salvarTopicosNotas();
}

function renderizarTopicosNotas(){
  garantirTopicosNotas();

  const lista = document.getElementById(
    "listaTopicosNotas"
  );

  if(!lista) return;

  if(!estado.notasTopicos.length){
    lista.innerHTML =
      '<div class="notaVazia">Nenhum tópico criado ainda.</div>';

    return;
  }

  lista.innerHTML = estado.notasTopicos
    .map((topico, i)=>{
      const aberto = topico.aberto
        ? "aberto"
        : "";

      const seta = topico.aberto
        ? "▼"
        : "▶";

      const titulo = escaparHtmlNotas(
        topico.titulo || "Novo tópico"
      );

      const texto = escaparHtmlNotas(
        topico.texto || ""
      );

      return `
        <div class="topicoNotaCard ${aberto}">
          <div
            class="topicoNotaHeader"
            onclick="alternarTopicoNota(${i})"
          >
            <span class="topicoNotaSeta">
              ${seta}
            </span>

            <span class="topicoNotaTitulo">
              ${titulo}
            </span>

            <button
              type="button"
              class="topicoNotaEditar"
              onclick="editarTituloTopicoNota(${i}, event)"
              aria-label="Editar tópico"
            >
              ✎
            </button>

            <button
              type="button"
              class="topicoNotaRemover"
              onclick="removerTopicoNota(${i}, event)"
              aria-label="Remover tópico"
            >
              ×
            </button>
          </div>

          <div class="topicoNotaConteudo">
            <textarea
              placeholder="Escreva as anotações deste tópico..."
              oninput="atualizarTextoTopicoNota(${i}, this.value)"
            >${texto}</textarea>
          </div>
        </div>
      `;
    })
    .join("");
}

/*
 * Os botões do HTML usam onclick.
 * A atribuição explícita evita diferenças de escopo
 * entre navegador, PWA e aplicativo instalado.
 */
window.adicionarTopicoNota = adicionarTopicoNota;
window.alternarTopicoNota = alternarTopicoNota;
window.editarTituloTopicoNota = editarTituloTopicoNota;
window.removerTopicoNota = removerTopicoNota;
window.atualizarTextoTopicoNota =
  atualizarTextoTopicoNota;
window.renderizarTopicosNotas =
  renderizarTopicosNotas;

document.addEventListener("input",function(e){e.target&&e.target.matches("[data-bonus-batalha]")&&atualizarModsBatalhaComBonus()}),document.addEventListener("DOMContentLoaded",function(){setTimeout(atualizarModsBatalhaComBonus,180)}),window.addEventListener("pageshow",function(){setTimeout(atualizarModsBatalhaComBonus,180)}),document.addEventListener("input",function(e){e.target&&(e.target.matches("[data-bonus-defesa-batalha]")||e.target.matches('[data-save="ca"]')||e.target.matches('[data-save="cd"]')||e.target.matches('[data-save="bonusCA"]')||e.target.matches('[data-save="destreza"]')||e.target.matches('[data-save="proficiencia"]'))&&setTimeout(atualizarDefesasTotaisBatalha,30)}),document.addEventListener("change",function(e){e.target&&(e.target.matches("[data-bonus-defesa-batalha]")||e.target.matches('[data-save="ca"]')||e.target.matches('[data-save="cd"]')||e.target.matches('[data-save="bonusCA"]')||e.target.matches('[data-save="destreza"]')||e.target.matches('[data-save="proficiencia"]'))&&setTimeout(atualizarDefesasTotaisBatalha,30)}),document.addEventListener("DOMContentLoaded",function(){setTimeout(atualizarDefesasTotaisBatalha,180)}),window.addEventListener("pageshow",function(){setTimeout(atualizarDefesasTotaisBatalha,180)}),document.addEventListener("DOMContentLoaded",function(){setTimeout(renderizarTopicosNotas,180)}),window.addEventListener("pageshow",function(){setTimeout(renderizarTopicosNotas,180)});let jutsuUploadIndiceAtual=null;function abrirUploadImagemJutsu(i){jutsuUploadIndiceAtual=i;const input=document.getElementById("jutsuUploadGlobalSeguro");input?(input.value="",input.click()):alert("Campo de imagem não encontrado. Recarregue o app e tente novamente.")}function removerImagemJutsu(i){const indice=Number(i);if(estado.jutsus&&estado.jutsus[indice]){estado.jutsus[indice].imagem="",estado.jutsusAbertos=estado.jutsusAbertos||{},estado.jutsusAbertos[indice]=!0;try{persistirEstadoLocal()}catch(err){}"function"==typeof renderizarJutsus&&renderizarJutsus()}}document.addEventListener("DOMContentLoaded",function(){const input=document.getElementById("jutsuUploadGlobalSeguro");input&&!input.dataset.configurado&&(input.dataset.configurado="1",input.addEventListener("change",function(ev){carregarImagemJutsu(ev,jutsuUploadIndiceAtual)}))}),window.addEventListener("pageshow",function(){const input=document.getElementById("jutsuUploadGlobalSeguro");input&&!input.dataset.configurado&&(input.dataset.configurado="1",input.addEventListener("change",function(ev){carregarImagemJutsu(ev,jutsuUploadIndiceAtual)}))});
