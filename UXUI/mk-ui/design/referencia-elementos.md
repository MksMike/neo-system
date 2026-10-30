# Referência de elementos — Projeto

HTML gerado pelo MK-UI Lab para cada código. Use como referência visual e de estrutura ao implementar em React; as classes são do protótipo, não do projeto final.

## Gráficos

### grf-001 · Linha com área

Dois períodos comparados, com dica ao passar o mouse.

- Série atual com área em gradiente 32%→0
- Série anterior tracejada na cor de destaque
- Guia vertical e dica com os dois valores
- A linha se desenha no modo animado
- Base sugerida: Recharts AreaChart

```html
<div class="chart-scroll">
  <div class="chart-box">
    <div data-chart="area">
    </div>
  </div>
</div>
```

### grf-002 · Linhas múltiplas

Três séries com rótulo no fim de cada linha.

- Até 5 séries nas cores primária, destaque, aviso, sucesso, erro
- Rótulo direto no último ponto (dispensa legenda)
- Pontos finais destacados
- Base sugerida: Recharts LineChart

```html
<div class="chart-scroll">
  <div class="chart-box">
    <div data-chart="multi">
    </div>
  </div>
</div>
```

### grf-003 · Área empilhada

Composição do total ao longo do tempo.

- Camadas empilhadas com 70% de opacidade
- Ordem: maior na base
- Legenda acima
- Base sugerida: Recharts AreaChart (stackId)

```html
<div class="chart-scroll">
  <div class="chart-box">
    <div data-chart="stack">
    </div>
  </div>
</div>
```

### grf-004 · Sparklines

Quatro formatos de mini gráfico: linha, área, barras e ganho/perda.

- 120×34 px, sem eixos
- Barras de ganho/perda em verde e vermelho
- Usados dentro de cards e tabelas
- Base sugerida: SVG próprio

```html
<div class="sparks" data-sparks>
</div>
```

### grf-005 · Barras verticais

Valores por categoria com o maior em destaque.

- Maior barra em primária sólida com rótulo
- Demais em 38% da primária
- Crescem da base no modo animado
- Base sugerida: Recharts BarChart

```html
<div class="chart-scroll">
  <div class="chart-box sm">
    <div data-chart="bars">
    </div>
  </div>
</div>
```

### grf-006 · Barras horizontais (ranking)

Comparação ordenada com rótulos longos.

- Ordenado do maior para o menor
- Rótulo à esquerda, valor à direita em mono
- Funciona bem no celular
- Base sugerida: HTML + CSS

```html
<div class="hbars" data-chart="hbar">
</div>
```

### grf-007 · Barras agrupadas

Duas séries lado a lado por mês.

- Primária = atual, destaque = meta
- Espaço de 18% entre grupos
- Base sugerida: Recharts BarChart (2 Bar)

```html
<div class="chart-scroll">
  <div class="chart-box sm">
    <div data-chart="group">
    </div>
  </div>
</div>
```

### grf-008 · Barras empilhadas

Partes de um total por período.

- 3 segmentos com cantos só no topo
- Legenda acima
- Base sugerida: Recharts BarChart (stackId)

```html
<div class="chart-scroll">
  <div class="chart-box sm">
    <div data-chart="sbar">
    </div>
  </div>
</div>
```

### grf-009 · Pizza

Partes de um todo com separação entre fatias.

- Fatias separadas por 2 px da cor da superfície
- Até 5 fatias; agrupar o resto em “Outros”
- Base sugerida: Recharts PieChart

```html
<div class="donut-wrap" data-chart="pie">
</div>
```

### grf-010 · Rosca

Participação com total no centro.

- Espessura varia com o estilo (10–34 px)
- Total no centro e legenda com porcentagens
- Base sugerida: Recharts PieChart (innerRadius)

```html
<div class="donut-wrap" data-chart="donut">
</div>
```

### grf-011 · Meia-rosca

Progresso de meta em semicírculo.

- Arco de 180° com valor no centro
- Rótulo de meta abaixo
- Base sugerida: SVG próprio

```html
<div data-chart="semi" style="display:grid;place-items:center">
</div>
```

### grf-012 · Anéis de progresso

Três metas concêntricas.

- Anéis de 12 px com trilho de fundo
- Cores: primária, destaque, sucesso
- Base sugerida: SVG próprio

```html
<div class="donut-wrap" data-chart="rings">
</div>
```

### grf-013 · Medidores

Arco de 240° para capacidade com cor por faixa.

- Faixas: ok, aviso, crítico
- Valor no centro
- Base sugerida: SVG próprio

```html
<div class="gauges" data-gauges>
</div>
```

### grf-014 · Radar

Comparação de perfis em vários critérios.

- 6 eixos, grade em 25/50/75/100%
- Duas séries sobrepostas com 25% de preenchimento
- Base sugerida: Recharts RadarChart

```html
<div data-chart="radar" style="display:grid;place-items:center">
</div>
```

### grf-015 · Dispersão com bolhas

Relação entre duas medidas; tamanho = terceira.

- Duas categorias por cor
- Bolha proporcional ao volume
- Base sugerida: Recharts ScatterChart

```html
<div class="chart-scroll">
  <div class="chart-box sm">
    <div data-chart="scatter">
    </div>
  </div>
</div>
```

### grf-016 · Candlestick

Velas OHLC com volume e linha do último preço.

- Alta em verde, baixa em vermelho
- Volume em barras na base
- Linha tracejada e etiqueta do último preço
- Dados de exemplo
- Base sugerida: lightweight-charts (TradingView) ou SVG

```html
<div class="chart-scroll">
  <div class="chart-box">
    <div data-chart="candle">
    </div>
  </div>
</div>
```

### grf-017 · Mapa de calor (calendário)

Intensidade por dia ao longo de semanas.

- 5 níveis da cor primária
- Legenda “Menos → Mais”
- Base sugerida: SVG próprio

```html
<div class="chart-scroll">
  <div class="chart-box">
    <div data-chart="heat">
    </div>
  </div>
</div>
```

### grf-018 · Funil

Etapas de conversão com taxa entre elas.

- Largura proporcional ao volume
- Taxa de conversão entre etapas
- Base sugerida: HTML + CSS

```html
<div class="funnel" data-chart="funnel">
</div>
```

### grf-019 · Treemap

Proporção de partes em retângulos.

- Área proporcional ao valor
- Tons da primária e do destaque
- Base sugerida: Recharts Treemap

```html
<div class="treemap" data-chart="tree">
</div>
```

## Indicadores

### ind-001 · KPI simples

Rótulo, valor e variação.

- Valor em fonte de título com números tabulares
- Variação em chip verde/vermelho
- Base sugerida: —

```html
<div class="card kpi">
  <span class="lbl">Pedidos</span>
  <div class="kpi-val num" data-count="1284" data-fmt="int">1.284</div>
  <div class="kpi-foot">
    <span class="delta up">+3,1%</span>
    <span class="muted sm">vs. setembro</span>
  </div>
</div>
```

### ind-002 · KPI com sparkline

Valor com tendência dos últimos 10 períodos.

- Sparkline só no detalhado e animado
- Contagem animada no modo animado
- Base sugerida: —

```html
<div class="card kpi">
  <div class="kpi-top">
    <span class="lbl">Receita do mês</span>
    <span class="chip-ic det-only">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>
      </svg>
    </span>
  </div>
  <div class="kpi-val num" data-count="4.82" data-fmt="m">¥ 4,82 mi</div>
  <div class="kpi-foot">
    <span class="delta up">+12,4%</span>
    <span class="muted sm">vs. setembro</span>
  </div>
  <svg class="spark" viewBox="0 0 120 34" preserveAspectRatio="none" data-spark="3,4,3.6,4.4,4.1,5,4.8,5.6,5.4,6.2">
  </svg>
</div>
```

### ind-003 · KPI com meta

Valor atual contra meta com barra.

- Barra com marcação de % da meta
- Texto “faltam X”
- Base sugerida: Progress

```html
<div class="card kpi">
  <span class="lbl">Vendas do trimestre</span>
  <div class="kpi-val num">¥ 38,2 mi</div>
  <div class="track">
    <div class="fill" style="--v:76%">
    </div>
  </div>
  <div class="kpi-foot">
    <b class="sm">76% da meta</b>
    <span class="muted sm">faltam ¥ 11,8 mi</span>
  </div>
</div>
```

### ind-004 · KPI comparativo

Antes e depois lado a lado.

- Período anterior em texto suave
- Seta indica direção da mudança
- Base sugerida: —

```html
<div class="card">
  <span class="lbl">Tempo médio de entrega</span>
  <div class="compare" style="margin-top:10px">
    <div>
      <span class="muted sm">Setembro</span>
      <div class="kpi-val num muted">3,4 dias</div>
    </div>
    <span class="arrow">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </span>
    <div>
      <span class="muted sm">Outubro</span>
      <div class="kpi-val num">2,1 dias</div>
    </div>
  </div>
  <div style="text-align:center;margin-top:8px">
    <span class="delta up">−38%</span>
  </div>
</div>
```

### ind-005 · KPI com anel

Percentual em anel ao lado do número.

- Anel de 76 px com 8 px de traço
- Bom para taxas e satisfação
- Base sugerida: —

```html
<div class="card row" style="gap:16px;flex-wrap:nowrap">
  <svg class="cprog" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="32" style="stroke:var(--surface-2)"/>
    <circle cx="40" cy="40" r="32" pathLength="100" stroke-dasharray="93 7" stroke-linecap="round" transform="rotate(-90 40 40)" style="stroke:var(--success)"/>
    <text x="40" y="45" text-anchor="middle" style="fill:var(--fg);font:600 16px var(--font-mono)">93%</text>
  </svg>
  <div>
    <span class="lbl">Satisfação</span>
    <div class="kpi-val num">4,7 / 5</div>
    <span class="muted sm">312 avaliações</span>
  </div>
</div>
```

### ind-006 · Número de destaque

Um número grande que é a mensagem da tela.

- 52 px em fonte de título
- Contexto em uma linha abaixo
- Base sugerida: —

```html
<div>
  <span class="lbl">Economia gerada em 2026</span>
  <div class="hero-num num" data-count="12.4" data-fmt="m">¥ 12,40 mi</div>
  <p class="muted sm" style="margin:6px 0 0">Comparado ao mesmo período de 2025, com os mesmos contratos.</p>
</div>
```

### ind-007 · Cotação ao vivo

Preço que atualiza e pisca verde ou vermelho.

- Fundo pisca 600 ms na cor da direção
- Variação absoluta e percentual
- Dados simulados
- Base sugerida: —

```html
<div class="stack" style="gap:8px" data-ticker>
  <div class="ticker">
    <div>
      <b>XAUUSD</b>
      <div class="muted sm">Ouro · exemplo</div>
    </div>
    <div style="text-align:right">
      <div class="px num">4.082,35</div>
      <span class="delta up">+0,42%</span>
    </div>
  </div>
  <div class="ticker">
    <div>
      <b>USDJPY</b>
      <div class="muted sm">Dólar/iene · exemplo</div>
    </div>
    <div style="text-align:right">
      <div class="px num">151,284</div>
      <span class="delta down">−0,18%</span>
    </div>
  </div>
</div>
```

### ind-008 · Placar

Três números lado a lado em blocos.

- Fundo surface-2 em cada bloco
- Bom para resumo de status
- Base sugerida: —

```html
<div class="score">
  <div>
    <b class="num">24</b>
    <span class="lbl">Abertas</span>
  </div>
  <div>
    <b class="num" style="color:var(--warning)">5</b>
    <span class="lbl">Atrasadas</span>
  </div>
  <div>
    <b class="num" style="color:var(--success)">118</b>
    <span class="lbl">Concluídas</span>
  </div>
</div>
```

### ind-009 · Contador animado

Número que conta até o valor ao aparecer.

- Easing de saída cúbica em 1,1 s
- Clique para recontar
- Base sugerida: Motion (animate)

```html
<div class="row" style="justify-content:space-between">
  <div>
    <span class="lbl">Usuários ativos</span>
    <div class="hero-num num" data-count="8742" data-fmt="int" data-recount>8.742</div>
  </div>
  <button class="btn btn-outline btn-sm" data-recount-btn>
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2 5.5M20 4v7h-7"/>
    </svg>Recontar</button>
  </div>
```

### ind-010 · Chips de status

Estado de serviços em pílulas com ponto pulsante.

- Ponto pulsa quando “ao vivo”
- Cores semânticas
- Base sugerida: —

```html
<div class="row">
  <span class="st-chip live" style="--k:var(--success)">
    <i>
  </i>API online</span>
  <span class="st-chip" style="--k:var(--warning)">
    <i>
  </i>Fila lenta</span>
  <span class="st-chip" style="--k:var(--danger)">
    <i>
  </i>Webhook falhou</span>
  <span class="st-chip" style="--k:var(--muted)">
    <i>
  </i>Backup pausado</span>
</div>
```

### ind-011 · Saúde dos sistemas

Lista de serviços com semáforo e latência.

- Ponto colorido por estado
- Métrica em mono à direita
- Base sugerida: —

```html
<ul class="health">
  <li style="--k:var(--success)">
    <i>
  </i>
  <span>API pública</span>
  <span>82 ms</span>
</li>
<li style="--k:var(--success)">
  <i>
</i>
<span>Banco de dados</span>
<span>12 ms</span>
</li>
<li style="--k:var(--warning)">
  <i>
</i>
<span>Fila de e-mails</span>
<span>2,4 s</span>
</li>
<li style="--k:var(--danger)">
  <i>
</i>
<span>Integração LINE</span>
<span>falhou</span>
</li>
</ul>
```

### ind-012 · Barra de disponibilidade

30 dias de disponibilidade em barras.

- Cada barra = 1 dia
- Aviso e falha destacados
- Base sugerida: —

```html
<div class="stack" style="gap:8px">
  <div class="row" style="justify-content:space-between">
    <b>Portal do cliente</b>
    <span class="badge ok">99,94%</span>
  </div>
  <div class="uptime">
    <i class="tipme" data-tip="30 dias atrás" style="">
  </i>
  <i class="tipme" data-tip="29 dias atrás" style="">
</i>
<i class="tipme" data-tip="28 dias atrás" style="">
</i>
<i class="tipme" data-tip="27 dias atrás" style="">
</i>
<i class="tipme" data-tip="26 dias atrás" style="">
</i>
<i class="tipme" data-tip="25 dias atrás" style="">
</i>
<i class="tipme" data-tip="24 dias atrás" style="">
</i>
<i class="tipme" data-tip="23 dias atrás" style="">
</i>
<i class="tipme" data-tip="22 dias atrás" style="">
</i>
<i class="tipme" data-tip="21 dias atrás" style="">
</i>
<i class="tipme" data-tip="20 dias atrás" style="">
</i>
<i class="tipme" data-tip="19 dias atrás" style="background:var(--warning)">
</i>
<i class="tipme" data-tip="18 dias atrás" style="">
</i>
<i class="tipme" data-tip="17 dias atrás" style="">
</i>
<i class="tipme" data-tip="16 dias atrás" style="">
</i>
<i class="tipme" data-tip="15 dias atrás" style="">
</i>
<i class="tipme" data-tip="14 dias atrás" style="">
</i>
<i class="tipme" data-tip="13 dias atrás" style="">
</i>
<i class="tipme" data-tip="12 dias atrás" style="">
</i>
<i class="tipme" data-tip="11 dias atrás" style="">
</i>
<i class="tipme" data-tip="10 dias atrás" style="">
</i>
<i class="tipme" data-tip="9 dias atrás" style="">
</i>
<i class="tipme" data-tip="8 dias atrás" style="">
</i>
<i class="tipme" data-tip="7 dias atrás" style="background:var(--danger)">
</i>
<i class="tipme" data-tip="6 dias atrás" style="">
</i>
<i class="tipme" data-tip="5 dias atrás" style="">
</i>
<i class="tipme" data-tip="4 dias atrás" style="">
</i>
<i class="tipme" data-tip="3 dias atrás" style="">
</i>
<i class="tipme" data-tip="2 dias atrás" style="">
</i>
<i class="tipme" data-tip="1 dias atrás" style="">
</i>
</div>
<div class="row muted sm" style="justify-content:space-between">
  <span>30 dias atrás</span>
  <span>hoje</span>
</div>
</div>
```

### ind-013 · Lista de métricas

Pares rótulo/valor com variação.

- Divisória entre linhas
- Valores tabulares
- Base sugerida: —

```html
<ul class="statlist">
  <li>
    <span>Novos clientes</span>
    <span class="row" style="gap:8px">
      <b class="num">48</b>
      <span class="delta up">+12%</span>
    </span>
  </li>
  <li>
    <span>Cancelamentos</span>
    <span class="row" style="gap:8px">
      <b class="num">6</b>
      <span class="delta up">−2</span>
    </span>
  </li>
  <li>
    <span>Chamados abertos</span>
    <span class="row" style="gap:8px">
      <b class="num">19</b>
      <span class="delta down">+4</span>
    </span>
  </li>
  <li>
    <span>NPS</span>
    <span class="row" style="gap:8px">
      <b class="num">71</b>
      <span class="delta up">+3</span>
    </span>
  </li>
</ul>
```

### ind-014 · Bullet chart

Valor contra meta com faixas de qualidade.

- Faixas ruim/ok/bom em tons do texto
- Traço vertical = meta
- Base sugerida: SVG/HTML

