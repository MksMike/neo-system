'use server';

import { ActionError } from '@neo/db';
import { email, loginPassword, newPassword } from '@neo/validation';
import { z } from 'zod';
import { destinationFor, officeMemberships } from '@/lib/destination';
import { defineAction } from '@/server/define-action';
import { getSession, setActiveCompany, userClient } from '@/server/session';

/** E-mail and password (ADR 0024: no second factor in the MVP). */
export const signIn = defineAction({
  name: 'auth.sign_in',
  schema: z.object({ email, password: loginPassword }),
  handler: async (input, ctx) => {
    const supabase = await userClient();
    const { error } = await supabase.auth.signInWithPassword(input);
    if (error) {
      ctx.log('AUTH.LOGIN.FAILED', { reason: error.code ?? 'unknown' });
      if (error.code === 'over_request_rate_limit' || error.status === 429) {
        throw new ActionError('rate_limited', 'too_many_attempts');
      }
      // Same answer for unknown e-mail and wrong password: no account probing.
      throw new ActionError('validation', 'invalid_credentials');
    }

    const session = await getSession();
    if (!session) throw new ActionError('internal', 'session_missing_after_sign_in');
    const destination = destinationFor(session);
    if ('noAccess' in destination) {
      await supabase.auth.signOut();
      throw new ActionError('forbidden', 'no_access');
    }
    if (destination.companyId) await setActiveCompany(destination.companyId);
    ctx.log('AUTH.LOGIN.SUCCEEDED', { superAdmin: session.isPlatformAdmin });
    return { redirectTo: destination.path };
  },
});

export const signOut = defineAction({
  name: 'auth.sign_out',
  schema: z.object({}),
  handler: async () => {
    const supabase = await userClient();
    await supabase.auth.signOut();
    return { redirectTo: '/login' };
  },
});

/** The invited owner sets the password and accepts the invitation (ADR 0012). */
export const acceptInvitation = defineAction({
  name: 'auth.accept_invitation',
  schema: z
    .object({ password: newPassword, confirm: z.string() })
    .refine((v) => v.password === v.confirm, {
      message: 'validation.passwordMismatch',
      path: ['confirm'],
    }),
  handler: async (input) => {
    const supabase = await userClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new ActionError('forbidden', 'not_signed_in');

    // user_metadata is editable by the user; the database only accepts the invitation sent to this e-mail.
    const invitationId = z.uuid().safeParse(user.user_metadata.invitation_id);
    if (!invitationId.success) throw new ActionError('not_found', 'invitation_not_found');

    const { error: passwordError } = await supabase.auth.updateUser({ password: input.password });
    if (passwordError) {
      if (passwordError.code === 'weak_password')
        throw new ActionError('validation', 'weak_password');
      throw passwordError;
    }

    const { data: companyId, error } = await supabase.rpc('accept_owner_invitation', {
      p_invitation_id: invitationId.data,
    });
    if (error) throw error;
    await setActiveCompany(companyId);
    return { redirectTo: '/admin' };
  },
});

/** Picks the company for the office panel. Only companies where the person has an office role. */
export const selectCompany = defineAction({
  name: 'auth.select_company',
  schema: z.object({ companyId: z.uuid() }),
  handler: async (input) => {
    const session = await getSession();
    if (!session) throw new ActionError('forbidden', 'not_signed_in');
    if (!officeMemberships(session).some((m) => m.company_id === input.companyId)) {
      throw new ActionError('forbidden', 'not_a_member');
    }
    await setActiveCompany(input.companyId);
    return { redirectTo: '/admin' };
  },
});
