import { Button } from '@neo/ui';
import { Building2, Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { SuperPlaceholder, superMetadata } from '../placeholder';

export const generateMetadata = () => superMetadata('companies');

export default async function Page() {
  const t = await getTranslations('super.pages.companies');
  return (
    <SuperPlaceholder
      page="companies"
      icon={Building2}
      actions={
        <Button asChild variant="primary">
          <Link href="/super/empresas/nova">
            <Plus aria-hidden />
            {t('new')}
          </Link>
        </Button>
      }
    />
  );
}
