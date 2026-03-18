// ==============================
// File: components/cyber-altar/MainMenu.tsx
// ==============================
'use client';

type MainMenuProps = {
  onSignup: () => void;
  onSignin: () => void;
};

export function MainMenu({ onSignup, onSignin }: MainMenuProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6">
        <h2 className="text-2xl font-semibold">Sign Up</h2>
        <p className="mt-3 text-blue-100/80">
          Create your place upon the altar by choosing a unique nickname and entering your email.
        </p>
        <button
          onClick={onSignup}
          className="mt-6 rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
        >
          Begin Sign Up
        </button>
      </div>

      <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-6">
        <h2 className="text-2xl font-semibold">Sign In</h2>
        <p className="mt-3 text-blue-100/80">
          If your nickname is already known by the altar, enter and proceed to your prayer form.
        </p>
        <button
          onClick={onSignin}
          className="mt-6 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-blue-950 transition hover:bg-amber-400"
        >
          Enter by Nickname
        </button>
      </div>
    </section>
  );
}