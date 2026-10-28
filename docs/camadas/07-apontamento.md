# Camada 07 · Apontamento

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R07-NN`.

## 1. Objetivo e escopo

- **Escopo:** card "Hoje" no app com confirmação em um toque (定時) e exceções (残業, 半日, fora do horário, escritório, adicionais, observação, foto); modo 1 toque ou 出勤 + 退勤; geolocalização com raio por local; confirmação pelo 班長 para os membros liberados; registro de trabalho interno pelo funcionário (aguarda aprovação); ocorrências e multas pelo admin; solicitação de correção. Fase 2: modo offline (grava no celular com horário e localização do toque e sincroniza depois).
- **Travas:** passado não muda, exceto por (a) solicitação de correção aprovada pelo admin ou (b) registro tardio pelo 班長 ou admin até o fechamento da escalação, com motivo obrigatório, marcado no registro e listado no fechamento; hoje editável até o corte configurável (ex.: 5h do dia seguinte); futuro aceita marcar e desmarcar 休 (有給 vira pedido). 休 futuro avisa admin e coordenador na hora.
- **Regras:** status Pendente → Confirmado → Aprovado; cada registro guarda quem confirmou (próprio, 班長, admin). Em "ambos registram", divergência vai para o admin. Fora do raio ou sem GPS registra e marca, não bloqueia. 班長 não vê valores, não multa e só mexe no passado pelo registro tardio. Trabalho interno em minutos, pago pela diária interna ÷ jornada. Multa (減給の制裁) separada do desconto de tempo não trabalhado; motivo obrigatório; funcionário vê e contesta. Lembrete automático (ex.: 18h).
- **Pronto quando:** uma semana real da Sugita foi registrada pelo app (funcionários e um 班長) e bate com o lançamento manual.

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
