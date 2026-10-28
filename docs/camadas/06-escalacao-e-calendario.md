# Camada 06 · Escalação e calendário

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R06-NN`.

## 1. Objetivo e escopo

- **Escopo:** formulário de escalação (cliente, sub, local, período, horário e intervalo, 集合場所/時間 opcional, valor dia cobrado, imposto, adicionais cobrados, observações); escalação interna permanente; alocação de funcionários (todos os dias, intervalo, dias específicos, em lote), substituição, remoção de intervalo; equipes com 班長 e membros com datas; grade funcionários × dias igual ao 勤怠表 com borda por sub; ações em lote; mensagem do LINE do dia seguinte.
- **Regras:** ao alocar, cada dia nasce como **Pendente**, ou **休** na folga padrão do cliente. Um funcionário pode ter mais de um trecho na mesma data desde que os horários não se sobreponham; acima de 2 unidades pede confirmação. Alerta ao alocar: duplicidade, folga, vencimentos, visto. Exibir dias úteis previstos e "Total/dia" (não total do período). Preço cobrado do cliente e diária do funcionário são tabelas separadas; a diferença é a margem.
- **Pronto quando:** a escala do LINE de um dia real da Sugita é reproduzida pelo sistema, caractere por caractere no formato atual.

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
