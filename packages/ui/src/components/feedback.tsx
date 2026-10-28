'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { cn } from '../lib/cn';

export { toast } from 'sonner';

const alertVariants = cva(
  'flex items-start gap-3 rounded-md border px-4 py-3 text-ink [&>svg]:mt-px [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:stroke-[1.75]',
  {
    variants: {
      variant: {
        info: 'border-[color-mix(in_srgb,var(--info)_30%,transparent)] bg-info-soft [&>svg]:text-info',
        success:
          'border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-success-soft [&>svg]:text-success',
        warning:
          'border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-warning-soft [&>svg]:text-warning',
        danger:
          'border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-danger-soft [&>svg]:text-danger',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const alertIcons = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

export type AlertProps = Omit<ComponentProps<'div'>, 'title'> &
  VariantProps<typeof alertVariants> & { title: ReactNode; action?: ReactNode };

/** Inline alert. Danger and warning are announced to screen readers. */
export function Alert({ variant, title, action, children, className, ...props }: AlertProps) {
  const Icon = alertIcons[variant ?? 'info'];
  const urgent = variant === 'danger' || variant === 'warning';
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="m-0 font-semibold">{title}</p>
        {children ? (
          <div className="mt-0.5 text-[13px] leading-5 text-ink-muted">{children}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** Toasts (Sonner) styled with the tokens. Place once in the root layout. */
export function Toaster(props: ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      position="bottom-right"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-[min(380px,calc(100vw-32px))] items-center gap-3 rounded-lg bg-ink px-4 py-3 text-sm text-surface-1 shadow-lg [&_svg]:size-5',
          title: 'font-medium',
          description: 'text-[13px] opacity-80',
          actionButton:
            'ml-auto cursor-pointer rounded-[6px] bg-transparent p-1.5 text-[13px] font-bold text-surface-1 underline underline-offset-3',
          cancelButton:
            'cursor-pointer rounded-[6px] bg-transparent p-1.5 text-[13px] text-surface-1 opacity-80',
        },
      }}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn('animate-nx-pulse rounded-sm bg-surface-3', className)}
      {...props}
    />
  );
}

export interface EmptyStateProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong bg-surface-1 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-[14px] bg-primary-soft text-primary-text [&_svg]:size-6 [&_svg]:stroke-[1.75]">
        {icon}
      </span>
      <p className="m-0 type-h3">{title}</p>
      {description ? <p className="m-0 max-w-[48ch] text-ink-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function Progress({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('h-2 overflow-hidden rounded-full bg-surface-3', className)}
    >
      <span
        className="block h-full rounded-[inherit] bg-grad-brand transition-[width] duration-(--dur-slow) ease-standard"
        style={{ width: `${String(clamped)}%` }}
      />
    </div>
  );
}

export function Avatar({
  initials,
  brand = false,
  className,
  ...props
}: ComponentProps<'span'> & { initials: string; brand?: boolean }) {
  return (
    <span
      className={cn(
        'inline-grid size-9 shrink-0 place-items-center rounded-full border-2 border-surface-1 text-[13px] font-bold leading-none',
        brand ? 'bg-grad-brand text-on-grad' : 'bg-primary-soft text-primary-text',
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  );
}
