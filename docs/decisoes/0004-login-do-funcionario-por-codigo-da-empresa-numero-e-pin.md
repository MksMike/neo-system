# ADR 0004 — Login do funcionário por código da empresa, número e PIN

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

Muitos trabalhadores estrangeiros não usam e-mail. LINE Login fica para a fase 2.

## Decisão

Fase 1: código da empresa + nº do funcionário + PIN, implementado sobre o Supabase Auth, com limite de tentativas e bloqueio temporário. Admins (Proprietário e Gestor) entram por e-mail e senha com 2FA obrigatório. Fase 2: LINE Login.

## Consequências

O PIN é sempre de uma única empresa. Um login por e-mail ou LINE pode estar ligado a várias empresas.
