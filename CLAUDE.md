# CLAUDE.md — NEO-SYSTEM

Instruções para o Claude Code neste repositório. Leia este arquivo inteiro no início de toda sessão. A ordem atual de trabalho está em `COMECE-AQUI.md`.

## O que é o projeto

NEO-SYSTEM é um SaaS multi-empresa para empresas de genba (manutenção e construção terceirizada) com equipes majoritariamente estrangeiras no Japão. A primeira cliente é a Sugita Kogyo (株式会社杉田工業), que hoje usa um MVP em Bubble. O sistema tem três públicos: painel admin (web), app do funcionário (PWA) e Super Admin (plataforma).

## Fontes de verdade (nesta ordem)

1. `docs/00-ancora.md` — documento-âncora: princípios, regras transversais, camadas, roadmap. Em conflito, ele vence.
2. `docs/decisoes/` — ADRs. Uma decisão só muda por um ADR novo que substitui o anterior.
3. `docs/camadas/NN-*.md` — documento de cada camada: regras numeradas (`R07-03`), modelo de dados, telas, permissões.
4. `docs/02-stack-e-convencoes.md` — stack, versões, estrutura de pastas, convenções de código.
5. `docs/design-system.html` (abra no navegador) e `docs/design-tokens.json` — identidade visual. Toda tela segue os tokens e componentes deles; nada de cor, raio ou sombra fora dos tokens.
6. `COMECE-AQUI.md` — ordem das tarefas atuais (Super Admin primeiro).

## Como trabalhar

- **Antes de codar:** leia o documento da camada da tarefa e as regras transversais do documento-âncora.
- **Depois de codar, no mesmo PR:** atualize o documento da camada (regras, modelo de dados, seção "Histórico") e o `CHANGELOG.md`.
- **Decisão estrutural nova** (biblioteca nova, mudança de modelo de dados, regra legal): proponha um ADR em `docs/decisoes/` antes de implementar e peça confirmação ao Mike.
- **Dúvida de regra de negócio:** pergunte. Nunca invente regra de folha, imposto ou cobrança.
- Commits no padrão Conventional Commits com a camada no escopo: `feat(07): confirmação do dia pelo 班長`.
- Uma tarefa por branch: `feat/07-apontamento-班長` vira `feat/07-apontamento-hancho` (nomes de branch só ASCII).

## Regras que nunca podem ser quebradas

1. **Isolamento por empresa:** toda tabela de negócio tem `company_id` e política RLS. Nunca use a chave `service_role` no navegador. Toda consulta de servidor que use `service_role` filtra por `company_id` explicitamente e tem teste.
2. **Dinheiro:** valores finais em iene inteiro (`bigint`/`number` inteiro). Cálculos intermediários em decimal (`decimal.js`), nunca `float`. Arredondamento só nos pontos definidos nas regras.
3. **Cálculos de folha, imposto e fatura** ficam em `packages/calc`, como funções puras com golden tests. Nenhuma regra de dinheiro calculada só na tela ou só no SQL.
4. **O passado não muda sozinho:** configurações têm `valid_from`; fechamentos guardam snapshot; períodos fechados travam; documento emitido nunca é editado (corrige-se com nova versão).
5. **Nada é apagado de verdade:** exclusão lógica (`deleted_at`) e log de auditoria em toda tabela de negócio.
6. **A lei vence a configuração:** mínimos legais (adicionais, salário mínimo, limites de multa) são travas, não sugestões.
7. **Datas:** datas de negócio como `date` em Asia/Tokyo; instantes como `timestamptz` UTC; tempo de trabalho em minutos.
8. **Dados sensíveis** (在留カード, マイナンバー, conta bancária, saúde) só para papéis autorizados, com log de acesso. マイナンバー nunca vai para a IA nem para logs.
9. **IA nunca age sozinha:** não envia, aprova, paga nem apaga. Toda chamada de IA passa por `packages/ai` (camada 16).
10. **Segredos** só em variáveis de ambiente. Nada de chave em código, teste ou documentação.
11. **Toda entrada é validada e higienizada** (ADR 0019), em todo o projeto:
    - todo campo usa um tipo de `packages/validation` (Zod), igual na tela e no servidor, com normalização NFKC;
    - máscaras: CEP `123-4567`, celular `090-1234-5678`, fixo e fax pelo código de área; no banco, só dígitos;
    - texto é sempre exibido como texto: `dangerouslySetInnerHTML` é proibido, e HTML formatado passa pelo DOMPurify;
    - exportação CSV/Excel neutraliza fórmulas;
    - SQL só parametrizado.
12. **Nenhuma falha é silenciosa** (ADR 0020):
    - criação idempotente por ID gerado na tela;
    - edição com `version` (concorrência otimista);
    - toda ação devolve `{ ok, code, message }`, e a tela mostra um alerta no idioma do usuário;
    - repetição automática só em operação idempotente.
13. **Escrita só por funções SQL** (ADR 0023):
    - `anon` sem acesso a tabelas, e `authenticated` sem `INSERT`, `UPDATE` ou `DELETE` direto em tabela de negócio;
    - funções `SECURITY DEFINER` com `search_path` fixo;
    - SQL dinâmico só com `format(%I, %L)`;
    - módulos com `service_role` importam `server-only`.
14. **Todo evento tem código do catálogo** (`ÁREA.CATEGORIA.EVENTO`, ADR 0022), e nenhum log contém PIN, senha, token ou dado pessoal.

## Idiomas

- Código, nomes de tabelas, variáveis e commits: inglês (termos japoneses de domínio em romaji quando não houver equivalente: `hancho`, `kintaihyo`, `seikyusho`). O glossário do documento-âncora define o nome de cada entidade no código.
- Documentação: português.
- Textos da interface: sempre por i18n (`next-intl`), nunca fixos no componente. Idiomas da fase 1: ja, pt, es, en (app do funcionário); ja, pt (painel admin).
- Documentos oficiais em PDF: sempre em japonês.

## Comandos

Todos rodam na raiz e passam pelo Turborepo (cache em `.turbo/`). Dependências novas entram por `pnpm add`, que grava a faixa `^`; nunca escreva versão exata no `package.json`.

```bash
pnpm install          # dependências
pnpm dev              # app web local (a partir da tarefa SA-03)
pnpm build            # build de tudo
pnpm test             # testes unitários (Vitest)
pnpm test:e2e         # testes ponta a ponta (Playwright, a partir da tarefa SA-06)
pnpm lint && pnpm typecheck
pnpm format           # Prettier (format:check no CI)
pnpm db:start        # Supabase local no Docker (portas 55320–55329)
pnpm db:reset        # recria o banco local com migrações e seeds
pnpm db:lint         # linter do banco (falha em aviso)
pnpm db:test         # testes pgTAP (isolamento, permissões, regras)
pnpm db:stop         # para o Supabase local
```

## Definition of Done

- Regras da camada e regras transversais cumpridas.
- Testes escritos e passando; cálculo com golden test; RLS com teste.
- Textos em todos os idiomas da fase.
- Documento da camada e CHANGELOG atualizados.
- Telas seguindo o design system (tokens, componentes, estados de hover, foco, erro, carregando e vazio).
