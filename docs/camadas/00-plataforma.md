# Camada 00 · Plataforma

> Documento de referência da camada. Fonte: ADRs 0012 a 0023 e `docs/00-ancora.md`. Regras numeradas `R00-NN`, citadas nos testes. Esta versão especifica o **Super Admin v1**, a primeira entrega do sistema.

## 1. Objetivo e escopo

O Super Admin é o painel do dono do SaaS (Mike). Nele ele cadastra empresas clientes, escolhe os módulos de cada uma, define o contrato, registra pagamentos, suspende ou cancela o acesso e acompanha a saúde do sistema.

**Entra no Super Admin v1:**

- Login próprio, só para quem está em `platform_admin`, com 2FA obrigatório (ADR 0016).
- Início: empresas por status, receita do mês, cobranças vencendo e em atraso, parceiros, alertas críticos.
- Cadastro de empresa em 4 passos, com provisionamento transacional (ADR 0012).
- Detalhe da empresa: dados, módulos, contrato e pagamentos, usuários e histórico.
- Cobranças geradas automaticamente (mensal e anual, antecipadas) e registro manual de pagamento.
- Status automático por atraso; suspender, reativar e cancelar com motivo (ADR 0018).
- Bloqueio aplicado de verdade: o servidor e o banco recusam o que o status e os módulos não permitem.
- Painel de saúde do sistema `/super/sistema` (ADR 0022), na versão base.

**Fica para depois:**

- Emissão de 請求書 e 領収書 do SaaS em PDF (depende da camada 08).
- Cobrança automática por cartão ou débito (gateway, fase 3).
- Limite de admins por contrato e preço por funcionário ativo (SaaS comercial).
- Acesso de suporte com permissão da empresa (R00-10; antes do primeiro cliente além dos parceiros).
- Uso de IA e cotas (fase 2) e tabelas legais (M4).

**Pronto quando:**

- o Mike cadastra a Sugita (Parceiro, investidora) e uma empresa DEMO (mensal) pelo painel;
- liga e desliga módulos, e as dependências são respeitadas;
- registra pagamentos, inclusive com 振込手数料 descontado;
- vê a DEMO cair para somente leitura quando a data avança e voltar a ativa ao registrar o pagamento;
- a Sugita não pode ser cancelada;
- os testes provam que nenhuma empresa enxerga outra e que módulo desligado e status sem escrita são recusados no banco.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-28 | Provisionamento de empresas em banco único com RLS; banco dedicado como plano pago; convite pela fila | 0012 |
| 2026-10-28 | Hospedagem do MVP: Hostinger + Supabase Free em Tóquio | 0013 |
| 2026-10-28 | Tarefas em segundo plano por fila `job` e cron; outbox para efeitos externos | 0014 |
| 2026-10-28 | MVP só com dados fictícios; gatilho para dados reais | 0015 |
| 2026-10-28 | Identidade: Super Admin e admins com 2FA; RLS por `membership` | 0016 |
| 2026-10-28 | Modelo comercial: contrato mensal, anual ou Parceiro (vitalício, sem receita); valor fixo; módulos por cliente; 銀行振込 e 現金; teste opcional; tolerância 7 + 15 dias; suspender, reativar e cancelar com motivo; Sugita como investidora, sem cancelamento | 0018 |
| 2026-10-28 | Entradas validadas por tipo; erros com código e alerta; escrita só por funções SQL; eventos com código no painel | 0019, 0020, 0022, 0023 |
| 2026-10-28 | Cobrança antecipada; pagamento menor quitado ou deixado em aberto por decisão do Super Admin; sem limite de admins no MVP; sem PDF do SaaS na v1 | Este documento (R00-14 a R00-19) |

## 3. Modelo de dados

Convenções do documento 02: nomes em inglês, `snake_case` no singular. Toda tabela tem `id uuid` (gerado na tela quando o registro nasce lá), `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at` e `version`, além de gatilho de auditoria. Valores em iene como `bigint` (`*_yen`); datas de negócio como `date` em Asia/Tokyo.

