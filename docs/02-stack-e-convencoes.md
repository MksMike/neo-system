# Stack e convenções — NEO-SYSTEM

Versão 1.0 · 28/10/2026. Complementa o documento-âncora (seção Arquitetura) e os ADRs 0001, 0006, 0007 e 0011. Versões exatas são fixadas no `package.json` no momento do scaffold (M0) e atualizadas por PR.

## Stack

| Área | Escolha | Observação |
|---|---|---|
| Runtime | Node.js LTS (22 ou superior) | No Windows, instalar por `fnm` ou instalador oficial |
| Gerenciador e monorepo | pnpm + Turborepo | `pnpm` via `corepack enable` |
| Linguagem | TypeScript em modo `strict` | Tipos do banco gerados pelo Supabase CLI. Fixado em 6.0.x até o typescript-eslint aceitar a 7.x |
| Aplicação | Next.js (App Router), React Server Components, Server Actions | Admin, app do funcionário (PWA) e Super Admin no mesmo app |
| Estilo | Tailwind CSS v4 | Tokens do design system como variáveis CSS |
| Componentes | shadcn/ui (Radix por baixo) | Copiados para `packages/ui`, adaptados aos tokens |
| Ícones | Lucide | Um único conjunto, traço 1.75 |
| Animações | Motion (antigo Framer Motion) + transições CSS | Durações e curvas vêm dos tokens |
| Formulários | react-hook-form + Zod | O mesmo esquema Zod valida no cliente e no servidor |
| Tabelas e grade | TanStack Table (+ virtualização para a grade 勤怠表) | |
| Datas | date-fns + @date-fns/tz | Fuso Asia/Tokyo; 和暦 por utilitário próprio |
| Calendário e date picker | react-day-picker (via shadcn) | Localizado em ja/pt/es/en |
| Busca ⌘K | cmdk | |
| Notificações na tela | Sonner | Com ação "Desfazer" |
| Gráficos | Recharts (via componentes de gráfico do shadcn) | Cores dos tokens |
| Idiomas | next-intl | Arquivos de mensagem por camada |
| Banco, login, arquivos, jobs | Supabase (Postgres + RLS, Auth, Storage, Realtime, Edge Functions, pg_cron, filas) | Projeto na região de Tóquio |
| Acesso a dados | supabase-js + @supabase/ssr, consultas tipadas | Atrás de `packages/db` (regra de portabilidade) |
| Dinheiro | inteiros em iene + decimal.js para intermediários | Nunca `number` com fração |
| PDF | @react-pdf/renderer + Noto Sans JP | `packages/pdf` |
| IA | API do Claude atrás de `packages/ai` | Ver ADR 0008 |
| Testes | Vitest (unitário e golden tests), Playwright (ponta a ponta), pgTAP (RLS) | |
| Qualidade | ESLint + Prettier, TypeScript `noUncheckedIndexedAccess` | |
| Erros | Sentry | |
| CI | GitHub Actions | lint, typecheck, test, testes do banco, build |

## Estrutura do repositório

```text
NEO-SYSTEM/
├─ apps/
│  └─ web/                    Next.js
│     └─ src/
│        ├─ app/
│        │  ├─ (auth)/        login, recuperação de senha, login por PIN
│        │  ├─ admin/         painel da empresa
│        │  ├─ m/             app do funcionário (PWA, mobile first)
│        │  ├─ portal/        portal do cliente (fase 2)
│        │  └─ super/         Super Admin
│        ├─ features/         uma pasta por camada: 05-employees, 06-assignments…
│        ├─ components/       composições específicas do app
│        ├─ i18n/             mensagens ja/pt/es/en
│        └─ lib/              utilitários do app
├─ packages/
│  ├─ ui/                     design system (tokens, componentes)
│  ├─ calc/                   cálculos puros + golden tests
│  ├─ pdf/                    modelos de PDF
│  ├─ db/                     cliente Supabase, tipos gerados, camada de portabilidade
│  ├─ ai/                     serviço único de IA
│  └─ config/                 tsconfig, eslint, prettier compartilhados
├─ supabase/
│  ├─ migrations/             SQL versionado
│  ├─ seed.sql                dados de teste anônimos
│  ├─ functions/              Edge Functions
│  └─ tests/                  pgTAP
├─ docs/                      âncora, camadas, decisões, telas, legado, manual
└─ .github/                   CI e modelos de PR
```

## Convenções de código

- **Nomes:** tabelas e colunas em `snake_case` no singular do glossário (`work_entry`, `payroll_run`); TypeScript em `camelCase`; componentes em `PascalCase`; arquivos em `kebab-case`.
- **Colunas obrigatórias** em toda tabela de negócio: `id uuid`, `company_id uuid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`.
- **Configurações com vigência:** `valid_from date`, nunca sobrescrever a linha antiga.
- **Dinheiro:** colunas `*_yen bigint`; minutos: `*_minutes integer`.
- **Regras numeradas:** `R<camada>-<nº>` no documento da camada, citadas no nome do teste: `it('R10-07 multa limitada a 50% do 平均賃金 por ocorrência')`.
- **Server Actions** validam com Zod, checam permissão e registram auditoria; nunca confiam no cliente.
- **Componentes de tela** usam só `packages/ui`; estilo novo vira token ou variante, nunca CSS solto.
- **Textos** sempre por chave de i18n.
- **Acessibilidade:** botões reais, rótulos em todos os campos, foco visível, contraste AA, alvo de toque ≥ 44 px no app do funcionário.

## Ambientes

| Ambiente | Banco | App | Uso |
|---|---|---|---|
| Local | Supabase local (Docker) | `pnpm dev` | Desenvolvimento |
| Staging | Projeto Supabase separado | Prévia da Vercel por PR | Testes, demo, operação paralela |
| Produção | Supabase Pro em Tóquio | Vercel Pro (ou hospedagem Node) | Clientes; contratada no M5 |
