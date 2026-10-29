'use client';

import { Button, Dialog, DialogContent, DialogTitle, DialogTrigger } from '@neo/ui';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AssignmentForm, type AssignmentValues, type FormOptions } from './assignment-form';

export function EditAssignmentDialog({
  id,
  version,
  initial,
  options,
  today,
}: {
  id: string;
  version: number;
  initial: AssignmentValues;
  options: FormOptions;
  today: string;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Pencil aria-hidden />
          {t('assignments.edit')}
        </Button>
      </DialogTrigger>
      <DialogContent
        layout="drawer"
        closeLabel={t('common.close')}
        className="w-[min(640px,100vw)] overflow-y-auto"
      >
        <DialogTitle>{t('assignments.edit')}</DialogTitle>
        {/* Remounted on each open: always starts from the saved data and its version */}
        {open ? (
          <AssignmentForm
            id={id}
            version={version}
            initial={initial}
            options={options}
            today={today}
            onSaved={() => {
              setOpen(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
