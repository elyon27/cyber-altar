'use client';

import { useState } from 'react';

export default function PilgrimsDirectory() {
  const [open, setOpen] = useState(false);
  const [pilgrims, setPilgrims] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/pilgrims', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.pilgrims)) throw new Error();
      setPilgrims(result.pilgrims);
    } catch {
      setError('Unable to load the pilgrims. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = pilgrims.filter(name => name.toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <>
      <button type="button" aria-expanded={open} aria-controls="pilgrims-directory"
        onClick={() => { setOpen(!open); if (!open) void load(); }}
        className={`rounded-xl border px-4 py-3 font-medium hover:bg-white/10 ${open ? 'border-amber-400/50 bg-amber-400/10 text-amber-100' : 'border-white/20'}`}>
        Pilgrims
      </button>
      {open && (
        <section id="pilgrims-directory" aria-labelledby="pilgrims-heading" className="order-last w-full rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="pilgrims-heading" className="text-2xl font-semibold">Pilgrims</h2>
            <button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10 disabled:opacity-50">Refresh</button>
          </div>
          <p className="mt-2 text-sm text-white/65">Pilgrims enrolled in Cyber-Altar</p>
          <div role="status" aria-live="polite" className="mt-3 text-sm text-white/75">
            {loading ? 'Loading pilgrims…' : error || `${pilgrims.length} enrolled ${pilgrims.length === 1 ? 'pilgrim' : 'pilgrims'}`}
          </div>
          {!loading && !error && <>
            <label className="mt-4 block text-sm" htmlFor="pilgrim-search">Find a pilgrim</label>
            <input id="pilgrim-search" value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search pilgrim names" className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-white" />
            {filtered.length ? <ul className="mt-4 grid max-h-96 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((name, index) => <li key={`${name}-${index}`} className="break-words rounded-xl border border-white/10 bg-white/5 px-4 py-3">{name}</li>)}
            </ul> : <p className="mt-4 text-white/65">{pilgrims.length ? 'No pilgrims match your search.' : 'No pilgrims have enrolled yet.'}</p>}
          </>}
        </section>
      )}
    </>
  );
}
