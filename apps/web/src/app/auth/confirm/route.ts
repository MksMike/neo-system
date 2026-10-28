import { NextResponse, type NextRequest } from 'next/server';
import { userClient } from '@/server/session';

/**
 * Link of the invitation e-mail (supabase/templates/invite.html). The token is verified on
 * the server (SSR pattern), which sets the session cookie, then the person sets a password.
 * Only invitations are accepted here.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const fail = NextResponse.redirect(new URL('/login?erro=link_invalid', request.url));

  if (!tokenHash || type !== 'invite') return fail;

  const supabase = await userClient();
  const { error } = await supabase.auth.verifyOtp({ type: 'invite', token_hash: tokenHash });
  if (error) return fail;
  return NextResponse.redirect(new URL('/convite', request.url));
}
