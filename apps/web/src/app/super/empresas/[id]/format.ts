import 'server-only';
import { getFormatter } from 'next-intl/server';
import { businessDateValue } from '../status';

/** Business dates are calendar days (UTC midnight); instants are shown in Asia/Tokyo (CLAUDE.md rule 7). */
export async function getDateFormat() {
  const format = await getFormatter();
  return {
    date: (value: string | null) =>
      value
        ? format.dateTime(businessDateValue(value), { dateStyle: 'medium', timeZone: 'UTC' })
        : '—',
    instant: (value: string | null) =>
      value
        ? format.dateTime(new Date(value), {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Tokyo',
          })
        : '—',
  };
}
