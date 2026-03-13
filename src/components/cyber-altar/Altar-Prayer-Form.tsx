"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  altarImage: string;
  nickname: string;
};

export default function PrayerForm({ slug, altarImage, nickname }: Props) {
  const router = useRouter();
  const [prayer, setPrayer] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!prayer.trim()) {
      alert("Please enter your prayer.");
      return;
    }

    const params = new URLSearchParams({
      altarImage,
      prayer,
    });

    router.push(`/altar/${slug}/holy-place?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-white">Prayer Form</h2>
        <p className="mt-2 text-sm text-white/70">
          Pilgrim: <span className="font-medium text-white">{nickname}</span>
        </p>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-white/10">
        <img
          src={altarImage}
          alt="Selected altar"
          className="h-72 w-full object-cover"
        />
      </div>

      <label className="mb-2 block text-sm font-medium text-white">
        Enter your prayer
      </label>
      <textarea
        value={prayer}
        onChange={(e) => setPrayer(e.target.value)}
        rows={8}
        placeholder="Write your prayer here..."
        className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none placeholder:text-white/40"
      />

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
        >
          Proceed to the Holy Place
        </button>
      </div>
    </form>
  );
}