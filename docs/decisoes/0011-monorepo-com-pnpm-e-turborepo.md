# ADR 0011 — Monorepo com pnpm e Turborepo

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

App, cálculos, PDF, design system e IA precisam ser testados e versionados juntos.

## Decisão

Monorepo pnpm + Turborepo com apps/web e packages/ui, calc, pdf, db, ai, config.

## Consequências

Um PR muda código e documentação juntos. Build e testes em cache pelo Turborepo.
