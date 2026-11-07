'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const LAYERS = [
  { title: 'Stillness', guidance: 'Quiet your heart before God. Read your offered prayer slowly and become attentive to His presence.' },
  { title: 'Gratitude', guidance: 'Consider what you can thank God for, even while carrying this intention.' },
  { title: 'Examination', guidance: 'Reflect honestly on the feelings, motives, needs, and hopes expressed in this prayer.' },
  { title: 'Conversion of Heart', guidance: 'Ask God for the grace to turn away from what is unloving and to grow in faith, hope, and charity.' },
  { title: 'Petition', guidance: 'Entrust your intention to God. Pray for what is good, while remembering the needs of others.' },
  { title: 'Surrender', guidance: 'Place your request before God with humility: let Your will, not mine, be done.' },
  { title: 'Trust and Peace', guidance: 'Remain for a moment in quiet trust. Consider one loving action you can take after this prayer.' },
];

type Props = { prayerId: string; prayerText: string; onClose: () => void; onReflectionCountChange?: (count: number) => void };
type ReflectionMap = Record<number, string>;

export default function SevenLayerInnerPrayer({ prayerId, prayerText, onClose, onReflectionCountChange }: Props) {
  const [layer, setLayer] = useState(0);
  const reflectionInputRef = useRef<HTMLTextAreaElement>(null);
  const [saved, setSaved] = useState<ReflectionMap>({});
  const [drafts, setDrafts] = useState<ReflectionMap>({});
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function loadReflections() {
      setLoading(true);
      setErrorMessage('');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !user) {
        setErrorMessage('Please sign in again to view your private reflections.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('prayer_inner_reflections')
        .select('layer_number, reflection_text')
        .eq('prayer_id', prayerId);
      if (!active) return;
      if (error) {
        setErrorMessage('Unable to load reflections. Please try again.');
      } else {
        const next: ReflectionMap = {};
        for (const item of data ?? []) next[item.layer_number] = item.reflection_text || '';
        setSaved(next);
        setDrafts(next);
        onReflectionCountChange?.(Object.values(next).filter(text => text.trim()).length);
      }
      setLoading(false);
    }
    void loadReflections();
    return () => { active = false; };
  }, [prayerId]);

  const close = useCallback(() => {
    if (saving) return;
    const hasUnsaved = Object.keys(drafts).some(key => drafts[Number(key)] !== (saved[Number(key)] ?? ''));
    if (hasUnsaved && !window.confirm('You have an unsaved Short Reflection. Close without saving?')) return;
    onClose();
  }, [drafts, saved, saving, onClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const layerNumber = layer + 1;
  const current = LAYERS[layer];
  const currentSaved = saved[layerNumber];
  const currentDraft = drafts[layerNumber] ?? '';
  const hasSaved = currentSaved !== undefined;
  const isEditing = editing[layerNumber] || !hasSaved;
  const isDirty = currentDraft !== (currentSaved ?? '');

  // Keep all typed or loaded lines visible without a nested text-area scroll.
  useEffect(() => {
    if (!isEditing || loading) return;
    const field = reflectionInputRef.current;
    if (!field) return;
    field.style.height = 'auto';
    field.style.height = `${Math.max(field.scrollHeight, 128)}px`;
  }, [layer, currentDraft, isEditing, loading]);

  async function saveReflection() {
    if (saving || loading) return;
    setErrorMessage('');
    setSuccessMessage('');
    const text = currentDraft.trim();
    if (text.length > 500) {
      setErrorMessage('Please keep your reflection to 500 characters or fewer.');
      return;
    }
    setSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Please sign in again to save your reflection.');
      const { data, error } = await supabase.from('prayer_inner_reflections').upsert({
        prayer_id: prayerId,
        layer_number: layerNumber,
        owner_id: user.id,
        reflection_text: text,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'prayer_id,layer_number' }).select('reflection_text').single();
      if (error || !data) throw error || new Error('Save was not confirmed.');
      setSaved(previous => {
        const updated = { ...previous, [layerNumber]: data.reflection_text };
        onReflectionCountChange?.(Object.values(updated).filter(text => text.trim()).length);
        return updated;
      });
      setDrafts(previous => ({ ...previous, [layerNumber]: data.reflection_text }));
      setEditing(previous => ({ ...previous, [layerNumber]: false }));
      setSuccessMessage('Layer ' + layerNumber + ' reflection saved privately.');
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'Could not save reflection.');
    } finally {
      setSaving(false);
    }
  }

  function changeLayer(next: number) {
    setLayer(Math.max(0, Math.min(6, next)));
    setErrorMessage('');
    setSuccessMessage('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="inner-prayer-heading"
        className="max-h-[calc(100dvh-24px)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-3xl border border-amber-400/30 bg-slate-950 p-4 text-white shadow-2xl sm:max-h-[90vh] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-amber-200">7 Layer Inner Prayer · Layer {layerNumber} of 7</p>
            <h2 id="inner-prayer-heading" className="mt-2 text-2xl font-bold">{current.title}</h2>
          </div>
          <button type="button" onClick={close} aria-label="Close inner prayer"
            className="rounded-lg border border-white/30 px-3 py-2 text-white hover:bg-white/10">✕</button>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">Your offered prayer</p>
          <p className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-white/90">{prayerText}</p>
        </div>
        <p className="mt-5 leading-7 text-white/90">{current.guidance}</p>
        <div className="mt-5 rounded-2xl border border-violet-300/30 bg-violet-300/5 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="short-reflection" className="font-semibold text-violet-100">Short Reflection</label>
            <span className="text-xs text-white/60">{currentDraft.length}/500 characters</span>
          </div>
          {isEditing ? (
            <textarea ref={reflectionInputRef} id="short-reflection" rows={4} maxLength={500}
              placeholder="Write your personal reflection on this layer's guidance..."
              value={currentDraft} disabled={loading || saving}
              onChange={event => { setDrafts(previous => ({ ...previous, [layerNumber]: event.target.value })); setSuccessMessage(''); }}
              className="block min-h-32 w-full resize-none overflow-hidden rounded-xl border border-white/20 bg-slate-900 p-3 text-base leading-7 text-white placeholder:text-white/40 focus:border-violet-300 focus:outline-none disabled:opacity-75" />
          ) : (
            <div id="short-reflection" role="region" aria-label="Saved Short Reflection"
              className="w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-xl border border-violet-300/20 bg-slate-900 p-3 text-base leading-7 text-white">
              {currentSaved || 'No reflection saved yet.'}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {isEditing ? (
              <button type="button" onClick={() => void saveReflection()} disabled={loading || saving || !currentDraft.trim()}
                className="rounded-xl bg-violet-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Reflection'}
              </button>
            ) : (
              <button type="button" onClick={() => setEditing(previous => ({ ...previous, [layerNumber]: true }))}
                className="rounded-xl border border-violet-300/60 px-4 py-2 text-sm font-semibold text-violet-100">
                Edit Reflection
              </button>
            )}
            {loading && <span className="text-sm text-white/70">Loading reflections...</span>}
            {!loading && hasSaved && !isDirty && <span className="text-xs text-emerald-200">Saved privately</span>}
            {isDirty && <span className="text-xs text-amber-200">Unsaved changes</span>}
          </div>
          {errorMessage && <p role="alert" className="mt-3 text-sm text-red-200">{errorMessage}</p>}
          {successMessage && <p role="status" className="mt-3 text-sm text-emerald-200">{successMessage}</p>}
        </div>
        <p className="mt-4 text-xs text-white/60">A voluntary personal reflection, not a separate sacrament or a prescribed prayer of the Catholic Church. Reflections are private to your signed-in account and are not shown on the public Prayer Wall.</p>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <button type="button" disabled={layer === 0 || saving} onClick={() => changeLayer(layer - 1)}
            className="rounded-xl border border-white/25 px-4 py-3 font-semibold disabled:opacity-35">Previous Layer</button>
          {layer < 6 ? (
            <button type="button" disabled={saving} onClick={() => changeLayer(layer + 1)}
              className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">Next Layer →</button>
          ) : (
            <button type="button" onClick={close} disabled={saving}
              className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">Finish Reflection</button>
          )}
        </div>
      </section>
    </div>
  );
}
