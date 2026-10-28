# ADR 0018 — Modelo comercial: contratos, módulos e status

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** base do Super Admin (camada 00); usa as ADRs 0012 (provisionamento) e 0014 (fila)

## Contexto

O sistema está em desenvolvimento. Quando estiver operacional, sem bugs, passa a ser usado pela Sugita Kogyo, investidora do projeto e base de validação no uso real do dia a dia. Depois, vira um SaaS para outras empresas. A Sugita pode indicar empresas parceiras para usar o sistema e dar feedback, sem gerar receita.

O documento-âncora previa cobrança por base mensal + valor por funcionário ativo, com planos fixos (Básico, Padrão, Completo). A especificação anterior do Super Admin tratava "vitalícia" como compra única. Nenhum dos dois atende ao que o Mike precisa agora: cadastrar um cliente, marcar os módulos a que ele tem acesso, definir valor, forma de pagamento e tipo de contrato, e poder cortar o acesso de qualquer empresa, inclusive de parceiras sem receita.

## Decisão

### Cadastro de cliente

No Super Admin, o Mike cadastra cada cliente em quatro passos: dados da empresa → módulos opcionais → contrato → convite do Proprietário. O cadastro roda o provisionamento da ADR 0012.

### Tipos de contrato

| Tipo | Valor | Vencimento | Status automático por atraso |
| --- | --- | --- | --- |
| **Mensal** | Valor fixo por mês, digitado no cadastro | Dia fixo do mês | Sim |
| **Anual** | Valor fixo por ano, digitado no cadastro | Data de aniversário do contrato | Sim |
| **Parceiro (vitalício)** | Nenhum: o sistema sabe que ali não há receita | Não vence | Nunca |

- **O valor é fixo por contrato**, em iene inteiro. Não há cobrança por funcionário ativo nesta fase; ela pode entrar quando o SaaS abrir comercialmente, por ADR nova.
- **O contrato Parceiro** serve à Sugita e às empresas parceiras indicadas por ela. Um campo **"indicada por"** registra qual empresa trouxe a parceira.
- **Período de teste opcional:** no cadastro, o Mike pode dar N dias de teste a um contrato mensal ou anual. Ao fim do teste, a primeira cobrança é gerada e segue a regra de atraso normal.
- **Mudança de contrato com vigência:** trocar tipo, valor ou módulos gera uma nova versão com data de início. O histórico guarda todas as versões (ex.: parceiro que vira cliente mensal).

### Formas de pagamento

- 銀行振込 (transferência) e 現金 (dinheiro), registrados manualmente pelo Mike, com comprovante opcional.
- Registrar um pagamento avança o "pago até" pelo período do contrato (1 mês ou 1 ano), contado a partir do vencimento anterior, não da data do pagamento. A empresa volta a "ativa" na hora.
- Cartão, débito automático e cobrança automática ficam para a fase 3 (gateway).

### Módulos

- Os módulos base (plataforma e configurações) estão sempre ligados.
- Os opcionais são marcados por cliente. Ligar um módulo liga junto as dependências, avisando quais; desligar um módulo de que outro depende é recusado.
- Os planos Básico, Padrão e Completo passam a ser só **modelos**: escolher um pré-marca os módulos, e o Mike ajusta à mão.
- O servidor e o banco recusam o que não foi contratado; esconder o menu não basta.

### Status da empresa

| Status | Quando | O que a empresa consegue fazer |
| --- | --- | --- |
| Teste | Período de teste em curso | Tudo o que os módulos permitem |
| Ativa | Contrato em dia, ou contrato Parceiro | Tudo o que os módulos permitem |
| Em atraso | Venceu, até 7 dias | Tudo, com aviso no topo para o Proprietário |
| Somente leitura | Mais de 7 dias de atraso | Ver e exportar; nada é criado nem alterado |
| Bloqueada | Mais 15 dias de atraso (22 no total), ou suspensa pelo Mike | Admins não entram; funcionários ainda veem os próprios holerites e documentos |
| Cancelada | Contrato encerrado pelo Mike | Dados guardados pelo prazo legal, só para exportação |

- Um job diário (03:00, Tóquio) recalcula o status pelo "pago até" dos contratos mensais e anuais. **O contrato Parceiro nunca muda de status sozinho.**
- **Ações manuais do Mike, para qualquer contrato, sempre com motivo e registro no log da plataforma:**
  - **Suspender:** bloqueia o acesso e trava o status automático até ser reativada. Serve para um problema temporário.
  - **Reativar:** desfaz a suspensão.
  - **Cancelar:** encerra o contrato, com efeito imediato ou numa data marcada.
- **Nenhum status apaga dados.**

## Consequências

- **O Super Admin fica simples:** um valor por contrato, sem contagem de funcionários.
- **O sistema distingue receita de parceria:** o painel separa a receita dos contratos pagos e conta os parceiros à parte.
- **A Sugita entra como Parceiro (vitalício)** e pode ser suspensa ou cancelada como qualquer outra empresa, o que precisa estar coerente com o 覚書 (licença permanente da Sugita, prevista no documento-âncora).
- **Pendentes para a especificação do Super Admin:** limite de admins por contrato, modelo e numeração do recibo ou 請求書 do SaaS (depende da camada 08) e o que cada status mostra em cada tela.
