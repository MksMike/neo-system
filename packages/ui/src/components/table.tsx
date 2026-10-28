import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface-1">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  );
}

export function TableHead(props: ComponentProps<'thead'>) {
  return <thead {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cn(
        '[&>tr]:transition-colors [&>tr]:duration-(--dur-fast) [&>tr:hover]:bg-surface-3 [&>tr[aria-selected=true]]:bg-primary-soft [&>tr:last-child>td]:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

export function TableRow(props: ComponentProps<'tr'>) {
  return <tr {...props} />;
}

export function TableHeaderCell({
  className,
  align = 'left',
  ...props
}: ComponentProps<'th'> & { align?: 'left' | 'right' }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap border-b border-line bg-surface-2 px-4 py-2.5 type-label text-ink-muted',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  align = 'left',
  ...props
}: ComponentProps<'td'> & { align?: 'left' | 'right' }) {
  return (
    <td
      className={cn(
        'border-b border-line px-4 py-3 align-middle',
        align === 'right' && 'text-right',
        className,
      )}
      {...props}
    />
  );
}