```html
<div class="stack" style="gap:12px">
  <div>
    <div class="row sm" style="justify-content:space-between;margin-bottom:4px">
      <span>Receita</span>
      <b class="num">68%</b>
    </div>
    <div class="bullet">
      <span class="v" style="width:68%">
      </span>
      <span class="t" style="left:80%">
      </span>
    </div>
  </div>
  <div>
    <div class="row sm" style="justify-content:space-between;margin-bottom:4px">
      <span>Margem</span>
      <b class="num">84%</b>
    </div>
    <div class="bullet">
      <span class="v" style="width:84%">
      </span>
      <span class="t" style="left:70%">
      </span>
    </div>
  </div>
  <div>
    <div class="row sm" style="justify-content:space-between;margin-bottom:4px">
      <span>Entregas no prazo</span>
      <b class="num">91%</b>
    </div>
    <div class="bullet">
      <span class="v" style="width:91%">
      </span>
      <span class="t" style="left:95%">
      </span>
    </div>
  </div>
</div>
```

### ind-015 · Ranking

Top 5 com posição, avatar e valor.

- Primeiro lugar com número dourado
- Barra relativa opcional
- Base sugerida: —

```html
<ol class="leader">
  <li>
    <span class="avatar xs">RS</span>
    <span>Rafael Sato</span>
    <b class="num">128</b>
  </li>
  <li>
    <span class="avatar xs">KT</span>
    <span>Keiko T.</span>
    <b class="num">117</b>
  </li>
  <li>
    <span class="avatar xs">AL</span>
    <span>Ana Lima</span>
    <b class="num">96</b>
  </li>
  <li>
    <span class="avatar xs">MK</span>
    <span>Mike Inoue</span>
    <b class="num">88</b>
  </li>
  <li>
    <span class="avatar xs">JP</span>
    <span>João P.</span>
    <b class="num">71</b>
  </li>
</ol>
```

## Tipografia

### tip-001 · Escala tipográfica

Tamanhos de H1 a legenda, com o par atual.

- H1 clamp(24–36 px), H2 22, H3 17, corpo 15, pequeno 13, legenda 12
- Altura de linha 1,1 em títulos e 1,55 no corpo
- Base sugerida: Tailwind fontSize

```html
<div>
  <div class="ty-row">
    <span class="lbl">H1</span>
    <span class="h-display h1">Operações</span>
  </div>
  <div class="ty-row">
    <span class="lbl">H2</span>
    <span class="h-display h2">Relatório mensal</span>
  </div>
  <div class="ty-row">
    <span class="lbl">H3</span>
    <span class="h-display h3">Pedidos por região</span>
  </div>
  <div class="ty-row">
    <span class="lbl">Corpo</span>
    <span>Texto padrão de leitura.</span>
  </div>
  <div class="ty-row">
    <span class="lbl">Pequeno</span>
    <span class="sm">Texto auxiliar.</span>
  </div>
  <div class="ty-row">
    <span class="lbl">Rótulo</span>
    <span class="lbl">Status do pedido</span>
  </div>
</div>
```

### tip-002 · Estilos de texto

Lead, citação, marcação, código, atalho e link.

- Lead 18 px
- Citação com borda primária de 3 px
- Marca-texto em 35% do aviso
- Base sugerida: Prose (Tailwind Typography)

```html
<div class="stack" style="gap:10px">
  <p class="lead">Um parágrafo de abertura um pouco maior.</p>
  <blockquote class="quote">“Entrega no prazo é a melhor propaganda.”</blockquote>
  <p style="margin:0">Use <mark class="hl">marca-texto</mark>, <code class="ic-code">npm run dev</code>, <span class="kbd">Ctrl</span> + <span class="kbd">K</span> e <span class="hv-under">
  <a href="#" data-nolink>links</a>
</span>.</p>
</div>
```

### tip-003 · Títulos com efeito

Gradiente, contorno e sublinhado marcador.

- Gradiente primária→destaque com background-clip
- Contorno com -webkit-text-stroke
- Use com moderação: 1 por tela
- Base sugerida: CSS

```html
<div class="stack" style="gap:6px">
  <span class="h-display h2 h-grad">Título em gradiente</span>
  <span class="h-display h2 h-out">Título contornado</span>
  <span class="h-display h2">
    <span class="h-under">Marcador</span> no título</span>
  </div>
```

### tip-004 · Números e moedas

Tabulares vs. proporcionais e formatos de valor.

- tabular-nums em tabelas e KPIs
- ¥ sem decimais; R$ com 2 casas; % com 1 casa
- Base sugerida: Intl.NumberFormat

```html
<div class="f2">
  <div>
    <span class="lbl">Tabular</span>
    <div class="num mono" style="font-family:var(--font-body)">1.111<br>8.888<br>4.042</div>
  </div>
  <div>
    <span class="lbl">Formatos</span>
    <div class="sm">¥ 128.400<br>R$ 4.215,90<br>12,4%<br>29/10/2026</div>
  </div>
</div>
```

## Ícones

### ico-001 · Biblioteca de ícones

Todos os ícones do sistema. Clique para copiar o nome.

- Grade 24×24, traço arredondado
- Nomes compatíveis com a lógica do Lucide
- Base sugerida: lucide-react

```html
<div class="iclib">
  <button data-icname="eyeOff">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.9 8.3 2 12 2 12s4 7 10 7c1.8 0 3.4-.5 4.8-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
    </svg>
    <span>eyeOff</span>
  </button>
  <button data-icname="flag">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>
    </svg>
    <span>flag</span>
  </button>
  <button data-icname="code">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>
    </svg>
    <span>code</span>
  </button>
  <button data-icname="columns">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h18v16H3zM12 4v16"/>
    </svg>
    <span>columns</span>
  </button>
  <button data-icname="droplet">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3s7 7.6 7 12a7 7 0 0 1-14 0c0-4.4 7-12 7-12z"/>
    </svg>
    <span>droplet</span>
  </button>
  <button data-icname="smartphone">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2"/>
    </svg>
    <span>smartphone</span>
  </button>
  <button data-icname="save">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h11l5 5v13H3V3zM7 3v6h8M7 21v-7h10v7"/>
    </svg>
    <span>save</span>
  </button>
  <button data-icname="home">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>
    </svg>
    <span>home</span>
  </button>
  <button data-icname="chart">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>
    </svg>
    <span>chart</span>
  </button>
  <button data-icname="layers">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
    <span>layers</span>
  </button>
  <button data-icname="form">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h7"/>
    </svg>
    <span>form</span>
  </button>
  <button data-icname="table">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h18v16H3zM3 10h18M9 4v16"/>
    </svg>
    <span>table</span>
  </button>
  <button data-icname="grid">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>
    </svg>
    <span>grid</span>
  </button>
  <button data-icname="menu">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
    <span>menu</span>
  </button>
  <button data-icname="sun">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
    </svg>
    <span>sun</span>
  </button>
  <button data-icname="moon">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
    </svg>
    <span>moon</span>
  </button>
  <button data-icname="chevL">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
    <span>chevL</span>
  </button>
  <button data-icname="chevR">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18l6-6-6-6"/>
    </svg>
    <span>chevR</span>
  </button>
  <button data-icname="chevD">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6"/>
    </svg>
    <span>chevD</span>
  </button>
  <button data-icname="chevU">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 15l6-6 6 6"/>
    </svg>
    <span>chevU</span>
  </button>
  <button data-icname="calendar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4"/>
    </svg>
    <span>calendar</span>
  </button>
  <button data-icname="clock">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2"/>
    </svg>
    <span>clock</span>
  </button>
  <button data-icname="search">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5"/>
    </svg>
    <span>search</span>
  </button>
  <button data-icname="check">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l5 5L20 7"/>
    </svg>
    <span>check</span>
  </button>
  <button data-icname="x">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18"/>
    </svg>
    <span>x</span>
  </button>
  <button data-icname="bell">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
    </svg>
    <span>bell</span>
  </button>
  <button data-icname="user">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/>
    </svg>
    <span>user</span>
  </button>
  <button data-icname="users">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>
    </svg>
    <span>users</span>
  </button>
  <button data-icname="plus">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>
    <span>plus</span>
  </button>
  <button data-icname="minus">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14"/>
    </svg>
    <span>minus</span>
  </button>
  <button data-icname="download">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>
    </svg>
    <span>download</span>
  </button>
  <button data-icname="upload">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>
    </svg>
    <span>upload</span>
  </button>
  <button data-icname="trash">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>
    </svg>
    <span>trash</span>
  </button>
  <button data-icname="dots">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
      <path d="M5 12h.01M12 12h.01M19 12h.01"/>
    </svg>
    <span>dots</span>
  </button>
  <button data-icname="copy">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 9h11v11H9zM5 15H4V4h11v1"/>
    </svg>
    <span>copy</span>
  </button>
  <button data-icname="info">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01"/>
    </svg>
    <span>info</span>
  </button>
  <button data-icname="alert">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2 21h20L12 3zM12 10v4M12 17h.01"/>
    </svg>
    <span>alert</span>
  </button>
  <button data-icname="spark">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>
    </svg>
    <span>spark</span>
  </button>
  <button data-icname="mail">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3zM3 6l9 7 9-7"/>
    </svg>
    <span>mail</span>
  </button>
  <button data-icname="edit">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>
    </svg>
    <span>edit</span>
  </button>
  <button data-icname="settings">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15l1.6 2.8-2.2 2.2-2.8-1.6a7 7 0 0 1-2 .8L13.2 22h-2.4l-.8-2.8a7 7 0 0 1-2-.8l-2.8 1.6L3 17.8 4.6 15a7 7 0 0 1-.8-2L1 12.2V9.8L3.8 9a7 7 0 0 1 .8-2L3 4.2 5.2 2 8 3.6a7 7 0 0 1 2-.8L10.8 0h2.4l.8 2.8a7 7 0 0 1 2 .8L18.8 2 21 4.2 19.4 7a7 7 0 0 1 .8 2l2.8.8v2.4l-2.8.8a7 7 0 0 1-.8 2z"/>
    </svg>
    <span>settings</span>
  </button>
  <button data-icname="box">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>
    </svg>
    <span>box</span>
  </button>
  <button data-icname="wrench">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L10 2l2.7 2.7z"/>
    </svg>
    <span>wrench</span>
  </button>
  <button data-icname="file">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3H6v18h12V7zM14 3v4h4"/>
    </svg>
    <span>file</span>
  </button>
  <button data-icname="pulse">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l3-8 4 16 3-8h4"/>
    </svg>
    <span>pulse</span>
  </button>
  <button data-icname="map">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>
    </svg>
    <span>map</span>
  </button>
  <button data-icname="cmd">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>
    </svg>
    <span>cmd</span>
  </button>
  <button data-icname="logout">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 3h4v18h-4M10 17l5-5-5-5M15 12H3"/>
    </svg>
    <span>logout</span>
  </button>
  <button data-icname="eye">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
    <span>eye</span>
  </button>
  <button data-icname="lock">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
    <span>lock</span>
  </button>
  <button data-icname="folder">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h6l2 2h10v11H3z"/>
    </svg>
    <span>folder</span>
  </button>
  <button data-icname="folderPlus">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h6l2 2h10v11H3zM12 11v5M9.5 13.5h5"/>
    </svg>
    <span>folderPlus</span>
  </button>
  <button data-icname="archive">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h18v5H3zM5 9v11h14V9M10 13h4"/>
    </svg>
    <span>archive</span>
  </button>
  <button data-icname="heart">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>
    </svg>
    <span>heart</span>
  </button>
  <button data-icname="star">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
    </svg>
    <span>star</span>
  </button>
  <button data-icname="filter">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18l-7 8v6l-4 2v-8z"/>
    </svg>
    <span>filter</span>
  </button>
  <button data-icname="tag">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12V3h9l9 9-9 9zM7.5 7.5h.01"/>
    </svg>
    <span>tag</span>
  </button>
  <button data-icname="image">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01"/>
    </svg>
    <span>image</span>
  </button>
  <button data-icname="trend">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>
    </svg>
    <span>trend</span>
  </button>
  <button data-icname="trendDown">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7l6 6 4-4 8 8M15 17h6v-6"/>
    </svg>
    <span>trendDown</span>
  </button>
  <button data-icname="target">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
    </svg>
    <span>target</span>
  </button>
  <button data-icname="zap">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7z"/>
    </svg>
    <span>zap</span>
  </button>
  <button data-icname="globe">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
    </svg>
    <span>globe</span>
  </button>
  <button data-icname="phone">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>
    </svg>
    <span>phone</span>
  </button>
  <button data-icname="message">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h16v12H8l-4 4z"/>
    </svg>
    <span>message</span>
  </button>
  <button data-icname="shield">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>
    </svg>
    <span>shield</span>
  </button>
  <button data-icname="cloud">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/>
    </svg>
    <span>cloud</span>
  </button>
  <button data-icname="play">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4l13 8-13 8z"/>
    </svg>
    <span>play</span>
  </button>
  <button data-icname="pause">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h4v16H7zM13 4h4v16h-4z"/>
    </svg>
    <span>pause</span>
  </button>
  <button data-icname="refresh">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2 5.5M20 4v7h-7"/>
    </svg>
    <span>refresh</span>
  </button>
  <button data-icname="link">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>
    </svg>
    <span>link</span>
  </button>
  <button data-icname="type">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
    </svg>
    <span>type</span>
  </button>
  <button data-icname="dollar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
    <span>dollar</span>
  </button>
  <button data-icname="truck">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 6h12v10H2zM14 9h4l4 4v3h-8M6 17a2 2 0 1 0 0 .01M18 17a2 2 0 1 0 0 .01"/>
    </svg>
    <span>truck</span>
  </button>
  <button data-icname="building">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V3h10v18M14 8h6v13M8 7h2M8 11h2M8 15h2M17 12h.01M17 16h.01"/>
    </svg>
    <span>building</span>
  </button>
  <button data-icname="palette">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-.9-.6-1.4-.6-2.2 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4c0-4.6-4-8.6-9-8.6zM7.5 11h.01M10 7h.01M14 7h.01"/>
    </svg>
    <span>palette</span>
  </button>
  <button data-icname="sliders">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
    </svg>
    <span>sliders</span>
  </button>
  <button data-icname="list">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
    <span>list</span>
  </button>
  <button data-icname="cursor">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 3l7 17 2-7 7-2z"/>
    </svg>
    <span>cursor</span>
  </button>
  <button data-icname="candle">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3v4M6 17v4M4 7h4v10H4zM18 3v6M18 15v6M16 9h4v6h-4zM12 2v4M12 12v8M10 6h4v6h-4z"/>
    </svg>
    <span>candle</span>
  </button>
  <button data-icname="pie">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12A9 9 0 1 1 12 3v9zM15 3.5A9 9 0 0 1 20.5 9H15z"/>
    </svg>
    <span>pie</span>
  </button>
  <button data-icname="gauge">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18a9 9 0 1 1 16 0M12 14l4-5"/>
    </svg>
    <span>gauge</span>
  </button>
  <button data-icname="bold">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/>
    </svg>
    <span>bold</span>
  </button>
  <button data-icname="italic">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 4h8M6 20h8M14 4l-4 16"/>
    </svg>
    <span>italic</span>
  </button>
  <button data-icname="underline">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4v6a6 6 0 0 0 12 0V4M5 21h14"/>
    </svg>
    <span>underline</span>
  </button>
  <button data-icname="bookmark">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18l-6-4-6 4z"/>
    </svg>
    <span>bookmark</span>
  </button>
  <button data-icname="send">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>
    </svg>
    <span>send</span>
  </button>
  <button data-icname="key">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 7a4 4 0 1 0-3.5 6L5 19.5V22h3v-2h2v-2h2l1.5-1.5A4 4 0 0 0 15 7z"/>
    </svg>
    <span>key</span>
  </button>
  <button data-icname="wifi">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/>
    </svg>
    <span>wifi</span>
  </button>
  <button data-icname="cpu">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6h12v12H6zM9 9h6v6H9zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>
    </svg>
    <span>cpu</span>
  </button>
  <button data-icname="layout">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3h18v18H3zM3 9h18M9 21V9"/>
    </svg>
    <span>layout</span>
  </button>
  <button data-icname="grip">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
      <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/>
    </svg>
    <span>grip</span>
  </button>
  <button data-icname="anim">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>
    </svg>
    <span>anim</span>
  </button>
  <button data-icname="bars">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 20V10M12 20V4M18 20v-6"/>
    </svg>
    <span>bars</span>
  </button>
</div>
```

### ico-002 · Tamanhos e cores

16, 20, 24 e 32 px; cores semânticas.

- 16 px em textos, 20 px em botões, 24 px em navegação, 32 px em destaques
- Cor herdada do texto (currentColor)
- Base sugerida: —

```html
<div class="stack" style="gap:12px">
  <div class="icon-row">
    <span class="row" style="gap:6px">
      <svg class="ic" viewBox="0 0 24 24" style="width:16px;height:16px">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
      </svg>
      <span class="muted sm mono">16</span>
    </span>
    <span class="row" style="gap:6px">
      <svg class="ic" viewBox="0 0 24 24" style="width:20px;height:20px">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
      </svg>
      <span class="muted sm mono">20</span>
    </span>
    <span class="row" style="gap:6px">
      <svg class="ic" viewBox="0 0 24 24" style="width:24px;height:24px">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
      </svg>
      <span class="muted sm mono">24</span>
    </span>
    <span class="row" style="gap:6px">
      <svg class="ic" viewBox="0 0 24 24" style="width:32px;height:32px">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
      </svg>
      <span class="muted sm mono">32</span>
    </span>
  </div>
  <div class="icon-row">
    <span style="color:var(--primary)">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01"/>
      </svg>
    </span>
    <span style="color:var(--success)">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12l5 5L20 7"/>
      </svg>
    </span>
    <span style="color:var(--warning)">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2 21h20L12 3zM12 10v4M12 17h.01"/>
      </svg>
    </span>
    <span style="color:var(--danger)">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18"/>
      </svg>
    </span>
    <span class="muted">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>
      </svg>
    </span>
  </div>
</div>
```

