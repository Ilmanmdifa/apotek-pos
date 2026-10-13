import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/roles";
import SideBar from "../components/sidebar";
import { KasirClient, type KasirProduct } from "./kasir-client";

export default async function KasirPage() {
  const ctx = await getStaffContext();

  const rows = await prisma.product.findMany({
    where: { userId: ctx.ownerId },
    orderBy: { name: "asc" },
    take: 200,
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      quantity: true,
      requiresPrescription: true,
      batches: { select: { quantity: true } },
    },
  });

  const products: KasirProduct[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    stock: p.batches.reduce((s, b) => s + b.quantity, 0),
    requiresPrescription: p.requiresPrescription,
  }));

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/kasir" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Kasir</h1>
          <p className="text-sm text-slate-600">
            Cari obat, masukkan keranjang, bayar. Stok otomatis berkurang FEFO.
          </p>
        </div>
        <KasirClient products={products} />
      </main>
    </div>
  );
}
