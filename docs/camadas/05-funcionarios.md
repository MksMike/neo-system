# Camada 05 · Funcionários

> Documento de referência da camada. Fonte inicial: `docs/00-ancora.md` (Diretrizes por camada). Regras novas recebem número `R05-NN`.

## 1. Objetivo e escopo

- **Escopo:** ficha no padrão do 作業員名簿 (全建統一様式第5号): pessoal, trabalho, vínculo, saúde, seguros, qualificações, estrangeiro (nacionalidade, 在留資格, validade, nº e fotos do cartão, 就労制限, data da última verificação), nível de japonês, pagamento (tipo, diária genba, diária interna, ciclo, forma, 口座振込同意書, 扶養, 甲/乙/丙, 住民税, 標準報酬月額), dados de 下請 (屋号, インボイス, 労災特別加入, conta).
- **Regras:** vínculos: 社員, パート, 下請, 業務委託. Vencimentos (在留カード, qualificações, 健康診断, 労災特別加入) alertam com 30 dias e bloqueiam a escalação ao vencer. Visto com restrição avisa na escalação. 在留カード e conta bancária só para o Proprietário, delegável ao Gestor com log. Regra de inscrição com alerta: 社会保険 para パート (20h/semana, ¥88.000/mês, empresa com 51+ pessoas, exceto estudantes) e 雇用保険 (20h/semana e 31 dias de contrato previsto). Integrações: ficha compatível com a Green Site (M1); CCUS (fase 3). Funcionário inativo fica no histórico.
- **Pronto quando:** a ficha tem todos os campos do 作業員名簿 e da Green Site (o PDF sai no M3) e os funcionários do Bubble foram importados.

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
