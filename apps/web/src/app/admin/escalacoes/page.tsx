import { Button, EmptyState } from '@neo/ui';
import { addDays, businessDate, todayInTokyo } from '@neo/validation';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Plus } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireOffice } from '@/server/office';
import { screenMetadata } from '../screen-placeholder';
import { SectionHeader } from '../section-header';
import { AssignmentBoard } from './assignment-board';
import { BulkEditor } from './bulk-editor';
import { activeEmployees, formOptions, listBoards } from './data';

export const generateMetadata = () => screenMetadata('assignments', 'calendar');

/** First and last day of the month of `day`. */
function monthRange(day: string): [string, string] {
  const from = `${day.slice(0, 7)}-01`;
  const [y, m] = from.split('-').map(Number) as [number, number];
  const next =
    m === 12 ? `${String(y + 1)}-01-01` : `${String(y)}-${String(m + 1).padStart(2, '0')}-01`;
  return [from, addDays(next, -1)];
}

/**
 * Calendar (layer 06): the assignments active in the month, each as a card that opens into its days.
 * "Finalizar" (closing, layer 09) comes in the next step.
 */
export default async function AssignmentsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const office = await requireOffice('scheduling');
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const today = todayInTokyo();
  const parsed = businessDate.safeParse(one(params.data));
  const [from, to] = monthRange(parsed.success ? parsed.data : today);

  const [t, locale, boards, employees, options] = await Promise.all([
    getTranslations(),
    getLocale(),
    listBoards(office.companyId, from, to),
    activeEmployees(office.companyId),
    formOptions(office.companyId),
  ]);
  const href = (data: string) => `/admin/escalacoes?data=${data}`;
  const title = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${from}T00:00:00Z`));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        section="assignments"
        screen="calendar"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="primary">
              <Link href="/admin/escalacoes/nova">
                <Plus aria-hidden />
                {t('assignments.new')}
              </Link>
            </Button>
            <Button variant="secondary" disabled title={t('assignments.finalizeSoon')}>
              <ClipboardCheck aria-hidden />
              {t('assignments.finalize')}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t('assignments.calendar.previous')}
          >
            <Link href={href(addDays(from, -1))}>
              <ChevronLeft aria-hidden />
            </Link>
          </Button>
          <h2 className="m-0 min-w-45 text-center type-h3">{title}</h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t('assignments.calendar.next')}
          >
            <Link href={href(addDays(to, 1))}>
              <ChevronRight aria-hidden />
            </Link>
          </Button>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={href(today)}>{t('assignments.calendar.today')}</Link>
        </Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          icon={<CalendarDays aria-hidden />}
          title={t('assignments.emptyRange')}
          description={t('assignments.emptyRangeText')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {boards.map((b) => (
            <AssignmentBoard
              key={b.id}
              board={b}
              employees={employees}
              options={options}
              today={today}
              defaultOpen={boards.length === 1}
            />
          ))}
        </div>
      )}

      {/* Panel 2 (R06-11): bulk editing of a period, below the list of assignments */}
      {boards.length > 0 ? (
        <BulkEditor boards={boards} employees={employees} options={options} />
      ) : null}
    </div>
  );
}
