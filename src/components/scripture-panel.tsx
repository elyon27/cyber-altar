export default function ScripturePanel(){

 const verses = [
   "Be still, and know that I am God — Psalm 46:10",
   "The Lord is my shepherd — Psalm 23:1",
   "Pray without ceasing — 1 Thessalonians 5:17"
 ]

 const verse = verses[Math.floor(Math.random()*verses.length)]

 return(

  <div style={{
    marginTop:"30px",
    padding:"24px",
    borderRadius:"20px",
    background:"rgba(255,255,255,0.05)"
  }}>

    <h3 style={{color:"#fcd34d"}}>
      Daily Scripture
    </h3>

    <p style={{marginTop:"12px"}}>
      {verse}
    </p>

  </div>

 )
}