### ico-003 · Menu ↔ fechar

Três linhas que viram um X ao abrir.

- Clique alterna; transição de 250 ms
- Base sugerida: Motion / CSS

```html
<div class="ai-row">
  <button class="ai ai-burger" aria-label="Abrir menu" title="Abrir menu">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path class="l1" d="M4 7h16"/>
      <path class="l2" d="M4 12h16"/>
      <path class="l3" d="M4 17h16"/>
    </svg>
  </button>
  <span class="muted sm">Clique para alternar</span>
</div>
```

### ico-004 · Sino que balança

Sino balança ao passar o mouse ou ao chegar notificação.

- Rotação de ±14° em 600 ms
- Base sugerida: CSS keyframes

```html
<div class="ai-row">
  <button class="ai ai-bell" aria-label="Notificações" title="Notificações">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
    </svg>
  </button>
  <span class="muted sm">Passe o mouse</span>
</div>
```

### ico-005 · Coração pulsando

Batimento contínuo ou no hover.

- Escala 1 → 1,2 → 1 em 1,2 s
- Base sugerida: CSS keyframes

```html
<div class="ai-row">
  <button class="ai ai-heart" aria-label="Curtir" title="Curtir">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>
    </svg>
  </button>
  <span class="muted sm">Passe o mouse</span>
</div>
```

### ico-006 · Check desenhado

O traço do check aparece ao confirmar.

- Círculo e check desenham em sequência
- Base sugerida: SVG stroke-dashoffset

```html
<div class="ai-row">
  <button class="ai ai-check" aria-label="Confirmar" title="Confirmar">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle class="c" cx="12" cy="12" r="9"/>
      <path class="k" d="M8 12.5l3 3 5-6"/>
    </svg>
  </button>
  <span class="muted sm">Clique para desenhar</span>
</div>
```

### ico-007 · Atualizar girando

Gira uma volta ao atualizar.

- Uma volta em 700 ms ao clicar
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-refresh" aria-label="Atualizar" title="Atualizar">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2 5.5M20 4v7h-7"/>
    </svg>
  </button>
  <span class="muted sm">Clique</span>
</div>
```

### ico-008 · Enviar com salto

Seta sobe e volta no hover.

- Seta separada da base
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-upload" aria-label="Enviar" title="Enviar">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path class="ar" d="M12 16V5"/>
      <path class="ar" d="M7 10l5-5 5 5"/>
      <path d="M4 20h16"/>
    </svg>
  </button>
  <span class="muted sm">Passe o mouse</span>
</div>
```

### ico-009 · Lixeira que abre

A tampa levanta no hover.

- Tampa gira -20° no canto
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-trash" aria-label="Excluir" title="Excluir">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path class="lid" d="M4 7h16M9 7V4h6v3"/>
      <path d="M6 7l1 14h10l1-14M10 11v6M14 11v6"/>
    </svg>
  </button>
  <span class="muted sm">Passe o mouse</span>
</div>
```

### ico-010 · Avião de papel

Voa para fora e volta ao enviar.

- Sai pela diagonal e reaparece em 900 ms
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-send" aria-label="Enviar mensagem" title="Enviar mensagem">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>
    </svg>
  </button>
  <span class="muted sm">Clique</span>
</div>
```

### ico-011 · Busca pulsando

Lupa aumenta e procura.

- Leve rotação e escala no hover
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-search" aria-label="Buscar" title="Buscar">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5"/>
    </svg>
  </button>
  <span class="muted sm">Passe o mouse</span>
</div>
```

### ico-012 · Sinal transmitindo

Ondas acendem em sequência.

- Ondas com atraso de 200 ms
- Loop contínuo
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-wifi" aria-label="Conectado" title="Conectado">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path class="w0" d="M12 19h.01"/>
      <path class="w1" d="M8.5 15.5a5 5 0 0 1 7 0"/>
      <path class="w2" d="M5 12a10 10 0 0 1 14 0"/>
      <path class="w3" d="M2 8.5a15 15 0 0 1 20 0"/>
    </svg>
  </button>
  <span class="muted sm">Contínuo</span>
</div>
```

### ico-013 · Play ↔ pausa

Troca com rotação e escala.

- Os dois ícones se cruzam em 250 ms
- Base sugerida: Motion

```html
<div class="ai-row">
  <button class="ai ai-play" aria-label="Reproduzir" title="Reproduzir">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path class="pl" d="M7 4l13 8-13 8z"/>
      <path class="pa" d="M7 4h4v16H7zM13 4h4v16h-4z"/>
    </svg>
  </button>
  <span class="muted sm">Clique</span>
</div>
```

### ico-014 · Sol ↔ lua

Raios recolhem e o sol vira lua.

- Rotação 90° e máscara
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-sun" aria-label="Alternar tema" title="Alternar tema">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle class="core" cx="12" cy="12" r="4.5"/>
      <path class="rays" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      <path class="mn" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
    </svg>
  </button>
  <span class="muted sm">Clique</span>
</div>
```

### ico-015 · Seta que avança

Empurra para a direita no hover.

- translateX 3 px em loop curto
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="btn btn-outline ai-arrowbtn">Continuar<svg class="ic" viewBox="0 0 24 24">
  <path d="M5 12h14M13 6l6 6-6 6"/>
</svg>
</button>
</div>
```

### ico-016 · Carregando em órbita

Pontos orbitando um centro.

- Rotação contínua de 1 s
- Base sugerida: CSS

```html
<div class="ai-row">
  <span class="orbit">
    <i>
  </i>
  <i>
</i>
<i>
</i>
</span>
<span class="muted sm">Contínuo</span>
</div>
```

### ico-017 · Baixar com progresso

Seta desce e a base enche como barra.

- Barra de 0 a 100% em 1,6 s ao clicar
- Base sugerida: CSS

```html
<div class="ai-row">
  <button class="ai ai-download" aria-label="Baixar" title="Baixar">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path class="ar" d="M12 4v11"/>
      <path class="ar" d="M7 10l5 5 5-5"/>
      <path class="base" d="M4 20h16"/>
      <path class="fillb" d="M4 20h16"/>
    </svg>
  </button>
  <span class="muted sm">Clique</span>
</div>
```

### ico-018 · Lottie: Carregando (pontos)

Três pontos pulsando em sequência.

- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles
- Base sugerida: lottie-react (ou @lottiefiles/dotlottie-react)

```html
<div class="lt-box" data-lottie="pulse">
  <div class="lt-stage">
  </div>
  <div class="row">
    <button class="btn btn-ghost btn-sm" data-lt="play">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4l13 8-13 8z"/>
      </svg>Tocar</button>
      <button class="btn btn-ghost btn-sm" data-lt="pause">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h4v16H7zM13 4h4v16h-4z"/>
        </svg>Pausar</button>
      </div>
    </div>
```

### ico-019 · Lottie: Sucesso

Círculo e check desenhados com mola.

- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles
- Base sugerida: lottie-react (ou @lottiefiles/dotlottie-react)

```html
<div class="lt-box" data-lottie="success">
  <div class="lt-stage">
  </div>
  <div class="row">
    <button class="btn btn-ghost btn-sm" data-lt="play">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4l13 8-13 8z"/>
      </svg>Tocar</button>
      <button class="btn btn-ghost btn-sm" data-lt="pause">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h4v16H7zM13 4h4v16h-4z"/>
        </svg>Pausar</button>
      </div>
    </div>
```

### ico-020 · Lottie: Notificação

Sino balançando com contador.

- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles
- Base sugerida: lottie-react (ou @lottiefiles/dotlottie-react)

```html
<div class="lt-box" data-lottie="bell">
  <div class="lt-stage">
  </div>
  <div class="row">
    <button class="btn btn-ghost btn-sm" data-lt="play">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4l13 8-13 8z"/>
      </svg>Tocar</button>
      <button class="btn btn-ghost btn-sm" data-lt="pause">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h4v16H7zM13 4h4v16h-4z"/>
        </svg>Pausar</button>
      </div>
    </div>
```

### ico-021 · Lottie: Curtida com explosão

Coração cresce e solta partículas.

- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles
- Base sugerida: lottie-react (ou @lottiefiles/dotlottie-react)

```html
<div class="lt-box" data-lottie="heart">
  <div class="lt-stage">
  </div>
  <div class="row">
    <button class="btn btn-ghost btn-sm" data-lt="play">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4l13 8-13 8z"/>
      </svg>Tocar</button>
      <button class="btn btn-ghost btn-sm" data-lt="pause">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h4v16H7zM13 4h4v16h-4z"/>
        </svg>Pausar</button>
      </div>
    </div>
```

## Botões

### btn-001 · Hierarquia de botões

Primário, destaque, secundário, contorno, fantasma e perigo.

- Um primário por área de ação
- Hover escurece/clareia 14%; clique desce 1 px
- Base sugerida: Slot (asChild)

```html
<div class="row">
  <button class="btn btn-primary">Salvar</button>
  <button class="btn btn-accent">Publicar</button>
  <button class="btn btn-secondary">Rascunho</button>
  <button class="btn btn-outline">Cancelar</button>
  <button class="btn btn-ghost">Detalhes</button>
  <button class="btn btn-danger">Excluir</button>
</div>
```

### btn-002 · Estados e tamanhos

Carregando, desativado e três tamanhos.

- Carregando: spinner + verbo no gerúndio
- Desativado: 45% de opacidade
- sm 30 / md 38 / lg 48 px
- Base sugerida: —

```html
<div class="stack" style="gap:10px">
  <div class="row">
    <button class="btn btn-primary" data-loadbtn>Enviar pedido</button>
    <button class="btn btn-primary" disabled>Desativado</button>
  </div>
  <div class="row">
    <button class="btn btn-primary btn-sm">Pequeno</button>
    <button class="btn btn-primary">Médio</button>
    <button class="btn btn-primary btn-lg">Grande</button>
  </div>
</div>
```

### btn-003 · Somente ícone

Ações compactas com dica obrigatória.

- Quadrado 38 px; aria-label obrigatório
- Base sugerida: Tooltip

```html
<div class="row">
  <button class="btn btn-secondary btn-icon tipme" data-tip="Buscar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5"/>
    </svg>
  </button>
  <button class="btn btn-outline btn-icon tipme" data-tip="Baixar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>
    </svg>
  </button>
  <button class="btn btn-ghost btn-icon tipme" data-tip="Mais">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
      <path d="M5 12h.01M12 12h.01M19 12h.01"/>
    </svg>
  </button>
  <button class="btn btn-primary btn-icon tipme" data-tip="Novo">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  </button>
</div>
```

### btn-004 · Ícone + texto e contador

Ícone à esquerda, à direita e com contador.

- Ícone de 18 px com 8 px de espaço
- Contador em pílula dentro do botão
- Base sugerida: —

```html
<div class="row">
  <button class="btn btn-primary">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>Novo pedido</button>
    <button class="btn btn-outline">Próximo<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 18l6-6-6-6"/>
  </svg>
</button>
<button class="btn btn-secondary">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h16v12H8l-4 4z"/>
  </svg>Mensagens<span class="bdg">4</span>
</button>
</div>
```

### btn-005 · Grupo segmentado

Escolha exclusiva entre opções lado a lado.

- Bordas compartilhadas; ativo em primária
- Base sugerida: ToggleGroup

```html
<div class="btn-group" data-group>
  <button class="btn btn-sm" aria-pressed="false">Dia</button>
  <button class="btn btn-sm" aria-pressed="true">Semana</button>
  <button class="btn btn-sm" aria-pressed="false">Mês</button>
</div>
```

### btn-006 · Botão dividido

Ação principal + menu de alternativas.

- Seta separada abre as variações da ação
- Base sugerida: DropdownMenu

```html
<div class="split">
  <button class="btn btn-primary" data-toast="ok">Salvar</button>
  <div class="dd">
    <button class="btn btn-primary" data-poptog aria-label="Mais opções de salvar">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>
    <div class="pop right" hidden style="min-width:200px">
      <button class="opt" data-toast="info">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 3H6v18h12V7zM14 3v4h4"/>
        </svg>Salvar como rascunho</button>
        <button class="opt" data-toast="info">
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 9h11v11H9zM5 15H4V4h11v1"/>
          </svg>Salvar e duplicar</button>
          <button class="opt" data-toast="info">
            <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>
            </svg>Salvar e enviar</button>
          </div>
        </div>
      </div>
```

### btn-007 · Botões de alternância

Liga/desliga independentes (ex.: formatação).

- aria-pressed em cada botão
- Ativo tingido com a primária
- Base sugerida: Toggle

```html
<div class="row" style="gap:4px" data-toggles>
  <button class="btn btn-outline btn-icon tgl" aria-pressed="true" aria-label="Negrito">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/>
    </svg>
  </button>
  <button class="btn btn-outline btn-icon tgl" aria-pressed="false" aria-label="Itálico">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 4h8M6 20h8M14 4l-4 16"/>
    </svg>
  </button>
  <button class="btn btn-outline btn-icon tgl" aria-pressed="false" aria-label="Sublinhado">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4v6a6 6 0 0 0 12 0V4M5 21h14"/>
    </svg>
  </button>
  <button class="btn btn-outline tgl" aria-pressed="false">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18l-6-4-6 4z"/>
    </svg>Salvar</button>
  </div>
```

### btn-008 · Botão flutuante com atalhos

Botão de ação flutuante que abre 3 atalhos.

- 56 px; gira 45° ao abrir
- Atalhos entram em cascata de 40 ms
- Base sugerida: —

```html
<div class="fab-wrap" data-fab>
  <div class="dial">
    <button data-toast="info">
      <span class="l">Nova OS</span>
      <span class="c">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L10 2l2.7 2.7z"/>
        </svg>
      </span>
    </button>
    <button data-toast="info">
      <span class="l">Novo cliente</span>
      <span class="c">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/>
        </svg>
      </span>
    </button>
    <button data-toast="info">
      <span class="l">Enviar arquivo</span>
      <span class="c">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>
        </svg>
      </span>
    </button>
  </div>
  <button class="fab" aria-label="Ações rápidas" data-fabbtn>
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  </button>
</div>
```

### btn-009 · Botão como link

Ação terciária dentro de texto.

- Sublinhado com 3 px de afastamento
- Sem fundo nem borda
- Base sugerida: —

```html
<p style="margin:0">Não recebeu o código? <button class="btn btn-link" data-toast="info">Reenviar</button> ou <button class="btn btn-link">fale com o suporte</button>.</p>
```

### btn-010 · Matriz de estados de botões

Cada variação em normal, hover, foco, pressionado, desativado e carregando.

- Use para revisar consistência entre estilos
- Foco sempre visível (anel de 2 px)
- Base sugerida: —

```html
<div class="tbl-wrap">
  <table class="smx">
    <thead>
      <tr>
        <th>
        </th>
        <th class="lbl">Normal</th>
        <th class="lbl">Hover</th>
        <th class="lbl">Foco</th>
        <th class="lbl">Pressionado</th>
        <th class="lbl">Desativado</th>
        <th class="lbl">Carregando</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th class="lbl">Primário</th>
        <td>
          <button class="btn btn-sm btn-primary " tabindex="-1">Salvar</button>
        </td>
        <td>
          <button class="btn btn-sm btn-primary sim-hover" tabindex="-1">Salvar</button>
        </td>
        <td>
          <button class="btn btn-sm btn-primary sim-focus" tabindex="-1">Salvar</button>
        </td>
        <td>
          <button class="btn btn-sm btn-primary sim-active" tabindex="-1">Salvar</button>
        </td>
        <td>
          <button class="btn btn-sm btn-primary dis" disabled tabindex="-1">Salvar</button>
        </td>
        <td>
          <button class="btn btn-sm btn-primary load" tabindex="-1">
            <span class="spin">
            </span>Salvar</button>
          </td>
        </tr>
        <tr>
          <th class="lbl">Secundário</th>
          <td>
            <button class="btn btn-sm btn-secondary " tabindex="-1">Salvar</button>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary sim-hover" tabindex="-1">Salvar</button>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary sim-focus" tabindex="-1">Salvar</button>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary sim-active" tabindex="-1">Salvar</button>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary dis" disabled tabindex="-1">Salvar</button>
          </td>
          <td>
            <button class="btn btn-sm btn-secondary load" tabindex="-1">
              <span class="spin">
              </span>Salvar</button>
            </td>
          </tr>
          <tr>
            <th class="lbl">Contorno</th>
            <td>
              <button class="btn btn-sm btn-outline " tabindex="-1">Salvar</button>
            </td>
            <td>
              <button class="btn btn-sm btn-outline sim-hover" tabindex="-1">Salvar</button>
            </td>
            <td>
              <button class="btn btn-sm btn-outline sim-focus" tabindex="-1">Salvar</button>
            </td>
            <td>
              <button class="btn btn-sm btn-outline sim-active" tabindex="-1">Salvar</button>
            </td>
            <td>
              <button class="btn btn-sm btn-outline dis" disabled tabindex="-1">Salvar</button>
            </td>
            <td>
              <button class="btn btn-sm btn-outline load" tabindex="-1">
                <span class="spin">
                </span>Salvar</button>
              </td>
            </tr>
            <tr>
              <th class="lbl">Fantasma</th>
              <td>
                <button class="btn btn-sm btn-ghost " tabindex="-1">Salvar</button>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost sim-hover" tabindex="-1">Salvar</button>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost sim-focus" tabindex="-1">Salvar</button>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost sim-active" tabindex="-1">Salvar</button>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost dis" disabled tabindex="-1">Salvar</button>
              </td>
              <td>
                <button class="btn btn-sm btn-ghost load" tabindex="-1">
                  <span class="spin">
                  </span>Salvar</button>
                </td>
              </tr>
              <tr>
                <th class="lbl">Perigo</th>
                <td>
                  <button class="btn btn-sm btn-danger " tabindex="-1">Salvar</button>
                </td>
                <td>
                  <button class="btn btn-sm btn-danger sim-hover" tabindex="-1">Salvar</button>
                </td>
                <td>
                  <button class="btn btn-sm btn-danger sim-focus" tabindex="-1">Salvar</button>
                </td>
                <td>
                  <button class="btn btn-sm btn-danger sim-active" tabindex="-1">Salvar</button>
                </td>
                <td>
                  <button class="btn btn-sm btn-danger dis" disabled tabindex="-1">Salvar</button>
                </td>
                <td>
                  <button class="btn btn-sm btn-danger load" tabindex="-1">
                    <span class="spin">
                    </span>Salvar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
```

