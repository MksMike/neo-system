'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  NativeSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  toast,
} from '@neo/ui';
import { Trash2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { addMember, removeMember } from './actions';

export interface Member {
  id: string;
  version: number;
  startsOn: string;
  endsOn: string;
  employeeId: string;
  name: string;
}

/**
 * Employees allocated to an assignment: for the whole period or an interval inside it. Overlapping
 * hours with another assignment are refused by the database (R06-02).
 */
export function MembersPanel({
  assignmentId,
  period,
  members,
  employees,
  canEdit,
  formatDate,
}: {
  assignmentId: string;
  period: { startsOn: string; endsOn: string };
  members: Member[];
  employees: { id: string; full_name: string }[];
  canEdit: boolean;
  formatDate: Record<string, string>;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [employeeId, setEmployeeId] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [error, setError] = useState<string>();
  const add = useAction(addMember, { idempotent: true, toastOnError: false });
  const remove = useAction(removeMember);
  const available = employees.filter((e) => !members.some((m) => m.employeeId === e.id));

  function reset() {
    setRequestId(crypto.randomUUID());
    setEmployeeId('');
    setStartsOn('');
    setEndsOn('');
    setError(undefined);
  }

  async function submit() {
    setError(undefined);
    if (!employeeId) {
      setError(t('assignments.members.chooseEmployee'));
      return;
    }
    const result = await add.run({ id: requestId, assignmentId, employeeId, startsOn, endsOn });
    if (result.ok) {
      toast.success(t('assignments.members.added'));
      setOpen(false);
      reset();
      router.refresh();
      return;
    }
    setError(
      result.detail === 'schedule_overlap'
        ? t('assignments.members.overlap')
        : result.detail === 'member_duplicate'
          ? t('assignments.members.duplicate')
          : result.detail === 'member_outside_period'
            ? t('assignments.members.outside')
            : `${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`,
    );
  }

  return (
    <section aria-labelledby="assignment-members" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="assignment-members" className="m-0 type-h3">
          {t('assignments.members.title', { count: members.length })}
        </h2>
        {canEdit ? (
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) reset();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="primary" disabled={available.length === 0}>
                <UserPlus aria-hidden />
                {t('assignments.members.add')}
              </Button>
            </DialogTrigger>
            <DialogContent closeLabel={t('common.close')}>
              <DialogTitle>{t('assignments.members.add')}</DialogTitle>
              <DialogDescription>{t('assignments.members.addHelp')}</DialogDescription>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
                className="flex flex-col gap-4"
              >
                {error ? <Alert variant="danger" title={error} /> : null}
                <Field label={t('assignments.members.employee')} required>
                  <NativeSelect
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                    }}
                  >
                    <option value="">{t('assignments.choose')}</option>
                    {available.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.full_name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={t('assignments.members.from')}
                    help={t('assignments.members.rangeHelp')}
                  >
                    <Input
                      type="date"
                      min={period.startsOn}
                      max={period.endsOn}
                      value={startsOn}
                      onChange={(e) => {
                        setStartsOn(e.target.value);
                      }}
                    />
                  </Field>
                  <Field label={t('assignments.members.to')}>
                    <Input
                      type="date"
                      min={startsOn || period.startsOn}
                      max={period.endsOn}
                      value={endsOn}
                      onChange={(e) => {
                        setEndsOn(e.target.value);
                      }}
                    />
                  </Field>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" variant="primary" loading={add.pending}>
                    {t('assignments.members.confirm')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {members.length === 0 ? (
        <p className="m-0 text-sm text-ink-subtle">{t('assignments.members.empty')}</p>
      ) : (
        <Table aria-label={t('assignments.members.tableLabel')}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('assignments.members.employee')}</TableHeaderCell>
              <TableHeaderCell>{t('assignments.members.from')}</TableHeaderCell>
              <TableHeaderCell>{t('assignments.members.to')}</TableHeaderCell>
              {canEdit ? (
                <TableHeaderCell align="right">{t('clients.actions')}</TableHeaderCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="type-num">{formatDate[m.startsOn] ?? m.startsOn}</TableCell>
                <TableCell className="type-num">{formatDate[m.endsOn] ?? m.endsOn}</TableCell>
                {canEdit ? (
                  <TableCell align="right">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={t('assignments.members.remove', { name: m.name })}
                      loading={remove.pending}
                      onClick={() => {
                        void remove.run({ memberId: m.id, version: m.version }).then((r) => {
                          if (r.ok) router.refresh();
                        });
                      }}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
