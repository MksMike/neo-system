# ADR 0001 — Stack principal: Next.js, Supabase e TypeScript

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

O MVP em Bubble não escala para um SaaS multi-empresa com folha, faturamento e regras legais. FlutterFlow foi avaliado e descartado: lógica de negócio pesada, código exportado difícil de manter e novo lock-in. O desenvolvedor é solo e trabalha com IA (Claude Code).

## Decisão

Uma única aplicação Next.js (App Router) em TypeScript serve painel admin, app do funcionário (PWA) e Super Admin. Backend no Supabase (Postgres, Auth, Storage, Realtime, Edge Functions) na região de Tóquio.

## Consequências

Um idioma do banco à tela e um único deploy. Dependência do Supabase mitigada pela regra de portabilidade (ADR 0006). App nativo só se surgir necessidade (fase 3).
