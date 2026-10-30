// grf-001 · Linha com área — dois períodos comparados, dica ao passar o mouse, linha que se desenha.
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 40 };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { ref, width };
}

/** Smooth path through the points (cardinal spline converted to cubic Bézier). */
function smooth(points: [number, number][]): string {
  if (points.length === 0) return '';
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function AreaChart({
  labels,
  current,
  previous,
  currentLabel,
  previousLabel,
  unit,
}: {
  labels: string[];
  current: number[];
  previous: number[];
  currentLabel: string;
  previousLabel: string;
  unit: string;
}) {
  const reduce = useReducedMotion();
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const all = [...current, ...previous];
  const max = Math.ceil(Math.max(...all) / 50) * 50;
  const min = Math.floor((Math.min(...all) * 0.85) / 50) * 50;
  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (labels.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - ((v - min) / (max - min)) * innerH;
  const currentPts = current.map((v, i): [number, number] => [x(i), y(v)]);
  const previousPts = previous.map((v, i): [number, number] => [x(i), y(v)]);
  const line = smooth(currentPts);
  const area = `${line} L${x(labels.length - 1)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(min + f * (max - min)));

  function onMove(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setHover(Math.min(labels.length - 1, Math.max(0, Math.round(ratio * (labels.length - 1)))));
  }

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 rounded-full bg-primary" />
          {currentLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-0 w-5 border-t-2 border-dashed border-accent" />
          {previousLabel}
        </span>
      </div>
      {width > 0 ? (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${currentLabel} × ${previousLabel}`}
          className="block overflow-visible"
        >
          <defs>
            <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.32 }} />
              <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                style={{ stroke: 'var(--border)' }}
                strokeDasharray="2 4"
              />
              <text
                x={PAD.left - 8}
                y={y(tick)}
                dy="0.35em"
                textAnchor="end"
                className="num fill-muted font-mono text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}
          {labels.map((label, i) => (
            <text
              key={label}
              x={x(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted font-mono text-[10px]"
            >
              {label}
            </text>
          ))}
          <motion.path
            d={area}
            fill="url(#area-fill)"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          <path
            d={smooth(previousPts)}
            fill="none"
            style={{ stroke: 'var(--accent)' }}
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          <motion.path
            d={line}
            fill="none"
            style={{ stroke: 'var(--primary)' }}
            strokeWidth={2.2}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
          />
          {hover !== null ? (
            <g>
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={PAD.top + innerH}
                style={{ stroke: 'var(--border-strong)' }}
              />
              <circle
                cx={x(hover)}
                cy={y(previous[hover]!)}
                r={3.5}
                style={{ fill: 'var(--surface)', stroke: 'var(--accent)' }}
                strokeWidth={2}
              />
              <circle
                cx={x(hover)}
                cy={y(current[hover]!)}
                r={4.5}
                style={{ fill: 'var(--surface)', stroke: 'var(--primary)' }}
                strokeWidth={2.5}
              />
            </g>
          ) : null}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => {
              setHover(null);
            }}
          />
        </svg>
      ) : (
        <div style={{ height: HEIGHT }} />
      )}
      {hover !== null && width > 0 ? (
        <div
          role="status"
          className="pointer-events-none absolute z-10 rounded-field border border-card-border bg-surface px-3 py-2 text-xs shadow-[var(--shadow-card)]"
          style={{
            left: Math.min(Math.max(x(hover) - 70, 0), width - 150),
            top: 34,
            width: 150,
          }}
        >
          <div className="mb-1 font-mono text-muted">{labels[hover]}</div>
          <div className="flex justify-between gap-2">
            <span className="text-muted">{currentLabel}</span>
            <b className="num font-mono">
              {current[hover]} {unit}
            </b>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted">{previousLabel}</span>
            <b className="num font-mono">
              {previous[hover]} {unit}
            </b>
          </div>
        </div>
      ) : null}
    </div>
  );
}