### Tabelas

| Tabela | Campos principais | Observação |
| --- | --- | --- |
| `platform_admin` | `user_id`, `name`, `is_active` | Quem é Super Admin |
| `company` | `code` (único), `legal_name`, `legal_name_kana`, `display_name`, `invoice_reg_no`, `postal_code`, `address`, `phone`, `email`, `status`, `status_locked`, `status_reason`, `is_investor`, `referred_by_company_id`, `canceled_on`, `timezone`, `default_locale` | `status_locked` = suspensão manual em vigor; `is_investor` só muda por migração (R00-13) |
| `module` | `key` (pk), `name_ja`, `name_pt`, `kind` (`base`, `optional`, `addon`), `depends_on text[]` (todas), `depends_any text[]` (pelo menos uma, ex.: financeiro precisa de faturamento ou folha), `sort_order` | Catálogo, via seed |
| `plan_template` | `key`, `name_ja`, `name_pt`, `module_keys text[]` | Básico, Padrão, Completo: só pré-marcam módulos |
| `company_module` | `company_id`, `module_key`, `valid_from`, `valid_to`, `note` | Uma linha por período em que um módulo opcional está ligado; os base estão sempre ligados (R00-05) |
| `contract` | `company_id`, `type` (`monthly`, `annual`, `partner`), `price_yen`, `payment_method` (`transfer`, `cash`), `starts_on`, `trial_ends_on`, `billing_start` (início do primeiro período pago, dia ≤ 28), `paid_until`, `grace_days` (7), `block_after_days` (15), `valid_from`, `valid_to`, `note` | Uma linha por versão; a atual é a sem `valid_to` |
| `saas_charge` | `company_id`, `contract_id`, `period_start`, `period_end`, `due_on`, `amount_yen`, `paid_yen`, `fee_yen`, `status` (`open`, `partial`, `paid`, `canceled`) | Uma cobrança por período |
| `saas_payment` | `company_id`, `charge_id`, `paid_on`, `amount_yen`, `method`, `reference`, `receipt_path`, `settlement` (`full`, `settle_with_fee`, `leave_open`), `note` | Comprovante opcional no Storage privado |
| `company_status_event` | `company_id`, `from_status`, `to_status`, `reason`, `source` (`auto`, `manual`), `actor_id` | Toda mudança de status |
| `platform_audit_log` | `actor_id`, `action`, `company_id`, `payload jsonb`, `request_id` | Ações do Super Admin (quem fez o quê) |
| `user_profile` | `user_id`, `display_name`, `locale`, `login_kind` (`email`, `pin`), `employee_login_id` (8 dígitos, único, só para PIN) | Camada 01 (ADR 0016) |
| `membership` | `user_id`, `company_id`, `role` (`owner`, `manager`, `coordinator`, `employee`), `status`, `valid_until` | Camada 01 (ADR 0016) |
| `owner_invitation` | `company_id`, `email`, `name`, `status` (`pending`, `sent`, `accepted`, `failed`), `job_id` | Convite do Proprietário pela fila |
| `platform_setting` | `key`, `value`, `description` | Configurações da plataforma. `require_mfa` liga o 2FA (ADR 0024); sem a linha, o 2FA é exigido |
| `job` | Ver ADR 0014 | Fila de tarefas |
| `app.audit_log` | `actor_id`, `scope`, `table_name`, `record_id`, `company_id`, `action`, `old_row`, `new_row` | Gatilho em toda tabela: antes e depois de cada mudança (CLAUDE.md, regra 5). Schema privado, fora da API |
| `system_event` | `at`, `code` (`ÁREA.CATEGORIA.EVENTO`), `severity`, `request_id`, `route`, `company_id`, `user_id`, `duration_ms`, `data`, `seen_at` | Eventos (ADR 0022): particionada por mês, guardada 30 dias; `seen_at` marca alerta crítico como visto |
| `metric_minute`, `metric_hour` | `bucket`, `kind` (`request`, `job`), `name`, `count`, `error_count`, `total_ms`, `max_ms`, `histogram` | Métricas por minuto (7 dias) e por hora (1 ano), com histograma de latência para o p95 |
| `login_throttle` | `key`, `failed_count`, `locked_until`, `window_start` | Bloqueio por tentativas (ADR 0016) |

