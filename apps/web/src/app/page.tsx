import { Button, Card } from '@neo/ui';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { TopBar } from '@/components/top-bar';

export default async function HomePage() {
  const t = await getTranslations('home');
  const showDevUi = process.env.NODE_ENV !== 'production';

  return (
    <>
      <TopBar />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
        <Card>
          <h1 className="m-0 type-h1">{t('title')}</h1>
          <p className="m-0 text-ink-muted">{t('description')}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/login">{t('signIn')}</Link>
            </Button>
            {showDevUi ? (
              <Button asChild variant="secondary">
                <Link href="/dev/ui">{t('devUi')}</Link>
              </Button>
            ) : null}
          </div>
        </Card>
      </main>
    </>
  );
}
