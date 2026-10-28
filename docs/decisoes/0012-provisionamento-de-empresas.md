# ADR 0012 — Provisionamento de empresas (tenant provisioning)

- **Status:** Proposta — aguardando confirmação do Mike
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** complementa a ADR 0002 (multi-empresa com `company_id` e RLS) e a ADR 0006 (portabilidade)

## Contexto

O Super Admin é a primeira parte a ser construída. Ao cadastrar um cliente, o Mike escolhe as funcionalidades liberadas e o tipo de licença (vitalícia, mensal ou anual), acompanha os pagamentos do SaaS e pode inativar a empresa.

A proposta inicial foi **um banco de dados separado por cliente**, criado automaticamente no cadastro, para garantir isolamento máximo entre empresas (que podem ser concorrentes).

## Opções avaliadas

| | A. Banco único + RLS (ADR 0002) | B. Schema por empresa | C. Banco (projeto Supabase) por empresa |
| --- | --- | --- | --- |
| Isolamento | Lógico, garantido pelo Postgres (RLS) e provado por testes pgTAP | Lógico, por schema | Físico: um vazamento entre empresas fica praticamente impossível |
| Criar empresa | Uma transação (segundos) | Criar schema + rodar migrações | Criar projeto pela API de gerenciamento do Supabase, rodar migrações, configurar Auth, Storage, e-mail, cron e segredos (minutos, com várias etapas que podem falhar) |
| Migrações | Roda uma vez | Roda N vezes | Roda N vezes, em N projetos; uma falha deixa empresas em versões diferentes do sistema |
| Login | Um Auth para todos (o funcionário entra com código da empresa + nº + PIN) | Um Auth | Um Auth por projeto: o app precisa descobrir em qual projeto cada pessoa está antes do login |
| Super Admin | Consulta direta (lista, uso, status de todas as empresas) | Consulta com união de schemas | Precisa consultar N bancos para montar qualquer lista |
| Custo | Um projeto Pro | Um projeto | Um projeto por cliente: o plano Free permite só 2 projetos; no Pro, cada projeto extra cobra computação própria todo mês |
| Backup e restauração | Um processo | Um processo, restauração por empresa mais difícil | N processos para monitorar |
| Suporte no Supabase | Padrão recomendado | APIs e Realtime não foram feitos para muitos schemas | Funciona, mas toda a operação vira sua responsabilidade |

## Decisão (recomendada)

**Banco único com RLS continua sendo o padrão (opção A), e "provisionamento" passa a ser um processo formal**, executado por uma única função transacional no banco quando o Mike cadastra um cliente:

1. Cria a empresa (`company`) com código único de login.
2. Cria a licença (`license`) com tipo, início, vencimento e preço.
3. Liga os módulos escolhidos (`company_module`), respeitando dependências entre módulos.
4. Cria as configurações padrão da empresa (締め, jornada, tema), com `valid_from`.
5. Cria os papéis padrão (Proprietário, Gestor, Coordenador, Funcionário).
6. Reserva a pasta da empresa no Storage (`company/<id>/…`), protegida por política.
7. Convida o Proprietário por e-mail.
8. Registra tudo no log da plataforma.

Se qualquer passo falhar, nada é criado.

**Isolamento dedicado como opção paga (opção C sob demanda):** como o código é o mesmo (ADR 0006), uma empresa que exigir banco próprio (contrato, auditoria, volume) roda numa instalação dedicada: outro projeto Supabase com o mesmo código e migrações, contendo só essa empresa. Isso vira um plano "Dedicado", com custo de infraestrutura repassado. A Sugita pode ser a primeira, se o 覚書 exigir.

### Camadas de segurança entre empresas no banco único

- RLS em toda tabela de negócio; o `company_id` vem do token de login, nunca do formulário.
- Testes pgTAP obrigatórios no CI: para cada tabela, um usuário da empresa A não lê, não cria, não altera e não apaga nada da empresa B.
- Chave `service_role` só no servidor, só em funções revisadas, sempre filtrando `company_id` (CLAUDE.md, regra 1).
- Arquivos no Storage com caminho por empresa e política própria; links de download sempre assinados e com validade curta.
- Log de acesso a dados sensíveis e log de ações da plataforma.
- O Super Admin entra no espaço de uma empresa só com permissão dela, por tempo limitado e com log.

## Consequências

- O Super Admin (camada 00) deixa de ser só M6: a **base** (empresas, módulos, licenças, status e bloqueio) entra agora, porque toda camada seguinte consulta "esta empresa tem este módulo?" e "esta empresa pode escrever?". Cobrança automática por gateway continua na fase 3.
- Toda checagem de módulo e de status acontece no servidor e no banco (funções `has_module` e `company_can_write`), nunca só escondendo botão.
- Se o Mike preferir a opção C como padrão para todos, esta ADR é reescrita antes da tarefa SA-03 e o modelo do Super Admin passa a ter um "registro de instalações" (qual projeto atende cada empresa).
