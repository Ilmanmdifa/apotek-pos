import Link from "next/link";
import { notFound } from "next/navigation";
import { addBatch, adjustBatch } from "@/lib/actions/batches";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/roles";
import { formatRupiah, formatTanggalID, sisaHari } from "@/lib/format";
import SideBar from "../../../components/sidebar";
import { Badge, Field, SubmitButton, EmptyState, inputClass } from "../../../components/ui";

export default async function BatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireStaff("APOTEKER");
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, userId: ctx.ownerId },
    include: { batches: { orderBy: { expiredAt: "asc" } } },
  });
  if (!product) notFound();

  const movements = await prisma.stockMovement.findMany({
    where: { userId: ctx.ownerId, productId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/master" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Batch: {product.name}
          </h1>
          <p className="text-sm text-slate-600">
            Total stok {product.quantity} (jumlah semua batch)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Tambah Batch
            </h2>
            <form action={addBatch} className="space-y-4">
              <input type="hidden" name="productId" value={product.id} />
              <Field label="No. batch *">
                <input
                  type="text"
                  name="batchNo"
                  required
                  maxLength={50}
                  placeholder="cth: B2405"
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expired *">
                  <input
                    type="date"
                    name="expiredAt"
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Qty *">
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    step="1"
                    placeholder="0"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Harga beli /unit">
                  <input
                    type="number"
                    name="buyPrice"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className={inputClass}
                  />
                </Field>
                <Field label="Supplier">
                  <input
                    type="text"
                    name="supplier"
                    maxLength={100}
                    className={inputClass}
                  />
                </Field>
              </div>
              <SubmitButton className="bg-cyan-700 text-white hover:bg-cyan-800">
                Simpan Batch
              </SubmitButton>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Daftar Batch
            </h2>
            {product.batches.length === 0 ? (
              <EmptyState message="Belum ada batch." />
            ) : (
              <div className="space-y-3">
                {product.batches.map((b) => {
                  const days = sisaHari(b.expiredAt);
                  return (
                    <div
                      key={b.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">
                          {b.batchNo}
                        </span>
                        {days < 0 ? (
                          <Badge tone="bad">Expired</Badge>
                        ) : days <= 90 ? (
                          <Badge tone="warn">Exp {days} hari</Badge>
                        ) : (
                          <Badge tone="ok">{days} hari</Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 mb-3">
                        Exp {formatTanggalID(b.expiredAt)} — Qty{" "}
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {b.quantity}
                        </span>{" "}
                        — {formatRupiah(b.buyPrice ?? 0)}/unit
                      </div>
                      <form
                        action={adjustBatch}
                        className="flex gap-2 items-end"
                      >
                        <input type="hidden" name="batchId" value={b.id} />
                        <Field label="Qty hasil opname">
                          <input
                            type="number"
                            name="newQty"
                            required
                            min="0"
                            step="1"
                            defaultValue={b.quantity}
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Alasan *">
                          <input
                            type="text"
                            name="reason"
                            required
                            maxLength={200}
                            placeholder="cth: rusak 2"
                            className={inputClass}
                          />
                        </Field>
                        <button className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold whitespace-nowrap">
                          Opname
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Riwayat Stok
          </h2>
          {movements.length === 0 ? (
            <EmptyState message="Belum ada pergerakan stok." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Waktu
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Jenis
                  </th>
                  <th className="px-4 py-2 text-right text-xs text-slate-500 uppercase">
                    Perubahan
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Alasan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 text-slate-600">
                      {formatTanggalID(m.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        tone={
                          m.type === "IN"
                            ? "ok"
                            : m.type === "OUT"
                              ? "info"
                              : "warn"
                        }
                      >
                        {m.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold">
                      {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Link
          href={`/master/${product.id}/edit`}
          className="inline-block mt-4 text-sm text-slate-600 hover:text-slate-900"
        >
          Kembali ke obat
        </Link>
      </main>
    </div>
  );
}
