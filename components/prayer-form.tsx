"use client"

export default function PrayerForm() {

  return (

    <div style={{marginTop:"20px"}}>

      <textarea
        placeholder="Write your prayer"
      />

      <input
        type="number"
        min={2}
        max={12}
      />

    </div>

  )

}