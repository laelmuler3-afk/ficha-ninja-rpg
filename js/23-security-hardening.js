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
    leitor.onload=evento=>{
      try{
        const dados=JSON.parse(String(evento.target?.result||""));
        const novoEstado=extrairEstadoBackup(dados);
        if(!confirm("Importar esta ficha vai substituir os dados salvos neste aparelho. Continuar?")) return;

        estado=novoEstado;
        if(!persistirEstadoLocal()) throw new Error("O armazenamento local não aceitou os dados importados.");
        alert("Ficha importada com sucesso!");
        location.reload();
      }catch(erro){
        console.error("Falha ao importar backup:",erro);
        alert(`Não foi possível importar a ficha. ${erro?.message||"O arquivo precisa ser um JSON válido."}`);
      }finally{
        input.value="";
      }
    };
    leitor.readAsText(arquivo);
  }

  window.importarFicha=importarFichaSegura;
  window.validarBackupFicha=extrairEstadoBackup;
})();
