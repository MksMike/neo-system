# ADR 0014 — Tarefas em segundo plano: fila no Postgres e cron

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** depende da ADR 0013 (hospedagem); usada pela ADR 0012 (provisionamento)

## Contexto

O sistema tem trabalho que não cabe numa requisição: lotes de PDF no 締め, envio de e-mails, convites, alertas de vencimento, status diário das empresas e, na fase 2, leitura por IA, LINE e e-mail por IMAP.

A Hostinger não mantém processos sempre ligados e corta requisições em 120 s (ADR 0013). As Edge Functions do Supabase rodam em Deno, o que dificulta reaproveitar `packages/calc` e `packages/pdf`, que são Node.

Além disso, um efeito externo (como enviar um e-mail) não pode ficar dentro de uma transação do banco, porque não volta atrás se a transação falhar.

## Decisão

- **Fila numa tabela própria do Postgres** (`job`): tipo, dados, empresa (vazia para tarefas da plataforma), status, tentativas, quando rodar, até quando está reservada e último erro. Quem processa reserva as tarefas com `FOR UPDATE SKIP LOCKED`, então duas execuções nunca pegam a mesma. É uma tabela comum, sem pgmq, por portabilidade (ADR 0006).
- **Efeitos externos pelo padrão outbox:** a transação de negócio grava a tarefa na fila junto com os dados. Ela só é executada se a transação confirmar. Exemplo: o convite do Proprietário no provisionamento (ADR 0012).
- **Dois disparadores:**
  - `pg_cron` para tarefas só em SQL (ex.: `recompute_company_status()` às 03:00 de Tóquio);
  - cron da Hostinger, a cada 1–5 minutos conforme o plano permitir, chamando uma rota protegida do app (`/api/jobs/run`, com segredo no cabeçalho). Ela processa tarefas até ~90 s e para; o que sobrar fica para a próxima execução.
- **Toda tarefa pode rodar mais de uma vez sem efeito duplicado** (idempotente), com novas tentativas espaçadas e limite de tentativas. Tarefa que esgota as tentativas fica como falha, visível no Super Admin.
- **Edge Functions não são usadas no MVP.**

## Consequências

- **Ou cria tudo, ou não cria nada, também com efeitos externos:** o que sai do banco só acontece depois da confirmação.
- **Uma tarefa leva até alguns minutos para começar.** Para e-mails, convites e PDFs em lote, é aceitável.
- **Cada tarefa precisa caber em ~90 s** ou ser dividida em partes (ex.: um PDF por tarefa).
- **Na fase 2**, um processo sempre ligado numa VPS passa a consumir a mesma tabela (polling de IMAP, LINE). As tarefas não mudam; muda só quem as executa.
- A tela "Saúde do sistema" do Super Admin lê esta tabela (pendentes, falhas, reexecutar).
