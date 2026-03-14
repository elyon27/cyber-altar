"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PrayerFormProps = {
  nickname: string;
  altarImage: string;
};

export default function PrayerForm({
  nickname,
  altarImage,
}: PrayerFormProps) {
  const router = useRouter();
  const [prayer, setPrayer] = useState("");

  const handleProceed = () => {
    router.push(
      `/altar/${nickname}/holy-place?altarImage=${encodeURIComponent(
        altarImage
      )}&prayer=${encodeURIComponent(prayer)}`
    );
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-xl">Pilgrim: {nickname}</p>

        <img
          src={altarImage}
          alt="Selected altar"
          className="mb-6 w-full max-w-md rounded-xl border border-white/20"
        />

        <textarea
          value={prayer}
          onChange={(e) => setPrayer(e.target.value)}
          placeholder="Enter your prayer..."
          className="mb-6 min-h-[220px] w-full rounded-xl border border-white/20 bg-neutral-900 p-4 outline-none"
        />

        <button
          type="button"
          onClick={handleProceed}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:opacity-90"
        >
          Proceed to the Holy Place
        </button>
      </div>
    </main>
  );
}