# Camada 08 · Documentos e biblioteca

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R08-NN`.

## 1. Objetivo e escopo

- **Escopo:** motor de PDF (@react-pdf/renderer) com fonte japonesa embutida; modelos de 請求書, 勤怠表, 給与明細, 支払明細書, 請求書 do 下請, 作業員名簿; no M3, modelo padrão com logo e 社印 da empresa; na fase 2, personalização (cores, linhas, layouts) com prévia e prévia em preto e branco; numeração; armazenamento imutável.
- **Regras:** documento gerado é congelado (arquivo + dados usados). Cada tipo tem sequência própria; o 勤怠表 referencia o nº do 請求書. Correções do modelo atual: "岩田残業" → 岩田産業 (cadastro único), "諸費税" → 消費税, remover "税込金額 0円", 社印 sem cobrir o endereço, sem imposto por linha.
- **Pronto quando:** 請求書, 勤怠表 e 作業員名簿 de setembro gerados pelo sistema batem com os atuais e passam na revisão visual (M3); 給与明細 e 支払明細書 são validados no M4.

* **Biblioteca (M3):** pastas, etiquetas, busca; vínculo com funcionário, cliente, escalação ou uso interno; todo documento gerado entra automaticamente; upload e digitalização pela câmera com recorte; versões; permissão por pasta. Primeiro modelo com campos: 在職証明書.
* **Arquivo mensal (M4):** no fechamento do mês pelo Proprietário, um ZIP com PDFs emitidos, planilhas (escalações, registros, folha, adiantamentos, despesas, caixa), recibos originais, `index.html` navegável offline, JSON para reimportação e códigos de verificação. Reabertura gera nova versão. Enviado por e-mail como **link que exige login** e expira, nunca como anexo; sem "PPAP". Downloads no log. O pacote do contador é um recorte dele (fase 2). Não substitui o backup da plataforma.
* **Modelos e editor (fase 2):** modelos com campos do sistema (`{{funcionário.nome}}`…): 在職証明書, 就労証明書, 雇用契約書/労働条件通知書, 給与証明書, 退職証明書, contrato de 請負/業務委託, relatório mensal; os demais a partir de exemplos reais enviados durante o desenvolvimento. Editor de documento A4/A3 (retrato/paisagem, margens, cabeçalho e rodapé) com TipTap; planilha simples com Univer (fase 2 ou 3), importação/exportação de Excel. IA: tradução mantendo layout, rascunho por instrução, OCR; contratos sempre com revisão humana.
* **Logo e 印影:** PNG transparente nas configurações; aplicação do 印影 restrita (padrão: Proprietário), cada uso no log, PDF carimbado congelado na biblioteca.

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
