# Mapa de funcionalidades do painel da empresa

Transcrição do mapa mental do Mike (MindMeister, 29/10/2026), usado para o dono da Sugita e para o desenvolvimento. Ele define o **menu do painel da empresa** (`/admin`). A configuração do menu no código fica em `apps/web/src/app/admin/sections.ts`.

## O mapa

- **Dashboard**
- **Funcionários**
  - Cadastro novo: dados completos
  - Documentos: cadastro e vínculo de documentos com os funcionários cadastrados
  - Ficha técnica do funcionário · Contrato · Histórico
  - Holerites: histórico
- **Clientes**
  - Cadastro novo: dados completos
  - Subcontratantes: cadastro e vínculo aos clientes cadastrados; cada subcontratante tem uma cor específica para diferenciá-lo
  - Documentos: histórico, contratos
  - Painel do Cliente: o cliente entra no portal e recebe o seikyu e o kintai
- **Escalações**
  - Nova escalação: cria a escalação e seleciona os funcionários
  - Calendário: visão completa de cada escalação, do mês selecionado e da semana; editar escalação
  - Histórico: visão geral das escalações já fechadas; ver kintai, ver seikyu, alterar dados
- **Documentos**
  - Excel: criar novo documento, abrir documento existente
  - Word: criar novo documento, abrir documento existente
  - Pastas: empresa (kintai, seikyu, empresa, contratos, outros), pessoal, seguimento
- **Fluxo de caixa**
  - Faturas: a receber, pendentes, enviadas, pagas
  - Despesas: nova despesa, categorias de despesas, despesas recorrentes
  - Relatórios: receitas recebidas, despesas, folha de pagamento
  - Adiantamentos: novo adiantamento, visão geral, relatório
  - Seguros sociais: novo seguro social
- **Configurações**: dados da empresa, configurações do sistema
- **Inteligência Artificial**: integração

## Onde cada item está no plano

| Seção | Telas no menu (rota) | Camada | Marco |
| --- | --- | --- | --- |
| Dashboard | `/admin` | 15 | Demonstração (básico), M3 |
| Funcionários | Lista, Novo cadastro, Documentos, Holerites (`/admin/funcionarios/…`) | 05, 08, 10 | Demonstração (lista e cadastro básico), M1, M3, M4 |
| Clientes | Lista, Novo cadastro, Subcontratantes, Documentos, Painel do Cliente (`/admin/clientes/…`) | 04, 08, 09 | Demonstração (lista, cadastro, subs), M1, M3 |
| Escalações | Calendário, Nova escalação, Histórico (`/admin/escalacoes/…`) | 06, 07, 09 | Demonstração (calendário e nova), M2, M3 |
| Documentos | Pastas, Excel, Word (`/admin/documentos/…`) | 08 | M3; Excel e Word na fase 2 |
| Fluxo de caixa | Faturas, Despesas, Adiantamentos, Seguros sociais, Relatórios (`/admin/fluxo-de-caixa/…`) | 09, 10, 11 | M3, M4 |
| Inteligência Artificial | Integração (`/admin/ia`) | 16 | Fase 2 |
| Configurações | Dados da empresa, Sistema (`/admin/configuracoes/…`) | 03 | M1 |

A ficha técnica, o contrato e o histórico de cada funcionário ficam na página do funcionário, aberta pela lista. O mesmo vale para os dados, o histórico e os contratos de cada cliente.

## Novidades em relação ao documento-âncora

- **Painel do Cliente:** portal em que o cliente recebe o seikyu e o kintai. Entra no M3, com o fechamento e o faturamento (ADR 0025).
- **Criar e abrir Excel e Word dentro do sistema:** entra na fase 2, junto do editor de modelos (ADR 0025).
- **App do funcionário:** não aparece no mapa (o mapa é o painel do escritório), mas faz parte da demonstração (ADR 0025) e do M2.
