# Inventário de telas — NEO-SYSTEM

Versão 1.0 · 28/10/2026 · 66 telas em 5 áreas. Fonte única: este arquivo; o mapa mental é gerado dos mesmos dados. Marco = quando a tela entra (ver roadmap no documento-âncora).

| Área | Rota base | Telas |
| --- | --- | --- |
| Super Admin — Plataforma do SaaS, só para o Mike | `/super` | 7 |
| Acesso — Entrada no sistema | `/(auth)` | 4 |
| Painel admin — Escritório da empresa | `/admin` | 41 |
| App do funcionário — Celular, no idioma de cada um | `/m` | 11 |
| Portal do cliente — Para o 元請 (fase 2) | `/portal` | 3 |

## Super Admin

Plataforma do SaaS, só para o Mike. Rota base `/super`.

### Empresas e planos

#### Empresas

`/super/empresas` · M6

**Contém**

- Lista de empresas com plano, status, uso (funcionários ativos, cota de IA) e próximo vencimento
- Filtros por status: teste, ativo, em atraso, somente leitura, bloqueado, cancelado

**Ações**

- Criar empresa
- Abrir empresa
- Exportar lista

#### Detalhe da empresa

`/super/empresas/[id]` · M6

**Contém**

- Dados e plano atual
- Ajustes individuais (limites, add-ons, preço)
- Uso do mês
- Histórico de assinatura e pagamentos
- Log de ações da plataforma

**Ações**

- Trocar plano
- Aplicar ajuste
- Estender validade
- Somente leitura / bloquear / desbloquear com motivo
- Acesso de suporte (com permissão da empresa)

#### Planos e add-ons

`/super/planos` · M6

**Contém**

- Básico, Padrão, Completo: limites, funcionalidades, preço base, preço por pessoa
- Add-ons e cotas (IA, armazenamento)

**Ações**

- Editar plano com vigência
- Criar add-on

#### Cobrança do SaaS

`/super/cobranca` · M6

**Contém**

- Faturas emitidas às empresas
- Pagamentos recebidos e em atraso

**Ações**

- Gerar 請求書 do mês
- Marcar como pago (avança vencimento)
- Enviar lembrete

### Regras e operação

#### Tabelas legais

`/super/tabelas-legais` · M4

**Contém**

- 社会保険 por província e 子ども・子育て支援金
- 雇用保険
- 源泉 (月額表, 日額表; 甲/乙/丙)
- Salário mínimo por província
- 祝日
- Crédito transitório da インボイス
- Vigência de cada versão

**Ações**

- Importar nova versão
- Comparar versões
- Publicar com data de vigência

#### Uso de IA

`/super/ia` · Fase 2

**Contém**

- Chamadas e custo por empresa e por função
- Taxa de correção humana por função
- Resultado dos testes de qualidade

**Ações**

- Ajustar cota
- Trocar modelo por função

#### Saúde do sistema

`/super/sistema` · M5

**Contém**

- Backups (último, restauração testada)
- Jobs e filas
- Erros recentes (Sentry)
- E-mails com falha de entrega

**Ações**

- Reexecutar job
- Baixar backup

## Acesso

Entrada no sistema. Rota base `/(auth)`.

### Login

#### Login do admin

`/login` · M0

**Contém**

- E-mail e senha
- Segundo fator (2FA) para Proprietário e Gestor
- Troca de idioma

**Ações**

- Entrar
- Esqueci a senha

#### Login do funcionário

`/m/login` · M0

**Contém**

- ID de 8 dígitos (lembrado no aparelho ou lido por QR code) e PIN de 4 dígitos (ADR 0016)
- Teclado numérico grande
- Idioma

**Ações**

- Entrar
- Pedir novo PIN ao admin

#### Escolher empresa

`/selecionar-empresa` · M0

**Contém**

- Empresas ligadas ao login (e-mail ou LINE)

**Ações**

- Entrar na empresa

