# Camada 03 · Configurações

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R03-NN`.

## 1. Objetivo e escopo

- **Escopo:** dados e marca da empresa (logo, 社印, cores, layout de PDF), 締め e pagamento padrão, jornada e intervalo (horário noturno fixo por lei: 22h–5h), % de adicionais, tipo de 健康保険 e categoria do 雇用保険, catálogos (手当, descontos, adicionais cobrados, ocorrências, categorias de despesa), modo de registro (1 toque ou entrada + saída), regras de vale e adiantamento, 労使協定 (art. 24) e 36協定 registrados, unidade da fatura (定日 ou 人工).
- **Regras:** três camadas: plataforma (tabelas legais) → empresa → ficha do funcionário; o mínimo legal sempre vence (extra 25%, 法定休日 35%, noturno 25%, acima de 60h/mês 50%; somam-se: extra + noturno 50%, 休日 + noturno 60%). Toda configuração com vigência.
- **Pronto quando:** mudar uma configuração com vigência futura não altera nenhum cálculo anterior (teste).

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
