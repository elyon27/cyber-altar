import { AltarScene } from "@/components/altar-scene";
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