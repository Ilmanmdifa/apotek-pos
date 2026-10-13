import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedProduct {
  name: string;
  sku: string;
  price: string;
  buyPrice: string;
  lowStockAt: number;
  category: "BEBAS" | "BEBAS_TERBATAS" | "KERAS";
  requiresPrescription: boolean;
  supplier: string;
  batches: { batchNo: string; expiresInDays: number; qty: number }[];
}

const PRODUCTS: SeedProduct[] = [
  { name: "Paracetamol 500mg 100s", sku: "PAR-500-100", price: "15000", buyPrice: "10500", lowStockAt: 20, category: "BEBAS", requiresPrescription: false, supplier: "Kinarya Mitra", batches: [{ batchNo: "P2401", expiresInDays: 540, qty: 120 }, { batchNo: "P2311", expiresInDays: 45, qty: 30 }] },
  { name: "Amlodipine 5mg 100s", sku: "AML-5-100", price: "25000", buyPrice: "17500", lowStockAt: 15, category: "KERAS", requiresPrescription: true, supplier: "Kinarya Mitra", batches: [{ batchNo: "A2402", expiresInDays: 400, qty: 80 }] },
  { name: "Amlodipine 10mg 100s", sku: "AML-10-100", price: "32000", buyPrice: "22400", lowStockAt: 15, category: "KERAS", requiresPrescription: true, supplier: "Kinarya Mitra", batches: [{ batchNo: "A2403", expiresInDays: 60, qty: 8 }] },
  { name: "Amoxicillin 500mg 100s", sku: "AMX-500-100", price: "45000", buyPrice: "31500", lowStockAt: 10, category: "KERAS", requiresPrescription: true, supplier: "Enseval", batches: [{ batchNo: "X2401", expiresInDays: 300, qty: 50 }] },
  { name: "Cetirizine 10mg 100s", sku: "CTZ-10-100", price: "28000", buyPrice: "19000", lowStockAt: 15, category: "BEBAS_TERBATAS", requiresPrescription: false, supplier: "Enseval", batches: [{ batchNo: "C2401", expiresInDays: 500, qty: 90 }] },
  { name: "Omeprazole 20mg 100s", sku: "OMP-20-100", price: "22000", buyPrice: "15000", lowStockAt: 15, category: "BEBAS_TERBATAS", requiresPrescription: false, supplier: "Enseval", batches: [{ batchNo: "O2401", expiresInDays: 25, qty: 40 }] },
  { name: "Metformin 500mg 100s", sku: "MTF-500-100", price: "18000", buyPrice: "12000", lowStockAt: 15, category: "KERAS", requiresPrescription: true, supplier: "Kimia Farma", batches: [{ batchNo: "M2401", expiresInDays: 380, qty: 70 }] },
  { name: "Vitamin C 500mg 100s", sku: "VTC-500-100", price: "35000", buyPrice: "24000", lowStockAt: 20, category: "BEBAS", requiresPrescription: false, supplier: "Kimia Farma", batches: [{ batchNo: "V2401", expiresInDays: 600, qty: 150 }] },
  { name: "Antasida Tablet 100s", sku: "ANT-TAB-100", price: "12000", buyPrice: "8000", lowStockAt: 20, category: "BEBAS", requiresPrescription: false, supplier: "Kimia Farma", batches: [{ batchNo: "N2401", expiresInDays: 480, qty: 110 }] },
  { name: "Salbutamol 4mg 100s", sku: "SLB-4-100", price: "20000", buyPrice: "14000", lowStockAt: 10, category: "KERAS", requiresPrescription: true, supplier: "Kinarya Mitra", batches: [{ batchNo: "S2401", expiresInDays: 320, qty: 45 }] },
  { name: "Dexamethasone 0.5mg 100s", sku: "DXM-05-100", price: "16000", buyPrice: "11000", lowStockAt: 10, category: "KERAS", requiresPrescription: true, supplier: "Enseval", batches: [{ batchNo: "D2401", expiresInDays: 200, qty: 5 }] },
  { name: "Ibuprofen 400mg 100s", sku: "IBU-400-100", price: "24000", buyPrice: "16500", lowStockAt: 15, category: "BEBAS_TERBATAS", requiresPrescription: false, supplier: "Enseval", batches: [{ batchNo: "I2401", expiresInDays: 420, qty: 85 }] },
  { name: "Loratadine 10mg 50s", sku: "LOR-10-50", price: "18000", buyPrice: "12500", lowStockAt: 12, category: "BEBAS", requiresPrescription: false, supplier: "Kimia Farma", batches: [{ batchNo: "L2401", expiresInDays: 80, qty: 60 }] },
  { name: "Oralit 200ml", sku: "ORL-200", price: "8000", buyPrice: "5500", lowStockAt: 25, category: "BEBAS", requiresPrescription: false, supplier: "Kimia Farma", batches: [{ batchNo: "R2401", expiresInDays: 550, qty: 200 }] },
  { name: "Betadine 30ml", sku: "BTD-30", price: "26000", buyPrice: "18000", lowStockAt: 10, category: "BEBAS", requiresPrescription: false, supplier: "Enseval", batches: [{ batchNo: "B2401", expiresInDays: 460, qty: 55 }] },
  { name: "Ciprofloxacin 500mg 100s", sku: "CIP-500-100", price: "38000", buyPrice: "26000", lowStockAt: 10, category: "KERAS", requiresPrescription: true, supplier: "Kinarya Mitra", batches: [{ batchNo: "F2401", expiresInDays: 280, qty: 35 }] },
  { name: "Ranitidine 150mg 100s", sku: "RNT-150-100", price: "14000", buyPrice: "9500", lowStockAt: 15, category: "BEBAS_TERBATAS", requiresPrescription: false, supplier: "Kimia Farma", batches: [{ batchNo: "G2401", expiresInDays: 15, qty: 25 }] },
  { name: "Multivitamin Tablet 100s", sku: "MVT-100", price: "42000", buyPrice: "29000", lowStockAt: 12, category: "BEBAS", requiresPrescription: false, supplier: "Enseval", batches: [{ batchNo: "U2401", expiresInDays: 520, qty: 75 }] },
  { name: "Paracetamol Sirup 120ml", sku: "PAR-SYR-120", price: "18000", buyPrice: "12500", lowStockAt: 15, category: "BEBAS", requiresPrescription: false, supplier: "Kimia Farma", batches: [{ batchNo: "Y2401", expiresInDays: 380, qty: 65 }] },
  { name: "Ambroxol 30mg 100s", sku: "AMB-30-100", price: "21000", buyPrice: "14500", lowStockAt: 12, category: "BEBAS_TERBATAS", requiresPrescription: false, supplier: "Enseval", batches: [{ batchNo: "W2401", expiresInDays: 70, qty: 4 }] },
];

