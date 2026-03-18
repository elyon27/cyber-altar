'use client'

type HolyPlaceProps = {
  nickname: string
  prayer: string
  altarImage: string
}

export default function HolyPlace({
  nickname,
  prayer,
  altarImage,
}: HolyPlaceProps) {
  return (
    <main className="min-h-screen bg-blue-950 text-white flex flex-col items-center justify-center p-8">

      <h1 className="text-3xl font-bold mb-6">
        The Holy Place
      </h1>

      <p className="mb-4 text-lg">
        Pilgrim: <strong>{nickname}</strong>
      </p>

      <div className="mb-6">
        <img
          src={altarImage}
          alt="Selected Altar"
          className="rounded-lg shadow-lg w-80"
        />
      </div>

      <div className="bg-black/30 p-6 rounded-lg max-w-xl text-center">
        <p className="italic">"{prayer}"</p>
      </div>

      <button className="mt-6 bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold">
        🕯 Light a Candle
      </button>

    </main>
  )
}