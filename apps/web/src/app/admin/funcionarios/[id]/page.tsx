import { Badge, Card, CardHeader, CardTitle } from '@neo/ui';
import { formatMobilePhone, formatYen } from '@neo/validation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { requireOffice } from '@/server/office';
import { AccessPanel } from '../access-panel';
import { getEmployee } from '../data';
import { EditEmployeeDialog } from '../edit-employee-dialog';
import type { EmploymentType } from '../schema';

interface Props {
  params: Promise<{ id: string }>;
}

async function load(params: Props['params']) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const office = await requireOffice('employees');
  const employee = await getEmployee(office.companyId, id);
  if (!employee) notFound();
  return { office, employee };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { employee } = await load(params);
  return { title: employee.full_name };
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="m-0 text-sm break-words">{children ?? '—'}</dd>
    </div>
  );
}

/** An employee: data and the app access (8-digit ID + PIN, ADR 0016). */
export default async function EmployeePage({ params }: Props) {
  const { office, employee: e } = await load(params);
  const [t, locale, format] = await Promise.all([getTranslations(), getLocale(), getFormatter()]);
  const countryName = new Intl.DisplayNames([locale], { type: 'region' });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/funcionarios"
          className="inline-flex items-center gap-1.5 self-start rounded-xs text-[13px] font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t('admin.nav.employees')}
        </Link>
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 type-h1">{e.full_name}</h1>
              <Badge variant={e.status === 'active' ? 'success' : 'neutral'} dot>
                {t(`employees.status.${e.status as 'active'}`)}
              </Badge>
            </div>
            {e.name_kana ? <p className="m-0 mt-1 text-ink-muted">{e.name_kana}</p> : null}
          </div>
          {office.canEdit ? (
            <EditEmployeeDialog
              id={e.id}
              version={e.version}
              initial={{
                fullName: e.full_name,
                nameKana: e.name_kana ?? '',
                employmentType: e.employment_type as EmploymentType,
                nationality: e.nationality ?? '',
                mobilePhone: e.mobile_phone ?? '',
                hireDate: e.hire_date ?? '',
                dayWage: e.day_wage === 0 ? '' : String(e.day_wage),
                status: e.status as 'active' | 'inactive',
                note: e.note ?? '',
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('employees.data')}</CardTitle>
          </CardHeader>
          <dl className="m-0 grid gap-3 sm:grid-cols-2">
            <Info label={t('employees.fields.employmentType')}>
              {t(`employees.types.${e.employment_type as 'regular'}`)}
            </Info>
            <Info label={t('employees.fields.nationality')}>
              {e.nationality ? (countryName.of(e.nationality) ?? e.nationality) : null}
            </Info>
            <Info label={t('employees.fields.mobilePhone')}>
              {e.mobile_phone ? (
                <span className="type-num">{formatMobilePhone(e.mobile_phone)}</span>
              ) : null}
            </Info>
            <Info label={t('employees.fields.dayWage')}>
              {e.day_wage > 0 ? <span className="type-num">{formatYen(e.day_wage)}</span> : null}
            </Info>
            <Info label={t('employees.fields.hireDate')}>
              {e.hire_date
                ? format.dateTime(new Date(`${e.hire_date}T00:00:00Z`), {
                    dateStyle: 'medium',
                    timeZone: 'UTC',
                  })
                : null}
            </Info>
            {e.note ? <Info label={t('employees.fields.note')}>{e.note}</Info> : null}
          </dl>
        </Card>
        <AccessPanel
          employeeId={e.id}
          name={e.full_name}
          loginId={e.loginId}
          canEdit={office.canEdit}
          active={e.status === 'active'}
        />
      </div>
    </div>
  );
}
