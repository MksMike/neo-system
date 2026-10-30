import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'primary' | 'muted';

const TONES: Record<BadgeTone, string> = {
  success: 'text-success border-success/40 bg-success/10',
  warning: 'text-warning border-warning/40 bg-warning/10',
  danger: 'text-danger border-danger/40 bg-danger/10',
  primary: 'text-primary border-primary/40 bg-primary/10',
  muted: 'text-muted border-border bg-surface-2',
};

/** Chip de status (ind-010): cor sempre acompanhada de texto. */
export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-control border px-2.5 text-xs font-semibold whitespace-nowrap',
        TONES[tone],
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
