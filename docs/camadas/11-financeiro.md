# Camada 11 · Financeiro

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R11-NN`.

## 1. Objetivo e escopo

- **Escopo M4:** caixas (contas bancárias e caixa físico 現金出納帳), entradas e saídas geradas pelos outros módulos, fluxo de caixa previsto (30/60/90 dias), conferência do caixa físico, despesas com foto do recibo (sem IA) e reembolso 立替精算.
- **Escopo fase 2:** leitura de recibo por IA (loja, data, total, imposto por alíquota 8%/10%, 登録番号 validado), sugestão de categoria e escalação, alerta de duplicidade; importação de extrato CSV por banco, conciliação com aprendizado de 振込名義, pagamento a menor e linhas sem par; pacote mensal do contador (resumo por categoria e 勘定科目, recibos numerados, CSV do software contábil, originais, extrato conciliado).
- **Regras:** imagem original do recibo nunca é alterada; requisitos de スキャナ保存 (電子帳簿保存法) a validar com o 税理士. Despesas aguardam aprovação. "Paguei do meu bolso" vira reembolso não tributável na próxima folha; pode ser cobrado do cliente como 立替金.
- **Pronto quando (M4):** o saldo do caixa no sistema bate com o banco no fim de um mês real.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |

## 3. Modelo de dados

— (definido na implementação)

## 4. Regras de negócio

— (numerar a partir das regras do escopo acima ao implementar)

## 5. Telas e fluxos

Ver `docs/telas/inventario-de-telas.md`.

## 6. Permissões por papel

| Ação | Proprietário | Gestor | Coordenador | Funcionário |
| --- | --- | --- | --- | --- |

## 7. Para o usuário

—

## 8. Pendências

—

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
