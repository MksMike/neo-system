import { ActionError } from '@neo/db';
import type { Db } from '@neo/db/server';
import type { Logger } from '@neo/observability';
import { z } from 'zod';
import type { JobHandler, JobRow } from './runner';

const invitationPayload = z.object({ invitation_id: z.uuid() });

export interface HandlerDeps {
  admin: Db;
  logger: Logger;
  appUrl: string;
}

/**
 * Sends the owner invitation created by provision_company (ADR 0012, outbox).
 * Uses the secret-key client, so every query filters company_id explicitly (CLAUDE.md, rule 1).
 * Running twice is harmless: an invitation that is no longer pending is skipped.
 */
export function sendOwnerInvitation({ admin, logger, appUrl }: HandlerDeps): JobHandler {
  return async (job: JobRow) => {
    if (!job.company_id) throw new ActionError('validation', 'job_without_company');
    const { invitation_id: invitationId } = invitationPayload.parse(job.payload);

    const { data: invitation, error } = await admin
      .from('owner_invitation')
      .select('id, company_id, email, name, status')
      .eq('id', invitationId)
      .eq('company_id', job.company_id)
      .single();
    if (error) throw error;
    if (invitation.status !== 'pending') return;

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(invitation.email, {
      data: {
        display_name: invitation.name,
        invitation_id: invitation.id,
        company_id: invitation.company_id,
      },
      redirectTo: `${appUrl}/convite`,
    });
    if (inviteError) {
      if (inviteError.code !== 'email_exists') throw inviteError;
      // Already has a login: the membership is linked when the invitation is accepted (SA-06).
      logger.log('AUTH.INVITE.EXISTING_USER', {
        route: `job:${job.type}`,
        companyId: invitation.company_id,
        data: { invitationId: invitation.id },
      });
    }

    const { error: updateError } = await admin
      .from('owner_invitation')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', invitation.id)
      .eq('company_id', invitation.company_id)
      .eq('status', 'pending');
    if (updateError) throw updateError;
  };
}

/** Every job type the server knows how to run. A type missing here is logged as JOB.HANDLER.MISSING. */
export function createHandlers(deps: HandlerDeps): Record<string, JobHandler> {
  return {
    'owner_invitation.send': sendOwnerInvitation(deps),
  };
}
