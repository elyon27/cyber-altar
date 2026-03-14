'use client'

import Image from "next/image"

export default function HolyPlace() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900 text-white p-6">
      
      <h1 className="text-4xl font-bold mb-6">
        🕊 The Holy Place
      </h1>

      <div className="mb-6">
        <Image
          src="/images/altar/al001.jpg"
          alt="Altar"
          width={400}
          height={400}
          className="rounded-lg shadow-lg"
        />
      </div>

      <textarea
        placeholder="Enter your prayer..."
        className="w-full max-w-lg p-4 rounded text-black"
      />

      <button className="mt-4 px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold">
        Submit Prayer
      </button>

      <button className="mt-4 px-6 py-3 bg-orange-500 text-black rounded-lg font-semibold">
        🕯 Light a Candle
      </button>

    </div>
  )
}