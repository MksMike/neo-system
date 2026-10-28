# ADR 0007 — Dinheiro, tempo e cálculos testados

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

Erros de folha e imposto têm impacto legal e financeiro direto.

## Decisão

Valores finais em iene inteiro; intermediários em decimal.js; arredondamento só em pontos definidos e numerados. Tempo de trabalho em minutos. Todos os cálculos em `packages/calc` como funções puras com golden tests de casos reais anonimizados. Validação final em operação paralela com o Bubble.

## Consequências

Nenhuma mudança de cálculo entra sem caso de teste novo.
