import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('altar_slug') || '';
  if (!/^al\d{3}$/.test(slug)) return NextResponse.json({ error: 'Invalid altar.' }, { status: 400 });
  try {
    const { count, error } = await createAdminSupabaseClient().from('altar_prayers').select('id', { count: 'exact', head: true }).eq('altar_slug', slug);
    if (error) throw error;
    return NextResponse.json({ count: count || 0 }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Unable to count prayers.' }, { status: 503 }); }
}
