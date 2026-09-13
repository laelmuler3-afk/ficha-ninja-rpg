# Ficha Ninja RPG — 2.5.8.66

## Correção de estabilidade do realtime

Esta versão corrige uma regressão introduzida pelo bootstrap da sincronização granular da 2.5.8.65.

### Causa encontrada

O listener `child_added` do Firebase é disparado uma vez para cada campo já existente quando a ficha começa a ser observada. A implementação anterior tratava cada callback como uma atualização isolada e, para cada campo, relia e regravava a ficha inteira no `localStorage`, percorria os campos da interface e emitia um novo evento de atualização. Em fichas grandes isso criava uma rajada de trabalho no carregamento/reconexão, especialmente pesada para tablets e navegadores móveis.

### Correção

- O snapshot inicial dos campos agora é aplicado como um único lote.
- A ficha é persistida uma única vez durante o bootstrap, em vez de uma vez por campo.
- As versões dos campos são registradas em conjunto.
- A interface é atualizada uma única vez por grupo de alterações.
- Eventos que chegarem enquanto o bootstrap está em andamento ficam em buffer e são reconciliados depois pelo mesmo controle de versão, evitando perda de alterações concorrentes.
- O recebimento remoto deixou de chamar a rotina que recalcula **e persiste** CA, evitando eco desnecessário de sincronização.

### Teste de regressão

Foi adicionado `tests/realtime-bootstrap-batching.test.js`. No cenário de teste com 70 campos sincronizados, a implementação antiga executava **70 gravações da ficha** durante a entrada do segundo dispositivo. A correção reduz esse bootstrap para **1 gravação e 1 evento consolidado**, mantendo os testes de dois dispositivos, fila offline e latest-write-wins aprovados.

Não há mudança nas regras do Firebase nesta versão.
