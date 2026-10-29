# Camada 04 · Organizações e locais

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R04-NN`.

## 1. Objetivo e escopo

- **Escopo:** cadastro único de organizações; cliente com endereço, telefone, fax, e-mail, representante, mapa, nº インボイス (validado na API do 国税庁), 締め e prazo de pagamento, 振込名義 (vários); cadeia cliente → subs com cor automática editável e sigla; locais com mapa, raio e 集合場所 frequentes.
- **Regras de cobrança por cliente:** 半日 (% ou fixo), 残業 (por hora ou %), 中止 (0%, % ou cheio), 移動, imposto (税抜/税込 + alíquota), folga padrão (dias da semana, 祝日, períodos), formato do 勤怠表 (consolidado ou por escalação). A escalação herda e pode ajustar.
- **Regras:** cadastro rápido de sub ("+") busca antes para não duplicar ((株) × 株式会社).
- **Pronto quando:** os clientes e subs do Bubble foram importados sem duplicatas e com as cores do 勤怠表.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-30 | Demonstração antes do M1: só os campos essenciais; 締め, prazo, 振込名義 e regras de cobrança no M1 | 0025 |
| 2026-10-30 | Cores da cadeia são tokens do design system (as cores dos tipos de dia, com versão clara e escura), guardadas pelo nome; nenhuma cor livre | — |

## 3. Modelo de dados

Toda tabela tem `company_id`, RLS, `created_*`, `updated_*`, `deleted_at`, `version` e gatilho de auditoria. Escrita só pelas funções abaixo (ADR 0023).

| Tabela | Campos | Observação |
| --- | --- | --- |
| `organization` | `name`, `name_kana`, `normalized_name` (gerado), `is_client`, `postal_code`, `address`, `phone`, `email`, `invoice_reg_no`, `note` | Cadastro único: cliente, sub contratante ou 元請. `normalized_name` é único por empresa (R04-02) |
| `client_chain` | `client_id`, `organization_id`, `position` (1 = mais perto do cliente), `color`, `abbreviation` | Vínculo cliente → sub, com a cor e a sigla usadas no calendário e no 勤怠表 (R04-03) |
| `site` | `client_id`, `name`, `postal_code`, `address`, `radius_m` (padrão 300), `note` | Local de trabalho (planta ou obra) |

**Funções:** `save_organization(p)` (cria com o id da tela ou edita com `version`), `find_organizations(company, nome)` (busca por nome normalizado), `link_subcontractor(p)` (vincula um sub, criando a organização na hora se for nova), `update_chain(p)` (cor, sigla, posição ou remoção lógica, com `version`), `save_site(p)`. Todas exigem Proprietário ou Gestor, o módulo `organizations` ligado e a empresa aceitando escrita (`app.require_company_write`).

**Fica para o M1:** fax, representante, mapa e coordenadas, 締め e prazo de pagamento, 振込名義, regras de cobrança, 集合場所 frequentes, validação do nº de registro na API do 国税庁 e importação do Bubble.

## 4. Regras de negócio

| Regra | Texto |
| --- | --- |
| R04-01 | Organização é um cadastro único por empresa: a mesma empresa externa pode ser cliente de um lado e sub contratante de outro, sem duplicar o cadastro. |
| R04-02 | Nomes iguais com forma jurídica diferente são a mesma organização: (株), 株式会社, ㈱, letras em largura total e espaços não contam. O banco recusa o duplicado, e o "+" rápido mostra as organizações parecidas antes de criar. |
| R04-03 | Cada sub na cadeia de um cliente tem uma cor e uma sigla. A cor nasce automática (a próxima livre naquele cliente) e pode ser trocada, sempre entre as cores dos tokens do design system. |
| R04-04 | Remover um sub da cadeia é lógico: a organização continua cadastrada e o histórico fica no log de auditoria. |
| R04-05 | O local de trabalho tem raio de geolocalização de 50 a 5000 m (padrão 300 m), usado na confirmação do dia pelo celular (camada 07). |

## 5. Telas e fluxos

- `/admin/clientes`: lista com busca, a cadeia em fichas de cor e sigla, número de locais e telefone. Ação: Novo cliente.
- `/admin/clientes/novo`: cadastro do cliente.
- `/admin/clientes/[id]`: dados (Editar), cadeia de subcontratantes (Adicionar subcontratante, cor, remover) e locais de trabalho (Novo local, editar).
- `/admin/clientes/subcontratantes`: subs com os clientes a que estão ligados (sigla e cor por cliente). Ação: Vincular subcontratante a um cliente.
- Documentos e Painel do Cliente continuam como telas "em construção" (M3).

Referência completa: `docs/telas/inventario-de-telas.md`.

## 6. Permissões por papel

| Ação | Proprietário | Gestor | Coordenador | Funcionário |
| --- | --- | --- | --- | --- |
| Ver clientes, cadeia e locais | Sim | Sim | Sim | Não |
| Cadastrar e editar clientes, subs e locais | Sim | Sim | Não | Não |

## 7. Para o usuário

- **Cadastrar um cliente:** em Clientes → Novo cliente. Depois, na página dele, adicione os subcontratantes e os locais.
- **Adicionar um subcontratante:** digite o nome. Se a empresa já estiver cadastrada (mesmo escrita como (株) ou 株式会社), ela aparece na lista: escolha "Usar esta" para não duplicar.
- **Cores:** cada sub recebe uma cor automática no cliente. Para trocar, use o ícone de paleta; as cores são as do sistema e se ajustam ao modo claro e escuro.

## 8. Pendências

- [ ] Campos do M1 (seção 3) e importação do Bubble com as cores do 勤怠表 encaixadas na cor mais próxima dos tokens.
- [ ] Arquivar cliente (exclusão lógica do cadastro inteiro) e lista de locais da empresa (`/admin/locais`).

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
| 2026-10-30 | 0.2 | D-02: modelo de dados, funções, regras R04-01 a R04-05, telas e permissões (escopo da demonstração, ADR 0025) | D-02 |
