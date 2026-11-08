import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export async function DELETE(request: Request) {
  const respond = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return respond({ error: 'Please sign in first.' }, 401);
    const db = createAdminSupabaseClient();
    const { data: { user }, error: authError } = await db.auth.getUser(authorization.slice(7));
    if (authError || !user?.email_confirmed_at || !user.email) return respond({ error: 'Please sign in again.' }, 401);
    const body = await request.json();
    if (body.confirmation !== 'DELETE') return respond({ error: 'Type DELETE to confirm permanent account deletion.' }, 400);
    // The database trigger deletes all linked data in the same transaction as the Auth user.
    // Never accept a target ID, email, or pilgrim name from the caller.
    const { error } = await db.auth.admin.deleteUser(user.id, false);
    if (error) { console.error('Account deletion failed:', error.code); return respond({ error: 'Unable to delete your account. Please try again.' }, 503); }
    return respond({ success: true });
  } catch { return respond({ error: 'Unable to delete your account. Please try again.' }, 503); }
}