function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}${mm}${yy}`;
}

async function main() {
  const demoUserId = "9def617c-3149-426f-91a0-935dda5fd546";
  const now = new Date();

  await prisma.saleItem.deleteMany({ where: { sale: { userId: demoUserId } } });
  await prisma.stockMovement.deleteMany({ where: { userId: demoUserId } });
  await prisma.sale.deleteMany({ where: { userId: demoUserId } });
  await prisma.stockBatch.deleteMany({ where: { userId: demoUserId } });
  await prisma.product.deleteMany({ where: { userId: demoUserId } });

  const created = [];
  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        userId: demoUserId,
        name: p.name,
        sku: p.sku,
        price: p.price,
        buyPrice: p.buyPrice,
        quantity: 0,
        lowStockAt: p.lowStockAt,
        category: p.category,
        requiresPrescription: p.requiresPrescription,
        supplier: p.supplier,
        batches: {
          create: p.batches.map((b) => ({
            userId: demoUserId,
            batchNo: b.batchNo,
            expiredAt: new Date(now.getTime() + b.expiresInDays * 86400000),
            quantity: b.qty,
            buyPrice: p.buyPrice,
            supplier: p.supplier,
          })),
        },
      },
      include: { batches: true },
    });
    created.push({ product, stock: new Map(p.batches.map((b) => [b.batchNo, b.qty])) });
  }

  for (const pick of created) {
    for (const b of pick.product.batches) {
      await prisma.stockMovement.create({
        data: {
          userId: demoUserId,
          productId: pick.product.id,
          batchId: b.id,
          type: "IN",
          qtyChange: b.quantity,
          reason: `Stok awal batch ${b.batchNo}`,
          actorId: demoUserId,
        },
      });
    }
  }

  const payMethods = ["CASH", "CASH", "CASH", "QRIS", "TRANSFER"] as const;
  const notaSeq = new Map<string, number>();

  for (let s = 0; s < 20; s++) {
    const dayAgo = 13 - Math.floor(s / 2);
    const at = new Date(now.getTime() - dayAgo * 86400000);
    at.setHours(9 + (s % 8), 15 + (s % 30), 0, 0);
    const dayKey = fmtDate(at);
    const seq = (notaSeq.get(dayKey) ?? 0) + 1;
    notaSeq.set(dayKey, seq);
    const notaNo = `TR-${dayKey}-${String(seq).padStart(3, "0")}`;

    const itemCount = 1 + (s % 3);
    const items: { productId: string; batchId: string; qty: number; sellPrice: string; buyPrice: string }[] = [];
    for (let k = 0; k < itemCount; k++) {
      const pick = created[(s * 3 + k * 7) % created.length];
      const fefo = [...pick.product.batches].sort((a, b) => a.expiredAt.getTime() - b.expiredAt.getTime());
      const qty = 1 + ((s + k) % 4);
      let need = qty;
      for (const b of fefo) {
        if (need <= 0) break;
        const avail = pick.stock.get(b.batchNo) ?? 0;
        const take = Math.min(avail, need);
        if (take > 0) {
          items.push({ productId: pick.product.id, batchId: b.id, qty: take, sellPrice: String(pick.product.price), buyPrice: String(pick.product.buyPrice) });
          pick.stock.set(b.batchNo, avail - take);
          need -= take;
        }
      }
    }
    if (items.length === 0) continue;

    const subtotal = items.reduce((sum, i) => sum + Number(i.sellPrice) * i.qty, 0);
    const discount = s % 5 === 0 ? Math.round(subtotal * 0.05) : 0;
    const grandTotal = subtotal - discount;
    const payMethod = payMethods[s % payMethods.length];
    const paid = payMethod === "CASH" ? grandTotal + (s % 2 === 0 ? 5000 : 0) : grandTotal;

    const sale = await prisma.sale.create({
      data: {
        userId: demoUserId,
        notaNo,
        cashierId: demoUserId,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: "0",
        grandTotal: grandTotal.toFixed(2),
        payMethod,
        payStatus: "LUNAS",
        paid: paid.toFixed(2),
        change: (paid - grandTotal).toFixed(2),
        createdAt: at,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            batchId: i.batchId,
            quantity: i.qty,
            sellPrice: i.sellPrice,
            buyPrice: i.buyPrice,
            subtotal: (Number(i.sellPrice) * i.qty).toFixed(2),
          })),
        },
      },
    });

    for (const i of items) {
      await prisma.stockMovement.create({
        data: {
          userId: demoUserId,
          productId: i.productId,
          batchId: i.batchId,
          type: "OUT",
          qtyChange: -i.qty,
          reason: "Penjualan " + notaNo,
          refSaleId: sale.id,
          actorId: demoUserId,
          createdAt: at,
        },
      });
    }
  }

  for (const pick of created) {
    const remaining = [...pick.stock.values()].reduce((a, b) => a + b, 0);
    await prisma.product.update({ where: { id: pick.product.id }, data: { quantity: remaining } });
    for (const b of pick.product.batches) {
      await prisma.stockBatch.update({ where: { id: b.id }, data: { quantity: pick.stock.get(b.batchNo) ?? 0 } });
    }
  }

  console.log(`Seed OK: ${PRODUCTS.length} produk + batch + 20 penjualan untuk ${demoUserId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
