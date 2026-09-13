const {spawnSync} = require('child_process');
const path = require('path');

const raiz = path.resolve(__dirname,'..');

function executar(comando,args,rotulo){
  console.log(`\n=== ${rotulo} ===`);
  const resultado=spawnSync(comando,args,{cwd:raiz,stdio:'inherit'});
  if(resultado.error) return {ok:false,error:resultado.error};
  return {ok:resultado.status===0,status:resultado.status};
}

const etapas=[
  [process.execPath,['tests/realtime-fields.test.js'],'Utilitários de campos'],
  [process.execPath,['tests/realtime-core-contract.test.js'],'Contrato estrutural realtime'],
  [process.execPath,['tests/backup-realtime-separation.test.js'],'Separação backup / realtime'],
  [process.execPath,['tests/confirmation-realtime-contract.test.js'],'Confirmação antes do realtime'],
  [process.execPath,['tests/realtime-bootstrap-batching.test.js'],'Bootstrap realtime consolidado'],
  [process.execPath,['tests/realtime-two-devices.test.js'],'Simulação de dois dispositivos'],
  [process.execPath,['tests/auto-backup-server.test.js'],'Reconstrução do backup automático'],
  [process.execPath,['tests/auto-backup-function-contract.test.js'],'Contrato da função de backup diário']
];

for(const [comando,args,rotulo] of etapas){
  const resultado=executar(comando,args,rotulo);
  if(!resultado.ok) process.exit(resultado.status||1);
}

let projeto=executar('python3',['tools/verificar-projeto.py'],'Verificação geral do projeto');
if(!projeto.ok&&projeto.error?.code==='ENOENT'){
  projeto=executar('python',['tools/verificar-projeto.py'],'Verificação geral do projeto');
}
if(!projeto.ok) process.exit(projeto.status||1);

console.log('\n✓ Suíte de sincronização concluída sem falhas.');
