/* Recuperação assistida v2.5.8.174. Não envia dados nem sobrescreve fichas
 * automaticamente; a escolha do backup é sempre explícita. */
(function(){
  "use strict";
  if(window.__shinobiRecuperacaoNuvem174)return;
  window.__shinobiRecuperacaoNuvem174=true;
  var overlay=null;
  var unsubscribe=null;
  function bloqueada(){
    try{
      var nome=localStorage.getItem("ficha_ninja_ativa_v1")||"Principal";
      var chave=nome==="Principal"?"ficha_ninja_app_v2":"ficha_ninja_app_v2__"+nome;
      return window.ShinobiIntegridadeFicha?.bloqueadaPara?.(chave)===true;
    }catch(_erro){return true;}
  }
  function adicionarBotao(){
    if(!bloqueada())return;
    var aviso=document.getElementById("shinobiAvisoIntegridadeFicha");
    if(!aviso)return;
    var b=aviso.querySelector('[data-integridade="recuperar-nuvem"]');
    if(b)return;
    b=document.createElement("button");
    b.type="button";
    b.dataset.integridade="recuperar-nuvem";
    b.textContent="Recuperar da nuvem";
    b.style.cssText="background:#184a43;color:#f1fff9;border:1px solid #76c9b8;padding:8px 12px;border-radius:8px;font:700 13px system-ui;cursor:pointer";
    b.addEventListener("click",abrir);
    (aviso.querySelector("div")||aviso).appendChild(b);
  }
  function criar(tag,texto,classe){
    var el=document.createElement(tag);
    if(texto!=null)el.textContent=String(texto);
    if(classe)el.className=classe;
    return el;
  }
  function botao(texto,acao){
    var el=criar("button",texto);
    el.type="button";
    el.style.cssText="background:#1a272b;color:#f0f6f3;border:1px solid #688c91;padding:10px;border-radius:9px;cursor:pointer;font:700 14px system-ui";
    el.addEventListener("click",acao);
    return el;
  }
  function fechar(){if(unsubscribe){unsubscribe();unsubscribe=null;}if(overlay){overlay.remove();overlay=null;}}
  function escreverMensagem(texto){
    var msg=overlay?.querySelector("[data-recovery-status]");
    if(msg)msg.textContent=String(texto||"");
  }
  function desenhar(){
    if(!overlay)return;
    var corpo=overlay.querySelector("[data-recovery-list]");
    if(!corpo)return;
    corpo.replaceChildren();
    var api=window.ShinobiOnline;
    if(!api){escreverMensagem("Módulo da nuvem ainda não carregado. Aguarde e tente novamente.");return;}
    var st=api.snapshot?.()||{};
    if(!st.user||st.user.anonymous){
      escreverMensagem("Entre na mesma Conta Google usada para salvar as fichas. Nenhum dado local será substituído ao fazer login.");
      corpo.appendChild(botao("Abrir login do Google",function(){fechar();window.ShinobiOnlineUI?.abrir?.("sincronizacao");}));
      return;
    }
    var backups=(st.fichasNuvem||[]).filter(function(f){return f&&f.id;});
    escreverMensagem(backups.length?"Selecione o backup correto. A recuperação só acontece após sua confirmação.":"Procurando backups da sua conta… Se não aparecer nenhum, confira a conexão e a Conta Google.");
    backups.forEach(function(f){
      var linha=criar("div");
      linha.style.cssText="border:1px solid #394d56;border-radius:10px;padding:10px;display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap";
      var nome=criar("div");
      nome.style.cssText="flex:1;min-width:125px";
      nome.appendChild(criar("strong",f.characterName||f.name||"Ficha"));
      nome.appendChild(criar("div","Revisão "+Number(f.revision||0)+(f.updatedAt?" • "+new Date(f.updatedAt).toLocaleDateString("pt-BR"):"")));
      linha.appendChild(nome);
      linha.appendChild(botao("Restaurar",async function(){
        if(!bloqueada()){escreverMensagem("A ficha local já está acessível. A recuperação automática foi cancelada.");return;}
        if(!window.confirm("Restaurar esta ficha da nuvem neste dispositivo? A ficha será carregada somente após confirmação. Verifique o nome antes de continuar."))return;
        escreverMensagem("Restaurando a ficha selecionada…");
        try{
          await api.restaurarFichaDaNuvem(f.id,{asCopy:false});
          fechar();
          // O próprio gerenciador da nuvem dispara ficha-restaurada e recarrega.
          window.location.reload();
        }catch(erro){escreverMensagem("Não foi possível restaurar: "+String(erro?.message||erro));}
      }));
      corpo.appendChild(linha);
    });
  }
  function abrir(){
    if(!bloqueada())return;
    if(overlay)return;
    overlay=criar("div");
    overlay.id="shinobiRecuperacaoNuvem174";
    overlay.style.cssText="position:fixed;inset:0;z-index:1400;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:16px;color:#f4ede0;font:14px/1.45 system-ui";
    var painel=criar("section");
    painel.style.cssText="background:#101c22;border:1px solid #698389;border-radius:16px;padding:18px;max-width:520px;width:100%;max-height:86vh;overflow:auto;display:flex;flex-direction:column;gap:12px";
    painel.appendChild(criar("h3","Recuperar ficha da nuvem"));
    painel.appendChild(criar("p","Seus dados locais continuam protegidos. Nada será enviado à nuvem nesta tela."));
    var status=criar("p","Verificando conta…");status.dataset.recoveryStatus="1";painel.appendChild(status);
    var lista=criar("div");lista.dataset.recoveryList="1";lista.style.cssText="display:flex;flex-direction:column;gap:8px";painel.appendChild(lista);
    painel.appendChild(botao("Cancelar",fechar));
    overlay.appendChild(painel);
    document.body.appendChild(overlay);
    if(window.ShinobiOnline?.on)unsubscribe=window.ShinobiOnline.on("fichas-nuvem",desenhar);
    try{window.ShinobiOnline?.ativarBackupsNuvem?.();}catch(_erro){}
    desenhar();
  }
  function iniciar(){
    adicionarBotao();
    document.addEventListener("shinobi:app-pronto",adicionarBotao);
    window.addEventListener("pageshow",adicionarBotao);
    // O aviso pode surgir depois do carregamento dos dados no Safari.
    var alvo=document.body;
    if(alvo&&typeof MutationObserver!=="undefined"){
      var obs=new MutationObserver(function(){if(bloqueada())adicionarBotao();});
      obs.observe(alvo,{childList:true,subtree:true});
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar,{once:true});else iniciar();
})();
