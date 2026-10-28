# ADR 0017 — DevOps: CI, deploy, backup e monitoramento

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** usa as ADRs 0011 (monorepo), 0013 (hospedagem), 0014 (fila) e 0015 (segurança do MVP)

## Contexto

Um desenvolvedor sozinho, com repositório privado no GitHub (conta gratuita), app num Web App Node.js da Hostinger e banco no Supabase Free sem backup automático. O sistema precisa provar a cada mudança que nenhuma empresa enxerga outra, publicar sem quebrar o banco e ter backup restaurável desde o MVP.

Três restrições pesam:

- No GitHub gratuito, proteger a `main` de um repositório privado não é possível (resposta da API: "Upgrade to GitHub Pro or make this repository public").
- Se a Hostinger publicar sozinha a cada push na `main`, o app novo pode subir antes da migração do banco, ou o contrário.
- A documentação da Hostinger não diz se o build dela entende pnpm + Turborepo com o app em `apps/web`.

## Decisão

### 1. Fluxo no GitHub

- Uma branch por tarefa, PR com o modelo do repositório e merge por squash na `main`.
- **Sem proteção da `main`: o repositório fica no plano gratuito** (decisão do Mike, 28/10/2026). O CI roda e mostra o resultado no PR, mas não bloqueia o merge.
- **Regra de trabalho:** nunca fazer merge com o CI vermelho.
- **Trava no deploy (compensação):** o workflow de deploy roda o CI completo de novo sobre a `main` antes de qualquer passo. Se falhar, nenhuma migração é aplicada e nada é publicado.
- Se o projeto passar a ter mais de um desenvolvedor, a proteção da `main` (GitHub Pro ou Team) passa a ser obrigatória.

### 2. CI em todo PR (GitHub Actions)

`pnpm install` com cache → `lint`, `typecheck` e `test` (Turborepo) → `supabase start`, `supabase db reset` e `supabase test db` (migrações do zero + testes pgTAP de RLS) → `build` → `format:check`.

### 3. Deploy controlado pelo CI

No merge na `main`, um workflow:

1. roda o CI completo de novo (a trava do item 1); se falhar, para aqui;
2. aplica as migrações no projeto MVP (`supabase db push`);
3. faz o build do app (Next.js `standalone`) no Actions;
4. publica o resultado numa branch `deploy`, que a Hostinger observa, com comando de start `node server.js`.

Voltar uma versão é republicar um commit antigo da branch `deploy`.

**Toda migração é compatível com a versão anterior do app.** Remover ou renomear coluna se faz em dois deploys: primeiro o app para de usar, depois a coluna sai.

### 4. Ambientes e segredos

- **Ambientes:** local (Supabase no Docker) e MVP (projeto `neo-mvp` + app na Hostinger). Staging quando necessário.
- **Segredos do app** ficam nas variáveis de ambiente da Hostinger: chaves do Supabase, `PIN_PEPPER`, segredo do cookie de inatividade, segredo da rota da fila, Resend e Sentry.
- **Segredos do deploy e do backup** ficam nos secrets do GitHub.
- **Cópia de todos** num gerenciador de senhas. O `.env.example` documenta os nomes, sem valores.

### 5. Backup

- **Diário (GitHub Actions agendado):** dump do banco, criptografado com `age` e enviado para o **Cloudflare R2**, de outro fornecedor. A chave privada fica só com o Mike, fora de qualquer nuvem.
- **Guarda:** 30 diários e 12 mensais.
- **Teste de restauração automático mensal:** o Actions baixa o último backup, restaura num Supabase local e confere contagens por tabela. Falha gera alerta.
- **Arquivos do Storage** entram no backup no gatilho de dados reais (ADR 0015).

### 6. Monitoramento

- **Sentry (plano gratuito):** erros no servidor e no navegador.
- **Monitor de disponibilidade gratuito** chamando `/api/health` a cada 5 minutos. A rota confere o app e o banco; falha gera e-mail. Isso também mantém o app da Hostinger acordado.
- **Falhas da fila** aparecem no Super Admin (ADR 0014).

### 7. Dependências

O Dependabot abre PRs semanais agrupados, passando pelo CI. Como as versões não são fixadas, é assim que elas se mantêm atualizadas com segurança.

## Consequências

- **O primeiro teste prático** é confirmar que a Hostinger publica a partir de uma branch escolhida, com comando de start próprio. Se não publicar, o envio do build muda (por exemplo, SSH), e o resto continua igual.
- **A ordem banco → app é sempre garantida**, e o build da Hostinger deixa de ser um risco.
- **Custo:** zero. O CI usa os 2.000 minutos mensais gratuitos do Actions para repositório privado; rodar o CI de novo no deploy gasta uns minutos a mais por merge.
- **O backup do Supabase Free fica coberto** sem depender do plano Pro, e a restauração é provada todo mês.
