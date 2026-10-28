# ADR 0002 — Multi-empresa com company_id e RLS

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

O sistema atenderá várias empresas, que podem ser concorrentes entre si. Um vazamento entre empresas destruiria a confiança no produto.

## Decisão

Banco único, toda tabela de negócio com company_id e políticas RLS no Postgres. A aplicação nunca é a única barreira. Testes pgTAP provam o isolamento por papel e por empresa.

## Consequências

Toda migração exige política RLS e teste. Consultas com service_role só no servidor, sempre filtradas por company_id. Uma instalação dedicada (ex.: só a Sugita) usa o mesmo código com uma única empresa.
