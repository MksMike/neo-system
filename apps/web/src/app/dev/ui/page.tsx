import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { Showcase } from './showcase';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('devUi');
  return { title: t('title'), robots: { index: false } };
}

/** Component catalog. Development only: production answers 404. */
export default async function DevUiPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const t = await getTranslations('devUi');

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1180px] px-8 pt-8 pb-30 max-md:px-4">
        <header className="mb-6">
          <p className="m-0 text-xs font-semibold uppercase tracking-[.08em] text-primary-text">
            packages/ui
          </p>
          <h1 className="mt-1.5 mb-2 type-display">{t('title')}</h1>
          <p className="m-0 max-w-[72ch] text-[15px] leading-6 text-ink-muted">
            {t('description')}
          </p>
        </header>
        <Showcase />
      </main>
    </>
  );
}
