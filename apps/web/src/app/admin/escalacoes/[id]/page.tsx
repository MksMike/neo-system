import { todayInTokyo } from '@neo/validation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireOffice } from '@/server/office';
import { AssignmentBoard } from '../assignment-board';
import { activeEmployees, formOptions, getBoard } from '../data';

interface Props {
  params: Promise<{ id: string }>;
}

async function load(params: Props['params']) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const office = await requireOffice('scheduling');
  const board = await getBoard(office.companyId, id);
  if (!board) notFound();
  return { office, board };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board: a } = await load(params);
  return { title: a.title ?? [a.clientName, a.siteName].filter(Boolean).join(' · ') };
}

/** One assignment, already open (the same card as the calendar). */
export default async function AssignmentPage({ params }: Props) {
  const { office, board } = await load(params);
  const [t, employees, options] = await Promise.all([
    getTranslations(),
    activeEmployees(office.companyId),
    formOptions(office.companyId),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/admin/escalacoes?data=${board.starts_on}`}
        className="inline-flex items-center gap-1.5 self-start rounded-xs text-[13px] font-semibold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t('admin.nav.assignments')}
      </Link>
      <AssignmentBoard
        board={board}
        employees={employees}
        options={options}
        today={todayInTokyo()}
        defaultOpen
      />
    </div>
  );
}
