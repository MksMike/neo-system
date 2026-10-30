# ADR 0027 — O dia do funcionário é um registro próprio da escalação

- **Status:** Aceita
- **Data:** 2026-10-31
- **Decisores:** Mike
- **Relação:** camada 06 (substitui o modelo de alocação por intervalo da D-04); camadas 07 e 09; levantamento em [`docs/camadas/06-rascunho-fluxo-completo.md`](../camadas/06-rascunho-fluxo-completo.md)

## Contexto

O levantamento do fluxo do Bubble (2026-10-30) mostrou que:

- a escalação é sempre de **um cliente** e **um mês fechado** (28 a 31 dias, do dia 1 ao fim do mês ou no ciclo do cliente, ex.: 25 a 24);
- todos os dias do período entram, inclusive sábados, domingos e feriados; a folga é marcada no dia;
- **cada dia de cada funcionário** pode ter subcontratante, local, horário, valor, adicionais e multa diferentes da escalação;
- o 請求書 precisa separar dias de valores diferentes (problema P1 do levantamento).

O modelo da D-04 guardava só a alocação por intervalo (`assignment_member`) e os dias de trabalho da semana (`work_days`). Nada podia mudar por dia.

## Decisão

- **`assignment_day`**: uma linha por funcionário, escalação e data. Ela nasce **pendente**, com os valores padrão da escalação (sub, local, horário, intervalo, encontro, valor dia, imposto, 税込, adicionais), e guarda tudo o que for alterado naquele dia: situação (pendente, trabalhou, folga), período (定時, 半日, 残業, 早出, 夜勤, por hora), horas trabalhadas, horas extras, adicionais do cliente e do funcionário, multa e observação.
- **Editar a escalação muda só os padrões.** Os dias já criados mantêm os próprios valores, e o passado não muda sozinho (CLAUDE.md, regra 4).
- **A escalação tem no máximo 31 dias.** `work_days` deixa de ser usado; o padrão passa a ser todos os dias.
- **Valor dia na escalação e no dia, sem tabela de preço por cliente ou qualificação**, porque o preço é negociado caso a caso. O 請求書 vai agrupar por sub + local + preço unitário + título (camada 09).
- **`assignment_member` fica só para leitura**: as alocações existentes foram convertidas em dias pela migração.
- Escrita só pelas funções `save_assignment`, `delete_assignment`, `add_assignment_employee`, `save_assignment_day`, `set_assignment_day_status` e `remove_assignment_employee` (ADR 0023).

## Consequências

- Na camada 07, o app do funcionário marca entrada e saída **no próprio `assignment_day`**; o admin revisa.
- Na camada 09, o fechamento lê os dias, grava um snapshot e trava o período.
- Uma escalação de 31 dias com 20 funcionários tem 620 linhas, sem problema de volume.
- Os valores em iene são inteiros (`bigint`). Imposto e quantidade (定日) ficam em `packages/calc`, com golden tests.
