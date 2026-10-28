# Camada 00 · Plataforma

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R00-NN`.

## 1. Objetivo e escopo

- **Escopo:** cadastro de empresas, planos (Básico, Padrão, Completo), ajustes individuais, add-ons, cotas, assinatura, bloqueio, cobrança do SaaS, tabelas legais versionadas, painel Super Admin.
- **Regras:** contrato por cliente, de três tipos (ADR 0018): mensal e anual, com valor fixo em iene e vencimento; Parceiro (vitalício), sem receita, para a Sugita e as parceiras indicadas por ela. Módulos opcionais marcados por cliente; planos Básico, Padrão e Completo são só modelos que pré-marcam módulos. Pagamento por 銀行振込 ou 現金, registrado manualmente; gateway na fase 3. Período de teste opcional. Status: Teste → Ativo → Em atraso (até 7 dias) → Somente leitura → Bloqueado (+15 dias); o contrato Parceiro nunca muda de status sozinho. O Super Admin pode suspender, reativar e cancelar qualquer empresa, com motivo e log. Cancelado guarda dados para exportação pelo prazo legal. Bloqueio nunca apaga dados e mantém o funcionário vendo os próprios holerites. Acesso de suporte só com permissão e log.
- **Pronto quando:** uma empresa nova é criada, recebe plano e ajuste, e cada limite e funcionalidade é recusado pelo servidor quando fora do plano (teste automatizado por regra).

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-28 | Provisionamento de empresas em banco único com RLS; banco dedicado como plano pago; convite pela fila | 0012 |
| 2026-10-28 | Modelo comercial: contrato mensal, anual ou Parceiro (vitalício, sem receita); valor fixo; módulos por cliente; 銀行振込 e 現金; teste opcional; tolerância 7 + 15 dias; suspender, reativar e cancelar com motivo | 0018 |

## 3. Modelo de dados

Primeira versão em `COMECE-AQUI.md`, seção 4. Atualizar aqui ao implementar a tarefa 03.

## 4. Regras de negócio

R00-01 a R00-11 em `COMECE-AQUI.md`, seção 3. Mover para cá ao implementar.

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
| 2026-10-28 | 0.2 | Provisionamento aceito e modelo comercial (ADRs 0012 e 0018) | #3 |
