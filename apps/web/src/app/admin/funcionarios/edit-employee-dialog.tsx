'use client';

import { Button, Dialog, DialogContent, DialogTitle, DialogTrigger } from '@neo/ui';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { EmployeeForm, type EmployeeValues } from './employee-form';

export function EditEmployeeDialog({
  id,
  version,
  initial,
}: {
  id: string;
  version: number;
  initial: EmployeeValues;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Pencil aria-hidden />
          {t('employees.edit')}
        </Button>
      </DialogTrigger>
      <DialogContent layout="drawer" closeLabel={t('common.close')} className="overflow-y-auto">
        <DialogTitle>{t('employees.edit')}</DialogTitle>
        {/* Remounted on each open: always starts from the saved data and its version */}
        {open ? (
          <EmployeeForm
            id={id}
            version={version}
            initial={initial}
            onSaved={() => {
              setOpen(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
