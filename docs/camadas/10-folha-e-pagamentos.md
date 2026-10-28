# Camada 10 · Folha e pagamentos

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R10-NN`.

## 1. Objetivo e escopo

- **Escopo:** folha por ciclo (mensal, quinzenal, semanal, diário) com rascunho automático, revisão, linhas manuais, aprovação, emissão e publicação no app; 給与明細; 請求書 do 下請 gerado no app (rascunho → conferência/contestação → envio → aprovação); 支払明細書; adiantamentos com plano; fila de pagamentos; lote 全銀 e pagamento em dinheiro com comprovante; 賃金台帳 mensal; obrigações anuais (年末調整, 源泉徴収票, 給与支払報告書 até 31/1, 法定調書) prontas antes do primeiro dezembro após o go-live.
- **Ordem de cálculo (社員/パート):** bruto → não tributáveis à parte → 健康保険/厚生年金 pelo 標準報酬月額 (uma vez por mês, no último pagamento do mês por padrão) e 雇用保険 por pagamento → 源泉 (月額表 ou 日額表 pelo ciclo; 甲/乙/丙) → 住民税 (uma vez por mês, no mesmo pagamento) → adiantamentos, multas e outros.
- **Regras 社員/パート:** descontos fora de impostos e seguros só com 労使協定; multa (prevista no 就業規則) ≤ 50% do 平均賃金 de 1 dia por ocorrência e soma ≤ 10% do total do 賃金支払期; salário mínimo conferido; trabalho real em minutos; 中止 e 休業 por motivo da empresa ou do cliente pagam 休業手当 ≥ 60% do 平均賃金 por dia (salvo força maior); 平均賃金 (art. 12) calculado em packages/calc: salários dos 3 meses anteriores ÷ dias corridos, com piso para diaristas de 60% de (total ÷ dias trabalhados); valor-hora do 割増 sem 通勤・家族・住宅手当 (art. 37); 有給: concessão após 6 meses com 80% de presença, proporcional para パート, 5 dias/ano obrigatórios para quem recebe 10 ou mais, 年次有給休暇管理簿, pago pelo 通常賃金 (padrão); acompanhamento de 算定基礎/月変; transferência só com 口座振込同意書; adiantamento acima do já trabalhado é empréstimo (前借金, art. 17) e exige acordo escrito e voluntário.
- **Regras 下請/業務委託:** sem 社会保険/雇用保険; 請求書 mensal com valor cheio + 消費税 (適格 se tiver インボイス); pagamentos semanais/diários são 前払い; descontos só no 支払明細書 (相殺); painel do dono mostra dias/mês e sinais de 偽装請負; multa só se prevista no contrato, com alerta de 偽装請負; フリーランス法 (nov/2024): condições por escrito guardadas no sistema e pagamento em até 60 dias, com alerta; 源泉 de 10,21% só para os tipos de 報酬 previstos em lei (campo por 下請, desligado por padrão); sem インボイス, crédito transitório de 50% (out/2026 a set/2029) pela tabela da plataforma.
- **Pronto quando:** a folha de setembro da Sugita, calculada pelo sistema, bate iene a iene com a do Bubble (diferença só se for erro documentado do Bubble), e um golden test cobre cada regra acima.

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
