import { Card, CardHeader, CardTitle } from '@neo/ui';
import { addDays, todayInTokyo } from '@neo/validation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { requireOffice } from '@/server/office';
import { ChainSwatch } from '../../clientes/chain-chips';
import { CalendarGrid } from '../calendar-grid';
import { activeEmployees, formOptions, getAssignment, getCalendar, listMembers } from '../data';
import { EditAssignmentDialog } from '../edit-assignment-dialog';
import { MembersPanel } from '../members-panel';
import { plannedDays, shortTime } from '../schema';

interface Props {
  params: Promise<{ id: string }>;
}

async function load(params: Props['params']) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const office = await requireOffice('scheduling');
  const assignment = await getAssignment(office.companyId, id);
  if (!assignment) notFound();
  return { office, assignment };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { assignment: a } = await load(params);
  return { title: a.title ?? [a.clientName, a.siteName].filter(Boolean).join(' · ') };
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="m-0 text-sm break-words">{children ?? '—'}</dd>
    </div>
  );
}

/** An assignment: its data, the employees allocated and the grid of its days (like the 勤怠表). */
export default async function AssignmentPage({ params }: Props) {
  const { office, assignment: a } = await load(params);
  // The grid shows up to 62 days from the start (the calendar range limit).
  const gridEnd = a.ends_on < addDays(a.starts_on, 61) ? a.ends_on : addDays(a.starts_on, 61);
  const [t, locale, members, employees, options, entries] = await Promise.all([
    getTranslations(),
    getLocale(),
    listMembers(office.companyId, a.id),
    activeEmployees(office.companyId),
    formOptions(office.companyId),
    getCalendar(office.companyId, a.starts_on, gridEnd, a.id),
  ]);
  const today = todayInTokyo();
  const days: string[] = [];
  for (let d = a.starts_on; d <= gridEnd; d = addDays(d, 1)) days.push(d);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  const date = (d: string) => dateFormat.format(new Date(`${d}T00:00:00Z`));
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const workDays = a.work_days
    .map((n) => weekday.format(new Date(`2024-01-0${String(n)}T00:00:00Z`)))
    .join(' ');
  const formatDate = Object.fromEntries(
    members.flatMap((m) => [
      [m.startsOn, date(m.startsOn)],
      [m.endsOn, date(m.endsOn)],
    ]),
  );
  const heading = a.title ?? [a.clientName, a.siteName].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/admin/escalacoes?vista=mes&data=${a.starts_on}`}
          className="inline-flex items-center gap-1.5 self-start rounded-xs text-[13px] font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t('admin.nav.assignments')}
        </Link>
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="m-0 type-h1">{heading}</h1>
            <p className="type-num m-0 mt-1 text-ink-muted">
              {date(a.starts_on)} – {date(a.ends_on)} · {shortTime(a.start_time)}–
              {shortTime(a.end_time)}
            </p>
          </div>
          <EditAssignmentDialog
            id={a.id}
            version={a.version}
            options={options}
            today={today}
            initial={{
              clientId: a.client_id,
              chainId: a.chain_id ?? '',
              siteId: a.site_id ?? '',
              title: a.title ?? '',
              startsOn: a.starts_on,
              endsOn: a.ends_on,
              startTime: shortTime(a.start_time),
              endTime: shortTime(a.end_time),
              breakMinutes: String(a.break_minutes),
              workDays: a.work_days,
              meetingPlace: a.meeting_place ?? '',
              meetingTime: shortTime(a.meeting_time),
              note: a.note ?? '',
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('assignments.data')}</CardTitle>
        </CardHeader>
        <dl className="m-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label={t('assignments.fields.client')}>{a.clientName}</Info>
          <Info label={t('assignments.fields.chain')}>
            {a.chain ? (
              <span className="inline-flex items-center gap-1.5">
                <ChainSwatch color={a.chain.color} />
                {a.chain.abbreviation} · {a.chain.name}
              </span>
            ) : null}
          </Info>
          <Info label={t('assignments.fields.site')}>{a.siteName}</Info>
          <Info label={t('assignments.fields.workDays')}>{workDays}</Info>
          <Info label={t('assignments.fields.break')}>
            {t('assignments.minutesValue', { count: a.break_minutes })}
          </Info>
          <Info label={t('assignments.fields.meetingPlace')}>
            {a.meeting_place || a.meeting_time
              ? [a.meeting_place, shortTime(a.meeting_time)].filter(Boolean).join(' · ')
              : null}
          </Info>
          <Info label={t('assignments.plannedLabel')}>
            {t('assignments.plannedDays', {
              count: plannedDays(a.starts_on, a.ends_on, a.work_days),
            })}
          </Info>
          {a.note ? <Info label={t('assignments.fields.note')}>{a.note}</Info> : null}
        </dl>
      </Card>

      <MembersPanel
        assignmentId={a.id}
        period={{ startsOn: a.starts_on, endsOn: a.ends_on }}
        members={members}
        employees={employees}
        canEdit
        formatDate={formatDate}
      />

      <section aria-labelledby="assignment-grid" className="flex flex-col gap-3">
        <h2 id="assignment-grid" className="m-0 type-h3">
          {t('assignments.grid')}
        </h2>
        <CalendarGrid
          days={days}
          entries={entries}
          locale={locale}
          today={today}
          labels={{
            employee: t('assignments.members.employee'),
            off: t('assignments.calendar.off'),
            empty: t('assignments.members.empty'),
            caption: t('assignments.grid'),
          }}
        />
      </section>
    </div>
  );
}
