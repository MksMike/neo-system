# COMECE AQUI — NEO-SYSTEM

Este é o arquivo de partida. Abra a pasta `C:\dev\NEO-SYSTEM` no VS Code, inicie o Claude Code e siga as tarefas na ordem, **uma por vez**. Cada tarefa tem um texto pronto para colar.

A primeira entrega é o **Super Admin**: o painel onde você cadastra empresas clientes, escolhe os módulos de cada uma, define o tipo de licença (vitalícia, mensal ou anual), acompanha os pagamentos do SaaS e inativa quem não está em dia.

---

## 0. Antes da primeira linha de código

- [ ] Ferramentas instaladas: Git, Node.js 22+, pnpm (`corepack enable`), Docker Desktop, Supabase CLI, GitHub CLI e VS Code com as extensões ESLint, Prettier, Tailwind CSS IntelliSense e Claude Code. Detalhes em `docs/01-guia-de-inicio.md`, seção 1.
- [ ] Repositório criado no GitHub (privado) e primeiro commit feito. Guia, seção 2.
- [ ] Projeto Supabase `neo-dev` criado na região **Tokyo**, com as chaves guardadas fora do repositório.
- [ ] **覚書 assinado** (propriedade do código, licença e participação da Sugita). É o bloqueante do documento-âncora: a documentação pode avançar, o código começa depois.
- [ ] **Decisão sobre o banco por cliente:** leia `docs/decisoes/0012-provisionamento-de-empresas.md` e confirme ou mude antes da tarefa 03.

### Sobre "um banco separado para cada cliente"

A preocupação está certa: as empresas podem ser concorrentes, e um vazamento entre elas acabaria com o produto. A ADR 0012 compara as três formas de isolar empresas. A recomendação é:

- **Padrão:** banco único com RLS. Cada linha tem `company_id` e o próprio Postgres recusa leitura e escrita entre empresas. Testes automáticos provam isso a cada mudança.
- **Provisionamento:** cadastrar um cliente roda uma função única que cria empresa, licença, módulos, configurações, papéis, pasta de arquivos e convite do dono. Ou cria tudo, ou não cria nada.
- **Banco dedicado como plano pago:** para quem exigir, roda o mesmo código num projeto Supabase só daquela empresa.

**Por que não um banco por cliente desde o início:**

- Cada banco no Supabase é um projeto inteiro, com login, arquivos, e-mails, jobs e chaves próprios.
- O plano gratuito permite só 2 projetos, e no Pro cada projeto cobra servidor próprio todo mês.
- Toda atualização teria que rodar em N bancos; se falhar em um, as empresas ficam em versões diferentes do sistema.
- O Super Admin teria que consultar N bancos para montar uma simples lista de clientes.

Se mesmo assim você preferir banco por cliente, diga antes da tarefa 03. A ADR e o modelo abaixo mudam: entra um "registro de instalações".

---

## 1. O que o Super Admin v1 faz

### Entra agora

- Login separado do Super Admin (só você), com 2FA obrigatório.
- Painel inicial: empresas por status, pagamentos vencendo e em atraso, receita do mês.
- Cadastro de empresa em 4 passos: dados → módulos → licença → dono. Ao confirmar, roda o provisionamento.
- Detalhe da empresa: dados, módulos ligados e desligados, licença, cobranças e pagamentos, usuários e histórico.
- Registro manual de pagamento (transferência ou dinheiro): renova o vencimento automaticamente.
- Mudança automática de status por atraso, e inativar ou reativar manualmente, sempre com motivo.
- Bloqueio aplicado de verdade: o servidor e o banco recusam o que o status ou os módulos não permitem.

### Fica para depois

- Cobrança automática por cartão ou débito (gateway): fase 3.
- Emissão do 請求書 do SaaS em PDF: depende do motor de PDF (camada 08).
- Uso de IA e cotas: fase 2.
- Tabelas legais: M4.

---

## 2. Conceitos

### Módulos (o que o cliente contrata)

Cada camada do sistema vira um módulo que pode ser ligado ou desligado por empresa. Os módulos **base** estão sempre ligados.

| Chave | Módulo | Tipo | Depende de |
| --- | --- | --- | --- |
| `platform` | Plataforma, login e permissões | Base | — |
| `settings` | Configurações da empresa | Base | — |
| `organizations` | Clientes, subs e locais | Contratável | — |
| `employees` | Funcionários | Contratável | — |
| `scheduling` | Escalação e calendário | Contratável | `organizations`, `employees` |
| `attendance` | Apontamento e confirmação diária | Contratável | `scheduling` |
| `documents` | Documentos, PDFs e biblioteca | Contratável | — |
| `billing` | Fechamento e 請求書 | Contratável | `attendance`, `documents` |
| `payroll` | Folha, pagamentos e vales | Contratável | `attendance`, `documents` |
| `finance` | Financeiro, caixa e despesas | Contratável | `billing` ou `payroll` |
| `messaging` | Comunicação, e-mail e alertas | Contratável | — |
| `internal` | Gestão interna (tarefas, 日報) | Contratável | `employees`, `messaging` |
| `learning` | Aprendizado (japonês de genba) | Contratável | `employees` |
| `reports` | Dashboard e relatórios | Contratável | — |
| `ai` | Assistente de IA | Add-on | — |
| `bank_sync` | Extrato bancário automático | Add-on | `finance` |

