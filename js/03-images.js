/* Shinobi 1.3.0 — arquivo modular gerado preservando a ordem do app original. */

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
