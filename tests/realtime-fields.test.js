const assert = require('assert');
const path = require('path');

const utils = require(path.join('..','js','19-realtime-fields-utils.js'));

function test(name, fn){
  try{
    fn();
    console.log(`✓ ${name}`);
  }catch(error){
    console.error(`✗ ${name}`);
    throw error;
  }
}

test('detecta apenas campos de topo realmente alterados', ()=>{
  const antes = {pv:'100', chakra:'50', notasTopicos:[{titulo:'A',texto:'x',aberto:true}]};
  const depois = {pv:'82', chakra:'50', notasTopicos:[{titulo:'A',texto:'x',aberto:true}]};
  assert.deepStrictEqual(utils.camposAlterados(antes,depois), ['pv']);
});

test('detecta alterações independentes em PV e notas', ()=>{
  const antes = {pv:'100', notasTopicos:[{titulo:'A',texto:'x',aberto:true}]};
  const depois = {pv:'82', notasTopicos:[{titulo:'A',texto:'y',aberto:true}]};
  assert.deepStrictEqual(utils.camposAlterados(antes,depois), ['notasTopicos','pv']);
});

test('codifica e decodifica nomes inválidos para caminho Firebase', ()=>{
  const nome = 'campo.com/#$[teste] ç';
  const chave = utils.campoParaChave(nome);
  assert(!/[.#$\[\]\/]/.test(chave));
  assert.strictEqual(utils.chaveParaCampo(chave), nome);
});

test('rejeita campos locais de interface e metadados', ()=>{
  ['__online','jutsusAbertos','ataquesAbertos','scrollTop'].forEach(nome=>{
    assert.strictEqual(utils.campoPermitido(nome), false, nome);
  });
  ['pv','chakra','notasTopicos','inventarioItens','jutsus'].forEach(nome=>{
    assert.strictEqual(utils.campoPermitido(nome), true, nome);
  });
});

test('versão com editAt maior vence', ()=>{
  const atual = {editAt:100, opId:'op_z'};
  const nova = {editAt:101, opId:'op_a'};
  assert.strictEqual(utils.compararVersoes(nova, atual) > 0, true);
  assert.strictEqual(utils.compararVersoes(atual, nova) < 0, true);
});

test('opId desempata versões com mesmo editAt', ()=>{
  const a = {editAt:100, opId:'op_a'};
  const z = {editAt:100, opId:'op_z'};
  assert.strictEqual(utils.compararVersoes(z, a) > 0, true);
  assert.strictEqual(utils.compararVersoes(a, z) < 0, true);
});


test('alterar apenas o estado visual aberto da nota não gera alteração compartilhada', ()=>{
  const antes = {notasTopicos:[{id:'n1',titulo:'Pista',texto:'Kakashi',aberto:false}]};
  const depois = {notasTopicos:[{id:'n1',titulo:'Pista',texto:'Kakashi',aberto:true}]};
  assert.deepStrictEqual(utils.camposAlterados(antes,depois), []);
});

test('normalização de notas não envia estado visual aberto', ()=>{
  const nuvem = utils.normalizarValorParaNuvem('notasTopicos', [
    {id:'n1',titulo:'Pistas',texto:'Teste',aberto:true},
    {id:'n2',titulo:'NPC',texto:'Outro',aberto:false}
  ]);
  assert.deepStrictEqual(nuvem, [
    {id:'n1',titulo:'Pistas',texto:'Teste'},
    {id:'n2',titulo:'NPC',texto:'Outro'}
  ]);
});

test('aplicação remota de notas preserva aberto local por id', ()=>{
  const local = [
    {id:'n1',titulo:'Pistas',texto:'Velho',aberto:true},
    {id:'n2',titulo:'NPC',texto:'Velho',aberto:false}
  ];
  const remoto = [
    {id:'n1',titulo:'Pistas',texto:'Novo'},
    {id:'n2',titulo:'NPC',texto:'Novo 2'},
    {id:'n3',titulo:'Novo tópico',texto:'Chegou'}
  ];
  const mesclado = utils.mesclarValorRemoto('notasTopicos', remoto, local);
  assert.strictEqual(mesclado[0].aberto, true);
  assert.strictEqual(mesclado[1].aberto, false);
  assert.strictEqual(mesclado[2].aberto, false);
  assert.strictEqual(mesclado[0].texto, 'Novo');
});

console.log('Todos os testes de realtime fields passaram.');
