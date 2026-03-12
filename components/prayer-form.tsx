"use client"

type Props = {
  altarSlug: string
}

export default function PrayerForm({ altarSlug }: Props) {

  return (

    <div style={{marginTop:"20px"}}>

      <h3>Offer a Prayer</h3>

      <textarea
        placeholder={`Write a prayer for altar ${altarSlug}`}
        style={{
          width:"100%",
          height:"120px",
          padding:"10px",
          marginTop:"10px"
        }}
      />

    </div>

  )

}