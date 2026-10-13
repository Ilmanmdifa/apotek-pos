import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/roles";
import { formatRupiah, formatTanggalID, sisaHari } from "@/lib/format";
import { summarizeSales, dailySeries, parseRange } from "@/lib/laporan";
import SideBar from "../components/sidebar";
import { Badge, EmptyState } from "../components/ui";
import { LaporanChart } from "./laporan-chart";

function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ mulai?: string; akhir?: string }>;
}) {
  const ctx = await requireStaff("OWNER");
  const params = await searchParams;
  const { start, end } = parseRange(params.mulai, params.akhir);

  const sales = await prisma.sale.findMany({
    where: { userId: ctx.ownerId, createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { items: true, _count: { select: { items: true } } },
  });

  const summary = summarizeSales(sales);
  const series = dailySeries(sales);

  const lowStock = (
    await prisma.product.findMany({
      where: { userId: ctx.ownerId, lowStockAt: { not: null } },
      select: { id: true, name: true, quantity: true, lowStockAt: true },
    })
  ).filter((p) => p.lowStockAt != null && p.quantity <= p.lowStockAt);

  const expiring = await prisma.stockBatch.findMany({
    where: {
      userId: ctx.ownerId,
      expiredAt: { lte: new Date(Date.now() + 90 * 86400000) },
    },
    orderBy: { expiredAt: "asc" },
    take: 10,
    include: { product: { select: { name: true } } },
  });

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/laporan" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Laporan</h1>
            <p className="text-sm text-slate-600">
              {formatTanggalID(start)} — {formatTanggalID(end)}
            </p>
          </div>
          <a
            href={`/api/laporan/pdf?mulai=${isoDay(start)}&akhir=${isoDay(end)}`}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 font-semibold"
          >
            Unduh PDF
          </a>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <form action="/laporan" method="GET" className="flex gap-2">
            <input
              type="date"
              name="mulai"
              defaultValue={isoDay(start)}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="date"
              name="akhir"
              defaultValue={isoDay(end)}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            />
            <button className="px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800">
              Tampilkan
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Omzet", value: formatRupiah(summary.omzet) },
            { label: "Struk", value: String(summary.struk) },
            { label: "Laba kotor", value: formatRupiah(summary.laba) },
            { label: "Retur", value: String(summary.retur) },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-lg border border-slate-200 p-4"
            >
              <div className="text-xs text-slate-500 uppercase">{c.label}</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                {c.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Omzet harian
            </h2>
            {series.length === 0 ? (
              <EmptyState message="Tidak ada penjualan pada rentang ini." />
            ) : (
              <LaporanChart data={series} />
            )}
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Metode bayar
            </h2>
            {Object.keys(summary.byMethod).length === 0 ? (
              <EmptyState message="Tidak ada data." />
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(summary.byMethod).map(([m, v]) => (
                    <tr key={m}>
                      <td className="py-2 font-medium">{m}</td>
                      <td className="py-2 text-right tabular-nums">
                        {v.count} struk
                      </td>
                      <td className="py-2 text-right tabular-nums font-semibold">
                        {formatRupiah(v.total)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 font-medium">Diskon total</td>
                    <td />
                    <td className="py-2 text-right tabular-nums">
                      {formatRupiah(summary.diskon)}
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Stok menipis ({lowStock.length})
              </h2>
              <Link
                href="/stok"
                className="text-sm text-cyan-700 hover:text-cyan-900 font-medium"
              >
                Lihat semua
              </Link>
            </div>
            {lowStock.slice(0, 10).map((p) => (
              <div
                key={p.id}
                className="flex justify-between text-sm py-1 tabular-nums"
              >
                <span>{p.name}</span>
                <span className="font-semibold">
                  {p.quantity} <Badge tone="warn">≤ {p.lowStockAt}</Badge>
                </span>
              </div>
            ))}
            {lowStock.length === 0 && (
              <EmptyState message="Semua stok aman." />
            )}
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Dekat expired
              </h2>
              <Link
                href="/stok"
                className="text-sm text-cyan-700 hover:text-cyan-900 font-medium"
              >
                Lihat semua
              </Link>
            </div>
            {expiring.map((b) => (
              <div
                key={b.id}
                className="flex justify-between text-sm py-1 tabular-nums"
              >
                <span>
                  {b.product.name} ({b.batchNo})
                </span>
                <span className="font-semibold">{sisaHari(b.expiredAt)} hari</span>
              </div>
            ))}
            {expiring.length === 0 && (
              <EmptyState message="Tidak ada batch dekat expired." />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
