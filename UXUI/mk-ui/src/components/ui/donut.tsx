// grf-010 · Rosca — participação com total no centro e legenda com porcentagens.
import { motion, useReducedMotion } from 'motion/react';

// Series colors of the kit (especificação, grf-002): primary, accent, warning, success, muted.
const COLORS = [
  'var(--primary)',
  'var(--accent)',
  'var(--warning)',
  'var(--success)',
  'var(--muted)',
];
const SIZE = 180;
const STROKE = 22;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function Donut({
  data,
  totalLabel,
  unit,
}: {
  data: { name: string; value: number }[];
  totalLabel: string;
  unit: string;
}) {
  const reduce = useReducedMotion();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let offset = 0;
  const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          role="img"
          aria-label={totalLabel}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            style={{ stroke: 'var(--surface-2)' }}
            strokeWidth={STROKE}
          />
          {data.map((d, i) => {
            const length = (d.value / total) * C;
            const gap = 3;
            const segment = (
              <motion.circle
                key={d.name}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                style={{ stroke: COLORS[i % COLORS.length] }}
                strokeWidth={STROKE}
                strokeDashoffset={-offset}
                initial={reduce ? false : { strokeDasharray: `0 ${C}` }}
                animate={{ strokeDasharray: `${Math.max(length - gap, 0)} ${C}` }}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
              />
            );
            offset += length;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="num font-mono text-2xl font-semibold">
            {total.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-muted">{unit}</span>
        </div>
      </div>
      <ul className="m-0 grid w-full list-none gap-2 p-0">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate">{d.name}</span>
            <span className="num font-mono text-muted">{pct.format(d.value / total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
