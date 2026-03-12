"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export function AuthCard() {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const altarSlug = slugify(email);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?slug=${altarSlug}&name=${encodeURIComponent(displayName)}`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Magic link sent. Check your email to enter your altar.");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: "24px",
        borderRadius: "32px",
      }}
    >
      <h2 style={{ fontSize: "32px", color: "#fcd34d" }}>Create or Enter Your Altar</h2>
      <p style={{ marginTop: "8px", fontSize: "14px", color: "#cbd5e1" }}>
        Register with your email. A personal altar is created for you after sign-in.
      </p>

      <form onSubmit={handleMagicLink} style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
        <input
          style={{ height: "48px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(2,6,23,0.7)", padding: "0 16px", color: "white" }}
          placeholder="Name to engrave below the altar"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          style={{ height: "48px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(2,6,23,0.7)", padding: "0 16px", color: "white" }}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
}