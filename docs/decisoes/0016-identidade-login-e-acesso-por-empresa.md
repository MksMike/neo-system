# ADR 0016 — Identidade: login, 2FA e acesso por empresa

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Substitui:** ADR 0004
- **Relação:** usa a ADR 0002 (RLS), a ADR 0006 (portabilidade), a ADR 0013 (Supabase Free) e a ADR 0015 (segurança do MVP)

## Contexto

O sistema tem quatro tipos de usuário: Super Admin, admins da empresa (Proprietário e Gestor), Coordenador e funcionário. O cliente do portal entra na fase 2. Muitos funcionários estrangeiros não usam e-mail. No app, o funcionário só vê a escala e confirma o dia (no M4 entram holerites e documentos).

A ADR 0004 previa código da empresa + nº do funcionário + PIN, sempre de uma empresa só. O Mike decidiu trocar por telefone + PIN, que é mais simples para o campo.

O Supabase Auth não tem login por PIN. A expiração de sessão por inatividade dele só existe no plano Pro, e mesmo lá só é conferida na renovação da sessão.

## Decisão

### Como cada um entra

| Usuário | Login | 2FA | Área |
| --- | --- | --- | --- |
| Super Admin | E-mail + senha | Obrigatório (TOTP) | `/super` |
| Proprietário e Gestor | E-mail + senha | Obrigatório (TOTP) | `/admin` |
| Coordenador | E-mail + senha | Opcional | `/admin`, sem valores |
| Funcionário | Telefone + PIN de 4 dígitos | — | `/m` |
| Cliente do portal | Fase 2 | — | `/portal` |

Um login, seja por e-mail ou por telefone, pode estar ligado a mais de uma empresa. Nesse caso, depois de entrar, a pessoa escolhe em qual empresa está.

### Login do funcionário por telefone e PIN

1. **O telefone é cadastrado pelo admin** na ficha e guardado em formato internacional (E.164, ex.: `+819012345678`). Um telefone corresponde a um login no sistema todo; o mesmo telefone em duas empresas gera duas participações (`membership`) no mesmo login. Não há verificação por SMS no MVP.
2. **O PIN é gerado pelo sistema**, aleatório, quando o admin cria ou redefine o acesso. Na troca pelo funcionário, PINs triviais são recusados (repetidos, sequências, como `0000`, `1234` e `1111`).
3. **O login no Supabase usa um e-mail técnico** que nunca recebe mensagem (`<id>@pin.<domínio>`). A senha é derivada do PIN com HMAC e uma chave secreta que só existe no servidor (`PIN_PEPPER`). Assim, o PIN sozinho não serve para entrar falando direto com o Supabase.
4. **Fluxo do login:** o servidor recebe telefone e PIN, confere os bloqueios, calcula a senha derivada e chama o Supabase Auth. A mensagem de erro é sempre a mesma, para não revelar se o telefone existe.
5. **Bloqueios no banco:** 5 erros bloqueiam aquele telefone por 15 minutos, mais um limite de tentativas por endereço de IP. O admin pode redefinir o PIN a qualquer momento.
6. **Redefinir o PIN encerra todas as sessões** daquele funcionário.

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
- **Funcionário sem telefone não tem acesso ao app** no MVP.
- **O código da empresa deixa de ser usado no login do funcionário.** Continua como identificador curto da empresa no Super Admin.
- **O telefone é dado pessoal.** No MVP só entram números fictícios (ADR 0015).
- **Fase 2:** LINE Login pode ser ligado ao mesmo login do funcionário, como segunda forma de entrar.
