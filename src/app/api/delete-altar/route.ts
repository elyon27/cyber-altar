import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { username, altar_slug } = await req.json()

    if (!username || !altar_slug) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // 🔥 DELETE PRAYERS FIRST
    await supabase
      .from('altar_prayers')
      .delete()
      .eq('username', username)
      .eq('altar_slug', altar_slug)

    // 🔥 DELETE PROFILE (candles)
    await supabase
      .from('altar_profiles')
      .delete()
      .eq('username', username)
      .eq('altar_slug', altar_slug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}