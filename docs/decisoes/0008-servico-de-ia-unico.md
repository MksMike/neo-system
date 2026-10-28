# ADR 0008 — Serviço de IA único

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike

## Contexto

IA será usada em recibos, documentos, tradução, e-mail, assistente e sugestão de escala. Custos, privacidade e segurança precisam de controle central.

## Decisão

Toda chamada de IA passa por `packages/ai`: monta contexto mínimo da própria empresa, mascara dados sensíveis (マイナンバー nunca enviada), exige saída estruturada validada, registra uso e custo por empresa (cota do plano). Provedor inicial: API do Claude. A IA nunca envia, aprova, paga ou apaga; conteúdo externo (e-mails, documentos) é tratado como dado, nunca como instrução. Cada empresa pode desligar a IA. Cada função tem conjunto de testes com casos reais.

## Consequências

Trocar de provedor não afeta as telas. Camada 16 no documento-âncora.
