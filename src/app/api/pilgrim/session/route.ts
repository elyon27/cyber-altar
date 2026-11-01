import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const respond = (body: unknown, status = 200) => NextResponse.json(body, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return respond({ error: 'Please sign in first.' }, 401);
    const db = createAdminSupabaseClient();
    const { data: { user }, error: authError } = await db.auth.getUser(authorization.slice(7));
    if (authError || !user?.email || !user.email_confirmed_at) {
      return respond({ error: 'Please sign in with a confirmed email account.' }, 401);
    }
    // Resolve only the verified account's identity; never trust a supplied email or name.
    const email = user.email.trim().toLowerCase();
    const { data, error } = await db.rpc('cyber_altar_onboarding', { p_email: email, p_action: 'lookup' });
    if (error) return respond({ error: 'Unable to load your pilgrim details. Please try again.' }, 503);
    if (!data?.exists || !data?.name) {
      return respond({ error: 'Your account is signed in. Return to the entrance to enroll this email and choose a Pilgrim Name, then sign in again.' }, 409);
    }
    return respond({ email, name: data.name });
  } catch {
    return respond({ error: 'Unable to load your pilgrim details. Please try again.' }, 503);
  }
}
