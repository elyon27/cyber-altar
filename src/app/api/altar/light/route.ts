// ==============================
// File: app/api/altar/light/route.ts
// ==============================
import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { CANDLE_DURATION_MS } from '@/components/cyber-altar/constants';
import { mapProfileRow, normalizeNickname } from '@/components/cyber-altar/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nickname = String(body.nickname || '').trim();

    if (!nickname) {
      return NextResponse.json({ error: 'Nickname is required.' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data: existing, error: findError } = await supabase
      .from('altar_profiles')
      .select('*')
      .ilike('nickname', nickname)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!existing || normalizeNickname(existing.nickname) !== normalizeNickname(nickname)) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    const litAt = new Date();
    const expireAt = new Date(litAt.getTime() + CANDLE_DURATION_MS);

    const { data, error } = await supabase
      .from('altar_profiles')
      .update({
        candle_lit_at: litAt.toISOString(),
        candle_expire_at: expireAt.toISOString(),
        total_lights: (existing.total_lights || 0) + 1,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: mapProfileRow(data) });
  } catch {
    return NextResponse.json({ error: 'Failed to light candle.' }, { status: 500 });
  }
}