## Dropdowns e menus

### drp-001 · Select simples

Lista de opções com teclado.

- Abre com clique ou setas; Esc fecha
- Item escolhido em primária com check
- Base sugerida: Select

```html
<div class="dd" data-sel="city">
</div>
```

### drp-002 · Select com ícones e descrição

Opções ricas com ícone e texto de apoio.

- Ícone em quadro de 26 px
- Descrição em texto suave
- Base sugerida: Select (itens customizados)

```html
<div class="dd" data-sel="canal">
</div>
```

### drp-003 · Select agrupado

Opções separadas por grupos.

- Cabeçalho de grupo em mono caixa alta
- Base sugerida: Select (Group + Label)

```html
<div class="dd" data-sel="tz">
</div>
```

### drp-004 · Combobox com busca

Digite para filtrar e escolha com Enter.

- Filtra enquanto digita
- Setas ↑ ↓ e Enter
- Mensagem quando nada é encontrado
- Base sugerida: Combobox (cmdk / Ariakit)

```html
<div class="dd" data-combo>
</div>
```

### drp-005 · Multi-select com etiquetas

Várias escolhas exibidas como etiquetas removíveis.

- Etiqueta com × para remover
- Opções com check
- Base sugerida: Combobox multiple

```html
<div class="dd" data-multi>
</div>
```

### drp-006 · Filtro com checkboxes

Dropdown de filtro com contagem e aplicar.

- Contador no botão
- Limpar e Aplicar no rodapé
- Base sugerida: Popover + Checkbox

```html
<div class="dd" data-checks>
</div>
```

### drp-007 · Menu de ações e do usuário

Ações com ícones, atalhos e item destrutivo.

- Setas navegam; Esc fecha
- Destrutivo em vermelho separado por linha
- Base sugerida: DropdownMenu

```html
<div class="row">
  <div class="dd" data-menu="acoes">
  </div>
  <div class="dd" data-menu="user">
  </div>
</div>
```

### drp-008 · Menu de contexto

Abre com clique direito na posição do cursor.

- Abre no ponto do clique
- Fecha ao clicar fora ou com Esc
- Base sugerida: ContextMenu

```html
<div class="ctx-area dd" data-ctx>Clique com o botão direito aqui<br>(ou toque e segure)</div>
```

## Formulários

### frm-001 · Campos de texto

Texto, com ícone e área com contador.

- Altura 40 px; foco com anel de 3 px
- Contador de caracteres
- Base sugerida: Label

```html
<div class="stack" style="gap:10px">
  <div class="field">
    <label>Nome completo</label>
    <input class="input" value="Mike Inoue">
  </div>
  <div class="iw">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3zM3 6l9 7 9-7"/>
    </svg>
    <input class="input" placeholder="nome@empresa.jp">
  </div>
  <div class="field" data-counter>
    <textarea class="input" maxlength="140" placeholder="Observações">
    </textarea>
    <span class="help">
      <span>Opcional</span>
      <span class="num">0 / 140</span>
    </span>
  </div>
</div>
```

### frm-002 · Rótulo flutuante

O rótulo sobe para dentro do campo ao focar.

- Altura 50 px; rótulo encolhe para 11,5 px
- Base sugerida: — (CSS)

```html
<div class="stack" style="gap:10px">
  <div class="fl">
    <input class="input" placeholder=" " id="fl20">
    <label for="fl20">Telefone</label>
  </div>
  <div class="fl">
    <input class="input" placeholder=" " value="Toyohashi" id="fl21">
    <label for="fl21">Cidade</label>
  </div>
</div>
```

### frm-003 · Campo de etiquetas

Digite e tecle Enter para criar etiquetas.

- Backspace remove a última
- Evita duplicadas
- Base sugerida: —

```html
<div class="input tagbox" data-tags>
  <input placeholder="Adicionar etiqueta…" aria-label="Etiquetas">
</div>
```

### frm-004 · Código de verificação

6 caixas com avanço automático.

- Avança ao digitar, volta no Backspace
- Aceita colar o código inteiro
- Base sugerida: input-otp

```html
<div class="stack" style="gap:8px">
  <div class="otp" data-otp>
    <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
    <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
    <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
    <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
    <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
    <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
  </div>
  <span class="help">Enviamos o código para 090-****-5678.</span>
</div>
```

### frm-005 · Número com + e −

Quantidade com botões e limites.

- Mínimo 0, máximo 99
- Setas do teclado também mudam
- Base sugerida: —

```html
<div class="numst" data-num>
  <button aria-label="Diminuir">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14"/>
    </svg>
  </button>
  <input value="3" aria-label="Quantidade">
  <button aria-label="Aumentar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  </button>
</div>
```

### frm-006 · Checkbox e rádio

Múltipla e única escolha.

- 20 px; check animado
- Indeterminado no “selecionar todos”
- Base sugerida: Checkbox, RadioGroup

```html
<div class="f2">
  <div class="stack" style="gap:8px">
    <label class="ck">
      <input type="checkbox" class="chk" checked>E-mail</label>
      <label class="ck">
        <input type="checkbox" class="chk" checked>LINE</label>
        <label class="ck">
          <input type="checkbox" class="chk">SMS</label>
        </div>
        <div class="stack" style="gap:8px">
          <label class="ck">
            <input type="radio" class="rad" name="pg22" checked>Transferência</label>
            <label class="ck">
              <input type="radio" class="rad" name="pg22">Cartão</label>
              <label class="ck">
                <input type="radio" class="rad" name="pg22">Konbini</label>
              </div>
            </div>
```

### frm-007 · Interruptor

Liga/desliga com descrição.

- 44×24 px; ligado em primária
- Base sugerida: Switch

```html
<div class="stack" style="gap:12px">
  <div class="sw-row">
    <span>Entrega expressa<small>Chega em até 24 h</small>
  </span>
  <input type="checkbox" class="sw" checked>
</div>
<div class="sw-row">
  <span>Embalagem para presente<small>Taxa de ¥ 300</small>
</span>
<input type="checkbox" class="sw">
</div>
</div>
```

### frm-008 · Controle deslizante

Valor com faixa preenchida.

- Valor formatado ao lado do rótulo
- Base sugerida: Slider

```html
<div class="field" data-rng>
  <div class="help" style="color:var(--fg)">
    <span>Orçamento máximo</span>
    <b class="num">¥ 50.000</b>
  </div>
  <input type="range" class="range" min="5000" max="100000" step="1000" value="50000">
</div>
```

### frm-009 · Avaliação com estrelas

Nota de 1 a 5 com prévia ao passar o mouse.

- Prévia no hover
- Texto da nota ao lado
- Base sugerida: RadioGroup

```html
<div class="row" data-rating>
  <div class="stars">
    <button data-v="1" aria-label="1 estrela">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
      </svg>
    </button>
    <button data-v="2" aria-label="2 estrelas">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
      </svg>
    </button>
    <button data-v="3" aria-label="3 estrelas">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
      </svg>
    </button>
    <button data-v="4" aria-label="4 estrelas">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
      </svg>
    </button>
    <button data-v="5" aria-label="5 estrelas">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
      </svg>
    </button>
  </div>
  <span class="muted sm" data-rt>Sem nota</span>
</div>
```

### frm-010 · Seletor de cor

Escolha entre cores predefinidas.

- Círculos de 34 px; selecionado com anel
- Base sugerida: RadioGroup

```html
<div class="swatches" data-swatch>
  <button style="background:var(--primary)" aria-checked="true" aria-label="Cor 1">
  </button>
  <button style="background:var(--accent)" aria-checked="false" aria-label="Cor 2">
  </button>
  <button style="background:var(--success)" aria-checked="false" aria-label="Cor 3">
  </button>
  <button style="background:var(--warning)" aria-checked="false" aria-label="Cor 4">
  </button>
  <button style="background:var(--danger)" aria-checked="false" aria-label="Cor 5">
  </button>
  <button style="background:var(--fg)" aria-checked="false" aria-label="Cor 6">
  </button>
</div>
```

### frm-011 · Data e hora

Calendário com mês e horário.

- Hoje com contorno; escolhido em primária
- Horário em passos de 15 min
- Base sugerida: Popover + react-day-picker

```html
<div class="dd" data-dt>
</div>
```

### frm-012 · Intervalo de datas

Escolha início e fim no mesmo calendário.

- Primeiro clique = início, segundo = fim
- Dias do intervalo tingidos
- Base sugerida: react-day-picker (mode="range")

```html
<div class="dd" data-rdate>
</div>
```

### frm-013 · Área de upload

Arraste arquivos ou clique; progresso por arquivo.

- Borda tracejada que acende ao arrastar
- Lista com barra de progresso
- Limite exibido (10 MB)
- Base sugerida: react-dropzone

```html
<div data-drop>
  <div class="drop" tabindex="0" role="button">
    <span class="chip-ic">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>
      </svg>
    </span>
    <b>Arraste arquivos ou clique para enviar</b>
    <span class="muted sm">PDF, JPG ou PNG · até 10 MB</span>
  </div>
  <ul class="files">
  </ul>
</div>
```

### frm-014 · Tremor no erro

O campo inválido treme ao tentar enviar.

- Shake de 420 ms
- Borda vermelha + mensagem
- Foco no primeiro erro
- Base sugerida: react-hook-form + Motion

```html
<form class="stack" data-shake novalidate style="gap:10px">
  <div class="field">
    <label>E-mail<span class="req">*</span>
  </label>
  <input class="input" type="email" placeholder="nome@empresa.jp">
  <span class="help err" hidden>Informe um e-mail válido.</span>
</div>
<div class="field">
  <label>Senha<span class="req">*</span>
</label>
<input class="input" type="password" placeholder="Mínimo 8 caracteres">
<span class="help err" hidden>A senha precisa de 8 caracteres.</span>
</div>
<button class="btn btn-primary">Entrar</button>
</form>
```

### frm-015 · Campo obrigatório

Asterisco e aviso ao sair do campo vazio.

- aria-required
- Aviso some ao digitar
- Base sugerida: Form (Radix)

```html
<div class="field" data-required>
  <label>Nome do cliente<span class="req">*</span>
</label>
<input class="input" aria-required="true" placeholder="Clique e saia sem digitar">
<span class="help err" hidden>Campo obrigatório.</span>
</div>
```

### frm-016 · Validação em tempo real

Ícone de certo ou erro enquanto digita.

- Valida após 3 caracteres
- Borda verde quando válido
- Base sugerida: react-hook-form (onChange)

```html
<div class="field" data-live>
  <label>E-mail</label>
  <div class="iw">
    <input class="input pr" placeholder="digite um e-mail">
    <span data-ico>
    </span>
  </div>
  <span class="help">Ex.: contato@empresa.jp</span>
</div>
```

### frm-017 · Força da senha

Barra de 4 níveis com o que falta.

- Critérios: 8+, maiúscula, número, símbolo
- Base sugerida: —

```html
<div class="field" data-strength>
  <label>Nova senha</label>
  <input class="input" type="password" placeholder="Digite uma senha">
  <div class="strength">
    <i>
  </i>
  <i>
</i>
<i>
</i>
<i>
</i>
</div>
<span class="help">Use 8+ caracteres, maiúscula, número e símbolo.</span>
</div>
```

### frm-018 · Resumo de erros

Lista os erros no topo com links para os campos.

- Recebe foco ao aparecer
- Cada item leva ao campo
- Base sugerida: —

```html
<form class="stack" data-summary novalidate style="gap:10px">
  <div class="err-sum" hidden>
  </div>
  <input class="input" data-n="Nome" placeholder="Nome">
  <input class="input" data-n="Telefone" placeholder="Telefone">
  <button class="btn btn-primary">Salvar</button>
</form>
```

### frm-020 · Switch com ícones

Interruptor com ícone dentro do botão (sol/lua).

- Ícone do estado atual dentro do botão
- Fundo muda de cor ao ligar
- Base sugerida: Switch (thumb customizado)

```html
<label class="isw">
  <input type="checkbox" class="sr-in" aria-label="Tema escuro">
  <span class="trk">
    <span class="th">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      </svg>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
      </svg>
    </span>
  </span>
  <span>Tema escuro</span>
</label>
```

### frm-021 · Botão de tema animado

Sol que gira e vira lua.

- Rotação 180° em 400 ms
- Base sugerida: —

```html
<div class="row">
  <button class="ai ai-sun ai-lg" aria-label="Alternar tema" title="Alternar tema">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle class="core" cx="12" cy="12" r="4.5"/>
      <path class="rays" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      <path class="mn" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
    </svg>
  </button>
  <span class="muted sm">Clique</span>
</div>
```

### frm-022 · Mostrar/ocultar senha

Olho dentro do campo alterna a visibilidade.

- aria-pressed no botão
- Ícone olho / olho riscado
- Base sugerida: —

```html
<div class="iw" data-pwd>
  <input class="input pr" type="password" value="Sugita2026!" aria-label="Senha">
  <button type="button" class="btn btn-ghost btn-icon btn-sm" style="position:absolute;right:5px;top:5px" aria-label="Mostrar senha" aria-pressed="false">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  </button>
</div>
```

### frm-023 · Ícones alternáveis

Favoritar, salvar, silenciar e fixar.

- Preenche o ícone quando ativo
- Cor por função (aviso, primária, erro)
- Base sugerida: Toggle

```html
<div class="row" data-itg>
  <button class="itg" aria-pressed="true" style="--k:var(--warning)" aria-label="Favoritar" title="Favoritar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
    </svg>
  </button>
  <button class="itg" aria-pressed="false" style="--k:var(--primary)" aria-label="Salvar" title="Salvar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18l-6-4-6 4z"/>
    </svg>
  </button>
  <button class="itg" aria-pressed="false" style="--k:var(--danger)" aria-label="Silenciar" title="Silenciar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
    </svg>
  </button>
  <button class="itg" aria-pressed="false" style="--k:var(--accent)" aria-label="Fixar" title="Fixar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12V3h9l9 9-9 9zM7.5 7.5h.01"/>
    </svg>
  </button>
</div>
```

### frm-024 · Alternar visualização

Lista, grade ou quadro.

- Ícone + rótulo; o ativo fica em primária
- Base sugerida: ToggleGroup

```html
<div class="btn-group" data-group>
  <button class="btn btn-sm" aria-pressed="true">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>Lista</button>
    <button class="btn btn-sm" aria-pressed="false">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>
      </svg>Grade</button>
      <button class="btn btn-sm" aria-pressed="false">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3h18v18H3zM3 9h18M9 21V9"/>
        </svg>Quadro</button>
      </div>
```

### frm-025 · Switch grande ON/OFF

Interruptor largo com rótulo dentro.

- 72×32 px
- Texto ON/OFF dentro da trilha
- Base sugerida: Switch

```html
<div class="row" style="gap:18px">
  <label class="bigsw">
    <input type="checkbox" checked aria-label="Modo manutenção">
    <span>
    </span>
  </label>
  <span>Modo manutenção</span>
</div>
```

### frm-026 · Cartões selecionáveis

Escolha por cartão com ícone e check.

- Borda primária e selo de check no escolhido
- Base sugerida: RadioGroup / CheckboxGroup

```html
<div class="selcards" data-selcards>
  <button class="selcard" aria-pressed="true">
    <span class="chip-ic">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 6h12v10H2zM14 9h4l4 4v3h-8M6 17a2 2 0 1 0 0 .01M18 17a2 2 0 1 0 0 .01"/>
      </svg>
    </span>
    <b>Entrega</b>
    <span class="muted sm">2 a 3 dias</span>
    <span class="tick">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12l5 5L20 7"/>
      </svg>
    </span>
  </button>
  <button class="selcard" aria-pressed="false">
    <span class="chip-ic">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 21V3h10v18M14 8h6v13M8 7h2M8 11h2M8 15h2M17 12h.01M17 16h.01"/>
      </svg>
    </span>
    <b>Retirada</b>
    <span class="muted sm">Na loja hoje</span>
    <span class="tick">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12l5 5L20 7"/>
      </svg>
    </span>
  </button>
  <button class="selcard" aria-pressed="false">
    <span class="chip-ic">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7z"/>
      </svg>
    </span>
    <b>Expressa</b>
    <span class="muted sm">Em 24 h</span>
    <span class="tick">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12l5 5L20 7"/>
      </svg>
    </span>
  </button>
</div>
```

### frm-027 · Favoritar com contador

Estrela que preenche e soma.

- Mola na escala ao marcar
- Base sugerida: —

```html
<button class="like fav" data-like>
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
  </svg>
  <span>128</span>
</button>
```