#### Primeiro acesso

`/boas-vindas` · M0

**Contém**

- Termos de uso e política de privacidade no idioma do usuário
- Finalidade da geolocalização
- Consentimentos (envio de documentos a contratantes, transferência bancária)

**Ações**

- Aceitar e continuar

## Painel admin

Escritório da empresa. Rota base `/admin`.

### Visão geral

#### Dashboard

`/admin` · M3

**Contém**

- Hoje: pessoas em genba por escalação, confirmações, 休 de amanhã
- Alertas: pendentes, vencimentos, divergências, despesas a aprovar
- A receber por cliente
- Fase 2: a pagar, caixa previsto 30/60/90, gráficos (人工, margem, ocupação, custo ocioso)

**Ações**

- Copiar escala de amanhã para o LINE
- Nova escalação
- Abrir qualquer indicador na lista que o gera

#### Busca global (⌘K)

`sobreposição` · M3

**Contém**

- Funcionários, clientes, escalações, faturas, documentos, ações rápidas

**Ações**

- Ir para o resultado
- Executar ação

#### Notificações

`/admin/notificacoes` · M2

**Contém**

- Avisos do sistema e de pessoas, lidos e não lidos

**Ações**

- Marcar como lido
- Abrir origem

### Operação

#### Escalações

`/admin/escalacoes` · M2

**Contém**

- Lista por status (aberta, pronta para faturar, fechada), cliente, local, período
- Indicador de pendentes por escalação

**Ações**

- Nova escalação
- Filtrar
- Abrir

#### Nova escalação

`/admin/escalacoes/nova` · M2

**Contém**

- Cliente, sub contratante (com "+"), local (com "+")
- Período, horário, intervalo, 集合場所/時間
- Valor dia cobrado, imposto (税抜/税込, alíquota), adicionais cobrados
- Regras de cobrança herdadas do cliente
- Dias úteis previstos e total/dia

**Ações**

- Salvar e alocar funcionários

#### Detalhe da escalação

`/admin/escalacoes/[id]` · M2

**Contém**

- Grade funcionários × dias (estilo 勤怠表) com cor do sub e tipo do dia
- Equipes e 班長 com membros e datas
- Alertas de conflito, vencimento e visto
- Resumo: unidades, 残業, pendentes

**Ações**

- Alocar (todos os dias, intervalo, dias específicos, em lote)
- Substituir funcionário
- Ações em lote na grade
- Editar registro do dia
- Ir para o fechamento

#### Calendário geral

`/admin/calendario` · M2

**Contém**

- Todas as escalações por dia/semana/mês
- Camadas: escalações, eventos internos, prazos
- Quem está livre em cada dia

**Ações**

- Ligar/desligar camadas
- Abrir dia
- Criar escalação a partir de um dia

#### Confirmações

`/admin/confirmacoes` · M2

**Contém**

- Pendentes de hoje e de dias anteriores
- Divergências (fora do raio, horário, líder × funcionário)
- Solicitações de correção e registros tardios
- Trabalho interno aguardando aprovação

**Ações**

- Aprovar
- Recusar com motivo
- Cobrar confirmação (lembrete)

#### Escalação interna

`/admin/escalacoes/interna` · M2

**Contém**

- Trabalho de escritório e fora do genba por pessoa e dia
- Horas em minutos e valor pela diária interna

**Ações**

- Escalar
- Aprovar registros do app

### Fechamento e faturamento

#### Fechamento da escalação

`/admin/escalacoes/[id]/fechamento` · M3

**Contém**

- Resumo por sub e por funcionário
- Pendências que bloqueiam
- Divergências que só avisam
- Cobrança extra, 立替金, 値引き

**Ações**

- Resolver pendentes em lote
- Fechar e travar
- Reabrir com motivo

#### Faturas (請求書)

`/admin/faturas` · M3

**Contém**

- Lista com status 発行済 → 送付済 → 入金済, vencidas em destaque
- Clientes prontos para faturar no 締め

