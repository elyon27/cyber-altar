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

    if (!username || !altarSlug) {
      return NextResponse.json(
        { error: 'Missing username or altar_slug.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('altar_candles')
      .insert([
        {
          username,
          altar_slug: altarSlug,
        },
      ])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('altar_candles insert error:', error);
      return NextResponse.json(
        { error: 'Failed to light candle.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      candle: data,
    });
  } catch (error) {
    console.error('POST /api/holy-place/candle error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error while lighting candle.' },
      { status: 500 }
    );
  }
}