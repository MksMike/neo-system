'use client';

import {
  Alert,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@neo/ui';
import { KeyRound, Printer, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { createEmployeeAccess } from './actions';
import { formatLoginId } from './schema';

/**
 * App access of an employee (ADR 0016): create it, or reset the PIN (which ends every session of
 * that employee). The PIN is shown once, to be handed over; it is never stored or shown again.
 */
export function AccessPanel({
  employeeId,
  name,
  loginId,
  canEdit,
  active,
}: {
  employeeId: string;
  name: string;
  loginId: string | null;
  canEdit: boolean;
  active: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);
  const [result, setResult] = useState<{ loginId: string; pin: string; reset: boolean }>();
  const access = useAction(createEmployeeAccess);

  async function run() {
    const outcome = await access.run({ employeeId });
    setConfirmReset(false);
    if (outcome.ok) {
      setResult(outcome.data);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <span className="grid size-10 place-items-center rounded-[12px] bg-primary-soft text-primary-text">
          <Smartphone aria-hidden className="size-5" strokeWidth={1.75} />
        </span>
        <CardTitle>{t('employees.access.title')}</CardTitle>
      </CardHeader>
      {loginId ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="m-0 text-xs text-ink-subtle">{t('employees.access.loginId')}</p>
            <p className="type-num m-0 text-2xl font-bold tracking-[.08em]">
              {formatLoginId(loginId)}
            </p>
            <p className="m-0 mt-1 text-sm text-ink-muted">{t('employees.access.hasAccess')}</p>
          </div>
          {canEdit ? (
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmReset(true);
              }}
              disabled={!active}
            >
              <KeyRound aria-hidden />
              {t('employees.access.reset')}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 max-w-[60ch] text-sm text-ink-muted">{t('employees.access.none')}</p>
          {canEdit ? (
            <Button
              variant="primary"
              loading={access.pending}
              disabled={!active}
              onClick={() => {
                void run();
              }}
            >
              <KeyRound aria-hidden />
              {t('employees.access.create')}
            </Button>
          ) : null}
        </div>
      )}
      {!active ? <Alert variant="info" title={t('employees.access.inactive')} /> : null}

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent closeLabel={t('common.close')}>
          <DialogTitle>{t('employees.access.resetTitle', { name })}</DialogTitle>
          <DialogDescription>{t('employees.access.resetText')}</DialogDescription>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmReset(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              loading={access.pending}
              onClick={() => {
                void run();
              }}
            >
              {t('employees.access.resetConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={result !== undefined}
        onOpenChange={(open) => {
          if (!open) setResult(undefined);
        }}
      >
        <DialogContent closeLabel={t('common.close')} className="print:shadow-none">
          <DialogTitle>
            {result?.reset ? t('employees.access.newPinTitle') : t('employees.access.createdTitle')}
          </DialogTitle>
          <DialogDescription>{t('employees.access.handOver', { name })}</DialogDescription>
          {result ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-surface-2 p-4 text-center">
              <div>
                <p className="m-0 text-xs text-ink-subtle">{t('employees.access.loginId')}</p>
                <p
                  className="type-num m-0 text-2xl font-bold tracking-[.08em]"
                  data-testid="login-id"
                >
                  {formatLoginId(result.loginId)}
                </p>
              </div>
              <div>
                <p className="m-0 text-xs text-ink-subtle">PIN</p>
                <p className="type-num m-0 text-2xl font-bold tracking-[.3em]" data-testid="pin">
                  {result.pin}
                </p>
              </div>
            </div>
          ) : null}
          <Alert variant="warning" title={t('employees.access.onceTitle')}>
            {t('employees.access.onceText')}
          </Alert>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                window.print();
              }}
            >
              <Printer aria-hidden />
              {t('employees.access.print')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setResult(undefined);
              }}
            >
              {t('employees.access.done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
