import { createClient } from "@/lib/supabase";

export default async function PrayerWall() {

  const supabase = createClient();

  const { data } = await supabase
    .from("prayers")
    .select("*")
    .order("created_at",{ascending:false})
    .limit(20);

  return (

    <main style={{padding:"40px",background:"#020617",color:"white"}}>

      <h1 style={{color:"#fcd34d"}}>Global Prayer Wall</h1>

      {data?.map((p)=>(
        <div key={p.id} style={{marginTop:"20px"}}>
          <p>{p.prayer_text}</p>
          <small>{p.altar_slug}</small>
        </div>
      ))}

    </main>

  )
}