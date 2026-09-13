const assert = require('assert');
const fs = require('fs');

const core = fs.readFileSync('js/01-core.js','utf8');
const hooks = fs.readFileSync('js/21-online-hooks.js','utf8');

assert(core.includes('c.addEventListener("change",shinobiConfirmarEdicaoCampo)'), 'campos data-save precisam confirmar no change');
assert(core.includes('"Confirmar alteração?"'), 'modal de confirmação de edição ausente');
assert(core.includes('campo.dataset.shinobiValorConfirmado=novoSerializado'), 'valor confirmado não é registrado após Sim');
assert(core.includes('confirmada:true'), 'persistência confirmada precisa carregar o marcador confirmada:true');
assert(core.includes('campo:campo.dataset.save'), 'persistência confirmada precisa informar qual campo foi alterado');
assert(hooks.includes('if(evento?.detail?.confirmada===false) return;'), 'hook realtime deve ignorar alteração não confirmada');
assert(hooks.includes('camposGranulares.length&&window.ShinobiOnline.sincronizarCamposFicha'), 'hook realtime deve enviar somente campos confirmados');

console.log('✓ confirmação do usuário é o ponto de commit para a sincronização realtime');
