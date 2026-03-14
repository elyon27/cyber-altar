'use client'

type CyberAltarPageProps = {
  slug: string
}

export default function CyberAltarPage({ slug }: CyberAltarPageProps) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#1e3a8a",
      color: "white",
      padding: "40px",
      textAlign: "center"
    }}>
      <h1>The Holy Place</h1>
      <p>Altar: {slug}</p>

      <div style={{
        marginTop: "40px",
        display: "flex",
        justifyContent: "center",
        gap: "40px",
        alignItems: "center"
      }}>
        
        <img src="/images/cross.png" width="120" />

        <img src="/altar/al001.jpg" width="260" />

        <img src="/images/candle.png" width="120" />

      </div>

    </div>
  )
}