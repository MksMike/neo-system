# Camada 06 · Rascunho do fluxo completo da escalação

> **Levantamento.** Registra o fluxo atual do MVP em Bubble (levantado em 2026-10-30) e a proposta para o NEO-SYSTEM. A parte da escalação já virou regra em `06-escalacao-e-calendario.md` (R06-06 a R06-10, ADR 0027, 2026-10-31). O fechamento (1.8, 3.3, 3.5) segue para `09-fechamento-e-faturamento.md`, e o registro pelo app (1.7, 3.4) para `07-apontamento.md`.

## 1. Fluxo atual (Bubble)

### 1.1 Criar a escalação

- Uma escalação é de **um cliente** (contratante) e **um período fechado de um mês** (28 a 31 dias): do dia 1 ao último dia, ou no ciclo do cliente (ex.: 25/09 a 24/10). O mesmo cliente pode ter mais de uma escalação no mesmo período, inclusive com ciclos diferentes.
- Campos: contratante, subcontratante, local de trabalho, data e hora de início, data e hora de fim, URL do local de encontro, horário de encontro, valor dia (cobrado do cliente), imposto (10%), total, observações.
- Mostra "Período desta escalação: N dias".
- **Valores adicionais por dia** (toggle), normalmente 出張手当:
  - descrição;
  - valor para o contratante e valor para o funcionário (podem ser diferentes, ex.: 3.000 e 2.000);
  - em geral sem imposto; toggle para cobrar imposto do contratante (込/抜).

### 1.2 Calendário

- Seletor de mês; botões **Novo calendário** e **Finalizar**.
- Cada escalação ativa no mês aparece como card fechado: cliente, etiqueta do sub, período. Ícone amarelo = escalação com adicional.
- Card aberto: resumo por funcionário (★ dias 定時, folgas, horas extras), observações, adicionar funcionário (período inteiro), excluir escalação, grade com um card por dia.
- Cor do funcionário no dia: **verde ★** 定時 · **roxo ⏱** hora extra (com as horas) · **vermelho** folga · **sem cor** ainda não registrado.

### 1.3 Escalar funcionários

1. **Período inteiro:** botão no card da escalação; o funcionário entra em todos os dias do período, inclusive sábados, domingos e feriados (há obras de semanas sem folga).
2. **Dia específico:** clicar no dia → "Detalhes do dia" → "Adicionar funcionário".

### 1.4 Detalhes do dia

- Lista os funcionários do dia, cada um com sub » local; botões **Adicionar funcionário**, **Todos teiji**, **Todos folga**.
- Funcionário expandido: **tudo é editável** no dia:
  - horário (data e hora de início e fim), imposto, horas, período, folga;
  - local e horário de encontro; valor do dia;
  - **multa** (toggle);
  - **adicionais do dia**: um para o funcionário e outro para a empresa (com 込/抜); vêm da escalação e podem mudar;
  - subcontratante, local, observações; apagar o funcionário da escalação.
- **Períodos:** 定時, 半日, 残業, 早出, 夜勤, por hora.
- Dentro da mesma escalação, cada dia de cada funcionário pode ter **sub, local e valor diferentes** (ex.: dia 5, Mike → 前田組 / 三菱ケミカル / 20.000; Jeremy → 岩田産業 / outro local / 25.000).

### 1.5 Multa

- Descontada **só do funcionário**; não aparece no 請求書.
- O **admin decide** e lança (ex.: 3 atrasos seguidos sem justificativa → multa no 4º; falta sem justificativa).
- Tabela de multas (descrição + valor) ou valor livre.

### 1.6 Valores

- O valor da escalação é o que o **cliente paga**; o valor do **funcionário** vem do cadastro dele.
- Hora extra (cliente e funcionário): valor do dia ÷ 8 × 1,25 (ex.: 20.000 → 3.125/h), cada um sobre a sua base.
- Alguns clientes pagam valor dia **com imposto incluso**.

### 1.7 Registro pelo funcionário

- O admin escala; o funcionário vê o calendário da semana no app e marca entrada, saída e 残業.
- O admin revisa e corrige (ex.: o chefe da obra avisa que ele chegou atrasado).

