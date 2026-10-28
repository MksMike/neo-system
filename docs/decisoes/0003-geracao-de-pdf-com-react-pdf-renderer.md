# ADR 0003 — Geração de PDF com @react-pdf/renderer

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

Faturas, 勤怠表, holerites e documentos precisam sair em japonês, com layout estável, sem depender de um navegador headless no servidor.

## Decisão

Modelos em `packages/pdf` com @react-pdf/renderer e fonte Noto Sans JP embutida. O mesmo componente gera prévia e arquivo. Lotes grandes rodam em fila.

## Consequências

Sem infraestrutura extra de Chromium. Layouts muito complexos podem exigir ajustes manuais; testes visuais comparam com referências aprovadas.
