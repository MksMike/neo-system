# COMECE AQUI — NEO-SYSTEM

Ordem atual das tarefas. Siga **uma por vez**: cada tarefa tem branch própria, PR, CI verde, documento da camada atualizado e `CHANGELOG.md`.

A primeira entrega é o **Super Admin v1**, especificado em [`docs/camadas/00-plataforma.md`](docs/camadas/00-plataforma.md). As decisões de base estão nas ADRs 0012 a 0023 (`docs/decisoes/`). Esta versão substitui a de 28/10/2026, escrita antes dessas decisões.

**Desenvolvimento só local até haver telas para mostrar** (decisão do Mike, 28/10/2026). O app roda com `pnpm dev`, e o banco no Supabase local (Docker). O CI no GitHub continua testando cada PR. Servidor, banco na nuvem, deploy e backup entram juntos na tarefa SA-13, quando o dono da Sugita puder acompanhar o desenvolvimento pelo navegador.

## Agora (local)

- [x] Ferramentas: Git, Node.js 22+, pnpm, Docker Desktop, GitHub CLI.
- [x] Repositório privado no GitHub (`MksMike/neo-system`), plano gratuito (ADR 0017).
- [ ] Docker Desktop aberto antes da SA-04. O Supabase CLI entra como dependência do projeto (`pnpm supabase …`), sem instalação global.
- [ ] 覚書 assinado (o código começou antes, por decisão do Mike; continua pendente).
- [ ] Dados só fictícios até o gatilho da ADR 0015.

## Para rodar no seu computador

```bash
pnpm db:start      # Supabase local (Docker aberto)
pnpm env:local     # gera apps/web/.env.local
pnpm dev           # http://localhost:3000
```

Contas de desenvolvimento, criadas pelo seed (só existem no banco local; `pnpm db:reset` recria):

| Conta | E-mail | Senha |
| --- | --- | --- |
| Super Admin | `admin@neo.local` | `neo-local-2026` |
| Proprietário SUGITA | `dono.sugita@neo.local` | `neo-local-2026` |
| Proprietário DEMO | `dono.demo@neo.local` | `neo-local-2026` |

E-mails enviados localmente (como o convite) aparecem no Mailpit: http://127.0.0.1:55324.

## Na publicação (tarefa SA-13)

- [ ] Projeto Supabase `neo-mvp` na região Tóquio (ADR 0013).
- [ ] Hostinger plano Business, Web App Node.js no data center mais próximo do Japão, publicando a partir da branch `deploy` (ADRs 0013 e 0017).
- [ ] Subdomínio `neo-system.sugitakogyo.pro` apontando para o Web App (domínio próprio antes do SaaS comercial, ADR 0013).
- [ ] Conta no Cloudflare R2 para os backups (ADR 0017).

## Prioridade atual (decisão do Mike, 29/10/2026)

O Super Admin fica, por enquanto, com **cadastrar empresas e liberar o acesso do Proprietário** (SA-01 a SA-09, mais o convite enviado na hora). As tarefas SA-10 a SA-12 ficam **pausadas** e voltam depois do primeiro marco do sistema da empresa, que é o que o dono da Sugita precisa ver.

## Demonstração: ciclo do dia a dia (ADR 0025)

Uma fatia que funciona de ponta a ponta para mostrar ao dono da Sugita. Todas as regras transversais valem; só os campos são reduzidos. O menu segue o [mapa de funcionalidades](docs/mapa-de-funcionalidades.md).

| # | Tarefa | Entrega | Camadas |
| --- | --- | --- | --- |
| D-01 ✅ | Menu do painel | `/admin` com o menu do mapa: recolhível em ícones (expande ao passar o mouse, lembra a escolha), gaveta pelo logo no celular com animação, todas as telas com título, abas e o marco em que chegam; menu da conta no avatar (tema, cores, idioma salvo no perfil, logout) | 02, 01 |
| D-02 | Clientes, subs e locais | Lista e cadastro rápido de clientes; subcontratantes vinculados com cor e sigla; locais | 04 |
| D-03 | Funcionários | Lista e cadastro básico; criação do acesso ao app (ID de 8 dígitos + PIN) | 05, 01 |
| D-04 | Escalações | Nova escalação (cliente, sub, local, período, horário) com seleção de funcionários; calendário por escalação, mês e semana | 06 |
| D-05 | App do funcionário | `/m`: login por ID + PIN e card "Hoje" (定時 ou exceção); a confirmação aparece no calendário do escritório | 07 |
| D-06 | Dados e roteiro da demo | Dados fictícios realistas (seed) e roteiro da apresentação | — |

## Tarefas do Super Admin v1