### 1.8 Finalizar

1. Popup: escolhe o cliente → lista as escalações dele no período.
2. Cada escalação: card com 👥 funcionários · dias = valor · horas extras = valor; aberto, uma linha por funcionário (dias = valor, horas extras = valor, total). Totais: 小計, 消費税 10%, 税込み, 合計金額. Botões **Itens adicionais** e **Confirmar** (o card fica verde).
3. **Itens adicionais** = reembolso de despesas (gasolina, pedágio): descrição + valor do recibo, já com imposto; entram em 税込み. Podem ficar ligados a uma escalação ou direto ao 請求書 do cliente.
4. Rodapé: totais do cliente, data de criação (発行日), data de vencimento (支払期限), Confirmar / Cancelar.
5. Gera o **請求書** (A4 vertical) e o **勤怠表** (A4 horizontal), **agrupados** (um par por cliente) ou **separados** (um par por escalação).

Arredondamento observado: hora extra arredondada por funcionário (17.000 ÷ 8 × 1,25 × 0,5 = 1.328); imposto de 10% sobre o 小計, para baixo (1.091.984 → 109.198).

### 1.9 Documentos

- **勤怠表:** nossa empresa à esquerda, cliente à direita, período no centro (ex.: 10月分); uma linha por funcionário (total de 定日), uma célula por dia (定 / 休 / horas); rodapé com o total por subcontratante (定日, 残業時間).
- **請求書:** cliente 御中, período, ご請求金額 (税込), 発行日, 支払期限, 適格請求書番号 e carimbo; linhas 名称 (sub) · 数量 (定日) · 単位値 · 金額 (税抜) · 諸費税 · 消費税込合計; お支払先; totais 小計 (税抜), 消費税額, 税込金額 (reembolsos), ご請求金額.
- **O par tem o mesmo número** (ex.: 3009-4824), para o admin conferir antes de imprimir e enviar pelo correio. Motivo: já foi enviado um 勤怠表 alterado com um 請求書 que não correspondia.

### 1.10 Problemas conhecidos

- **P1 · Preço por qualificação some no 請求書.** O valor do dia depende da qualificação do funcionário, mas o Bubble agrupa só por sub + local: 2 dias × 20.000 + 2 dias × 30.000 viram "4 dias = 100.000".
- **P2 · Par de documentos divergente.** Nada impede reemitir um documento do par sem o outro.
- **P3 · 税込み aparece 0** quando não há reembolso (no 請求書 do Bubble, 税込金額 vazio ou 0).

## 2. Novo no NEO-SYSTEM (já pedido)

- **Título do trabalho** (toggle): texto + "mostrar em" 請求書 / 勤怠表 / Ambos. Aparece abaixo do nome do sub nos documentos. No banco: `title` (nulo = sem título) e `title_show_on` (`invoice` | `timesheet` | `both`).

## 3. Proposta

### 3.1 Modelo

- `assignment` (escalação): cliente, período (`starts_on`, `ends_on`, 28 a 31 dias), padrões do dia (sub, local, horário, encontro, valor, imposto, adicionais), título, observações.
- `assignment_day` (**dia do funcionário**): um registro por funcionário e data. Nasce com os padrões da escalação; tudo o que for alterado no dia fica gravado nele. Guarda status (pendente / 定時 / 半日 / 残業 / 早出 / 夜勤 / por hora / folga), horas, sub, local, valor cobrado, adicionais, multa e observações.
- O ciclo de corte (末締め, 24日締め) fica no cadastro do cliente, com `valid_from`, só para **sugerir** as datas da nova escalação.

### 3.2 Preço do dia (resolve P1)

- **Não há tabela de preço por cliente nem por qualificação**: o valor é negociado caso a caso (o mesmo cliente paga valores diferentes conforme a equipe).
- O valor dia é definido **na escalação** como padrão e pode ser alterado **por dia**. (Valor por funcionário na escalação: em aberto, ver Pendências.)
- **Linha do 請求書 = sub + local + preço unitário + título.** Dias com valores diferentes nunca se juntam na mesma linha.

### 3.3 Fechamento com versão do par (resolve P2) → ADR (camada 09)

