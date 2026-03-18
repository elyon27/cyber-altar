'use client'

export default function HolyPlace() {
  return (
    <main className="min-h-screen bg-blue-950 text-white flex items-center justify-center">
      <div className="text-center p-10">
        <h1 className="text-3xl font-bold mb-4">The Holy Place</h1>
        <p>Welcome to the Cyber Altar.</p>

        <div className="mt-6 space-x-4">
          <button className="bg-yellow-500 text-black px-4 py-2 rounded">
            Submit Prayer
          </button>

          <button className="bg-orange-500 text-black px-4 py-2 rounded">
            🕯 Light Candle
          </button>
        </div>
      </div>
    </main>
  );
}