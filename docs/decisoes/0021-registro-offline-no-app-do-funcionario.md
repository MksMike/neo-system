# ADR 0021 — Registro offline no app do funcionário

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** usa a ADR 0020 (idempotência e erros) e a ADR 0016 (sessão do funcionário); muda o ponto #9 do documento-âncora

## Contexto

Os funcionários trabalham muitas vezes em plantas e obras com pouco ou nenhum sinal. O documento-âncora deixava o offline para a fase 2 e, na fase 1, só previa o registro tardio pelo 班長 ou admin. O Mike decidiu que o offline entra junto com o apontamento, no M2.

Restrições técnicas:
- a Background Sync não funciona no Safari do iPhone;
- o Safari pode apagar dados de sites não instalados depois de alguns dias sem uso;
- a hora do celular pode estar errada ou ser alterada.

## Decisão

### O que funciona sem sinal

- **O funcionário confirma o dia e registra exceções:** 定時, 出勤/退勤, 残業, 半日, fora do horário, escritório, adicionais, observação e foto. A foto é comprimida no próprio celular.
- **O 班長 confirma a equipe**, nas mesmas regras.
- **Para abrir sem sinal**, o app guarda no celular a escala de hoje e de amanhã e os dados mínimos do card "Hoje" (local, horário, 集合, equipe).

### Como funciona

- **O app é um PWA instalado** na tela inicial, com service worker (Serwist). O primeiro acesso orienta a instalação, que também protege os dados guardados contra a limpeza do Safari.
- **Fila no celular** (IndexedDB, via Dexie): cada registro guarda o ID (UUID, ADR 0020), o usuário, a hora do toque, o GPS do toque (se disponível) e os dados. Fotos ficam na fila como arquivo, enviadas depois do registro.
- **Envio automático**, sem depender da Background Sync: quando o celular avisa que voltou a ficar online, quando o app é aberto ou volta para a frente e por tentativas periódicas com o app aberto.
- **Ordem e idempotência:** a fila é enviada em ordem. O servidor reconhece IDs já recebidos, então reenviar nunca duplica.

### Regras no servidor

- **Duas horas em cada registro:** a do toque, vinda do celular (`recorded_at`), e a do recebimento (`received_at`).
- **O prazo de edição do dia** (ex.: até 5h do dia seguinte) **é conferido pela hora do toque.** Assim, quem confirmou sem sinal não é punido pelo atraso do envio.
- **Relógio suspeito:** se a hora do toque destoar da hora do servidor além de um limite, ou estiver no futuro, o registro entra marcado como "hora a conferir" e aparece para o admin.
- **Conflito:** se o admin ou o 班長 alterou o mesmo dia enquanto o celular estava offline, o registro offline não sobrescreve nada. A divergência vai para a tela de confirmações do admin, que decide.
- **Recusa:** se o envio for recusado (ex.: escalação já fechada), o registro sai da fila com o motivo, e o funcionário vê um alerta claro (ADR 0020).

### Sessão e privacidade

- **A fila pertence ao usuário que a criou.** Se a sessão expirar sem sinal (7 dias, ADR 0016), a fila fica guardada; quando o sinal volta, o app pede o PIN e só então envia.
- **Ao sair do app (logout)** com registros pendentes, o app avisa e pede confirmação antes de descartá-los.

### Na tela

- Indicador permanente de "sem conexão".
- Contador "N registros aguardando envio" e a confirmação "enviado" quando chegam.
- Registro feito offline aparece no card como "salvo no celular" até ser enviado.

## Consequências

- O modelo de dados do `work_entry` nasce com ID gerado no cliente, `recorded_at`, `received_at`, origem (online, offline, 班長, admin) e marca de "hora a conferir".
- A tela de confirmações do admin (M2) inclui os conflitos e as horas a conferir vindos do offline.
- Testes ponta a ponta (Playwright) simulam o modo avião: registrar sem rede, voltar a rede, conferir o envio único; conflito com edição do admin; sessão expirada com fila pendente.
- Bibliotecas novas: Serwist (service worker para Next.js) e Dexie (IndexedDB).
- O M2 fica maior. O registro tardio pelo 班長 continua existindo para quem não usou o app no dia.
