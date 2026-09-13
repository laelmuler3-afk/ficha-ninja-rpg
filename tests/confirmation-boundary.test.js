const assert = require('assert');
const fs = require('fs');

const core = fs.readFileSync('js/01-core.js','utf8');
const hooks = fs.readFileSync('js/21-online-hooks.js','utf8');

assert(
  core.includes('confirmada:contexto.confirmada===true'),
  'persistência local sem confirmação explícita não pode ser marcada como confirmada'
);
assert(
  hooks.includes('if(evento?.detail?.confirmada!==true) return;'),
  'realtime deve aceitar somente eventos explicitamente confirmados'
);
assert(
  core.includes('salvar({confirmada:true,origem:"manual",motivo:"salvamento-manual"})'),
  'salvamento manual confirmado precisa continuar explícito'
);
assert(
  /confirmada:\s*true,\s*origem:"campo"/.test(core),
  'confirmação dos campos data-save precisa continuar sendo commit explícito'
);


assert(
  /function persistirSemRender\(\)\{persistirEstadoLocal\(\{confirmada:true/.test(core),
  'ações confirmadas de jutsu/ataque precisam continuar entrando no realtime'
);
assert(
  /function salvarInventarioItens\(\)\{[^}]*persistirEstadoLocal\(\{confirmada:true/.test(core),
  'alterações confirmadas de inventário precisam continuar entrando no realtime'
);
assert(
  /function salvarTopicosNotas\(\)[\s\S]{0,300}persistirEstadoLocal\(\{confirmada:true/.test(core),
  'notas confirmadas precisam continuar entrando no realtime'
);

console.log('✓ limite explícito de confirmação antes do realtime passou');
