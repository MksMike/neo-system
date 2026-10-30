'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@neo/ui';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AssignmentForm, type AssignmentValues, type FormOptions } from './assignment-form';
import type { Board } from './data';
import { shortTime } from './schema';

const str = (n: number) => (n === 0 ? '' : String(n));

function valuesOf(a: Board): AssignmentValues {
  return {
    clientId: a.client_id,
    chainId: a.chain_id ?? '',
    siteId: a.site_id ?? '',
    hasTitle: a.title !== null,
    title: a.title ?? '',
    titleShowOn: a.title_show_on as AssignmentValues['titleShowOn'],
    startsOn: a.starts_on,
    endsOn: a.ends_on,
    startTime: shortTime(a.start_time),
    endTime: shortTime(a.end_time),
    breakMinutes: String(a.break_minutes),
    meetingPlace: a.meeting_place ?? '',
    meetingTime: shortTime(a.meeting_time),
    dayRate: str(a.day_rate),
    taxRate: String(a.tax_rate),
    priceIncludesTax: a.price_includes_tax,
    hasExtra: a.extra_description !== null,
    extraDescription: a.extra_description ?? '',
    extraClientAmount: str(a.extra_client_amount),
    extraEmployeeAmount: str(a.extra_employee_amount),
    extraClientTaxable: a.extra_client_taxable,
    note: a.note ?? '',
  };
}

/** Edits the defaults of an assignment; days already created keep their own values (R06-08). */
export function EditAssignmentDialog({
  board,
  options,
  today,
}: {
  board: Board;
  options: FormOptions;
  today: string;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Pencil aria-hidden />
          {t('assignments.edit')}
        </Button>
      </DialogTrigger>
      <DialogContent
        layout="drawer"
        closeLabel={t('common.close')}
        className="w-[min(680px,100vw)] overflow-y-auto"
      >
        <DialogTitle>{t('assignments.edit')}</DialogTitle>
        <DialogDescription>{t('assignments.editHelp')}</DialogDescription>
        {/* Remounted on each open: always starts from the saved data and its version */}
        {open ? (
          <AssignmentForm
            id={board.id}
            version={board.version}
            initial={valuesOf(board)}
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
