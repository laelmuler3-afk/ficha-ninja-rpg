/* Shinobi 2.5.8.184 — livro-caixa de Pontos-Chave / Pontos de Clã.
 * Funções puras, sem alterar atributos, ataques ou habilidades antigas.
 * Regras confirmadas pelo mestre em 02/11/2026; créditos por nível podem ser ajustados.
 * A compra é um registro de aquisição, não a execução do efeito do talento.
 */
(function (root, factory) {
  "use strict";
  var api=factory();
  if(typeof module!=="undefined" && module.exports) module.exports=api;
  if(root) root.ShinobiPontosChave=api;
})(typeof window!=="undefined" ? window : (typeof globalThis!=="undefined" ? globalThis : this), function () {
  "use strict";
  var VERSAO=1;
  var PADRAO_CHAVE={4:10,5:12,6:14,7:16,8:22,9:24,10:26,11:28,12:34,13:36,14:38,15:40,16:42,17:44,18:46,19:48,20:50};
  var PADRAO_CLA={3:3,7:3,10:3,15:3,19:3};
  /* Somente requisitos explicitamente conhecidos são automatizados. Outros exigem revisão do mestre. */
  var CATALOGO=[
    ["melhoria_atributo","Melhoria de Atributo",2,0,true,"atributo"],
    ["melhoria_deslocamento","Melhoria de Deslocamento",2,0,true],
    ["melhoria_vida","Melhoria de Vida",2,0,true],
    ["melhoria_chakra","Melhoria de Chakra",2,0,true],
    ["velocidade_ataque","Velocidade de Ataque",4,15,false],
    ["natureza_chakra","Natureza de Chakra",4,4,true,"natureza"],
    ["primeiro_portao","Primeiro Portão",4,0,false],
    ["terceiro_portao","Terceiro Portão",4,5,false,null,"primeiro_portao"],
    ["quinto_portao","Quinto Portão",6,10,false,null,"terceiro_portao"],
    ["setimo_portao","Sétimo Portão",8,15,false,null,"quinto_portao"],
    ["oitavo_portao","Oitavo Portão",10,18,false,null,"setimo_portao"],
    ["metodo_aceleracao_cardiaca","Método de Aceleração Cardíaca",2,0,false],
    ["punho_feroz","Punho Feroz",2,0,false],
    ["ninjutsu_melhorado_1","Ninjutsu Melhorado I",2,0,false],
    ["ninjutsu_melhorado_2","Ninjutsu Melhorado II",2,0,true,null,"ninjutsu_melhorado_1"],
    ["ninjutsu_melhorado_3","Ninjutsu Melhorado III",4,10,true,null,"ninjutsu_melhorado_2"],
    ["ninjutsu_aprimorado","Ninjutsu Aprimorado",4,5,true],
    ["mestre_sussurros","Mestre dos Sussurros",2,0,false],
    ["mestre_mental","Mestre Mental",2,0,false],
    ["clones_ilusorios","Clones Ilusórios",4,5,false],
    ["clones_melhorados","Clones Melhorados",4,0,false,null,"clones_ilusorios"],
    ["padrao_hipnotico","Padrão Hipnótico",null,5,false],
    ["invisibilidade","Invisibilidade",4,7,false],
    ["habilidade_com_armas","Habilidade com Armas",2,0,true,"armas-comuns"],
    ["versatilidade_com_armas","Versatilidade com Armas",4,0,true,"arma-especial"],
    ["duelista_defensivo","Duelista Defensivo",2,0,false],
    ["ambidestria","Ambidestria",2,0,false],
    ["especialista_em_shuriken","Especialista em Shuriken",4,0,false,null,null,"destreza",15],
    ["pontaria","Pontaria",2,0,false],
    ["armas_grandes","Armas Grandes",2,0,false],
    ["combate_com_duas_armas","Combate com Duas Armas",2,0,false],
    ["duelista","Duelista",2,0,false],
    ["tecnica_selamento_1","Técnica de Selamento I",2,0,false],
    ["tecnica_selamento_2","Técnica de Selamento II",4,7,false,null,"tecnica_selamento_1"],
    ["mimetismo_animal_1","Mimetismo Animal I",2,0,false,null,"tecnica_selamento_1"],
    ["mimetismo_animal_2","Mimetismo Animal II",2,5,false,null,"mimetismo_animal_1"],
    ["mimetismo_animal_3","Mimetismo Animal III",4,8,false,null,"mimetismo_animal_2"],
    ["mimetismo_animal_4","Mimetismo Animal IV",6,12,false,null,"mimetismo_animal_3"],
    ["mimetismo_animal_5","Mimetismo Animal V",8,15,false,null,"mimetismo_animal_4"],
    ["selamento_aprimorado","Selamento Aprimorado",4,0,false],
    ["tecnica_mao_unica","Técnica de Mão Única",2,0,false,null,null,"destreza",20],
    ["ninja_rastreador","Ninja Rastreador",4,0,false,null,null,"sabedoria",15],
    ["alerta","Alerta",4,0,false],
    ["especialista_briga","Especialista em Briga",2,0,false],
    ["perito","Perito",4,0,true],
    ["sentinela","Sentinela",4,0,false],
    ["sorte","Sorte",10,0,false],
    ["kinjutsu","Kinjutsu",4,0,false],
    ["fanatico","Fanático",6,8,true,"tipo-ataque"],
    ["duravel","Durável",4,0,false],
    ["adepto_elemental","Adepto Elemental",2,0,true,"elemento",null,"inteligencia",20]
  ].map(function(a){return {id:a[0],nome:a[1],custo:a[2],nivelMin:a[3],repetivel:a[4],escolha:a[5]||"",requer:a[6]||"",atributo:a[7]||"",atributoMin:a[8]||0};});
  var POR_ID={}; CATALOGO.forEach(function(h){POR_ID[h.id]=h;});
  var REQUISITOS_EXTRAS={clones_ilusorios:"Estilo Yin",padrao_hipnotico:"Conjuração por Carisma e custo não definido",selamento_aprimorado:"Jutsu de Selamento Básico",kinjutsu:"Tutor"};
  function copiar(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function numero(v){return Number(v);}
  function inteiro(v,des){var n=Number(v);return Number.isInteger(n)?n:des;}
  function nivelDaFicha(ficha){return Math.max(1,Math.min(20,inteiro(ficha && ficha.nivel,1)));}
  function nivelValido(n){return Number.isInteger(n)&&n>=1&&n<=20;}
  function registro(ficha){var orig=ficha&&ficha.pontosChaveV1;return {versao:VERSAO,eventos:Array.isArray(orig&&orig.eventos)?copiar(orig.eventos):[]};}
  function habilidade(id){return POR_ID[id]?copiar(POR_ID[id]):null;}
  function catalogo(){return copiar(CATALOGO);}
  function ativa(e,estornos){return e && e.tipo!=="estorno" && !estornos.has(String(e.id));}
  function estornados(eventos){var s=new Set();eventos.forEach(function(e){if(e && e.tipo==="estorno")s.add(String(e.alvoId));});return s;}
  function dadosCompras(ficha,reg){
    var cancelados=estornados(reg.eventos),compras=[];
    reg.eventos.forEach(function(e){if(ativa(e,cancelados)&&(e.tipo==="compra"||e.tipo==="historico"))compras.push(e);});
    var antigo=ficha&&ficha.automacaoAtaques&&ficha.automacaoAtaques.aquisicoes;
    (Array.isArray(antigo)?antigo:[]).forEach(function(e){if(e&&e.habilidadeId)compras.push({id:String(e.id||"antigo-"+compras.length),habilidadeId:e.habilidadeId,tipo:"historico-antigo",nome:e.habilidadeId,origem:"registro anterior",nivel:e.nivelAquisicao,escolhas:e.escolhas||{}});});
    return compras;
  }
  function resumo(ficha,reg){
    reg=reg||registro(ficha);
    var nivel=nivelDaFicha(ficha),anulados=estornados(reg.eventos),chave=0,cla=0;
    var creditoNiveis=[],gastos=0,claGastos=0,convertidos=0,gastosAntigos=0;
    for(var i=1;i<=nivel;i++){
      var pc=PADRAO_CHAVE[i]||0,cl=PADRAO_CLA[i]||0;
      reg.eventos.forEach(function(e){if(!ativa(e,anulados)||e.tipo!=="ajuste-nivel"||e.nivel!==i)return; if(e.bolsa==="chave")pc=e.quantidade; if(e.bolsa==="cla")cl=e.quantidade;});
      chave+=pc; cla+=cl; if(pc||cl)creditoNiveis.push({nivel:i,chave:pc,cla:cl});
    }
    var ganhoChave=chave,ganhoCla=cla;
    reg.eventos.forEach(function(e){if(!ativa(e,anulados))return;
      if(e.tipo==="credito-extra"){if(e.bolsa==="chave"){chave+=e.quantidade;ganhoChave+=e.quantidade;}else{cla+=e.quantidade;ganhoCla+=e.quantidade;}}
      if(e.tipo==="conversao"){cla-=e.quantidade;chave+=2*e.quantidade;convertidos+=e.quantidade;}
      if(e.tipo==="compra"||e.tipo==="despesa-antiga"){if(e.bolsa==="cla"){cla-=e.custo;claGastos+=e.custo;}else{chave-=e.custo;gastos+=e.custo;}if(e.tipo==="despesa-antiga")gastosAntigos+=e.custo;}
    });
    var compras=dadosCompras(ficha,reg);
    return {nivel:nivel,chaveDisponivel:chave,claDisponivel:cla,chaveRecebida:ganhoChave,claRecebida:ganhoCla,chaveGasta:gastos,claGasta:claGastos,gastosAntigos:gastosAntigos,pontosClaConvertidos:convertidos,creditosPorNivel:creditoNiveis,compras:compras,legados:compras.filter(function(c){return c.tipo!=="compra";}).length};
  }
  function normalizarTexto(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
  function temHabilidade(ficha,reg,id){return dadosCompras(ficha,reg).some(function(c){return c.habilidadeId===id;});}
  function parseArmas(texto,preparacao){
    var partes=String(texto||"").split(/[,;\n]+/).map(function(x){return x.trim();}).filter(Boolean);
    if(!preparacao||!preparacao.obterArma)throw new Error("Catálogo de armas indisponível.");
    return partes.map(function(nome){var a=preparacao.obterArma(nome);if(!a)throw new Error("Arma não reconhecida: "+nome);return a;});
  }
  function avaliarCompra(ficha,reg,op,dependencias){
    var h=POR_ID[op.habilidadeId];if(!h)throw new Error("Habilidade não cadastrada. Não é seguro atribuir um custo presumido.");
    if(h.custo==null)throw new Error("O livro não informa custo confirmado para esta habilidade. Consulte o mestre.");
    if(REQUISITOS_EXTRAS[h.id])throw new Error("Requisito ainda não verificável automaticamente: "+REQUISITOS_EXTRAS[h.id]+". Registre como histórico somente se já adquirido.");
    var nivel=nivelDaFicha(ficha),nivelCompra=inteiro(op.nivel,nivel);
    if(!nivelValido(nivelCompra)||nivelCompra>nivel)throw new Error("O nível da compra deve estar entre 1 e o nível atual.");
    if(nivelCompra<h.nivelMin)throw new Error("Esta habilidade exige nível "+h.nivelMin+".");
    if(!h.repetivel&&temHabilidade(ficha,reg,h.id))throw new Error("Essa habilidade já foi adquirida. O livro não permite comprá-la outra vez.");
    if(h.requer&&!temHabilidade(ficha,reg,h.requer))throw new Error("É necessário adquirir antes: "+POR_ID[h.requer].nome+".");
    var repeticoes=dadosCompras(ficha,reg).filter(function(c){return c.habilidadeId===h.id;}).length;
    var limites={melhoria_vida:nivel,melhoria_deslocamento:Math.ceil(nivel/4)+1,melhoria_chakra:Math.ceil(nivel/4)+1,natureza_chakra:Math.ceil(nivel/4)+1};
    if(limites[h.id]&&repeticoes>=limites[h.id])throw new Error("Limite de aquisições dessa habilidade atingido no nível atual.");
    if(h.atributo&&h.atributoMin){var val=inteiro(ficha&&ficha[h.atributo],0);if(val<h.atributoMin)throw new Error("Requer "+h.atributo+" "+h.atributoMin+".");}
    var escolha=String(op.detalhes||"").trim(), custo=h.custo, dadosEscolha={descricao:escolha};
    if(h.escolha==="armas-comuns"||h.escolha==="arma-especial"){
      var armas=parseArmas(escolha,dependencias&&dependencias.preparacao);
      var esperado=h.escolha==="armas-comuns"?2:1;
      if(armas.length!==esperado||new Set(armas.map(function(a){return a.id;})).size!==esperado)throw new Error("Escolha "+esperado+" arma(s) diferente(s).");
      if(armas.some(function(a){var especial=(a.propriedades||[]).indexOf("especial")>=0;return h.escolha==="armas-comuns"?especial:!especial;}))throw new Error("A propriedade Especial da arma não corresponde ao talento selecionado.");
      dadosEscolha.armas=armas.map(function(a){return a.id;});
    }
    if(h.escolha==="atributo"){
      if(["forca","destreza","constituicao","inteligencia","sabedoria","carisma"].indexOf(normalizarTexto(escolha))<0)throw new Error("Informe o atributo escolhido (ex.: Destreza).");
    }
    if(h.escolha==="natureza"){
      if(!escolha)throw new Error("Informe a natureza de Chakra escolhida.");
      var tipo=String(op.tipoNatureza||"");
      if(tipo!=="nova-elemental"&&tipo!=="evolucao"&&tipo!=="nova-nao-elemental")throw new Error("Informe se é uma nova natureza elemental, outra natureza ou evolução.");
      dadosEscolha.tipoNatureza=tipo;
      var naturezaId={fogo:"katon",katon:"katon",agua:"suiton",suiton:"suiton",vento:"fuuton",futon:"fuuton",fuuton:"fuuton",terra:"doton",doton:"doton",raio:"raiton",relampago:"raiton",raiton:"raiton"}[normalizarTexto(escolha)];
      if(tipo==="nova-elemental"){
        if(!naturezaId)throw new Error("Informe uma natureza elemental básica reconhecida (Katon, Suiton, Fuuton, Doton ou Raiton).");
        if(inteiro(ficha&&ficha[naturezaId],0)>0||dadosCompras(ficha,reg).some(function(c){return c.habilidadeId==="natureza_chakra"&&c.escolhas&&c.escolhas.tipoNatureza==="nova-elemental"&&c.escolhas.naturezaId===naturezaId;}))throw new Error("Essa natureza já foi aprendida. Utilize a modalidade de evolução.");
      }
      dadosEscolha.naturezaId=naturezaId||"";
      if(tipo==="nova-elemental"&&normalizarTexto(ficha&&ficha.cla).indexOf("sarutobi")>=0)custo=h.custo/2;
    }
    if(h.escolha==="tipo-ataque"||h.escolha==="elemento"){
      if(!escolha)throw new Error("Informe a escolha permanente exigida por esta habilidade.");
    }
    if(h.id==="fanatico"&&h.repetivel){var escolhasAnteriores=dadosCompras(ficha,reg).filter(function(c){return c.habilidadeId===h.id;});
      if(escolhasAnteriores.some(function(c){return normalizarTexto(c.detalhes||c.escolhas&&c.escolhas.descricao)===normalizarTexto(escolha);})){
        // Fanático permite repetir o mesmo tipo, conforme texto do livro.
      }
    }
    return {habilidade:h,custo:custo,escolhas:dadosEscolha,nivel:nivelCompra};
  }
  function registrarEvento(ficha,reg,evento,dependencias){
    var clone=registro({pontosChaveV1:reg}),e=copiar(evento||{});
    if(!e.id||!/^[-a-z0-9_:]{8,100}$/i.test(String(e.id)))throw new Error("Identificador de transação inválido.");
    if(clone.eventos.some(function(item){return String(item.id)===String(e.id);}))throw new Error("Esta transação já foi registrada.");
    e.criadoEm=String(e.criadoEm||new Date().toISOString());
    if(e.tipo==="compra"){
      if(e.bolsa&&e.bolsa!=="chave")throw new Error("Este catálogo usa pontos-chave. Compras de habilidades exclusivas de clã ainda não estão habilitadas.");
      var info=avaliarCompra(ficha,clone,e,dependencias);
      var antigos=ficha&&ficha.automacaoAtaques&&ficha.automacaoAtaques.aquisicoes;
      if(Array.isArray(antigos)&&antigos.length&&!clone.eventos.some(function(x){return x.tipo==="despesa-antiga"&&!estornados(clone.eventos).has(String(x.id));}))throw new Error("Esta ficha tem aquisições antigas. Reconcilie os gastos anteriores (até mesmo 0, se não houve gasto) antes de comprar novamente.");
      e.bolsa="chave";e.custo=info.custo;e.nome=info.habilidade.nome;e.nivel=info.nivel;e.escolhas=info.escolhas;
    }else if(e.tipo==="historico"){
      var hab=POR_ID[e.habilidadeId];if(!hab)throw new Error("Habilidade não cadastrada.");
      if(temHabilidade(ficha,clone,hab.id))throw new Error("Esta habilidade já consta do histórico. Não duplicamos a aquisição antiga.");
      e.nome=hab.nome;e.nivel=inteiro(e.nivel,nivelDaFicha(ficha));
      if(!nivelValido(e.nivel)||e.nivel>nivelDaFicha(ficha))throw new Error("Nível histórico inválido.");
      e.custo=0;e.bolsa="historico";
    }else if(e.tipo==="conversao"){
      e.quantidade=inteiro(e.quantidade,-1);
      if(e.quantidade<1||e.quantidade>100)throw new Error("Informe quantos pontos de clã converter (1 a 100).");
    }else if(e.tipo==="ajuste-nivel"){
      e.nivel=inteiro(e.nivel,-1);e.quantidade=inteiro(e.quantidade,-1);
      if(!nivelValido(e.nivel)||e.nivel>nivelDaFicha(ficha)||e.quantidade<0||e.quantidade>200)throw new Error("Informe um nível já alcançado e um crédito de 0 a 200 pontos.");
      if(e.bolsa!=="chave"&&e.bolsa!=="cla")throw new Error("Tipo de pontos inválido.");
      if(!String(e.motivo||"").trim())throw new Error("Descreva a decisão do mestre para o ajuste.");
    }else if(e.tipo==="despesa-antiga"){
      e.custo=inteiro(e.custo,-1);
      if(e.custo<0||e.custo>1000||["chave","cla"].indexOf(e.bolsa)<0)throw new Error("Informe gastos históricos entre 0 e 1000 e uma reserva válida.");
      if(!String(e.motivo||"").trim())throw new Error("Descreva quais compras antigas esse gasto representa.");
    }else if(e.tipo==="credito-extra"){
      e.quantidade=inteiro(e.quantidade,-1);
      if(e.quantidade<1||e.quantidade>200||["chave","cla"].indexOf(e.bolsa)<0)throw new Error("Crédito extra inválido.");
      if(!String(e.motivo||"").trim())throw new Error("Informe a razão do crédito extra.");
    }else if(e.tipo==="estorno"){
      if(!e.alvoId||!clone.eventos.some(function(x){return String(x.id)===String(e.alvoId)&&x.tipo!=="estorno"}))throw new Error("Transação original não encontrada.");
      if(clone.eventos.some(function(x){return x.tipo==="estorno"&&String(x.alvoId)===String(e.alvoId)}))throw new Error("Essa transação já foi estornada.");
    }else throw new Error("Tipo de transação desconhecido.");
    clone.eventos.push(e);
    if(e.tipo==="estorno"){
      var alvo=reg.eventos.find(function(x){return String(x.id)===String(e.alvoId);});
      if(alvo&&alvo.tipo==="compra"){
        var hAlvo=POR_ID[alvo.habilidadeId];
        var dependentes=dadosCompras(ficha,clone).filter(function(c){var h=POR_ID[c.habilidadeId];return h&&h.requer===alvo.habilidadeId;});
        if(hAlvo&&dependentes.length)throw new Error("Não é possível estornar uma habilidade exigida por outra aquisição ativa.");
      }
    }
    var r=resumo(ficha,clone);
    if(r.chaveDisponivel<0||r.claDisponivel<0)throw new Error("Operação não permitida: saldo insuficiente ou ajuste inferior aos gastos já registrados.");
    return clone;
  }
  function proficiencias(ficha,reg){
    return dadosCompras(ficha,reg||registro(ficha)).filter(function(c){return c.habilidadeId==="habilidade_com_armas"||c.habilidadeId==="versatilidade_com_armas";}).reduce(function(acc,c){var escolhidas=c.escolhas&&c.escolhas.armas||[];escolhidas.forEach(function(id){if(acc.indexOf(id)<0)acc.push(id);});return acc;},[]);
  }
  return Object.freeze({versao:VERSAO,creditoPadraoChave:copiar(PADRAO_CHAVE),creditoPadraoCla:copiar(PADRAO_CLA),catalogo:catalogo,habilidade:habilidade,registro:registro,resumo:resumo,registrarEvento:registrarEvento,avaliarCompra:avaliarCompra,proficiencias:proficiencias});
});
