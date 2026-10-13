import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/roles";
import { formatTanggalID } from "@/lib/format";
import SideBar from "../../components/sidebar";
import { Badge, PrintButton } from "../../components/ui";
import { Struk } from "../../components/struk";

export default async function NotaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getStaffContext();
  const { id } = await params;

  const sale = await prisma.sale.findFirst({
    where: { id, userId: ctx.ownerId },
    include: { items: { include: { product: { select: { name: true } } } } },
  });
  if (!sale) notFound();

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/riwayat" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="print-struk max-w-md mx-auto bg-white rounded-lg border border-slate-200 p-6">
          <Struk
            notaNo={sale.notaNo}
            tanggal={formatTanggalID(sale.createdAt)}
            payMethod={sale.payMethod}
            items={sale.items.map((i) => ({
              name: i.product.name,
              qty: i.quantity,
              price: Number(i.sellPrice),
              subtotal: Number(i.subtotal),
            }))}
            subtotal={Number(sale.subtotal)}
            discount={Number(sale.discount)}
            grandTotal={Number(sale.grandTotal)}
            paid={Number(sale.paid)}
            change={Number(sale.change)}
            prescriptionNo={sale.prescriptionNo}
            doctorName={sale.doctorName}
          />

          <div className="no-print mt-4 text-center">
            {sale.isReturned ? (
              <Badge tone="warn">Diretur: {sale.returnedReason}</Badge>
            ) : (
              <Badge tone="ok">Selesai</Badge>
            )}
          </div>

          <div className="no-print flex gap-2 mt-6">
            <PrintButton>Cetak</PrintButton>
            <Link
              href="/riwayat"
              className="flex-1 px-4 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 font-semibold text-center"
            >
              Kembali
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
