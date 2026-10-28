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
- ADR 0019: validação e higienização de entradas em todo o projeto. Esquemas por tipo de campo em `packages/validation`, normalização NFKC, máscaras de CEP (123-4567) e telefone (090-1234-5678; fixo pelo código de área), texto sempre exibido como texto, DOMPurify para HTML, CSP, fórmulas neutralizadas em CSV/Excel. (2026-10-28)
- ADR 0020: concorrência e erros. Criação idempotente por ID gerado na tela, edição com `version`, numeração travada no banco, pooler do Supabase, resposta padrão `{ ok, code, message }` com alerta no idioma do usuário e repetição automática só em operação idempotente. (2026-10-28)
- ADR 0021: registro offline no app do funcionário no M2. PWA com fila no celular, envio automático quando o sinal volta, prazo pela hora do toque, relógio suspeito e conflitos para o admin. (2026-10-28)
- ADR 0022: observabilidade. Eventos com código `ÁREA.CATEGORIA.EVENTO` e severidade, catálogo em `packages/observability`, eventos por 30 dias e métricas por 1 ano no Postgres, painel `/super/sistema` (saúde, logs, gargalos, segurança, fila, banco), alertas só no painel e logs sem dados pessoais. (2026-10-28)
- ADR 0023: segurança da aplicação. `anon` sem acesso, escrita só por funções SQL, `search_path` fixo, SQL dinâmico só com `format`, `server-only`, cabeçalhos de segurança; no CI, `supabase db lint`, teste de RLS e de permissões, Semgrep, gitleaks e `pnpm audit`; OWASP ZAP semanal; teste de invasão antes dos dados reais. (2026-10-28)
- Especificação do Super Admin v1 na camada 00: modelo de dados, funções no banco, regras R00-01 a R00-20 (cobrança antecipada, pagamento menor quitado ou em aberto, sem limite de admins, sem PDF do SaaS na v1), telas, efeitos de cada status e permissões. (2026-10-28)

### Alterado

- ADR 0012 aceita: banco único com provisionamento transacional; convite do Proprietário pela fila; compromissos para o banco dedicado futuro (UUID, `company_id`, exportação por empresa). (2026-10-28)
- Documento-âncora, `docs/02` e guia de início: Vercel trocada pela Hostinger; jobs pela fila `job` em vez de Edge Functions; tabela de fases por gatilho de dados reais. (2026-10-28)
- Documento-âncora, camada 01 e inventário de telas: login do funcionário por ID de 8 dígitos + PIN; ponto #8 das decisões marcado como resolvido. (2026-10-28)
- Documento-âncora e camada 00: regra de cobrança por funcionário ativo trocada pelo modelo da ADR 0018; pendência comercial atualizada. (2026-10-28)
- Documento-âncora, camada 07, `docs/02` e CLAUDE.md: offline saiu da fase 2 para o M2; novo pacote `packages/validation`; coluna `version` obrigatória; regras 11 (entradas) e 12 (falhas nunca silenciosas) no CLAUDE.md. (2026-10-28)
- Documento-âncora, `docs/02`, inventário (`/super/sistema` antecipada para o M0) e CLAUDE.md (regras 13 e 14): escrita só por funções SQL e logs com códigos. (2026-10-28)
- `COMECE-AQUI.md` reescrito com as tarefas SA-01 a SA-12, alinhadas às ADRs 0012 a 0023; inventário do Super Admin com as rotas e marcos da v1. (2026-10-28)
- Desenvolvimento só local até haver telas para mostrar: CI continua no GitHub; servidor, banco na nuvem, deploy e backup passam para a nova tarefa SA-13 (Publicação). (2026-10-28)