- Ligar um módulo liga junto as dependências, avisando quais.
- Desligar um módulo do qual outro depende é recusado, com a lista do que depende dele.
- Os planos Básico, Padrão e Completo são **modelos**: no cadastro, escolher um plano pré-marca os módulos, e você ajusta à mão.

### Licença (como o cliente paga)

| Tipo | Vencimento | Cobrança |
| --- | --- | --- |
| **Vitalícia** | Não vence | Pagamento único (à vista ou em parcelas). Manutenção opcional mensal ou anual ✱ |
| **Mensal** | Todo mês, no dia de vencimento | Uma cobrança por mês |
| **Anual** | Uma vez por ano | Uma cobrança por ano |

Campos: tipo, data de início, dia de vencimento, `paid_until` (pago até), preço, dias de tolerância, observação.

### Status da empresa

| Status | Quando | O que a empresa consegue fazer |
| --- | --- | --- |
| Teste (`trial`) | Cadastro com período de teste | Tudo, até a data final do teste |
| Ativa (`active`) | Licença em dia | Tudo o que os módulos permitem |
| Em atraso (`past_due`) | Venceu, dentro da tolerância (padrão 7 dias ✱) | Tudo, com aviso no topo para o Proprietário |
| Somente leitura (`read_only`) | Passou da tolerância | Ver e exportar; nada é criado nem alterado |
| Bloqueada (`blocked`) | Atraso longo (padrão +15 dias ✱) **ou** inativada por você | Admins não entram; funcionários ainda veem os próprios holerites e documentos |
| Cancelada (`canceled`) | Fim do contrato | Dados guardados pelo prazo legal, só para exportação |

- O status muda sozinho todo dia (job às 03:00 de Tóquio), conforme `paid_until`.
- Registrar um pagamento volta a empresa para Ativa na hora.
- **Inativar** é manual: exige motivo e trava o status automático até você reativar.
- Nenhum status apaga dados.

---

## 3. Regras (camada 00)

| Regra | Texto |
| --- | --- |
| R00-01 | Toda empresa tem um código de login único, curto e só com letras e números (ex.: `SUGITA`), usado pelo funcionário para entrar. |
| R00-02 | O provisionamento é uma transação: ou cria empresa, licença, módulos, configurações, papéis, pasta e convite, ou não cria nada. |
| R00-03 | Módulo desligado é recusado no servidor e no banco (`has_module`), não só escondido no menu. |
| R00-04 | Ligar um módulo liga as dependências; desligar um módulo com dependentes é recusado. |
| R00-05 | Mudanças de módulo e de licença têm data de vigência e ficam no histórico; o passado não é reescrito. |
| R00-06 | Status `read_only`, `blocked` e `canceled` recusam escrita no banco (`company_can_write`), em toda tabela de negócio. |
| R00-07 | Pagamento registrado avança `paid_until` pelo período da licença (1 mês ou 1 ano) a partir do vencimento anterior, não da data do pagamento. |
| R00-08 | Inativar e reativar exigem motivo e geram entrada no log da plataforma. |
| R00-09 | Nenhum status apaga dados. Funcionário de empresa bloqueada continua vendo os próprios holerites e documentos. |
| R00-10 | Super Admin não vê dados de negócio de uma empresa. Acesso de suporte só com permissão da empresa, por tempo limitado e com log. |
| R00-11 | Valores em iene inteiro; datas de vencimento como `date` em Asia/Tokyo. |

---

## 4. Modelo de dados (primeira versão)

Nomes em inglês, conforme o CLAUDE.md. Toda tabela tem `id uuid`, `created_at`, `updated_at`, `created_by`, `deleted_at` e gatilho de auditoria.

