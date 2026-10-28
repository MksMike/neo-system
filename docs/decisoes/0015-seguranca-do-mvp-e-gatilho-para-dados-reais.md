# ADR 0015 — Segurança do MVP e gatilho para dados reais

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

O projeto é um MVP funcional. Cumprir desde já todos os requisitos de proteção de dados pessoais (servidor no Japão, criptografia por coluna, chaves fora do banco, restrição de região dos fornecedores) encarece e atrasa o MVP. Por outro lado, parte da segurança é estrutural e muito cara de colocar depois.

## Decisão

**O MVP roda só com dados fictícios ou anonimizados.** Isso inclui a importação do Bubble: dados reais de funcionários não entram antes do gatilho abaixo. A マイナンバー não existe no MVP; o campo nem é criado.

**Mantido desde o início (estrutural):**

- `company_id` + RLS em toda tabela de negócio, com testes pgTAP de isolamento (ADR 0002).
- Chave `service_role` só no servidor, sempre filtrando `company_id`.
- Exclusão lógica e log de auditoria.
- Segredos só em variáveis de ambiente.
- 2FA para Super Admin e admins das empresas.
- Storage privado com links assinados de curta duração.
- Backup diário criptografado.
- Regras da IA da ADR 0008, incluindo o mascaramento de dados sensíveis.

**Adiado até o gatilho:**

- Exigência de servidor da aplicação no Japão.
- Criptografia por coluna e chave fora do banco para 在留カード, conta bancária, saúde e マイナンバー.
- Log de cada visualização de dado sensível.
- Restrição de região e contrato de tratamento de dados com fornecedores (Sentry, Claude, Resend).
- Política de privacidade final com a transferência internacional informada (個人情報保護法, art. 28) e consentimentos formais.

**Gatilho:** antes de entrar o primeiro dado pessoal real de qualquer empresa, seja por importação do Bubble, cadastro manual ou uso pelo campo. Nesse momento, tudo da lista "adiado" é implementado e o Supabase passa para o Pro (ADR 0013). A passagem é registrada por uma ADR nova.

## Consequências

- **O MVP fica mais barato e mais rápido**, sem perder o isolamento entre empresas.
- **A operação paralela com a Sugita (M5) e a importação do Bubble (M1) dependem do gatilho.** O M1 pode validar a importação com uma cópia anonimizada.
- **O modelo de dados já separa os campos sensíveis** (tabelas ou colunas próprias), para que a criptografia entre depois sem reestruturar.