- Gerar o par trava os dias das escalações incluídas.
- Correção = **nova versão do par** (3009-4824-2): os dois documentos sempre juntos; a versão anterior fica marcada como substituída e nunca é editada.
- Código de conferência (ou QR) impresso nos dois documentos.
- Status do par: emitido → enviado → pago.

### 3.4 Registro e revisão

- Guardar a marcação original do app **e** o ajuste do admin, com motivo.
- O dia só entra no fechamento depois de revisado.
- Alertas antes de confirmar: dias sem registro, funcionário em dois lugares na mesma hora, hora extra fora do padrão, dia sem preço.

### 3.5 Reembolsos (立替金)

- Seção própria no 請求書, fora do 小計 tributável (já previsto na camada 09). Ligados à escalação ou só ao cliente.

## 4. Pendências (perguntas ao Mike / ao contador / ao 社労士)

- [ ] **Multa:** limite do 労基法 art. 91 (metade do salário médio de um dia por multa; 1/10 do total do período) e previsão no 就業規則. Confirmar com o 社労士 antes de travar no sistema.
- [x] **Base do funcionário:** valor dia do cadastro ÷ 8 = valor por hora. Por hora: horas trabalhadas × valor por hora (ex.: 3 h). Hora extra: valor por hora × 1,25 × horas extras.
- [x] **半日** = 4 h (metade da diária).
- [x] **早出:** conforme o cliente, é hora extra ou hora normal; quando há valor a mais, o admin lança um adicional do dia (ex.: "早出" + 3.000).
- [x] **Hoje:** trabalho em dia de folga paga o valor normal; 夜勤 depende do cliente e do trabalho.
- [x] **Vínculo:** os funcionários são **一人親方 autônomos (業務委託)**. A empresa os apresenta ao cliente, recebe do cliente e paga cada um mediante a fatura dele. Os mínimos do 労基法 (horas extras, noturno, folga) e o art. 91 (multa) não se aplicam como a empregados; os valores seguem o contrato com cada um.
- [ ] **フリーランス法 (2024):** a empresa contrata autônomos, então valem: condições do trabalho por escrito (取引条件の明示), pagamento em até 60 dias do recebimento do serviço, e **proibição de reduzir o valor combinado** sem culpa do autônomo (減額の禁止). Confirmar com advogado ou 社労士 como as **multas** se encaixam (cláusula no contrato, motivo registrado).
- [ ] **偽装請負:** controlar horário, aplicar multa e dar ordens diretas aproxima a relação de um emprego. Vale revisar o contrato com um especialista; o sistema registra, mas não decide isso.
- [ ] **Pagamento ao autônomo:** ele é 課税 ou 免税事業者? O valor pago inclui 消費税? Há 源泉徴収? Confirmar com o 税理士 antes da camada 10.
- [ ] **Arredondamento:** hora extra por funcionário ou por linha do 請求書? Imposto uma vez por alíquota por fatura (適格請求書), para baixo?
- [ ] **Cliente 税込:** como mostrar no 請求書 quando o valor dia já inclui o imposto (camada 09 já prevê não misturar 税抜 e 税込 na mesma fatura).
- [ ] **Reembolsos:** confirmar com o contador o tratamento como 立替金 (fora do 小計 tributável).
- [x] **Qualificação:** sem regra fixa; o preço é negociado e fica na escalação, no funcionário dentro da escalação ou no dia.
- [x] **Título:** até 120 caracteres (descreve o que foi feito); quebra em várias linhas no 請求書 e no 勤怠表.
- [ ] **Valor por funcionário na escalação** (definir 30.000 para um funcionário em todos os dias dele, em vez de dia a dia): **em aberto**, para debater com o dono da Sugita durante a construção.

## 5. Conflitos com o documento atual da camada 06

| Documento atual | Fluxo levantado |
| --- | --- |
| Período de até 1 ano | Sempre um mês fechado (28 a 31 dias) |
| `work_days` (dias da semana de trabalho) e folga padrão | Todos os dias entram; folga é marcada por dia |
| Alterações só na escalação | Sub, local, valor, adicionais e multa por dia e por funcionário |
| `title` sem "mostrar em" | `title` + `title_show_on` |
