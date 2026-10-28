# Camada 01 · Identidade e acesso

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R01-NN`.

## 1. Objetivo e escopo

- **Escopo:** login de admins (e-mail + senha, 2FA obrigatório), login de funcionários (código da empresa + nº + PIN; LINE Login na fase 2), papéis, permissões por módulo, log de auditoria, log de acesso a dados sensíveis.
- **Regras:** cadastro do funcionário existe sem login; um login por e-mail ou LINE pode estar ligado a mais de uma empresa; o login por PIN é sempre de uma empresa só. Permissão checada no servidor e no RLS.
- **Pronto quando:** testes provam que nenhum papel lê ou altera fora do seu escopo, e que nenhuma empresa enxerga outra.

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
