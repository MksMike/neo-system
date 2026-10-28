# Camada 09 · Fechamento e faturamento

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R09-NN`.

## 1. Objetivo e escopo

- **Escopo:** tela de fechamento da escalação (resumo por sub e por funcionário, pendências, divergências, cobrança extra, 立替金, 値引き); geração do 請求書 consolidado por cliente no 締め dele; 勤怠表 consolidado ou por escalação no mesmo PDF; ciclo 発行済 → 送付済 → 入金済 (aceita parcial); atraso gera alerta (tarefa automática na fase 2).
- **Regras:** pendentes bloqueiam o fechamento; divergências só avisam. Escalação que atravessa o 締め é dividida. Escalações com 税抜 e 税込 não vão na mesma fatura. Imposto uma vez por alíquota; 立替金 separado e não tributável. 支払期限 pela regra do cliente; se cair em dia não útil, antecipa para o dia útil anterior (padrão, configurável por cliente). Número インボイス da empresa obrigatório. Totais de 定日/人工 do 勤怠表 conferidos contra a fatura antes de gerar.
- **Pronto quando:** o 請求書 de setembro do 熊澤工業 (¥1,047,200) é reproduzido exatamente a partir dos registros.

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
