# Stack e convenções — NEO-SYSTEM

Versão 1.0 · 28/10/2026. Complementa o documento-âncora (seção Arquitetura) e os ADRs 0001, 0006, 0007 e 0011. Nenhuma versão é fixada: o `package.json` declara cada dependência com a faixa `^` da versão atual (o `pnpm add` já grava assim), e o `pnpm-lock.yaml` registra o que foi instalado. Quando uma incompatibilidade obriga a ficar numa versão maior anterior, o motivo fica anotado na tabela abaixo.

## Stack

| Área | Escolha | Observação |
|---|---|---|
| Runtime | Node.js LTS (22 ou superior) | No Windows, instalar por `fnm` ou instalador oficial |
| Gerenciador e monorepo | pnpm + Turborepo | `pnpm` via `corepack enable` |
| Linguagem | TypeScript em modo `strict` | Tipos do banco gerados pelo Supabase CLI. Na faixa `^6` até o typescript-eslint aceitar a 7.x |
| Aplicação | Next.js (App Router), React Server Components, Server Actions | Admin, app do funcionário (PWA) e Super Admin no mesmo app |
| Estilo | Tailwind CSS v4 | Tokens do design system como variáveis CSS |
| Componentes | shadcn/ui (Radix por baixo) | Copiados para `packages/ui`, adaptados aos tokens |
| Ícones | Lucide | Um único conjunto, traço 1.75 |
| Animações | Motion (antigo Framer Motion) + transições CSS | Durações e curvas vêm dos tokens |
| Formulários | react-hook-form + Zod | O mesmo esquema Zod valida no cliente e no servidor; esquemas por tipo de campo em `packages/validation` (ADR 0019) |
| Entradas | libphonenumber-js (telefone fixo e fax), DOMPurify (HTML formatado), normalização NFKC | Máscaras como componentes de `packages/ui` (ADR 0019) |
| Offline (app do funcionário) | Serwist (service worker) + Dexie (IndexedDB) | Fila de registros no celular com envio automático (ADR 0021) |
| Tabelas e grade | TanStack Table (+ virtualização para a grade 勤怠表) | |
| Datas | date-fns + @date-fns/tz | Fuso Asia/Tokyo; 和暦 por utilitário próprio |
| Calendário e date picker | react-day-picker (via shadcn) | Localizado em ja/pt/es/en |
| Busca ⌘K | cmdk | |
| Notificações na tela | Sonner | Com ação "Desfazer" |
| Gráficos | Recharts (via componentes de gráfico do shadcn) | Cores dos tokens |
| Idiomas | next-intl | Arquivos de mensagem por camada |
| Banco, login, arquivos, tempo real | Supabase (Postgres + RLS, Auth, Storage, Realtime, pg_cron) | Projeto na região de Tóquio; Free no MVP, Pro no gatilho de dados reais (ADRs 0013 e 0015) |
| Aplicação (hospedagem) | Hostinger, Web App Node.js (plano Business) | Build `standalone`; requisição até 120 s, sem processo sempre ligado nem WebSocket de entrada (ADR 0013) |
| Tarefas em segundo plano | Tabela `job` no Postgres + pg_cron + cron da Hostinger chamando `/api/jobs/run` | Outbox para efeitos externos; idempotente; Edge Functions não usadas no MVP (ADR 0014) |
| Acesso a dados | supabase-js + @supabase/ssr, consultas tipadas | Atrás de `packages/db` (regra de portabilidade) |
| Dinheiro | inteiros em iene + decimal.js para intermediários | Nunca `number` com fração |
| PDF | @react-pdf/renderer + Noto Sans JP | `packages/pdf` |
| IA | API do Claude atrás de `packages/ai` | Ver ADR 0008 |
| Testes | Vitest (unitário e golden tests), Playwright (ponta a ponta), pgTAP (RLS) | |
| Qualidade | ESLint + Prettier, TypeScript `noUncheckedIndexedAccess` | |
| Erros e logs | Sentry + logger estruturado (`packages/observability`) gravando eventos e métricas no Postgres | Códigos `ÁREA.CATEGORIA.EVENTO`; painel em `/super/sistema` (ADR 0022) |
| Segurança | Escrita só por funções SQL, `server-only`, cabeçalhos (CSP, HSTS), Semgrep, gitleaks, `supabase db lint`, OWASP ZAP semanal | ADR 0023 |
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
│  ├─ validation/             esquemas Zod por tipo de campo, normalização e máscaras (ADR 0019)
│  ├─ observability/          logger estruturado, catálogo de códigos de evento, remoção de campos proibidos (ADR 0022)
│  └─ config/                 tsconfig, eslint, prettier compartilhados
├─ supabase/
│  ├─ migrations/             SQL versionado
│  ├─ seed.sql                dados de teste anônimos
│  ├─ functions/              Edge Functions (não usadas no MVP; ADR 0014)
│  └─ tests/                  pgTAP
├─ docs/                      âncora, camadas, decisões, telas, legado, manual
└─ .github/                   CI e modelos de PR
```

## Convenções de código

- **Nomes:** tabelas e colunas em `snake_case` no singular do glossário (`work_entry`, `payroll_run`); TypeScript em `camelCase`; componentes em `PascalCase`; arquivos em `kebab-case`.
- **Colunas obrigatórias** em toda tabela de negócio: `id uuid`, `company_id uuid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `version integer` (concorrência otimista, ADR 0020). O `id` é gerado na tela quando o registro nasce lá (idempotência).
- **Configurações com vigência:** `valid_from date`, nunca sobrescrever a linha antiga.
- **Dinheiro:** colunas `*_yen bigint`; minutos: `*_minutes integer`.
- **Regras numeradas:** `R<camada>-<nº>` no documento da camada, citadas no nome do teste: `it('R10-07 multa limitada a 50% do 平均賃金 por ocorrência')`.
- **Server Actions** são criadas com `defineAction` (`apps/web/src/server/define-action.ts`): valida com o esquema de `packages/validation`, devolve `{ ok, data }` ou `{ ok: false, code, message }` com o ID da requisição, registra o evento com código do catálogo e a métrica (ADRs 0020 e 0022). Na tela, chame com `useAction` (`apps/web/src/lib/use-action.ts`): tempo limite, nova tentativa só com `idempotent: true` e alerta traduzido. Erros conhecidos: `throw new ActionError(code, detail)` de `@neo/db`.
- **Tarefas em segundo plano:** cada tipo de tarefa tem um executor em `apps/web/src/server/jobs/handlers.ts`; quem cria a tarefa usa `app.enqueue_job` no SQL (ADR 0014).
- **Entradas:** normalização NFKC, máscaras de CEP (`123-4567`) e telefone, texto sempre exibido como texto, `dangerouslySetInnerHTML` proibido, exportação CSV/Excel com fórmulas neutralizadas (ADR 0019).
- **Escrita no banco** só por funções SQL, com `search_path` fixo quando `SECURITY DEFINER`; nunca `INSERT`/`UPDATE`/`DELETE` direto do cliente (ADR 0023).
- **Logs:** todo evento com código do catálogo (`ÁREA.CATEGORIA.EVENTO`); nunca PIN, senha, token ou dado pessoal (ADR 0022).
- **Componentes de tela** usam só `packages/ui`; estilo novo vira token ou variante, nunca CSS solto.
- **Textos** sempre por chave de i18n.
- **Acessibilidade:** botões reais, rótulos em todos os campos, foco visível, contraste AA, alvo de toque ≥ 44 px no app do funcionário.

## Ambientes

| Ambiente | Banco | App | Uso |
|---|---|---|---|
| Local | Supabase local (Docker) | `pnpm dev` | Desenvolvimento |
| MVP | Projeto Supabase Free em Tóquio | Web App Node.js na Hostinger | Demonstração e testes, só com dados fictícios (ADR 0015) |
| Staging | Segundo projeto Supabase Free, quando necessário | Segundo app na Hostinger | Testar migrações antes do MVP |
| Produção | Supabase Pro em Tóquio | Hostinger, reavaliada no gatilho | Dados reais; contratada no gatilho da ADR 0015 |
