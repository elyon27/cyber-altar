"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function PrayerForm({ altarSlug }: { altarSlug: string }) {

  const supabase = createClient();
  const [text,setText] = useState("");
  const [saving,setSaving] = useState(false);

  async function submitPrayer(){

    if(!text.trim()) return;

    setSaving(true);

    await supabase
      .from("prayers")
      .insert({
        altar_slug: altarSlug,
        prayer_text: text
      });

    setText("");
    setSaving(false);
  }

  return (

    <div style={{
      marginTop:"30px",
      padding:"24px",
      background:"rgba(255,255,255,0.05)",
      borderRadius:"20px"
    }}>

      <h3 style={{color:"#fcd34d"}}>Offer a Prayer</h3>

      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="Write your prayer..."
        style={{
          width:"100%",
          height:"120px",
          marginTop:"12px",
          padding:"12px",
          borderRadius:"10px",
          background:"#020617",
          color:"white"
        }}
      />

      <button
        onClick={submitPrayer}
        style={{
          marginTop:"12px",
          padding:"10px 16px",
          background:"#fcd34d",
          border:"none",
          borderRadius:"8px",
          fontWeight:"bold"
        }}
      >
        {saving ? "Offering..." : "Offer Prayer"}
      </button>

    </div>
  );
}