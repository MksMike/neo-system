import { EmptyState, PageHeader } from '@neo/ui';
import type { LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

export type SuperPage = 'home' | 'companies' | 'newCompany' | 'payments' | 'modules' | 'system';

/** Page with title and empty state, until the screen is built in its own task (SA-07). */
export async function SuperPlaceholder({
  page,
  icon: Icon,
  actions,
}: {
  page: SuperPage;
  icon: LucideIcon;
  actions?: ReactNode;
}) {
  const t = await getTranslations(`super.pages.${page}`);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('title')} description={t('description')} actions={actions} />
      <EmptyState
        icon={<Icon aria-hidden />}
        title={t('emptyTitle')}
        description={t('emptyText')}
      />
    </div>
  );
}

export async function superMetadata(page: SuperPage) {
  const t = await getTranslations(`super.pages.${page}`);
  return { title: t('title'), robots: { index: false } };
}
