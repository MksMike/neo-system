# ADR 0024 — 2FA adiado no MVP

- **Status:** Aceita
- **Data:** 2026-10-29
- **Decisores:** Mike
- **Substitui em parte:** ADR 0016 (só a exigência de 2FA; o resto continua valendo)
- **Relação:** ADR 0015 (gatilho de dados reais)

## Contexto

A ADR 0016 exigia 2FA (TOTP) para Super Admin, Proprietário e Gestor, também dentro do banco (sessão `aal2`). O Mike decidiu manter o MVP simples: login só com e-mail e senha, enquanto o sistema roda com dados fictícios (ADR 0015).

## Decisão

- **No MVP, Super Admin, Proprietário e Gestor entram com e-mail e senha**, sem segundo fator.
- **A exigência continua no banco como um interruptor:** a configuração `require_mfa` na tabela `platform_setting`, desligada no MVP. As funções `app.is_platform_admin()` e `app.has_role()` exigem `aal2` só quando ela está ligada.
- **Se a configuração não existir, o padrão é exigir 2FA.** Um erro de dados leva ao lado seguro.
- **O 2FA volta a ser obrigatório no gatilho de dados reais** (ADR 0015), junto com as outras proteções adiadas: tela de cadastro do TOTP, ligar `require_mfa` por migração e testes de ponta a ponta.
- **Medidas que compensam no MVP:**
  - cadastro público desligado no Supabase (só entra quem foi convidado ou criado pelo Super Admin);
  - senha com no mínimo 10 caracteres;
  - o limite de tentativas do próprio Supabase Auth;
  - todo login falho registrado com código (`AUTH.LOGIN.FAILED`).

## Consequências

- Os testes de banco cobrem os dois modos: com `require_mfa` desligado, a sessão sem 2FA é aceita; ligado, é recusada.
- Ligar o 2FA depois é uma migração de uma linha mais a tela de cadastro do TOTP, sem mudar nenhuma política.
- O checklist do gatilho da ADR 0015 ganha o item "2FA obrigatório".
