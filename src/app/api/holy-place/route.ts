import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim();
    const altarSlug = searchParams.get('altar_slug')?.trim();

    if (!username || !altarSlug) {
      return NextResponse.json(
        { error: 'Missing username or altar_slug.' },
        { status: 400 }
      );
    }

    const { data: prayers, error: prayersError } = await supabase
      .from('altar_prayers')
      .select('id, prayer_text, created_at')
      .eq('username', username)
      .eq('altar_slug', altarSlug)
      .order('created_at', { ascending: false });

    if (prayersError) {
      console.error('altar_prayers load error:', prayersError);
      return NextResponse.json(
        { error: 'Failed to load prayer records.' },
        { status: 500 }
      );
    }

    const { count, error: candlesError } = await supabase
      .from('altar_candles')
      .select('*', { count: 'exact', head: true })
      .eq('username', username)
      .eq('altar_slug', altarSlug);

    if (candlesError) {
      console.error('altar_candles count error:', candlesError);
      return NextResponse.json(
        { error: 'Failed to load candle count.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prayers: prayers ?? [],
      candleCount: count ?? 0,
    });
  } catch (error) {
    console.error('GET /api/holy-place error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error while loading Holy Place.' },
      { status: 500 }
    );
  }
}