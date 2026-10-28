# ADR 0010 — Identidade visual: 3 temas com modo claro e escuro

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

O produto precisa de aparência corporativa, moderna e consistente, com possibilidade de trocar a paleta sem refazer telas.

## Decisão

Design system com tokens semânticos (superfície, texto, borda, primária, estados) e três temas iniciais, cada um com claro e escuro: Azul escuro/grafite claro, Cinza escuro/branco, Roxo escuro/lilás claro. Gradientes suaves só em superfícies de destaque. A página âncora de identidade visual é a referência; `docs/design-system.md` registra os tokens.

## Consequências

Cores são trocadas no token, nunca no componente. A cor primária de cada empresa cliente entra só em destaques, sem quebrar contraste.
