'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CyberAltarIntro() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleEnter = () => {
    if (!username) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('cyber_altar_username', username);
      localStorage.setItem('cyber_altar_email', email);
    }

    router.push('/select-altar');
  };

  const handlePrayerWall = () => {
    router.push('/prayer-wall');
  };

  const handleReturnToCrownMind = () => {
    window.location.href = 'https://crownmind.netlify.app/';
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2e4a9e] px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-[#324ea3] p-10 shadow-xl">

        {/* TITLE */}

        <h1 className="text-4xl font-bold text-white">
          Cyber Altar
        </h1>

        <p className="mt-3 text-white/80">
          Enter your pilgrim name and email to begin your journey into the Holy Place.
        </p>

        <div className="mt-8 space-y-6">

          {/* USERNAME */}

          <div>
            <label className="text-sm text-white/80">
              Pilgrim Nickname
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your nickname"
              className="mt-2 w-full rounded-xl bg-[#1c2e63] px-4 py-3 text-white outline-none"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="text-sm text-white/80">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-2 w-full rounded-xl bg-[#1c2e63] px-4 py-3 text-white outline-none"
            />
          </div>

          {/* ENTER HOLY PLACE */}

          <button
            onClick={handleEnter}
            className="mt-4 w-full rounded-xl bg-amber-500 py-4 text-lg font-semibold text-black transition hover:bg-amber-400"
          >
            Enter the Holy Place
          </button>

          {/* PRAYER WALL INFO */}

          <p className="text-center text-xs text-white/60">
            or observe the prayers offered by pilgrims around the world
          </p>

          {/* VIEW PRAYER WALL */}

          <button
            onClick={handlePrayerWall}
            className="w-full rounded-xl bg-cyan-500 py-3 text-white font-semibold transition hover:bg-cyan-400"
          >
            View Public Prayer Wall
          </button>

          {/* RETURN TO CROWNMIND */}

          <button
            onClick={handleReturnToCrownMind}
            className="w-full rounded-xl border border-white/30 py-3 text-white transition hover:bg-white/10"
          >
            Return To CrownMind
          </button>

        </div>
      </div>
    </main>
  );
}