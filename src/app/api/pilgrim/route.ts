import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const respond = (body: unknown, status = 200) =>
    NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const expectedName = typeof body.expectedName === 'string' ? body.expectedName : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond({ error: 'Please enter a valid email address.' }, 400);
    }
    if (!['lookup', 'register', 'continue', 'rename'].includes(body.action)) {
      return respond({ error: 'Invalid onboarding action.' }, 400);
    }
    if (['register', 'rename'].includes(body.action) && (!name || name.length > 80)) {
      return respond({ error: 'Please enter a Pilgrim Name of 1 to 80 characters.' }, 400);
    }
    const db = createAdminSupabaseClient();
    const { data, error } = await db.rpc('cyber_altar_onboarding', {
      p_email: email, p_action: body.action, p_name: name, p_expected_name: expectedName,
    });
    if (error) {
      if (error.code === 'P0001') return respond({ error: error.message }, 409);
      console.error('Pilgrim onboarding database error:', error.code);
      return respond({ error: 'Unable to check or save your details. Please try again. If this continues, ask the site owner to complete the onboarding database setup.' }, 503);
    }
    return respond(data);
  } catch {
    return respond({ error: 'Unable to process your details. Please try again.' }, 503);
  }
}
