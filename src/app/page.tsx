'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroPage() {

  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const enterHolyPlace = () => {

    if (!name.trim()) {
      alert("Please enter your desired altar name.");
      return;
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    router.push(`/altar/${slug}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-100 text-gray-900 px-6">

      <div className="max-w-xl w-full space-y-6 text-center bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-4xl font-bold text-blue-800">
          Cyber Altar
        </h1>

        <p className="text-gray-600">
          Welcome pilgrim. Enter the name you wish to be known by upon the altar
          and your email address if you desire to be remembered.
        </p>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Your Altar Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300"
          />

          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300"
          />

        </div>

        <button
          onClick={enterHolyPlace}
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Enter The Holy Place
        </button>

      </div>

    </main>
  );
}