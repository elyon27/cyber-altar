"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function CandlePanel({altarSlug}:{altarSlug:string}){

 const supabase = createClient();
 const [count,setCount] = useState(0);

 async function lightCandle(){

   await supabase
     .from("candles")
     .insert({altar_slug:altarSlug});

   setCount(count+1);
 }

 return(

  <div style={{marginTop:"30px"}}>

    <button onClick={lightCandle}>
      Light Candle 🕯
    </button>

    <p>Candles burning: {count}</p>

  </div>

 )

}