**Ações**

- Gerar 請求書 do cliente
- Enviar por e-mail
- Registrar recebimento (parcial)

#### Detalhe da fatura

`/admin/faturas/[id]` · M3

**Contém**

- Prévia do PDF (請求書 + 勤怠表)
- Seções por escalação, totais por alíquota
- Histórico e versões (再発行)

**Ações**

- Baixar PDF
- Enviar
- Emitir versão corrigida

#### Fechamento do mês

`/admin/fechamento` · M4

**Contém**

- Checklist do mês: escalações, faturas, folha, despesas
- Arquivo mensal (versões)

**Ações**

- Fechar mês e gerar arquivo mensal
- Enviar link ao Proprietário/contador

### Pessoas

#### Funcionários

`/admin/funcionarios` · M1

**Contém**

- Lista com vínculo, status, vencimentos próximos, nível de japonês
- Uso do plano (ex.: 5 de 5)

**Ações**

- Novo funcionário
- Importar (Excel/Bubble)
- Filtrar
- Abrir ficha

#### Ficha do funcionário

`/admin/funcionarios/[id]` · M1

**Contém**

- Abas: pessoal, trabalho e vínculo, estrangeiro (在留カード), qualificações, saúde, seguros, pagamento (diárias, ciclo, forma), japonês, documentos, consentimentos, histórico
- Dados sensíveis só para papéis autorizados

**Ações**

- Editar com vigência
- Gerar documento a partir de modelo
- Redefinir PIN
- Inativar

#### Vencimentos

`/admin/funcionarios/vencimentos` · M1

**Contém**

- 在留カード, qualificações, 健康診断, 労災特別加入 vencendo em 30 dias ou vencidos

**Ações**

- Abrir ficha
- Criar tarefa

### Folha e pagamentos

#### Folha do período

`/admin/folha` · M4

**Contém**

- Períodos por ciclo (mensal, quinzenal, semanal, diário)
- Por funcionário: bruto, descontos, líquido, alertas

**Ações**

- Gerar rascunhos
- Aprovar
- Emitir e publicar no app

#### Folha do funcionário

`/admin/folha/[periodo]/[func]` · M4

**Contém**

- Linhas automáticas (dias, 残業, 手当, adiantamentos, multas, reembolsos)
- Cálculo 社員: 社会保険, 雇用保険, 源泉, 住民税
- Alertas legais

**Ações**

- Adicionar 手当 ou desconto
- Recalcular
- Aprovar

#### 請求書 dos 下請

`/admin/folha/subcontratados` · M4

**Contém**

- 請求書 enviados pelos 下請, contestações
- 支払明細書 com 相殺

**Ações**

- Aprovar
- Responder contestação
- Gerar 支払明細書

#### Adiantamentos

`/admin/adiantamentos` · M4

**Contém**

- Vales e adiantamentos com plano e saldo
- Alerta de empréstimo (acima do trabalhado)

**Ações**

- Novo adiantamento
- Alterar plano

#### Fila de pagamentos

`/admin/pagamentos` · M4

**Contém**

- Lotes por data (hoje, semana, dia 25)
- Totais por forma (transferência, dinheiro) e saldo do caixa físico

**Ações**

- Gerar arquivo 全銀
- Registrar pagamento em dinheiro com comprovante

#### Obrigações anuais

`/admin/folha/anual` · Antes de dez.

**Contém**

- 年末調整 por funcionário (formulários do app)
- 源泉徴収票, 給与支払報告書, 法定調書

**Ações**

- Gerar documentos
- Exportar

### Clientes

#### Clientes

`/admin/clientes` · M1

**Contém**

- Lista de clientes com faturamento e status

**Ações**

- Novo cliente
- Abrir

#### Cliente

`/admin/clientes/[id]` · M1

**Contém**

