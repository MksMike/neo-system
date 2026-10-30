# Camada 06 · Escalação e calendário

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R06-NN`.

## 1. Objetivo e escopo

- **Escopo:** formulário de escalação (cliente, sub, local, período, horário e intervalo, 集合場所/時間 opcional, valor dia cobrado, imposto, adicionais cobrados, observações); escalação interna permanente; alocação de funcionários (todos os dias, intervalo, dias específicos, em lote), substituição, remoção de intervalo; equipes com 班長 e membros com datas; grade funcionários × dias igual ao 勤怠表 com borda por sub; ações em lote; mensagem do LINE do dia seguinte.
- **Regras:** ao alocar, cada dia nasce como **Pendente**, ou **休** na folga padrão do cliente. Um funcionário pode ter mais de um trecho na mesma data desde que os horários não se sobreponham; acima de 2 unidades pede confirmação. Alerta ao alocar: duplicidade, folga, vencimentos, visto. Exibir dias úteis previstos e "Total/dia" (não total do período). Preço cobrado do cliente e diária do funcionário são tabelas separadas; a diferença é a margem.
- **Pronto quando:** a escala do LINE de um dia real da Sugita é reproduzida pelo sistema, caractere por caractere no formato atual.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-30 | Demonstração antes do M1: escalação sem valores; dias de trabalho da semana na própria escalação até as regras de cobrança do cliente (folga padrão) chegarem no M1 | 0025 |
| 2026-10-31 | Versão 2 a partir do fluxo do Bubble: o dia do funcionário é um registro próprio; escalação de um mês fechado com valor dia, imposto e adicionais; sem tabela de preço por qualificação | 0027 |

Levantamento completo do fluxo atual e pendências: [`06-rascunho-fluxo-completo.md`](06-rascunho-fluxo-completo.md).

## 3. Modelo de dados

Toda tabela tem `company_id`, RLS, auditoria, `version` e exclusão lógica. Escrita só pelas funções abaixo (ADR 0023). Valores em iene inteiro (`bigint`); tempo em minutos.

| Tabela | Campos | Observação |
| --- | --- | --- |
| `assignment` | `client_id`, `chain_id`, `site_id`, `title` (até 120), `title_show_on` (`invoice` \| `timesheet` \| `both`), `starts_on`, `ends_on` (até 31 dias), `start_time`, `end_time` (fim antes do início = 夜勤), `break_minutes`, `meeting_place` (URL ou endereço), `meeting_time`, `day_rate`, `tax_rate` (0, 8, 10), `price_includes_tax` (税込), `extra_description`, `extra_client_amount`, `extra_employee_amount`, `extra_client_taxable`, `note` | Escalação: um cliente, um mês, os padrões do dia. `work_days` não é mais usado |
| `assignment_day` | `assignment_id`, `employee_id`, `day`, `status` (`pending` \| `work` \| `off`), `period` (`teiji`, `hannichi`, `zangyo`, `hayade`, `yakin`, `hourly`), `start_time`, `end_time`, `break_minutes`, `worked_minutes`, `overtime_minutes`, `chain_id`, `site_id`, `day_rate`, `tax_rate`, `price_includes_tax`, `meeting_place`, `meeting_time`, `client_extra_*` (descrição, valor, tributável), `employee_extra_*` (descrição, valor), `fine_description`, `fine_amount`, `note` | Dia do funcionário (ADR 0027). Único por escalação, funcionário e data |
| `assignment_member` | — | Só leitura (histórico da versão 1); convertido em dias pela migração |

**Funções:**
- `save_assignment(p)`: cria com o id da tela ou edita com `version`. Confere sub e local do cliente, período de até 31 dias, e não deixa o período encolher para fora dos dias. Editar muda só os padrões.
- `delete_assignment(empresa, id, version)`: exclusão lógica da escalação e dos dias.
- `add_assignment_employee(p)`: põe o funcionário em todos os dias do período ou num intervalo (um dia: início = fim); os dias já existentes ficam como estão, então repetir é seguro; recusa horário sobreposto (R06-02).
- `save_assignment_day(p)`: edita tudo de um dia com `version`.
- `set_assignment_day_status(empresa, escalação, dia, teiji | off)`: "Todos 定時" e "Todos folga".
- `remove_assignment_employee(empresa, escalação, funcionário, dia?)`: tira de um dia ou da escalação inteira (lógico).

Cálculos em `packages/calc`: `taxOf` e `splitPrice` (imposto arredondado para baixo; 税込 separado do preço) e `dayUnitsHundredths` (定日: 半日 = 0,5; por hora = horas ÷ 8; demais = 1).

Escrita: Proprietário, Gestor e Coordenador, com o módulo `scheduling` ligado e a empresa aceitando escrita.

## 4. Regras de negócio

| Regra | Texto |
| --- | --- |
| R06-01 | *(Substituída pela R06-07 em 2026-10-31.)* Cada dia da alocação é dia de trabalho ou folga conforme os dias de trabalho da escalação. |
| R06-02 | Um funcionário pode ter mais de um trecho na mesma data, desde que os horários não se sobreponham; o dia sobreposto é recusado. Dias de folga não contam. |
| R06-03 | Os dias ficam dentro do período da escalação, e o período não pode encolher deixando dias de fora. |
| R06-04 | A grade mostra a sigla do sub e o local de cada funcionário em cada dia; o card da escalação mostra os subs usados nela. |
| R06-05 | *(Substituída em 2026-10-31.)* O formulário mostra os dias úteis previstos. Agora mostra o número de dias do período. |
| R06-06 | A escalação é de um cliente e um mês fechado: no máximo 31 dias, do dia 1 ao fim do mês ou no ciclo do cliente (ex.: 25 a 24). O mesmo cliente pode ter mais de uma escalação no mesmo período. |
| R06-07 | Escalar sem datas põe o funcionário em todos os dias do período, inclusive sábados, domingos e feriados. Cada dia nasce **pendente** com os padrões da escalação. |
| R06-08 | Tudo do dia de um funcionário pode ser alterado (situação, período, horas, horas extras, sub, local, valor, imposto, encontro, adicionais, multa, observação) sem afetar os outros dias. Editar a escalação muda só os padrões dos dias novos. |
| R06-09 | Cores do funcionário no dia: 定時 (com ★), 残業 (com ⏱ e as horas), 半日, folga (休) e não registrado. A cor sempre vem com ícone ou texto. |
| R06-10 | A multa é descontada só do funcionário e nunca aparece no 請求書. O valor adicional do funcionário e o do contratante são independentes; o do contratante pode ou não ter imposto. |

## 5. Telas e fluxos

- `/admin/escalacoes`: mês (anterior, próximo, hoje), **Nova escalação** e **Finalizar** (desligado até a camada 09). Cada escalação ativa no mês é um card que abre: ícone em destaque quando há adicional, cliente, subs, título e período; aberto, mostra o resumo por funcionário (★ 定日, folgas, horas extras), os valores, **Editar escalação**, **Escalar funcionário** (período inteiro), excluir e a grade com um card por dia.
- **Detalhe do dia** (clicar num dia): funcionários do dia com sub » local e situação; cada um abre o editor completo (R06-08), com **Tirar deste dia** e **Tirar da escalação**; **Adicionar funcionário só neste dia**, **Todos 定時** e **Todos folga**.
- `/admin/escalacoes/nova`: cliente, sub, local, **título do trabalho** (interruptor; texto e "mostrar em" 請求書, 勤怠表 ou ambos), período (sugere o mês atual), entrada e saída, encontro, intervalo, valor dia, imposto, 税込, total por dia e **valor adicional por dia** (interruptor; descrição, contratante, funcionário, imposto do contratante). Ao salvar, abre a escalação.
- `/admin/escalacoes/[id]`: o mesmo card, já aberto.

Referência completa: `docs/telas/inventario-de-telas.md`.

## 6. Permissões por papel

| Ação | Proprietário | Gestor | Coordenador | Funcionário |
| --- | --- | --- | --- | --- |
| Ver calendário e escalações | Sim | Sim | Sim | Não (o próprio dia vem no app, camada 07) |
| Criar, editar e excluir escalações, escalar, editar dias | Sim | Sim | Sim | Não |

## 7. Para o usuário

- **Criar uma escalação:** Escalações → Nova escalação. O período já vem com o mês atual; para clientes que fecham em outro dia (ex.: 25 a 24), ajuste as datas.
- **Escalar:** no card da escalação, "Escalar funcionário" põe a pessoa em todos os dias. Para um dia só, abra o dia e use "Adicionar funcionário só neste dia".
- **Mudar um dia:** clique no dia, abra o funcionário e altere o que precisar (valor, sub, local, horas extras, multa…). Os outros dias não mudam.
- **Marcar o dia inteiro:** no detalhe do dia, "Todos 定時" ou "Todos folga".
- **Editar a escalação** muda só os valores padrão; os dias já criados continuam como estão.

## 8. Pendências

- [ ] Finalizar (camada 09): confirmação por escalação, 立替金, 請求書 e 勤怠表 com o mesmo número, agrupados ou separados.
- [ ] Registro de entrada e saída pelo app do funcionário no `assignment_day` e revisão pelo admin (camada 07).
- [ ] Tabela de multas (descrição + valor) para escolher no dia; hoje o valor é livre.
- [ ] Aplicar a mudança de padrão da escalação aos dias ainda pendentes (opcional, a decidir com o dono).
- [ ] Valor por funcionário na escalação (em aberto, a debater com o dono).
- [ ] Sobreposição de 夜勤 que atravessa a meia-noite contra o trecho do dia seguinte.
- [ ] Mensagem do LINE do dia seguinte e 祝日 no calendário.
- [ ] Pendências legais e fiscais do levantamento (フリーランス法, multas, imposto do autônomo).

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
| 2026-10-30 | 0.2 | D-04: modelo, funções, regras R06-01 a R06-05, telas (calendário mês/semana, nova escalação, página com grade) e permissões | D-04 |
| 2026-10-31 | 0.3 | Versão 2 (ADR 0027): dia do funcionário como registro próprio, valores e adicionais, mês fechado, card da escalação com grade e detalhe do dia; R06-01 e R06-05 substituídas, R06-06 a R06-10 novas | feat/06-escalacao-v2 |
