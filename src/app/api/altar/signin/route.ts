// ==============================
// File: app/api/altar/signin/route.ts
// ==============================
import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { normalizeNickname, mapProfileRow } from '@/components/cyber-altar/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nickname = String(body.nickname || '').trim();

    if (!nickname) {
      return NextResponse.json({ error: 'Nickname is required.' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('altar_profiles')
      .select('*')
      .ilike('nickname', nickname)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || normalizeNickname(data.nickname) !== normalizeNickname(nickname)) {
      return NextResponse.json({ error: 'Nickname not found in the altar records.' }, { status: 404 });
    }

    return NextResponse.json({ profile: mapProfileRow(data) });
  } catch {
    return NextResponse.json({ error: 'Failed to sign in.' }, { status: 500 });
  }
}