- Dados, n.º インボイス validado, 締め e prazo, 振込名義
- Cadeia de subs com cor e sigla
- Regras de cobrança
- Locais, escalações, faturas, e-mails

**Ações**

- Editar
- Adicionar sub
- Nova escalação

#### Locais de trabalho

`/admin/locais` · M1

**Contém**

- Endereço, mapa, raio de geolocalização, 集合場所 frequentes

**Ações**

- Novo local
- Editar raio

### Financeiro

#### Caixa

`/admin/financeiro` · M4

**Contém**

- Contas bancárias e caixa físico com saldo
- Entradas e saídas do mês
- Fase 2: fluxo previsto 30/60/90

**Ações**

- Lançar movimento
- Conferir caixa físico

#### Despesas

`/admin/financeiro/despesas` · M4

**Contém**

- Despesas com foto do recibo, categoria, quem pagou
- Aguardando aprovação

**Ações**

- Aprovar
- Nova despesa
- Marcar como 立替金 do cliente

#### Extrato e conciliação

`/admin/financeiro/extrato` · Fase 2

**Contém**

- Linhas importadas com status (conciliado, sugerido, sem par)
- Saldo sistema × banco

**Ações**

- Importar CSV
- Confirmar par
- Criar lançamento

#### Pacote do contador

`/admin/financeiro/contador` · Fase 2

**Contém**

- Resumo por categoria e 勘定科目, recibos numerados, CSV contábil

**Ações**

- Gerar
- Enviar link

### Documentos e comunicação

#### Biblioteca

`/admin/documentos` · M3

**Contém**

- Pastas, etiquetas, busca
- Vínculo com funcionário, cliente, escalação
- Documentos gerados entram automaticamente

**Ações**

- Upload
- Digitalizar com a câmera
- Mover, compartilhar, enviar por e-mail

#### Modelos e editor

`/admin/documentos/modelos` · M3 / Fase 2

**Contém**

- Modelos com campos (在職証明書 primeiro)
- Editor A4/A3, logo e 印影

**Ações**

- Gerar a partir de modelo
- Criar modelo
- Traduzir com IA

#### E-mail

`/admin/email` · M3 / Fase 2

**Contém**

- M3: envios de 請求書 e 勤怠表
- Fase 2: caixa de entrada por cliente, painel de IA (tradução e resposta em japonês)

**Ações**

- Escrever
- Anexar do sistema
- Salvar anexo na biblioteca

#### Comunicados

`/admin/comunicados` · Fase 2

**Contém**

- Avisos para todos ou grupos, no idioma de cada um
- 安否確認 após desastre

**Ações**

- Enviar comunicado
- Disparar 安否確認

#### Tarefas e 日報

`/admin/tarefas` · Fase 2

**Contém**

- Tarefas com checklist, prazo, responsáveis
- Tarefas automáticas
- Calendário interno
- 日報 do escritório

**Ações**

- Criar tarefa
- Registrar trabalho

### Configurações

#### Empresa e marca

`/admin/configuracoes/empresa` · M1

**Contém**

- Dados, n.º インボイス, contas bancárias
- Logo, 印影, cores do PDF

**Ações**

- Editar
- Pré-visualizar documentos

#### Regras de trabalho e folha

`/admin/configuracoes/regras` · M1

**Contém**

- 締め e pagamento, jornada, intervalo, % adicionais (com mínimo legal)
- Seguros, modo de registro, corte do dia
- 労使協定 e 36協定 registrados
- Tudo com vigência

**Ações**

- Editar com data de vigência

#### Catálogos

`/admin/configuracoes/catalogos` · M1

**Contém**

- 手当, descontos, adicionais cobrados, ocorrências e multas, categorias de despesa

**Ações**

- Criar, editar, desativar

#### Usuários e permissões

`/admin/configuracoes/usuarios` · M0

**Contém**

- Admins e coordenadores, papéis, permissões por módulo, 2FA

**Ações**

- Convidar
- Alterar papel
- Desativar

#### Integrações

