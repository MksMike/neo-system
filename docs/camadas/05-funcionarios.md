# Camada 05 · Funcionários

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R05-NN`.

## 1. Objetivo e escopo

- **Escopo:** ficha no padrão do 作業員名簿 (全建統一様式第5号): pessoal, trabalho, vínculo, saúde, seguros, qualificações, estrangeiro (nacionalidade, 在留資格, validade, nº e fotos do cartão, 就労制限, data da última verificação), nível de japonês, pagamento (tipo, diária genba, diária interna, ciclo, forma, 口座振込同意書, 扶養, 甲/乙/丙, 住民税, 標準報酬月額), dados de 下請 (屋号, インボイス, 労災特別加入, conta).
- **Regras:** vínculos: 社員, パート, 下請, 業務委託. Vencimentos (在留カード, qualificações, 健康診断, 労災特別加入) alertam com 30 dias e bloqueiam a escalação ao vencer. Visto com restrição avisa na escalação. 在留カード e conta bancária só para o Proprietário, delegável ao Gestor com log. Regra de inscrição com alerta: 社会保険 para パート (20h/semana, ¥88.000/mês, empresa com 51+ pessoas, exceto estudantes) e 雇用保険 (20h/semana e 31 dias de contrato previsto). Integrações: ficha compatível com a Green Site (M1); CCUS (fase 3). Funcionário inativo fica no histórico.
- **Pronto quando:** a ficha tem todos os campos do 作業員名簿 e da Green Site (o PDF sai no M3) e os funcionários do Bubble foram importados.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |
| 2026-10-30 | Demonstração antes do M1: só os campos essenciais; a ficha do 作業員名簿 entra no M1 | 0025 |
| 2026-10-30 | Acesso ao app por ID de 8 dígitos + PIN gerado pelo sistema | 0016 |

## 3. Modelo de dados

| Tabela | Campos | Observação |
| --- | --- | --- |
| `employee` | `user_id` (opcional), `full_name`, `name_kana`, `employment_type` (`regular` 社員, `part_time` パート, `subcontractor` 下請, `freelancer` 業務委託), `nationality` (ISO 3166-1, 2 letras), `mobile_phone`, `hire_date`, `status` (`active`, `inactive`), `note` | Com `company_id`, RLS, auditoria, `version` e exclusão lógica. O cadastro existe sem login; `user_id` é preenchido quando o acesso é criado (ADR 0016) |

O login do app usa as tabelas da camada 01: `user_profile` (`login_kind = 'pin'`, `employee_login_id` de 8 dígitos, único no sistema) e `membership` (papel `employee`).

**Funções:**
- `save_employee(p)`: cria com o id da tela ou edita com `version`. Proprietário ou Gestor, módulo `employees`, empresa aceitando escrita.
- `begin_employee_access(empresa, funcionário)`: passo 1, como o usuário do escritório. Confere o direito e devolve o login atual, se houver.
- `finish_employee_access(empresa, funcionário, login, ID, redefinir)`: passo 2, **só `service_role`**. Liga o login técnico ao funcionário, cria o perfil e a participação; ao redefinir, encerra todas as sessões. Sempre filtra a empresa (CLAUDE.md, regra 1).
- `employee_login_ids(logins)`: os IDs de 8 dígitos, só para o escritório da empresa do funcionário.

**Fica para o M1:** a ficha completa do 作業員名簿 (seção 1), dados sensíveis com acesso restrito e log, vencimentos com alerta e a importação do Bubble.

## 4. Regras de negócio

| Regra | Texto |
| --- | --- |
| R05-01 | Vínculos: 社員, パート, 下請 e 業務委託. |
| R05-02 | O acesso ao app é um ID de 8 dígitos, aleatório e único no sistema, mais um PIN de 4 dígitos gerado pelo sistema, nunca trivial (ADR 0016). |
| R05-03 | O PIN aparece uma única vez, na criação ou na redefinição, para ser entregue ao funcionário. Ele não é guardado em lugar nenhum: o login no Supabase usa uma senha derivada por HMAC com a chave `PIN_PEPPER`, que só existe no servidor. |
| R05-04 | Redefinir o PIN mantém o ID e encerra todas as sessões abertas daquele funcionário. |
| R05-05 | Funcionário inativo não ganha acesso nem redefinição de PIN; o cadastro fica no histórico. |
| R05-06 | O celular é só contato; o login nunca usa o telefone (ADR 0016). |

## 5. Telas e fluxos

- `/admin/funcionarios`: lista com busca, vínculo, nacionalidade, ID de login, celular e situação. Ação: Novo funcionário.
- `/admin/funcionarios/novo`: cadastro.
- `/admin/funcionarios/[id]`: dados (Editar, inclusive situação) e acesso ao app (Criar acesso; Redefinir PIN com confirmação). O ID e o PIN aparecem num diálogo para entregar ou imprimir.
- Documentos e Holerites continuam "em construção" (M3 e M4).

Referência completa: `docs/telas/inventario-de-telas.md`.

## 6. Permissões por papel

| Ação | Proprietário | Gestor | Coordenador | Funcionário |
| --- | --- | --- | --- | --- |
| Ver funcionários e o ID de login | Sim | Sim | Sim | Só o próprio cadastro |
| Cadastrar e editar funcionários | Sim | Sim | Não | Não |
| Criar acesso ao app e redefinir PIN | Sim | Sim | Não | Não |

## 7. Para o usuário

- **Cadastrar:** Funcionários → Novo funcionário. Depois, na página dele, use "Criar acesso ao app".
- **Entregar o acesso:** o sistema mostra o ID (ex.: 4821-7305) e o PIN. Anote ou imprima na hora: o PIN não aparece de novo.
- **Esqueceu o PIN:** na página do funcionário, "Redefinir PIN". O ID continua o mesmo, e o celular dele precisa entrar de novo.

## 8. Pendências

- [ ] Cartão com QR code que abre o login com o ID preenchido (ADR 0016, item 3): precisa de uma biblioteca de QR (ADR antes).
- [ ] Vincular um ID que já existe em outra empresa (a mesma pessoa em duas empresas, ADR 0016, item 2).
- [ ] Ficha completa do M1 (seção 1) e importação do Bubble.

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
| 2026-10-30 | 0.2 | D-03: modelo, funções, regras R05-01 a R05-06, telas, permissões e acesso ao app por ID + PIN | D-03 |
