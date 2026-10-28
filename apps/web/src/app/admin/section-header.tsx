import { PageHeader, TabNav, TabNavItem } from '@neo/ui';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ADMIN_SECTIONS, screenHref } from './sections';

/**
 * Title of the open section and its screens as tabs (one URL each). Every screen of the panel,
 * built or not, starts with it, so the title always says which screen is open.
 */
export async function SectionHeader({
  section: sectionKey,
  screen: screenKey,
  actions,
}: {
  section: string;
  screen: string;
  actions?: ReactNode;
}) {
  const t = await getTranslations('admin');
  const section = ADMIN_SECTIONS.find((s) => s.key === sectionKey);
  if (!section) throw new Error(`Unknown admin section: ${sectionKey}`);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t(`nav.${section.key}`)} actions={actions} />
      {section.screens.length > 1 ? (
        <TabNav aria-label={t('screensOf', { section: t(`nav.${section.key}`) })}>
          {section.screens.map((screen) => (
            <TabNavItem key={screen.key} asChild active={screen.key === screenKey}>
              <Link href={screenHref(section, screen)}>
                {t(`screens.${section.key}.${screen.key}.title`)}
              </Link>
            </TabNavItem>
          ))}
        </TabNav>
      ) : null}
    </div>
  );
}
