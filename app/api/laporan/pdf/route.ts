import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { prisma } from "@/lib/prisma";
import { summarizeSales, parseRange } from "@/lib/laporan";
import { buildLaporanPdf } from "@/lib/pdf-laporan";
import { formatTanggalID } from "@/lib/format";

export async function GET(req: Request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Harus masuk" }, { status: 401 });
  }

  const staff = await prisma.staffMember.findUnique({
    where: { userId: user.id },
  });
  const role = staff?.role ?? "OWNER";
  if (role !== "OWNER") {
    return NextResponse.json({ error: "Tidak berwenang" }, { status: 403 });
  }
  const ownerId = staff?.ownerId ?? user.id;

  const url = new URL(req.url);
  const { start, end } = parseRange(
    url.searchParams.get("mulai") ?? undefined,
    url.searchParams.get("akhir") ?? undefined,
  );

  const sales = await prisma.sale.findMany({
    where: { userId: ownerId, createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { items: true, _count: { select: { items: true } } },
  });

  const summary = summarizeSales(sales);
  const stamp = new Date();
  const nomor = `LAP-${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}-${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}${String(stamp.getSeconds()).padStart(2, "0")}`;

  const pdf = await buildLaporanPdf({
    kop: "APOTEK POS",
    nomor,
    periode: `${formatTanggalID(start)} - ${formatTanggalID(end)}`,
    omzet: summary.omzet,
    struk: summary.struk,
    laba: summary.laba,
    retur: summary.retur,
    rows: sales.map((s) => ({
      notaNo: s.notaNo,
      tanggal: formatTanggalID(s.createdAt),
      itemCount: s._count.items,
      payMethod: s.payMethod,
      total: Number(s.grandTotal),
      isReturned: s.isReturned,
    })),
  });

  const body = Buffer.from(pdf);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="laporan.pdf"',
      "Content-Length": String(body.length),
    },
  });
}