### frm-019 · Estados do campo

Normal, foco, preenchido, erro, sucesso, desativado e somente leitura.

- Mesma altura em todos os estados
- Mensagem abaixo só em erro e sucesso
- Base sugerida: —

```html
<div class="states">
  <div class="field">
    <span class="lbl">Normal</span>
    <input class="input " value="" placeholder="Digite…" aria-label="Normal">
  </div>
  <div class="field">
    <span class="lbl">Foco</span>
    <input class="input sim-focus" value="" placeholder="Digite…" aria-label="Foco">
  </div>
  <div class="field">
    <span class="lbl">Preenchido</span>
    <input class="input " value="Toyohashi" placeholder="Digite…" aria-label="Preenchido">
  </div>
  <div class="field">
    <span class="lbl">Erro</span>
    <input class="input is-err" value="090-12" placeholder="Digite…" aria-label="Erro">
    <span class="help err">Número incompleto.</span>
  </div>
  <div class="field">
    <span class="lbl">Sucesso</span>
    <input class="input is-ok" value="mike@empresa.jp" placeholder="Digite…" aria-label="Sucesso">
    <span class="help okk">E-mail válido.</span>
  </div>
  <div class="field">
    <span class="lbl">Desativado</span>
    <input class="input dis" value="" placeholder="Digite…" disabled aria-label="Desativado">
  </div>
  <div class="field">
    <span class="lbl">Somente leitura</span>
    <input class="input ro" value="#10482" placeholder="Digite…" readonly aria-label="Somente leitura">
  </div>
</div>
```

## Calendários

### cal-001 · Calendário mensal

Grade do mês com eventos coloridos, “+N” e navegação.

- Até 2 eventos por dia + contador “+N”
- Hoje destacado; dias de outro mês esmaecidos
- Clique no evento abre os detalhes; clique no dia abre a visão diária
- Alterna Mês / Semana / Dia / Lista
- Base sugerida: react-big-calendar ou FullCalendar

```html
<div data-cal="month">
</div>
```

### cal-002 · Calendário semanal

Grade de horários de 7 dias com blocos de evento e linha da hora atual.

- Faixa de 07:00 a 20:00, 44 px por hora
- Evento posicionado pelo horário real
- Linha vermelha da hora atual no dia de hoje
- Base sugerida: FullCalendar (timeGridWeek)

```html
<div data-cal="week">
</div>
```

### cal-003 · Calendário diário

Linha do tempo do dia com painel lateral de compromissos.

- Blocos com título, horário e cor por tipo
- Mini calendário e lista do dia ao lado
- Base sugerida: FullCalendar (timeGridDay)

```html
<div data-cal="day">
</div>
```

### cal-004 · Agenda em lista

Eventos agrupados por dia, com horário e cor.

- Cabeçalho por dia com dia da semana
- Barra colorida pelo tipo do evento
- Base sugerida: —

```html
<div data-cal="list">
</div>
```

### cal-005 · Mini calendário com marcações

Mês compacto com pontos nos dias com eventos.

- Ponto embaixo do dia com evento
- Clique escolhe o dia e mostra os eventos
- Base sugerida: react-day-picker (modifiers)

```html
<div data-minical>
</div>
```

### cal-006 · Cronograma (Gantt)

Barras de projetos ao longo das semanas, com linha de hoje.

- Barra preenchida = progresso
- Linha vertical marca hoje
- Rótulo e responsável por linha
- Base sugerida: frappe-gantt ou SVG próprio

```html
<div data-gantt>
</div>
```

## Navegação

### nav-001 · Expansível com ícones

Abre com rótulos e recolhe deixando os ícones.

- 240 px ↔ 72 px
- Dica no ícone quando recolhido
- Estado lembrado
- Base sugerida: Tooltip + Collapsible

```html
<div class="demo-box">
  <nav class="ds">
    <a href="#" class="on tipme" data-tip="Início" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>
      </svg>
      <span class="t">Início</span>
    </a>
    <a href="#" class=" tipme" data-tip="Relatórios" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>
      </svg>
      <span class="t">Relatórios</span>
    </a>
    <a href="#" class=" tipme" data-tip="Clientes" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>
      </svg>
      <span class="t">Clientes</span>
    </a>
    <a href="#" class=" tipme" data-tip="Pedidos" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>
      </svg>
      <span class="t">Pedidos</span>
    </a>
    <a href="#" class=" tipme" data-tip="Ajustes" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15l1.6 2.8-2.2 2.2-2.8-1.6a7 7 0 0 1-2 .8L13.2 22h-2.4l-.8-2.8a7 7 0 0 1-2-.8l-2.8 1.6L3 17.8 4.6 15a7 7 0 0 1-.8-2L1 12.2V9.8L3.8 9a7 7 0 0 1 .8-2L3 4.2 5.2 2 8 3.6a7 7 0 0 1 2-.8L10.8 0h2.4l.8 2.8a7 7 0 0 1 2 .8L18.8 2 21 4.2 19.4 7a7 7 0 0 1 .8 2l2.8.8v2.4l-2.8.8a7 7 0 0 1-.8 2z"/>
      </svg>
      <span class="t">Ajustes</span>
    </a>
    <a href="#" data-dstog style="margin-top:auto">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      <span class="t">Recolher</span>
    </a>
  </nav>
  <div class="ph">
    <i style="width:55%;height:14px">
  </i>
  <i style="width:90%">
</i>
<i style="width:80%">
</i>
<i style="width:70%">
</i>
<i style="width:85%;height:60px;margin-top:6px">
</i>
</div>
</div>
```

### nav-002 · Árvore com subitens

Itens com subitens que abrem logo abaixo (o menu deste dashboard).

- Item ativo abre seus subitens
- Subitens com linha guia à esquerda
- Clicar de novo recolhe
- Base sugerida: Collapsible + NavigationMenu

```html
<div class="demo-box">
  <nav class="ds" style="width:200px" data-tree>
    <div class="nv open">
      <a href="#" class="on">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h6l2 2h10v11H3z"/>
        </svg>
        <span class="t">Projetos</span>
        <svg class="ic chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </a>
      <div class="nv-subs">
        <a href="#" class="on">Abertos</a>
        <a href="#">Criar novo</a>
        <a href="#">Finalizados</a>
      </div>
    </div>
    <div class="nv">
      <a href="#">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>
        </svg>
        <span class="t">Clientes</span>
        <svg class="ic chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </a>
      <div class="nv-subs">
        <a href="#">Lista</a>
        <a href="#">Importar</a>
      </div>
    </div>
    <div class="nv">
      <a href="#">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15l1.6 2.8-2.2 2.2-2.8-1.6a7 7 0 0 1-2 .8L13.2 22h-2.4l-.8-2.8a7 7 0 0 1-2-.8l-2.8 1.6L3 17.8 4.6 15a7 7 0 0 1-.8-2L1 12.2V9.8L3.8 9a7 7 0 0 1 .8-2L3 4.2 5.2 2 8 3.6a7 7 0 0 1 2-.8L10.8 0h2.4l.8 2.8a7 7 0 0 1 2 .8L18.8 2 21 4.2 19.4 7a7 7 0 0 1 .8 2l2.8.8v2.4l-2.8.8a7 7 0 0 1-.8 2z"/>
        </svg>
        <span class="t">Ajustes</span>
      </a>
    </div>
  </nav>
  <div class="ph">
    <i style="width:55%;height:14px">
  </i>
  <i style="width:90%">
</i>
<i style="width:80%">
</i>
<i style="width:70%">
</i>
<i style="width:85%;height:60px;margin-top:6px">
</i>
</div>
</div>
```

### nav-003 · Trilho de ícones

Barra estreita só com ícones.

- 56–64 px; barra de 3 px no ativo
- Base sugerida: Tooltip

```html
<div class="demo-box">
  <nav class="ds rail">
    <a href="#" class=" tipme" data-tip="Início" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>
      </svg>
      <span class="t">Início</span>
    </a>
    <a href="#" class="on tipme" data-tip="Relatórios" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>
      </svg>
      <span class="t">Relatórios</span>
    </a>
    <a href="#" class=" tipme" data-tip="Clientes" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>
      </svg>
      <span class="t">Clientes</span>
    </a>
    <a href="#" class=" tipme" data-tip="Pedidos" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>
      </svg>
      <span class="t">Pedidos</span>
    </a>
    <a href="#" class=" tipme" data-tip="Ajustes" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15l1.6 2.8-2.2 2.2-2.8-1.6a7 7 0 0 1-2 .8L13.2 22h-2.4l-.8-2.8a7 7 0 0 1-2-.8l-2.8 1.6L3 17.8 4.6 15a7 7 0 0 1-.8-2L1 12.2V9.8L3.8 9a7 7 0 0 1 .8-2L3 4.2 5.2 2 8 3.6a7 7 0 0 1 2-.8L10.8 0h2.4l.8 2.8a7 7 0 0 1 2 .8L18.8 2 21 4.2 19.4 7a7 7 0 0 1 .8 2l2.8.8v2.4l-2.8.8a7 7 0 0 1-.8 2z"/>
      </svg>
      <span class="t">Ajustes</span>
    </a>
  </nav>
  <div class="ph">
    <i style="width:55%;height:14px">
  </i>
  <i style="width:90%">
</i>
<i style="width:80%">
</i>
<i style="width:70%">
</i>
<i style="width:85%;height:60px;margin-top:6px">
</i>
</div>
</div>
```

### nav-004 · Flutuante

Menu como cartão afastado das bordas.

- Margem de 10 px, raio e sombra de card
- Base sugerida: —

```html
<div class="demo-box" style="background:linear-gradient(135deg,color-mix(in oklch,var(--primary) 20%,var(--bg)),var(--bg))">
  <nav class="ds float">
    <a href="#" class=" tipme" data-tip="Início" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>
      </svg>
      <span class="t">Início</span>
    </a>
    <a href="#" class=" tipme" data-tip="Relatórios" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>
      </svg>
      <span class="t">Relatórios</span>
    </a>
    <a href="#" class="on tipme" data-tip="Clientes" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>
      </svg>
      <span class="t">Clientes</span>
    </a>
    <a href="#" class=" tipme" data-tip="Pedidos" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>
      </svg>
      <span class="t">Pedidos</span>
    </a>
    <a href="#" class=" tipme" data-tip="Ajustes" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15l1.6 2.8-2.2 2.2-2.8-1.6a7 7 0 0 1-2 .8L13.2 22h-2.4l-.8-2.8a7 7 0 0 1-2-.8l-2.8 1.6L3 17.8 4.6 15a7 7 0 0 1-.8-2L1 12.2V9.8L3.8 9a7 7 0 0 1 .8-2L3 4.2 5.2 2 8 3.6a7 7 0 0 1 2-.8L10.8 0h2.4l.8 2.8a7 7 0 0 1 2 .8L18.8 2 21 4.2 19.4 7a7 7 0 0 1 .8 2l2.8.8v2.4l-2.8.8a7 7 0 0 1-.8 2z"/>
      </svg>
      <span class="t">Ajustes</span>
    </a>
  </nav>
  <div class="ph">
    <i style="width:55%;height:14px">
  </i>
  <i style="width:90%">
</i>
<i style="width:80%">
</i>
<i style="width:70%">
</i>
<i style="width:85%;height:60px;margin-top:6px">
</i>
</div>
</div>
```

### nav-005 · Gaveta sobreposta

Menu escondido que desliza sobre o conteúdo.

- Fundo escurecido fecha ao clicar
- Padrão para celular
- Base sugerida: Dialog / Sheet

```html
<div class="demo-box" data-dbox>
  <div class="ph">
    <button class="btn btn-outline btn-sm" data-drawerdemo style="align-self:flex-start">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18M3 12h18M3 18h18"/>
      </svg>Abrir menu</button>
      <i style="width:80%">
    </i>
    <i style="width:70%">
  </i>
  <i style="width:85%;height:60px">
</i>
</div>
</div>
```

### nav-006 · Duplo nível

Trilho de ícones + painel de submenu.

- Trocar de seção atualiza o painel
- Base sugerida: Tabs (vertical)

```html
<div class="demo-box">
  <nav class="ds rail" data-dual>
    <a href="#" class="on tipme" data-tip="Início" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>
      </svg>
      <span class="t">Início</span>
    </a>
    <a href="#" class=" tipme" data-tip="Relatórios" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>
      </svg>
      <span class="t">Relatórios</span>
    </a>
    <a href="#" class=" tipme" data-tip="Clientes" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>
      </svg>
      <span class="t">Clientes</span>
    </a>
    <a href="#" class=" tipme" data-tip="Pedidos" data-nolink>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>
      </svg>
      <span class="t">Pedidos</span>
    </a>
  </nav>
  <nav class="ds sub" data-dualsub>
  </nav>
  <div class="ph">
    <i style="width:55%;height:14px">
  </i>
  <i style="width:90%">
</i>
<i style="width:80%">
</i>
<i style="width:70%">
</i>
<i style="width:85%;height:60px;margin-top:6px">
</i>
</div>
</div>
```

### nav-007 · Abas sublinhadas

Indicador desliza até a aba ativa.

- Setas ← → trocam de aba
- Usadas nos subitens deste dashboard
- Base sugerida: Tabs

```html
<div data-tabs>
  <div class="tabs" role="tablist">
    <button class="tab" role="tab" aria-selected="true">Resumo</button>
    <button class="tab" role="tab" aria-selected="false">Histórico</button>
    <button class="tab" role="tab" aria-selected="false">Ajustes</button>
    <span class="tab-ind">
    </span>
  </div>
  <div class="tab-panel">Pedido #10482 pago em 29/10.</div>
</div>
```

### nav-008 · Abas em pílula

Aba ativa com fundo sólido.

- Ativa em primária
- Base sugerida: Tabs

```html
<div data-tabs>
  <div class="tabs pills" role="tablist">
    <button class="tab" role="tab" aria-selected="true">Todos</button>
    <button class="tab" role="tab" aria-selected="false">Abertos</button>
    <button class="tab" role="tab" aria-selected="false">Fechados</button>
  </div>
  <div class="tab-panel">Pedido #10482 pago em 29/10.</div>
</div>
```

### nav-009 · Abas segmentadas

Controle em caixa, estilo iOS.

- Ativa em superfície elevada
- Base sugerida: Tabs

```html
<div data-tabs>
  <div class="tabs boxed" role="tablist">
    <button class="tab" role="tab" aria-selected="true">Dia</button>
    <button class="tab" role="tab" aria-selected="false">Semana</button>
    <button class="tab" role="tab" aria-selected="false">Mês</button>
  </div>
  <div class="tab-panel">Pedido #10482 pago em 29/10.</div>
</div>
```

### nav-010 · Abas verticais

Abas em coluna à esquerda do conteúdo.

- Barra de 2 px à direita da ativa
- Bom para páginas de ajustes
- Base sugerida: Tabs (orientation="vertical")

```html
<div data-tabs class="vtabs">
  <div class="tabs" role="tablist" aria-orientation="vertical">
    <button class="tab" role="tab" aria-selected="true">Perfil</button>
    <button class="tab" role="tab" aria-selected="false">Segurança</button>
    <button class="tab" role="tab" aria-selected="false">Avisos</button>
  </div>
  <div class="tab-panel">Pedido #10482 pago em 29/10.</div>
</div>
```

### nav-011 · Breadcrumb

Caminho até a página atual.

- Último com aria-current
- Base sugerida: Breadcrumb

```html
<ol class="crumbs">
  <li>
    <a href="#" data-nolink>Início</a>
  </li>
  <li>
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  </li>
  <li>
    <a href="#" data-nolink>Pedidos</a>
  </li>
  <li>
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  </li>
  <li>
    <span aria-current="page">#10482</span>
  </li>
</ol>
```

### nav-012 · Etapas (stepper)

Progresso por etapas com voltar e avançar.

- Etapa concluída preenchida, atual com halo
- Linha entre etapas pinta ao concluir
- Base sugerida: —

```html
<div data-wizdemo class="stack">
  <div class="wiz">
  </div>
  <div class="row" style="justify-content:space-between">
    <button class="btn btn-ghost btn-sm" data-wp>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6"/>
      </svg>Voltar</button>
      <button class="btn btn-primary btn-sm" data-wn>Avançar<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  </button>
</div>
</div>
```

### nav-013 · Paginação

Navegação entre páginas.

- Página atual em primária
- Reticências com muitas páginas
- Base sugerida: —

```html
<div class="pager" style="margin:0">
  <span class="muted sm">1–8 de 124</span>
  <nav class="pages" data-pager>
    <button class="btn btn-ghost btn-sm btn-icon" aria-label="Anterior">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <button class="btn btn-ghost btn-sm" aria-current="page">1</button>
    <button class="btn btn-ghost btn-sm">2</button>
    <button class="btn btn-ghost btn-sm">3</button>
    <button class="btn btn-ghost btn-sm" disabled>…</button>
    <button class="btn btn-ghost btn-sm">16</button>
    <button class="btn btn-ghost btn-sm btn-icon" aria-label="Próxima">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  </nav>
</div>
```

### nav-014 · Acordeão

Seções que abrem e fecham.

- Chevron gira 180° ao abrir
- Base sugerida: Accordion

```html
<div class="acc">
  <details open>
    <summary>Como funciona o prazo?<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 9l6 6 6-6"/>
  </svg>
</summary>
<div>O prazo conta a partir da confirmação do pagamento.</div>
</details>
<details>
  <summary>Posso alterar o endereço?<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M6 9l6 6 6-6"/>
</svg>
</summary>
<div>Sim, até o pedido sair para entrega.</div>
</details>
</div>
```

