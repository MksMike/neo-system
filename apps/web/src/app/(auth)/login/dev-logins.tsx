'use client';

import { Button, toast } from '@neo/ui';
import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Logins of the local seed (supabase/seeds/10_dev_data.sql). Shown only in `next dev`. */
const LOGINS = [
  { key: 'demo', email: 'dono.demo@neo.local' },
  { key: 'sugita', email: 'dono.sugita@neo.local' },
  { key: 'admin', email: 'admin@neo.local' },
] as const;
const PASSWORD = 'neo-local-2026';

function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useTranslations('auth.dev');
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={label}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => toast.success(t('copied')));
      }}
    >
      <Copy aria-hidden />
    </Button>
  );
}

export function DevLogins() {
  const t = useTranslations('auth.dev');
  return (
    <section
      aria-labelledby="dev-logins"
      className="flex flex-col gap-2 rounded-md border border-dashed border-warning bg-warning-soft p-3 text-sm"
    >
      <h2 id="dev-logins" className="m-0 type-label text-warning">
        {t('title')}
      </h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {LOGINS.map((l) => (
          <li key={l.key} className="flex items-center gap-1">
            <span className="w-24 shrink-0 text-ink-muted">{t(l.key)}</span>
            <code className="min-w-0 flex-1 truncate">{l.email}</code>
            <CopyButton value={l.email} label={t('copyEmail', { email: l.email })} />
          </li>
        ))}
        <li className="flex items-center gap-1">
          <span className="w-24 shrink-0 text-ink-muted">{t('password')}</span>
          <code className="min-w-0 flex-1">{PASSWORD}</code>
          <CopyButton value={PASSWORD} label={t('copyPassword')} />
        </li>
      </ul>
    </section>
  );
}
