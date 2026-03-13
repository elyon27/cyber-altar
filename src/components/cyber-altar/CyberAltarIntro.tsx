"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CyberAltarIntro() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");

  function enterAltar() {
    if (!nickname.trim()) {
      alert("Enter your pilgrim name.");
      return;
    }

    router.push(`/altar/${nickname}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-950 text-white">
      <div className="max-w-xl text-center">

        <h1 className="text-5xl font-bold mb-6">
          Cyber Altar
        </h1>

        <p className="text-white/70 mb-6">
          A quiet digital sanctuary where pilgrims may inscribe a name,
          lift a prayer, and light a candle in devotion.
        </p>

        <input
          className="w-full rounded-lg p-3 text-black mb-4"
          placeholder="Enter your pilgrim name"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <button
          onClick={enterAltar}
          className="bg-yellow-500 px-6 py-3 rounded-lg text-black font-semibold"
        >
          Enter The Holy Place
        </button>

      </div>
    </main>
  );
}