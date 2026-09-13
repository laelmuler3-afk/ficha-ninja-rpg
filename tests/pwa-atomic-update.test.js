const assert = require('assert');
const fs = require('fs');

const sw = fs.readFileSync('service-worker.js','utf8');
const updater = fs.readFileSync('js/08-update.js','utf8');

assert(
  sw.includes('event.respondWith(abrirPaginaDaVersaoAtiva(request))'),
  'navegação deve ser atendida pelo shell da versão ativa, não por HTML novo da rede'
);
assert(
  sw.includes('event.respondWith(buscarShellDaVersaoAtiva(request))'),
  'recursos do app shell devem vir do cache imutável da versão ativa'
);
assert(
  !sw.includes('event.respondWith(mutavel?buscarCodigoAtualizado(request):buscarShellNoCache(request))'),
  'worker ativo não pode misturar JS/CSS/JSON novos com HTML/cache da versão anterior'
);
assert(
  updater.includes('async function obterVersaoInstaladaEfetiva()'),
  'atualizador precisa consultar a versão do Service Worker que realmente controla a página'
);
assert(
  updater.includes('const versaoInstalada=await obterVersaoInstaladaEfetiva();'),
  'verificação precisa comparar version.json com a versão efetivamente instalada'
);
assert(
  updater.includes('const temAtualizacao=Boolean(remota&&compararVersoes(remota,versaoInstalada)>0);'),
  'decisão de atualização deve usar a versão efetivamente instalada'
);

console.log('✓ contrato de atualização PWA atômica passou');
