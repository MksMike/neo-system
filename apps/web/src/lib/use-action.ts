'use client';

import type { ActionFailure, ActionResult } from '@neo/db';
import { toast } from '@neo/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { runAction, type RunActionOptions } from './run-action';

/**
 * Runs a Server Action from a component: pending state, timeout, safe retries and,
 * on failure, an alert in the user's language with the request id (ADR 0020).
 * Field errors are returned for the form to show next to each field.
 */
export function useAction<I, O>(
  action: (input: I) => Promise<ActionResult<O>>,
  options: RunActionOptions & { toastOnError?: boolean } = {},
) {
  const t = useTranslations();
  const [pending, setPending] = useState(false);
  const { toastOnError = true, ...runOptions } = options;

  const showError = useCallback(
    (failure: ActionFailure, retry: () => void) => {
      if (!toastOnError || failure.fieldErrors) return;
      toast.error(t(failure.message), {
        description: t('errors.requestId', { id: failure.requestId }),
        action: { label: t('errors.retry'), onClick: retry },
      });
    },
    [t, toastOnError],
  );

  const run = useCallback(
    async (input: I): Promise<ActionResult<O>> => {
      setPending(true);
      try {
        const result = await runAction(() => action(input), runOptions);
        if (!result.ok) {
          showError(result, () => {
            void run(input);
          });
        }
        return result;
      } finally {
        setPending(false);
      }
    },
    // runOptions is a fresh object each render; its values are what matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action, showError, runOptions.idempotent, runOptions.retries, runOptions.timeoutMs],
  );

  return { run, pending };
}
