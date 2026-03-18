// src/app/api/altar-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username');

    if (!username) {
      return NextResponse.json({ altars: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('altar_profiles')
      .select('altar_slug, created_at')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('altar-history error:', error);
      return NextResponse.json({ altars: [] }, { status: 500 });
    }

    return NextResponse.json({ altars: data ?? [] });
  } catch (error) {
    console.error('altar-history route failure:', error);
    return NextResponse.json({ altars: [] }, { status: 500 });
  }
}