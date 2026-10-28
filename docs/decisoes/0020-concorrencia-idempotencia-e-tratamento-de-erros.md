# ADR 0020 — Concorrência, idempotência e tratamento de erros

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** usa as ADRs 0013 (limites da Hostinger) e 0014 (fila); base da ADR 0021 (offline)

## Contexto

O Mike quer o backend preparado para muitas requisições ao mesmo tempo ao criar registros e, quando algo falhar, um fallback que gere um erro e mostre um alerta ao usuário.

Os riscos concretos:
- clique duplo ou reenvio criando registros duplicados;
- duas pessoas editando o mesmo registro;
- numeração de documentos repetida;
- conexões ao banco esgotadas;
- a Hostinger cortar requisições em 120 s ou responder 503 quando o plano atinge o limite de processos.

## Decisão

### Criar sem duplicar (idempotência)

- Todo registro novo recebe o ID (UUID) gerado na tela, antes de enviar.
- O servidor grava com esse ID. Se ele já existe, devolve o registro existente em vez de criar outro.
- Clique duplo, reenvio automático e registros offline (ADR 0021) nunca duplicam.

### Editar sem atropelar (concorrência otimista)

- Toda tabela de negócio tem uma coluna `version`, incrementada a cada alteração.
- A edição envia a versão que a tela leu. Se ela não bate, o servidor recusa com o código `conflict`.
- A tela mostra "Este registro foi alterado por outra pessoa" e recarrega o dado novo.

### O banco como última barreira

- Operações que mexem em mais de uma tabela rodam numa transação, em função SQL.
- Chaves únicas, chaves estrangeiras e restrições `check` garantem a integridade, mesmo com erro no app.
- **Numeração de documentos:** um contador por empresa e tipo, travado na transação (`SELECT … FOR UPDATE`). Nunca repete nem pula por concorrência.
- **Conexões:** o servidor usa o pooler do Supabase (Supavisor, modo transação).

### Trabalho pesado

- O que pode passar de alguns segundos vai para a fila (ADR 0014).
- A tela recebe "em processamento" na hora e é avisada quando termina.

### Erros e alertas (fallback)

- **Resposta padrão de toda Server Action e rota:** `{ ok: true, data }` ou `{ ok: false, code, message }`.
- **Códigos estáveis**, como `validation`, `conflict`, `not_found`, `forbidden`, `company_read_only`, `module_disabled`, `rate_limited`, `timeout`, `unavailable` e `internal`.
- **Mensagens por i18n**, no idioma do usuário, nunca com detalhes técnicos.
- **Na tela:**
  - todo erro vira um alerta (Sonner), com "Tentar de novo" quando faz sentido;
  - erro de campo aparece no próprio campo;
  - nenhuma falha é silenciosa.
- **Tempo limite e novas tentativas:**
  - a tela desiste de esperar em ~30 s, bem antes do corte de 120 s da Hostinger;
  - em `timeout`, `unavailable` (503) ou falha de rede, operações idempotentes são repetidas sozinhas até 3 vezes, com espera crescente, antes de mostrar o alerta;
  - operações não idempotentes nunca são repetidas sozinhas.
- **Páginas:** `error.tsx` em cada área (`/super`, `/admin`, `/m`) mostra uma tela de erro com "Tentar de novo", sem derrubar o app inteiro.
- **Registro:** todo erro `internal`, `timeout` e `unavailable` vai para o Sentry, com o ID da requisição. A mensagem mostra esse ID, para o suporte achar o erro.
- **Limite de requisições:** ações sensíveis (login, envio de e-mail, geração em lote) têm limite por usuário e por IP, gravado no banco.

## Consequências

- Toda ação do servidor segue o mesmo formato. Um helper em `packages/db` monta a resposta e trata os erros conhecidos do Postgres (violação de chave única, de restrição, de RLS).
- Testes cobrem: clique duplo, duas edições simultâneas, numeração com chamadas concorrentes e repetição automática só em operações idempotentes.
- A coluna `version` entra nas colunas obrigatórias de toda tabela de negócio (documento 02).