### nav-015 · Filtros em pílula

Botões de filtro alternáveis.

- Ativo em cor invertida
- Base sugerida: ToggleGroup

```html
<div class="pills" data-pills>
  <button class="pill" aria-pressed="true">Todos</button>
  <button class="pill" aria-pressed="false">Abertos</button>
  <button class="pill" aria-pressed="false">Atrasados</button>
</div>
```

## Feedback

### fbk-001 · Alerta inline

Faixa de mensagem em 4 tipos.

- Fundo 10% da cor do tipo
- Pode ser dispensável
- Base sugerida: —

```html
<div class="stack" style="gap:8px">
  <div class="alert k-info">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01"/>
    </svg>
    <div>
      <b>Nova versão</b>
      <p>Exportação em PDF disponível.</p>
    </div>
  </div>
  <div class="alert k-ok">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l5 5L20 7"/>
    </svg>
    <div>
      <b>Pagamento confirmado</b>
    </div>
  </div>
  <div class="alert k-warn">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2 21h20L12 3zM12 10v4M12 17h.01"/>
    </svg>
    <div>
      <b>Estoque baixo</b>
    </div>
  </div>
  <div class="alert k-err">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18"/>
    </svg>
    <div>
      <b>Falha na sincronização</b>
    </div>
    <button class="x" data-dismiss aria-label="Fechar">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18"/>
      </svg>
    </button>
  </div>
</div>
```

### fbk-002 · Toast no canto

Notificação temporária empilhável.

- Fecha em ~4 s; até 3 empilhadas
- Base sugerida: Toast (sonner)

```html
<div class="row">
  <button class="btn btn-outline btn-sm" data-toast="ok">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l5 5L20 7"/>
    </svg>Sucesso</button>
    <button class="btn btn-outline btn-sm" data-toast="err">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2 21h20L12 3zM12 10v4M12 17h.01"/>
      </svg>Erro</button>
      <button class="btn btn-outline btn-sm" data-toast="info">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01"/>
        </svg>Info</button>
      </div>
```

### fbk-003 · Barra de aviso no topo

Faixa de largura total, dispensável.

- Fundo primário com link de ação
- Base sugerida: —

```html
<div class="demo-box" style="height:140px;flex-direction:column">
  <div class="topbar-alert">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01"/>
    </svg>Manutenção no sábado às 22h. <a href="#" data-nolink>Saiba mais</a>
    <button data-dismiss aria-label="Fechar">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18"/>
      </svg>
    </button>
  </div>
  <div class="ph">
    <i style="width:55%;height:14px">
  </i>
  <i style="width:90%">
</i>
<i style="width:80%">
</i>
<i style="width:70%">
</i>
<i style="width:85%;height:60px;margin-top:6px">
</i>
</div>
</div>
```

### fbk-004 · Snackbar com desfazer

Mensagem na base com ação única.

- Fica ~5 s
- Base sugerida: Toast (com action)

```html
<button class="btn btn-outline" data-snack>
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 4h18v5H3zM5 9v11h14V9M10 13h4"/>
  </svg>Arquivar conversa</button>
```

### fbk-005 · Contador em ícone

Número ou ponto pulsante sobre o ícone.

- Clique zera o contador
- Base sugerida: —

```html
<div class="row" style="gap:18px">
  <button class="btn btn-secondary btn-icon dot-badge" data-clear aria-label="Notificações">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>
    </svg>
    <span class="cnt">3</span>
  </button>
  <button class="btn btn-secondary btn-icon dot-badge" aria-label="Mensagens">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3zM3 6l9 7 9-7"/>
    </svg>
    <span class="pulse">
    </span>
  </button>
</div>
```

### fbk-006 · Modal central

Janela no centro com fundo desfocado.

- Esc e clique fora fecham
- Foco preso no modal
- Base sugerida: Dialog

```html
<button class="btn btn-primary" data-open="modal">Abrir modal</button>
```

### fbk-007 · Confirmação destrutiva

Confirma antes de excluir.

- Verbo claro no botão vermelho
- Não fecha ao clicar fora
- Base sugerida: AlertDialog

```html
<button class="btn btn-danger" data-open="confirm">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>
  </svg>Excluir registro</button>
```

### fbk-008 · Painel lateral

Formulário que desliza da direita.

- Rodapé fixo com ações
- Base sugerida: Sheet

```html
<button class="btn btn-outline" data-open="drawer">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>
  </svg>Editar cliente</button>
```

### fbk-009 · Popover ancorado

Balão de detalhes preso ao botão.

- Fecha ao clicar fora
- Base sugerida: Popover

```html
<div class="dd" data-popdemo>
</div>
```

### fbk-010 · Paleta de comandos

Ctrl+K: busca de telas e ações.

- Navega para qualquer tela do dashboard
- Setas e Enter
- Base sugerida: cmdk

```html
<button class="btn btn-secondary" data-open="cmd">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5"/>
  </svg>Buscar <span class="kbd">Ctrl K</span>
</button>
```

### fbk-011 · Dica (tooltip)

Rótulo curto ao passar o mouse.

- Cores invertidas do tema
- Base sugerida: Tooltip

```html
<div class="row">
  <button class="btn btn-secondary btn-icon tipme" data-tip="Buscar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5"/>
    </svg>
  </button>
  <button class="btn btn-outline tipme" data-tip="Exporta os 124 pedidos">Exportar</button>
</div>
```

### fbk-012 · Indicadores de carregamento

Anel, pontos, barra e pulso.

- Anel para botões e áreas pequenas
- Barra indeterminada para topo de página
- Base sugerida: —

```html
<div class="row" style="gap:26px">
  <span class="sp-ring">
  </span>
  <span class="sp-dots">
    <i>
  </i>
  <i>
</i>
<i>
</i>
</span>
<span class="sp-bar">
</span>
<span class="sp-pulse">
</span>
</div>
```

### fbk-013 · Esqueleto (skeleton)

Formato do conteúdo enquanto carrega.

- Brilho passando em 1,4 s
- Base sugerida: Skeleton

```html
<div class="skel row" style="flex-wrap:nowrap">
  <i style="width:44px;height:44px;border-radius:50%;flex:none">
</i>
<div style="flex:1;display:flex;flex-direction:column;gap:8px">
  <i style="height:12px;width:70%">
</i>
<i style="height:12px;width:45%">
</i>
</div>
</div>
```

### fbk-014 · Barras de progresso

Linear, listrada e circular.

- Listras animadas no modo animado
- Base sugerida: Progress

```html
<div class="stack" style="gap:12px">
  <div class="prog">
    <div class="prog-top">
      <span>Migração</span>
      <b class="num">72%</b>
    </div>
    <div class="track">
      <div class="fill striped" style="--v:72%">
      </div>
    </div>
  </div>
  <div class="prog">
    <div class="prog-top">
      <span>Armazenamento</span>
      <b class="num">84%</b>
    </div>
    <div class="track">
      <div class="fill" style="--v:84%;--k:var(--warning)">
      </div>
    </div>
  </div>
</div>
```

### fbk-015 · Estado vazio

Quando não há dados: explica e oferece a próxima ação.

- Ícone em círculo de 56 px
- Título + uma frase + botão
- Base sugerida: —

```html
<div class="empty">
  <span class="chip-ic">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h6l2 2h10v11H3z"/>
    </svg>
  </span>
  <b>Nenhum projeto ainda</b>
  <span class="muted sm">Crie o primeiro para acompanhar prazos e equipe.</span>
  <button class="btn btn-primary btn-sm" data-nav="projetos" data-sub="novo">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>Criar projeto</button>
  </div>
```

## Cards

### crd-001 · Card de projeto

Capa, status, equipe e ação.

- Capa de 90 px em gradiente do tema
- Base sugerida: —

```html
<div class="card" style="padding:18px">
  <div style="height:80px;margin:-18px -18px 14px;border-radius:var(--radius) var(--radius) 0 0;background:radial-gradient(circle at 20% 30%,color-mix(in oklch,var(--accent) 70%,transparent),transparent 45%),linear-gradient(135deg,var(--primary),color-mix(in oklch,var(--primary) 40%,var(--surface-2)));position:relative">
    <span class="badge solid" style="position:absolute;left:12px;bottom:10px">Em andamento</span>
  </div>
  <b class="h-display h3">Portal do cliente</b>
  <p class="muted sm" style="margin:4px 0 10px">Contratos, boletos e chamados.</p>
  <div class="row" style="justify-content:space-between">
    <div class="avs">
      <span class="avatar">MK</span>
      <span class="avatar alt">KT</span>
    </div>
    <button class="btn btn-ghost btn-sm">Abrir<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 18l6-6-6-6"/>
  </svg>
</button>
</div>
</div>
```

### crd-002 · Card com imagem e sobreposição

Texto sobre a imagem com gradiente.

- Proporção 16:9
- Gradiente escuro na base para legibilidade
- Base sugerida: AspectRatio

```html
<div class="card" style="padding:0;overflow:hidden;position:relative;aspect-ratio:16/9;max-width:100%;background:linear-gradient(135deg,var(--accent),var(--primary))">
  <div style="position:absolute;inset:0;background:linear-gradient(transparent 40%,rgb(0 0 0/.7))">
  </div>
  <div style="position:absolute;left:16px;right:16px;bottom:14px;color:#fff">
    <span class="badge" style="background:rgb(255 255 255/.2);color:#fff">Novo</span>
    <b class="h-display h3" style="display:block;margin-top:6px">Unidade 302 · Toyohashi</b>
    <span class="sm">2LDK · 54 m² · ¥ 78.000/mês</span>
  </div>
</div>
```

### crd-003 · Card de atividade

Eventos recentes em linha do tempo.

- Ponto + linha guia; horário em mono
- Base sugerida: ScrollArea

```html
<div class="card">
  <div class="card-head" style="margin-bottom:8px">
    <b class="h-display h3">Atividade</b>
    <span class="badge p">3 novas</span>
  </div>
  <ul class="tl">
    <li>
      <b>Hanabi Imóveis</b> pagou #10482<small>09:12</small>
    </li>
    <li>
      <b>Sakura Logística</b> pediu alteração<small>08:47</small>
    </li>
    <li>
      <b>Kaizen Peças</b> abriu chamado<small>ontem</small>
    </li>
  </ul>
</div>
```

### crd-004 · Card de notificação

Aviso com ícone, ações e tempo.

- Botões de ação primária e secundária
- Base sugerida: —

```html
<div class="card row" style="align-items:flex-start;flex-wrap:nowrap;gap:12px">
  <span class="chip-ic">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4"/>
    </svg>
  </span>
  <div style="flex:1;min-width:0">
    <b>Vistoria agendada</b>
    <p class="muted sm" style="margin:2px 0 10px">Unidade 302, amanhã às 10:00.</p>
    <div class="row" style="gap:6px">
      <button class="btn btn-primary btn-sm">Confirmar</button>
      <button class="btn btn-ghost btn-sm">Remarcar</button>
    </div>
  </div>
  <span class="muted sm mono">5 min</span>
</div>
```

### crd-005 · Card de perfil

Avatar, cargo, status e ações.

- Avatar 64 px centralizado
- Base sugerida: Avatar

```html
<div class="card stack" style="align-items:center;text-align:center;gap:8px">
  <span class="avatar lg">RS</span>
  <b class="h-display h3">Rafael Sato</b>
  <span class="muted sm">Gerente de operações · Nagoya</span>
  <span class="badge ok">
    <span class="d">
    </span>Online</span>
    <div class="row">
      <button class="btn btn-primary btn-sm">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 5h18v14H3zM3 6l9 7 9-7"/>
        </svg>Mensagem</button>
        <button class="btn btn-outline btn-sm">Perfil</button>
      </div>
    </div>
```

### crd-006 · Card de equipe

Lista de membros com função e contato.

- Avatar, nome e função; ação à direita
- Base sugerida: —

```html
<div class="card">
  <div class="card-head" style="margin-bottom:6px">
    <b class="h-display h3">Equipe B</b>
    <span class="badge out">4 pessoas</span>
  </div>
  <ul class="statlist">
    <li>
      <span class="who">
        <span class="avatar xs">RS</span>Rafael Sato</span>
        <span class="muted sm">Líder</span>
      </li>
      <li>
        <span class="who">
          <span class="avatar xs">KT</span>Keiko T.</span>
          <span class="muted sm">Técnica</span>
        </li>
        <li>
          <span class="who">
            <span class="avatar xs">AL</span>Ana Lima</span>
            <span class="muted sm">Andaime</span>
          </li>
        </ul>
      </div>
```

### crd-007 · Card de plano

Preço, recursos e chamada.

- Borda primária no plano em destaque
- Base sugerida: —

```html
<div class="card stack" style="border-color:var(--primary);gap:10px">
  <span class="lbl">Plano Pro</span>
  <div class="row" style="align-items:baseline;gap:6px">
    <b class="h-display" style="font-size:calc(34px*var(--dscale))">¥ 2.980</b>
    <span class="muted">/ mês</span>
  </div>
  <div class="stack" style="gap:6px;font-size:14px">
    <span class="row" style="gap:8px">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12l5 5L20 7"/>
      </svg>Até 10 usuários</span>
      <span class="row" style="gap:8px">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12l5 5L20 7"/>
        </svg>Relatórios ilimitados</span>
      </div>
      <button class="btn btn-primary">Assinar plano</button>
    </div>
```

### crd-008 · Card de estatística com gráfico

Número e mini barras do mês.

- Valor + variação + barras de 12 períodos
- Base sugerida: —

```html
<div class="card stack" style="gap:8px">
  <div class="row" style="justify-content:space-between">
    <span class="lbl">Contratos fechados</span>
    <span class="delta up">+18%</span>
  </div>
  <div class="kpi-val num">412</div>
  <svg class="spark" style="height:44px" viewBox="0 0 120 34" preserveAspectRatio="none" data-sparkbars="4,6,5,7,6,8,7,9,8,10,9,12">
  </svg>
</div>
```

## Tabelas e listas

### tbl-001 · Tabela completa

Ordenação, seleção, status e paginação.

- Clique no cabeçalho ordena
- Selecionar todos com estado indeterminado
- Zebrado no detalhado
- Base sugerida: TanStack Table

```html
<div data-table="6">
</div>
```

### tbl-002 · Lista em cards

Versão em cartões, para celular.

- Substitui a tabela abaixo de 640 px
- Base sugerida: —

```html
<div class="tcards">
  <div class="tcard">
    <span class="avatar xs">HI</span>
    <div>
      <b class="sm">Hanabi Imóveis</b>
      <div class="muted sm mono">#10482 · 29/10</div>
    </div>
    <div style="text-align:right">
      <b class="num sm">¥ 128.400</b>
      <div>
        <span class="badge ok">Pago</span>
      </div>
    </div>
  </div>
  <div class="tcard">
    <span class="avatar xs alt">SL</span>
    <div>
      <b class="sm">Sakura Logística</b>
      <div class="muted sm mono">#10481 · 29/10</div>
    </div>
    <div style="text-align:right">
      <b class="num sm">¥ 46.200</b>
      <div>
        <span class="badge warn">Pendente</span>
      </div>
    </div>
  </div>
</div>
```

### tbl-003 · Lista com ações

Linhas com avatar, metadados e menu de ações.

- Ação aparece no hover (sempre visível no celular)
- Base sugerida: —

```html
<ul class="statlist">
  <li>
    <span class="who">
      <span class="avatar xs">TS</span>
      <span>
        <b class="sm">Tanaka & Silva</b>
        <br>
        <span class="muted sm">3 contratos · Hamamatsu</span>
      </span>
    </span>
    <button class="btn btn-ghost btn-icon btn-sm" aria-label="Ações">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
        <path d="M5 12h.01M12 12h.01M19 12h.01"/>
      </svg>
    </button>
  </li>
  <li>
    <span class="who">
      <span class="avatar xs">MT</span>
      <span>
        <b class="sm">Mirai Tech</b>
        <br>
        <span class="muted sm">1 contrato · Nagoya</span>
      </span>
    </span>
    <button class="btn btn-ghost btn-icon btn-sm" aria-label="Ações">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
        <path d="M5 12h.01M12 12h.01M19 12h.01"/>
      </svg>
    </button>
  </li>
  <li>
    <span class="who">
      <span class="avatar xs">HD</span>
      <span>
        <b class="sm">Hikari Design</b>
        <br>
        <span class="muted sm">Inativo · Okazaki</span>
      </span>
    </span>
    <button class="btn btn-ghost btn-icon btn-sm" aria-label="Ações">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
        <path d="M5 12h.01M12 12h.01M19 12h.01"/>
      </svg>
    </button>
  </li>
</ul>
```

## Animações

### anm-001 · Elevar

Card sobe e ganha sombra colorida.

- translateY(-6px) + sombra 70% da primária
- Base sugerida: — (CSS)

```html
<div class="card hv-demo hv-lift">
  <b>Passe o mouse</b>
  <span class="muted sm">O card sobe e ganha sombra.</span>
</div>
```

### anm-002 · Brilho na borda

Borda acende com halo.

- Halo de 34 px com 65% da primária
- Base sugerida: — (CSS)

```html
<div class="card hv-demo hv-glow">
  <b>Passe o mouse</b>
  <span class="muted sm">A borda acende.</span>
</div>
```

### anm-003 · Borda em gradiente girando

Borda cônica que gira.

- Giro em 2,4 s
- Base sugerida: — (CSS @property)

```html
<div class="card hv-demo hv-border">
  <b>Passe o mouse</b>
  <span class="muted sm">A borda gira.</span>
</div>
```

### anm-004 · Inclinação 3D

Card inclina seguindo o cursor.

