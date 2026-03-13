export function SiteHeader() {
  return (
    <header
      style={{
        maxWidth: "1280px",
        margin: "0 auto 24px auto",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: "20px",
        borderRadius: "32px",
      }}
    >
      <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: ".35em", color: "#fcd34d" }}>
        Production Ministry Platform
      </p>
      <h1 style={{ marginTop: "8px", fontSize: "32px" }}>Cyber Altar to the Lamb</h1>
      <p style={{ marginTop: "4px", color: "#cbd5e1" }}>A sacred personal altar for prayers and petitions.</p>
    </header>
  );
}