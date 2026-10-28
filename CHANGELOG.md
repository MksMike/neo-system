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
- ADR 0016: identidade e acesso. Funcionário entra com ID numérico de 8 dígitos + PIN de 4 dígitos (senha derivada no servidor, bloqueio por tentativas, sessão expira após 7 dias sem uso); um login pode estar em várias empresas; RLS por `membership` com 2FA exigido também no banco. Substitui a ADR 0004. (2026-10-28)
- ADR 0017: DevOps. CI em todo PR (lint, typecheck, test, testes de RLS com Supabase local, build); deploy pelo CI com migrações primeiro e build publicado na branch `deploy` da Hostinger; backup diário criptografado no Cloudflare R2 com teste de restauração mensal; Sentry, monitor de disponibilidade e Dependabot. Sem proteção da `main` (plano gratuito); o deploy roda o CI de novo e não publica se falhar. (2026-10-28)
- ADR 0018: modelo comercial. Contrato por cliente mensal, anual ou Parceiro (vitalício, sem receita, nunca muda de status sozinho); valor fixo em iene; módulos marcados por cliente, com planos só como modelos; pagamento por 銀行振込 ou 現金 registrado à mão; teste opcional; tolerância de 7 dias até somente leitura e mais 15 até bloqueio; suspender, reativar e cancelar com motivo; a Sugita, como investidora, não pode ser cancelada e só pode ser suspensa por motivo técnico. (2026-10-28)

### Alterado

- ADR 0012 aceita: banco único com provisionamento transacional; convite do Proprietário pela fila; compromissos para o banco dedicado futuro (UUID, `company_id`, exportação por empresa). (2026-10-28)
- Documento-âncora, `docs/02` e guia de início: Vercel trocada pela Hostinger; jobs pela fila `job` em vez de Edge Functions; tabela de fases por gatilho de dados reais. (2026-10-28)
- Documento-âncora, camada 01 e inventário de telas: login do funcionário por ID de 8 dígitos + PIN; ponto #8 das decisões marcado como resolvido. (2026-10-28)
- Documento-âncora e camada 00: regra de cobrança por funcionário ativo trocada pelo modelo da ADR 0018; pendência comercial atualizada. (2026-10-28)
