#!/usr/bin/env node
/* Gera a variante ES5 usada apenas por navegadores antigos.
 * O código moderno em /js continua sendo a fonte de verdade.
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

fs.mkdirSync(JS_OUT,{recursive:true});
const polyfill=path.join(JS_OUT,"00-polyfills.js");
if(!fs.existsSync(polyfill))throw new Error("js-legacy/00-polyfills.js precisa existir antes do build.");

const manifest={version:VERSION,target:"ES5",typescript:ts.version,sources:{}};
for(const src of listarJs(JS_SRC)){
  const rel=path.relative(JS_SRC,src).replace(/\\/g,"/");
  const out=path.join(JS_OUT,rel);
  fs.mkdirSync(path.dirname(out),{recursive:true});
  const input=fs.readFileSync(src,"utf8");
  const output=transpilar(input,`js/${rel}`);
  fs.writeFileSync(out,output,"utf8");
  manifest.sources[`js/${rel}`]={sourceSha256:sha256(Buffer.from(input)),outputSha256:sha256(Buffer.from(output))};
}

const vendorSrc=path.join(ROOT,"vendor","qrcode-local.js");
const vendorOut=path.join(ROOT,"vendor","qrcode-local-legacy.js");
const vendorInput=fs.readFileSync(vendorSrc,"utf8");
const vendorOutput=transpilar(vendorInput,"vendor/qrcode-local.js");
fs.writeFileSync(vendorOut,vendorOutput,"utf8");
manifest.sources["vendor/qrcode-local.js"]={sourceSha256:sha256(Buffer.from(vendorInput)),outputSha256:sha256(Buffer.from(vendorOutput))};

const swSrc=path.join(ROOT,"service-worker.js");
const swOut=path.join(ROOT,"service-worker-legacy.js");
const swInput=fs.readFileSync(swSrc,"utf8");
const swOutput=transpilar(swInput,"service-worker.js");
fs.writeFileSync(swOut,swOutput,"utf8");
manifest.sources["service-worker.js"]={sourceSha256:sha256(Buffer.from(swInput)),outputSha256:sha256(Buffer.from(swOutput))};

fs.writeFileSync(path.join(JS_OUT,"manifest.json"),JSON.stringify(manifest,null,2)+"\n","utf8");
console.log(`Build legado ${VERSION}: ${Object.keys(manifest.sources).length} arquivos gerados com TypeScript ${ts.version}.`);
