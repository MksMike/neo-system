'use client';

import { Alert, Button, Field, Input, toast } from '@neo/ui';
import { Save, Undo2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { missingAnyDependency } from '@/lib/modules';
import { useAction } from '@/lib/use-action';
import { ModuleChecklist, type NamedModule } from '../module-checklist';
import { businessDateValue } from '../status';
import { setCompanyModules } from './actions';

/**
 * Edits the optional modules from a date (R00-04, R00-05). `current` are the open periods the
 * page showed; the database refuses the change if they changed meanwhile (ADR 0020).
 */
export function ModulesEditor({
  companyId,
  catalog,
  current,
  today,
}: {
  companyId: string;
  catalog: NamedModule[];
  current: string[];
  today: string;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const [selected, setSelected] = useState(current);
  const [validFrom, setValidFrom] = useState(today);
  const [error, setError] = useState<string>();
  const [conflict, setConflict] = useState(false);
  const save = useAction(setCompanyModules, { toastOnError: false });

  const added = selected.filter((k) => !current.includes(k));
  const removed = current.filter((k) => !selected.includes(k));
  const dirty = added.length > 0 || removed.length > 0;
  const missingAny = missingAnyDependency(selected, catalog);
  const name = (key: string) => catalog.find((m) => m.key === key)?.name ?? key;
  const list = (keys: string[]) => format.list(keys.map(name), { type: 'conjunction' });

  async function submit() {
    setError(undefined);
    setConflict(false);
    if (missingAny.length > 0) {
      setError(t('super.wizard.errors.modules'));
      return;
    }
    if (!validFrom || validFrom < today) {
      setError(t('validation.dateInPast'));
      return;
    }
    const result = await save.run({ companyId, modules: selected, expected: current, validFrom });
    if (result.ok) {
      toast.success(t('super.company.modules.saved'));
      router.refresh();
      return;
    }
    if (result.detail === 'modules_changed') setConflict(true);
    else setError(`${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4"
    >
      {conflict ? (
        <Alert
          variant="warning"
          title={t('super.company.conflict.title')}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.reload();
              }}
            >
              {t('super.company.conflict.reload')}
            </Button>
          }
        >
          {t('super.company.conflict.text')}
        </Alert>
      ) : null}

      <ModuleChecklist
        catalog={catalog}
        selected={selected}
        onChange={setSelected}
        error={missingAny.length > 0 ? t('super.wizard.errors.modules') : undefined}
      />

      <div className="mk-card sticky bottom-0 flex flex-wrap items-end gap-4 rounded-lg border border-line bg-surface-1 p-4 shadow-md">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1 text-sm">
          {dirty ? (
            <>
              {added.length > 0 ? (
                <p className="m-0">
                  {t('super.company.modules.willEnable', { list: list(added) })}
                </p>
              ) : null}
              {removed.length > 0 ? (
                <p className="m-0">
                  {t('super.company.modules.willDisable', { list: list(removed) })}
                </p>
              ) : null}
            </>
          ) : (
            <p className="m-0 text-ink-subtle">{t('super.company.modules.noChanges')}</p>
          )}
          {error ? (
            <p role="alert" className="m-0 text-danger">
              {error}
            </p>
          ) : null}
        </div>
        <Field
          label={t('super.company.validFrom')}
          help={
            validFrom && validFrom !== today
              ? t('super.company.validFromHelp', {
                  date: format.dateTime(businessDateValue(validFrom), {
                    dateStyle: 'medium',
                    timeZone: 'UTC',
                  }),
                })
              : t('super.company.validFromToday')
          }
          className="w-[200px]"
        >
          <Input
            type="date"
            min={today}
            value={validFrom}
            onChange={(e) => {
              setValidFrom(e.target.value);
            }}
          />
        </Field>
        <div className="flex gap-2 pb-5">
          <Button
            type="button"
            variant="ghost"
            disabled={!dirty || save.pending}
            onClick={() => {
              setSelected(current);
              setError(undefined);
            }}
          >
            <Undo2 aria-hidden />
            {t('super.company.modules.reset')}
          </Button>
          <Button type="submit" variant="primary" disabled={!dirty} loading={save.pending}>
            <Save aria-hidden />
            {t('super.company.modules.save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
