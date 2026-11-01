import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const db = createAdminSupabaseClient();
    const pilgrims = new Map<string, string>();
    // Registry names take precedence over legacy altar registrations.
    for (const source of [
      { table: 'cyber_altar_pilgrims', name: 'pilgrim_name', order: 'email' },
      { table: 'altar_profiles', name: 'username', order: 'id' },
    ]) {
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from(source.table)
          .select(`email,${source.name}`).order(source.order).range(offset, offset + 499);
        if (error) throw error;
        for (const item of data ?? []) {
          const row = item as unknown as Record<string, unknown>;
          const name = typeof row[source.name] === 'string' ? (row[source.name] as string).trim() : '';
          const email = typeof row.email === 'string' ? row.email.trim().toLowerCase() : '';
          if (!name) continue;
          const key = email ? `email:${email}` : `name:${name.toLowerCase()}`;
          if (!pilgrims.has(key)) pilgrims.set(key, name);
        }
        if (!data || data.length < 500) break;
      }
    }
    // Return display names only; account identifiers remain on the server.
    return NextResponse.json({ pilgrims: Array.from(pilgrims.values()).sort((a, b) => a.localeCompare(b)) }, { headers });
  } catch {
    return NextResponse.json({ error: 'Unable to load the pilgrims. Please try again.' }, { status: 503, headers });
  }
}
