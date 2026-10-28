# ADR 0022 — Observabilidade: logs com códigos e painel de saúde

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** usa as ADRs 0013 (Supabase Free, 500 MB), 0014 (fila), 0017 (Sentry e monitor) e 0020 (helper de ações e ID da requisição)

## Contexto

O Mike quer identificar possíveis erros pelo próprio painel: ver a operação do sistema, os logs, as falhas, os gargalos e os problemas técnicos, tudo com nomenclatura específica. Os alertas críticos devem aparecer só no painel, sem aviso externo.

Restrições:
- a Hostinger não oferece envio de logs para fora;
- o Supabase Free tem 500 MB de banco;
- o Sentry gratuito guarda erros por pouco tempo e com limite de volume.

## Decisão

### Nomenclatura

- **Todo evento tem um código** `ÁREA.CATEGORIA.EVENTO` e uma severidade: `debug`, `info`, `warn`, `error` ou `critical`.
- **Áreas iniciais:** `AUTH`, `SEC`, `PERF`, `DB`, `JOB`, `SYNC`, `MAIL`, `APP` e `PLATFORM`.
- **O catálogo de códigos** fica num lugar só (`packages/observability`), com descrição, severidade padrão e o que fazer. Código novo entra no catálogo; evento sem código catalogado não passa no lint.

| Código | Severidade | Quando |
| --- | --- | --- |
| `AUTH.LOGIN.FAILED` | warn | PIN ou senha errados |
| `AUTH.LOGIN.LOCKED` | warn | ID bloqueado após 5 erros |
| `SEC.RLS.DENIED` | error | O banco recusou acesso a dado de outra empresa |
| `SEC.RATE.LIMITED` | warn | Excesso de requisições |
| `SEC.INPUT.REJECTED` | warn | Entrada recusada na validação |
| `SEC.CSP.VIOLATION` | warn | O navegador bloqueou um script ou recurso não autorizado |
| `PERF.REQUEST.SLOW` | warn | Requisição acima de 3 s |
| `DB.QUERY.SLOW` | warn | Consulta lenta no banco |
| `JOB.RUN.FAILED` | error | Tarefa da fila falhou |
| `SYNC.OFFLINE.CONFLICT` | info | Registro offline em conflito |
| `APP.UNHANDLED.ERROR` | critical | Erro não tratado |

### Coleta

- **Toda requisição tem um ID.** O helper de ações (ADR 0020) registra sozinho código, rota, duração, resultado, empresa e usuário (só IDs). Nenhuma tela precisa lembrar de logar.
- **Fontes:** servidor do app, navegador (erros e violações de CSP), fila de tarefas, eventos de login do Supabase, consultas lentas (`pg_stat_statements`) e monitor de disponibilidade.
- **Nunca entram nos logs:** PIN, senha, token, cookie, conteúdo de campos e dados pessoais. Só IDs, códigos e números. Uma lista de campos proibidos é removida antes de gravar.

### Armazenamento

- **Eventos** (`warn` para cima e `info` por amostragem) ficam numa tabela da plataforma no Postgres, particionada por mês, por **30 dias**.
- **Métricas agregadas** por minuto e por hora (volume, erros, tempo médio e p95 por rota e por tarefa) ficam **1 ano**.
- **A limpeza** é feita por `pg_cron`. O painel mostra o espaço usado em relação ao limite do plano.
- **O Sentry** continua com o detalhe técnico dos erros (pilha, navegador), e cada evento no painel leva ao erro correspondente no Sentry.
- **Só o Super Admin** lê essas tabelas. As empresas não veem logs da plataforma.

### Painel `/super/sistema`

| Aba | O que mostra |
| --- | --- |
| Saúde | Disponibilidade, taxa de erro, tempo de resposta p95, versão publicada |
| Logs | Busca por código, severidade, empresa, usuário, período e ID da requisição |
| Gargalos | Rotas, consultas e tarefas mais lentas, com tendência |
| Segurança | Logins falhos, bloqueios, recusas do RLS, limites atingidos, entradas rejeitadas, violações de CSP |
| Fila | Tarefas pendentes e com falha, com reexecução |
| Banco | Espaço usado em relação ao limite, conexões, consultas lentas |

### Alertas

- **Só no painel:** eventos `critical`, picos de erro e sinais de ataque (ex.: muitos logins falhos seguidos, recusas do RLS em sequência) viram alertas abertos no topo do Super Admin, com contador, até você marcar como visto.
- **Exceção:** o monitor de disponibilidade da ADR 0017 continua avisando por e-mail quando o sistema sai do ar, porque nesse caso o painel também está fora.

## Consequências

- Pacote novo: `packages/observability` (logger estruturado, catálogo de códigos, remoção de campos proibidos).
- A base (logger, ID da requisição, catálogo, tabela de eventos e aba Logs) entra junto com o Super Admin. As outras abas entram aos poucos.
- Se o espaço chegar perto do limite, a amostragem de `info` diminui antes de qualquer outra coisa.
