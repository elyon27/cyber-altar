'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

type Stage = 'email' | 'new' | 'returning' | 'rename';

export default function CyberAltarIntro() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [stage, setStage] = useState<Stage>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const normalizedEmail = email.trim().toLowerCase();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    const action = stage === 'email' ? 'lookup' : stage === 'new' ? 'register' : stage === 'rename' ? 'rename' : 'continue';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/pilgrim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        cache: 'no-store', signal: controller.signal,
        body: JSON.stringify({ email: normalizedEmail, name, expectedName: savedName, action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to check your email. Please try again.');
      if (action === 'lookup') {
        setSavedName(result.name || '');
        setName(result.name || '');
        setStage(result.exists ? 'returning' : 'new');
      } else {
        // Persist the confirmed name before navigating; never navigate on a failed save.
        localStorage.setItem('cyber_altar_username', result.name);
        localStorage.setItem('cyber_altar_email', normalizedEmail);
        localStorage.removeItem('cyber_altar_selected_altar');
        setSavedName(result.name);
        setName(result.name);
        setStage('returning');
        router.push('/select-altar');
      }
    } catch (reason) {
      setError(reason instanceof Error && reason.name === 'AbortError'
        ? 'The request took too long. Check your email again before retrying.'
        : reason instanceof Error ? reason.message : 'Unable to continue. Please try again.');
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
      setBusy(false);
    }
  }

  const inputClass = 'mt-2 w-full rounded-xl bg-[#1c2e63] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-70';
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2e4a9e] px-6 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-[#324ea3] p-8 shadow-xl sm:p-10">
        <h1 className="text-4xl font-bold text-white">Cyber Altar</h1>
        <p className="mt-3 text-white/80">Enter your email address to begin or return to your journey into the Holy Place.</p>
        <form onSubmit={submit} className="mt-8 space-y-6" aria-busy={busy}>
          <div>
            <label htmlFor="pilgrim-email" className="text-sm text-white/80">Email Address</label>
            <input id="pilgrim-email" type="email" autoComplete="email" required maxLength={254}
              value={email} disabled={busy} readOnly={stage !== 'email'}
              onChange={(event) => { setEmail(event.target.value); setError(''); }}
              placeholder="Enter your email" className={inputClass} />
            {stage !== 'email' && <button type="button" disabled={busy}
              onClick={() => { setStage('email'); setName(''); setSavedName(''); setError(''); }}
              className="mt-2 text-sm text-white underline disabled:opacity-50">Use a different email address</button>}
          </div>

          {stage === 'returning' && <div aria-live="polite" className="rounded-xl bg-[#1c2e63] p-4 text-white">
            <p className="text-sm text-white/80">Welcome back. Your Pilgrim Name</p>
            <p className="mt-2 break-words text-xl font-semibold">{savedName}</p>
            <button type="button" disabled={busy} onClick={() => { setName(savedName); setStage('rename'); setError(''); }}
              className="mt-4 rounded-lg border border-white/40 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50">Change Pilgrim Name</button>
          </div>}

          {(stage === 'new' || stage === 'rename') && <div>
            <p className="mb-3 text-sm text-white/80">{stage === 'new' ? 'Welcome! This email is not enrolled yet. Please choose your Pilgrim Name.' : 'Enter the Pilgrim Name you would like to use.'}</p>
            <label htmlFor="pilgrim-name" className="text-sm text-white/80">Pilgrim Name</label>
            <input id="pilgrim-name" type="text" autoComplete="nickname" autoFocus required maxLength={80}
              value={name} disabled={busy} onChange={(event) => setName(event.target.value)}
              placeholder="Enter your Pilgrim Name" className={inputClass} />
            {stage === 'rename' && <button type="button" disabled={busy}
              onClick={() => { setName(savedName); setStage('returning'); setError(''); }}
              className="mt-2 text-sm text-white underline">Cancel name change</button>}
          </div>}

          {error && <p role="alert" className="rounded-xl border border-red-200/40 bg-red-950/40 p-3 text-sm text-white">{error}</p>}
          <button type="submit" disabled={busy || (stage !== 'email' && !name.trim())}
            className="w-full rounded-xl bg-amber-500 py-4 text-lg font-semibold text-black transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">
            {busy ? stage === 'email' ? 'Checking email...' : 'Saving your details...' : stage === 'email' ? 'Check Email Address' : stage === 'rename' ? 'Save Name and Enter the Holy Place' : 'Enter the Holy Place'}
          </button>
        </form>
        <div className="mt-6 space-y-6">
          <p className="text-center text-xs text-white/60">or observe the prayers offered by pilgrims around the world</p>
          <button type="button" onClick={() => router.push('/prayer-wall')} className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400">View Public Prayer Wall</button>
          <a href="https://crownmind.netlify.app/" className="block w-full rounded-xl border border-white/30 py-3 text-center text-white transition hover:bg-white/10">Return To CrownMind</a>
        </div>
      </div>
    </main>
  );
}
