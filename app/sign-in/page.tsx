import { SignIn } from "@stackframe/stack";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pill } from "lucide-react";
import { stackServerApp } from "@/stack/server";
import { SignOutButton } from "./sign-out-button";

export default async function SignInPage() {
  const user = await stackServerApp.getUser();
  if (user) redirect("/kasir");
  return (
    <div className="min-h-screen bg-cyan-50/50 text-slate-900">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Pill className="w-6 h-6 text-cyan-700" />
          Apotek POS
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-cyan-800 hover:text-cyan-900"
        >
          Kembali ke Beranda
        </Link>
      </header>

      <main className="flex flex-col items-center px-6 pt-6 pb-16">
        {/* max-w-380px mengikuti lebar kartu Stack Auth */}
        <div className="w-full flex justify-center">
          <SignIn />
        </div>
        <div className="w-full max-w-[380px] mt-6 text-center">
          <div className="flex items-center gap-3 mb-4" aria-hidden="true">
            <span className="flex-1 border-t border-slate-300" />
            <span className="text-sm text-slate-500">
              Cuma mau lihat-lihat?
            </span>
            <span className="flex-1 border-t border-slate-300" />
          </div>
          <Link
            href="/demo"
            className="block w-full px-5 py-2.5 rounded-lg font-semibold border-2 border-cyan-700 text-cyan-800 hover:bg-cyan-50"
          >
            Lihat Demo Tanpa Login
          </Link>
        </div>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
