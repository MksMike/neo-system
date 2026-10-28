# Camada 04 · Organizações e locais

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R04-NN`.

## 1. Objetivo e escopo

- **Escopo:** cadastro único de organizações; cliente com endereço, telefone, fax, e-mail, representante, mapa, nº インボイス (validado na API do 国税庁), 締め e prazo de pagamento, 振込名義 (vários); cadeia cliente → subs com cor automática editável e sigla; locais com mapa, raio e 集合場所 frequentes.
- **Regras de cobrança por cliente:** 半日 (% ou fixo), 残業 (por hora ou %), 中止 (0%, % ou cheio), 移動, imposto (税抜/税込 + alíquota), folga padrão (dias da semana, 祝日, períodos), formato do 勤怠表 (consolidado ou por escalação). A escalação herda e pode ajustar.
- **Regras:** cadastro rápido de sub ("+") busca antes para não duplicar ((株) × 株式会社).
- **Pronto quando:** os clientes e subs do Bubble foram importados sem duplicatas e com as cores do 勤怠表.

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
