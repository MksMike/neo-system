# ADR 0005 — Infraestrutura por fase e hospedagem

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

Custo baixo no início, dados de folha que exigem backup, Hostinger sem data center no Japão, VPS avaliada.

## Decisão

Desenvolvimento em planos gratuitos (Supabase Free, Vercel Hobby). Go-live (M5) com Supabase Pro em Tóquio (backup diário, sem pausa) e Vercel Pro ou hospedagem Node. Backup externo diário do banco desde o M0. Site e e-mail da Sugita em provedor japonês em nome dela (Xserver recomendado). VPS adiada; reavaliar quando a infraestrutura passar de ~10% da receita.

## Consequências

Planos gratuitos nunca em produção. Contas da plataforma em nome do Mike; contas do site e e-mail em nome da Sugita.
