import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/roles";
import { hasSufficientRole } from "@/lib/role-rank";
import { formatRupiah, CATEGORY_LABELS, sisaHari } from "@/lib/format";
import SideBar from "../components/sidebar";
import { Badge, EmptyState } from "../components/ui";

export default async function MasterPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; kategori?: string }>;
}) {
  const ctx = await getStaffContext();
  const params = await searchParams;
  const query = (params.query || "").trim();
  const kategori = (params.kategori || "").trim();
  const canManage = hasSufficientRole(ctx.role, "APOTEKER");

  const products = await prisma.product.findMany({
    where: {
      userId: ctx.ownerId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { sku: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(kategori ? { category: kategori as never } : {}),
    },
    orderBy: { name: "asc" },
    take: 50,
    include: { batches: { select: { quantity: true, expiredAt: true } } },
  });

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/master" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Master Obat
            </h1>
            <p className="text-sm text-slate-600">
              {products.length} obat terdaftar
              {!canManage && " (mode lihat saja untuk kasir)"}
            </p>
          </div>
          {canManage && (
            <Link
              href="/master/new"
              className="px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 font-semibold"
            >
              + Tambah Obat
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <form action="/master" method="GET" className="flex gap-2">
            <input
              name="query"
              defaultValue={query}
              placeholder="Cari nama / SKU..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
            />
            <select
              name="kategori"
              defaultValue={kategori}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Semua kategori</option>
              <option value="BEBAS">Bebas</option>
              <option value="BEBAS_TERBATAS">Bebas Terbatas</option>
              <option value="KERAS">Keras</option>
            </select>
            <button className="px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800">
              Cari
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          {products.length === 0 ? (
            <EmptyState message="Belum ada obat. Tambahkan obat pertama apotek." />
          ) : (
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50">
                <tr>
                  {["Obat", "Kategori", "Harga Jual", "Stok", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                  {canManage && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((p) => {
                  const soonest = p.batches.length
                    ? Math.min(...p.batches.map((b) => sisaHari(b.expiredAt)))
                    : null;
                  const low =
                    p.lowStockAt != null && p.quantity <= p.lowStockAt;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {p.name}
                          {p.requiresPrescription && (
                            <Badge tone="bad">K</Badge>
                          )}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {p.sku || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {CATEGORY_LABELS[p.category] ?? p.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right tabular-nums">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 tabular-nums">
                        {p.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-1">
                        {p.quantity === 0 ? (
                          <Badge tone="bad">Habis</Badge>
                        ) : low ? (
                          <Badge tone="warn">Menipis</Badge>
                        ) : (
                          <Badge tone="ok">Aman</Badge>
                        )}
                        {soonest !== null && soonest <= 90 && (
                          <Badge tone="warn">Exp {soonest} hari</Badge>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/master/${p.id}/edit`}
                            className="text-cyan-700 hover:text-cyan-900 font-medium"
                          >
                            Ubah
                          </Link>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
