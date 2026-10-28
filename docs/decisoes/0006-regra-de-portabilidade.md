# ADR 0006 — Regra de portabilidade

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

Evitar que a escolha de fornecedor (Supabase, Vercel) vire reescrita no futuro.

## Decisão

Regras de negócio em Postgres padrão (SQL + RLS); login, arquivos e filas do Supabase atrás de `packages/db`; Next.js sem recursos exclusivos da Vercel; backup externo restaurável.

## Consequências

Um pouco mais de código de adaptação. Migrar para VPS ou outra nuvem vira troca de implementação.
