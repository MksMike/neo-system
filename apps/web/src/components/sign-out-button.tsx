'use client';

import { Button } from '@neo/ui';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/(auth)/actions';
import { useAction } from '@/lib/use-action';

export function SignOutButton() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { run, pending } = useAction(signOut, { idempotent: true });
  return (
    <Button
      variant="secondary"
      loading={pending}
      onClick={() => {
        void run({}).then((result) => {
          if (result.ok) {
            router.replace(result.data.redirectTo);
            router.refresh();
          }
        });
      }}
    >
      <LogOut aria-hidden />
      {t('signOut')}
    </Button>
  );
}
