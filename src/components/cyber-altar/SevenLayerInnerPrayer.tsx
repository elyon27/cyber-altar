'use client';

import { useEffect, useState } from 'react';

const LAYERS = [
  { title: 'Stillness', guidance: 'Quiet your heart before God. Read your offered prayer slowly and become attentive to His presence.' },
  { title: 'Gratitude', guidance: 'Consider what you can thank God for, even while carrying this intention.' },
  { title: 'Examination', guidance: 'Reflect honestly on the feelings, motives, needs, and hopes expressed in this prayer.' },
  { title: 'Conversion of Heart', guidance: 'Ask God for the grace to turn away from what is unloving and to grow in faith, hope, and charity.' },
  { title: 'Petition', guidance: 'Entrust your intention to God. Pray for what is good, while remembering the needs of others.' },
  { title: 'Surrender', guidance: 'Place your request before God with humility: let Your will, not mine, be done.' },
  { title: 'Trust and Peace', guidance: 'Remain for a moment in quiet trust. Consider one loving action you can take after this prayer.' },
];

type Props = { prayerText: string; onClose: () => void };

export default function SevenLayerInnerPrayer({ prayerText, onClose }: Props) {
  const [layer, setLayer] = useState(0);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const current = LAYERS[layer];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="inner-prayer-heading"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-amber-400/30 bg-slate-950 p-5 text-white shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-amber-200">7 Layer Inner Prayer · Layer {layer + 1} of 7</p>
            <h2 id="inner-prayer-heading" className="mt-2 text-2xl font-bold">{current.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close inner prayer" className="rounded-lg border border-white/30 px-3 py-2 text-white hover:bg-white/10">✕</button>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">Your offered prayer</p>
          <p className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-white/90">{prayerText}</p>
        </div>
        <p className="mt-5 leading-7 text-white/90">{current.guidance}</p>
        <p className="mt-4 text-xs text-white/60">A voluntary personal reflection, not a separate sacrament or a prescribed prayer of the Catholic Church. Your prayer and private reflections are not posted publicly by this feature.</p>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <button type="button" disabled={layer === 0} onClick={() => setLayer(v => Math.max(0, v - 1))}
            className="rounded-xl border border-white/25 px-4 py-3 font-semibold disabled:opacity-35">Previous Layer</button>
          {layer < 6 ? (
            <button type="button" onClick={() => setLayer(v => Math.min(6, v + 1))}
              className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950">Next Layer →</button>
          ) : (
            <button type="button" onClick={onClose} className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950">Finish Reflection</button>
          )}
        </div>
      </section>
    </div>
  );
}
