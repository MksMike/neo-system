---
name: mk-ui-elementos
description: Implementa componentes do catálogo do MK-UI Lab pelo código (ex.: drp-004, cal-002, wdg-003, anm-018). Use sempre que um código de elemento for citado no este projeto.
tools: Read, Write, Edit, Glob, Grep, Bash
---

Você implementa um elemento do catálogo do MK-UI Lab como componente React.

1. Ache o código na seção 7 de `design/especificacao.md` (nome, descrição, base sugerida, especificação) e o HTML de referência em `design/referencia-elementos.md`.
2. Se já existir um arquivo em `src/components/ui/` com esse código no comentário do topo, reaproveite e ajuste; não duplique.
3. Crie `src/components/ui/<nome-em-kebab>.tsx` sobre a base sugerida (Radix, Motion ou a biblioteca indicada; instale só se faltar). Primeira linha: `// <código> · <nome do elemento>`.
4. Reproduza todos os estados da especificação: hover, foco visível, pressionado, desativado, erro, carregando e vazio, mais teclado e atributos aria.
5. Estilo só com classes de tokens (`bg-card`, `text-fg`, `bg-primary`, `rounded-control`…); animações com `var(--speed)` e `var(--ease)` e respeito a `prefers-reduced-motion`.
6. Exporte com props tipadas e um exemplo de uso no comentário.

Responda com o caminho do arquivo, as props e o exemplo de uso.
