# Camada 12 · Comunicação e alertas

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R12-NN`.

## 1. Objetivo e escopo

- **Escopo M2:** notificações dentro do app e do painel; alertas (pendentes, vencimentos, 休 futuro, divergências); botão "Copiar para LINE".
- **Escopo fase 2:** LINE公式アカウント + Messaging API (escala individual, holerite disponível, lembretes), LINE Login, tarefas automáticas (vencimentos, pendentes, fechamento chegando, fatura não enviada, pagamento atrasado).
- **Regras:** toda mensagem no idioma do destinatário; custo da API do LINE acompanhado por empresa.

* **E-mail M3:** envio de 請求書 e 勤怠表 a partir do fechamento, pela caixa da empresa, com destinatário do cadastro do cliente.
* **E-mail fase 2:** caixa de entrada integrada à caixa da empresa (IMAP/SMTP primeiro, cobrindo Xserver, Hostinger, お名前.com; depois Gmail e Microsoft por OAuth), consulta a cada poucos minutos, conversas ligadas ao cliente pelo endereço, "Anexar do sistema" (documentos de funcionário, 請求書), salvar anexo recebido na biblioteca (電子取引), criar tarefa a partir do e-mail, templates com variáveis. Senha da caixa criptografada com chave fora do banco; enviados gravados na pasta Enviados do provedor.
* **Painel de IA no e-mail:** tradução do recebido para o idioma do leitor; resposta escrita em português vira japonês de negócios (敬語, お世話になっております, assinatura) usando o contexto do cliente, com tradução de volta para conferência. A IA nunca envia sozinha.
* **Dados pessoais em anexo:** enviar documentos de funcionário a cliente é 第三者提供; exige consentimento registrado na ficha (colhido na admissão); aviso ao anexar sem consentimento; log de envio.

## 2. Decisões

| Data | Decisão | ADR |
| --- | --- | --- |
| 2026-10-28 | Escopo inicial herdado do documento-âncora | — |

## 3. Modelo de dados

— (definido na implementação)

## 4. Regras de negócio

— (numerar a partir das regras do escopo acima ao implementar)

## 5. Telas e fluxos

Ver `docs/telas/inventario-de-telas.md`.

## 6. Permissões por papel

| Ação | Proprietário | Gestor | Coordenador | Funcionário |
| --- | --- | --- | --- | --- |

## 7. Para o usuário

—

## 8. Pendências

—

## 9. Histórico

| Data | Versão | Mudança | PR |
| --- | --- | --- | --- |
| 2026-10-28 | 0.1 | Documento criado a partir do documento-âncora | — |
