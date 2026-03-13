"use client";

import Image from "next/image";

type HolyPlaceProps = {
  currentUser: any
  nickname: string;
  prayer: string;
  altarImage: string;
};

export default function HolyPlace({
  nickname,
  prayer,
  altarImage,
}: HolyPlaceProps) {
  currentUser: any
  crossImage: string
  candleActive: boolean
  candleHeightPercent: number
  
  return (
    <main className="min-h-screen bg-blue-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl rounded-3xl border border-blue-700/60 bg-blue-900/40 p-6 shadow-2xl backdrop-blur md:p-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.4em] text-blue-200/80">
            Cyber Altar
          </p>
          <h1 className="text-4xl font-bold md:text-5xl">The Holy Place</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-blue-100/75 md:text-base">
            A quiet digital sanctuary where remembrance, prayer, and devotion
            are laid before the light.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)_220px]">
          <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6 text-center">
            <h2 className="mb-4 text-lg font-semibold text-blue-100">
              The Cross
            </h2>
            <div className="relative mx-auto h-72 w-full max-w-[180px]">
              <Image
                src="/altar/cross.png"
                alt="Cross"
                fill
                className="object-contain"
                sizes="180px"
                priority
              />
            </div>
          </div>

          <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6 text-center">
            <h2 className="text-2xl font-semibold text-white">The Altar</h2>

            <div className="relative mx-auto mt-5 h-[420px] w-full max-w-2xl overflow-hidden rounded-3xl border border-blue-700 bg-blue-950/60 shadow-xl">
              <Image
                src={altarImage}
                alt="Selected altar"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 700px"
                priority
              />
            </div>

            <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-blue-700/60 bg-blue-950/70 px-6 py-5 text-left shadow-lg">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-blue-200/80">
                Prayer of the Pilgrim
              </p>
              <p className="whitespace-pre-wrap text-base leading-8 text-blue-50">
                {prayer}
              </p>

              <div className="mt-5 border-t border-blue-800/70 pt-4">
                <p className="text-sm text-blue-200/80">Pilgrim</p>
                <p className="text-lg font-semibold text-yellow-300">
                  {nickname}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6 text-center">
            <h2 className="mb-4 text-lg font-semibold text-blue-100">
              The Candle
            </h2>

            <div className="relative mx-auto h-72 w-full max-w-[180px]">
              <Image
                src="/altar/candle.jpg"
                alt="Candle"
                fill
                className="object-contain drop-shadow-[0_0_24px_rgba(255,220,120,0.45)]"
                sizes="180px"
                priority
              />
            </div>

            <div className="mx-auto mt-4 h-4 w-4 animate-pulse rounded-full bg-yellow-300 blur-sm" />
          </div>
        </div>
      </div>
    </main>
  );
}