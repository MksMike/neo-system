import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

/** Loading indicator. Pass `label` when it is the only content, for screen readers. */
export function Spinner({
  className,
  label,
  ...props
}: ComponentProps<'span'> & { label?: string }) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block size-4 shrink-0 animate-nx-spin rounded-full border-2 border-current border-r-transparent',
        className,
      )}
      {...props}
    />
  );
}