As tabelas `platform_*`, `module`, `plan_template`, `contract`, `saas_*`, `company_status_event`, `owner_invitation`, `system_event`, `metric_minute` e `metric_hour` são da plataforma: só o Super Admin lê e escreve. A empresa vê apenas o próprio status, módulos e vencimento, por função.

### Catálogo de módulos (seed)

| Chave | Módulo | Tipo | Depende de |
| --- | --- | --- | --- |
| `platform` | Plataforma, login e permissões | Base | — |
| `settings` | Configurações da empresa | Base | — |
| `organizations` | Clientes, subs e locais | Opcional | — |
| `employees` | Funcionários | Opcional | — |
| `scheduling` | Escalação e calendário | Opcional | `organizations`, `employees` |
| `attendance` | Apontamento e confirmação diária (com offline) | Opcional | `scheduling` |
| `documents` | Documentos, PDFs e biblioteca | Opcional | — |
| `billing` | Fechamento e 請求書 | Opcional | `attendance`, `documents` |
| `payroll` | Folha, pagamentos e vales | Opcional | `attendance`, `documents` |
| `finance` | Financeiro, caixa e despesas | Opcional | `billing` ou `payroll` |
| `messaging` | Comunicação, e-mail e alertas | Opcional | — |
| `internal` | Gestão interna (tarefas, 日報) | Opcional | `employees`, `messaging` |
| `learning` | Aprendizado (japonês de genba) | Opcional | `employees` |
| `reports` | Dashboard e relatórios | Opcional | — |
| `ai` | Assistente de IA | Add-on | — |
| `bank_sync` | Extrato bancário automático | Add-on | `finance` |

### Funções no banco

Toda escrita passa por estas funções (ADR 0023). Cada uma confere `is_platform_admin()` com sessão `aal2`, valida os dados, grava a auditoria e devolve erro com código (ADR 0020).

| Função | O que faz |
| --- | --- |
| `provision_company(data jsonb) → uuid` | Uma transação: empresa, contrato, módulos (com dependências), configurações padrão, papéis, convite do Proprietário na fila, log (R00-02) |
| `set_company_modules(company_id, modules, valid_from)` | Liga e desliga módulos com vigência, aplicando R00-04 |
| `change_contract(company_id, data, valid_from)` | Cria nova versão do contrato; a anterior fecha em `valid_from - 1` |
| `register_saas_payment(charge_id, data)` | Grava o pagamento, aplica a escolha de quitação (R00-16), avança `paid_until` (R00-07) e reativa a empresa |
| `suspend_company(company_id, reason)` / `reactivate_company(company_id, reason)` | Suspensão manual com trava do status automático (R00-08) |
| `cancel_company(company_id, reason, effective_on)` | Cancela com efeito imediato ou na data; recusa empresa investidora (R00-13) |
| `generate_saas_charges()` | Diário (`pg_cron`): gera as cobranças do próximo período (R00-14) |
| `recompute_company_status()` | Diário, 03:00 de Tóquio: recalcula o status pelos vencimentos (R00-15) |
| `has_module(company_id, module_key) → boolean` | Usada nas políticas e funções de cada módulo (R00-03) |
| `company_can_write(company_id) → boolean` | Falsa em `read_only`, `blocked` e `canceled` (R00-06) |
| `my_company_access(company_id)` | Para o app da empresa: status, módulos ligados, aviso de atraso |
| `claim_jobs(limit, lock_seconds)` / `complete_job(id)` / `fail_job(id, error)` | Fila (ADR 0014): pega tarefas com `SKIP LOCKED`, conclui, ou falha com nova tentativa espaçada (1, 2, 4… min, até 60) até `max_attempts`. Só o servidor (`service_role`) |
| `retry_job(id)` | Super Admin reexecuta uma tarefa que falhou |
| `ingest_observability(events, metrics)` | O logger do servidor grava eventos e métricas em lote. Só `service_role` |
| `mark_events_seen(ids)` | Super Admin marca alertas críticos como vistos |
| `accept_owner_invitation(invitation_id)` | O convidado aceita: só o e-mail convidado; cria perfil e participação de Proprietário (SA-06) |
| `my_session()` | A pessoa logada: é Super Admin? Em quais empresas e com qual papel? Decide para onde ela vai depois do login |

