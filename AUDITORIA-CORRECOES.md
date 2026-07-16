# Auditoria técnica — Ficha Ninja RPG v1.9.6

Data da revisão: 16/07/2026

## Objetivo desta correção

A revisão anterior tratou o bônus de CA como se a falha estivesse ligada a um jutsu específico. Esse diagnóstico estava incompleto. A v1.9.6 revisa o **motor geral de efeitos dos jutsus**, para que o comportamento não dependa do nome de uma técnica.

Ao pressionar **Usar jutsu**, todo efeito persistente cadastrado deve ser registrado na Área de Batalha. Bônus numéricos compatíveis devem alterar imediatamente CA, atributos, velocidade ou furtividade; bônus de ataque, dano e outros efeitos persistentes devem permanecer visíveis no resumo de efeitos ativos.

## Causas reais encontradas

1. **Condições válidas bloqueavam bônus silenciosamente**
   - O motor aceitava apenas uma condição genérica de ataque.
   - Efeitos como bônus de CA contra ataques à distância podiam ser descartados, apesar de estarem corretamente cadastrados.

2. **Efeitos acumuláveis perdiam a referência da lista ativa**
   - Ao usar um jutsu que permite várias instâncias, a lista de efeitos era reconstruída durante o mesmo processamento.
   - O novo bônus era inserido em uma referência antiga e desaparecia antes de chegar à Área de Batalha.

3. **A aplicação dependia de módulos intermediários**
   - Parte dos efeitos só era aplicada porque outro módulo envolvia a função de uso do jutsu.
   - Alterações na ordem de carregamento podiam impedir o registro sem apresentar erro visível.

4. **Fichas antigas podiam substituir o catálogo atual**
   - Um jutsu salvo com efeitos editados manualmente podia manter uma definição antiga ou incompleta.
   - A versão local acabava suprimindo bônus oficiais do catálogo.

5. **Efeitos fora de CA, atributos, velocidade e furtividade não tinham resumo geral**
   - Bônus de ataque, dano, ações, alcance e outros efeitos persistentes podiam existir no estado interno sem ficarem claros para o jogador.

6. **Leitura de descrições antigas era limitada**
   - Jutsus criados manualmente ou salvos em versões anteriores podiam usar formatos como “a CA aumenta em +1”, que não eram reconhecidos de forma consistente.

## Correções aplicadas

- A função principal **Usar jutsu** chama diretamente o motor de efeitos da batalha.
- O cálculo da CA consulta diretamente os bônus ativos dos jutsus.
- Modificadores de atributos consultam diretamente os efeitos ativos.
- Velocidade consulta bônus e multiplicadores dos jutsus sem depender de um wrapper externo.
- Furtividade permanece integrada ao mesmo motor de modificadores.
- Condições de escopo, como “contra ataques à distância”, não eliminam mais o bônus; o escopo fica descrito no efeito ativo.
- Condições que dependem de um acontecimento, como resultado obtido ou ataque escolhido, são confirmadas antes da ativação numérica em vez de serem descartadas silenciosamente.
- A lista de efeitos ativos agora mantém a mesma referência durante o processamento, corrigindo jutsus acumuláveis.
- Os efeitos oficiais do catálogo voltam a ser a fonte principal. Personalizações adicionais do usuário são preservadas, mas não removem bônus obrigatórios.
- A migração de fichas antigas recompõe automaticamente efeitos oficiais incompletos.
- O leitor de descrições antigas reconhece mais formas de escrever bônus de CA, atributos, velocidade e furtividade.
- A Área de Batalha ganhou a seção **Outros bônus ativos**, usada para ataque, dano e demais efeitos persistentes que não correspondem a um campo numérico principal.
- Remover ou encerrar um efeito recalcula imediatamente os valores da batalha.
- O cache e todos os recursos foram versionados como `1.9.6` para impedir mistura com código anterior.

## Validação integral do catálogo

- **153 jutsus do catálogo** foram carregados e comparados com **153 definições de efeitos**.
- Todos os 153 fluxos de uso foram executados pelo motor sem erro de JavaScript.
- **29 modificadores numéricos automáticos diretos** foram testados individualmente, incluindo:
  - CA;
  - Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma;
  - velocidade fixa, bônus de velocidade e multiplicação de velocidade;
  - furtividade;
  - escolhas de efeito;
  - condições de escopo;
  - efeitos acumuláveis.
- O jutsu acumulável foi usado repetidamente e manteve as instâncias ativas.
- Um jutsu antigo com nome divergente e marcação de edição manual foi reparado e voltou a aplicar seus bônus oficiais.
- Uma descrição manual contendo “sua CA aumenta em +1” foi interpretada e alterou uma CA base 18 para 19.
- Bônus persistentes de ataque e dano foram exibidos em **Outros bônus ativos**.
- Ao remover o efeito, a CA retornou ao valor anterior.

## Testes de integração

- Todos os módulos principais foram carregados juntos no ambiente de teste.
- Foram testados exemplos de:
  - bônus direto de CA;
  - bônus de CA condicionado;
  - bônus acumulável escolhido pelo jogador;
  - velocidade aumentada;
  - multiplicação de velocidade;
  - efeitos antigos reparados automaticamente.
- Nenhum erro de execução foi registrado no conjunto integrado.
- Sintaxe validada em todos os arquivos JavaScript e no service worker.
- Todos os JSON foram analisados sem erro.
- Referências de arquivos do HTML foram verificadas; nenhum recurso obrigatório está ausente.
- Responsividade conferida em 320, 390, 768 e 1024 px, sem estouro horizontal do documento.

## Comportamento esperado

Exemplo: personagem com CA 18 usa um jutsu que concede `+1 de CA`.

1. O chakra é consumido conforme o jutsu.
2. O efeito aparece imediatamente na Área de Batalha.
3. A CA exibida passa para 19.
4. Ao encerrar/remover o efeito, a CA volta para 18.

Quando o bônus possuir um escopo, como “contra ataques à distância”, o valor é aplicado e o card informa essa limitação. Quando o bônus depender de um gatilho que ainda pode não ter acontecido, o aplicativo pergunta se a condição foi atendida.

## Limite da automação

Efeitos puramente narrativos, reações contra um alvo específico ou decisões que dependem do resultado da mesa continuam aparecendo como efeitos ativos, mas não podem alterar automaticamente um número quando não existe um campo correspondente ou quando a decisão cabe ao mestre/jogador. Eles não são mais ocultados.


## v1.10.0 — Motor universal de efeitos

- Agregação independente do nome do jutsu.
- Suporte mecânico para bônus, multiplicadores, dados extras, vantagens, desvantagens, resistências, imunidades, vulnerabilidades, condições e ações extras.
- Efeitos destinados ao alvo permanecem registrados sem alterar a ficha do usuário.
- Novo painel “Efeitos mecânicos ativos” na Área de Batalha.
