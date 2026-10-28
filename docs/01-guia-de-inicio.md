# Guia de início — NEO-SYSTEM no VS Code com Claude Code

Este guia leva a pasta `C:\dev\NEO-SYSTEM` de "só documentação" até o M0 pronto. Siga na ordem; cada etapa do M0 tem um texto pronto para colar no Claude Code.

> **Bloqueante antes de começar o código:** o 覚書 (acordo escrito) sobre propriedade do código, licença e participação da Sugita, revisado por 弁護士 (ver "Modelo de negócio e propriedade" no documento-âncora). A documentação pode avançar; o código do sistema começa depois da assinatura.

## 1. Instalar as ferramentas (Windows)

| Ferramenta | Para quê | Como conferir |
|---|---|---|
| Git | Versionamento | `git --version` |
| Node.js LTS (22+) | Rodar o projeto | `node -v` |
| pnpm | Dependências do monorepo | `corepack enable` e depois `pnpm -v` |
| Docker Desktop | Banco Supabase local | `docker --version` (Docker aberto) |
| Supabase CLI | Banco, migrações, testes de RLS | `npx supabase --version` |
| GitHub CLI | Criar o repositório e PRs | `gh --version`, depois `gh auth login` |
| VS Code + extensões | Editor | ESLint, Prettier, Tailwind CSS IntelliSense, Claude Code |

## 2. Criar o repositório no GitHub

1. Crie uma organização em seu nome (ex.: `neo-system-jp`) — o código é seu, conforme o 覚書.
2. No terminal, dentro de `C:\dev\NEO-SYSTEM`:

```bash
git init -b main
git add .
git commit -m "docs: fundação do projeto (âncora, ADRs, camadas, guia)"
gh repo create neo-system-jp/neo-system --private --source . --push
```

3. Copie `docs/modelos/pull_request_template.md` para `.github/pull_request_template.md` (o GitHub usa esse caminho para o modelo de PR) e faça commit.
4. Em Settings → Branches do repositório, proteja a `main` (exigir PR e CI verde).
5. Ative 2FA na conta do GitHub.

## 3. Contas de infraestrutura (gratuitas no desenvolvimento)

- **Supabase:** crie um projeto na região **Tokyo (ap-northeast-1)**: `neo-mvp` (o segundo projeto gratuito fica para staging, quando necessário). Guarde URL e chaves num gerenciador de senhas, nunca no repositório.
- **Hostinger:** plano Business, Web App Node.js no data center mais próximo do Japão. Conecte o repositório do GitHub quando houver app para publicar e teste cedo o deploy do monorepo (ADR 0013).
- Supabase Pro só no gatilho de dados reais (ADR 0015).

## 4. Marco M0 — tarefas para o Claude Code

> **Ordem atual:** siga as tarefas de `COMECE-AQUI.md`, que começam pelo Super Admin. A lista abaixo é a visão original do M0 e serve de referência.

Abra a pasta no VS Code, inicie o Claude Code e mande uma tarefa por vez. Cada tarefa termina com PR, CI verde e documentação atualizada.

**M0-01 · Monorepo**
> Leia CLAUDE.md, docs/00-ancora.md e docs/02-stack-e-convencoes.md. Crie o monorepo com pnpm + Turborepo exatamente na estrutura do documento 02 (apps/web, packages/ui, calc, pdf, db, ai, config). Configure TypeScript strict, ESLint, Prettier e scripts `dev`, `build`, `lint`, `typecheck`, `test`. Não crie telas ainda. Atualize CHANGELOG.

**M0-02 · App Next.js e design system**
> Crie apps/web com Next.js (App Router) e Tailwind v4. Instale shadcn/ui dentro de packages/ui e aplique os tokens de docs/design-tokens.json, reproduzindo docs/design-system.html (3 temas × claro/escuro, gradientes, raios, sombras, durações). Crie a página interna /dev/ui que mostra todos os componentes, como na página âncora de identidade visual.

**M0-03 · Banco e isolamento**
> Inicialize o Supabase local. Crie a primeira migração com: company, user_profile, membership (papel por empresa), permission, audit_log, e as funções/políticas RLS por company_id. Escreva testes pgTAP provando que um usuário de uma empresa não lê nem escreve em outra e que cada papel só faz o que deve. Documente em docs/camadas/00 e 01.

**M0-04 · Login**
> Implemente login de admin (e-mail + senha, 2FA obrigatório para Proprietário e Gestor) e o login do funcionário por ID de 8 dígitos + PIN de 4 dígitos com limite de tentativas e expiração após 7 dias sem uso, conforme ADR 0016. Rotas (auth), admin, m, super protegidas por papel.

**M0-05 · Idiomas e formatos**
> Configure next-intl com ja, pt, es, en; utilitários de data (Asia/Tokyo, 西暦/和暦), moeda em iene e minutos.

**M0-06 · Esqueleto de navegação**
> Monte o shell do painel admin (menu lateral, cabeçalho, busca ⌘K vazia, troca de tema e idioma) e o shell do app do funcionário (abas inferiores), com todas as páginas de docs/telas/inventario-de-telas.md criadas como páginas vazias com título e estado vazio. O menu deve abrir todas.

**M0-07 · Auditoria, CI e backup**
> Gatilho de auditoria genérico em todas as tabelas de negócio; GitHub Actions com lint, typecheck, test, supabase test db e build; workflow agendado de backup diário do banco para storage externo (credenciais por secrets). Documente o processo de restauração.

**Critério de passagem do M0:** testes de RLS e permissões provam o isolamento entre empresas, e o esqueleto navega por todas as telas.

## 5. Sistema atual no Bubble

Coloque em `docs/legado/` o arquivo de exportação do app (Bubble → Settings → General → Export application). Ele será analisado para mapear as regras de negócio e a migração de dados do M1 e M5. Não coloque exportações com dados pessoais de funcionários no repositório.
