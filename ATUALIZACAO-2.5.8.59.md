# Atualização 2.5.8.59 — correção de resposta do menu lateral

## Problema observado
No Android/PWA, tocar nos atalhos de Sincronização, Conta ou Sala fechava o drawer lateral e podia deixar a ficha visível novamente, sem apresentar o painel de destino.

## Correções
- O painel Online agora é aberto e confirmado antes de fechar o drawer.
- O menu aguarda brevemente a API Online quando ela ainda está terminando de inicializar.
- A API `ShinobiOnlineUI` é exposta antes da inicialização dos recursos secundários.
- Falhas de renderização do painel Online passam a manter um painel visível com opção de nova tentativa.
- Eventos `pointer`/`touch` do painel lateral não vazam para a ficha atrás do drawer.
- Backdrop e painel receberam camadas explícitas para eliminar ambiguidades de toque.
- Configurações permanece dentro do drawer e não participa da lógica antiga de clique-fora.
- `toggleConfigMenu()` legado redireciona para o submenu novo quando o menu já foi migrado.

## Firebase
Nenhuma mudança de regras do Firebase é necessária.
