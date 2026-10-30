# Projeto sem nome — especificação de front-end

Gerado no MK-UI Lab em 29 de outubro de 2026.
Stack alvo: React + Tailwind CSS + Radix UI (padrão shadcn/ui) + Motion para animações.

## Resumo das escolhas

| Item | Escolha |
|---|---|
| Dashboard | Clássico administrativo |
| Menu lateral | Árvore expansível |
| Menu no celular | Gaveta lateral pelo logo + barra de abas |
| Estilo | Futurista · Animado |
| Fontes | Bilíngue PT/JP (Noto Sans JP / Noto Sans JP) |
| Ícones | Padrão do estilo · cor: personalizada (escuro) / cor do texto (claro) |
| Modo escuro | Órbita |
| Modo claro | Órbita + ajustes de cor, cards e seções |
| Fundo | Textura do estilo |
| Elementos | Biblioteca completa (209 elementos com código, seção 7) |

## 1. Dashboard: Clássico administrativo

Menu lateral em árvore (itens e subitens), barra superior com busca, KPIs, gráficos e tabela.

**Indicado para:** ERP · pedidos · sistemas internos.

**Menu lateral: Árvore expansível.** Menu de 240 px que recolhe para 72 px; cada item abre seus subitens logo abaixo; recolhido mostra só os ícones com dica.

**Regras de navegação**

- Cada item do menu pode ter 0 ou mais subitens.
- Clicar num item abre a tela com o título do item; se houver subitens, abre o primeiro.
- Os subitens aparecem em abas horizontais logo abaixo do título (indicador deslizante; setas ← → navegam).
- A rota ativa fica marcada no menu (item + subitem) e no breadcrumb acima do título.
- Busca global no topo e Ctrl/⌘+K levam a qualquer tela.

**Mapa de navegação de exemplo**

- Visão geral
  - Resumo
  - Atividade
- Projetos
  - Projetos abertos
  - Criar novo projeto
  - Projetos finalizados
- Agenda
  - Mês
  - Semana
  - Dia
  - Lista
- Mensagens
  - Caixa de entrada
  - Notificações
- Arquivos (sem subitens)
- Equipe (sem subitens)
- Financeiro
  - Faturas
  - Planos e uso
- Configurações (sem subitens)

**Tela inicial (Visão geral › Resumo)**

- Linha de 4 KPIs com variação e sparkline
- Gráfico de área (2/3) + rosca de distribuição (1/3)
- Tabela de registros com filtros, ordenação, seleção e paginação

**Responsivo:** Abaixo de 1000 px os KPIs ficam 2×2 e os gráficos empilham; abaixo de 640 px o menu vira trilho de ícones.

**Menu no celular (abaixo de 760 px):** o menu lateral e a navegação do topo somem; o logo no canto superior esquerdo vira botão e abre uma gaveta lateral (320 px, desliza da esquerda) com busca, árvore de itens e subitens em sanfona e perfil no rodapé. Fecha com o X, com Esc, tocando fora ou ao escolher uma tela. Uma barra de abas fixa na base mostra Início, Projetos, Agenda, Mensagens e Menu (alvos de 44 px; respeitar a área segura do aparelho).

## 2. Estilo: Futurista · variante Animado

Painel de nave: linhas finas luminosas, cantos em colchete, fonte geométrica larga e varredura.

**Assinatura visual:** Colchetes nos cantos dos cards, brilho radial no topo, linhas luminosas; varredura e pulso dos colchetes no modo animado.

**Variante Animado:** Tudo do detalhado, mais entrada em cascata dos blocos, números que contam, gráficos que se desenham, brilho em botões e efeitos próprios do estilo.

**Fontes:** Bilíngue PT/JP — Cobre kanji, hiragana e katakana com o mesmo desenho. (substitui as fontes padrão do estilo).

| Propriedade | Valor |
|---|---|
| Fonte de títulos | Noto Sans JP (peso 400, caixa alta) |
| Fonte de texto | Noto Sans JP |
| Fonte de dados/mono | IBM Plex Mono |
| Raio de cards | 14px |
| Raio de botões/chips | 999px |
| Raio de campos | 10px |
| Espessura de borda | 1px |
| Sombra de card | `0 0 0 1px color-mix(in oklch,#1e6fd9 22%,transparent),0 0 46px -22px color-mix(in oklch,#1e6fd9 70%,transparent)` |
| Duração padrão | 280ms |
| Easing | `cubic-bezier(.2,.7,.2,1)` |

Google Fonts: `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap`

## 3. Ícones