| # | Tarefa | Entrega | ADRs |
| --- | --- | --- | --- |
| SA-01 ✅ | Monorepo | pnpm + Turborepo, `packages/config`, pacotes base. PR #2; acrescentar `packages/validation` e `packages/observability` | 0011, 0019, 0022 |
| SA-02 ✅ | CI | CI em todo PR no GitHub Actions (lint, typecheck, test, build, format, gitleaks, Semgrep, `pnpm audit`); Dependabot. Sem deploy por enquanto | 0017, 0023 |
| SA-03 ✅ | App e design system | `apps/web` com Next.js (App Router) e Tailwind v4; tokens de `docs/design-tokens.json` em `packages/ui` (6 temas); componentes shadcn/ui adaptados, incluindo as máscaras de CEP e telefone; `/dev/ui` com troca de tema e idioma (ja/pt); cabeçalhos de segurança | 0010, 0019, 0023 |
| SA-04 ✅ | Banco da plataforma | Supabase local; migrações das tabelas da seção 3 da camada 00; RLS; `anon` sem acesso e sem escrita direta; funções da seção 3; `pg_cron`; seeds de módulos e planos; pgTAP para isolamento, permissões, provisionamento que falha sem resto, R00-04, R00-06, R00-07, R00-13 a R00-17; `supabase db lint` no CI | 0012, 0014, 0016, 0018, 0020, 0023 |
| SA-05 ✅ | Base de erros e logs | Helper de ações com resposta `{ ok, code, message }`, ID da requisição, idempotência e `version`; `packages/observability` com catálogo de códigos; tabelas de eventos e métricas; rota `/api/jobs/run` (localmente, disparada por um script em vez do cron da Hostinger) | 0014, 0020, 0022 |
| SA-06 ✅ | Login | Super Admin (e-mail + senha; 2FA adiado pela ADR 0024, só `platform_admin`, 404 para os demais em `/super`); admin da empresa (e-mail + senha, 2FA para Proprietário e Gestor); `membership`; aceite do convite do Proprietário; seed local com 1 Super Admin e as empresas SUGITA (Parceiro, investidora) e DEMO (mensal); Playwright | 0016 |
| SA-07 ✅ | Shell do Super Admin | Layout de `/super` com menu (Início, Empresas, Pagamentos, Módulos e planos, Sistema), troca de tema e idioma; páginas com título e estado vazio | 0010 |
| SA-08 ✅ | Empresas: lista e cadastro | `/super/empresas` e o assistente `/super/empresas/nova` em 4 passos; `provision_company` numa Server Action; convite pela fila; testes de cadastro completo, código repetido e falha no meio | 0012, 0018, 0019 |
| SA-09 ✅ | Detalhe da empresa | `/super/empresas/[id]` com as abas; módulos com vigência e dependências; troca de contrato com vigência; histórico | 0018 |
| SA-10 ⏸ | Cobranças e status automático | `generate_saas_charges` e `recompute_company_status` diários; `/super/pagamentos`; registrar pagamento com a escolha de quitação; testes active → past_due → read_only → blocked → active | 0018 |
| SA-11 ⏸ | Suspender, cancelar e bloqueio aplicado | Suspender, reativar e cancelar com motivo (cancelar recusado para a investidora); no app da empresa, faixa de atraso, modo somente leitura e tela de bloqueio; módulo desligado responde 404; Playwright por status | 0018, 0023 |
| SA-12 ⏸ | Saúde do sistema | `/super/sistema` (Saúde, Logs, Fila, Banco) e alertas críticos no topo; rota `/api/health` | 0022 |
| SA-13 | Publicação | **Pausada: o plano atual da Hostinger da Sugita não suporta Web Apps Node.js; retomar quando o plano for atualizado (Business ou Cloud).** Workflow manual "Publicar no MVP" já existe (branch `deploy`). Falta, quando houver telas para mostrar: projeto `neo-mvp` no Supabase, Web App na Hostinger com o subdomínio, workflow de deploy (CI de novo → migrações → build → branch `deploy`), segredos, backup diário criptografado no R2 com teste de restauração mensal, monitor de disponibilidade, varredura OWASP ZAP semanal | 0013, 0017, 0023 |

## Super Admin v1 pronto quando

- você cadastra a Sugita (Parceiro, investidora) e a DEMO (mensal) pelo painel;
- liga e desliga módulos, com as dependências respeitadas;
- registra pagamentos, inclusive com 振込手数料 descontado;
- vê a DEMO cair para somente leitura quando a data avança, e voltar ao registrar o pagamento;
- a Sugita não pode ser cancelada;
- os testes provam que nenhuma empresa enxerga outra, e que módulo desligado e status sem escrita são recusados no banco.

## Pendências em aberto

- R00-14: antecedência de 10 dias para gerar a cobrança (proposta, a confirmar).
- As demais estão na seção 8 de `docs/camadas/00-plataforma.md`.
