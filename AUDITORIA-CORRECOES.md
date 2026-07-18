# Auditoria técnica — Ficha Ninja RPG v2.1.1

Data: 18/07/2026

## Escopo

Revisão estrutural e dinâmica do pacote recebido para uso na mesa, cobrindo carregamento, salvamento, múltiplas fichas, progressão, Vida, Chakra, catálogo, inventário, batalha, efeitos de Jutsu, arquivos offline e atualizador.

## Correções aplicadas

1. **CA de ficha nova:** Destreza ainda não preenchida deixava a fórmula interpretar `0` como modificador `-5`, exibindo CA 7. Agora a CA permanece no valor atual/padrão até existir uma pontuação válida.
2. **Migração de nível 1:** uma ficha antiga com identidade vazia, mas com PV ou Chakra preenchidos, podia ser confundida com ficha nova. Agora recursos existentes são reconhecidos e preservados.
3. **Reparo de migração anterior:** fichas que já haviam recebido o estado `needs-level-one-setup`, mas possuem recursos, são convertidas para preservação segura sem alterar os valores.
4. **Nova ficha identificável:** fichas criadas pelo seletor passam a receber um marcador temporário, removido após a inicialização da progressão.
5. **Catálogo de Jutsus:** o observador do mostrador de Rank podia disparar continuamente ao reescrever o próprio conteúdo. A atualização agora só altera o mostrador quando o valor realmente mudou, evitando ciclo de renderização e travamento ao abrir o catálogo.
6. **Versão interna:** JavaScript, HTML, Service Worker, tabela de progressão e cache foram alinhados em 2.1.1.
7. **Textos de progressão:** descrições antigas que ainda falavam em “primeira” e “segunda fase” foram atualizadas para o sistema completo.

## Validações executadas

- Sintaxe de todos os JavaScripts.
- Validade de todos os JSONs.
- Referências de scripts, estilos, dados e arquivos do Service Worker.
- IDs duplicados no HTML.
- 153 Jutsus com IDs únicos.
- 33 itens catalogados com imagens correspondentes.
- Tabela de progressão completa dos níveis 0 a 20.
- Migração de personagem existente no nível 7.
- Três escolhas obrigatórias de Resistência no nível 7.
- Cálculo de Vida e Chakra para fichas novas e Level Up.
- Preservação de PV/Chakra gastos ao aumentar os máximos.
- Bônus de Passos do Vento e Punhos Silensiosos na batalha.
- Rank máximo no catálogo e Ataques por Ação na batalha.

## Observação

Os testes cobrem a lógica e a estrutura do pacote. Como o app depende do armazenamento e do Service Worker de cada navegador, recomenda-se abrir com internet após a publicação e manter um backup exportado antes da mesa.
