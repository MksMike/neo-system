import { Card } from '@neo/ui';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { userClient } from '@/server/session';
import { InvitationForm } from './invitation-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.invite');
  return { title: t('title') };
}

/** Reached from the invitation e-mail after /auth/confirm created the session. */
export default async function InvitationPage() {
  const supabase = await userClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?erro=link_invalid');

  const t = await getTranslations('auth.invite');
  const name =
    typeof user.user_metadata.display_name === 'string' ? user.user_metadata.display_name : '';

  return (
    <Card className="gap-5 p-6">
      <div>
        <h1 className="m-0 type-h1">{t('title')}</h1>
        <p className="m-0 mt-1 text-ink-muted">{t('text', { name })}</p>
        <p className="m-0 mt-2 type-num text-ink-subtle">{user.email}</p>
      </div>
      <InvitationForm />
    </Card>
  );
}
