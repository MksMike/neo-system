'use client';

import { Badge, Card } from '@neo/ui';
import { Building2, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAction } from '@/lib/use-action';
import { selectCompany } from '../actions';

interface Company {
  id: string;
  code: string;
  name: string;
  role: string;
}

export function CompanyChoice({ companies }: { companies: Company[] }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { run, pending } = useAction(selectCompany, { idempotent: true });

  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {companies.map((c) => (
        <li key={c.id}>
          <Card
            variant="interactive"
            role="button"
            tabIndex={0}
            aria-disabled={pending}
            className="flex-row items-center gap-3 p-4"
            onClick={() => {
              void run({ companyId: c.id }).then((result) => {
                if (result.ok) {
                  router.replace(result.data.redirectTo);
                  router.refresh();
                }
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.currentTarget.click();
              }
            }}
          >
            <Building2 aria-hidden className="size-5 text-primary-text" strokeWidth={1.75} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{c.name}</span>
              <span className="block font-mono text-xs text-ink-subtle">{c.code}</span>
            </span>
            <Badge variant="primary">{t(`roles.${c.role}`)}</Badge>
            <ChevronRight aria-hidden className="size-4 text-ink-subtle" />
          </Card>
        </li>
      ))}
    </ul>
  );
}