## 4. Regras de negócio

| Regra | Texto |
| --- | --- |
| R00-01 | Toda empresa tem um código único, curto (3 a 12 caracteres), só com letras maiúsculas e números (ex.: `SUGITA`), sugerido a partir do nome. É o identificador da empresa no Super Admin; não é usado no login do funcionário (ADR 0016). |
| R00-02 | O provisionamento é uma transação: ou cria empresa, contrato, módulos, configurações, papéis, convite (na fila) e log, ou não cria nada. Efeitos externos (login do Proprietário, e-mail) só acontecem depois da confirmação, pela fila. |
| R00-03 | Módulo desligado é recusado no servidor e no banco (`has_module`), não só escondido no menu. A rota do módulo responde 404. |
| R00-04 | Ligar um módulo liga as dependências, avisando quais. Desligar um módulo de que outro ligado depende é recusado, com a lista dos dependentes. |
| R00-05 | Mudanças de módulo e de contrato têm data de vigência e ficam no histórico; o passado não é reescrito. Cobranças já geradas não mudam. |
| R00-06 | Status `read_only`, `blocked` e `canceled` recusam escrita no banco (`company_can_write`), em toda função de escrita de negócio. |
| R00-07 | Pagamento que quita uma cobrança avança `paid_until` até o fim do período dela. Como as cobranças são sequenciais, o avanço conta a partir do vencimento anterior, não da data do pagamento. |
| R00-08 | Suspender, reativar e cancelar exigem motivo e geram `company_status_event` e `platform_audit_log`. A suspensão trava o status automático até a reativação. |
| R00-09 | Nenhum status apaga dados. Funcionário de empresa bloqueada continua vendo os próprios holerites e documentos (quando esses módulos existirem). |
| R00-10 | O Super Admin não vê dados de negócio de uma empresa. Acesso de suporte só com permissão da empresa, por tempo limitado e com log (implementação adiada; seção 8). |
| R00-11 | Valores em iene inteiro; datas de vencimento e períodos como `date` em Asia/Tokyo. |
| R00-12 | Tipos de contrato: `monthly` e `annual`, com valor fixo e cobrança; `partner` (vitalício), sem valor e sem cobrança, que nunca muda de status sozinho. O campo "indicada por" registra a empresa que trouxe uma parceira. |
| R00-13 | Só a empresa investidora (Sugita) tem `is_investor = true`. Ela não pode ser cancelada (`cancel_company` recusa) e só pode ser suspensa por motivo técnico. A marca só muda por migração. |
| R00-14 | Cobrança antecipada: o período é pago no início dele. Mensal: períodos de um mês a partir de `billing_start` (início, ou dia seguinte ao fim do teste; dia do mês ≤ 28 para todo mês ter a data); anual: períodos de um ano. A cobrança é gerada 10 dias antes do início do período ✱, com vencimento no primeiro dia dele. |
| R00-15 | Status automático (só `monthly` e `annual`, sem suspensão manual): em dia → `active`; 1 a 7 dias depois do vencimento → `past_due`; 8 a 22 dias → `read_only`; 23 dias ou mais → `blocked`. Os dias contam a partir do vencimento (`paid_until` + 1): o próprio dia do vencimento ainda é em dia. Os limites vêm de `grace_days` (7) e `block_after_days` (15) do contrato. |
| R00-16 | Pagamento menor que a cobrança: o Super Admin escolhe "quitar mesmo assim" (a diferença fica em `fee_yen`, como 振込手数料, e a cobrança vira `paid`) ou "deixar saldo em aberto" (a cobrança vira `partial` e `paid_until` não avança até completar). |
| R00-17 | Período de teste opcional em contratos `monthly` e `annual`: até `trial_ends_on`, status `trial`, com tudo que os módulos permitem. A primeira cobrança é gerada para o período que começa no dia seguinte ao fim do teste. |
| R00-18 | Formas de pagamento na v1: `transfer` (銀行振込) e `cash` (現金), registradas manualmente. |
| R00-19 | Sem limite de admins por contrato no MVP. |
| R00-20 | Cancelamento com data futura mantém a empresa operando até a data; no dia, o status vira `canceled` e nenhuma cobrança nova é gerada. |

