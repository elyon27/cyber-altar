"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function AuthCard() {

  const router = useRouter()
  const [name,setName] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()

    if(!name) return

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,"-")

    router.push(`/altar/${slug}`)
  }

  return (

    <div style={{
      padding:"40px",
      borderRadius:"16px",
      background:"#0f172a",
      color:"white",
      maxWidth:"400px",
      margin:"40px auto",
      textAlign:"center"
    }}>

      <h2 style={{color:"#fcd34d"}}>
        Enter the Cyber Altar
      </h2>

      <form onSubmit={submit}>

        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Enter your name"
          style={{
            width:"100%",
            padding:"10px",
            marginTop:"20px",
            borderRadius:"8px",
            border:"none"
          }}
        />

        <button
          type="submit"
          style={{
            marginTop:"20px",
            padding:"10px 20px",
            background:"#fcd34d",
            border:"none",
            borderRadius:"8px",
            fontWeight:"bold"
          }}
        >
          Enter Altar
        </button>

      </form>

    </div>

  )
}