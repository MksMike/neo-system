# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versões: uma por marco (M0 = 0.1.0 …).

## [Não publicado]

### Adicionado

- Fundação do projeto: documento-âncora, guia de início, stack e convenções, 17 documentos de camada, ADRs 0001 a 0011, CLAUDE.md, modelo de PR. (2026-10-28)
- Página âncora da identidade visual (`docs/design-system.html`) e tokens (`docs/design-tokens.json`). (2026-10-28)
- `COMECE-AQUI.md`: arquivo de partida com o Super Admin v1 (módulos, licença vitalícia/mensal/anual, status e bloqueio, pagamentos do SaaS), regras R00-01 a R00-11, modelo de dados, telas e 10 tarefas para o Claude Code. (2026-10-28)
- ADR 0012: provisionamento de empresas em banco único com RLS; banco dedicado como plano pago. (2026-10-28)
- ADR 0013: hospedagem do MVP na Hostinger (Node.js) com Supabase Free em Tóquio; substitui a ADR 0005. (2026-10-28)
- ADR 0014: tarefas em segundo plano por fila no Postgres (`job`), pg_cron e cron da Hostinger, com outbox para efeitos externos. (2026-10-28)
- ADR 0015: segurança do MVP com dados só fictícios e gatilho para o nível completo de proteção de dados antes do primeiro dado real. (2026-10-28)

### Alterado

- ADR 0012 aceita: banco único com provisionamento transacional; convite do Proprietário pela fila; compromissos para o banco dedicado futuro (UUID, `company_id`, exportação por empresa). (2026-10-28)
- Documento-âncora, `docs/02` e guia de início: Vercel trocada pela Hostinger; jobs pela fila `job` em vez de Edge Functions; tabela de fases por gatilho de dados reais. (2026-10-28)
