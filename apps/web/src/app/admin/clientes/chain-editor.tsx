'use client';

import {
  Alert,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  NativeSelect,
  Popover,
  PopoverContent,
  PopoverTrigger,
  toast,
} from '@neo/ui';
import { Check, Palette, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAction } from '@/lib/use-action';
import { findOrganizations, linkSubcontractor, updateChain } from './actions';
import { CHAIN_COLORS, chainColorVar } from './schema';

interface Match {
  id: string;
  name: string;
  is_client: boolean;
}

/**
 * Quick "+" for a subcontractor (R04-02): while the name is typed, organizations with a similar
 * name are listed, so an existing one is linked instead of registered twice.
 */
export function LinkSubcontractor({
  clientId,
  clients,
  linkedIds = [],
}: {
  /** Fixed client (client page), or a list to choose from (subcontractors page). */
  clientId?: string;
  clients?: { id: string; name: string }[];
  linkedIds?: string[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [newOrgId, setNewOrgId] = useState(() => crypto.randomUUID());
  const [client, setClient] = useState(clientId ?? '');
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<Match>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [position, setPosition] = useState('1');
  const [abbreviation, setAbbreviation] = useState('');
  const [error, setError] = useState<string>();
  const find = useAction(findOrganizations, { idempotent: true, toastOnError: false });
  const link = useAction(linkSubcontractor, { idempotent: true, toastOnError: false });
  const runFind = find.run;

  // Search after a short pause in typing.
  useEffect(() => {
    if (picked || name.trim().length < 1) return;
    const timer = setTimeout(() => {
      void runFind({ name }).then((result) => {
        if (result.ok) setMatches(result.data.filter((m) => m.id !== client));
      });
    }, 250);
    return () => {
      clearTimeout(timer);
    };
  }, [name, picked, client, runFind]);

  function reset() {
    setRequestId(crypto.randomUUID());
    setNewOrgId(crypto.randomUUID());
    setClient(clientId ?? '');
    setName('');
    setPicked(undefined);
    setMatches([]);
    setPosition('1');
    setAbbreviation('');
    setError(undefined);
  }

  async function submit() {
    setError(undefined);
    if (!client) {
      setError(t('clients.chain.chooseClient'));
      return;
    }
    if (!picked && !name.trim()) {
      setError(t('validation.required'));
      return;
    }
    const result = await link.run({
      id: requestId,
      clientId: client,
      name: picked ? '' : name,
      ...(picked ? { organizationId: picked.id } : { newOrganizationId: newOrgId }),
      position: Number(position),
      abbreviation,
    });
    if (result.ok) {
      toast.success(t('clients.chain.linked'));
      setOpen(false);
      reset();
      router.refresh();
      return;
    }
    setError(
      result.detail === 'chain_duplicate'
        ? t('clients.chain.duplicate')
        : result.detail === 'chain_self'
          ? t('clients.chain.self')
          : `${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`,
    );
  }

  const visibleMatches = picked || !name.trim() ? [] : matches;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus aria-hidden />
          {t('clients.chain.add')}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t('common.close')}>
        <DialogTitle>{t('clients.chain.add')}</DialogTitle>
        <DialogDescription>{t('clients.chain.addHelp')}</DialogDescription>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-4"
        >
          {error ? <Alert variant="danger" title={error} /> : null}
          {clients ? (
            <Field label={t('clients.chain.client')} required>
              <NativeSelect
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                }}
              >
                <option value="">{t('clients.chain.chooseClient')}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          ) : null}
          <Field
            label={t('clients.chain.name')}
            required
            help={picked ? t('clients.chain.existing') : t('clients.chain.nameHelp')}
          >
            <Input
              value={picked ? picked.name : name}
              onChange={(e) => {
                setPicked(undefined);
                setName(e.target.value);
              }}
              maxLength={200}
              autoComplete="off"
              aria-describedby={visibleMatches.length > 0 ? 'chain-matches' : undefined}
            />
          </Field>
          {visibleMatches.length > 0 ? (
            <div id="chain-matches" className="flex flex-col gap-1">
              <span className="type-label text-ink-muted">{t('clients.chain.similar')}</span>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {visibleMatches.map((m) => {
                  const already = linkedIds.includes(m.id);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        disabled={already}
                        onClick={() => {
                          setPicked(m);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-left text-sm hover:border-line-strong disabled:cursor-default disabled:opacity-60"
                      >
                        <span className="truncate">{m.name}</span>
                        <span className="shrink-0 text-xs text-ink-subtle">
                          {already ? t('clients.chain.alreadyLinked') : t('clients.chain.use')}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('clients.chain.position')} help={t('clients.chain.positionHelp')}>
              <NativeSelect
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                }}
              >
                {Array.from({ length: 9 }, (_, i) => String(i + 1)).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field
              label={t('clients.chain.abbreviation')}
              help={t('clients.chain.abbreviationHelp')}
            >
              <Input
                value={abbreviation}
                onChange={(e) => {
                  setAbbreviation(e.target.value);
                }}
                maxLength={6}
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
            <Button type="submit" variant="primary" loading={link.pending}>
              {t('clients.chain.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Color choice of a link (design tokens only, R04-03) and its removal. */
export function ChainRowActions({
  id,
  version,
  color,
  name,
}: {
  id: string;
  version: number;
  color: string;
  name: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const update = useAction(updateChain);

  async function change(patch: { color?: string; removed?: boolean }) {
    const result = await update.run({
      id,
      version,
      abbreviation: '',
      ...(patch.color ? { color: patch.color as (typeof CHAIN_COLORS)[number] } : {}),
      ...(patch.removed ? { removed: true } : {}),
    });
    if (result.ok) {
      setConfirm(false);
      router.refresh();
    }
  }

  return (
    <span className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t('clients.chain.color', { name })}
          >
            <Palette aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <span
            role="radiogroup"
            aria-label={t('clients.chain.color', { name })}
            className="grid grid-cols-5 gap-2 p-1"
          >
            {CHAIN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={c === color}
                aria-label={t(`clients.colors.${c}`)}
                title={t(`clients.colors.${c}`)}
                onClick={() => {
                  void change({ color: c });
                }}
                style={{ background: chainColorVar(c) }}
                className={cn(
                  'grid size-7 cursor-pointer place-items-center rounded-full border-2 border-surface-1 p-0 text-on-grad shadow-[0_0_0_1px_var(--line)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-checked:shadow-[0_0_0_2px_var(--focus)]',
                )}
              >
                {c === color ? <Check aria-hidden className="size-4" strokeWidth={2.5} /> : null}
              </button>
            ))}
          </span>
        </PopoverContent>
      </Popover>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t('clients.chain.remove', { name })}
          >
            <Trash2 aria-hidden />
          </Button>
        </DialogTrigger>
        <DialogContent closeLabel={t('common.close')}>
          <DialogTitle>{t('clients.chain.removeTitle', { name })}</DialogTitle>
          <DialogDescription>{t('clients.chain.removeText')}</DialogDescription>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirm(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              loading={update.pending}
              onClick={() => {
                void change({ removed: true });
              }}
            >
              {t('clients.chain.removeConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </span>
  );
}
