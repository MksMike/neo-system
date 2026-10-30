---
name: mk-ui-kit
description: Use ao criar ou alterar qualquer tela, componente ou estilo de este projeto. Aplica o design definido no MK-UI Lab (tokens claro/escuro, dashboard Clássico administrativo, ícones, fontes) e monta elementos pelo código do catálogo, como drp-004 ou cal-002.
---

# MK-UI Kit

O visual deste projeto foi definido no MK-UI Lab. Os arquivos de referência estão em `design/`:

- `design/especificacao.md` — decisões de design, mapa de navegação, cores, contraste e o catálogo de elementos com código
- `design/referencia-elementos.md` — HTML de referência de cada código
- `design/tokens.json` — tokens no formato Design Tokens
- `styles/globals.css` e `styles/tailwind-theme.css` — prontos para importar

## Antes de escrever código

1. Leia as seções 1 a 5 de `design/especificacao.md`.
2. Confirme que `styles/globals.css` e `styles/tailwind-theme.css` estão importados no layout raiz, nessa ordem.
3. Use React + Tailwind v4 + Radix UI (padrão shadcn/ui) + Motion. Ícones: lucide-react com `strokeWidth={1.3}`.

## Regras

- Nunca use cores fixas. Use só as classes ligadas aos tokens (`bg-card`, `border-card-border`, `text-fg`, `text-muted`, `bg-primary text-primary-foreground`, `bg-section`, `text-icon`).
- Claro e escuro pela classe `.dark` no `<html>`. Teste toda tela nos dois modos.
- Contraste mínimo: 4,5:1 para texto e 3:1 para ícones e destaques (a seção 4 da especificação traz os valores aprovados).
- Raios: cards `rounded-card`, botões e chips `rounded-control`, campos `rounded-field`.
- Animações com `duration-[var(--speed)]` e easing `var(--ease)`; respeite `prefers-reduced-motion`.
- Números em `tabular-nums`.

## Navegação (Clássico administrativo)

Menu lateral: Árvore expansível. Menu de 240 px que recolhe para 72 px; cada item abre seus subitens logo abaixo; recolhido mostra só os ícones com dica.

- Cada item do menu pode ter 0 ou mais subitens; o item abre a tela com o título e os subitens viram abas horizontais logo abaixo do título.
- Rotas aninhadas: `/<item>/<subitem>`. O layout do item renderiza título, breadcrumb e abas; o menu lê a rota ativa.
- No celular (abaixo de 760 px) o menu lateral some; tocar no logo do canto superior esquerdo abre a gaveta com a árvore completa, e há uma barra de abas fixa na base.

## Quando pedirem um elemento pelo código

1. Procure o código (ex.: `drp-004`) na seção 7 de `design/especificacao.md` e em `design/referencia-elementos.md`.
2. Implemente o componente em `src/components/ui/` com o nome do elemento (ex.: `combobox.tsx`) e registre o código num comentário no topo do arquivo.
3. Reproduza todos os estados descritos na especificação (hover, foco, desativado, erro, carregando) e a acessibilidade (teclado, aria).
4. Reaproveite o componente se ele já existir; não duplique.

## Checklist de entrega de cada tela

- [ ] Usa só tokens; nenhuma cor hexadecimal no componente
- [ ] Funciona em claro e escuro
- [ ] Funciona em 390 px, 820 px e 1440 px
- [ ] Foco visível em todos os controles
- [ ] Elementos do catálogo citados pelo código no PR
