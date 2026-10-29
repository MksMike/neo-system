import { Card } from '@neo/ui';
import { notFound } from 'next/navigation';
import { requireOffice } from '@/server/office';
import { screenMetadata } from '../../screen-placeholder';
import { SectionHeader } from '../../section-header';
import { EmployeeForm } from '../employee-form';

export const generateMetadata = () => screenMetadata('employees', 'new');

export default async function NewEmployeePage() {
  const office = await requireOffice('employees');
  if (!office.canEdit) notFound();
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section="employees" screen="new" />
      <Card>
        <EmployeeForm />
      </Card>
    </div>
  );
}
