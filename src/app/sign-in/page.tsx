'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PasswordSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  useEffect(() => { setEmail(localStorage.getItem('cyber_altar_email') || ''); }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (authError || !data.session) throw new Error('Unable to sign in. Check your account email and password.');
      // The server validates the session and resolves the enrolled name for this account only.
      const response = await fetch('/api/pilgrim/session', {
        headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: 'no-store',
      });
      const identity = await response.json();
      if (!response.ok) throw new Error(identity.error || 'Unable to load your pilgrim details.');
      localStorage.setItem('cyber_altar_email', identity.email);
      localStorage.setItem('cyber_altar_username', identity.name);
      localStorage.removeItem('cyber_altar_selected_altar');
      localStorage.removeItem('cyber_altar_selected_slug');
      setPassword('');
      const next = new URLSearchParams(window.location.search).get('next') || '';
      // Only known internal pages may be resumed after sign-in.
      const destination = /^\/altar\/al\d{3}$/.test(next) || next === '/select-altar' ? next : '/select-altar';
      router.replace(destination);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in. Please try again.');
    } finally {
      inFlight.current = false; setBusy(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
    <section className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/5 p-6 sm:p-8">
      <h1 className="text-3xl font-bold">Sign In With Password</h1>
      <p className="mt-3 text-white/75">Use the email and password already configured for your Cyber-Altar account. No emailed code is needed for this sign-in option.</p>
      <form onSubmit={signIn} className="mt-6 space-y-5" aria-busy={busy}>
        <div><label htmlFor="account-email" className="block text-sm">Account email</label>
          <input id="account-email" type="email" autoComplete="username" required maxLength={254}
            value={email} onChange={event => setEmail(event.target.value)} disabled={busy}
            className="mt-2 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3" /></div>
        <div><label htmlFor="account-password" className="block text-sm">Password</label>
          <input id="account-password" type="password" autoComplete="current-password" required maxLength={1024}
            value={password} onChange={event => setPassword(event.target.value)} disabled={busy}
            className="mt-2 w-full rounded-xl border border-white/20 bg-slate-800 px-4 py-3" /></div>
        {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">{busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <Link href="/" className="mt-6 block text-center underline">Back to Entrance / Use Email Verification</Link>
    </section>
  </main>;
}
