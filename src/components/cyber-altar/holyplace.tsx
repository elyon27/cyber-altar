import React from "react"

type UserRecord = {
  nickname: string
}

type HolyPlaceProps = {
  nickname?: string
  prayer?: string
  altarImage?: string

  currentUser?: UserRecord | null
  crossImage?: string
  candleActive?: boolean
  candleHeightPercent?: number
  remainingText?: string
  loading?: boolean
  onLightCandle?: () => void
  onBack?: () => void
}

function HolyPlace({
  nickname,
  prayer,
  altarImage,
  currentUser,
  crossImage,
  candleActive,
  candleHeightPercent,
  remainingText,
  loading,
  onLightCandle,
  onBack
}: HolyPlaceProps) {

  return (
    <main style={{ textAlign: "center", padding: "20px" }}>

      {currentUser && (
        <h2>Welcome {currentUser.nickname}</h2>
      )}

      {nickname && (
        <h2>{nickname}&apos;s Prayer</h2>
      )}

      {crossImage && (
        <div>
          <img
            src={crossImage}
            alt="Cross"
            style={{ width: "120px", margin: "10px" }}
          />
        </div>
      )}

      {altarImage && (
        <div>
          <img
            src={altarImage}
            alt="Altar"
            style={{ width: "300px", margin: "10px" }}
          />
        </div>
      )}

      {prayer && (
        <p style={{ maxWidth: "600px", margin: "20px auto" }}>
          {prayer}
        </p>
      )}

      {remainingText && (
        <p>{remainingText}</p>
      )}

      {loading && (
        <p>Lighting candle...</p>
      )}

      {onLightCandle && (
        <button onClick={onLightCandle} style={{ margin: "10px" }}>
          Light Candle
        </button>
      )}

      {onBack && (
        <button onClick={onBack} style={{ margin: "10px" }}>
          Back
        </button>
      )}

    </main>
  )
}

export default HolyPlace