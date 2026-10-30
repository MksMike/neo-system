# ADR 0026 — Identidade visual MK-UI (Futurista · Órbita)

- **Status:** Aceita
- **Data:** 2026-10-30
- **Decisores:** Mike
- **Relação:** substitui, como fonte da identidade visual, `docs/design-system.html` e `docs/design-tokens.json` (camada 02; CLAUDE.md, fonte de verdade nº 5)

## Contexto

O Mike decidiu trocar o visual do sistema inteiro e entregou o kit MK-UI em `UXUI/mk-ui` (especificação em `UXUI/mk-ui/design/especificacao.md`). O protótipo do dashboard e da navegação foi aprovado em 2026-10-30.

## Decisão

- **A fonte da identidade visual passa a ser o kit MK-UI**, no estilo "Futurista · Animado" com a paleta Órbita (claro e escuro), Noto Sans JP e IBM Plex Mono, cantoneiras nos cards, brilho e grade no fundo.
- **Paleta única.** O seletor de matiz sai do menu da conta e do login, e fica só o modo claro, escuro ou do sistema.
- **Implementação por remapeamento:** `packages/ui/src/styles/mk-ui.css` dá novos valores aos mesmos tokens semânticos (`--surface-*`, `--ink-*`, `--primary-*` …). As telas existentes mudam sem alterar componente por componente.
- **Formas:** botões em pílula, cards com raio de 14 px e campos com raio de 10 px.
- **Títulos:** o título da página fica em negrito e caixa alta, e não há trilha de navegação (breadcrumb).
- **Navegação:**
  - no computador, o menu lateral se expande ao passar o mouse e se contrai, mostrando só os ícones, quando o mouse sai;
  - no celular, o menu abre pelo logo e há uma barra inferior com as seções principais e "Menu".

## Consequências

- `docs/design-system.html` e `docs/design-tokens.json` ficam como histórico até serem regenerados a partir do kit.
- A regra "nada de cor, raio ou sombra fora dos tokens" continua valendo, agora com os tokens do kit.
