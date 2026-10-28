import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '../lib/cn';

export const badgeVariants = cva(
  'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold leading-none',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-3 text-ink-muted',
        primary: 'bg-primary-soft text-primary-text',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        info: 'bg-info-soft text-info',
        outline: 'border border-line-strong bg-transparent text-ink-muted',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** Colored dot before the text. Status colors always come with text (accessibility). */
    dot?: boolean;
  };

export function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? <span aria-hidden className="size-[7px] rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export type ChipProps = Omit<ComponentProps<'button'>, 'onChange'> & {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
};

/** Toggle chip for filters. */
export function Chip({ pressed, onPressedChange, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => {
        onPressedChange(!pressed);
      }}
      className={cn(
        'inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface-1 px-3 text-[13px] font-medium leading-none text-ink',
        'transition-[background-color,border-color,color] duration-(--dur-fast) hover:border-line-strong hover:bg-surface-3',
        'aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary-text',
        className,
      )}
      {...props}
    />
  );
}

export type DayKind =
  'teiji' | 'hannichi' | 'yasumi' | 'kekkin' | 'chushi' | 'kyugyo' | 'yukyu' | 'pending' | 'empty';

export type DayCellProps = Omit<ComponentProps<'button'>, 'children'> & {
  kind: DayKind;
  /** Short mark shown in the cell (e.g. 定, 半, 休). */
  mark: ReactNode;
  /** Accessible description (e.g. "1/11 定時, 残業 2h"). Color is never the only signal. */
  label: string;
  /** Overtime marker (残業), e.g. "2". */
  overtime?: ReactNode;
  /** Subcontractor color shown as a bar at the bottom. */
  subColor?: string;
  size?: 'md' | 'sm';
};

/** Day cell of the 勤怠表 grid, with the status colors of the design system. */
export function DayCell({
  kind,
  mark,
  label,
  overtime,
  subColor,
  size = 'md',
  className,
  style,
  ...props
}: DayCellProps) {
  const color = kind === 'empty' ? 'var(--ink-subtle)' : `var(--day-${kind})`;
  return (
    <button
      type="button"
      aria-label={label}
      style={{ '--c': color, '--sub': subColor ?? 'transparent', ...style } as CSSProperties}
      className={cn(
        'relative inline-grid cursor-pointer place-items-center rounded-xs border font-semibold leading-none text-(--c)',
        'bg-[color-mix(in_srgb,var(--c)_14%,var(--surface-1))] border-[color-mix(in_srgb,var(--c)_40%,transparent)]',
        'transition-[transform,box-shadow] duration-(--dur-fast) hover:-translate-y-px hover:shadow-md',
        size === 'md' ? 'size-9 text-[13px]' : 'size-[30px] text-xs',
        kind === 'pending' && 'border-dashed',
        kind === 'empty' && 'border-dashed border-line bg-transparent',
        className,
      )}
      {...props}
    >
      <span aria-hidden>{mark}</span>
      {overtime != null ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 h-4 min-w-4 rounded-lg bg-day-zangyo px-[3px] font-mono text-[9.5px] leading-4 text-surface-1"
        >
          {overtime}
        </span>
      ) : null}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-[3px] w-full rounded-b-[5px] bg-(--sub)"
      />
    </button>
  );
}