`/admin/configuracoes/integracoes` · Fase 2

**Contém**

- E-mail (IMAP/SMTP), LINE, banco, IA (ligar/desligar)

**Ações**

- Conectar
- Testar

#### Plano e assinatura

`/admin/configuracoes/plano` · M6

**Contém**

- Plano, uso, faturas do NEO-SYSTEM

**Ações**

- Pedir mudança de plano

#### Auditoria e lixeira

`/admin/configuracoes/auditoria` · M0

**Contém**

- Quem fez o quê e quando
- Itens excluídos (restauráveis por 30 dias)

**Ações**

- Filtrar
- Restaurar

## App do funcionário

Celular, no idioma de cada um. Rota base `/m`.

### Dia a dia

#### Hoje

`/m` · M2

**Contém**

- Escalação do dia: local, cadeia, horário, 集合, mapa
- Exceções: 残業, 半日, fora do horário, escritório, adicionais, foto
- Status confirmado com horário e localização

**Ações**

- Confirmar 定時 (1 toque) ou 出勤/退勤
- Desfazer até o corte

#### Meu calendário

`/m/calendario` · M2

**Contém**

- Meus dias passados e futuros por tipo
- Totais do período: dias, 残業

**Ações**

- Marcar e desmarcar 休 futuro
- Pedir 有給
- Solicitar correção de dia passado

#### Minha equipe (班長)

`/m/equipe` · M2

**Contém**

- Membros liberados pelo admin, todos como 定時

**Ações**

- Marcar exceções por pessoa
- Confirmar o time
- Registro tardio com motivo

#### Trabalho interno

`/m/interno` · M2

**Contém**

- Registros de escritório com status de aprovação

**Ações**

- Registrar período e tarefa

### Dinheiro e documentos

#### Pagamentos

`/m/pagamentos` · M4

**Contém**

- Holerites ou 支払明細書
- Saldo de adiantamentos e parcelas
- Multas com motivo

**Ações**

- Abrir PDF
- Marcar "recebi e conferi"
- Contestar
- Aceitar plano de adiantamento

#### Meu 請求書 (下請)

`/m/seikyusho` · M4

**Contém**

- Rascunho gerado no 締め com dias e extras

**Ações**

- Contestar dia
- Enviar 請求書

#### Despesas

`/m/despesas` · M4

**Contém**

- Minhas despesas e status

**Ações**

- Nova despesa com foto (IA na fase 2)

#### Meus documentos

`/m/documentos` · M3

**Contém**

- Documentos pessoais e vencimentos (在留カード, qualificações)

**Ações**

- Ver
- Enviar foto de documento renovado

### Pessoal

#### Aprender japonês

`/m/aprender` · Fase 2

**Contém**

- Palavras para amanhã pela escalação
- Trilhas: ferramentas, peças, gírias, segurança

**Ações**

- Ouvir áudio
- Marcar como aprendido

#### Avisos

`/m/avisos` · M2

**Contém**

- Comunicados, lembretes, 安否確認 (fase 2)

**Ações**

- Responder "estou bem"

#### Perfil

`/m/perfil` · M2

**Contém**

- Dados pessoais (leitura), idioma, PIN, consentimentos
- 年末調整 (antes de dezembro)

**Ações**

- Trocar idioma e PIN
- Preencher 年末調整

## Portal do cliente

Para o 元請 (fase 2). Rota base `/portal`.

### Cliente

#### Aprovação do 勤怠表

`/portal` · Fase 2

**Contém**

- 勤怠表 do mês por escalação

**Ações**

- Aprovar
- Contestar dia

#### Faturas

`/portal/faturas` · Fase 2

**Contém**

- 請求書 e status de pagamento

**Ações**

- Baixar PDF

#### Pedidos de trabalhadores

`/portal/pedidos` · Fase 3

**Contém**

- Pedidos de pessoas por data, local e qualificação

**Ações**

- Novo pedido
