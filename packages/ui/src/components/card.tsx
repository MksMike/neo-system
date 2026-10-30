import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

export const cardVariants = cva(
  'mk-card flex min-w-0 flex-col gap-3 rounded-[14px] p-5 transition-[box-shadow,border-color,transform] duration-(--dur-base) ease-standard',
  {
    variants: {
      variant: {
        default: 'border border-line bg-surface-1 shadow-sm',
        interactive:
          'cursor-pointer border border-line bg-surface-1 shadow-sm hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md',
        feature:
          'border-0 bg-grad-brand text-on-grad shadow-[0_0_0_6px_var(--glow),var(--nx-shadow-md)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Card({
  className,
  variant,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('m-0 min-w-0 flex-1 type-h3', className)} {...props} />;
}

export function CardInset({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-md bg-surface-2 p-3', className)} {...props} />;
}

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  delta?: ReactNode;
  /** Color of the delta: success (good), danger (bad) or neutral. */
  tone?: 'success' | 'danger' | 'neutral';
  className?: string;
}

/** Number card content: label, big monospaced value, optional delta. */
export function Stat({ label, value, icon, delta, tone = 'neutral', className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2 font-medium text-ink-muted">
        {icon ? (
          <span className="grid size-8 place-items-center rounded-[10px] bg-primary-soft text-primary-text [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        {label}
      </div>
      <div className="type-num-lg tracking-[-0.01em]">{value}</div>
      {delta ? (
        <div
          className={cn(
            'text-xs font-semibold',
            tone === 'success' && 'text-success',
            tone === 'danger' && 'text-danger',
            tone === 'neutral' && 'text-ink-subtle',
          )}
        >
          {delta}
        </div>
      ) : null}
    </div>
  );
}
