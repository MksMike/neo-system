# Camada 00 · Plataforma

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R00-NN`.

## 1. Objetivo e escopo

- **Escopo:** cadastro de empresas, planos (Básico, Padrão, Completo), ajustes individuais, add-ons, cotas, assinatura, bloqueio, cobrança do SaaS, tabelas legais versionadas, painel Super Admin.
- **Regras:** cobrança = base mensal (inclui N pessoas) + preço por funcionário ativo no mês (teve ao menos um registro; 下請 conta). Planos se diferenciam por funcionalidade. Admins (Proprietário + Gestor) por plano: Básico 2, Padrão 3, Completo ilimitado. Gateway de cobrança recorrente na fase 3. Limite atingido bloqueia só novos cadastros. Status: Teste → Ativo → Em atraso (tolerância) → Somente leitura → Bloqueado; Cancelado guarda dados para exportação pelo prazo legal. Bloqueio nunca apaga dados e mantém o funcionário vendo os próprios holerites. Acesso de suporte só com permissão e log.
- **Pronto quando:** uma empresa nova é criada, recebe plano e ajuste, e cada limite e funcionalidade é recusado pelo servidor quando fora do plano (teste automatizado por regra).

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-28 | Provisionamento de empresas em banco único com RLS; banco dedicado como plano pago. Base do Super Admin antecipada para o início (módulos, licença vitalícia/mensal/anual, status e bloqueio) | 0012 (proposta) |

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
