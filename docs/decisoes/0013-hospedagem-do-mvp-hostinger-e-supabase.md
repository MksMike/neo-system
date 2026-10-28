# ADR 0013 — Hospedagem do MVP: Hostinger e Supabase Free

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Substitui:** ADR 0005

## Contexto

O projeto está em fase de MVP funcional, rodando com dados fictícios (ADR 0015). A ADR 0005 previa a Vercel para a aplicação, mas o Mike já usa a Hostinger, que roda aplicações Node.js (Next.js incluído) nos planos Business e Cloud, com deploy a partir do GitHub.

Limites da Hostinger para Node.js, conferidos na documentação oficial em 28/10/2026:

| Limite | Valor |
| --- | --- |
| Duração de uma requisição | 120 segundos |
| Processos sempre ligados (filas, bots, timers) | Não suportados; param a cada deploy ou reinício. A Hostinger indica cron no lugar |
| WebSocket de entrada | Não suportado (só conexões de saída) |
| App sem acesso | O processo é desligado e volta na próxima requisição |
| Processos por plano | Business: 120, compartilhados entre os sites do plano. Um app Next.js usa cerca de 10–11 |
| Banco de dados | Só MySQL |

Fontes: [visão geral do Node.js](https://docs.hostinger.com/node.js/overview) e [limites do Node.js](https://www.hostinger.com/support/?p=21141).

## Decisão

- **Aplicação:** Next.js (admin, app do funcionário e Super Admin) num Web App Node.js da Hostinger, plano Business, com build `standalone`. O data center escolhido é o mais próximo do Japão disponível na contratação, porque cada consulta ao banco atravessa a rede.
- **Banco, login, arquivos e tempo real:** Supabase Free, região Tóquio. A região não muda o preço e evita migrar o banco quando os dados reais entrarem.
- **Tempo real:** o navegador conecta direto ao Supabase Realtime, sem passar pela Hostinger, que não aceita WebSocket de entrada.
- **Tarefas em segundo plano:** fila no Postgres + cron (ADR 0014).
- **Ambientes do MVP:** local (Supabase CLI no Docker) e um ambiente MVP (projeto Supabase + app na Hostinger). O segundo projeto gratuito do Supabase fica livre para staging quando for necessário.
- **Domínio do MVP:** `neo-system.sugitakogyo.pro`, subdomínio do domínio da Sugita na Hostinger. Antes do SaaS comercial, o sistema passa para um domínio próprio, no nome do Mike: outras empresas não devem acessar um endereço com a marca de um cliente, e o DNS e o e-mail automático não devem depender do domínio da Sugita. O app não depende do endereço, então a troca é de configuração.

## Consequências

- **O primeiro acesso depois de um tempo parado é mais lento**, porque o processo do app precisa subir. É aceitável no MVP.
- **Nenhuma requisição pode passar de 120 s.** Lotes de PDF e outras tarefas pesadas sempre vão para a fila.
- **O Supabase Free não tem backup automático e pausa depois de 7 dias sem uso.** O backup diário externo pelo GitHub Actions continua obrigatório. O cron da ADR 0014 acessa o banco a cada execução, o que também evita a pausa.
- **O deploy de monorepo (pnpm + Turborepo, app em `apps/web`) pela integração da Hostinger precisa ser testado** antes da primeira tela. Se não funcionar, o build roda no GitHub Actions e só o resultado `standalone` é enviado.
- **Quando os dados reais entrarem** (gatilho da ADR 0015), o Supabase passa para o Pro. A permanência do app na Hostinger é reavaliada nesse momento.
- **Quando houver processos sempre ligados** (e-mail por IMAP e LINE, na fase 2), eles rodam numa VPS pequena. O código das tarefas não muda (ADR 0014).
- A regra de portabilidade (ADR 0006) continua valendo: nada exclusivo da Hostinger nem da Vercel.
