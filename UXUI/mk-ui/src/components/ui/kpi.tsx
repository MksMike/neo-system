// ind-002 · KPI com sparkline — contagem animada e sparkline que se desenha (modo animado).
import { animate, motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Building, Clock, JapaneseYen, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Kpi } from '../../data/mock';
import { cn } from '../../lib/cn';
import { Card } from './card';

const ICONS = { users: Users, clock: Clock, yen: JapaneseYen, site: Building };
const yen = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});
const int = new Intl.NumberFormat('pt-BR');

function format(value: number, kind: Kpi['format']): string {
  return kind === 'yen' ? yen.format(Math.round(value)) : int.format(Math.round(value));
}

function sparkPath(values: number[], width: number, height: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 3 - ((v - min) / span) * (height - 6);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? kpi.value : 0);
  const Icon = ICONS[kpi.icon];
  // For counts, a fall is good news (fewer pending): the tone follows the meaning, not the sign.
  const good = kpi.icon === 'clock' ? kpi.delta < 0 : kpi.delta >= 0;

  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, kpi.value, {
      duration: 1.1,
      delay: 0.15 + index * 0.08,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: setShown,
    });
    return () => {
      controls.stop();
    };
  }, [kpi.value, index, reduce]);

  return (
    <Card scan className="flex flex-col gap-2 overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted">{kpi.label}</span>
        <span className="grid size-8 place-items-center rounded-field border border-card-border bg-surface-2 text-icon">
          <Icon aria-hidden className="size-4" strokeWidth={1.3} />
        </span>
      </div>
      <div
        className="num font-mono text-[28px] leading-9 font-semibold tracking-tight"
        aria-label={format(kpi.value, kpi.format)}
      >
        <span aria-hidden>{format(shown, kpi.format)}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 font-semibold',
            good ? 'text-success' : 'text-danger',
          )}
        >
          {kpi.delta >= 0 ? (
            <ArrowUpRight aria-hidden className="size-3.5" />
          ) : (
            <ArrowDownRight aria-hidden className="size-3.5" />
          )}
          {kpi.delta > 0 ? '+' : ''}
          {kpi.delta.toLocaleString('pt-BR')}%
        </span>
        <span className="text-muted">{kpi.deltaLabel}</span>
      </div>
      <svg
        viewBox="0 0 120 34"
        preserveAspectRatio="none"
        className="mt-1 h-9 w-full text-primary"
        aria-hidden
      >
        <motion.path
          d={sparkPath(kpi.spark, 120, 34)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.2 + index * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </svg>
    </Card>
  );
}
