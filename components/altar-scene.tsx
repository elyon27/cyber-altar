"use client"

type Props = {
  altarName: string
  candleCount: number
}

export function AltarScene({ altarName, candleCount }: Props) {

  return (
    <div style={{padding:"40px", textAlign:"center"}}>

      <h2>Altar of the Lamb</h2>

      <p>Pilgrim: {altarName}</p>

      <div style={{fontSize:"30px"}}>
        {"🕯".repeat(candleCount)}
      </div>

    </div>
  )
}