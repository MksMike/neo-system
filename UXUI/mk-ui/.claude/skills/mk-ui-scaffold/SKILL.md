---
name: mk-ui-scaffold
description: Use quando pedirem para criar, montar ou iniciar o front-end deste projeto a partir do kit do MK-UI Lab (pastas design/ e styles/). Monta React + Tailwind v4 + Radix + Motion com os tokens, a navegação e os códigos de elementos do kit.
---

# MK-UI Scaffold — este projeto

Monta o projeto React a partir do kit do MK-UI Lab que está nesta pasta. O kit é a fonte da verdade do visual: nunca invente cores, fontes, raios ou navegação fora dele.

## 1. Ler o kit

1. Confirme que existem `design/especificacao.md`, `design/tokens.json`, `design/mk-ui-tema.json` e `styles/globals.css`. Se faltar algo, avise e pare.
2. Leia `design/especificacao.md` (seções 1 a 5 e 7) e `design/mk-ui-tema.json`.
3. Resuma em até 8 linhas o que vai montar (dashboard, menu desktop, menu no celular, estilo, paletas, fontes) e siga sem esperar, a não ser que algo contradiga o pedido.

## 2. Criar o projeto

- Se a pasta não tem `package.json`: crie um projeto Vite + React + TypeScript numa pasta temporária (`npm create vite@latest _app -- --template react-ts`), mova o conteúdo para a raiz sem apagar `design/`, `styles/` e `.claude/`, e remova `_app`.
- Se já existe projeto (Vite ou Next), use o existente.
- Instale: `tailwindcss @tailwindcss/vite`, `react-router-dom`, `motion`, `lucide-react`, `clsx`, `tailwind-merge` e os pacotes Radix (`@radix-ui/react-dialog`, `-dropdown-menu`, `-popover`, `-tabs`, `-tooltip`, `-switch`, `-checkbox`, `-select`, `-collapsible`).
- Outras bibliotecas só quando um elemento pedido exigir (FullCalendar, Recharts, Embla, dnd-kit, lottie-react, input-otp).

## 3. Estilos

1. Mova `styles/` para `src/styles/` e importe no `main.tsx`: primeiro `globals.css`, depois `tailwind-theme.css`. Não edite os valores.
2. Tema claro/escuro pela classe `.dark` no `<html>`, com toggle salvo em `localStorage` e padrão pela preferência do sistema.
3. Só classes ligadas a tokens (`bg-bg`, `bg-card`, `border-card-border`, `text-fg`, `text-muted`, `bg-primary text-primary-foreground`, `bg-section`, `text-icon`, `rounded-card`, `rounded-control`, `rounded-field`). Nenhuma cor hexadecimal em componente.
4. Ícones `lucide-react` com `strokeWidth` igual a `--icon-stroke`.

## 4. Navegação

- `src/app/nav.ts` com o mapa da seção 1 (itens com 0 ou mais subitens) e rotas `/<item>/<subitem>`.
- `AppShell` no conceito de dashboard do kit; `PageLayout` com breadcrumb, título e os subitens em abas horizontais logo abaixo do título (Radix Tabs ligadas à rota).
- Celular (abaixo de 760 px): esconda o menu lateral; o **logo no canto superior esquerdo abre o menu** no formato descrito em "Menu no celular" (Radix Dialog, Esc e toque fora fecham, fecha ao navegar). Se houver barra de abas na base, alvos de 44 px e `env(safe-area-inset-bottom)`.
- Busca global e Ctrl/⌘+K.

## 5. Telas e elementos

- Delegue as telas ao agente `mk-ui-telas` e cada elemento pedido por código ao agente `mk-ui-elementos`.
- Ao terminar, peça ao agente `mk-ui-revisor` uma revisão e corrija o que ele apontar.

## 6. Entrega

1. `npm run build` sem erros.
2. Responda com a árvore curta de pastas, como rodar (`npm run dev`) e os próximos códigos de elementos sugeridos.
