# Camada 16 · Serviço de IA

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R16-NN`.

## 1. Objetivo e escopo

- **Escopo:** módulo único (`packages/ai`) por onde passam todas as funções de IA: leitura de recibos e documentos, tradução, redação em japonês de negócios, rascunho de documentos, classificação do extrato, conteúdo de japonês de genba, registro por voz, assistente de perguntas (consultas prontas de leitura) e sugestão de escala.
- **Regras:** contexto mínimo e só da própria empresa; マイナンバー e números de documentos nunca enviados; saída estruturada validada; a IA nunca envia, aprova, paga ou apaga; conteúdo externo é dado, nunca instrução; cada empresa pode desligar; uso e custo registrados por empresa (cota do plano); modelos de tamanhos diferentes por tarefa.
- **Qualidade:** conjunto de testes com casos reais por função, rodado a cada mudança de modelo ou instrução; taxa de correção humana medida no painel.
- **Pronto quando:** a leitura de recibos acerta valor, data e imposto em ≥ 95% de um conjunto de 100 recibos reais e cada correção humana fica registrada.

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