- Até 8° em X/Y; perspectiva 700 px
- Base sugerida: Motion

```html
<div class="card hv-demo" data-tilt>
  <b>Mova o mouse sobre o card</b>
  <span class="muted sm">Ele inclina na direção do cursor.</span>
</div>
```

### anm-005 · Holofote

Luz suave segue o cursor.

- Gradiente radial de 260 px
- Base sugerida: — (CSS vars + JS)

```html
<div class="card hv-demo hv-spot" data-spot>
  <b>Mova o mouse</b>
  <span class="muted sm">A luz acompanha o cursor.</span>
</div>
```

### anm-006 · Zoom na imagem

Capa aproxima dentro do card.

- scale(1.12) em 500 ms
- Base sugerida: — (CSS)

```html
<div class="card hv-demo hv-scale">
  <div class="media-z">
  </div>
  <b>Portal do cliente</b>
  <span class="muted sm">A capa aproxima.</span>
</div>
```

### anm-007 · Sublinhado animado

Sublinhado cresce da esquerda.

- 0 → 100% em 2 px
- Base sugerida: — (CSS)

```html
<p class="hv-under" style="font-size:15px;margin:0">Veja o <a href="#" data-nolink>relatório completo</a> ou fale com o <a href="#" data-nolink>suporte</a>.</p>
```

### anm-008 · Subir com fade

Elementos sobem 14 px enquanto aparecem.

- opacity 0→1 + translateY(14px→0) em 600 ms
- Respeita prefers-reduced-motion
- Base sugerida: Motion (initial/animate)

```html
<div class="stack" style="gap:10px">
  <div class="an-stage fade" data-anstage>
    <i style="--k:0">
  </i>
  <i style="--k:1">
</i>
<i style="--k:2">
</i>
</div>
<button class="btn btn-outline btn-sm" data-replay style="align-self:flex-start">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4l13 8-13 8z"/>
  </svg>Repetir</button>
</div>
```

### anm-009 · Crescer

Elementos crescem de 60% até o tamanho.

- scale(.6→1) em 500 ms
- Respeita prefers-reduced-motion
- Base sugerida: Motion (initial/animate)

```html
<div class="stack" style="gap:10px">
  <div class="an-stage scale" data-anstage>
    <i style="--k:0">
  </i>
  <i style="--k:1">
</i>
<i style="--k:2">
</i>
</div>
<button class="btn btn-outline btn-sm" data-replay style="align-self:flex-start">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4l13 8-13 8z"/>
  </svg>Repetir</button>
</div>
```

### anm-010 · Deslizar da lateral

Entram vindo da esquerda.

- translateX(-40px→0) em 550 ms
- Respeita prefers-reduced-motion
- Base sugerida: Motion (initial/animate)

```html
<div class="stack" style="gap:10px">
  <div class="an-stage slide" data-anstage>
    <i style="--k:0">
  </i>
  <i style="--k:1">
</i>
<i style="--k:2">
</i>
</div>
<button class="btn btn-outline btn-sm" data-replay style="align-self:flex-start">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4l13 8-13 8z"/>
  </svg>Repetir</button>
</div>
```

### anm-011 · Cascata

Um depois do outro, com atraso.

- Atraso de 120 ms entre itens
- Respeita prefers-reduced-motion
- Base sugerida: Motion (initial/animate)

```html
<div class="stack" style="gap:10px">
  <div class="an-stage stagger" data-anstage>
    <i style="--k:0">
  </i>
  <i style="--k:1">
</i>
<i style="--k:2">
</i>
</div>
<button class="btn btn-outline btn-sm" data-replay style="align-self:flex-start">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4l13 8-13 8z"/>
  </svg>Repetir</button>
</div>
```

### anm-012 · Desfoque

Saem do desfoque até ficarem nítidos.

- blur(12px→0) em 700 ms
- Respeita prefers-reduced-motion
- Base sugerida: Motion (initial/animate)

```html
<div class="stack" style="gap:10px">
  <div class="an-stage blur" data-anstage>
    <i style="--k:0">
  </i>
  <i style="--k:1">
</i>
<i style="--k:2">
</i>
</div>
<button class="btn btn-outline btn-sm" data-replay style="align-self:flex-start">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4l13 8-13 8z"/>
  </svg>Repetir</button>
</div>
```

### anm-013 · Virar

Giram em X até ficarem de frente.

- rotateX(-80°→0) com perspectiva
- Respeita prefers-reduced-motion
- Base sugerida: Motion (initial/animate)

```html
<div class="stack" style="gap:10px">
  <div class="an-stage flip" data-anstage>
    <i style="--k:0">
  </i>
  <i style="--k:1">
</i>
<i style="--k:2">
</i>
</div>
<button class="btn btn-outline btn-sm" data-replay style="align-self:flex-start">
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4l13 8-13 8z"/>
  </svg>Repetir</button>
</div>
```

### anm-014 · Curtir

Coração que pulsa ao marcar.

- Escala 1,35 com mola
- Contador acompanha
- Base sugerida: Motion

```html
<button class="like" data-like>
  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>
  </svg>
  <span>24</span>
</button>
```

### anm-015 · Copiar com confirmação

Ícone vira check por 1,5 s.

- Copia para a área de transferência
- Base sugerida: —

```html
<div class="iw" style="max-width:320px">
  <input class="input pr mono" value="MK-10482-TYH" readonly aria-label="Código">
  <button class="btn btn-ghost btn-icon btn-sm" data-copyme style="position:absolute;right:5px;top:5px" aria-label="Copiar">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 9h11v11H9zM5 15H4V4h11v1"/>
    </svg>
  </button>
</div>
```

### anm-016 · Número que rola

Dígito entra rolando a cada mudança.

- Entrada de baixo em 350 ms
- Base sugerida: Motion (AnimatePresence)

```html
<div class="row" style="gap:16px">
  <span class="roll num" data-roll>
    <span>7</span>
  </span>
  <button class="btn btn-outline btn-sm" data-rollbtn>
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>Somar 1</button>
  </div>
```

### anm-017 · Check desenhado

O traço do check se desenha ao marcar.

- Traço em 350 ms
- Base sugerida: — (SVG stroke-dashoffset)

```html
<label class="drawck">
  <input type="checkbox">
  <svg viewBox="0 0 24 24">
    <path d="M5 12l5 5L20 7"/>
  </svg>Tarefa concluída</label>
```

### anm-018 · Ondulação ao clicar

Onda que sai do ponto do clique.

- Origem no ponto do clique
- 600 ms, opacidade 35%
- Base sugerida: — (JS + CSS)

```html
<div class="row">
  <button class="btn btn-primary" data-ripple>Clique aqui</button>
  <button class="btn btn-outline" data-ripple>Ou aqui</button>
</div>
```

### anm-019 · Botão magnético

O botão é atraído pelo cursor.

- Deslocamento até 30% da distância
- Volta com mola ao sair
- Base sugerida: Motion (useSpring)

```html
<div class="magzone" data-magnet>
  <button class="btn btn-primary btn-lg">Comece agora</button>
</div>
```

### anm-020 · Texto em gradiente animado

Gradiente que percorre o texto.

- Primária → destaque → primária em 6 s
- Base sugerida: CSS

```html
<span class="h-display h2 gradmove">Manutenção sem parar</span>
```

### anm-021 · Texto digitando

Palavras digitadas e apagadas em ciclo.

- Cursor piscando
- 60 ms por letra
- Base sugerida: typewriter-effect ou JS próprio

```html
<div class="h-display h3">Painel para <span class="typing" data-typing="obras|imobiliárias|oficinas|equipes de campo">
</span>
</div>
```

### anm-022 · Brilho passando

Faixa de luz cruza o botão ou card em loop.

- Faixa a 110°, a cada 2,8 s
- Base sugerida: CSS

```html
<div class="row">
  <button class="btn btn-primary shimmer">Plano Pro</button>
  <span class="badge solid shimmer">Novo</span>
</div>
```

### anm-023 · Confete

Explosão de confete para comemorar.

- Cores da paleta
- Dispara a partir do botão
- Base sugerida: canvas-confetti

```html
<div class="confzone">
  <canvas class="confcv">
  </canvas>
  <button class="btn btn-accent" data-confetti>
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>
    </svg>Concluir projeto</button>
  </div>
```

### anm-024 · Faixa rolante

Itens passando em loop infinito.

- Pausa no hover
- Duplicação para loop contínuo
- Base sugerida: CSS

```html
<div class="marquee">
  <div>
    <span class="badge out">Hanabi Imóveis</span>
    <span class="badge out">Sakura Logística</span>
    <span class="badge out">Kaizen Peças</span>
    <span class="badge out">Mirai Tech</span>
    <span class="badge out">Nagoya Foods</span>
    <span class="badge out">Fuji Construções</span>
    <span class="badge out">Hanabi Imóveis</span>
    <span class="badge out">Sakura Logística</span>
    <span class="badge out">Kaizen Peças</span>
    <span class="badge out">Mirai Tech</span>
    <span class="badge out">Nagoya Foods</span>
    <span class="badge out">Fuji Construções</span>
  </div>
</div>
```

### anm-025 · Forma orgânica (blob)

Forma que muda de contorno suavemente.

- Ciclo de 8 s
- Gradiente do tema
- Base sugerida: CSS border-radius

```html
<div style="display:grid;place-items:center;height:140px">
  <div class="blob-fx">
  </div>
</div>
```

### anm-026 · Pulso de destaque

Anel que pulsa para chamar atenção.

- Anel cresce e some em 1,8 s
- Base sugerida: CSS

```html
<div class="row" style="gap:24px">
  <span class="glowdot">
  </span>
  <button class="btn btn-primary glowbtn">Novo recurso</button>
</div>
```

### anm-027 · Card que vira

Frente e verso com rotação 3D.

- Clique vira 180° em 600 ms
- Base sugerida: CSS 3D

```html
<div class="flip" data-flip>
  <div class="flip-in">
    <div class="card flip-f">
      <span class="lbl">Frente</span>
      <b class="h-display h3">Unidade 302</b>
      <span class="muted sm">Clique para ver detalhes</span>
    </div>
    <div class="card flip-b">
      <span class="lbl">Verso</span>
      <b>2LDK · 54 m²</b>
      <span class="muted sm">¥ 78.000/mês · Toyohashi</span>
    </div>
  </div>
</div>
```

### anm-028 · Fundo aurora

Gradientes girando lentamente atrás do conteúdo.

- Rotação de 18 s
- Desfoque de 40 px
- Base sugerida: CSS conic-gradient

```html
<div class="aurora">
  <b class="h-display h3">Bem-vindo de volta</b>
</div>
```

### anm-029 · Camadas em paralaxe

Camadas se movem em velocidades diferentes com o cursor.

- 3 camadas com 4, 10 e 18 px de deslocamento
- Base sugerida: Motion (useTransform)

```html
<div class="parallax" data-parallax>
  <i style="--d:4">
</i>
<i style="--d:10">
</i>
<i style="--d:18">
</i>
<b>Mova o mouse</b>
</div>
```

### anm-030 · Troca de tela

Quatro estilos de transição entre telas.

- Fade, deslizar, escala e desfoque
- Duração var(--speed) × 2
- Base sugerida: Motion (AnimatePresence)

```html
<div data-trview>
  <div class="row" style="gap:6px">
    <button class="btn btn-sm btn-primary" data-trtype="fade">Fade</button>
    <button class="btn btn-sm btn-outline" data-trtype="slide">Deslizar</button>
    <button class="btn btn-sm btn-outline" data-trtype="scale">Escala</button>
    <button class="btn btn-sm btn-outline" data-trtype="blur">Desfoque</button>
  </div>
  <div class="trstage">
    <div class="trpane">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>
      </svg>
      <b>Relatório</b>
      <span class="muted sm">Tela A</span>
    </div>
  </div>
</div>
```

### anm-031 · Lista com entrada e saída

Itens entram e saem animando altura e opacidade.

- Entrada de cima, saída para a direita
- Base sugerida: Motion (layout)

```html
<div data-trlist>
  <div class="row">
    <button class="btn btn-primary btn-sm" data-tradd>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14"/>
      </svg>Adicionar tarefa</button>
    </div>
    <ul class="trl">
      <li>
        <span>Revisar orçamento</span>
        <button class="btn btn-ghost btn-icon btn-sm" data-trdel aria-label="Remover">
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18"/>
          </svg>
        </button>
      </li>
      <li>
        <span>Enviar contrato</span>
        <button class="btn btn-ghost btn-icon btn-sm" data-trdel aria-label="Remover">
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18"/>
          </svg>
        </button>
      </li>
    </ul>
  </div>
```

### anm-032 · Reordenar com animação

Itens deslizam até a nova posição (técnica FLIP).

- Cada item anima da posição antiga à nova
- Base sugerida: Motion (layout)

```html
<div data-shuffle>
  <button class="btn btn-outline btn-sm" data-shufbtn>
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2 5.5M20 4v7h-7"/>
    </svg>Embaralhar</button>
    <div class="shufgrid">
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <span>4</span>
      <span>5</span>
      <span>6</span>
    </div>
  </div>
```

### anm-033 · Expandir card

O card cresce até virar a tela de detalhe.

- Mesmo elemento muda de tamanho e posição
- Fecha voltando ao lugar
- Base sugerida: Motion (layoutId)

```html
<div class="xpbox" data-expand>
  <div class="card xpcard">
    <span class="chip-ic">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h6l2 2h10v11H3z"/>
      </svg>
    </span>
    <b>Portal do cliente</b>
    <span class="muted sm">Clique para abrir</span>
    <div class="xpmore">
      <p class="muted sm">Contratos, boletos e chamados. Entrega da fase 2 em 31/10.</p>
      <div class="track">
        <div class="fill" style="--v:72%">
        </div>
      </div>
    </div>
  </div>
</div>
```

### anm-034 · Acordeão com altura suave

Abre e fecha animando a altura real.

- grid-template-rows 0fr → 1fr
- Base sugerida: Radix Accordion + CSS grid-rows

```html
<div class="sacc" data-sacc>
  <div class="si open">
    <button>Como funciona o prazo?<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 9l6 6 6-6"/>
  </svg>
</button>
<div class="sb">
  <div>
    <p>O prazo conta a partir da confirmação do pagamento.</p>
  </div>
</div>
</div>
<div class="si">
  <button>Posso alterar o endereço?<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M6 9l6 6 6-6"/>
</svg>
</button>
<div class="sb">
  <div>
    <p>Sim, até o pedido sair para entrega.</p>
  </div>
</div>
</div>
</div>
```

### anm-035 · Abas com conteúdo deslizante

O conteúdo entra pelo lado da aba escolhida.

- Direção depende da posição da aba
- Base sugerida: Motion

```html
<div data-tabslide>
  <div class="tabs boxed" role="tablist">
    <button class="tab" role="tab" aria-selected="true">Resumo</button>
    <button class="tab" role="tab" aria-selected="false">Equipe</button>
    <button class="tab" role="tab" aria-selected="false">Custos</button>
  </div>
  <div class="tsl">
    <div class="tsp">Projeto em 72%. Próxima entrega em 31/10.</div>
  </div>
</div>
```

## Widgets

### wdg-001 · Central de notificações

Sino com lista suspensa, não lidas e “marcar todas”.

- Ponto azul nas não lidas
- Contador some ao marcar todas
- Base sugerida: Popover

```html
<div class="dd" data-notif>
</div>
```

### wdg-002 · Chat

Conversa com bolhas, “digitando…” e envio.

- Mensagens próprias à direita em primária
- Indicador de digitando com 3 pontos
- Base sugerida: —

```html
<div data-chat class="chat">
</div>
```

### wdg-003 · Comentários

Thread com respostas e curtidas.

- Respostas recuadas com linha guia
- Curtir com contador
- Base sugerida: —

```html
<div class="cmts">
  <div class="cm">
    <span class="avatar xs">KT</span>
    <div>
      <div class="row" style="gap:8px">
        <b class="sm">Keiko T.</b>
        <span class="muted sm">há 2 h</span>
      </div>
      <p class="sm" style="margin:2px 0 6px">Fotos do andaime anexadas. Precisa de mais um rodapé na torre B.</p>
      <div class="row" style="gap:12px">
        <button class="like sm" data-like style="font-size:12px">
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>
          </svg>
          <span>4</span>
        </button>
        <button class="btn btn-link sm" style="font-size:12px">Responder</button>
      </div>
    </div>
  </div>
  <div class="cm reply">
    <span class="avatar xs alt">RS</span>
    <div>
      <div class="row" style="gap:8px">
        <b class="sm">Rafael Sato</b>
        <span class="muted sm">há 1 h</span>
      </div>
      <p class="sm" style="margin:2px 0 6px">Separei o material, chega amanhã às 8h.</p>
      <div class="row" style="gap:12px">
        <button class="like sm" data-like style="font-size:12px">
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>
          </svg>
          <span>2</span>
        </button>
        <button class="btn btn-link sm" style="font-size:12px">Responder</button>
      </div>
    </div>
  </div>
  <div class="iw">
    <input class="input pr" placeholder="Escreva um comentário…" aria-label="Comentário">
    <button class="btn btn-primary btn-icon btn-sm" style="position:absolute;right:5px;top:5px" aria-label="Enviar">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>
      </svg>
    </button>
  </div>
</div>
```

### wdg-004 · Árvore de arquivos

Pastas que abrem e fecham.

- Seta gira ao abrir
- Ícone diferente por tipo
- Base sugerida: Radix Collapsible / react-arborist

