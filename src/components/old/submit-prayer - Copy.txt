"use client";

import { FormEvent, useState } from "react";

type Prayer = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

type SubmitPrayerProps = {
  defaultName?: string;
  onPrayerAdded?: (prayer: Prayer) => void;
};

export default function SubmitPrayer({
  defaultName = "",
  onPrayerAdded,
}: SubmitPrayerProps) {
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");

    if (!message.trim()) {
      setStatus("Please enter a prayer message.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Unable to submit prayer.");
        return;
      }

      setStatus("Prayer submitted.");
      setMessage("");
      onPrayerAdded?.(data.prayer);
    } catch {
      setStatus("Something went wrong while submitting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div>
        <label htmlFor="name" className="mb-2 block text-sm text-white/85">
          Altar Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-white/85">
          Prayer
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Write your prayer here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Prayer"}
      </button>

      {status ? <p className="text-sm text-white/70">{status}</p> : null}
    </form>
  );
}