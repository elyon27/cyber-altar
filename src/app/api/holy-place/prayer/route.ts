import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body?.username?.trim();
    const altarSlug = body?.altar_slug?.trim();
    const prayerText = body?.prayer_text?.trim();

    if (!username || !altarSlug || !prayerText) {
      return NextResponse.json(
        { error: 'Missing username, altar_slug, or prayer_text.' },
        { status: 400 }
      );
    }

    let { data: profile, error: profileError } = await supabase
      .from('altar_profiles')
      .select('id, username, altar_slug')
      .eq('username', username)
      .eq('altar_slug', altarSlug)
      .maybeSingle();

    if (profileError) {
      console.error('altar_profiles lookup error:', profileError);
      return NextResponse.json(
        { error: 'Failed to look up pilgrim profile.' },
        { status: 500 }
      );
    }

    if (!profile) {
      const { data: createdProfile, error: createProfileError } = await supabase
        .from('altar_profiles')
        .insert([
          {
            username,
            altar_slug: altarSlug,
          },
        ])
        .select('id, username, altar_slug')
        .single();

      if (createProfileError || !createdProfile) {
        console.error('altar_profiles create error:', createProfileError);
        return NextResponse.json(
          { error: 'Failed to create pilgrim profile for this altar.' },
          { status: 500 }
        );
      }

      profile = createdProfile;
    }

    const { data, error } = await supabase
      .from('altar_prayers')
      .insert([
        {
          profile_id: profile.id,
          username,
          altar_slug: altarSlug,
          prayer_text: prayerText,
        },
      ])
      .select('id, prayer_text, created_at')
      .single();

    if (error) {
      console.error('altar_prayers insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save prayer.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prayer: data,
    });
  } catch (error) {
    console.error('POST /api/holy-place/prayer error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error while saving prayer.' },
      { status: 500 }
    );
  }
}