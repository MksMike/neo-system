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

## 3. Modelo de dados

Toda tabela tem `company_id`, RLS, auditoria, `version` e exclusão lógica. Escrita só pelas funções abaixo (ADR 0023).

| Tabela | Campos | Observação |
| --- | --- | --- |
| `assignment` | `client_id`, `chain_id` (sub da cadeia do cliente), `site_id`, `title`, `starts_on`, `ends_on` (até 1 ano), `start_time`, `end_time` (fim antes do início = 夜勤, termina no dia seguinte), `break_minutes`, `work_days` (dias ISO da semana; padrão segunda a sexta), `meeting_place`, `meeting_time`, `note` | Escalação. Valores (valor dia, imposto, adicionais) entram no M2/M3 |
| `assignment_member` | `assignment_id`, `employee_id`, `starts_on`, `ends_on` | Alocação do funcionário: período inteiro ou intervalo dentro dele; uma por funcionário e escalação |

**Funções:**
- `save_assignment(p)`: cria com o id da tela ou edita com `version`. Confere que o sub é da cadeia do cliente e o local é do cliente; não deixa o período encolher para fora das alocações.
- `add_assignment_member(p)`: período inteiro ou intervalo; recusa duplicado, fora do período e horário sobreposto (R06-02).
- `remove_assignment_member(empresa, alocação, version)`: remoção lógica.
- `calendar_days(empresa, de, até, escalação?)`: expande as alocações em dias (até 62), com folga (休), horário, cliente, local, cor e sigla do sub.

Escrita: Proprietário, Gestor e Coordenador (o Coordenador cria escalações, documento-âncora, "Papéis"), com o módulo `scheduling` ligado e a empresa aceitando escrita.

## 4. Regras de negócio

| Regra | Texto |
| --- | --- |
| R06-01 | Cada dia da alocação é dia de trabalho ou folga (休), conforme os dias de trabalho da escalação. No M1, a folga padrão vem das regras de cobrança do cliente. |
| R06-02 | Um funcionário pode ter mais de um trecho na mesma data, desde que os horários não se sobreponham; a alocação sobreposta é recusada. |
| R06-03 | A alocação fica dentro do período da escalação, e o período não pode encolher deixando alocações de fora. |
| R06-04 | A grade e o calendário mostram a cor e a sigla do sub da cadeia (camada 04, R04-03); sem sub, a borda é neutra e aparece a inicial do cliente. |
| R06-05 | O formulário mostra os dias úteis previstos do período. |

## 5. Telas e fluxos

- `/admin/escalacoes`: calendário por **mês** (grade compacta, sigla do sub) ou **semana** (horário e local em cada dia), com navegação e "Hoje"; abaixo, as escalações do período.
- `/admin/escalacoes/nova`: cliente, sub da cadeia, local, título, período, entrada e saída, intervalo, dias de trabalho, 集合場所/時間 e observação; ao salvar, abre a escalação para alocar.
- `/admin/escalacoes/[id]`: dados (Editar), funcionários alocados (Alocar, período inteiro ou intervalo; Remover) e a grade da escalação no estilo do 勤怠表.
- Histórico continua "em construção" (M3).

Referência completa: `docs/telas/inventario-de-telas.md`.

## 6. Permissões por papel

| Ação | Proprietário | Gestor | Coordenador | Funcionário |
| --- | --- | --- | --- | --- |
| Ver calendário e escalações | Sim | Sim | Sim | Não (o próprio dia vem no app, camada 07) |
| Criar e editar escalações, alocar e remover | Sim | Sim | Sim | Não |

## 7. Para o usuário

- **Criar uma escalação:** Escalações → Nova escalação. Escolha o cliente; o sub e o local mostram só os desse cliente.
- **Alocar:** na página da escalação, "Alocar funcionário". Sem datas, ele fica no período inteiro; com datas, só no intervalo.
- **Horário sobreposto:** o sistema avisa e não aloca. Dois trechos no mesmo dia são aceitos quando os horários não se cruzam.
- **Calendário:** alterne entre Mês e Semana; clique num dia para abrir a escalação.

## 8. Pendências

- [ ] Valores (valor dia cobrado, imposto, adicionais) e regras de cobrança herdadas do cliente (M2/M3).
- [ ] Equipes com 班長, alocação por dias específicos e em lote, substituição, escalação interna.
- [ ] Alertas ao alocar (vencimentos, visto) e confirmação acima de 2 unidades no dia.
- [ ] Sobreposição de 夜勤 que atravessa a meia-noite contra o trecho do dia seguinte (hoje só compara o mesmo dia).
- [ ] Mensagem do LINE do dia seguinte e 祝日 no calendário.

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
| 2026-10-30 | 0.2 | D-04: modelo, funções, regras R06-01 a R06-05, telas (calendário mês/semana, nova escalação, página com grade) e permissões | D-04 |
