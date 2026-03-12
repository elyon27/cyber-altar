import { AltarScene } from "@/components/altar-scene"
import PrayerForm from "@/components/prayer-form"
import PrayerList from "@/components/prayer-list"
import ScripturePanel from "@/components/scripture-panel"

type Props={
 params:Promise<{slug:string}>
}

export default async function Page({params}:Props){

 const {slug} = await params

 return(

  <main style={{
    padding:"40px",
    background:"#020617",
    color:"white",
    minHeight:"100vh"
  }}>

  <h1 style={{color:"#fcd34d"}}>
   Cyber Altar
  </h1>

  <AltarScene
    altarName={slug}
    candleCount={3}
  />

  <PrayerForm altarSlug={slug}/>

  <PrayerList altarSlug={slug}/>

  <ScripturePanel/>

  </main>

 )
}