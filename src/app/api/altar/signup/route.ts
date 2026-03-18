// ==============================
// File: app/api/altar/signup/route.ts
// ==============================
import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { normalizeNickname, mapProfileRow } from '@/components/cyber-altar/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nickname = String(body.nickname || '').trim();
    const email = String(body.email || '').trim();

    if (!nickname) {
      return NextResponse.json({ error: 'Nickname is required.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    const { data: existing, error: existingError } = await supabase
      .from('altar_profiles')
      .select('id, nickname')
      .ilike('nickname', nickname)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing && normalizeNickname(existing.nickname) === normalizeNickname(nickname)) {
      return NextResponse.json(
        { error: 'This nickname already exists. Please choose a new nickname.' },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from('altar_profiles')
      .insert({
        nickname,
        email,
        prayer: '',
        altar_image: '/altar/altar-01.jpg',
        total_lights: 0,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: mapProfileRow(data) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create altar profile.' }, { status: 500 });
  }
}