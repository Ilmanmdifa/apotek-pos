import Link from "next/link";
import { returnSale } from "@/lib/actions/sales";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/roles";
import { formatRupiah, formatTanggalID } from "@/lib/format";
import SideBar from "../components/sidebar";
import { Badge, EmptyState } from "../components/ui";

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const ctx = await getStaffContext();
  const params = await searchParams;
  const query = (params.query || "").trim();

  const sales = await prisma.sale.findMany({
    where: {
      userId: ctx.ownerId,
      ...(query
        ? { notaNo: { contains: query, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/riwayat" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-slate-600">
            Nota tidak bisa dihapus — hanya retur beralasan.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <form action="/riwayat" method="GET" className="flex gap-2">
            <input
              name="query"
              defaultValue={query}
              placeholder="Cari no. nota..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
            />
            <button className="px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800">
              Cari
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          {sales.length === 0 ? (
            <EmptyState message="Belum ada transaksi." />
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Nota
                  </th>
                  <th className="px-4 py-2 text-right text-xs text-slate-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Retur
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/riwayat/${s.id}`}
                        className="font-medium text-cyan-800 hover:text-cyan-900"
                      >
                        {s.notaNo}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {formatTanggalID(s.createdAt)} — {s._count.items} item —{" "}
                        {s.payMethod}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">
                      {formatRupiah(s.grandTotal)}
                    </td>
                    <td className="px-4 py-2">
                      {s.isReturned ? (
                        <Badge tone="warn">Diretur</Badge>
                      ) : (
                        <Badge tone="ok">Selesai</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {!s.isReturned ? (
                        <form action={returnSale} className="flex gap-2">
                          <input type="hidden" name="saleId" value={s.id} />
                          <input
                            type="text"
                            name="reason"
                            required
                            maxLength={200}
                            placeholder="Alasan..."
                            className="w-36 px-2 py-1 text-sm border border-slate-300 rounded-lg"
                          />
                          <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-semibold">
                            Retur
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {s.returnedReason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
