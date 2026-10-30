import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

/** Card do estilo Futurista: colchetes nos cantos e varredura no modo animado (especificação, seção 2). */
export function Card({
  className,
  children,
  scan = false,
  ...props
}: ComponentProps<'div'> & { scan?: boolean }) {
  return (
    <div className={cn('fx-card p-5', className)} {...props}>
      {scan ? <span aria-hidden className="fx-scan" /> : null}
      {children}
    </div>
  );
}

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn('fx-title m-0 text-[13px] text-muted', className)} {...props} />;
}
