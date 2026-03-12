type Props = {
  altarSlug: string
}

export default function PrayerList({ altarSlug }: Props) {

  return (

    <div style={{marginTop:"20px"}}>

      <h3>Prayer Scroll</h3>

      <p>No prayers yet for altar: {altarSlug}</p>

    </div>

  )

}