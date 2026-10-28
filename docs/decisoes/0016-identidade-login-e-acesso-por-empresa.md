# ADR 0016 — Identidade: login, 2FA e acesso por empresa

- **Status:** Aceita; a exigência de 2FA foi adiada no MVP pela ADR 0024
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Substitui:** ADR 0004
- **Relação:** usa a ADR 0002 (RLS), a ADR 0006 (portabilidade), a ADR 0013 (Supabase Free) e a ADR 0015 (segurança do MVP)

## Contexto

O sistema tem quatro tipos de usuário: Super Admin, admins da empresa (Proprietário e Gestor), Coordenador e funcionário. O cliente do portal entra na fase 2. Muitos funcionários estrangeiros não usam e-mail. No app, o funcionário só vê a escala e confirma o dia (no M4 entram holerites e documentos).

A ADR 0004 previa código da empresa + nº do funcionário + PIN, sempre de uma empresa só. Telefone + PIN também foi avaliado e descartado:

- telefones são públicos e fáceis de adivinhar, o que permite testar um PIN comum em muitos números;
- estrangeiros trocam de chip com frequência;
- há quem não tenha telefone próprio;
- o telefone é dado pessoal.

O Supabase Auth não tem login por PIN. A expiração de sessão por inatividade dele só existe no plano Pro, e mesmo lá só é conferida na renovação da sessão.

## Decisão

### Como cada um entra

| Usuário | Login | 2FA | Área |
| --- | --- | --- | --- |
| Super Admin | E-mail + senha | Obrigatório (TOTP) | `/super` |
| Proprietário e Gestor | E-mail + senha | Obrigatório (TOTP) | `/admin` |
| Coordenador | E-mail + senha | Opcional | `/admin`, sem valores |
| Funcionário | ID de 8 dígitos + PIN de 4 dígitos | — | `/m` |
| Cliente do portal | Fase 2 | — | `/portal` |

Um login, seja por e-mail ou por ID, pode estar ligado a mais de uma empresa. Nesse caso, depois de entrar, a pessoa escolhe em qual empresa está.

### Login do funcionário por ID e PIN

1. **O ID tem 8 dígitos numéricos**, gerado aleatoriamente pelo sistema e único no sistema todo, exibido em dois blocos (`4821-7305`). Ele não muda nunca e não carrega nenhum dado pessoal. O login usa o teclado numérico grande, igual em qualquer idioma.
2. **Um ID é um login.** Se a mesma pessoa trabalha para duas empresas, a segunda empresa vincula o ID existente: são duas participações (`membership`) no mesmo login. Isso evita a mesma pessoa ter dois IDs.
3. **Entrega do ID:** no cadastro, o admin entrega um cartão com o ID e um QR code que abre o login com o ID preenchido. Depois do primeiro login, o app guarda o ID no celular; quando a sessão expira, só o PIN é pedido.
4. **O PIN é gerado pelo sistema**, aleatório, quando o admin cria ou redefine o acesso. Na troca pelo funcionário, PINs triviais são recusados (repetidos, sequências, como `0000`, `1234` e `1111`).
5. **O login no Supabase usa um e-mail técnico** que nunca recebe mensagem (`<id>@pin.<domínio>`). A senha é derivada do PIN com HMAC e uma chave secreta que só existe no servidor (`PIN_PEPPER`). Assim, o PIN sozinho não serve para entrar falando direto com o Supabase.
6. **Fluxo do login:** o servidor recebe ID e PIN, confere os bloqueios, calcula a senha derivada e chama o Supabase Auth. A mensagem de erro é sempre a mesma, para não revelar se o ID existe.
7. **Bloqueios no banco:** 5 erros bloqueiam aquele ID por 15 minutos, mais um limite de tentativas por endereço de IP. O admin pode redefinir o PIN a qualquer momento.
8. **Redefinir o PIN encerra todas as sessões** daquele funcionário.
9. **O telefone é só contato:** campo opcional da ficha, fora do login.

### Expiração por inatividade

- A sessão do funcionário expira depois de **7 dias sem uso**.
- O controle é feito pelo app, não pelo Supabase: a cada requisição, o servidor renova um cookie `httpOnly` assinado com a data do último uso. Passado o prazo, a sessão é encerrada e o app pede o PIN de novo.
- Sessões de admin seguem o padrão do Supabase, com 2FA.

### Acesso no banco

- **`membership`** (usuário, empresa, papel, status, validade opcional) diz quem participa de qual empresa e com qual papel. Papéis: `owner`, `manager`, `coordinator`, `employee`.
- **O RLS checa a participação na empresa da linha**, com funções auxiliares: `is_member(company_id)`, `has_role(company_id, roles)` e `is_platform_admin()`.
- **A empresa ativa fica só no app** (cookie), para filtrar as telas. Se o app errar, o banco ainda só mostra empresas de que a pessoa participa.
- **O 2FA também é exigido no banco:** políticas de Proprietário, Gestor e Super Admin exigem sessão `aal2` (claim do token do Supabase).
- **O Super Admin (`platform_admin`) não participa de nenhuma empresa** e por isso não vê dados de negócio (R00-10). Acesso de suporte é uma participação temporária, com validade, concedida pela empresa e registrada no log.
- **`auth.uid()` fica embrulhado em `app.current_user_id()`**, por portabilidade (ADR 0006).
- **O cadastro do funcionário existe sem login:** `employee.user_id` é opcional e só é preenchido quando o acesso é criado.

### Proteção das rotas

- `/super` responde 404 para quem não é Super Admin com 2FA.
- `/admin` exige participação com papel de escritório, e 2FA para Proprietário e Gestor.
- `/m` exige participação como funcionário.
- As mesmas regras estão no RLS: a tela nunca é a única barreira.

## Consequências

- **Sessão, renovação e saída continuam sendo do Supabase.** Não escrevemos criptografia de sessão nem emitimos tokens próprios.
- **Trocar a `PIN_PEPPER` invalida todos os PINs.** Uma rotação exige redefinir os PINs de todos os funcionários.
- **Criar o login técnico do funcionário exige `service_role`.** Isso roda só no servidor, numa ação revisada que confere a empresa, ou pela fila (ADR 0014).
- **Quem perde o ID** pede ao admin, que o vê na ficha e pode reimprimir o cartão.
- **O código da empresa deixa de ser usado no login do funcionário.** Continua como identificador curto da empresa no Super Admin.
- **O ID não é dado pessoal**, mas fica ligado a uma pessoa. Na ficha, ele é tratado como identificador interno.
- **Fase 2:** LINE Login pode ser ligado ao mesmo login do funcionário, como segunda forma de entrar.