```text
platform_admin        user_id, name, is_active                          (quem é Super Admin)
company               code (único), legal_name, legal_name_kana, display_name,
                      invoice_reg_no (T+13), postal_code, address, phone, email,
                      status, status_locked, status_reason, trial_ends_on,
                      timezone ('Asia/Tokyo'), default_locale
module                key (pk), name_ja, name_pt, kind (base|contract|addon),
                      depends_on text[], sort_order                     (catálogo, via seed)
plan_template         key, name, module_keys text[], max_admins, base_price_yen   (Básico, Padrão, Completo)
company_module        company_id, module_key, enabled, valid_from, valid_to, note
license               company_id, type (lifetime|monthly|annual), starts_on, due_day,
                      paid_until, price_yen, grace_days, read_only_days,
                      maintenance_type (none|monthly|annual), maintenance_price_yen, is_current
saas_charge           company_id, license_id, period_start, period_end, due_on,
                      amount_yen, status (open|paid|overdue|canceled)
saas_payment          company_id, charge_id, paid_on, amount_yen,
                      method (transfer|cash|other), reference, receipt_path, note
company_status_event  company_id, from_status, to_status, reason, source (auto|manual), actor_id
platform_audit_log    actor_id, action, company_id, payload jsonb, ip
```

Funções no banco:

- `provision_company(dados jsonb) returns uuid`: transação única. Só o Super Admin chama.
- `has_module(company_id, module_key) returns boolean`: usada nas políticas RLS dos módulos.
- `company_can_write(company_id) returns boolean`: falsa em `read_only`, `blocked` e `canceled`.
- `recompute_company_status()`: chamada pelo `pg_cron` todo dia às 03:00 de Tóquio.
- `register_saas_payment(...)`: grava o pagamento, fecha a cobrança, avança `paid_until` e reativa a empresa.

As tabelas `platform_*`, `module`, `plan_template` e `saas_*` são da plataforma. Só o Super Admin as lê e escreve; a empresa vê apenas a própria licença e o próprio status, via função.

---

## 5. Telas do Super Admin v1

Todas em `/super`, com o design de `docs/design-system.html`.

| Rota | Tela | Conteúdo principal |
| --- | --- | --- |
| `/super` | Início | Cards de status (ativas, em atraso, somente leitura, bloqueadas), receita do mês, próximos vencimentos (7 dias), atrasos |
| `/super/empresas` | Empresas | Tabela com busca e filtro por status: código, nome, licença, módulos (contagem), pago até, status. Ação: Nova empresa |
| `/super/empresas/nova` | Nova empresa | Assistente em 4 passos: 1) dados e código de login; 2) plano-modelo + ajuste de módulos; 3) licença e preço, teste opcional; 4) e-mail do Proprietário e revisão. Botão "Criar empresa" |
| `/super/empresas/[id]` | Empresa | Abas: Resumo · Módulos · Licença e pagamentos · Usuários · Histórico. Ações: Registrar pagamento, Inativar/Reativar, Reenviar convite |
| `/super/pagamentos` | Pagamentos | Cobranças abertas, atrasadas e pagas no mês, com filtro por período. Registrar pagamento |
| `/super/modulos` | Módulos e planos | Catálogo de módulos (só leitura na v1) e planos-modelo (editáveis) |

---

## 6. Tarefas para o Claude Code

Cole uma por vez. Cada tarefa termina com branch própria, PR, CI verde, documento da camada atualizado e `CHANGELOG.md`.

**01 · Monorepo**
> Leia CLAUDE.md, COMECE-AQUI.md, docs/00-ancora.md e docs/02-stack-e-convencoes.md. Crie o monorepo com pnpm + Turborepo exatamente na estrutura do documento 02 (apps/web, packages/ui, calc, pdf, db, ai, config). TypeScript strict, ESLint, Prettier, scripts dev, build, lint, typecheck e test. Nenhuma tela ainda.

**02 · App e design system**
> Crie apps/web com Next.js (App Router) e Tailwind v4. Em packages/ui, transforme docs/design-tokens.json em variáveis CSS (6 temas: azul, grafite e roxo, cada um claro e escuro) e instale os componentes shadcn/ui adaptados aos tokens, reproduzindo o visual e os estados de docs/design-system.html (abra o arquivo no navegador para conferir). Crie /dev/ui mostrando os componentes, com troca de tema e idioma (ja/pt via next-intl).

**03 · Banco da plataforma**
> Leia docs/decisoes/0012-provisionamento-de-empresas.md e as seções 2 a 4 do COMECE-AQUI.md. Inicialize o Supabase local e crie as migrações: platform_admin, company, module (seed com o catálogo da seção 2), plan_template (seed Básico, Padrão, Completo), company_module, license, saas_charge, saas_payment, company_status_event, platform_audit_log. Crie também user_profile e membership (papel por empresa), com RLS. Implemente as funções has_module, company_can_write, provision_company, register_saas_payment e recompute_company_status, e agende esta última com pg_cron às 03:00 de Asia/Tokyo. Escreva testes pgTAP para: isolamento entre duas empresas; usuário comum sem acesso às tabelas da plataforma; provisionamento que falha no meio sem deixar nada criado; dependências de módulo (R00-04); escrita recusada em read_only e blocked (R00-06); avanço de paid_until (R00-07). Documente o modelo em docs/camadas/00-plataforma.md.

