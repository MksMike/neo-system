# ADR 0023 — Segurança da aplicação e verificação contínua

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** complementa as ADRs 0002 (RLS), 0015 (segurança do MVP), 0016 (identidade), 0017 (CI), 0019 (entradas) e 0020 (erros)

## Contexto

O Mike quer fechar desde já as portas para usuários mal-intencionados: SQL injection e outras vulnerabilidades. Nenhum sistema tem garantia de zero falha; a proteção vem de várias camadas, em que cada falha é barrada pela seguinte, e de verificação automática a cada mudança.

No Supabase, a chave pública fica no navegador. Qualquer pessoa pode chamar a API do banco (PostgREST) diretamente, sem passar pelo app nem pela validação dele. Essa é a porta mais perigosa do projeto.

## Decisão

### Acesso ao banco

- **Usuário anônimo (`anon`) sem permissão em nenhuma tabela.** Login e o mínimo necessário passam por funções específicas.
- **Leitura direta só com RLS:** cada usuário lê apenas o que a sua participação permite (ADR 0016).
- **Nenhuma escrita direta em tabela de negócio.** `INSERT`, `UPDATE` e `DELETE` são revogados do papel `authenticated`. Toda escrita passa por funções SQL que conferem permissão, validam os dados de novo e gravam a auditoria.
- **Restrições `check`** repetem no banco as regras de formato da ADR 0019 (CEP, telefone, valores), como última barreira.
- **Funções `SECURITY DEFINER`** sempre com `search_path` fixo e permissão de execução só para os papéis previstos.
- **SQL dinâmico** só com `format()` usando `%I` e `%L`. Concatenar texto em SQL é proibido.
- **A chave `service_role`** só existe no servidor. Os módulos que a usam importam `server-only`, o que quebra o build se forem parar no navegador.

### Aplicação

| Ameaça | Defesa |
| --- | --- |
| SQL injection | Consultas parametrizadas (supabase-js, funções SQL); SQL dinâmico só com `format(%I, %L)` |
| Acesso a dados de outra empresa | RLS em toda tabela + testes pgTAP |
| Burlar a validação do app | Escrita só por funções SQL; restrições `check`; esquemas Zod estritos (campo extra é recusado) |
| Scripts maliciosos (XSS) | ADR 0019: texto sempre como texto, DOMPurify, CSP |
| Requisição forjada (CSRF) | Verificação de origem nas Server Actions e rotas; cookies `SameSite=Lax`, `httpOnly`, `Secure` |
| Acesso por ID adivinhado | UUIDs + RLS; o ID nunca basta para acessar |
| Força bruta no login | Bloqueio por ID e por IP, 2FA para admins, PIN derivado no servidor (ADR 0016) |
| Arquivo malicioso | Tipo conferido pelo conteúdo, tamanho máximo, bucket privado, link assinado curto, download sempre como anexo; HTML e SVG nunca abertos no navegador |
| Requisição a endereço interno (SSRF) | O servidor não busca URLs informadas por usuário, salvo lista de destinos permitidos |
| Erro revelando detalhes | O cliente só recebe código e mensagem (ADR 0020) |
| Segredo vazado | Segredos só em variáveis de ambiente, `server-only`, varredura de segredos no CI |
| Dependência comprometida | Dependabot com alertas, `pnpm audit` no CI, scripts de instalação bloqueados por padrão no pnpm |

- **Cabeçalhos:** CSP restrito, HSTS, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` e `Permissions-Policy` (geolocalização só no próprio site).
- **Toda tentativa barrada gera um evento** com código `SEC.*` (ADR 0022) e aparece na aba Segurança do painel.

### Verificação contínua

Somam-se ao CI da ADR 0017, em todo PR:
- `supabase db lint`: tabela sem RLS, função com `search_path` aberto, view que fura RLS;
- teste pgTAP que falha se alguma tabela de negócio estiver sem RLS, ou se `anon` e `authenticated` tiverem permissão de escrita direta;
- Semgrep (análise estática de segurança, regras OWASP), gitleaks (segredos no código) e `pnpm audit`.

Além disso:
- **Toda semana:** varredura OWASP ZAP (baseline) contra o ambiente MVP, com resultado no painel.
- **Antes do primeiro dado real** (gatilho da ADR 0015): teste de invasão manual, com as falhas corrigidas antes de seguir.

## Consequências

- **Escrever no banco exige uma função SQL por operação**, mais trabalho em cada tela. Em troca, ninguém grava nada fora das regras, nem chamando a API direto.
- **O helper de ações (ADR 0020)** chama essas funções e traduz os erros delas para os códigos padrão.
- **O CLAUDE.md** recebe a regra de escrita só por funções SQL.
- **O tempo do CI** aumenta poucos minutos, ainda dentro do plano gratuito.
