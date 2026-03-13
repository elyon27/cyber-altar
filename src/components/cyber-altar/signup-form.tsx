// ==============================
// File: components/cyber-altar/SignupForm.tsx
// ==============================
'use client';

type SignupFormProps = {
  nickname: string;
  email: string;
  error: string;
  loading: boolean;
  setNickname: (value: string) => void;
  setEmail: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function SignupForm({
  nickname,
  email,
  error,
  loading,
  setNickname,
  setEmail,
  onSubmit,
  onBack,
}: SignupFormProps) {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6">
      <h2 className="text-2xl font-semibold">Create Your Altar Identity</h2>
      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-blue-200">Nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Name to be displayed on the altar"
            className="w-full rounded-2xl border border-blue-700 bg-blue-950/70 px-4 py-3 outline-none placeholder:text-blue-300/40"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-blue-200">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pilgrim@example.com"
            className="w-full rounded-2xl border border-blue-700 bg-blue-950/70 px-4 py-3 outline-none placeholder:text-blue-300/40"
          />
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Proceed to the Altar Form'}
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