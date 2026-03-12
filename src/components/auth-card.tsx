"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function AuthCard() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) return;

    const slug = slugify(email);

    // redirect to altar page
    router.push(`/altar/${slug}`);
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
      <h2 style={{ fontSize: "32px", color: "#fcd34d", margin: 0 }}>
        Create or Enter Your Altar
      </h2>

      <p style={{ marginTop: "8px", fontSize: "14px", color: "#cbd5e1" }}>
        Register with your email. A personal altar is created for you after sign-in.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: "24px",
          display: "grid",
          gap: "16px",
        }}
      >
        <input
          type="text"
          placeholder="Name to engrave below the altar"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          style={{
            height: "48px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(2,6,23,0.7)",
            padding: "0 16px",
            color: "white",
          }}
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            height: "48px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(2,6,23,0.7)",
            padding: "0 16px",
            color: "white",
          }}
        />

        <button
          type="submit"
          style={{
            height: "48px",
            borderRadius: "12px",
            border: "none",
            background: "#fcd34d",
            color: "black",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Enter Altar
        </button>
      </form>
    </div>
  );
}