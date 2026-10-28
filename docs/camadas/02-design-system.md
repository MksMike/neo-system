# Camada 02 · Design system e interface

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R02-NN`.

## 1. Objetivo e escopo

- **Escopo:** Next.js + Tailwind + shadcn/ui, ícones Lucide, tokens de cor e tipografia, modo claro/escuro/sistema, shell do admin (menu e espaço da busca global, ativada no M3) e do app (abas inferiores), i18n, padrão de campo (ícone + rótulo + ajuda + validação), "Desfazer" em vez de confirmação.
- **Regras:** cores de status únicas no app, na grade e nos PDFs (estado Pendente âmbar; tipos 定時 azul, 半日 azul-claro, 休 cinza, 欠勤 vermelho, 中止 roxo, 休業 cinza-escuro, 有給 verde; 残業 como marcador laranja, não cor de célula); a cor primária da empresa entra só nos destaques; cantos 12–16 px; toque ≥ 44 px. Mockups de referência: [SaaS Genba — Mockups](https://claude.ai/artifact/E2etPQxYUqcZkrvK666n8K).
- **Pronto quando:** catálogo de componentes publicado, telas do M1 montadas só com eles, auditoria de contraste aprovada.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-28 | Tokens gerados de `docs/design-tokens.json` para `packages/ui/src/styles/tokens.css` por script; um teste falha se o arquivo divergir do JSON | 0010 |
| 2026-10-28 | Tema por cookie (`neo-hue`, `neo-mode`) lido pelo servidor: o HTML já sai com o tema certo, sem script inline e sem piscar; o modo "sistema" é resolvido só por CSS (`prefers-color-scheme`) | 0010, 0023 |
| 2026-10-28 | Idioma por cookie (`neo-locale`), sem prefixo na URL; sem cookie, vale o `Accept-Language`, e depois o japonês | — |
| 2026-10-28 | Componentes no padrão shadcn/ui (Radix + cva + Tailwind v4), usando só os tokens; textos sempre recebidos por props (i18n no app) | 0019 |
| 2026-10-28 | Máscaras de CEP, celular, fixo e ID do funcionário como componentes, usando as funções de `packages/validation` | 0019 |

## 3. Modelo de dados

— (camada sem tabelas)

## 4. Regras de negócio

| Regra | Texto |
| --- | --- |
| R02-01 | Nenhuma cor, raio, sombra ou tamanho fora dos tokens. Valor novo entra em `docs/design-tokens.json` e é gerado de novo (`pnpm --filter @neo/ui tokens`). |
| R02-02 | Componentes de `packages/ui` não têm texto fixo: rótulos, mensagens e nomes acessíveis chegam por props, já traduzidos. |
| R02-03 | Cor de status sempre acompanhada de texto ou ícone; células do 勤怠表 têm nome acessível com o tipo do dia. |
| R02-04 | Todo controle tem foco visível (`--focus`), estados de hover, inválido, desabilitado e carregando, e respeita `prefers-reduced-motion`. |
| R02-05 | Campos de CEP, telefone e ID usam os componentes com máscara; o servidor valida de novo com o mesmo esquema (ADR 0019). |

## 5. Telas e fluxos

- **`/dev/ui`** (só em desenvolvimento; 404 em produção): catálogo com todos os componentes e estados, troca de tema (azul, grafite, roxo × claro, escuro, sistema) e de idioma (ja, pt).
- **Componentes disponíveis:** Button (primary, solid, secondary, ghost, soft, danger; sm, md, lg; ícone; carregando), Field, Input, Textarea, NativeSelect, PostalCodeInput, MobilePhoneInput, LandlinePhoneInput, EmployeeIdInput, Checkbox, RadioGroup/Radio, Switch, Card, Stat, Badge, Chip, DayCell, Table, Alert, Toaster/toast, Tooltip, DropdownMenu, Dialog (centralizado, gaveta à direita e gaveta à esquerda para menus), Tabs (segmento e linha), SegmentedControl, Skeleton, EmptyState, Progress, Avatar, Spinner.
- **Layout de área** (SA-07): Sidebar, SidebarBrand, SidebarSection, NavItem (item ativo com `aria-current="page"` e barra em gradiente), PageHeader (título, descrição e ações) e SkipLink ("pular para o conteúdo", visível no foco). No celular, o menu lateral vira gaveta à esquerda.
- **Painel da empresa** (D-01): menu lateral recolhível em ícones (68 px), que expande sobre a página ao passar o mouse ou com o foco do teclado e lembra a escolha no cookie `neo-sidebar`; no celular, o logo abre a gaveta. Gaveta à esquerda (`drawer-start`) com animação: entra com fade-in deslizando da esquerda para a direita e sai com fade-out deslizando para a direita (`nx-drawer-in`, `nx-drawer-out`; zeradas com `prefers-reduced-motion`).
- **Abas por link** (SA-09): TabNav e TabNavItem, com o visual das abas `line`, uma URL por aba e `aria-current="page"` na atual.
- **Assistente** (SA-08): Steps (passos feitos, atual com `aria-current="step"` e próximos; no celular, só o nome do passo atual aparece).
- **Ainda não feitos** (entram quando a primeira tela precisar): calendário e seletor de data, busca ⌘K, paginação, stepper, upload, teclado do PIN, shell do admin e do app.

## 6. Permissões por papel

— (camada sem permissões próprias)

## 7. Para o usuário

- **Tema:** escolha a cor (azul, grafite ou roxo) e o modo (claro, escuro ou igual ao sistema) no topo da tela. A escolha fica salva no navegador.
- **Idioma:** japonês ou português no painel. A escolha fica salva.
- **Campos com máscara:** digite só os números; o hífen entra sozinho. Números em largura total (０９０) também são aceitos.

## 8. Pendências

- [ ] Auditoria de contraste (WCAG AA) dos 6 temas, antes das telas do M1.
- [ ] Componentes que faltam (seção 5), conforme as telas pedirem.

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
| 2026-10-28 | 0.2 | SA-03: tokens gerados, tema e idioma por cookie, componentes, máscaras, `/dev/ui`; regras R02-01 a R02-05 | SA-03 |
| 2026-10-29 | 0.3 | SA-07: componentes de layout (Sidebar, NavItem, PageHeader, SkipLink) e gaveta à esquerda | SA-07 |
| 2026-10-29 | 0.4 | SA-08: Steps (progresso de assistente) | SA-08 |
| 2026-10-29 | 0.5 | SA-09: TabNav (abas por link) | SA-09 |
| 2026-10-29 | 0.6 | D-01: menu do painel recolhível e animações da gaveta | D-01 |
