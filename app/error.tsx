"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50/50 px-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Terjadi kesalahan
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {error.message || "Coba lagi atau kembali ke halaman utama."}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 font-semibold"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
