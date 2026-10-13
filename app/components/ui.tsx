"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer px-6 py-3 rounded-lg font-semibold disabled:opacity-60 ${className}`}
    >
      {pending ? "Menyimpan..." : children}
    </button>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "ok" | "warn" | "bad" | "info";
}) {
  const tones: Record<string, string> = {
    muted: "bg-slate-100 text-slate-700",
    ok: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 text-sm text-slate-500">{message}</div>
  );
}

export function PrintButton({
  children,
  className = "flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-none";
