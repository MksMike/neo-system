'use server';

import { ActionError } from '@neo/db';
import { z } from 'zod';
import { defineAction } from '@/server/define-action';
import { getSession, userClient } from '@/server/session';
import { LOCALES } from './config';
import { writeLocaleCookie } from './cookie';

/** Language of a visitor who is not signed in (login page): only this browser (ADR 0020 shape). */
export const setLocale = defineAction({
  name: 'preferences.set_locale',
  schema: z.object({ locale: z.enum(LOCALES) }),
  handler: async ({ locale }) => {
    await writeLocaleCookie(locale);
    return { locale };
  },
});

/**
 * Language of the signed-in person: saved in the profile, so every login opens in it
 * (layer 01), and applied to this browser at once.
 */
export const saveMyLocale = defineAction({
  name: 'preferences.save_my_locale',
  schema: z.object({ locale: z.enum(LOCALES) }),
  handler: async ({ locale }) => {
    const session = await getSession();
    if (!session) throw new ActionError('forbidden', 'not_signed_in');
    const supabase = await userClient();
    const { error } = await supabase.rpc('set_my_locale', { p_locale: locale });
    if (error) throw error;
    await writeLocaleCookie(locale);
    return { locale };
  },
});