**04 · Login**
> Implemente o login do Super Admin (e-mail + senha + 2FA TOTP obrigatório; só quem está em platform_admin entra em /super) e o login de admin de empresa (e-mail + senha + 2FA) conforme a ADR 0004. Proteja /super, /admin e /m por papel no middleware e no servidor. Crie um seed local com 1 Super Admin e 2 empresas de teste (SUGITA e DEMO). Testes Playwright: quem não é Super Admin recebe 404 em /super.

**05 · Shell do Super Admin**
> Monte o layout de /super com o design system: menu lateral (Início, Empresas, Pagamentos, Módulos e planos), cabeçalho com busca ⌘K, troca de tema e idioma, e as páginas da seção 5 do COMECE-AQUI.md vazias, com título e estado vazio. Todos os textos por i18n (ja e pt).

**06 · Empresas: lista e cadastro**
> Implemente /super/empresas (tabela com busca, filtro por status, ordenação e paginação) e o assistente /super/empresas/nova em 4 passos, com validação Zod igual no cliente e no servidor. O passo 2 pré-marca módulos pelo plano-modelo e aplica as dependências (R00-04) na hora. "Criar empresa" chama provision_company numa Server Action e envia o convite do Proprietário. Código de login único (R00-01), com sugestão automática. Testes: cadastro completo, código repetido, falha no meio sem resto.

**07 · Detalhe da empresa: módulos e licença**
> Implemente /super/empresas/[id] com as abas Resumo, Módulos, Licença e pagamentos, Usuários e Histórico. Ligar e desligar módulo com vigência (R00-05) e confirmação. Trocar tipo de licença, preço e tolerâncias com vigência. Toda mudança gera company_status_event ou platform_audit_log.

**08 · Pagamentos e status automático**
> Implemente a geração de cobranças (mensal todo mês; anual uma vez por ano; vitalícia na criação, com parcelas opcionais) e a tela /super/pagamentos. "Registrar pagamento" (valor, data, transferência ou dinheiro, comprovante opcional no Storage) chama register_saas_payment. Mostre na lista de empresas o "pago até" e o status calculado. Testes das transições: active → past_due → read_only → blocked e a volta para active ao pagar.

**09 · Inativar, reativar e bloqueio aplicado**
> Implemente Inativar e Reativar com motivo obrigatório (R00-08), travando o status automático. No app da empresa: faixa de aviso para o Proprietário em past_due; modo somente leitura em read_only (botões de criar e editar desligados, e o banco recusando); tela de bloqueio em blocked, mantendo o funcionário com acesso aos próprios holerites (R00-09). Menu do admin mostra só os módulos ligados; rota de módulo desligado responde 404. Testes Playwright para cada status.

**10 · CI, auditoria e backup**
> GitHub Actions com lint, typecheck, test, supabase test db e build em todo PR. Gatilho de auditoria genérico em todas as tabelas. Workflow agendado de backup diário do banco para armazenamento externo (credenciais por secrets), com o procedimento de restauração documentado.

**Super Admin v1 pronto quando:**
- você cadastra a Sugita e a DEMO pelo painel;
- liga e desliga módulos;
- registra pagamentos;
- vê a DEMO cair para "somente leitura" quando a data avança e voltar ao registrar o pagamento;
- os testes provam que nenhuma empresa enxerga a outra.

---

## 7. Perguntas em aberto (✱)

Responda quando puder; o Claude Code deve perguntar antes de inventar.

1. Licença vitalícia: tem taxa de manutenção (suporte e atualizações) mensal ou anual? Qual o valor?
2. Tolerância antes de "somente leitura": 7 dias? E antes de "bloqueada": mais 15 dias?
3. Período de teste padrão para empresa nova: 14 ou 30 dias, ou sem teste?
4. Preço por módulo ou só pelo plano-modelo + ajuste manual na v1?
5. A Sugita entra como vitalícia (conforme o 覚書) ou mensal?

---

## Onde está cada coisa

| Arquivo | Para quê |
| --- | --- |
| `CLAUDE.md` | Regras que o Claude Code segue em toda sessão |
| `docs/00-ancora.md` | Documento-âncora: princípios, camadas, roadmap |
| `docs/01-guia-de-inicio.md` | Instalação das ferramentas, GitHub, Supabase |
| `docs/02-stack-e-convencoes.md` | Stack e estrutura de pastas |
| `docs/design-system.html` | Página âncora da identidade visual (abra no navegador) |
| `docs/design-tokens.json` | Cores, tipografia, espaços e sombras dos 6 temas |
| `docs/decisoes/` | ADRs (0012 = provisionamento de empresas) |
| `docs/camadas/00-plataforma.md` | Documento da camada do Super Admin |
| `docs/telas/inventario-de-telas.md` | Todas as 66 telas do sistema |
