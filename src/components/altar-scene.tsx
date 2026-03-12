"use client";

import { useState } from "react";

type Props = {
  altarName: string
  candleCount: number
}

export function AltarScene({ altarName, candleCount }: Props) {

  const [candles,setCandles] = useState(candleCount)

  function lightCandle(){
    setCandles(candles+1)
  }

  return(

    <div style={{
      padding:"40px",
      borderRadius:"30px",
      textAlign:"center",
      background:"radial-gradient(circle at center,#0f172a,#020617)"
    }}>

      <h2 style={{color:"#fcd34d"}}>
        Altar of the Lamb
      </h2>

      <p style={{color:"#cbd5e1"}}>
        Pilgrim: {altarName}
      </p>

      <div style={{
        marginTop:"24px",
        fontSize:"28px"
      }}>
        {"🕯".repeat(candles)}
      </div>

      <button
        onClick={lightCandle}
        style={{
          marginTop:"20px",
          padding:"12px 20px",
          borderRadius:"10px",
          background:"#fcd34d",
          border:"none",
          fontWeight:"bold"
        }}
      >
        Light Candle
      </button>

    </div>

  )
}