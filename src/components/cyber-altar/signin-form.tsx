// ==============================
// File: components/cyber-altar/SigninForm.tsx
// ==============================
'use client';

type SigninFormProps = {
  nickname: string;
  error: string;
  loading: boolean;
  setNickname: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function SigninForm({ nickname, error, loading, setNickname, onSubmit, onBack }: SigninFormProps) {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6">
      <h2 className="text-2xl font-semibold">Enter the Altar</h2>
      <div className="mt-6">
        <label className="mb-2 block text-sm text-blue-200">Nickname</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your existing nickname"
          className="w-full rounded-2xl border border-blue-700 bg-blue-950/70 px-4 py-3 outline-none placeholder:text-blue-300/40"
        />
      </div>
      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-blue-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Entering...' : 'Proceed to the Altar Form'}
        </button>
        <button
          onClick={onBack}
          disabled={loading}
          className="rounded-2xl border border-blue-600 px-5 py-3 font-semibold text-blue-100 transition hover:bg-blue-800/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back to Main Menu
        </button>
      </div>
    </section>
  );
}