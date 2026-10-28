# ADR 0009 — E-mail: caixa da empresa por IMAP/SMTP e avisos por serviço transacional

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

Clientes recebem 請求書 e documentos por e-mail; a empresa já tem caixa no provedor do domínio.

## Decisão

Não hospedar e-mail. Integração com a caixa da empresa por IMAP/SMTP (cobre Xserver, Hostinger, お名前.com); Gmail e Microsoft por OAuth depois. Avisos automáticos por serviço transacional num subdomínio. SPF, DKIM e DMARC obrigatórios.

## Consequências

Senha da caixa criptografada com chave fora do banco. Recebimento por consulta periódica (1 a 5 minutos).
