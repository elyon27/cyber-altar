import { supabase } from '@/lib/supabase';

function storageKey(email: string, slug: string) {
  return JSON.stringify(['cyber_altar_dedication', email, slug]);
}

export function readLocalDedications(slugs: string[], ownerEmail?: string): Record<string, string> {
  try {
    const email = ownerEmail ?? localStorage.getItem('cyber_altar_email')?.trim().toLowerCase();
    if (!email) return {};
    return Object.fromEntries(slugs.map(slug => [slug, localStorage.getItem(storageKey(email, slug)) ?? '']));
  } catch {
    return {};
  }
}

async function dedicationOwner() {
  const email = localStorage.getItem('cyber_altar_email')?.trim().toLowerCase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email_confirmed_at || !email || user.email?.trim().toLowerCase() !== email) {
    throw new Error('Verify your email to sync altar dedications.');
  }
  return email;
}

export async function loadDedications(slugs: string[]) {
  if (!slugs.length) return {};
  const email = await dedicationOwner();
  const { data, error } = await supabase.from('altar_dedications').select('altar_slug, dedicatee')
    .eq('owner_email', email).in('altar_slug', slugs);
  if (error) throw error;
  return Object.fromEntries((data ?? []).map(row => [row.altar_slug, row.dedicatee]));
}

export async function saveDedication(slug: string, dedicatee: string) {
  const email = await dedicationOwner();
  const { error } = await supabase.from('altar_dedications')
    .upsert({ owner_email: email, altar_slug: slug, dedicatee }, { onConflict: 'owner_email,altar_slug' });
  if (error) throw error;
  try { localStorage.setItem(storageKey(email, slug), dedicatee); } catch { /* The server copy is saved. */ }
  window.dispatchEvent(new Event('altar-dedication-saved'));
}
