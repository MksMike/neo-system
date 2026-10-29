import { Badge, Card, type BadgeProps } from '@neo/ui';
import { CircleDashed } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SectionHeader } from './section-header';
import { ADMIN_SECTIONS, type Milestone } from './sections';

const MILESTONE_BADGE: Record<Milestone, BadgeProps['variant']> = {
  demo: 'primary',
  m1: 'info',
  m2: 'info',
  m3: 'neutral',
  m4: 'neutral',
  phase2: 'outline',
};

function find(sectionKey: string, screenKey: string) {
  const section = ADMIN_SECTIONS.find((s) => s.key === sectionKey);
  const screen = section?.screens.find((s) => s.key === screenKey);
  if (!section || !screen) throw new Error(`Unknown admin screen: ${sectionKey}.${screenKey}`);
  return { section, screen };
}

export async function screenMetadata(sectionKey: string, screenKey: string): Promise<Metadata> {
  const t = await getTranslations('admin');
  return {
    title: `${t(`screens.${sectionKey}.${screenKey}.title`)} · ${t(`nav.${sectionKey}`)}`,
  };
}

/**
 * A screen that is not built yet: title, tabs and what it will do, with the milestone in which
 * it arrives (docs/00-ancora.md, Roadmap).
 */
export async function ScreenPlaceholder({ section, screen }: { section: string; screen: string }) {
  const found = find(section, screen);
  const t = await getTranslations('admin');
  const base = `screens.${section}.${screen}`;
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={section} screen={screen} />
      <Card className="gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[12px] bg-primary-soft text-primary-text">
            <CircleDashed aria-hidden className="size-5" strokeWidth={1.75} />
          </span>
          <h2 className="m-0 type-h3">{t(`${base}.title`)}</h2>
          <Badge variant={MILESTONE_BADGE[found.screen.milestone]} className="ml-auto">
            {t(`milestones.${found.screen.milestone}`)}
          </Badge>
        </div>
        <p className="m-0 max-w-[72ch] text-ink-muted">{t(`${base}.text`)}</p>
      </Card>
    </div>
  );
}
