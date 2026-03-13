"use client";

import { useState } from "react";
import HolyPlace from "@/components/cyber-altar/HolyPlace";

type PrayerClientProps = {
  nickname: string;
  altarImage: string;
};

export default function PrayerClient({
  nickname,
  altarImage,
}: PrayerClientProps) {
  const [prayer, setPrayer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <HolyPlace
        nickname={nickname}
        prayer={prayer}
        altarImage={altarImage}
      />
    );
  }

  return (
    <main className="min-h-screen bg-blue-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-blue-700/60 bg-blue-900/40 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.4em] text-blue-200/80">
            Cyber Altar
          </p>
          <h1 className="text-4xl font-bold">Prayer Form</h1>
          <p className="mt-3 text-blue-100/75">
            Write the prayer you wish to lay before the altar.
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-blue-200/80">Pilgrim name on the altar:</p>
          <p className="text-xl font-semibold text-yellow-300">{nickname}</p>
        </div>

        <label className="mb-2 block text-sm text-blue-200">Your Prayer</label>
        <textarea
          value={prayer}
          onChange={(e) => setPrayer(e.target.value)}
          placeholder="Write the prayer you wish to lay before the altar..."
          rows={8}
          className="w-full rounded-2xl border border-blue-700 bg-blue-950/70 px-4 py-3 outline-none placeholder:text-blue-300/60"
        />

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (!prayer.trim()) {
                alert("Please write your prayer first.");
                return;
              }
              setSubmitted(true);
            }}
            className="rounded-full bg-yellow-500 px-8 py-3 text-sm font-semibold text-blue-950 transition hover:bg-yellow-400"
          >
            Proceed to the Holy Place
          </button>
        </div>
      </div>
    </main>
  );
}