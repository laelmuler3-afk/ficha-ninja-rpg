/* Projetinho Shinobi 2.5.8.186 — reconhecimento assistido de habilidades antigas.
 * Fonte: suplemento Shinobi pp. 19, 30, 41 e 52. Apenas dados da lista "Pontos chave gastos".
 * NUNCA recalcula atributos, custos dos jutsus ou saldos. Confirmação por ficha é obrigatória.
 */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ShinobiMigracaoHabilidades186=api;
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this),function(){
  'use strict';
  var VERSAO='2.5.8.186';
  function normal(v){return String(v==null?'':v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  /* Cada ocorrência da lista é uma aquisição distinta — inclusive talentos repetidos.
   * Não presumimos nível de aquisição, atributo escolhido ou destino não escrito no PDF.
   */
  var RAW=[
    {id:'shizen',nome:'Shizen Lee',cla:'Lee',pagina:19,lista:[
      'Primeiro Portão','Melhoria de Atributo','Terceiro Portão','Melhoria de Atributo','Melhoria de Atributo','Punho Feroz',
      'Melhoria de Atributo','Melhoria de Atributo','Melhoria de Atributo','Técnica de Mão Única','SEGREDO',
      'Durável','Melhoria de Atributo']},
    {id:'liu',nome:'Liu Hyuuga',cla:'Hyuuga',pagina:30,lista:[
      'Byakugan','Byakugan Veloz','Punho Suave','Melhoria de Atributo','Melhoria de Atributo',
      'Natureza de Chakra','Natureza de Chakra','Melhoria de Atributo','Invisibilidade','Natureza de Chakra: Yang','Mestre Mental']},
    {id:'sora',nome:'Sora Aoki',cla:'',pagina:41,lista:[
      'Melhoria de Atributo','Melhoria de Atributo','Melhoria de Atributo','Melhoria de Atributo','Natureza de Chakra','Natureza de Chakra',
      'Técnica de Selamento I','Mimetismo Animal I','Melhoria de Chakra','Melhoria de Atributo','Melhoria de Atributo',
      'Melhoria de Atributo','Melhoria de Atributo','Adepto Elemental','Mimetismo Animal II']},
    {id:'luffy',nome:'Luffy Sarutobi',cla:'Sarutobi',pagina:52,lista:[
      'Natureza de Chakra','Natureza de Chakra','Ninjutsu Melhorado I','Habilidade com Armas (Wakizaki e Agulha)',
      'Ninjutsu Melhorado II','Duelista','Melhoria de Atributo','Melhoria de Atributo','Melhoria de Chakra',
      'Melhoria de Atributo','Melhoria de Atributo','Melhoria de Atributo','Melhoria de Atributo','Alerta',
      'Ninjutsu Aprimorado','Melhoria de Atributo','Melhoria de Atributo']}
  ];
  var MAPA={
    'primeiro portao':'primeiro_portao','terceiro portao':'terceiro_portao','melhoria de atributo':'melhoria_atributo',
    'melhoria de chakra':'melhoria_chakra','punho feroz':'punho_feroz','tecnica de mao unica':'tecnica_mao_unica',
    'duravel':'duravel','natureza de chakra':'natureza_chakra','invisibilidade':'invisibilidade',
    'mestre mental':'mestre_mental','tecnica de selamento i':'tecnica_selamento_1',
    'mimetismo animal i':'mimetismo_animal_1','mimetismo animal ii':'mimetismo_animal_2',
    'adepto elemental':'adepto_elemental','ninjutsu melhorado i':'ninjutsu_melhorado_1',
    'ninjutsu melhorado ii':'ninjutsu_melhorado_2','ninjutsu aprimorado':'ninjutsu_aprimorado',
    'duelista':'duelista','alerta':'alerta','habilidade com armas':'habilidade_com_armas'
  };
  function montar(t){
    return {id:t.id,nome:t.nome,cla:t.cla,pagina:t.pagina,entradas:t.lista.map(function(rotulo,i){
      var chave=normal(rotulo).replace(/ yang$/,'').replace(/ wakizaki e agulha$/,'');
      var habilidadeId=MAPA[chave]||'';
      var tipo=habilidadeId==='melhoria_atributo'?'atributo':
        ['ninjutsu_melhorado_2','ninjutsu_aprimorado'].indexOf(habilidadeId)>=0?'jutsu':
        habilidadeId==='natureza_chakra'?'natureza':
        habilidadeId==='habilidade_com_armas'?'armas':
        habilidadeId==='adepto_elemental'?'elemento':'';
      return {sourceId:'shinobi_supl_2026_'+t.id+'_'+String(i+1).padStart(2,'0'),ordem:i+1,rotulo:rotulo,
        habilidadeId:habilidadeId,tipoAlvo:tipo,observacao:rotulo==='SEGREDO'?'Habilidade não revelada no suplemento. Exige conferência do mestre.':
          rotulo.indexOf('Wakizaki e Agulha')>=0?'Proficiência legada em arma Especial: preservar como exceção, conforme resposta 16 do mestre.':'',
        sugestao:rotulo.indexOf('Yang')>=0?'yang':rotulo.indexOf('Wakizaki e Agulha')>=0?'wakizaki,agulha':''};
    })};
  }
  var TEMPLATES=RAW.map(montar);
  function modelos(){return clone(TEMPLATES);}
  function identificar(ficha){
    var nome=normal(ficha&&ficha.nome),cla=normal(ficha&&ficha.cla);
    if(!nome)return null;
    var matches=TEMPLATES.filter(function(t){return normal(t.nome)===nome&&(!t.cla||normal(t.cla)===cla||cla==='cla '+normal(t.cla));});
    return matches.length===1?clone(matches[0]):null;
  }
  function obter(id){var t=TEMPLATES.find(function(x){return x.id===id;});return t?clone(t):null;}
  function entradasValidas(modelo,ficha,livro){
    if(!modelo||!livro||typeof livro.resumo!=='function')return [];
    var compras=livro.resumo(ficha).compras||[];
    var usados={};
    return modelo.entradas.map(function(e){
      var copia=clone(e),existente=compras.find(function(c){return c.origemSuplementoId===e.sourceId;});
      if(existente){copia.estado='importado';copia.eventoExistenteId=String(existente.id);return copia;}
      // Um vínculo já registrado em evento de metadados também conta como confirmado.
      var eventos=livro.registro(ficha).eventos;
      var estornos=new Set(eventos.filter(function(c){return c.tipo==='estorno';}).map(function(c){return String(c.alvoId);}));
      var vinculo=eventos.find(function(c){return c.tipo==='vinculo-habilidade'&&c.origemSuplementoId===e.sourceId&&!estornos.has(String(c.id));});
      if(vinculo){copia.estado='vinculado';copia.eventoExistenteId=String(vinculo.alvoId);return copia;}
      var compativeis=compras.filter(function(c){return c.habilidadeId===e.habilidadeId&&!c.origemSuplementoId&&
        !eventos.some(function(ev){return ev.tipo==='vinculo-habilidade'&&String(ev.alvoId)===String(c.id)&&!estornos.has(String(ev.id));});});
      if(e.habilidadeId&&compativeis[usados[e.habilidadeId]||0]){
        copia.estado='ja-registrado';copia.eventoExistenteId=String(compativeis[usados[e.habilidadeId]||0].id);
        usados[e.habilidadeId]=(usados[e.habilidadeId]||0)+1;
      }else copia.estado=e.habilidadeId?'pendente':'nao-catalogado';
      return copia;
    });
  }
  function alvos(ficha,tipo){
    var lista=[],unicos=new Set();
    function add(id,nome,extra){id=String(id||'').trim();nome=String(nome||'').trim();if(!id||!nome||unicos.has(id))return;unicos.add(id);lista.push({id:id,nome:nome,extra:extra||''});}
    if(tipo==='atributo'){
      [['forca','Força'],['destreza','Destreza'],['constituicao','Constituição'],['inteligencia','Inteligência'],['sabedoria','Sabedoria'],['carisma','Carisma']].forEach(function(a){add(a[0],a[1],String(ficha&&ficha[a[0]]==null?'':ficha[a[0]]));});
    }else if(tipo==='jutsu'){
      (Array.isArray(ficha&&ficha.jutsus)?ficha.jutsus:[]).forEach(function(j,i){if(!j||!j.nome)return;
        add(String(j.jutsuId||j.catalogoId||'indice:'+i),j.nome,'Custo atual: '+String(j.custo==null?'?':j.custo));});
    }else if(tipo==='armas'){
      [['wakizaki','Wakizaki'],['agulha','Agulha']].forEach(function(a){add(a[0],a[1]);});
    }else if(tipo==='natureza'||tipo==='elemento'){
      [['katon','Katon'],['raiton','Raiton'],['fuuton','Fuuton'],['suiton','Suiton'],['doton','Doton'],['yin','Yin'],['yang','Yang']].forEach(function(a){add(a[0],a[1],String(ficha&&ficha[a[0]]||0));});
    }
    return lista;
  }
  function validarDestino(entrada,opcoes,ficha){
    var opt=opcoes||{},aplicacao=String(opt.aplicacao||'');
    if(['ja-aplicado','nao-aplicado','incerto'].indexOf(aplicacao)<0)throw new Error('Informe se o benefício já foi aplicado manualmente.');
    var alvoTipo=entrada.tipoAlvo||'',alvoId=String(opt.alvoId||''),alvoNome='';
    if(alvoTipo==='armas'){
      // Caso explicitamente listado no suplemento; mestre autorizou preservar no legado.
      alvoId='wakizaki,agulha';alvoNome='Wakizaki e Agulha';
    }else if(alvoTipo){
      if(alvoId){var selecionado=alvos(ficha,alvoTipo).find(function(x){return x.id===alvoId;});
        if(!selecionado)throw new Error('O destino escolhido não existe mais na ficha. Confira novamente.');alvoNome=selecionado.nome;}
      if(!alvoId&&aplicacao!=='incerto')throw new Error('Selecione o destino da melhoria ou marque como incerto.');
    }
    return {aplicacao:aplicacao,alvoTipo:alvoTipo,alvoId:alvoId,alvoNome:alvoNome,
      observacao:String(opt.observacao||'').trim().slice(0,240),tipoNatureza:alvoTipo==='natureza'?String(opt.tipoNatureza||''):'',
      efeito:alvoTipo==='jutsu'?String(opt.efeito||''):''};
  }
  function conciliar(ficha,modeloId,decisoes,livro){
    if(!livro||typeof livro.registro!=='function')throw new Error('Livro-caixa de Pontos-Chave indisponível.');
    var modelo=obter(modeloId),identificado=identificar(ficha);
    if(!modelo||!identificado||modelo.id!==identificado.id)throw new Error('Nome e clã desta ficha não correspondem ao suplemento. Não houve importação.');
    if(Number(ficha.nivel||0)<8)throw new Error('O suplemento registra personagens no nível 8. Confirme a ficha antes de conciliar.');
    var registro=livro.registro(ficha),atuais=entradasValidas(modelo,ficha,livro),entradaPorId={};
    atuais.forEach(function(e){entradaPorId[e.sourceId]=e;});
    var chaves=new Set(registro.eventos.map(function(e){return String(e.id);}));
    var confirmadas=0,omitidas=0;
    Object.keys(decisoes||{}).forEach(function(sourceId){
      var item=entradaPorId[sourceId],op=decisoes[sourceId];
      if(!item||!op||op.confirmar!==true||item.estado==='importado'||item.estado==='vinculado')return;
      if(item.estado==='nao-catalogado')throw new Error('Esta habilidade ainda não está no catálogo: '+item.rotulo+'. Consulte o mestre.');
      var destino=validarDestino(item,op,ficha);
      var baseId='mig186_'+sourceId,id=baseId,versaoId=2;
      while(chaves.has(id)){id=baseId+'_r'+(versaoId++);}
      var existente=item.estado==='ja-registrado';
      var evento={id:id,tipo:existente?'vinculo-habilidade':'historico',habilidadeId:item.habilidadeId,
        nome:item.rotulo,origem:'suplemento-shinobi-2026',origemSuplementoId:item.sourceId,paginaSuplemento:modelo.pagina,
        nivel:8,nivelAquisicaoDesconhecido:true,custo:0,bolsa:'historico',
        criadoEm:new Date().toISOString(),escolhas:{alvoId:destino.alvoId,alvoNome:destino.alvoNome,
          alvoTipo:destino.alvoTipo,aplicacao:destino.aplicacao,observacao:destino.observacao,tipoNatureza:destino.tipoNatureza,efeito:destino.efeito,
          descricao:item.rotulo,armas:item.tipoAlvo==='armas'?['wakizaki','agulha']:[]}};
      if(existente){evento.alvoId=item.eventoExistenteId;delete evento.custo;delete evento.bolsa;}
      registro.eventos.push(evento);chaves.add(id);confirmadas++;
    });
    return {registro:registro,confirmadas:confirmadas,omitidas:omitidas,naoAlteraFicha:true};
  }
  return Object.freeze({versao:VERSAO,modelos:modelos,obter:obter,identificar:identificar,entradasValidas:entradasValidas,
    alvos:alvos,validarDestino:validarDestino,conciliar:conciliar,normalizar:normal});
});