## 5. Telas e fluxos

Todas em `/super`, com o design system (`docs/design-system.html`), textos por i18n (ja e pt) e os estados de carregando, vazio, erro e sucesso. Quem não é Super Admin com 2FA recebe 404 em qualquer rota `/super`.

| Rota | Tela | Conteúdo principal |
| --- | --- | --- |
| `/super/login` | Login | E-mail, senha e código 2FA; cadastro do 2FA no primeiro acesso |
| `/super` | Início | Cards por status (teste, ativas, em atraso, somente leitura, bloqueadas, canceladas), receita recebida no mês (só contratos pagos), parceiros à parte, cobranças vencendo em 10 dias, atrasos, alertas críticos do sistema |
| `/super/empresas` | Empresas | Tabela com busca, filtro por status e tipo de contrato, ordenação e paginação: código, nome, contrato, módulos (contagem), pago até, status. Ação: Nova empresa |
| `/super/empresas/nova` | Nova empresa | Assistente em 4 passos: 1) dados e código (com sugestão), "indicada por"; 2) plano-modelo e ajuste de módulos, com dependências na hora; 3) contrato: tipo, valor, forma de pagamento, início, dia de cobrança, teste opcional; 4) Proprietário (nome e e-mail) e revisão. Botão "Criar empresa" |
| `/super/empresas/[id]` | Empresa | Abas: Resumo · Módulos · Contrato e pagamentos · Usuários · Histórico. Ações: Registrar pagamento, Suspender/Reativar, Cancelar (oculto para investidora), Reenviar convite |
| `/super/pagamentos` | Pagamentos | Cobranças em aberto, parciais, vencidas e pagas no período, com filtro. Ação: Registrar pagamento |
| `/super/modulos` | Módulos e planos | Catálogo de módulos (só leitura) e planos-modelo (editáveis) |
| `/super/sistema` | Saúde do sistema | Versão base da ADR 0022: Saúde, Logs, Fila e Banco; Gargalos e Segurança em seguida |

### Registrar pagamento

1. Escolher a cobrança (ou abrir a partir dela).
2. Informar valor recebido, data, forma (振込 ou 現金), referência e comprovante opcional.
3. Se o valor for menor que o saldo: escolher "quitar mesmo assim" ou "deixar saldo em aberto" (R00-16).
4. Confirmar: a cobrança é atualizada, o "pago até" avança e a empresa volta a ativa, se for o caso.

### O que cada status faz no app da empresa

| Status | `/admin` (escritório) | `/m` (funcionário) | Escrita no banco |
| --- | --- | --- | --- |
| `trial`, `active` | Normal | Normal | Sim |
| `past_due` | Normal, com faixa de aviso para o Proprietário | Normal | Sim |
| `read_only` | Só consulta e exportação; botões de criar e editar desligados; faixa explicando | Só consulta | Não |
| `blocked` | Tela de bloqueio com o motivo e contato | Só os próprios holerites e documentos; sem eles, tela de bloqueio | Não |
| `canceled` | Sem acesso | Sem acesso | Não |

