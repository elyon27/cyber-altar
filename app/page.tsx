import { AltarScene } from "@/components/altar-scene";
import { AuthCard } from "@/components/auth-card";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <main style={{ padding: "16px" }}>
      <SiteHeader />
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "1.2fr 0.85fr",
        }}
      >
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            padding: "32px",
            borderRadius: "32px",
          }}
        >
          <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: ".4em", color: "#fcd34d" }}>
            Cyber Altar of Prayer
          </p>
          <h2 style={{ marginTop: "16px", fontSize: "56px", lineHeight: 1.1 }}>
            Enter a sacred personal altar where prayers may be laid before the Lamb.
          </h2>
          <p style={{ marginTop: "20px", maxWidth: "760px", color: "#cbd5e1", fontSize: "18px", lineHeight: 1.7 }}>
            Each registered pilgrim receives a dedicated altar chamber, engraved with their name,
            illuminated by candles, and paired with a private archive for prayers and petitions.
          </p>
          <div style={{ marginTop: "32px" }}>
            <AltarScene />
          </div>
        </section>
        <AuthCard />
      </div>
    </main>
  );
}