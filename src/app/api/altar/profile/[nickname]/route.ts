// ==============================
// File: app/api/altar/profile/[nickname]/route.ts
// ==============================
import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { normalizeNickname, mapProfileRow } from '@/components/cyber-altar/utils';

export async function GET(
  request: Request,
  context: { params: Promise<{ nickname: string }> },
) {
  try {
    const { nickname } = await context.params;
    const decodedNickname = decodeURIComponent(nickname || '').trim();

    if (!decodedNickname) {
      return NextResponse.json({ error: 'Nickname is required.' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('altar_profiles')
      .select('*')
      .ilike('nickname', decodedNickname)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || normalizeNickname(data.nickname) !== normalizeNickname(decodedNickname)) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ profile: mapProfileRow(data) });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch altar profile.' }, { status: 500 });
  }
}