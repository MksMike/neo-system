'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  PostalCodeInput,
  Textarea,
  toast,
} from '@neo/ui';
import { MapPin, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { saveSite } from './actions';
import { siteSchema } from './schema';

export interface SiteValues {
  id: string;
  version: number;
  name: string;
  postalCode: string;
  address: string;
  radiusM: number;
  note: string;
}

/** New or edited work site of a client: address and geolocation radius (layer 04). */
export function SiteDialog({ clientId, site }: { clientId: string; site?: SiteValues }) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const fresh = () => ({
    id: site?.id ?? crypto.randomUUID(),
    name: site?.name ?? '',
    postalCode: site?.postalCode ?? '',
    address: site?.address ?? '',
    radius: String(site?.radiusM ?? 300),
    note: site?.note ?? '',
  });
  const [values, setValues] = useState(fresh);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const save = useAction(saveSite, { idempotent: !site, toastOnError: false });
  const err = (field: string) => (errors[field] ? t(errors[field]) : undefined);

  async function submit() {
    setFormError(undefined);
    const input = {
      id: values.id,
      version: site?.version,
      clientId,
      name: values.name,
      postalCode: values.postalCode,
      address: values.address,
      radiusM: Number(values.radius),
      note: values.note,
    };
    const parsed = siteSchema.safeParse(input);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join('.');
        out[key] ??= issue.message.startsWith('validation.') ? issue.message : 'validation.invalid';
      }
      setErrors(out);
      return;
    }
    setErrors({});
    const result = await save.run(input);
    if (result.ok) {
      toast.success(t('clients.sites.saved'));
      setOpen(false);
      router.refresh();
      return;
    }
    if (result.fieldErrors) setErrors(result.fieldErrors);
    else
      setFormError(
        result.detail === 'concurrent_update'
          ? t('clients.errors.concurrent')
          : `${t(result.message)} ${t('errors.requestId', { id: result.requestId })}`,
      );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setValues(fresh());
          setErrors({});
          setFormError(undefined);
        }
      }}
    >
      <DialogTrigger asChild>
        {site ? (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t('clients.sites.edit', { name: site.name })}
          >
            <Pencil aria-hidden />
          </Button>
        ) : (
          <Button variant="secondary">
            <MapPin aria-hidden />
            {t('clients.sites.add')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent closeLabel={t('common.close')}>
        <DialogTitle>{site ? t('clients.sites.editTitle') : t('clients.sites.add')}</DialogTitle>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-4"
        >
          {formError ? <Alert variant="danger" title={formError} /> : null}
          <Field label={t('clients.sites.name')} error={err('name')} required>
            <Input
              value={values.name}
              onChange={(e) => {
                setValues((v) => ({ ...v, name: e.target.value }));
              }}
              maxLength={200}
              placeholder="品川工場"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <Field label={t('clients.fields.postalCode')} error={err('postalCode')}>
              <PostalCodeInput
                value={values.postalCode}
                onChange={(e) => {
                  setValues((v) => ({ ...v, postalCode: e.target.value }));
                }}
              />
            </Field>
            <Field label={t('clients.fields.address')} error={err('address')}>
              <Input
                value={values.address}
                onChange={(e) => {
                  setValues((v) => ({ ...v, address: e.target.value }));
                }}
                maxLength={300}
              />
            </Field>
          </div>
          <Field
            label={t('clients.sites.radius')}
            error={err('radiusM')}
            help={t('clients.sites.radiusHelp')}
          >
            <Input
              type="number"
              inputMode="numeric"
              min={50}
              max={5000}
              step={50}
              value={values.radius}
              onChange={(e) => {
                setValues((v) => ({ ...v, radius: e.target.value.replace(/\D/g, '').slice(0, 4) }));
              }}
              suffix="m"
              className="type-num"
            />
          </Field>
          <Field label={t('clients.fields.note')} error={err('note')}>
            <Textarea
              value={values.note}
              onChange={(e) => {
                setValues((v) => ({ ...v, note: e.target.value }));
              }}
              maxLength={1000}
              rows={2}
            />
          </Field>
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
            <Button type="submit" variant="primary" loading={save.pending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
