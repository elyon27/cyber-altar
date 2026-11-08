import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const db = createAdminSupabaseClient();
    // Legacy registry rows can outlive an account. Never display them without
    // a current Auth account; identifiers stay entirely on the server.
    const activeEmails = new Set<string>();
    for (let page = 1; ; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      for (const user of data.users) {
        if (user.email && !user.deleted_at) activeEmails.add(user.email.trim().toLowerCase());
      }
      if (data.users.length < 1000) break;
    }
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
          if (!name || !email || !activeEmails.has(email)) continue;
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