- Biblioteca: lucide-react (nomes na seção Ícones › Biblioteca da ferramenta)
- Estilo: **Padrão do estilo** — definido pelo estilo Futurista Traço de 1.3 px.
- Cor no modo escuro: **Personalizada** (#c9c2ff)
- Cor no modo claro: **Cor do texto** (#11171a)
- Onde a cor se aplica: menus, cabeçalhos, chips de ícone em cards, listas e linhas do tempo. Ícones dentro de botões, alertas e badges usam a cor do componente.
- Tamanhos: 16 px em texto, 18–20 px em botões, 24 px em navegação, 32 px em destaques.

## 4. Cores

- Modo escuro: paleta **Órbita**
- Modo claro: paleta **Órbita** com ajustes
- Modo inicial: claro (respeitar a preferência do sistema na primeira visita)

| Token | Escuro | Claro | Uso |
|---|---|---|---|
| `--bg` | #000713 | #e8f8ff | Fundo da aplicação |
| `--surface` | #000f1b | #f1ffff | Cards, menus, modais |
| `--surface-2` | #001926 | #e1f1fb | Hover, faixas, campos secundários |
| `--border` | #234152 | #bfd1dc | Bordas e divisórias |
| `--border-strong` | #5a7d91 | #6b7d88 | Bordas de campos e controles |
| `--fg` | #e5f4fe | #11171a | Texto principal |
| `--muted` | #87b1cb | #526773 | Texto secundário e rótulos |
| `--primary` | #7cc7ff | #1e6fd9 | Ação principal, links, item ativo |
| `--primary-fg` | #0d0d12 | #ffffff | Texto sobre a primária |
| `--accent` | #b4f0ff | #2a86a8 | Segunda série de gráficos, destaques |
| `--accent-fg` | #0d0d12 | #0d0d12 | Texto sobre o destaque |
| `--success` | #3ccf8e | #12865a | Sucesso |
| `--warning` | #f2b33d | #a86400 | Aviso |
| `--danger` | #ff5d6c | #c8243a | Erro e ações destrutivas |

✎ = cor ajustada manualmente.

**Cards e seções**

| Camada | Escuro | Claro |
|---|---|---|
| Fundo do card | #000f1b a 100% | #f1ffff a 100% |
| Borda do card | #234152 a 100% | #bfd1dc a 100% |
| Fundo de seções (menu, barra superior, painéis) | #000f1b a 100% | #f1ffff a 0% |
| Borda de seções | #234152 a 100% | #bfd1dc a 100% |
| Ícones | #c9c2ff | #11171a |

**Contraste verificado** (mínimo 4,5:1 para texto, 3:1 para ícones e destaques)

| Combinação | Escuro | Claro |
|---|---|---|
| Texto principal sobre card | 17.3:1 | 17.6:1 |
| Texto secundário sobre card | 8.5:1 | 5.8:1 |
| Texto principal sobre seção | 17.3:1 | 16.6:1 |
| Ícone sobre card | 11.7:1 | 17.6:1 |
| Primária sobre card | 10.6:1 | 4.7:1 |
| Texto do botão primário | 10.6:1 | 4.8:1 |

## 5. Fundo

- Tipo: **Textura do estilo**
- Textura do estilo: Colchetes nos cantos dos cards, brilho radial no topo, linhas luminosas; varredura e pulso dos colchetes no modo animado.
- Sombra nas laterais: desligada

## 6. Tokens CSS

```css
/* Futurista · Animado · escuro: Órbita · claro: Órbita */
:root {
  --bg: #e8f8ff;
  --surface: #f1ffff;
  --surface-2: #e1f1fb;
  --border: #bfd1dc;
  --border-strong: #6b7d88;
  --fg: #11171a;
  --muted: #526773;
  --primary: #1e6fd9;
  --primary-fg: #ffffff;
  --accent: #2a86a8;
  --accent-fg: #0d0d12;
  --success: #12865a;
  --warning: #a86400;
  --danger: #c8243a;
  --font-display: 'Noto Sans JP', system-ui, sans-serif;
  --font-body: 'Noto Sans JP', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --radius: 14px;
  --radius-sm: 999px;
  --radius-in: 10px;
  --bw: 1px;
  --speed: 280ms;
  --ease: cubic-bezier(.2,.7,.2,1);
  --icon-stroke: 1.3px;
  --icon-color: #11171a;
  --card-bg: color-mix(in srgb, #f1ffff 100%, transparent);
  --card-border: color-mix(in srgb, #bfd1dc 100%, transparent);
  --section-bg: color-mix(in srgb, #f1ffff 0%, transparent);
  --section-border: color-mix(in srgb, #bfd1dc 100%, transparent);
}
.dark {
  --bg: #000713;
  --surface: #000f1b;
  --surface-2: #001926;
  --border: #234152;
  --border-strong: #5a7d91;
  --fg: #e5f4fe;
  --muted: #87b1cb;
  --primary: #7cc7ff;
  --primary-fg: #0d0d12;
  --accent: #b4f0ff;
  --accent-fg: #0d0d12;
  --success: #3ccf8e;
  --warning: #f2b33d;
  --danger: #ff5d6c;
  --icon-color: #c9c2ff;
  --card-bg: color-mix(in srgb, #000f1b 100%, transparent);
  --card-border: color-mix(in srgb, #234152 100%, transparent);
  --section-bg: color-mix(in srgb, #000f1b 100%, transparent);
  --section-border: color-mix(in srgb, #234152 100%, transparent);
}
```

## 7. Catálogo de elementos

Todos os elementos abaixo estão disponíveis no projeto. Para pedir um elemento numa tela, use o código (ex.: “use drp-004 como filtro de status na lista de pedidos”). Os códigos são únicos.

### Gráficos (grf)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `grf-001` | Linha com área | Linha e área | Dois períodos comparados, com dica ao passar o mouse. | Recharts AreaChart |
| `grf-002` | Linhas múltiplas | Linha e área | Três séries com rótulo no fim de cada linha. | Recharts LineChart |
| `grf-003` | Área empilhada | Linha e área | Composição do total ao longo do tempo. | Recharts AreaChart (stackId) |
| `grf-004` | Sparklines | Linha e área | Quatro formatos de mini gráfico: linha, área, barras e ganho/perda. | SVG próprio |
| `grf-005` | Barras verticais | Barras | Valores por categoria com o maior em destaque. | Recharts BarChart |
| `grf-006` | Barras horizontais (ranking) | Barras | Comparação ordenada com rótulos longos. | HTML + CSS |
| `grf-007` | Barras agrupadas | Barras | Duas séries lado a lado por mês. | Recharts BarChart (2 Bar) |
| `grf-008` | Barras empilhadas | Barras | Partes de um total por período. | Recharts BarChart (stackId) |
| `grf-009` | Pizza | Circulares | Partes de um todo com separação entre fatias. | Recharts PieChart |
| `grf-010` | Rosca | Circulares | Participação com total no centro. | Recharts PieChart (innerRadius) |
| `grf-011` | Meia-rosca | Circulares | Progresso de meta em semicírculo. | SVG próprio |
| `grf-012` | Anéis de progresso | Circulares | Três metas concêntricas. | SVG próprio |
| `grf-013` | Medidores | Circulares | Arco de 240° para capacidade com cor por faixa. | SVG próprio |
| `grf-014` | Radar | Avançados | Comparação de perfis em vários critérios. | Recharts RadarChart |
| `grf-015` | Dispersão com bolhas | Avançados | Relação entre duas medidas; tamanho = terceira. | Recharts ScatterChart |
| `grf-016` | Candlestick | Avançados | Velas OHLC com volume e linha do último preço. | lightweight-charts (TradingView) ou SVG |
| `grf-017` | Mapa de calor (calendário) | Avançados | Intensidade por dia ao longo de semanas. | SVG próprio |
| `grf-018` | Funil | Avançados | Etapas de conversão com taxa entre elas. | HTML + CSS |
| `grf-019` | Treemap | Avançados | Proporção de partes em retângulos. | Recharts Treemap |

<details><summary>Especificação detalhada</summary>

**grf-001 · Linha com área**
- Série atual com área em gradiente 32%→0
- Série anterior tracejada na cor de destaque
- Guia vertical e dica com os dois valores
- A linha se desenha no modo animado

**grf-002 · Linhas múltiplas**
- Até 5 séries nas cores primária, destaque, aviso, sucesso, erro
- Rótulo direto no último ponto (dispensa legenda)
- Pontos finais destacados

**grf-003 · Área empilhada**
- Camadas empilhadas com 70% de opacidade
- Ordem: maior na base
- Legenda acima

**grf-004 · Sparklines**
- 120×34 px, sem eixos
- Barras de ganho/perda em verde e vermelho
- Usados dentro de cards e tabelas

**grf-005 · Barras verticais**
- Maior barra em primária sólida com rótulo
- Demais em 38% da primária
- Crescem da base no modo animado

**grf-006 · Barras horizontais (ranking)**
- Ordenado do maior para o menor
- Rótulo à esquerda, valor à direita em mono
- Funciona bem no celular

**grf-007 · Barras agrupadas**
- Primária = atual, destaque = meta
- Espaço de 18% entre grupos

**grf-008 · Barras empilhadas**
- 3 segmentos com cantos só no topo
- Legenda acima

**grf-009 · Pizza**
- Fatias separadas por 2 px da cor da superfície
- Até 5 fatias; agrupar o resto em “Outros”

**grf-010 · Rosca**
- Espessura varia com o estilo (10–34 px)
- Total no centro e legenda com porcentagens

**grf-011 · Meia-rosca**
- Arco de 180° com valor no centro
- Rótulo de meta abaixo

**grf-012 · Anéis de progresso**
- Anéis de 12 px com trilho de fundo
- Cores: primária, destaque, sucesso

**grf-013 · Medidores**
- Faixas: ok, aviso, crítico
- Valor no centro

**grf-014 · Radar**
- 6 eixos, grade em 25/50/75/100%
- Duas séries sobrepostas com 25% de preenchimento

**grf-015 · Dispersão com bolhas**
- Duas categorias por cor
- Bolha proporcional ao volume

**grf-016 · Candlestick**
- Alta em verde, baixa em vermelho
- Volume em barras na base
- Linha tracejada e etiqueta do último preço
- Dados de exemplo

**grf-017 · Mapa de calor (calendário)**
- 5 níveis da cor primária
- Legenda “Menos → Mais”

**grf-018 · Funil**
- Largura proporcional ao volume
- Taxa de conversão entre etapas

**grf-019 · Treemap**
- Área proporcional ao valor
- Tons da primária e do destaque

</details>

### Indicadores (ind)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `ind-001` | KPI simples | KPIs | Rótulo, valor e variação. | — |
| `ind-002` | KPI com sparkline | KPIs | Valor com tendência dos últimos 10 períodos. | — |
| `ind-003` | KPI com meta | KPIs | Valor atual contra meta com barra. | Progress |
| `ind-004` | KPI comparativo | KPIs | Antes e depois lado a lado. | — |
| `ind-005` | KPI com anel | KPIs | Percentual em anel ao lado do número. | — |
| `ind-006` | Número de destaque | Destaque | Um número grande que é a mensagem da tela. | — |
| `ind-007` | Cotação ao vivo | Destaque | Preço que atualiza e pisca verde ou vermelho. | — |
| `ind-008` | Placar | Destaque | Três números lado a lado em blocos. | — |
| `ind-009` | Contador animado | Destaque | Número que conta até o valor ao aparecer. | Motion (animate) |
| `ind-010` | Chips de status | Status | Estado de serviços em pílulas com ponto pulsante. | — |
| `ind-011` | Saúde dos sistemas | Status | Lista de serviços com semáforo e latência. | — |
| `ind-012` | Barra de disponibilidade | Status | 30 dias de disponibilidade em barras. | — |
| `ind-013` | Lista de métricas | Listas e metas | Pares rótulo/valor com variação. | — |
| `ind-014` | Bullet chart | Listas e metas | Valor contra meta com faixas de qualidade. | SVG/HTML |
| `ind-015` | Ranking | Listas e metas | Top 5 com posição, avatar e valor. | — |

<details><summary>Especificação detalhada</summary>

**ind-001 · KPI simples**
- Valor em fonte de título com números tabulares
- Variação em chip verde/vermelho

**ind-002 · KPI com sparkline**
- Sparkline só no detalhado e animado
- Contagem animada no modo animado

**ind-003 · KPI com meta**
- Barra com marcação de % da meta
- Texto “faltam X”

**ind-004 · KPI comparativo**
- Período anterior em texto suave
- Seta indica direção da mudança

**ind-005 · KPI com anel**
- Anel de 76 px com 8 px de traço
- Bom para taxas e satisfação

**ind-006 · Número de destaque**
- 52 px em fonte de título
- Contexto em uma linha abaixo

**ind-007 · Cotação ao vivo**
- Fundo pisca 600 ms na cor da direção
- Variação absoluta e percentual
- Dados simulados

**ind-008 · Placar**
- Fundo surface-2 em cada bloco
- Bom para resumo de status

**ind-009 · Contador animado**
- Easing de saída cúbica em 1,1 s
- Clique para recontar

**ind-010 · Chips de status**
- Ponto pulsa quando “ao vivo”
- Cores semânticas

**ind-011 · Saúde dos sistemas**
- Ponto colorido por estado
- Métrica em mono à direita

**ind-012 · Barra de disponibilidade**
- Cada barra = 1 dia
- Aviso e falha destacados

**ind-013 · Lista de métricas**
- Divisória entre linhas
- Valores tabulares

**ind-014 · Bullet chart**
- Faixas ruim/ok/bom em tons do texto
- Traço vertical = meta

**ind-015 · Ranking**
- Primeiro lugar com número dourado
- Barra relativa opcional

</details>

### Tipografia (tip)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `tip-001` | Escala tipográfica | Escala | Tamanhos de H1 a legenda, com o par atual. | Tailwind fontSize |
| `tip-002` | Estilos de texto | Estilos de texto | Lead, citação, marcação, código, atalho e link. | Prose (Tailwind Typography) |
| `tip-003` | Títulos com efeito | Estilos de texto | Gradiente, contorno e sublinhado marcador. | CSS |
| `tip-004` | Números e moedas | Estilos de texto | Tabulares vs. proporcionais e formatos de valor. | Intl.NumberFormat |

<details><summary>Especificação detalhada</summary>

**tip-001 · Escala tipográfica**
- H1 clamp(24–36 px), H2 22, H3 17, corpo 15, pequeno 13, legenda 12
- Altura de linha 1,1 em títulos e 1,55 no corpo

**tip-002 · Estilos de texto**
- Lead 18 px
- Citação com borda primária de 3 px
- Marca-texto em 35% do aviso

**tip-003 · Títulos com efeito**
- Gradiente primária→destaque com background-clip
- Contorno com -webkit-text-stroke
- Use com moderação: 1 por tela

**tip-004 · Números e moedas**
- tabular-nums em tabelas e KPIs
- ¥ sem decimais; R$ com 2 casas; % com 1 casa

</details>

### Ícones (ico)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `ico-001` | Biblioteca de ícones | Biblioteca | Todos os ícones do sistema. Clique para copiar o nome. | lucide-react |
| `ico-002` | Tamanhos e cores | Tamanhos e cores | 16, 20, 24 e 32 px; cores semânticas. | — |
| `ico-003` | Menu ↔ fechar | Animados | Três linhas que viram um X ao abrir. | Motion / CSS |
| `ico-004` | Sino que balança | Animados | Sino balança ao passar o mouse ou ao chegar notificação. | CSS keyframes |
| `ico-005` | Coração pulsando | Animados | Batimento contínuo ou no hover. | CSS keyframes |
| `ico-006` | Check desenhado | Animados | O traço do check aparece ao confirmar. | SVG stroke-dashoffset |
| `ico-007` | Atualizar girando | Animados | Gira uma volta ao atualizar. | CSS |
| `ico-008` | Enviar com salto | Animados | Seta sobe e volta no hover. | CSS |
| `ico-009` | Lixeira que abre | Animados | A tampa levanta no hover. | CSS |
| `ico-010` | Avião de papel | Animados | Voa para fora e volta ao enviar. | CSS |
| `ico-011` | Busca pulsando | Animados | Lupa aumenta e procura. | CSS |
| `ico-012` | Sinal transmitindo | Animados | Ondas acendem em sequência. | CSS |
| `ico-013` | Play ↔ pausa | Animados | Troca com rotação e escala. | Motion |
| `ico-014` | Sol ↔ lua | Animados | Raios recolhem e o sol vira lua. | CSS |
| `ico-015` | Seta que avança | Animados | Empurra para a direita no hover. | CSS |
| `ico-016` | Carregando em órbita | Animados | Pontos orbitando um centro. | CSS |
| `ico-017` | Baixar com progresso | Animados | Seta desce e a base enche como barra. | CSS |
| `ico-018` | Lottie: Carregando (pontos) | Lottie | Três pontos pulsando em sequência. | lottie-react (ou @lottiefiles/dotlottie-react) |
| `ico-019` | Lottie: Sucesso | Lottie | Círculo e check desenhados com mola. | lottie-react (ou @lottiefiles/dotlottie-react) |
| `ico-020` | Lottie: Notificação | Lottie | Sino balançando com contador. | lottie-react (ou @lottiefiles/dotlottie-react) |
| `ico-021` | Lottie: Curtida com explosão | Lottie | Coração cresce e solta partículas. | lottie-react (ou @lottiefiles/dotlottie-react) |

<details><summary>Especificação detalhada</summary>

**ico-001 · Biblioteca de ícones**
- Grade 24×24, traço arredondado
- Nomes compatíveis com a lógica do Lucide

**ico-002 · Tamanhos e cores**
- 16 px em textos, 20 px em botões, 24 px em navegação, 32 px em destaques
- Cor herdada do texto (currentColor)

**ico-003 · Menu ↔ fechar**
- Clique alterna; transição de 250 ms

**ico-004 · Sino que balança**
- Rotação de ±14° em 600 ms

**ico-005 · Coração pulsando**
- Escala 1 → 1,2 → 1 em 1,2 s

**ico-006 · Check desenhado**
- Círculo e check desenham em sequência

**ico-007 · Atualizar girando**
- Uma volta em 700 ms ao clicar

**ico-008 · Enviar com salto**
- Seta separada da base

**ico-009 · Lixeira que abre**
- Tampa gira -20° no canto

**ico-010 · Avião de papel**
- Sai pela diagonal e reaparece em 900 ms

**ico-011 · Busca pulsando**
- Leve rotação e escala no hover

**ico-012 · Sinal transmitindo**
- Ondas com atraso de 200 ms
- Loop contínuo

**ico-013 · Play ↔ pausa**
- Os dois ícones se cruzam em 250 ms

**ico-014 · Sol ↔ lua**
- Rotação 90° e máscara

**ico-015 · Seta que avança**
- translateX 3 px em loop curto

**ico-016 · Carregando em órbita**
- Rotação contínua de 1 s

**ico-017 · Baixar com progresso**
- Barra de 0 a 100% em 1,6 s ao clicar

**ico-018 · Lottie: Carregando (pontos)**
- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles

**ico-019 · Lottie: Sucesso**
- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles

**ico-020 · Lottie: Notificação**
- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles

**ico-021 · Lottie: Curtida com explosão**
- Arquivo JSON vetorial; cores do tema aplicadas ao gerar
- Controles: reproduzir, pausar, repetir
- Para animações mais ricas, troque pelo JSON do LottieFiles

</details>

### Botões (btn)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `btn-001` | Hierarquia de botões | Hierarquia e estados | Primário, destaque, secundário, contorno, fantasma e perigo. | Slot (asChild) |
| `btn-002` | Estados e tamanhos | Hierarquia e estados | Carregando, desativado e três tamanhos. | — |
| `btn-003` | Somente ícone | Com ícone | Ações compactas com dica obrigatória. | Tooltip |
| `btn-004` | Ícone + texto e contador | Com ícone | Ícone à esquerda, à direita e com contador. | — |
| `btn-005` | Grupo segmentado | Especiais | Escolha exclusiva entre opções lado a lado. | ToggleGroup |
| `btn-006` | Botão dividido | Especiais | Ação principal + menu de alternativas. | DropdownMenu |
| `btn-007` | Botões de alternância | Especiais | Liga/desliga independentes (ex.: formatação). | Toggle |
| `btn-008` | Botão flutuante com atalhos | Especiais | Botão de ação flutuante que abre 3 atalhos. | — |
| `btn-009` | Botão como link | Especiais | Ação terciária dentro de texto. | — |
| `btn-010` | Matriz de estados de botões | Matriz de estados | Cada variação em normal, hover, foco, pressionado, desativado e carregando. | — |

<details><summary>Especificação detalhada</summary>

**btn-001 · Hierarquia de botões**
- Um primário por área de ação
- Hover escurece/clareia 14%; clique desce 1 px

**btn-002 · Estados e tamanhos**
- Carregando: spinner + verbo no gerúndio
- Desativado: 45% de opacidade
- sm 30 / md 38 / lg 48 px

**btn-003 · Somente ícone**
- Quadrado 38 px; aria-label obrigatório

**btn-004 · Ícone + texto e contador**
- Ícone de 18 px com 8 px de espaço
- Contador em pílula dentro do botão

**btn-005 · Grupo segmentado**
- Bordas compartilhadas; ativo em primária

**btn-006 · Botão dividido**
- Seta separada abre as variações da ação

**btn-007 · Botões de alternância**
- aria-pressed em cada botão
- Ativo tingido com a primária

**btn-008 · Botão flutuante com atalhos**
- 56 px; gira 45° ao abrir
- Atalhos entram em cascata de 40 ms

**btn-009 · Botão como link**
- Sublinhado com 3 px de afastamento
- Sem fundo nem borda

**btn-010 · Matriz de estados de botões**
- Use para revisar consistência entre estilos
- Foco sempre visível (anel de 2 px)

</details>

### Dropdowns e menus (drp)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `drp-001` | Select simples | Seleção | Lista de opções com teclado. | Select |
| `drp-002` | Select com ícones e descrição | Seleção | Opções ricas com ícone e texto de apoio. | Select (itens customizados) |
| `drp-003` | Select agrupado | Seleção | Opções separadas por grupos. | Select (Group + Label) |
| `drp-004` | Combobox com busca | Seleção | Digite para filtrar e escolha com Enter. | Combobox (cmdk / Ariakit) |
| `drp-005` | Multi-select com etiquetas | Seleção múltipla | Várias escolhas exibidas como etiquetas removíveis. | Combobox multiple |
| `drp-006` | Filtro com checkboxes | Seleção múltipla | Dropdown de filtro com contagem e aplicar. | Popover + Checkbox |
| `drp-007` | Menu de ações e do usuário | Menus de ação | Ações com ícones, atalhos e item destrutivo. | DropdownMenu |
| `drp-008` | Menu de contexto | Menus de ação | Abre com clique direito na posição do cursor. | ContextMenu |

<details><summary>Especificação detalhada</summary>

**drp-001 · Select simples**
- Abre com clique ou setas; Esc fecha
- Item escolhido em primária com check

**drp-002 · Select com ícones e descrição**
- Ícone em quadro de 26 px
- Descrição em texto suave

**drp-003 · Select agrupado**
- Cabeçalho de grupo em mono caixa alta

**drp-004 · Combobox com busca**
- Filtra enquanto digita
- Setas ↑ ↓ e Enter
- Mensagem quando nada é encontrado

**drp-005 · Multi-select com etiquetas**
- Etiqueta com × para remover
- Opções com check

**drp-006 · Filtro com checkboxes**
- Contador no botão
- Limpar e Aplicar no rodapé

**drp-007 · Menu de ações e do usuário**
- Setas navegam; Esc fecha
- Destrutivo em vermelho separado por linha

**drp-008 · Menu de contexto**
- Abre no ponto do clique
- Fecha ao clicar fora ou com Esc

</details>

### Formulários (frm)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `frm-001` | Campos de texto | Campos de texto | Texto, com ícone e área com contador. | Label |
| `frm-002` | Rótulo flutuante | Campos de texto | O rótulo sobe para dentro do campo ao focar. | — (CSS) |
| `frm-003` | Campo de etiquetas | Campos de texto | Digite e tecle Enter para criar etiquetas. | — |
| `frm-004` | Código de verificação | Campos de texto | 6 caixas com avanço automático. | input-otp |
| `frm-005` | Número com + e − | Campos de texto | Quantidade com botões e limites. | — |
| `frm-006` | Checkbox e rádio | Escolhas | Múltipla e única escolha. | Checkbox, RadioGroup |
| `frm-007` | Interruptor | Escolhas | Liga/desliga com descrição. | Switch |
| `frm-008` | Controle deslizante | Escolhas | Valor com faixa preenchida. | Slider |
| `frm-009` | Avaliação com estrelas | Escolhas | Nota de 1 a 5 com prévia ao passar o mouse. | RadioGroup |
| `frm-010` | Seletor de cor | Escolhas | Escolha entre cores predefinidas. | RadioGroup |
| `frm-011` | Data e hora | Datas | Calendário com mês e horário. | Popover + react-day-picker |
| `frm-012` | Intervalo de datas | Datas | Escolha início e fim no mesmo calendário. | react-day-picker (mode="range") |
| `frm-013` | Área de upload | Upload | Arraste arquivos ou clique; progresso por arquivo. | react-dropzone |
| `frm-014` | Tremor no erro | Validação | O campo inválido treme ao tentar enviar. | react-hook-form + Motion |
| `frm-015` | Campo obrigatório | Validação | Asterisco e aviso ao sair do campo vazio. | Form (Radix) |
| `frm-016` | Validação em tempo real | Validação | Ícone de certo ou erro enquanto digita. | react-hook-form (onChange) |
| `frm-017` | Força da senha | Validação | Barra de 4 níveis com o que falta. | — |
| `frm-018` | Resumo de erros | Validação | Lista os erros no topo com links para os campos. | — |
| `frm-020` | Switch com ícones | Toggles | Interruptor com ícone dentro do botão (sol/lua). | Switch (thumb customizado) |
| `frm-021` | Botão de tema animado | Toggles | Sol que gira e vira lua. | — |
| `frm-022` | Mostrar/ocultar senha | Toggles | Olho dentro do campo alterna a visibilidade. | — |
| `frm-023` | Ícones alternáveis | Toggles | Favoritar, salvar, silenciar e fixar. | Toggle |
| `frm-024` | Alternar visualização | Toggles | Lista, grade ou quadro. | ToggleGroup |
| `frm-025` | Switch grande ON/OFF | Toggles | Interruptor largo com rótulo dentro. | Switch |
| `frm-026` | Cartões selecionáveis | Toggles | Escolha por cartão com ícone e check. | RadioGroup / CheckboxGroup |
| `frm-027` | Favoritar com contador | Toggles | Estrela que preenche e soma. | — |
| `frm-019` | Estados do campo | Validação | Normal, foco, preenchido, erro, sucesso, desativado e somente leitura. | — |

<details><summary>Especificação detalhada</summary>

**frm-001 · Campos de texto**
- Altura 40 px; foco com anel de 3 px
- Contador de caracteres

**frm-002 · Rótulo flutuante**
- Altura 50 px; rótulo encolhe para 11,5 px

**frm-003 · Campo de etiquetas**
- Backspace remove a última
- Evita duplicadas

**frm-004 · Código de verificação**
- Avança ao digitar, volta no Backspace
- Aceita colar o código inteiro

**frm-005 · Número com + e −**
- Mínimo 0, máximo 99
- Setas do teclado também mudam

**frm-006 · Checkbox e rádio**
- 20 px; check animado
- Indeterminado no “selecionar todos”

**frm-007 · Interruptor**
- 44×24 px; ligado em primária

**frm-008 · Controle deslizante**
- Valor formatado ao lado do rótulo

**frm-009 · Avaliação com estrelas**
- Prévia no hover
- Texto da nota ao lado

**frm-010 · Seletor de cor**
- Círculos de 34 px; selecionado com anel

**frm-011 · Data e hora**
- Hoje com contorno; escolhido em primária
- Horário em passos de 15 min

**frm-012 · Intervalo de datas**
- Primeiro clique = início, segundo = fim
- Dias do intervalo tingidos

**frm-013 · Área de upload**
- Borda tracejada que acende ao arrastar
- Lista com barra de progresso
- Limite exibido (10 MB)

**frm-014 · Tremor no erro**
- Shake de 420 ms
- Borda vermelha + mensagem
- Foco no primeiro erro

**frm-015 · Campo obrigatório**
- aria-required
- Aviso some ao digitar

**frm-016 · Validação em tempo real**
- Valida após 3 caracteres
- Borda verde quando válido

**frm-017 · Força da senha**
- Critérios: 8+, maiúscula, número, símbolo

**frm-018 · Resumo de erros**
- Recebe foco ao aparecer
- Cada item leva ao campo

**frm-020 · Switch com ícones**
- Ícone do estado atual dentro do botão
- Fundo muda de cor ao ligar

**frm-021 · Botão de tema animado**
- Rotação 180° em 400 ms

**frm-022 · Mostrar/ocultar senha**
- aria-pressed no botão
- Ícone olho / olho riscado

**frm-023 · Ícones alternáveis**
- Preenche o ícone quando ativo
- Cor por função (aviso, primária, erro)

**frm-024 · Alternar visualização**
- Ícone + rótulo; o ativo fica em primária

**frm-025 · Switch grande ON/OFF**
- 72×32 px
- Texto ON/OFF dentro da trilha

**frm-026 · Cartões selecionáveis**
- Borda primária e selo de check no escolhido

**frm-027 · Favoritar com contador**
- Mola na escala ao marcar

**frm-019 · Estados do campo**
- Mesma altura em todos os estados
- Mensagem abaixo só em erro e sucesso

</details>

### Calendários (cal)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `cal-001` | Calendário mensal | Mensal | Grade do mês com eventos coloridos, “+N” e navegação. | react-big-calendar ou FullCalendar |
| `cal-002` | Calendário semanal | Semanal | Grade de horários de 7 dias com blocos de evento e linha da hora atual. | FullCalendar (timeGridWeek) |
| `cal-003` | Calendário diário | Diário | Linha do tempo do dia com painel lateral de compromissos. | FullCalendar (timeGridDay) |
| `cal-004` | Agenda em lista | Lista, mini e Gantt | Eventos agrupados por dia, com horário e cor. | — |
| `cal-005` | Mini calendário com marcações | Lista, mini e Gantt | Mês compacto com pontos nos dias com eventos. | react-day-picker (modifiers) |
| `cal-006` | Cronograma (Gantt) | Lista, mini e Gantt | Barras de projetos ao longo das semanas, com linha de hoje. | frappe-gantt ou SVG próprio |

<details><summary>Especificação detalhada</summary>

**cal-001 · Calendário mensal**
- Até 2 eventos por dia + contador “+N”
- Hoje destacado; dias de outro mês esmaecidos
- Clique no evento abre os detalhes; clique no dia abre a visão diária
- Alterna Mês / Semana / Dia / Lista

**cal-002 · Calendário semanal**
- Faixa de 07:00 a 20:00, 44 px por hora
- Evento posicionado pelo horário real
- Linha vermelha da hora atual no dia de hoje

**cal-003 · Calendário diário**
- Blocos com título, horário e cor por tipo
- Mini calendário e lista do dia ao lado

**cal-004 · Agenda em lista**
- Cabeçalho por dia com dia da semana
- Barra colorida pelo tipo do evento

**cal-005 · Mini calendário com marcações**
- Ponto embaixo do dia com evento
- Clique escolhe o dia e mostra os eventos

**cal-006 · Cronograma (Gantt)**
- Barra preenchida = progresso
- Linha vertical marca hoje
- Rótulo e responsável por linha

</details>

### Navegação (nav)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `nav-001` | Expansível com ícones | Menus laterais | Abre com rótulos e recolhe deixando os ícones. | Tooltip + Collapsible |
| `nav-002` | Árvore com subitens | Menus laterais | Itens com subitens que abrem logo abaixo (o menu deste dashboard). | Collapsible + NavigationMenu |
| `nav-003` | Trilho de ícones | Menus laterais | Barra estreita só com ícones. | Tooltip |
| `nav-004` | Flutuante | Menus laterais | Menu como cartão afastado das bordas. | — |
| `nav-005` | Gaveta sobreposta | Menus laterais | Menu escondido que desliza sobre o conteúdo. | Dialog / Sheet |
| `nav-006` | Duplo nível | Menus laterais | Trilho de ícones + painel de submenu. | Tabs (vertical) |
| `nav-007` | Abas sublinhadas | Abas | Indicador desliza até a aba ativa. | Tabs |
| `nav-008` | Abas em pílula | Abas | Aba ativa com fundo sólido. | Tabs |
| `nav-009` | Abas segmentadas | Abas | Controle em caixa, estilo iOS. | Tabs |
| `nav-010` | Abas verticais | Abas | Abas em coluna à esquerda do conteúdo. | Tabs (orientation="vertical") |
| `nav-011` | Breadcrumb | Breadcrumb e etapas | Caminho até a página atual. | Breadcrumb |
| `nav-012` | Etapas (stepper) | Breadcrumb e etapas | Progresso por etapas com voltar e avançar. | — |
| `nav-013` | Paginação | Breadcrumb e etapas | Navegação entre páginas. | — |
| `nav-014` | Acordeão | Breadcrumb e etapas | Seções que abrem e fecham. | Accordion |
| `nav-015` | Filtros em pílula | Breadcrumb e etapas | Botões de filtro alternáveis. | ToggleGroup |

<details><summary>Especificação detalhada</summary>

**nav-001 · Expansível com ícones**
- 240 px ↔ 72 px
- Dica no ícone quando recolhido
- Estado lembrado

**nav-002 · Árvore com subitens**
- Item ativo abre seus subitens
- Subitens com linha guia à esquerda
- Clicar de novo recolhe

**nav-003 · Trilho de ícones**
- 56–64 px; barra de 3 px no ativo

**nav-004 · Flutuante**
- Margem de 10 px, raio e sombra de card

**nav-005 · Gaveta sobreposta**
- Fundo escurecido fecha ao clicar
- Padrão para celular

**nav-006 · Duplo nível**
- Trocar de seção atualiza o painel

**nav-007 · Abas sublinhadas**
- Setas ← → trocam de aba
- Usadas nos subitens deste dashboard

**nav-008 · Abas em pílula**
- Ativa em primária

**nav-009 · Abas segmentadas**
- Ativa em superfície elevada

**nav-010 · Abas verticais**
- Barra de 2 px à direita da ativa
- Bom para páginas de ajustes

**nav-011 · Breadcrumb**
- Último com aria-current

**nav-012 · Etapas (stepper)**
- Etapa concluída preenchida, atual com halo
- Linha entre etapas pinta ao concluir

**nav-013 · Paginação**
- Página atual em primária
- Reticências com muitas páginas

**nav-014 · Acordeão**
- Chevron gira 180° ao abrir

**nav-015 · Filtros em pílula**
- Ativo em cor invertida

</details>

### Feedback (fbk)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `fbk-001` | Alerta inline | Alertas | Faixa de mensagem em 4 tipos. | — |
| `fbk-002` | Toast no canto | Alertas | Notificação temporária empilhável. | Toast (sonner) |
| `fbk-003` | Barra de aviso no topo | Alertas | Faixa de largura total, dispensável. | — |
| `fbk-004` | Snackbar com desfazer | Alertas | Mensagem na base com ação única. | Toast (com action) |
| `fbk-005` | Contador em ícone | Alertas | Número ou ponto pulsante sobre o ícone. | — |
| `fbk-006` | Modal central | Popups e painéis | Janela no centro com fundo desfocado. | Dialog |
| `fbk-007` | Confirmação destrutiva | Popups e painéis | Confirma antes de excluir. | AlertDialog |
| `fbk-008` | Painel lateral | Popups e painéis | Formulário que desliza da direita. | Sheet |
| `fbk-009` | Popover ancorado | Popups e painéis | Balão de detalhes preso ao botão. | Popover |
| `fbk-010` | Paleta de comandos | Popups e painéis | Ctrl+K: busca de telas e ações. | cmdk |
| `fbk-011` | Dica (tooltip) | Popups e painéis | Rótulo curto ao passar o mouse. | Tooltip |
| `fbk-012` | Indicadores de carregamento | Carregamento | Anel, pontos, barra e pulso. | — |
| `fbk-013` | Esqueleto (skeleton) | Carregamento | Formato do conteúdo enquanto carrega. | Skeleton |
| `fbk-014` | Barras de progresso | Carregamento | Linear, listrada e circular. | Progress |
| `fbk-015` | Estado vazio | Carregamento | Quando não há dados: explica e oferece a próxima ação. | — |

<details><summary>Especificação detalhada</summary>

**fbk-001 · Alerta inline**
- Fundo 10% da cor do tipo
- Pode ser dispensável

**fbk-002 · Toast no canto**
- Fecha em ~4 s; até 3 empilhadas

**fbk-003 · Barra de aviso no topo**
- Fundo primário com link de ação

**fbk-004 · Snackbar com desfazer**
- Fica ~5 s

**fbk-005 · Contador em ícone**
- Clique zera o contador

**fbk-006 · Modal central**
- Esc e clique fora fecham
- Foco preso no modal

**fbk-007 · Confirmação destrutiva**
- Verbo claro no botão vermelho
- Não fecha ao clicar fora

**fbk-008 · Painel lateral**
- Rodapé fixo com ações

**fbk-009 · Popover ancorado**
- Fecha ao clicar fora

**fbk-010 · Paleta de comandos**
- Navega para qualquer tela do dashboard
- Setas e Enter

**fbk-011 · Dica (tooltip)**
- Cores invertidas do tema

**fbk-012 · Indicadores de carregamento**
- Anel para botões e áreas pequenas
- Barra indeterminada para topo de página

**fbk-013 · Esqueleto (skeleton)**
- Brilho passando em 1,4 s

**fbk-014 · Barras de progresso**
- Listras animadas no modo animado

**fbk-015 · Estado vazio**
- Ícone em círculo de 56 px
- Título + uma frase + botão

</details>

### Cards (crd)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `crd-001` | Card de projeto | Conteúdo | Capa, status, equipe e ação. | — |
| `crd-002` | Card com imagem e sobreposição | Conteúdo | Texto sobre a imagem com gradiente. | AspectRatio |
| `crd-003` | Card de atividade | Conteúdo | Eventos recentes em linha do tempo. | ScrollArea |
| `crd-004` | Card de notificação | Conteúdo | Aviso com ícone, ações e tempo. | — |
| `crd-005` | Card de perfil | Pessoas | Avatar, cargo, status e ações. | Avatar |
| `crd-006` | Card de equipe | Pessoas | Lista de membros com função e contato. | — |
| `crd-007` | Card de plano | Comercial | Preço, recursos e chamada. | — |
| `crd-008` | Card de estatística com gráfico | Comercial | Número e mini barras do mês. | — |

<details><summary>Especificação detalhada</summary>

**crd-001 · Card de projeto**
- Capa de 90 px em gradiente do tema

**crd-002 · Card com imagem e sobreposição**
- Proporção 16:9
- Gradiente escuro na base para legibilidade

**crd-003 · Card de atividade**
- Ponto + linha guia; horário em mono

**crd-004 · Card de notificação**
- Botões de ação primária e secundária

**crd-005 · Card de perfil**
- Avatar 64 px centralizado

**crd-006 · Card de equipe**
- Avatar, nome e função; ação à direita

**crd-007 · Card de plano**
- Borda primária no plano em destaque

**crd-008 · Card de estatística com gráfico**
- Valor + variação + barras de 12 períodos

</details>

### Tabelas e listas (tbl)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `tbl-001` | Tabela completa | — | Ordenação, seleção, status e paginação. | TanStack Table |
| `tbl-002` | Lista em cards | — | Versão em cartões, para celular. | — |
| `tbl-003` | Lista com ações | — | Linhas com avatar, metadados e menu de ações. | — |

<details><summary>Especificação detalhada</summary>

**tbl-001 · Tabela completa**
- Clique no cabeçalho ordena
- Selecionar todos com estado indeterminado
- Zebrado no detalhado

**tbl-002 · Lista em cards**
- Substitui a tabela abaixo de 640 px

**tbl-003 · Lista com ações**
- Ação aparece no hover (sempre visível no celular)

</details>

### Animações (anm)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `anm-001` | Elevar | Hover | Card sobe e ganha sombra colorida. | — (CSS) |
| `anm-002` | Brilho na borda | Hover | Borda acende com halo. | — (CSS) |
| `anm-003` | Borda em gradiente girando | Hover | Borda cônica que gira. | — (CSS @property) |
| `anm-004` | Inclinação 3D | Hover | Card inclina seguindo o cursor. | Motion |
| `anm-005` | Holofote | Hover | Luz suave segue o cursor. | — (CSS vars + JS) |
| `anm-006` | Zoom na imagem | Hover | Capa aproxima dentro do card. | — (CSS) |
| `anm-007` | Sublinhado animado | Hover | Sublinhado cresce da esquerda. | — (CSS) |
| `anm-008` | Subir com fade | Entrada | Elementos sobem 14 px enquanto aparecem. | Motion (initial/animate) |
| `anm-009` | Crescer | Entrada | Elementos crescem de 60% até o tamanho. | Motion (initial/animate) |
| `anm-010` | Deslizar da lateral | Entrada | Entram vindo da esquerda. | Motion (initial/animate) |
| `anm-011` | Cascata | Entrada | Um depois do outro, com atraso. | Motion (initial/animate) |
| `anm-012` | Desfoque | Entrada | Saem do desfoque até ficarem nítidos. | Motion (initial/animate) |
| `anm-013` | Virar | Entrada | Giram em X até ficarem de frente. | Motion (initial/animate) |
| `anm-014` | Curtir | Micro-interações | Coração que pulsa ao marcar. | Motion |
| `anm-015` | Copiar com confirmação | Micro-interações | Ícone vira check por 1,5 s. | — |
| `anm-016` | Número que rola | Micro-interações | Dígito entra rolando a cada mudança. | Motion (AnimatePresence) |
| `anm-017` | Check desenhado | Micro-interações | O traço do check se desenha ao marcar. | — (SVG stroke-dashoffset) |
| `anm-018` | Ondulação ao clicar | Efeitos visuais | Onda que sai do ponto do clique. | — (JS + CSS) |
| `anm-019` | Botão magnético | Efeitos visuais | O botão é atraído pelo cursor. | Motion (useSpring) |
| `anm-020` | Texto em gradiente animado | Efeitos visuais | Gradiente que percorre o texto. | CSS |
| `anm-021` | Texto digitando | Efeitos visuais | Palavras digitadas e apagadas em ciclo. | typewriter-effect ou JS próprio |
| `anm-022` | Brilho passando | Efeitos visuais | Faixa de luz cruza o botão ou card em loop. | CSS |
| `anm-023` | Confete | Efeitos visuais | Explosão de confete para comemorar. | canvas-confetti |
| `anm-024` | Faixa rolante | Efeitos visuais | Itens passando em loop infinito. | CSS |
| `anm-025` | Forma orgânica (blob) | Efeitos visuais | Forma que muda de contorno suavemente. | CSS border-radius |
| `anm-026` | Pulso de destaque | Efeitos visuais | Anel que pulsa para chamar atenção. | CSS |
| `anm-027` | Card que vira | Efeitos visuais | Frente e verso com rotação 3D. | CSS 3D |
| `anm-028` | Fundo aurora | Efeitos visuais | Gradientes girando lentamente atrás do conteúdo. | CSS conic-gradient |
| `anm-029` | Camadas em paralaxe | Efeitos visuais | Camadas se movem em velocidades diferentes com o cursor. | Motion (useTransform) |
| `anm-030` | Troca de tela | Transições | Quatro estilos de transição entre telas. | Motion (AnimatePresence) |
| `anm-031` | Lista com entrada e saída | Transições | Itens entram e saem animando altura e opacidade. | Motion (layout) |
| `anm-032` | Reordenar com animação | Transições | Itens deslizam até a nova posição (técnica FLIP). | Motion (layout) |
| `anm-033` | Expandir card | Transições | O card cresce até virar a tela de detalhe. | Motion (layoutId) |
| `anm-034` | Acordeão com altura suave | Transições | Abre e fecha animando a altura real. | Radix Accordion + CSS grid-rows |
| `anm-035` | Abas com conteúdo deslizante | Transições | O conteúdo entra pelo lado da aba escolhida. | Motion |

<details><summary>Especificação detalhada</summary>

**anm-001 · Elevar**
- translateY(-6px) + sombra 70% da primária

**anm-002 · Brilho na borda**
- Halo de 34 px com 65% da primária

**anm-003 · Borda em gradiente girando**
- Giro em 2,4 s

**anm-004 · Inclinação 3D**
- Até 8° em X/Y; perspectiva 700 px

**anm-005 · Holofote**
- Gradiente radial de 260 px

**anm-006 · Zoom na imagem**
- scale(1.12) em 500 ms

**anm-007 · Sublinhado animado**
- 0 → 100% em 2 px

**anm-008 · Subir com fade**
- opacity 0→1 + translateY(14px→0) em 600 ms
- Respeita prefers-reduced-motion

**anm-009 · Crescer**
- scale(.6→1) em 500 ms
- Respeita prefers-reduced-motion

**anm-010 · Deslizar da lateral**
- translateX(-40px→0) em 550 ms
- Respeita prefers-reduced-motion

**anm-011 · Cascata**
- Atraso de 120 ms entre itens
- Respeita prefers-reduced-motion

**anm-012 · Desfoque**
- blur(12px→0) em 700 ms
- Respeita prefers-reduced-motion

**anm-013 · Virar**
- rotateX(-80°→0) com perspectiva
- Respeita prefers-reduced-motion

**anm-014 · Curtir**
- Escala 1,35 com mola
- Contador acompanha

**anm-015 · Copiar com confirmação**
- Copia para a área de transferência

**anm-016 · Número que rola**
- Entrada de baixo em 350 ms

**anm-017 · Check desenhado**
- Traço em 350 ms

**anm-018 · Ondulação ao clicar**
- Origem no ponto do clique
- 600 ms, opacidade 35%

**anm-019 · Botão magnético**
- Deslocamento até 30% da distância
- Volta com mola ao sair

**anm-020 · Texto em gradiente animado**
- Primária → destaque → primária em 6 s

**anm-021 · Texto digitando**
- Cursor piscando
- 60 ms por letra

**anm-022 · Brilho passando**
- Faixa a 110°, a cada 2,8 s

**anm-023 · Confete**
- Cores da paleta
- Dispara a partir do botão

**anm-024 · Faixa rolante**
- Pausa no hover
- Duplicação para loop contínuo

**anm-025 · Forma orgânica (blob)**
- Ciclo de 8 s
- Gradiente do tema

**anm-026 · Pulso de destaque**
- Anel cresce e some em 1,8 s

**anm-027 · Card que vira**
- Clique vira 180° em 600 ms

**anm-028 · Fundo aurora**
- Rotação de 18 s
- Desfoque de 40 px

**anm-029 · Camadas em paralaxe**
- 3 camadas com 4, 10 e 18 px de deslocamento

**anm-030 · Troca de tela**
- Fade, deslizar, escala e desfoque
- Duração var(--speed) × 2

**anm-031 · Lista com entrada e saída**
- Entrada de cima, saída para a direita

**anm-032 · Reordenar com animação**
- Cada item anima da posição antiga à nova

**anm-033 · Expandir card**
- Mesmo elemento muda de tamanho e posição
- Fecha voltando ao lugar

**anm-034 · Acordeão com altura suave**
- grid-template-rows 0fr → 1fr

**anm-035 · Abas com conteúdo deslizante**
- Direção depende da posição da aba

</details>

### Widgets (wdg)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `wdg-001` | Central de notificações | Comunicação | Sino com lista suspensa, não lidas e “marcar todas”. | Popover |
| `wdg-002` | Chat | Comunicação | Conversa com bolhas, “digitando…” e envio. | — |
| `wdg-003` | Comentários | Comunicação | Thread com respostas e curtidas. | — |
| `wdg-004` | Árvore de arquivos | Conteúdo | Pastas que abrem e fecham. | Radix Collapsible / react-arborist |
| `wdg-005` | Carrossel | Conteúdo | Slides com setas, pontos e avanço automático. | Embla Carousel |
| `wdg-006` | Galeria com ampliação | Conteúdo | Miniaturas que abrem em tela cheia com navegação. | yet-another-react-lightbox |
| `wdg-007` | Bloco de código | Conteúdo | Código com numeração e botão copiar. | shiki / prism-react-renderer |
| `wdg-008` | Linha do tempo com status | Conteúdo | Etapas com ícone, data e estado. | — |
| `wdg-009` | Contagem regressiva | Utilidades | Tempo restante até um prazo. | — |
| `wdg-010` | Relógio mundial | Utilidades | Hora atual em várias cidades. | Intl.DateTimeFormat |
| `wdg-011` | Clima | Utilidades | Condição atual e próximos dias. | API de clima (ex.: Open-Meteo) |
| `wdg-012` | Lista reordenável | Utilidades | Arraste pelos pontos para mudar a ordem. | dnd-kit (Sortable) |
| `wdg-013` | Preço mensal/anual | Utilidades | Alterna a cobrança e atualiza os valores. | — |
| `wdg-014` | Checklist de primeiros passos | Utilidades | Tarefas de configuração com progresso. | — |

<details><summary>Especificação detalhada</summary>

**wdg-001 · Central de notificações**
- Ponto azul nas não lidas
- Contador some ao marcar todas

**wdg-002 · Chat**
- Mensagens próprias à direita em primária
- Indicador de digitando com 3 pontos

**wdg-003 · Comentários**
- Respostas recuadas com linha guia
- Curtir com contador

**wdg-004 · Árvore de arquivos**
- Seta gira ao abrir
- Ícone diferente por tipo

**wdg-005 · Carrossel**
- Avança a cada 4 s; pausa no hover
- Arrastar no celular

**wdg-006 · Galeria com ampliação**
- Setas e Esc no visualizador
- Legenda e contador

**wdg-007 · Bloco de código**
- Fonte mono do tema
- Copiar mostra confirmação

**wdg-008 · Linha do tempo com status**
- Concluída, em andamento e pendente
- Linha preenchida até a etapa atual

**wdg-009 · Contagem regressiva**
- Atualiza a cada segundo
- Dígitos tabulares

**wdg-010 · Relógio mundial**
- Atualiza a cada segundo
- Diferença de fuso ao lado

**wdg-011 · Clima**
- Dados de exemplo
- Ícone por condição

**wdg-012 · Lista reordenável**
- Alça de arrastar à esquerda
- Item fantasma durante o arraste

**wdg-013 · Preço mensal/anual**
- Selo de desconto no anual
- Valor anima ao trocar

**wdg-014 · Checklist de primeiros passos**
- Barra soma ao marcar
- Item concluído riscado

</details>

### Telas prontas (tel)

| Código | Elemento | Grupo | Descrição | Base sugerida |
|---|---|---|---|---|
| `tel-001` | Login | Acesso | E-mail, senha, lembrar, entrar e acesso social. | — |
| `tel-002` | Cadastro | Acesso | Nome, e-mail, senha com força e aceite dos termos. | — |
| `tel-003` | Recuperar senha | Acesso | Pede o e-mail e mostra a confirmação de envio. | — |
| `tel-004` | Verificação em duas etapas | Acesso | Código de 6 dígitos com reenvio. | input-otp |
| `tel-005` | Página não encontrada (404) | Erros e sistema | Mensagem clara e caminhos de volta. | — |
| `tel-006` | Sem permissão (403) | Erros e sistema | Explica o bloqueio e como pedir acesso. | — |
| `tel-007` | Em manutenção | Erros e sistema | Aviso de manutenção com previsão de retorno. | — |
| `tel-008` | Sem conexão | Erros e sistema | Aviso quando a internet cai, com nova tentativa. | — |
| `tel-009` | Boas-vindas em etapas | Boas-vindas | Três telas de apresentação com pontos e avançar. | Embla Carousel |

<details><summary>Especificação detalhada</summary>

**tel-001 · Login**
- Validação ao enviar com tremor
- Link de recuperação de senha

**tel-002 · Cadastro**
- Força da senha em 4 níveis
- Botão só habilita com os termos aceitos

**tel-003 · Recuperar senha**
- Troca para estado de sucesso sem recarregar

**tel-004 · Verificação em duas etapas**
- Avanço automático entre caixas
- Reenviar com contagem de 30 s

**tel-005 · Página não encontrada (404)**
- Número grande, frase curta, 2 ações

**tel-006 · Sem permissão (403)**
- Botão para solicitar acesso ao administrador

**tel-007 · Em manutenção**
- Horário de retorno e status

**tel-008 · Sem conexão**
- Tenta de novo sozinho a cada 10 s

**tel-009 · Boas-vindas em etapas**
- Pular a qualquer momento
- Último passo vira “Começar”

</details>

## 8. Notas para implementação

- Tokens em `globals.css` mapeados no Tailwind via `@theme` (ex.: `--color-primary: var(--primary)`).
- Tema claro/escuro pela classe `.dark` no `<html>`; todos os textos, ícones e destaques usam tokens, nunca cores fixas, para trocarem juntos com o modo.
- Navegação com rotas aninhadas (ex.: `/projetos/abertos`); o layout do item renderiza título e abas dos subitens; o menu lê a rota ativa.
- Interativos sobre Radix (Dialog, DropdownMenu, Select, Popover, Tabs, Tooltip, Switch, Checkbox), estilizados só com os tokens.
- Animações com Motion usando `var(--speed)` e `var(--ease)`; desligar com `prefers-reduced-motion`.
- Gráficos com Recharts (candlestick com lightweight-charts) lendo as cores dos tokens.
- Números com `font-variant-numeric: tabular-nums`.