## 6. Permissões por papel

Todas as telas e funções desta camada são exclusivas do Super Admin. Nas empresas:

| Ação | Proprietário | Gestor | Coordenador | Funcionário |
| --- | --- | --- | --- | --- |
| Ver status, módulos e vencimento da própria empresa | Sim | Sim (sem valores) | Não | Não |
| Ver aviso de atraso | Sim | Não | Não | Não |
| Alterar contrato, módulos ou status | Não | Não | Não | Não |

## 7. Para o usuário

- **Cadastrar um cliente:** em Empresas → Nova empresa, preencha os dados, marque os módulos, defina o contrato e informe o e-mail do Proprietário. O sistema cria tudo de uma vez e envia o convite.
- **Contrato Parceiro:** para a Sugita e as empresas indicadas por ela. Não gera cobrança nem muda de status sozinho.
- **Registrar um pagamento:** em Pagamentos, escolha a cobrança e informe o valor recebido. Se veio com a taxa de transferência descontada, você decide se quita ou deixa o saldo em aberto.
- **Atraso:** até 7 dias, a empresa só vê um aviso. Depois, fica só em consulta. Depois de mais 15 dias, os admins não entram mais. Registrar o pagamento libera na hora.
- **Suspender ou cancelar:** na página da empresa, sempre com motivo. A Sugita não pode ser cancelada.

## 8. Pendências

- [ ] Planos-modelo (Básico, Padrão, Completo): os módulos de cada um foram uma sugestão inicial na migração; o Mike ajusta em `/super/modulos`.
- [ ] Configurações padrão da empresa no provisionamento: entram quando a camada 03 existir. Os papéis padrão são valores fixos de `membership.role`, sem tabela.
- [ ] Cadastro com início nos dias 29 a 31: recusado (`billing_day_over_28`); o assistente deve sugerir o dia 1 do mês seguinte.
- [ ] ✱ R00-14: confirmar a antecedência de 10 dias para gerar a cobrança antes do período (proposta).
- [ ] Acesso de suporte com permissão da empresa (R00-10): implementar antes do primeiro cliente pago.
- [ ] Exportação de dados de empresa cancelada: na v1, feita pelo Super Admin a pedido; exportação pelo próprio cliente depois.
- [ ] Cobranças em aberto quando a empresa é cancelada: continuam como valores a receber (proposta; confirmar quando houver o primeiro cliente pago).
- [ ] 請求書 e 領収書 do SaaS em PDF, quando a camada 08 existir.

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
| 2026-10-28 | 0.2 | Provisionamento aceito e modelo comercial (ADRs 0012 e 0018) | #3 |
| 2026-10-28 | 0.3 | Especificação do Super Admin v1: modelo de dados, funções, regras R00-01 a R00-20, telas, efeitos de cada status e permissões | #3 |
| 2026-10-28 | 0.4 | SA-04: migrações, RLS, funções e 83 testes pgTAP. Modelo ajustado: `company_module` por períodos, `depends_any`, `billing_start` no lugar de `billing_day`, `app.audit_log`; R00-15 explicita que o dia do vencimento ainda é em dia | SA-04 |
| 2026-10-29 | 0.5 | SA-05: funções da fila, tabelas de eventos e métricas, convite do Proprietário enviado pela fila (`/api/jobs/run`) | SA-05 |
| 2026-10-29 | 0.6 | SA-06: `platform_setting` com `require_mfa`, aceite do convite e `my_session` | SA-06 |
| 2026-10-29 | 0.7 | SA-07: layout de `/super` (menu agrupado em Clientes e Plataforma, cabeçalho com tema, idioma e sair, gaveta no celular) e páginas com título e estado vazio | SA-07 |
