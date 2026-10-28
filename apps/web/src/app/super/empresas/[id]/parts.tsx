import { Card, CardHeader, CardTitle } from '@neo/ui';
import type { ReactNode } from 'react';

/** Card with a title, an optional action and a description list. */
export function InfoCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <dl className="m-0 grid gap-3 sm:grid-cols-2">{children}</dl>
    </Card>
  );
}

export function Info({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'flex flex-col gap-0.5 sm:col-span-2' : 'flex flex-col gap-0.5'}>
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="m-0 text-sm break-words">{children ?? '—'}</dd>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 type-h3">{children}</h2>
      {action}
    </div>
  );
}
