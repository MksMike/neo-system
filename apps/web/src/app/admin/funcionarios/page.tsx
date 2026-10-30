import {
  Badge,
  Button,
  EmptyState,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@neo/ui';
import { formatMobilePhone } from '@neo/validation';
import { Plus, Search, Users } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireOffice } from '@/server/office';
import { screenMetadata } from '../screen-placeholder';
import { SectionHeader } from '../section-header';
import { listEmployees } from './data';
import { formatLoginId, missingFields } from './schema';

export const generateMetadata = () => screenMetadata('employees', 'list');

/** Employees of the company, with the app access (8-digit ID) and status (layer 05). */
export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const office = await requireOffice('employees');
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 100).trim() ?? '';
  const [t, locale, employees] = await Promise.all([
    getTranslations(),
    getLocale(),
    listEmployees(office.companyId, q),
  ]);
  const countryName = new Intl.DisplayNames([locale], { type: 'region' });
  const newButton = office.canEdit ? (
    <Button asChild variant="primary">
      <Link href="/admin/funcionarios/novo">
        <Plus aria-hidden />
        {t('employees.new')}
      </Link>
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section="employees" screen="list" actions={newButton} />

      <form
        action="/admin/funcionarios"
        method="get"
        role="search"
        aria-label={t('employees.search')}
        className="flex gap-2"
      >
        <Input
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          placeholder={t('employees.searchPlaceholder')}
          icon={<Search aria-hidden />}
          aria-label={t('employees.search')}
          wrapperClassName="max-w-[420px] flex-1"
        />
        <Button type="submit" variant="secondary">
          {t('clients.searchButton')}
        </Button>
      </form>

      {employees.length === 0 ? (
        <EmptyState
          icon={<Users aria-hidden />}
          title={q ? t('employees.noResults') : t('employees.empty')}
          description={q ? t('employees.noResultsText') : t('employees.emptyText')}
          action={q ? undefined : newButton}
        />
      ) : (
        <Table aria-label={t('admin.nav.employees')}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('employees.fields.fullName')}</TableHeaderCell>
              <TableHeaderCell>{t('employees.fields.employmentType')}</TableHeaderCell>
              <TableHeaderCell>{t('employees.fields.nationality')}</TableHeaderCell>
              <TableHeaderCell>{t('employees.access.loginId')}</TableHeaderCell>
              <TableHeaderCell>{t('employees.fields.mobilePhone')}</TableHeaderCell>
              <TableHeaderCell>{t('employees.fields.status')}</TableHeaderCell>
              <TableHeaderCell>{t('employees.registration')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((e) => {
              const missing = missingFields(e);
              const tone =
                e.status !== 'active' ? 'line-strong' : missing.length > 0 ? 'warning' : 'success';
              return (
                <TableRow key={e.id}>
                  {/* Status bar on the left of the row (R05-07): green = complete, yellow = missing */}
                  <TableCell
                    className="border-l-[6px]"
                    style={{ borderLeftColor: `var(--${tone})` }}
                  >
                    <Link
                      href={`/admin/funcionarios/${e.id}`}
                      className="rounded-xs font-semibold text-primary-text hover:underline focus-visible:outline-2 focus-visible:outline-focus"
                    >
                      {e.full_name}
                    </Link>
                    {e.name_kana ? (
                      <span className="block text-xs text-ink-subtle">{e.name_kana}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`employees.types.${e.employment_type as 'regular'}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {e.nationality ? (countryName.of(e.nationality) ?? e.nationality) : '—'}
                  </TableCell>
                  <TableCell className="type-num whitespace-nowrap">
                    {e.loginId ? (
                      formatLoginId(e.loginId)
                    ) : (
                      <span className="text-ink-subtle">{t('employees.access.noneShort')}</span>
                    )}
                  </TableCell>
                  <TableCell className="type-num whitespace-nowrap">
                    {e.mobile_phone ? formatMobilePhone(e.mobile_phone) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.status === 'active' ? 'success' : 'neutral'} dot>
                      {t(`employees.status.${e.status as 'active'}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {missing.length > 0 ? (
                      <Badge
                        variant="warning"
                        dot
                        title={missing.map((f) => t(`employees.required.${f}`)).join(', ')}
                      >
                        {t('employees.missing', { count: missing.length })}
                      </Badge>
                    ) : (
                      <Badge variant="success" dot>
                        {t('employees.complete')}
                      </Badge>
                    )}
                    {missing.length > 0 ? (
                      <span className="sr-only">
                        {missing.map((f) => t(`employees.required.${f}`)).join(', ')}
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
