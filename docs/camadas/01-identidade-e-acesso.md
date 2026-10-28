# Camada 01 · Identidade e acesso

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R01-NN`.

## 1. Objetivo e escopo

- **Escopo:** login de admins (e-mail + senha, 2FA obrigatório), login de funcionários (telefone + PIN de 4 dígitos; LINE Login na fase 2), papéis, permissões por módulo, log de auditoria, log de acesso a dados sensíveis.
- **Regras:** cadastro do funcionário existe sem login; qualquer login (e-mail, telefone ou LINE) pode estar ligado a mais de uma empresa, e a pessoa escolhe a empresa depois de entrar; a sessão do funcionário expira após 7 dias sem uso. Permissão checada no servidor e no RLS, por participação (`membership`).
- **Pronto quando:** testes provam que nenhum papel lê ou altera fora do seu escopo, e que nenhuma empresa enxerga outra.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-28 | Login do funcionário por telefone + PIN de 4 dígitos (senha derivada no servidor, bloqueio por tentativas, expiração após 7 dias sem uso); um login pode estar em várias empresas; RLS por `membership`; 2FA exigido também no banco (`aal2`) | 0016 (substitui 0004) |

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
| 2026-10-28 | 0.2 | Decisões de login e acesso por empresa (ADR 0016) | #3 |
