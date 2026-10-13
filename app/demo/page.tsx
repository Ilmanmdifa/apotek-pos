import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatTanggalID, sisaHari } from "@/lib/format";
import { summarizeSales } from "@/lib/laporan";
import { Badge } from "../components/ui";

const DEMO_USER = "9def617c-3149-426f-91a0-935dda5fd546";

export default async function DemoPage() {
  const [products, sales] = await Promise.all([
    prisma.product.findMany({
      where: { userId: DEMO_USER },
      orderBy: { name: "asc" },
      take: 20,
      include: { batches: { select: { quantity: true, expiredAt: true } } },
    }),
    prisma.sale.findMany({
      where: { userId: DEMO_USER },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);
  const summary = summarizeSales(sales);

  return (
    <div className="min-h-screen bg-cyan-50/50 text-slate-900">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-bold text-lg">
          Apotek POS — Demo
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-semibold text-cyan-800 hover:text-cyan-900"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/sign-in"
            className="px-5 py-2 rounded-lg font-semibold bg-cyan-700 text-white hover:bg-cyan-800"
          >
            Masuk untuk transaksi
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-16">
        <p className="text-sm text-slate-600 mb-6">
          Mode baca-saja. Data contoh dari seed — masuk untuk kasir, retur,
          dan laporan penuh.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Omzet contoh", value: formatRupiah(summary.omzet) },
            { label: "Struk", value: String(summary.struk) },
            { label: "Laba kotor", value: formatRupiah(summary.laba) },
            { label: "Obat", value: String(products.length) },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-lg border border-slate-200 p-4"
            >
              <div className="text-xs text-slate-500 uppercase">{c.label}</div>
              <div className="text-xl font-bold tabular-nums">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="font-bold mb-4">Contoh master obat</h2>
            <div className="space-y-2">
              {products.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50"
                >
                  <span className="font-medium flex items-center gap-2">
                    {p.name}
                    {p.requiresPrescription && <Badge tone="bad">K</Badge>}
                  </span>
                  <span className="tabular-nums">
                    {formatRupiah(p.price)} — stok {p.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="font-bold mb-4">Contoh nota terakhir</h2>
            <div className="space-y-2">
              {sales.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50"
                >
                  <span className="font-medium">
                    {s.notaNo}
                    <span className="block text-xs text-slate-500">
                      {formatTanggalID(s.createdAt)} — {s.payMethod}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatRupiah(s.grandTotal)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Batch terdekat expired selalu dipakai dulu (FEFO) — contoh:{" "}
              {(() => {
                const b = products
                  .flatMap((p) => p.batches)
                  .sort(
                    (a, b) =>
                      new Date(a.expiredAt).getTime() -
                      new Date(b.expiredAt).getTime(),
                  )[0];
                return b
                  ? `sisa ${sisaHari(b.expiredAt)} hari lagi dipakai duluan`
                  : "-";
              })()}
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
