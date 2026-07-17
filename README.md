# ficha-ninja-rpg

## v1.9.6
- Corrige o motor geral de bônus de todos os jutsus do catálogo.
- Bônus de CA, atributos, velocidade e furtividade alteram os valores da Área de Batalha.
- Bônus de ataque, dano e outros efeitos persistentes aparecem no resumo de efeitos ativos.
- Repara automaticamente efeitos incompletos de fichas antigas sem apagar personalizações adicionais.


### v1.10.0
Motor universal de efeitos estruturados na Área de Batalha.

### v1.10.3
- Fecha automaticamente o detalhe do item após uso bem-sucedido ou edição confirmada.
- Mantém o detalhe aberto quando o uso é cancelado ou falha.
- Move a exclusão para um menu de três pontos no canto superior direito.
- Mantém confirmação antes de excluir.
- Posiciona Usar e Editar lado a lado em celular e tablet.


## v1.10.4

Integra 17 novas imagens de armas e equipamentos ao reconhecimento automático do inventário.

## v1.10.7

- Compartilha o catálogo de imagens do inventário com a área de ataques.
- Usa primeiro o item do inventário vinculado ao ataque e, na ausência dele, reconhece o nome do ataque.
- Mantém o ícone de punho nos ataques desarmados.
- Exibe a imagem também no resumo, no detalhe e no campo “Item usado”.



## Catálogo visual do inventário

O botão **Adicionar item** abre todos os itens catalogados com imagem, busca e quantidade. Itens já existentes recebem a nova quantidade, evitando duplicatas. A opção **Item personalizado** preserva o cadastro manual.

## v1.10.8

- Reduz a altura do cabeçalho e dos controles do Catálogo de Jutsus.
- Mantém a pesquisa sempre visível.
- Move Elemento, Rank e Categoria para um painel retrátil.
- Mostra filtros ativos em marcadores compactos.
- Compacta e moderniza os cards, mantendo detalhes e seleção acessíveis.
- Mantém a barra de seleção fixa e horizontal no celular.

## Versão 2.0.0 — Level Up fixo sobre a base 1.10.8

- Preserva todas as correções e recursos presentes na versão 1.10.8.
- Fichas novas começam no nível 1.
- Fichas existentes são migradas mantendo o nível e todos os dados atuais.
- O nível passa a ser alterado pelo botão **Subir de nível**.
- Proficiência, Rank máximo de Jutsu, Pontos-chave, Pontos de Clã e ataques por ação acompanham a tabela de progressão.
- Características fixas são desbloqueadas cumulativamente.
- O nível 7 exige a escolha da característica de Resistência.
- PV e Chakra não são alterados nesta fase; as pendências ficam registradas para a fase 2.
- O módulo de Level Up é `js/14-level-up.js`, pois `js/13-motor-universal.js` já pertence à base 1.10.8.
