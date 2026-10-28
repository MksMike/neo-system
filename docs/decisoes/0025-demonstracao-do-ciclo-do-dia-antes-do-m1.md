# ADR 0025 — Demonstração do ciclo do dia antes do M1 completo

- **Status:** Aceita
- **Data:** 2026-10-29
- **Decisores:** Mike
- **Relação:** documento-âncora (Roadmap: "um marco só começa quando o anterior passou"); camada 00 (SA-10 a SA-12 pausadas)

## Contexto

O dono da Sugita pediu para ver o sistema funcionando. Pelo roadmap, o M1 (cadastros completos, configurações com vigência e importação do Bubble) vem antes de qualquer escalação ou apontamento, e não teria nada do dia a dia para mostrar. O Mike também desenhou um mapa de funcionalidades com o menu do painel da empresa ([`docs/mapa-de-funcionalidades.md`](../mapa-de-funcionalidades.md)).

## Decisão

- **O Super Admin para em "cadastrar empresa e liberar acesso".** SA-10 a SA-12 ficam pausadas e voltam depois da demonstração.
- **Primeiro vem uma fatia que funciona de ponta a ponta, o "ciclo do dia a dia":**
  - painel da empresa com o menu do mapa;
  - cadastro rápido de clientes, subcontratantes (com cor) e locais;
  - cadastro básico de funcionários com acesso ao app (ID de 8 dígitos + PIN, ADR 0016);
  - escalação com calendário por escalação, mês e semana;
  - app do funcionário confirmando o dia.
- **Todas as telas do mapa existem desde já**, com título e o que vão fazer. As que ainda não foram construídas mostram o marco em que chegam.
- **A fatia segue todas as regras transversais.** Isolamento por empresa com RLS e teste, escrita só por funções SQL, validação, auditoria, textos por i18n e testes. Só os campos ficam reduzidos. Nada de dinheiro é calculado nesta fatia.
- **Os campos completos entram no M1 sem refazer o que já existe.** São eles: ficha do 作業員名簿, regras de cobrança por cliente, configurações com vigência e importação do Bubble. As tabelas da fatia já nascem com os nomes e as chaves do modelo das camadas 04 a 07.
- **Ideias novas do mapa, registradas para depois:** o Painel do Cliente (portal onde o cliente recebe seikyu e kintai) entra no M3, com o faturamento. Criar e abrir Excel e Word dentro do sistema entra na fase 2, junto do editor de modelos.

## Consequências

- O critério de passagem do M1 continua o mesmo. A demonstração não conta como M1 concluído.
- Cada tarefa da fatia atualiza o documento da sua camada (04, 05, 06, 07), como qualquer outra.
- Se a demonstração mudar prioridades, a ordem seguinte é decidida com o Mike depois dela.
