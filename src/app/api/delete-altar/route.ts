import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return NextResponse.json({ error: 'Verify your email in the Holy Place before deleting an altar.' }, { status: 401 });
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await db.auth.getUser(authorization.slice(7));
    if (authError || !user?.email_confirmed_at || !user.email) return NextResponse.json({ error: 'Please verify your email again.' }, { status: 401 });
    const { username, altar_slug } = await request.json();
    if (typeof username !== 'string' || typeof altar_slug !== 'string') return NextResponse.json({ error: 'Missing altar details.' }, { status: 400 });
    const { data, error } = await db.rpc('delete_owned_altar', { p_username: username, p_slug: altar_slug });
    if (error || !data) throw error || new Error('No owned altar found.');
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Unable to delete this altar. Your local history has been kept.' }, { status: 500 }); }
}
