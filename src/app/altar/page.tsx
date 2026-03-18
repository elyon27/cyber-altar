"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AltarSelectionPage() {
  const router = useRouter();
  const [selectedAltar, setSelectedAltar] = useState("al001");

  const altars = useMemo(() => {
    return Array.from({ length: 72 }, (_, index) => {
      const num = String(index + 1).padStart(3, "0");
      return `al${num}`;
    });
  }, []);

  function proceedToHolyPlace() {
    router.push(`/altar/${selectedAltar}`);
  }

  function returnToIntro() {
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-blue-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            Select Your Altar
          </h1>
          <p className="mx-auto max-w-2xl text-white/75">
            Choose one altar image from among the 72 sacred altar pictures
            before entering the Holy Place.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="mb-4 text-center text-xl font-semibold">
            Selected Altar: {selectedAltar}.jpg
          </h2>

          <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-white/15 bg-black/20">
            <img
              src={`/altar/${selectedAltar}.jpg`}
              alt={selectedAltar}
              className="h-[320px] w-full object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={returnToIntro}
              className="rounded-lg border border-white/25 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Return
            </button>

            <button
              onClick={proceedToHolyPlace}
              className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Proceed to the Holy Place
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {altars.map((altar) => {
            const isSelected = altar === selectedAltar;

            return (
              <button
                key={altar}
                type="button"
                onClick={() => setSelectedAltar(altar)}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  isSelected
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-white/15 hover:border-white/40"
                }`}
              >
                <img
                  src={`/altar/${altar}.jpg`}
                  alt={altar}
                  className="h-28 w-full object-cover"
                />
                <div className="bg-white/5 px-2 py-2 text-center text-xs font-medium">
                  {altar}.jpg
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}