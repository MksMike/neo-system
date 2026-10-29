import { Card } from '@neo/ui';
import { notFound } from 'next/navigation';
import { requireOffice } from '@/server/office';
import { screenMetadata } from '../../screen-placeholder';
import { SectionHeader } from '../../section-header';
import { ClientForm } from '../client-form';

export const generateMetadata = () => screenMetadata('clients', 'new');

export default async function NewClientPage() {
  const office = await requireOffice('organizations');
  if (!office.canEdit) notFound();
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section="clients" screen="new" />
      <Card>
        <ClientForm />
      </Card>
    </div>
  );
}
