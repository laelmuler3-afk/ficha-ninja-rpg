/*
 * Ficha Ninja RPG — validação defensiva de backups locais.
 * Mantido em módulo separado para não ampliar o arquivo legado 01-core.js.
 */
(()=>{
  "use strict";

  const LIMITE_ARQUIVO_BYTES=8*1024*1024;
  const LIMITE_PROFUNDIDADE=24;
  const LIMITE_NOS=100000;
  const LIMITE_CHAVES_OBJETO=2000;
  const LIMITE_ITENS_ARRAY=10000;
  const LIMITE_TEXTO=500000;
  const CHAVES_PROIBIDAS=new Set(["__proto__","prototype","constructor"]);

  function validarArvore(valor,caminho="estado",profundidade=0,contador={total:0}){
    contador.total+=1;
    if(contador.total>LIMITE_NOS) throw new Error("O backup contém dados demais.");
    if(profundidade>LIMITE_PROFUNDIDADE) throw new Error(`Estrutura profunda demais em ${caminho}.`);

    if(valor===null || typeof valor==="boolean") return;
    if(typeof valor==="number"){
      if(!Number.isFinite(valor)) throw new Error(`Número inválido em ${caminho}.`);
      return;
    }
    if(typeof valor==="string"){
      if(valor.length>LIMITE_TEXTO) throw new Error(`Texto excessivamente grande em ${caminho}.`);
      return;
    }
    if(Array.isArray(valor)){
      if(valor.length>LIMITE_ITENS_ARRAY) throw new Error(`Lista excessivamente grande em ${caminho}.`);
      valor.forEach((item,indice)=>validarArvore(item,`${caminho}[${indice}]`,profundidade+1,contador));
      return;
    }
    if(typeof valor!=="object") throw new Error(`Tipo não permitido em ${caminho}.`);

    const chaves=Object.keys(valor);
    if(chaves.length>LIMITE_CHAVES_OBJETO) throw new Error(`Objeto excessivamente grande em ${caminho}.`);
    chaves.forEach(chave=>{
      if(CHAVES_PROIBIDAS.has(chave)) throw new Error(`Chave perigosa encontrada em ${caminho}.`);
      validarArvore(valor[chave],`${caminho}.${chave}`,profundidade+1,contador);
    });
  }

  function extrairEstadoBackup(dados){
    if(!dados || typeof dados!=="object" || Array.isArray(dados)){
      throw new Error("O conteúdo principal do backup precisa ser um objeto.");
    }
    const possuiEnvelope=Object.prototype.hasOwnProperty.call(dados,"estado");
    const novoEstado=possuiEnvelope?dados.estado:dados;
    if(!novoEstado || typeof novoEstado!=="object" || Array.isArray(novoEstado)){
      throw new Error("O backup não contém um estado de ficha válido.");
    }
    validarArvore(novoEstado);
    return novoEstado;
  }

  function clonarSeguro(valor){
    if(valor==null)return valor;
    if(typeof structuredClone==="function")return structuredClone(valor);
    return JSON.parse(JSON.stringify(valor));
  }

  function aplicarVinculoDaFichaDestino(importado){
    const onlineAtual=estado?.__online&&typeof estado.__online==="object"?clonarSeguro(estado.__online):null;

    /* __online descreve o vínculo da ficha que já existe neste aparelho.
       Um arquivo importado fornece conteúdo, nunca autorização para assumir o
       characterId/sheetId de outra ficha. Se a ficha atual ainda não possui
       vínculo online, a identidade será criada normalmente pelo motor online. */
    if(onlineAtual&&Object.keys(onlineAtual).length){
      importado.__online=onlineAtual;
      importado.__online.name=String(typeof fichaAtual!=="undefined"?fichaAtual:(onlineAtual.name||"Principal"));
    }else{
      delete importado.__online;
    }
    return importado;
  }

  function importarFichaSegura(event){
    const input=event?.target;
    const arquivo=input?.files?.[0];
    if(!arquivo) return;

    if(arquivo.size>LIMITE_ARQUIVO_BYTES){
      alert("O backup ultrapassa o limite de 8 MB. Verifique se o arquivo é realmente uma ficha exportada pelo aplicativo.");
      input.value="";
      return;
    }

    const leitor=new FileReader();
    leitor.onerror=()=>{
      alert("Não foi possível ler o arquivo selecionado.");
      input.value="";
    };
    leitor.onload=async evento=>{
      const estadoAnterior=clonarSeguro(estado);
      try{
        const dados=JSON.parse(String(evento.target?.result||""));
        const novoEstado=extrairEstadoBackup(dados);
        if(!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?")) return;

        const importado=aplicarVinculoDaFichaDestino(clonarSeguro(novoEstado));
        estado=importado;

        /* Backups exportados podem conter imagens Base64. Elas precisam sair do
           objeto antes do localStorage; do contrário um backup perfeitamente
           válido pode estourar a quota antes de chegar ao IndexedDB. */
        if(typeof window.shinobiMigrarEstadoImagensParaIndexedDB==="function"){
          await window.shinobiMigrarEstadoImagensParaIndexedDB({persistir:false});
        }

        if(!persistirEstadoLocal({emitir:false,origem:"importacao",motivo:"importacao-local"})){
          throw new Error("O armazenamento local não aceitou os dados importados.");
        }
        alert("Ficha importada com sucesso!");
        location.reload();
      }catch(erro){
        console.error("Falha ao importar backup:",erro);
        estado=estadoAnterior;
        alert(`Não foi possível importar a ficha. ${erro?.message||"O arquivo precisa ser um JSON válido."}`);
      }finally{
        input.value="";
      }
    };
    leitor.readAsText(arquivo);
  }


  function escolherOrigemImportacao(){
    return new Promise(resolve=>{
      const overlay=document.createElement("div");
      overlay.className="modalShinobiOverlay";
      overlay.innerHTML=`
        <div class="modalShinobiBox" role="dialog" aria-modal="true" aria-labelledby="ekoImportarTitulo">
          <h3 id="ekoImportarTitulo" class="modalShinobiTitulo">Importar ficha</h3>
          <p class="modalShinobiTexto">Escolha de onde deseja trazer a ficha.</p>
          <div class="modalShinobiAcoes" style="grid-template-columns:1fr;">
            <button type="button" class="modalShinobiBtn confirmar" data-origem-importacao="dispositivo">Do dispositivo</button>
            <button type="button" class="modalShinobiBtn" data-origem-importacao="nuvem">Da nuvem</button>
            <button type="button" class="modalShinobiBtn cancelar" data-origem-importacao="cancelar">Cancelar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      const concluir=origem=>{
        overlay.remove();
        resolve(origem);
      };
      overlay.querySelectorAll("[data-origem-importacao]").forEach(botao=>{
        botao.addEventListener("click",()=>concluir(botao.dataset.origemImportacao||"cancelar"));
      });
      overlay.addEventListener("click",evento=>{if(evento.target===overlay)concluir("cancelar");});
    });
  }

  function aguardarPainelNuvem(limiteMs=6000){
    if(window.ShinobiOnlineUI?.abrir) return Promise.resolve(true);
    return new Promise(resolve=>{
      let finalizado=false;
      const concluir=valor=>{
        if(finalizado)return;
        finalizado=true;
        clearTimeout(timer);
        window.removeEventListener("shinobi:online-stack-ready",aoCarregar);
        resolve(valor);
      };
      const aoCarregar=()=>setTimeout(()=>concluir(Boolean(window.ShinobiOnlineUI?.abrir)),0);
      const timer=setTimeout(()=>concluir(Boolean(window.ShinobiOnlineUI?.abrir)),limiteMs);
      window.addEventListener("shinobi:online-stack-ready",aoCarregar,{once:true});
    });
  }

  async function abrirImportarFichaSeguro(){
    const origem=await escolherOrigemImportacao();
    if(origem==="dispositivo"){
      const input=document.getElementById("importarFichaInput");
      input?.click();
      return;
    }
    if(origem!=="nuvem") return;

    const disponivel=await aguardarPainelNuvem();
    if(!disponivel){
      if(typeof window.avisoShinobi==="function"){
        await window.avisoShinobi("Nuvem indisponível","A ficha continua funcionando normalmente, mas o módulo online não pôde ser carregado agora.");
      }else{
        alert("O módulo online não pôde ser carregado agora.");
      }
      return;
    }
    window.ShinobiOnlineUI?.abrir?.("sincronizacao");
  }

  window.abrirImportarFicha=abrirImportarFichaSeguro;
  window.importarFicha=importarFichaSegura;
  window.validarBackupFicha=extrairEstadoBackup;
})();