```html
<ul class="ftree" data-ftree>
  <li class="fo open">
    <button>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9l6 6 6-6"/>
      </svg>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h6l2 2h10v11H3z"/>
      </svg>Projetos</button>
      <ul>
        <li class="fo open">
          <button>
            <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6"/>
            </svg>
            <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h6l2 2h10v11H3z"/>
            </svg>Portal do cliente</button>
            <ul>
              <li>
                <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 3H6v18h12V7zM14 3v4h4"/>
                </svg>contrato.pdf</li>
                <li>
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01"/>
                  </svg>fachada.jpg</li>
                </ul>
              </li>
              <li class="fo">
                <button>
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 6h6l2 2h10v11H3z"/>
                  </svg>Painel de manutenção</button>
                  <ul>
                    <li>
                      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 3H6v18h12V7zM14 3v4h4"/>
                      </svg>escopo.docx</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li class="fo">
                <button>
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 6h6l2 2h10v11H3z"/>
                  </svg>Modelos</button>
                  <ul>
                    <li>
                      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 3H6v18h12V7zM14 3v4h4"/>
                      </svg>orcamento.xlsx</li>
                    </ul>
                  </li>
                </ul>
```

### wdg-005 · Carrossel

Slides com setas, pontos e avanço automático.

- Avança a cada 4 s; pausa no hover
- Arrastar no celular
- Base sugerida: Embla Carousel

```html
<div class="carousel" data-carousel>
  <div class="ctrack">
    <div class="cslide" style="--h:0">
      <span class="lbl" style="color:inherit;opacity:.8">Destaque 1</span>
      <b class="h-display h2">Fase 2 entregue</b>
      <span>Portal do cliente no ar</span>
    </div>
    <div class="cslide" style="--h:40">
      <span class="lbl" style="color:inherit;opacity:.8">Destaque 2</span>
      <b class="h-display h2">Nova equipe</b>
      <span>Andaime · Toyota</span>
    </div>
    <div class="cslide" style="--h:80">
      <span class="lbl" style="color:inherit;opacity:.8">Destaque 3</span>
      <b class="h-display h2">Meta batida</b>
      <span>118 OS concluídas</span>
    </div>
  </div>
  <button class="cbtn prev" aria-label="Anterior">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  </button>
  <button class="cbtn next" aria-label="Próximo">
    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  </button>
  <div class="cdots">
  </div>
</div>
```

### wdg-006 · Galeria com ampliação

Miniaturas que abrem em tela cheia com navegação.

- Setas e Esc no visualizador
- Legenda e contador
- Base sugerida: yet-another-react-lightbox

```html
<div class="gallery">
  <button data-gal="0" style="--h:0" aria-label="Abrir Fachada">
    <span>Fachada</span>
  </button>
  <button data-gal="1" style="--h:55" aria-label="Abrir Sala">
    <span>Sala</span>
  </button>
  <button data-gal="2" style="--h:110" aria-label="Abrir Cozinha">
    <span>Cozinha</span>
  </button>
  <button data-gal="3" style="--h:165" aria-label="Abrir Quarto">
    <span>Quarto</span>
  </button>
  <button data-gal="4" style="--h:220" aria-label="Abrir Banheiro">
    <span>Banheiro</span>
  </button>
  <button data-gal="5" style="--h:275" aria-label="Abrir Varanda">
    <span>Varanda</span>
  </button>
</div>
```

### wdg-007 · Bloco de código

Código com numeração e botão copiar.

- Fonte mono do tema
- Copiar mostra confirmação
- Base sugerida: shiki / prism-react-renderer

```html
<div class="codebox">
  <div class="cb-h">
    <span class="mono sm">tokens.css</span>
    <button class="btn btn-ghost btn-sm" data-copycode-block>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 9h11v11H9zM5 15H4V4h11v1"/>
      </svg>Copiar</button>
    </div>
    <pre>
      <code>:root { --primary: #1f4fae; --radius: 8px; } .dark { --primary: #3b7bf0; }</code>
    </pre>
  </div>
```

### wdg-008 · Linha do tempo com status

Etapas com ícone, data e estado.

- Concluída, em andamento e pendente
- Linha preenchida até a etapa atual
- Base sugerida: —

```html
<ol class="vtl">
  <li class="done">
    <span class="dot">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12l5 5L20 7"/>
      </svg>
    </span>
    <div>
      <b>Contrato assinado</b>
      <span class="muted sm">12/10</span>
    </div>
  </li>
  <li class="done">
    <span class="dot">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12l5 5L20 7"/>
      </svg>
    </span>
    <div>
      <b>Projeto aprovado</b>
      <span class="muted sm">20/10</span>
    </div>
  </li>
  <li class="now">
    <span class="dot">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L10 2l2.7 2.7z"/>
      </svg>
    </span>
    <div>
      <b>Instalação</b>
      <span class="muted sm">29/10 · em andamento</span>
    </div>
  </li>
  <li class="todo">
    <span class="dot">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>
      </svg>
    </span>
    <div>
      <b>Entrega</b>
      <span class="muted sm">05/11</span>
    </div>
  </li>
</ol>
```

### wdg-009 · Contagem regressiva

Tempo restante até um prazo.

- Atualiza a cada segundo
- Dígitos tabulares
- Base sugerida: —

```html
<div class="countdown" data-countdown="2026-10-31T10:00:00">
  <div>
    <b>00</b>
    <span class="lbl">dias</span>
  </div>
  <div>
    <b>00</b>
    <span class="lbl">horas</span>
  </div>
  <div>
    <b>00</b>
    <span class="lbl">min</span>
  </div>
  <div>
    <b>00</b>
    <span class="lbl">seg</span>
  </div>
</div>
<p class="muted sm" style="margin:8px 0 0;text-align:center">até a entrega da fase 2</p>
```

### wdg-010 · Relógio mundial

Hora atual em várias cidades.

- Atualiza a cada segundo
- Diferença de fuso ao lado
- Base sugerida: Intl.DateTimeFormat

```html
<ul class="statlist" data-clocks>
  <li>
    <span>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
      </svg> Toyohashi</span>
      <b class="mono" data-tz="Asia/Tokyo">--:--</b>
    </li>
    <li>
      <span>
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
        </svg> São Paulo</span>
        <b class="mono" data-tz="America/Sao_Paulo">--:--</b>
      </li>
      <li>
        <span>
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
          </svg> Lisboa</span>
          <b class="mono" data-tz="Europe/Lisbon">--:--</b>
        </li>
      </ul>
```

### wdg-011 · Clima

Condição atual e próximos dias.

- Dados de exemplo
- Ícone por condição
- Base sugerida: API de clima (ex.: Open-Meteo)

```html
<div class="weather">
  <div class="row" style="justify-content:space-between">
    <div>
      <span class="lbl">Toyohashi · exemplo</span>
      <div class="hero-num num">18°</div>
      <span class="muted sm">Parcialmente nublado</span>
    </div>
    <span class="wicon">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/>
      </svg>
    </span>
  </div>
  <div class="wdays">
    <div>
      <span class="lbl">qui</span>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      </svg>
      <b>19°</b>
    </div>
    <div>
      <span class="lbl">sex</span>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/>
      </svg>
      <b>17°</b>
    </div>
    <div>
      <span class="lbl">sáb</span>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/>
      </svg>
      <b>15°</b>
    </div>
    <div>
      <span class="lbl">dom</span>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
      </svg>
      <b>20°</b>
    </div>
  </div>
</div>
```

### wdg-012 · Lista reordenável

Arraste pelos pontos para mudar a ordem.

- Alça de arrastar à esquerda
- Item fantasma durante o arraste
- Base sugerida: dnd-kit (Sortable)

```html
<ul class="sortl" data-sortable>
  <li draggable="true">
    <span class="grip">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
        <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/>
      </svg>
    </span>Vistoria — unidade 302</li>
    <li draggable="true">
      <span class="grip">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
          <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/>
        </svg>
      </span>Troca de vedação P-12</li>
      <li draggable="true">
        <span class="grip">
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
            <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/>
          </svg>
        </span>Limpeza do tanque T-03</li>
        <li draggable="true">
          <span class="grip">
            <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke-width:3.2">
              <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/>
            </svg>
          </span>Relatório semanal</li>
        </ul>
```

### wdg-013 · Preço mensal/anual

Alterna a cobrança e atualiza os valores.

- Selo de desconto no anual
- Valor anima ao trocar
- Base sugerida: —

```html
<div data-pricing class="stack" style="gap:12px;align-items:center">
  <div class="tabs boxed" role="tablist">
    <button class="tab" role="tab" aria-selected="true" data-per="m">Mensal</button>
    <button class="tab" role="tab" aria-selected="false" data-per="a">Anual <span class="badge ok" style="height:18px">−20%</span>
  </button>
</div>
<div class="row" style="align-items:baseline;gap:6px">
  <b class="h-display num" style="font-size:calc(36px*var(--dscale))" data-price>¥ 2.980</b>
  <span class="muted" data-perlbl>/ mês</span>
</div>
</div>
```

### wdg-014 · Checklist de primeiros passos

Tarefas de configuração com progresso.

- Barra soma ao marcar
- Item concluído riscado
- Base sugerida: —

```html
<div data-checklist class="stack" style="gap:10px">
  <div class="prog">
    <div class="prog-top">
      <b class="sm">Configuração da conta</b>
      <span class="num sm" data-ckp>2 de 5</span>
    </div>
    <div class="track">
      <div class="fill" style="--v:40%">
      </div>
    </div>
  </div>
  <label class="ck ckl">
    <input type="checkbox" class="chk" checked>
    <span>Criar conta</span>
  </label>
  <label class="ck ckl">
    <input type="checkbox" class="chk" checked>
    <span>Convidar equipe</span>
  </label>
  <label class="ck ckl">
    <input type="checkbox" class="chk" >
    <span>Cadastrar primeiro cliente</span>
  </label>
  <label class="ck ckl">
    <input type="checkbox" class="chk" >
    <span>Criar projeto</span>
  </label>
  <label class="ck ckl">
    <input type="checkbox" class="chk" >
    <span>Conectar o LINE</span>
  </label>
</div>
```

## Telas prontas

### tel-001 · Login

E-mail, senha, lembrar, entrar e acesso social.

- Validação ao enviar com tremor
- Link de recuperação de senha
- Base sugerida: —

```html
<div class="screen">
  <div class="auth">
    <span class="mark">MK</span>
    <b class="h-display h2">Entrar</b>
    <p class="muted sm">Use o e-mail da empresa.</p>
    <form class="stack" data-shake novalidate style="gap:10px;width:100%">
      <div class="field">
        <label>E-mail<span class="req">*</span>
      </label>
      <input class="input" type="email" placeholder="nome@empresa.jp">
      <span class="help err" hidden>Informe um e-mail válido.</span>
    </div>
    <div class="field">
      <label>Senha<span class="req">*</span>
    </label>
    <input class="input" type="password" placeholder="••••••••">
    <span class="help err" hidden>A senha precisa de 8 caracteres.</span>
  </div>
  <div class="row" style="justify-content:space-between">
    <label class="ck sm">
      <input type="checkbox" class="chk" checked>Lembrar</label>
      <button type="button" class="btn btn-link sm">Esqueci a senha</button>
    </div>
    <button class="btn btn-primary">Entrar</button>
  </form>
  <div class="or">
    <span>ou</span>
  </div>
  <div class="row" style="width:100%">
    <button class="btn btn-outline" style="flex:1">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
      </svg>Google</button>
      <button class="btn btn-outline" style="flex:1">
        <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v12H8l-4 4z"/>
        </svg>LINE</button>
      </div>
    </div>
  </div>
```

### tel-002 · Cadastro

Nome, e-mail, senha com força e aceite dos termos.

- Força da senha em 4 níveis
- Botão só habilita com os termos aceitos
- Base sugerida: —

```html
<div class="screen">
  <div class="auth">
    <b class="h-display h2">Criar conta</b>
    <div class="stack" style="gap:10px;width:100%">
      <div class="field">
        <label>Nome</label>
        <input class="input" placeholder="Seu nome">
      </div>
      <div class="field">
        <label>E-mail</label>
        <input class="input" placeholder="nome@empresa.jp">
      </div>
      <div class="field" data-strength>
        <label>Senha</label>
        <input class="input" type="password" placeholder="Crie uma senha">
        <div class="strength">
          <i>
        </i>
        <i>
      </i>
      <i>
    </i>
    <i>
  </i>
</div>
<span class="help">Use 8+ caracteres, maiúscula, número e símbolo.</span>
</div>
<label class="ck sm" data-terms>
  <input type="checkbox" class="chk">Aceito os termos de uso</label>
  <button class="btn btn-primary" disabled data-termsbtn>Criar conta</button>
</div>
</div>
</div>
```

### tel-003 · Recuperar senha

Pede o e-mail e mostra a confirmação de envio.

- Troca para estado de sucesso sem recarregar
- Base sugerida: —

```html
<div class="screen">
  <div class="auth" data-forgot>
    <span class="chip-ic" style="width:48px;height:48px">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 7a4 4 0 1 0-3.5 6L5 19.5V22h3v-2h2v-2h2l1.5-1.5A4 4 0 0 0 15 7z"/>
      </svg>
    </span>
    <b class="h-display h2">Esqueceu a senha?</b>
    <p class="muted sm">Enviamos um link para redefinir.</p>
    <div class="stack" style="gap:10px;width:100%">
      <input class="input" placeholder="nome@empresa.jp" aria-label="E-mail">
      <button class="btn btn-primary" data-forgotbtn>Enviar link</button>
    </div>
  </div>
</div>
```

### tel-004 · Verificação em duas etapas

Código de 6 dígitos com reenvio.

- Avanço automático entre caixas
- Reenviar com contagem de 30 s
- Base sugerida: input-otp

```html
<div class="screen">
  <div class="auth">
    <span class="chip-ic" style="width:48px;height:48px">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>
      </svg>
    </span>
    <b class="h-display h2">Confirme o acesso</b>
    <p class="muted sm">Código enviado para 090-****-5678.</p>
    <div class="otp" data-otp>
      <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
      <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
      <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
      <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
      <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
      <input class="input" inputmode="numeric" maxlength="1" aria-label="Dígito">
    </div>
    <button class="btn btn-link sm">Reenviar código</button>
  </div>
</div>
```

### tel-005 · Página não encontrada (404)

Mensagem clara e caminhos de volta.

- Número grande, frase curta, 2 ações
- Base sugerida: —

```html
<div class="screen">
  <div class="auth err-scr">
    <b class="hero-num h-grad" style="font-size:72px">404</b>
    <b class="h-display h3">Esta página não existe</b>
    <p class="muted sm">O link pode estar errado ou a página foi movida.</p>
    <div class="row">
      <button class="btn btn-primary" data-nav="home">Ir para o início</button>
      <button class="btn btn-outline">Falar com o suporte</button>
    </div>
  </div>
</div>
```

### tel-006 · Sem permissão (403)

Explica o bloqueio e como pedir acesso.

- Botão para solicitar acesso ao administrador
- Base sugerida: —

```html
<div class="screen">
  <div class="auth err-scr">
    <span class="chip-ic" style="width:56px;height:56px;color:var(--warning);background:color-mix(in oklch,var(--warning) 16%,transparent)">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>
      </svg>
    </span>
    <b class="h-display h3">Você não tem acesso a esta área</b>
    <p class="muted sm">Peça acesso ao administrador da conta.</p>
    <button class="btn btn-primary" data-toast="info">Solicitar acesso</button>
  </div>
</div>
```

### tel-007 · Em manutenção

Aviso de manutenção com previsão de retorno.

- Horário de retorno e status
- Base sugerida: —

```html
<div class="screen">
  <div class="auth err-scr">
    <span class="chip-ic" style="width:56px;height:56px">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L10 2l2.7 2.7z"/>
      </svg>
    </span>
    <b class="h-display h3">Voltamos às 23:00</b>
    <p class="muted sm">Estamos atualizando o sistema. Seus dados estão seguros.</p>
    <span class="st-chip live" style="--k:var(--warning)">
      <i>
    </i>Manutenção em andamento</span>
  </div>
</div>
```

### tel-008 · Sem conexão

Aviso quando a internet cai, com nova tentativa.

- Tenta de novo sozinho a cada 10 s
- Base sugerida: —

```html
<div class="screen">
  <div class="auth err-scr">
    <span class="chip-ic" style="width:56px;height:56px;color:var(--danger);background:color-mix(in oklch,var(--danger) 14%,transparent)">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/>
      </svg>
    </span>
    <b class="h-display h3">Sem conexão</b>
    <p class="muted sm">Verifique a internet. Vamos tentar de novo em instantes.</p>
    <button class="btn btn-outline" data-loadbtn>
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11a8 8 0 1 0-2 5.5M20 4v7h-7"/>
      </svg>Tentar agora</button>
    </div>
  </div>
```

### tel-009 · Boas-vindas em etapas

Três telas de apresentação com pontos e avançar.

- Pular a qualquer momento
- Último passo vira “Começar”
- Base sugerida: Embla Carousel

```html
<div class="screen">
  <div class="auth" data-onboard>
    <div class="ob-art">
    </div>
    <b class="h-display h2" data-obt>Tudo num só lugar</b>
    <p class="muted sm" data-obd>Projetos, clientes e equipe no mesmo painel.</p>
    <div class="cdots static">
      <i class="on">
    </i>
    <i>
  </i>
  <i>
</i>
</div>
<div class="row" style="width:100%;justify-content:space-between">
  <button class="btn btn-ghost" data-obskip>Pular</button>
  <button class="btn btn-primary" data-obnext>Próximo<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M9 18l6-6-6-6"/>
</svg>
</button>
</div>
</div>
</div>
```
