import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type BadgeProps,
} from '@neo/ui';
import { getTranslations } from 'next-intl/server';
import { type CompanyRow, getUsers } from '../data';
import { getDateFormat } from '../format';
import { SectionTitle } from '../parts';

const INVITATION_BADGE: Record<string, BadgeProps['variant']> = {
  pending: 'warning',
  sent: 'info',
  accepted: 'success',
  failed: 'danger',
};

/** People with access to the company and the owner invitations (R00-19: no limit of admins). */
export async function UsersTab({ company }: { company: CompanyRow }) {
  const [t, fmt, users] = await Promise.all([
    getTranslations(),
    getDateFormat(),
    getUsers(company.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4" aria-labelledby="users-members">
        <SectionTitle>
          <span id="users-members">{t('super.company.users.members')}</span>
        </SectionTitle>
        {users.members.length === 0 ? (
          <p className="m-0 text-sm text-ink-subtle">{t('super.company.users.noMembers')}</p>
        ) : (
          <Table aria-label={t('super.company.users.members')}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('super.company.users.name')}</TableHeaderCell>
                <TableHeaderCell>{t('super.company.users.role')}</TableHeaderCell>
                <TableHeaderCell>{t('super.companies.columns.status')}</TableHeaderCell>
                <TableHeaderCell>{t('super.company.users.since')}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.name ?? '—'}</TableCell>
                  <TableCell>{t(`auth.roles.${m.role as 'owner'}`)}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === 'active' ? 'success' : 'neutral'} dot>
                      {t(`super.company.users.memberStatus.${m.status as 'active'}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="type-num whitespace-nowrap">
                    {fmt.instant(m.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="users-invitations">
        <SectionTitle>
          <span id="users-invitations">{t('super.company.users.invitations')}</span>
        </SectionTitle>
        {users.invitations.length === 0 ? (
          <p className="m-0 text-sm text-ink-subtle">{t('super.company.users.noInvitations')}</p>
        ) : (
          <Table aria-label={t('super.company.users.invitations')}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('super.company.users.name')}</TableHeaderCell>
                <TableHeaderCell>{t('super.company.users.email')}</TableHeaderCell>
                <TableHeaderCell>{t('super.companies.columns.status')}</TableHeaderCell>
                <TableHeaderCell>{t('super.company.users.sentAt')}</TableHeaderCell>
                <TableHeaderCell>{t('super.company.users.acceptedAt')}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.invitations.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.name}</TableCell>
                  <TableCell className="break-all">{i.email}</TableCell>
                  <TableCell>
                    <Badge variant={INVITATION_BADGE[i.status] ?? 'neutral'} dot>
                      {t(`super.company.users.invitationStatus.${i.status as 'pending'}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="type-num whitespace-nowrap">
                    {fmt.instant(i.sent_at)}
                  </TableCell>
                  <TableCell className="type-num whitespace-nowrap">
                    {fmt.instant(i.accepted_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
