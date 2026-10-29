import { Button, Card, EmptyState } from '@neo/ui';
import { todayInTokyo } from '@neo/validation';
import { Building2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireOffice } from '@/server/office';
import { screenMetadata } from '../../screen-placeholder';
import { SectionHeader } from '../../section-header';
import { AssignmentForm } from '../assignment-form';
import { formOptions } from '../data';

export const generateMetadata = () => screenMetadata('assignments', 'new');

/** New assignment; after saving, the employees are allocated on its page. */
export default async function NewAssignmentPage() {
  const office = await requireOffice('scheduling');
  const [t, options] = await Promise.all([getTranslations(), formOptions(office.companyId)]);
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section="assignments" screen="new" />
      {options.clients.length === 0 ? (
        <EmptyState
          icon={<Building2 aria-hidden />}
          title={t('assignments.noClients')}
          description={t('assignments.noClientsText')}
          action={
            office.canEdit ? (
              <Button asChild variant="primary">
                <Link href="/admin/clientes/novo">{t('clients.new')}</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <AssignmentForm options={options} today={todayInTokyo()} />
        </Card>
      )}
    </div>
  );
}
