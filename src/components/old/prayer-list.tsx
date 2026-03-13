"use client";

import { useEffect,useState } from "react";
import { createClient } from "@/lib/supabase";

export default function PrayerList({ altarSlug }:{altarSlug:string}){

  const supabase = createClient();
  const [prayers,setPrayers] = useState<any[]>([]);

  async function loadPrayers(){

    const {data} = await supabase
      .from("prayers")
      .select("*")
      .eq("altar_slug",altarSlug)
      .order("created_at",{ascending:false});

    setPrayers(data || []);
  }

  useEffect(() => {

    async function loadPrayers() {
      const res = await fetch("/api/prayers");
      const data = await res.json();
      setPrayers(data);
    }

    loadPrayers();

  }, []);

  return(

    <div style={{
      marginTop:"30px",
      padding:"24px",
      background:"rgba(255,255,255,0.05)",
      borderRadius:"20px"
    }}>

      <h3 style={{color:"#fcd34d"}}>Prayer Scroll</h3>

      {prayers.map((p)=>(
        <div key={p.id} style={{marginTop:"12px"}}>
          <p>{p.prayer_text}</p>
        </div>
      ))}

    </div>

  );
}