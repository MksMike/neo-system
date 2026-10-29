import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScreenPlaceholder, screenMetadata } from '../screen-placeholder';
import { findScreen } from '../sections';

interface Props {
  params: Promise<{ slug: string[] }>;
}

async function resolve(params: Props['params']) {
  const found = findScreen((await params).slug);
  if (!found) notFound();
  return found;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, screen } = await resolve(params);
  return screenMetadata(section.key, screen.key);
}

/** Screens of the panel without their own page file yet. A screen with its own file takes precedence. */
export default async function AdminScreenPage({ params }: Props) {
  const { section, screen } = await resolve(params);
  return <ScreenPlaceholder section={section.key} screen={screen.key} />;
}
