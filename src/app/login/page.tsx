<div
  style={{
    width: "100%",
    minHeight: "240px",
    borderRadius: "16px",
    background: "linear-gradient(180deg, #1e3a8a, #0f172a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.25rem",
    fontWeight: 600,
  }}
>
  Cyber Altar
</div>

//import { AuthCard } from "@/components/auth-card";
//import { SiteHeader } from "@/components/site-header";

import AuthCard from "@/components/auth-card"
import SiteHeader from "@/components/site-header"

export default function LoginPage() {
  return (
    <main style={{ padding: "16px" }}>
      <SiteHeader />
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <AuthCard />
      </div>
    </main>
  );
}