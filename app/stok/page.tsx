import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/roles";
import { formatRupiah, formatTanggalID, sisaHari } from "@/lib/format";
import SideBar from "../components/sidebar";
import { Badge, EmptyState } from "../components/ui";

const EXPIRY_WARNING_DAYS = 90;

export default async function StokPage() {
  const ctx = await getStaffContext();

  const candidates = await prisma.product.findMany({
    where: { userId: ctx.ownerId, lowStockAt: { not: null } },
    orderBy: { quantity: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      quantity: true,
      lowStockAt: true,
      price: true,
    },
  });
  const menipis = candidates.filter(
    (p) => p.lowStockAt != null && p.quantity <= p.lowStockAt,
  );

  const limit = new Date(Date.now() + EXPIRY_WARNING_DAYS * 86400000);
  const batches = await prisma.stockBatch.findMany({
    where: { userId: ctx.ownerId, expiredAt: { lte: limit } },
    orderBy: { expiredAt: "asc" },
    take: 100,
    include: { product: { select: { id: true, name: true, sku: true } } },
  });

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/stok" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Peringatan Stok
          </h1>
          <p className="text-sm text-slate-600">
            {menipis.length} obat menipis — {batches.length} batch expired /
            dekat expired
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Stok Menipis
          </h2>
          {menipis.length === 0 ? (
            <EmptyState message="Semua stok aman." />
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Obat
                  </th>
                  <th className="px-4 py-2 text-right text-xs text-slate-500 uppercase">
                    Stok
                  </th>
                  <th className="px-4 py-2 text-right text-xs text-slate-500 uppercase">
                    Ambang
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {menipis.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/master/${p.id}/batches`}
                        className="font-medium text-cyan-800 hover:text-cyan-900"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {p.sku || "-"} — {formatRupiah(p.price)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">
                      {p.quantity}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-slate-600">
                      {p.lowStockAt}
                    </td>
                    <td className="px-4 py-2">
                      {p.quantity === 0 ? (
                        <Badge tone="bad">Habis</Badge>
                      ) : (
                        <Badge tone="warn">Menipis</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Expired / &lt; {EXPIRY_WARNING_DAYS} hari (FEFO terdekat dulu)
          </h2>
          {batches.length === 0 ? (
            <EmptyState message="Tidak ada batch dekat expired." />
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Obat / Batch
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Expired
                  </th>
                  <th className="px-4 py-2 text-right text-xs text-slate-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {batches.map((b) => {
                  const days = sisaHari(b.expiredAt);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2">
                        <span className="font-medium text-slate-900">
                          {b.product.name}
                        </span>
                        <div className="text-xs text-slate-500">
                          {b.batchNo} — {b.product.sku || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {formatTanggalID(b.expiredAt)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {b.quantity}
                      </td>
                      <td className="px-4 py-2">
                        {days < 0 ? (
                          <Badge tone="bad">Expired</Badge>
                        ) : days <= 30 ? (
                          <Badge tone="bad">{days} hari</Badge>
                        ) : (
                          <Badge tone="warn">{days} hari</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
