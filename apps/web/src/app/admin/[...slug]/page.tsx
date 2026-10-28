import { Badge, Card, type BadgeProps } from '@neo/ui';
import { CircleDashed } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SectionHeader } from '../section-header';
import { findScreen, type Milestone } from '../sections';

interface Props {
  params: Promise<{ slug: string[] }>;
}

const MILESTONE_BADGE: Record<Milestone, BadgeProps['variant']> = {
  demo: 'primary',
  m1: 'info',
  m2: 'info',
  m3: 'neutral',
  m4: 'neutral',
  phase2: 'outline',
};

async function resolve(params: Props['params']) {
  const found = findScreen((await params).slug);
  if (!found) notFound();
  return found;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, screen } = await resolve(params);
  const t = await getTranslations('admin');
  return {
    title: `${t(`screens.${section.key}.${screen.key}.title`)} · ${t(`nav.${section.key}`)}`,
  };
}

/**
 * Screens of the panel that are not built yet: title, tabs and what the screen will do, with the
 * milestone in which it arrives (docs/00-ancora.md, Roadmap). A screen with its own page file
 * takes precedence over this route.
 */
export default async function AdminScreenPage({ params }: Props) {
  const { section, screen } = await resolve(params);
  const t = await getTranslations('admin');
  const base = `screens.${section.key}.${screen.key}`;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={section.key} screen={screen.key} />
      <Card className="gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[12px] bg-primary-soft text-primary-text">
            <CircleDashed aria-hidden className="size-5" strokeWidth={1.75} />
          </span>
          <h2 className="m-0 type-h3">{t(`${base}.title`)}</h2>
          <Badge variant={MILESTONE_BADGE[screen.milestone]} className="ml-auto">
            {t(`milestones.${screen.milestone}`)}
          </Badge>
        </div>
        <p className="m-0 max-w-[72ch] text-ink-muted">{t(`${base}.text`)}</p>
      </Card>
    </div>
  );
}
