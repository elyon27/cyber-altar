// ==============================
// File: app/api/altar/profile/route.ts
// ==============================
import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { mapProfileRow, normalizeNickname } from '@/components/cyber-altar/utils';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const nickname = String(body.nickname || '').trim();
    const prayer = String(body.prayer || '').trim();
    const altarImage = String(body.altarImage || '').trim();

    if (!nickname) {
      return NextResponse.json({ error: 'Nickname is required.' }, { status: 400 });
    }

    if (!prayer) {
      return NextResponse.json({ error: 'Prayer is required.' }, { status: 400 });
    }

    if (!altarImage) {
      return NextResponse.json({ error: 'Altar image is required.' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const { data: existing, error: findError } = await supabase
      .from('altar_profiles')
      .select('id, nickname')
      .ilike('nickname', nickname)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!existing || normalizeNickname(existing.nickname) !== normalizeNickname(nickname)) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('altar_profiles')
      .update({
        prayer,
        altar_image: altarImage,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: mapProfileRow(data) });
  } catch {
    return NextResponse.json({ error: 'Failed to update altar profile.' }, { status: 500 });
  }
}