/* Ficha Ninja RPG — polyfills mínimos para o build legado.
 * Alvo prático: Chrome/WebView 57+ e engines equivalentes em Android antigo.
 * Não substitui APIs inexistentes do sistema (câmera, WebAuthn etc.); apenas
 * normaliza APIs JavaScript/DOM usadas pelo app.
 */
(function(global){
  "use strict";

  if(!Object.assign){
    Object.assign=function(target){
      if(target==null) throw new TypeError("Object.assign target inválido");
      var out=Object(target);
      for(var i=1;i<arguments.length;i+=1){
        var src=arguments[i];
        if(src==null) continue;
        for(var key in Object(src)){
          if(Object.prototype.hasOwnProperty.call(src,key)) out[key]=src[key];
        }
      }
      return out;
    };
  }

  if(!Object.entries){
    Object.entries=function(obj){
      var keys=Object.keys(Object(obj));
      var out=[];
      for(var i=0;i<keys.length;i+=1) out.push([keys[i],obj[keys[i]]]);
      return out;
    };
  }

  if(!Object.values){
    Object.values=function(obj){
      var keys=Object.keys(Object(obj));
      var out=[];
      for(var i=0;i<keys.length;i+=1) out.push(obj[keys[i]]);
      return out;
    };
  }

  if(!Object.fromEntries){
    Object.fromEntries=function(iterable){
      var out={};
      if(iterable==null) return out;
      if(typeof iterable.forEach==="function" && !Array.isArray(iterable)){
        iterable.forEach(function(value,key){
          if(Array.isArray(value)&&value.length>=2) out[value[0]]=value[1];
          else if(arguments.length>=2) out[key]=value;
        });
        return out;
      }
      for(var i=0;i<iterable.length;i+=1){
        var entry=iterable[i];
        if(entry&&entry.length>=2) out[entry[0]]=entry[1];
      }
      return out;
    };
  }

  if(!Array.from){
    Array.from=function(value,mapFn,thisArg){
      if(value==null) throw new TypeError("Array.from requer um valor");
      var out=[];
      var len=Number(value.length);
      if(!isFinite(len)||len<0) len=0;
      for(var i=0;i<len;i+=1){
        var item=value[i];
        out.push(typeof mapFn==="function"?mapFn.call(thisArg,item,i):item);
      }
      return out;
    };
  }

  if(!Array.prototype.includes){
    Array.prototype.includes=function(search,start){
      var len=this.length>>>0;
      if(!len) return false;
      var i=Number(start)||0;
      if(i<0) i=Math.max(len+i,0);
      for(;i<len;i+=1){
        var value=this[i];
        if(value===search || (value!==value && search!==search)) return true;
      }
      return false;
    };
  }

  if(!Array.prototype.flat){
    Array.prototype.flat=function(depth){
      var maxDepth=depth===undefined?1:Number(depth)||0;
      var out=[];
      function push(value,level){
        if(Array.isArray(value)&&level<maxDepth){
          for(var i=0;i<value.length;i+=1) push(value[i],level+1);
        }else out.push(value);
      }
      for(var i=0;i<this.length;i+=1) push(this[i],0);
      return out;
    };
  }

  if(!Array.prototype.flatMap){
    Array.prototype.flatMap=function(callback,thisArg){
      var mapped=[];
      for(var i=0;i<this.length;i+=1){
        if(i in this) mapped.push(callback.call(thisArg,this[i],i,this));
      }
      return mapped.flat(1);
    };
  }

  if(!String.prototype.includes){
    String.prototype.includes=function(search,start){return this.indexOf(search,start||0)!==-1;};
  }
  if(!String.prototype.startsWith){
    String.prototype.startsWith=function(search,pos){
      pos=pos||0;
      return this.substr(pos,String(search).length)===String(search);
    };
  }
  if(!String.prototype.endsWith){
    String.prototype.endsWith=function(search,len){
      var value=String(this);
      var alvo=String(search);
      var end=len===undefined?value.length:Math.min(Number(len)||0,value.length);
      return value.substring(end-alvo.length,end)===alvo;
    };
  }
  if(!String.prototype.padStart){
    String.prototype.padStart=function(targetLength,padString){
      var value=String(this);
      var alvo=targetLength>>0;
      var pad=padString===undefined?" ":String(padString);
      if(value.length>=alvo||!pad) return value;
      var needed=alvo-value.length;
      while(pad.length<needed) pad+=pad;
      return pad.slice(0,needed)+value;
    };
  }

  if(!Number.isFinite){
    Number.isFinite=function(value){return typeof value==="number"&&isFinite(value);};
  }
  if(!Number.isNaN){
    Number.isNaN=function(value){return typeof value==="number"&&value!==value;};
  }

  if(global.Promise&&global.Promise.prototype&&!global.Promise.prototype.finally){
    global.Promise.prototype.finally=function(callback){
      var C=this.constructor||global.Promise;
      return this.then(
        function(value){return C.resolve(typeof callback==="function"?callback():undefined).then(function(){return value;});},
        function(reason){return C.resolve(typeof callback==="function"?callback():undefined).then(function(){throw reason;});}
      );
    };
  }

  if(global.Element){
    var proto=global.Element.prototype;
    if(!proto.matches) proto.matches=proto.msMatchesSelector||proto.webkitMatchesSelector;
    if(!proto.closest){
      proto.closest=function(selector){
        var node=this;
        while(node&&node.nodeType===1){
          if(node.matches&&node.matches(selector)) return node;
          node=node.parentElement||node.parentNode;
        }
        return null;
      };
    }
  }

  if(global.NodeList&&global.NodeList.prototype&&!global.NodeList.prototype.forEach){
    global.NodeList.prototype.forEach=Array.prototype.forEach;
  }

  if(typeof global.CustomEvent!=="function"){
    var CustomEventPolyfill=function(event,params){
      params=params||{bubbles:false,cancelable:false,detail:null};
      var evt=document.createEvent("CustomEvent");
      evt.initCustomEvent(event,Boolean(params.bubbles),Boolean(params.cancelable),params.detail);
      return evt;
    };
    CustomEventPolyfill.prototype=global.Event?global.Event.prototype:{};
    global.CustomEvent=CustomEventPolyfill;
  }

  if(!global.CSS) global.CSS={};
  if(!global.CSS.escape){
    global.CSS.escape=function(value){
      return String(value).replace(/[^a-zA-Z0-9_-]/g,function(ch){
        var hex=ch.charCodeAt(0).toString(16);
        return "\\\\"+hex+" ";
      });
    };
  }

  if(typeof global.requestIdleCallback!=="function"){
    global.requestIdleCallback=function(callback,options){
      var inicio=Date.now();
      var timeout=options&&Number(options.timeout)||1;
      return global.setTimeout(function(){
        callback({didTimeout:Date.now()-inicio>=timeout,timeRemaining:function(){return Math.max(0,50-(Date.now()-inicio));}});
      },1);
    };
  }
  if(typeof global.cancelIdleCallback!=="function") global.cancelIdleCallback=function(id){global.clearTimeout(id);};

  global.__shinobiLegacyPolyfillsReady=true;
})(window);
