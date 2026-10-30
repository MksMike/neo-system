// Tela inicial: Dashboard › Resumo (especificação, seção 1): 4 KPIs com sparkline (ind-002),
// gráfico de área 2/3 (grf-001) + rosca 1/3 (grf-010), tabela de registros (tbl-001).
// Entrada dos blocos em cascata (anm-011, modo animado).
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { CalendarPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { PageLayout } from '../components/shell/page-layout';
import { AreaChart } from '../components/ui/area-chart';
import { Card, CardTitle } from '../components/ui/card';
import { GenbaTable } from '../components/ui/data-table';
import { Donut } from '../components/ui/donut';
import { KpiCard } from '../components/ui/kpi';
import {
  CLIENT_SHARE,
  GENBA_TODAY,
  KPIS,
  UNITS_CURRENT,
  UNITS_PREVIOUS,
  WEEKS,
} from '../data/mock';

const block: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay: i * 0.07, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

function Reveal({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn('min-w-0', className)}
      variants={block}
      custom={index}
      initial={reduce ? false : 'hidden'}
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function DashboardPage() {
  const today = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeZone: 'Asia/Tokyo',
  }).format(new Date());

  return (
    <PageLayout
      actions={
        <button
          type="button"
          className="fx-glow inline-flex h-10 cursor-pointer items-center gap-2 rounded-control border-0 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <CalendarPlus aria-hidden className="size-5" strokeWidth={1.3} />
          Nova escalação
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="m-0 text-sm text-muted first-letter:uppercase">{today}</p>

        {/* KPIs: 4 em linha; 2×2 abaixo de 1000 px; 1 coluna no celular */}
        <section
          aria-label="Indicadores"
          className="grid gap-4 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-4"
        >
          {KPIS.map((kpi, i) => (
            <Reveal key={kpi.label} index={i}>
              <KpiCard kpi={kpi} index={i} />
            </Reveal>
          ))}
        </section>

        {/* Gráficos: área 2/3 + rosca 1/3; empilham abaixo de 1000 px */}
        <div className="grid gap-4 min-[1000px]:grid-cols-3">
          <Reveal index={4} className="min-[1000px]:col-span-2">
            <Card className="flex h-full flex-col gap-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle>人工 por semana</CardTitle>
                <span className="text-xs text-muted">Últimas 12 semanas</span>
              </div>
              <AreaChart
                labels={WEEKS}
                current={UNITS_CURRENT}
                previous={UNITS_PREVIOUS}
                currentLabel="2026"
                previousLabel="2025"
                unit="人工"
              />
            </Card>
          </Reveal>
          <Reveal index={5}>
            <Card className="flex h-full flex-col gap-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle>Por cliente</CardTitle>
                <span className="text-xs text-muted">Outubro</span>
              </div>
              <Donut
                data={CLIENT_SHARE}
                totalLabel="人工 de outubro por cliente"
                unit="人工 no mês"
              />
            </Card>
          </Reveal>
        </div>

        <Reveal index={6}>
          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <CardTitle>Genba de hoje</CardTitle>
              <span className="text-xs text-muted">{GENBA_TODAY.length} locais</span>
            </div>
            <GenbaTable rows={GENBA_TODAY} />
          </Card>
        </Reveal>
      </div>
    </PageLayout>
  );
}
