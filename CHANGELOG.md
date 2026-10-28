# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versões: uma por marco (M0 = 0.1.0 …).

## [Não publicado]

### Adicionado

- Fundação do projeto: documento-âncora, guia de início, stack e convenções, 17 documentos de camada, ADRs 0001 a 0011, CLAUDE.md, modelo de PR. (2026-10-28)
- Página âncora da identidade visual (`docs/design-system.html`) e tokens (`docs/design-tokens.json`). (2026-10-28)
- `COMECE-AQUI.md`: arquivo de partida com o Super Admin v1 (módulos, licença vitalícia/mensal/anual, status e bloqueio, pagamentos do SaaS), regras R00-01 a R00-11, modelo de dados, telas e 10 tarefas para o Claude Code. (2026-10-28)
- ADR 0012 (proposta): provisionamento de empresas em banco único com RLS; banco dedicado como plano pago. (2026-10-28)
- Monorepo pnpm + Turborepo (tarefa 01): `packages/config` (tsconfig strict com `noUncheckedIndexedAccess`, ESLint com tipos, Prettier), pacotes `ui`, `calc`, `pdf`, `db`, `ai`, `validation` e `observability` vazios, `apps/web` reservado para a tarefa 02. Scripts `dev`, `build`, `lint`, `typecheck`, `test` e `format` na raiz. Dependências em faixas `^`, sem versões fixas. (2026-10-28)

### Alterado

- `docs/02`: as versões não são mais fixadas no `package.json`; ficam em faixas `^`. (2026-10-28)
