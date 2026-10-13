(function(g){
  if(typeof g.CustomEvent!=="function"){
    function CustomEvent(event,params){params=params||{bubbles:false,cancelable:false,detail:null};var evt=document.createEvent("CustomEvent");evt.initCustomEvent(event,params.bubbles,params.cancelable,params.detail);return evt;} CustomEvent.prototype=g.Event?g.Event.prototype:{}; g.CustomEvent=CustomEvent;
  }
  if(!Object.entries)Object.entries=function(o){var r=[],k;for(k in Object(o))if(Object.prototype.hasOwnProperty.call(o,k))r.push([k,o[k]]);return r;};
  if(!Object.values)Object.values=function(o){var r=[],k;for(k in Object(o))if(Object.prototype.hasOwnProperty.call(o,k))r.push(o[k]);return r;};
  if(!Object.fromEntries)Object.fromEntries=function(it){var o={},i,p;for(i=0;i<it.length;i++){p=it[i];o[p[0]]=p[1];}return o;};
  if(!Array.from)Array.from=function(a){return Array.prototype.slice.call(a);};
  if(!Array.prototype.includes)Array.prototype.includes=function(v){return this.indexOf(v)!==-1;};
  if(!String.prototype.includes)String.prototype.includes=function(v,p){return this.indexOf(v,p||0)!==-1;};
  if(!String.prototype.startsWith)String.prototype.startsWith=function(v,p){p=p||0;return this.substr(p,v.length)===v;};
  if(!String.prototype.endsWith)String.prototype.endsWith=function(v){return this.slice(-v.length)===v;};
  if(!Element.prototype.matches)Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector;
  if(!Element.prototype.closest)Element.prototype.closest=function(s){var el=this;while(el&&el.nodeType===1){if(el.matches(s))return el;el=el.parentElement||el.parentNode;}return null;};
  if(!g.queueMicrotask)g.queueMicrotask=function(cb){Promise.resolve().then(cb);};
  if(!g.structuredClone)g.structuredClone=function(v){if(v===undefined)return v;return JSON.parse(JSON.stringify(v));};
  if(!g.crypto)g.crypto={};
  if(!g.crypto.randomUUID)g.crypto.randomUUID=function(){var d=Date.now();return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=(d+Math.random()*16)%16|0;d=Math.floor(d/16);return(c==="x"?r:(r&3|8)).toString(16);});};
})(window);
