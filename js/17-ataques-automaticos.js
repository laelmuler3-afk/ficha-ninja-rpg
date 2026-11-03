/* Projetinho Shinobi 2.5.8.185 — cálculo derivado, opt-in por ataque.
 * Não grava nos campos manuais; lê compras efetivas em pontosChaveV1.
 * Regras: respostas do mestre, 02/11/2026, e PDF pp. 1-3 e 7-8.
 * Efeitos temporários, técnicas especiais e armas não confirmadas ficam fora deste módulo.
 */
(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.ShinobiAtaquesAutomaticos=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:this),function(){
  "use strict";
  function normalizar(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
  function temHabilidade(ficha,id,livro){
    if(!livro||typeof livro.resumo!=="function")return false;
    return livro.resumo(ficha).compras.some(function(c){return c.habilidadeId===id;});
  }
  function proficiente(ficha,arma,livro){
    if(!arma)return false;
    if(["desarmado","kunai","shuriken"].indexOf(arma.id)>=0)return true;
    if(livro&&typeof livro.proficiencias==="function"&&livro.proficiencias(ficha).indexOf(arma.id)>=0)return true;
    // Registros antigos pendentes NÃO são considerados comprovação automática.
    var extras=ficha&&ficha.automacaoAtaques&&ficha.automacaoAtaques.proficienciasExtras;
    return Array.isArray(extras)&&extras.some(function(p){return p&&p.armaId===arma.id&&["confirmada","validada"].indexOf(p.status)>=0;});
  }
  function configuracao(ataque,arma){
    var c=ataque&&ataque.calculoAtaque185||{};
    var props=arma&&arma.propriedades||[];
    var modo=props.indexOf("arremesso")>=0?"arremesso":arma&&arma.grupo==="distancia"?"distancia":"corpo-a-corpo";
    return {ativo:c.ativo===true,atributo:c.atributo||"",modo:c.modo||modo,empunhadura:c.empunhadura||"uma",outraArma:c.outraArma===true};
  }
  function formatarDano(base,bonus){
    if(typeof base==="number")return String(base+bonus);
    return base+(bonus>0?"+"+bonus:bonus<0?String(bonus):"");
  }
  function critico(base,bonus){
    if(typeof base==="number")return formatarDano(base,bonus);
    var m=/^(\d+)d(\d+)$/i.exec(base);
    return m?formatarDano((2*Number(m[1]))+"d"+m[2],bonus):null;
  }
  function calcular(ficha,ataque,preparacao,confirmadas,livro){
    ficha=ficha||{};ataque=ataque||{};
    var arma=preparacao&&preparacao.identificarAtaque(ataque);
    var cfg=configuracao(ataque,arma),ret={status:"pendente",motivo:"",armaId:arma&&arma.id,configuracao:cfg,proficiente:false,automatico:cfg.ativo,detalhes:[],avisos:[]};
    if(!arma||!confirmadas){ret.motivo="Arma não identificada no catálogo.";return ret;}
    var previa=confirmadas.calcularPrevia(ficha,ataque,preparacao);
    if(previa.status!=="calculado"||!previa.variantes.length){ret.motivo="Atributo ou regra da arma ainda não confirmado.";return ret;}
    var base=previa.variantes.reduce(function(melhor,v){return v.bonusAtributo>melhor.bonusAtributo?v:melhor;},previa.variantes[0]);
    if(cfg.atributo){var encontrada=previa.variantes.find(function(v){return v.atributo===cfg.atributo;});if(!encontrada){ret.motivo="Atributo não permitido para esta arma.";return ret;}base=encontrada;}
    var props=arma.propriedades||[];
    if(cfg.empunhadura==="duas"&&props.indexOf("versatil")<0&&props.indexOf("duas maos")<0){ret.motivo="A arma não permite empunhadura com duas mãos.";return ret;}
    if(props.indexOf("duas maos")>=0&&cfg.empunhadura!=="duas"){
      ret.motivo="Esta arma exige uso com duas mãos.";return ret;
    }
    if(cfg.empunhadura==="duas"&&cfg.outraArma){ret.motivo="Não é possível usar as duas mãos e empunhar outra arma ao mesmo tempo.";return ret;}
    if(cfg.modo==="arremesso"&&props.indexOf("arremesso")<0){ret.motivo="Esta arma não possui a propriedade Arremesso.";return ret;}
    if(cfg.modo==="distancia"&&arma.grupo!=="distancia"){ret.motivo="Esta arma não é uma arma de disparo à distância.";return ret;}
    if(cfg.modo==="corpo-a-corpo"&&arma.grupo==="distancia"){ret.motivo="A arma de disparo não tem ataque corpo a corpo definido.";return ret;}
    if(cfg.modo==="secundaria"){
      if(props.indexOf("pesada")>=0||props.indexOf("duas maos")>=0||cfg.empunhadura==="duas"){
        ret.motivo="Arma pesada ou de duas mãos não pode ser secundária.";return ret;
      }
      if(props.indexOf("leve")<0&&!temHabilidade(ficha,"ambidestria",livro)){
        ret.motivo="Arma secundária não leve exige Ambidestria.";return ret;
      }
      if(arma.grupo==="distancia"){ret.motivo="Ataque secundário com arma de disparo não definido.";return ret;}
    }
    if(cfg.modo==="corpo-a-corpo"&&arma.grupo==="arremessavel"&&["kunai","tanto"].indexOf(arma.id)<0){
      ret.motivo="Uso corpo a corpo desta arma de arremesso não definido pelo mestre.";return ret;
    }
    var mod=base.bonusAtributo;
    var nivelPro=confirmadas.proficienciaDoNivel(ficha.nivel);
    if(nivelPro==null){ret.motivo="Nível ou proficiência inválidos.";return ret;}
    var pro=proficiente(ficha,arma,livro);
    var bonusAcerto=mod+(pro?nivelPro:0);
    var danoBase=arma.id==="desarmado"?(normalizar(ficha.cla).indexOf("hyuuga")>=0||normalizar(ficha.cla).indexOf("hyuga")>=0?"1d4":"1d6"):
      arma.id==="wakizaki"?(cfg.empunhadura==="duas"?"1d10":"1d8"):
      arma.id==="agulha"?1:
      arma.id==="corrente"?mod*3:
      arma.id==="nunchaku"?mod*2:
      arma.dano;
    var bonusDano=typeof danoBase==="number"?0:mod;
    if(arma.id==="agulha"||normalizar(ficha.cla).indexOf("hyuuga")>=0&&arma.id==="desarmado"||normalizar(ficha.cla).indexOf("hyuga")>=0&&arma.id==="desarmado")bonusDano=0;
    if(arma.id==="desarmado"&&normalizar(ficha.cla).indexOf("aburame")>=0)bonusDano=Math.min(0,mod);
    // Ação bônus secundária: sem bônus de acerto de nenhuma fonte; atributo no dano só com o talento.
    if(cfg.modo==="secundaria"){
      bonusAcerto=0;
      if(typeof danoBase!=="number"&&arma.id!=="agulha")bonusDano=temHabilidade(ficha,"combate_com_duas_armas",livro)?mod:0;
      ret.detalhes.push("Ação bônus: sem modificadores no acerto.");
    }else{
      if(cfg.modo==="arremesso"&&temHabilidade(ficha,"pontaria",livro)){
        bonusAcerto+=2;ret.detalhes.push("Pontaria +2 no acerto.");
      }
      if(cfg.modo==="corpo-a-corpo"&&cfg.empunhadura!=="duas"&&!cfg.outraArma&&arma.id!=="desarmado"&&temHabilidade(ficha,"duelista",livro)){
        bonusDano+=2;ret.detalhes.push("Duelista +2 no dano (uma arma em uma mão).");
      }
    }
    if(arma.id==="shuriken"&&temHabilidade(ficha,"especialista_em_shuriken",livro)){
      danoBase="1d6";ret.detalhes.push("Especialista em Shuriken: dado base 1d6.");
    }
    if(arma.id==="desarmado"&&normalizar(ataque.nome).indexOf("taijutsu basico")>=0){
      bonusAcerto=0;bonusDano=0;ret.detalhes=[];ret.avisos.push("Taijutsu Básico: dois golpes como ação bônus, sem bônus de nenhuma fonte.");
    }
    ret.status="calculado";ret.proficiente=pro;ret.acerto=bonusAcerto;ret.dano=formatarDano(danoBase,bonusDano);ret.critico=critico(danoBase,bonusDano);
    ret.bonusDano=bonusDano;ret.atributo=base.atributo;ret.modo=cfg.modo;
    ret.ataquesPorAcao=1+(Number(ficha.nivel)>=11?2:Number(ficha.nivel)>=5?1:0)+(Number(ficha.nivel)>=15&&temHabilidade(ficha,"velocidade_ataque",livro)?1:0);
    ret.detalhes.unshift("Atributo "+(base.atributo?base.atributo.toUpperCase():"não aplicável")+(pro?" + proficiência":"; sem proficiência comprovada"));
    if(arma.id==="desarmado"&&normalizar(ficha.cla).indexOf("hyuuga")>=0)ret.avisos.push("Segundo golpe Hyuuga após acerto: uso da ação ainda pendente do mestre.");
    ret.avisos.push("Bônus temporários dos jutsus e situações de alvo ainda não estão ligados a este cálculo.");
    return ret;
  }
  return Object.freeze({calcular:calcular,configuracao:configuracao,temHabilidade:temHabilidade,proficiente:proficiente,versao:"2.5.8.185"});
});
