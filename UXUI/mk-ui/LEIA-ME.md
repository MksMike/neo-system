# Kit de design — este projeto

Gerado pelo MK-UI Lab. Traz o visual definido na ferramenta, uma skill e três agentes para o Claude Code montarem o projeto.

## Como usar (3 passos)

1. **Descompacte** este .zip e abra a pasta no VS Code (ou copie o conteúdo para a pasta do seu projeto).
   A pasta `.claude` fica oculta em alguns sistemas: no Mac, Cmd+Shift+. mostra arquivos ocultos; no Windows, Exibir › Itens ocultos.
2. **Abra o Claude Code nessa pasta** (terminal: `claude`, ou a extensão do VS Code).
3. **Peça:** `monte o projeto com o kit do MK-UI` — ou digite `/mk-ui-scaffold`.

Requisitos: Node.js 20 ou mais novo e o Claude Code instalado.

## O que vem no kit

- `design/especificacao.md` — decisões de design, navegação, cores, contraste e catálogo com os códigos dos elementos
- `design/referencia-elementos.md` — HTML de referência de cada código
- `design/tokens.json` — tokens claro/escuro
- `design/mk-ui-tema.json` — reabre este tema no MK-UI Lab (Temas › Importar .json)
- `styles/globals.css` e `styles/tailwind-theme.css` — prontos para importar
- `.claude/skills/mk-ui-scaffold/` — monta o projeto do zero
- `.claude/skills/mk-ui-kit/` — mantém o Claude seguindo o design em todo pedido
- `.claude/agents/mk-ui-telas.md` — cria as telas e a navegação
- `.claude/agents/mk-ui-elementos.md` — implementa elementos pelo código (ex.: `drp-004`)
- `.claude/agents/mk-ui-revisor.md` — revisa tokens, contraste, celular e acessibilidade

## Pedidos úteis depois de montar

- `use o cal-001 na tela Agenda`
- `crie a tela Financeiro › Faturas`
- `revise o projeto com o mk-ui-revisor`

## Sem Claude Code?

Anexe este .zip numa conversa no claude.ai e peça para montar o projeto a partir do kit.
