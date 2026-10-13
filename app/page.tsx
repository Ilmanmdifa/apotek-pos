import Link from "next/link";
import { redirect } from "next/navigation";
import { Pill, ShoppingCart, FileText, ShieldCheck } from "lucide-react";
import { stackServerApp } from "@/stack/server";

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Kasir cepat + FEFO",
    desc: "Barcode/ketik + Enter, keranjang multi-item, stok otomatis berkurang dari batch terdekat expired.",
  },
  {
    icon: ShieldCheck,
    title: "Resep tercatat",
    desc: "Obat keras terkunci sampai no. resep + dokter diisi. Semua aksi teraudit, riwayat tak bisa dihapus.",
  },
  {
    icon: FileText,
    title: "Laporan + PDF",
    desc: "Omzet, laba, stok menipis, dan expired <90 hari. Unduh PDF resmi + cetak struk thermal 58mm.",
  },
];

const STACK = [
  "Next.js 16",
  "Prisma",
  "PostgreSQL",
  "Tailwind 4",
  "Recharts",
  "Stack Auth",
];

export default async function Home() {
  const user = await stackServerApp.getUser();
  if (user) redirect("/kasir");

  return (
    <div className="min-h-screen bg-cyan-50/50 text-slate-900">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Pill className="w-6 h-6 text-cyan-700" />
          Apotek POS
        </div>
        <div className="flex gap-2">
          <Link
            href="/demo"
            className="px-5 py-2 rounded-lg font-semibold border-2 border-cyan-700 text-cyan-800 hover:bg-cyan-50"
          >
            Coba Demo
          </Link>
          <Link
            href="/sign-in"
            className="px-5 py-3 rounded-lg font-semibold bg-cyan-700 text-white hover:bg-cyan-800"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <section className="py-16 text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 mb-4">
            Untuk apotek tunggal — bukan klinik, bukan distributor
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Kasir apotek yang melindungi,
            <br />
            bukan sekadar mencatat.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Stok per batch + tanggal expired, obat keras wajib resep, dan
            laporan siap cetak PDF. Dibangun sebagai portfolio full-stack yang
            benar-benar bisa dipakai.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/demo"
              className="px-8 py-4 rounded-lg font-semibold bg-cyan-700 text-white hover:bg-cyan-800"
            >
              <span>Lihat Demo Tanpa Login</span>
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 rounded-lg font-semibold bg-white border-2 border-cyan-700 text-cyan-800 hover:bg-cyan-50"
            >
              Masuk Aplikasi
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-16">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <f.icon className="w-8 h-8 text-cyan-700 mb-3" />
              <h2 className="font-bold mb-1">{f.title}</h2>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="pb-16 text-center">
          <h2 className="font-bold mb-3">Dibangun dengan</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {STACK.map((s) => (
              <span
                key={s}
                className="text-sm font-medium bg-slate-900 text-white rounded-full px-4 py-1"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-6">
            Data demo: 20 obat, batch bervariasi, 20 transaksi 14 hari terakhir.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Apotek POS — kasir FEFO, resep tercatat, laporan siap PDF.
      </footer>
    </div>
  );
}
