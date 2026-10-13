import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMasterProduct } from "@/lib/actions/master";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/roles";
import { formatRupiah, formatTanggalID } from "@/lib/format";
import SideBar from "../../../components/sidebar";
import { ProductForm } from "../../product-form";

export default async function EditMasterPage({
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

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/master" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Ubah Obat</h1>
          <p className="text-sm text-slate-600">{product.name}</p>
        </div>

        <div className="max-w-2xl bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <ProductForm
            mode="edit"
            initial={{
              id: product.id,
              name: product.name,
              sku: product.sku,
              price: product.price.toString(),
              buyPrice: product.buyPrice.toString(),
              lowStockAt: product.lowStockAt,
              category: product.category,
              requiresPrescription: product.requiresPrescription,
              supplier: product.supplier,
              location: product.location,
            }}
          />
        </div>

        <div className="max-w-2xl bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Batch ({product.batches.length})
            </h2>
            <Link
              href={`/master/${product.id}/batches`}
              className="text-sm text-cyan-700 hover:text-cyan-900 font-medium"
            >
              Kelola batch
            </Link>
          </div>
          {product.batches.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada batch.{" "}
              <Link
                href={`/master/${product.id}/batches`}
                className="text-cyan-700 hover:text-cyan-900 font-medium"
              >
                Tambah batch pertama
              </Link>
              .
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Batch
                  </th>
                  <th className="px-4 py-2 text-left text-xs text-slate-500 uppercase">
                    Expired
                  </th>
                  <th className="px-4 py-2 text-right text-xs text-slate-500 uppercase">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {product.batches.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2 text-slate-900">{b.batchNo}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {formatTanggalID(b.expiredAt)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {b.quantity} ({formatRupiah(b.buyPrice ?? 0)}/unit beli)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="max-w-2xl bg-white rounded-lg border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Hapus</h2>
          <p className="text-sm text-slate-600 mb-4">
            Hanya bisa dihapus jika belum punya batch dan riwayat jual.
          </p>
          <form action={deleteMasterProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
              Hapus Obat
            </button>
          </form>
          <Link
            href="/master"
            className="inline-block mt-4 text-sm text-slate-600 hover:text-slate-900"
          >
            Kembali ke daftar
          </Link>
        </div>
      </main>
    </div>
  );
}
