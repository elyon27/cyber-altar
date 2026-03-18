'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CyberAltarIntro() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleEnter = () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
      alert('Please enter your nickname.');
      return;
    }

    localStorage.setItem('cyber_altar_username', trimmedUsername);
    localStorage.setItem('cyber_altar_email', trimmedEmail);
    localStorage.removeItem('cyber_altar_selected_altar');

    router.push('/select-altar');
  };

  return (
    <main className="min-h-screen bg-blue-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-10">
        <div className="w-full rounded-3xl border border-white/15 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-4xl font-bold">Cyber Altar</h1>
          <p className="mt-3 text-white/80">
            Enter your pilgrim name and email to begin your journey into the Holy Place.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Pilgrim Nickname
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your nickname"
                className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-amber-400"
              />
            </div>

            <button
              type="button"
              onClick={handleEnter}
              className="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90"
            >
              Enter the Holy Place
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}