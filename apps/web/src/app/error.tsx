'use client';

import { Button, Card } from '@neo/ui';
import { useTranslations } from 'next-intl';

/** Error screen of the app: the page fails, the app does not (ADR 0020). */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  return (
    <main className="mx-auto flex max-w-xl flex-col px-4 py-16">
      <Card>
        <h1 className="m-0 type-h2">{t('pageTitle')}</h1>
        <p className="m-0 text-ink-muted">{t('pageText')}</p>
        {error.digest ? (
          <p className="m-0 type-num text-ink-subtle">{t('requestId', { id: error.digest })}</p>
        ) : null}
        <div>
          <Button variant="primary" onClick={reset}>
            {t('retry')}
          </Button>
        </div>
      </Card>
    </main>
  );
}
