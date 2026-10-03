#!/usr/bin/env node
/* Gera a variante ES5 usada apenas por navegadores antigos.
 * O código moderno em /js continua sendo a fonte de verdade.
 * Saídas cujo fonte não mudou são preservadas para evitar republicar dezenas
 * de arquivos a cada simples incremento de versão do app.
 */
"use strict";

const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
let ts;
try{ts=require("typescript");}
catch(erro){
  console.error("TypeScript não encontrado. Rode `npm install` antes de gerar o build legado.");
  process.exit(1);
}

const ROOT=path.resolve(__dirname,"..");
const JS_SRC=path.join(ROOT,"js");
const JS_OUT=path.join(ROOT,"js-legacy");
const VERSION=JSON.parse(fs.readFileSync(path.join(ROOT,"version.json"),"utf8")).version;
const MANIFEST_PATH=path.join(JS_OUT,"manifest.json");

function sha256(buffer){return crypto.createHash("sha256").update(buffer).digest("hex");}
function listarJs(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())return listarJs(full);
    return entry.isFile()&&entry.name.endsWith(".js")?[full]:[];
  });
}
function transpilar(codigo,nome){
  const resultado=ts.transpileModule(codigo,{
    fileName:nome,
    reportDiagnostics:true,
    compilerOptions:{
      target:ts.ScriptTarget.ES5,
      module:ts.ModuleKind.CommonJS,
      downlevelIteration:true,
      removeComments:false,
      newLine:ts.NewLineKind.LineFeed,
      sourceMap:false,
      importHelpers:false
    }
  });
  const erros=(resultado.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(erros.length){
    const texto=ts.formatDiagnosticsWithColorAndContext(erros,{
      getCurrentDirectory:()=>ROOT,
      getCanonicalFileName:f=>f,
      getNewLine:()=>"\n"
    });
    throw new Error(`Falha ao transpilar ${nome}:\n${texto}`);
  }
  return `/* GERADO AUTOMATICAMENTE — fonte: ${nome} — app ${VERSION}. Não editar. */\n${resultado.outputText}`;
}
function manifestoAnterior(){
  try{return JSON.parse(fs.readFileSync(MANIFEST_PATH,"utf8"));}
  catch(_erro){return {sources:{}};}
}
function podeReusar(registro,srcHash,out){
  if(!registro||registro.sourceSha256!==srcHash||!fs.existsSync(out))return false;
  return registro.outputSha256===sha256(fs.readFileSync(out));
}
function processar(src,out,rel,anterior,manifest){
  const input=fs.readFileSync(src,"utf8");
  const srcHash=sha256(Buffer.from(input));
  const antigo=anterior.sources&&anterior.sources[rel];
  fs.mkdirSync(path.dirname(out),{recursive:true});
  if(podeReusar(antigo,srcHash,out)){
    manifest.sources[rel]={sourceSha256:srcHash,outputSha256:antigo.outputSha256};
    return false;
  }
  const output=transpilar(input,rel);
  fs.writeFileSync(out,output,"utf8");
  manifest.sources[rel]={sourceSha256:srcHash,outputSha256:sha256(Buffer.from(output))};
  return true;
}

fs.mkdirSync(JS_OUT,{recursive:true});
const polyfill=path.join(JS_OUT,"00-polyfills.js");
if(!fs.existsSync(polyfill))throw new Error("js-legacy/00-polyfills.js precisa existir antes do build.");

const anterior=manifestoAnterior();
const manifest={version:VERSION,target:"ES5",typescript:ts.version,sources:{}};
let gerados=0,reusados=0;
for(const src of listarJs(JS_SRC)){
  const relPath=path.relative(JS_SRC,src).replace(/\\/g,"/");
  const rel=`js/${relPath}`;
  const out=path.join(JS_OUT,relPath);
  if(processar(src,out,rel,anterior,manifest))gerados+=1;else reusados+=1;
}

const vendorSrc=path.join(ROOT,"vendor","qrcode-local.js");
const vendorOut=path.join(ROOT,"vendor","qrcode-local-legacy.js");
if(processar(vendorSrc,vendorOut,"vendor/qrcode-local.js",anterior,manifest))gerados+=1;else reusados+=1;

const swSrc=path.join(ROOT,"service-worker.js");
const swOut=path.join(ROOT,"service-worker-legacy.js");
if(processar(swSrc,swOut,"service-worker.js",anterior,manifest))gerados+=1;else reusados+=1;

fs.writeFileSync(MANIFEST_PATH,JSON.stringify(manifest,null,2)+"\n","utf8");
console.log(`Build legado ${VERSION}: ${gerados} gerado(s), ${reusados} preservado(s), TypeScript ${ts.version}.`);
