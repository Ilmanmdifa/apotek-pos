"use client";

import { useStackApp } from "@stackframe/stack";

export function SignOutButton() {
  const app = useStackApp();
  return (
    <button
      onClick={() => app.signOut()}
      className="text-sm text-slate-500 hover:text-slate-800 underline"
    >
      Stuck? Keluar dan masuk ulang
    </button>
  );
}
