"use client";

import { useState } from "react";

type Props = {
  altarSlug: string;
};

export function PrayerForm({ altarSlug }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [candleCount, setCandleCount] = useState(6);
  const [isPrivate, setIsPrivate] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitPrayer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altarSlug, title, body, candleCount, isPrivate }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Unable to submit prayer.");
    } else {
      setMessage("Your prayer has been placed upon the altar.");
      setTitle("");
      setBody("");
      setCandleCount(6);
      setIsPrivate(true);
      window.location.reload();
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={submitPrayer}
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: "24px",
        borderRadius: "32px",
      }}
    >
      <h3 style={{ fontSize: "24px", color: "#fcd34d" }}>Offer a Prayer or Petition</h3>
      <div style={{ marginTop: "16px", display: "grid", gap: "16px" }}>
        <input
          style={{ height: "44px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(2,6,23,0.7)", padding: "0 16px", color: "white" }}
          placeholder="Prayer title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          style={{ minHeight: "160px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(2,6,23,0.7)", padding: "12px 16px", color: "white" }}
          placeholder="Write your prayer here..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <input
          type="number"
          min={2}
          max={12}
}