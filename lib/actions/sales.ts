"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAudit } from "../audit";
import { calcTotals, assertPayable, assertPrescription } from "../kasir";
import { prisma } from "../prisma";
import { requireStaff } from "../roles";
import { allocateFEFO, recalcProductQty } from "../stock";
import { CheckoutSchema } from "../validations/sale";
function notaDay(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}${mm}${yy}`;
}

export interface CheckoutResult {
  saleId: string;
  notaNo: string;
  grandTotal: number;
  paid: number;
  change: number;
}

export async function checkoutSale(input: unknown): Promise<CheckoutResult> {
  const ctx = await requireStaff("KASIR");
  const parsed = CheckoutSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data penjualan tidak valid");
  }

  const { items, discount, tax, payMethod, payStatus, paid } = parsed.data;

  const products = await prisma.product.findMany({
    where: { userId: ctx.ownerId, id: { in: items.map((i) => i.productId) } },
    include: { batches: { orderBy: { expiredAt: "asc" } } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const p = byId.get(item.productId);
    if (!p) throw new Error("Obat tidak ditemukan");
    const stock = p.batches.reduce((s, b) => s + b.quantity, 0);
    if (item.qty > stock) {
      throw new Error(`Stok ${p.name} tidak mencukupi (sisa ${stock})`);
    }
    if (p.requiresPrescription) {
      assertPrescription(
        [{ requiresPrescription: true, name: p.name }],
        parsed.data.prescriptionNo,
        parsed.data.doctorName,
      );
    }
  }

  const lines = items.map((i) => {
    const p = byId.get(i.productId)!;
    return { price: Number(p.price), qty: i.qty };
  });
  const { subtotal, grandTotal } = calcTotals(lines, discount, tax);
  const change = assertPayable({ grandTotal, paid, payStatus });

  const now = new Date();
  const dayKey = notaDay(now);
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const todayCount = await tx.sale.count({
          where: { userId: ctx.ownerId, createdAt: { gte: dayStart } },
        });
        const notaNo = `TR-${dayKey}-${String(todayCount + 1 + attempt).padStart(3, "0")}`;

        const saleItems: {
          productId: string;
          batchId: string;
          quantity: number;
          sellPrice: Prisma.Decimal;
          buyPrice: Prisma.Decimal;
          subtotal: Prisma.Decimal;
        }[] = [];
        const movements: {
          productId: string;
          batchId: string;
          quantity: number;
        }[] = [];

        for (const item of items) {
          const p = byId.get(item.productId)!;
          const fresh = await tx.stockBatch.findMany({
            where: { productId: p.id },
            orderBy: { expiredAt: "asc" },
          });
          const alloc = allocateFEFO(fresh, item.qty);
          if (!alloc) {
            throw new Error(`Stok ${p.name} berubah, ulangi transaksi`);
          }
          for (const a of alloc) {
            await tx.stockBatch.update({
              where: { id: a.batchId },
              data: { quantity: { decrement: a.take } },
            });
            const sellPrice = Number(p.price);
            saleItems.push({
              productId: p.id,
              batchId: a.batchId,
              quantity: a.take,
              sellPrice: new Prisma.Decimal(sellPrice),
              buyPrice: new Prisma.Decimal(Number(p.buyPrice)),
              subtotal: new Prisma.Decimal(sellPrice * a.take),
            });
            movements.push({
              productId: p.id,
              batchId: a.batchId,
              quantity: a.take,
            });
          }
        }

        const sale = await tx.sale.create({
          data: {
            userId: ctx.ownerId,
            notaNo,
            cashierId: ctx.stackUserId,
            subtotal: new Prisma.Decimal(subtotal),
            discount: new Prisma.Decimal(discount),
            tax: new Prisma.Decimal(tax),
            grandTotal: new Prisma.Decimal(grandTotal),
            payMethod,
            payStatus,
            paid: new Prisma.Decimal(paid),
            change: new Prisma.Decimal(change),
            prescriptionNo: parsed.data.prescriptionNo,
            doctorName: parsed.data.doctorName,
            items: { create: saleItems },
          },
        });

        await tx.stockMovement.createMany({
          data: movements.map((m) => ({
            userId: ctx.ownerId,
            productId: m.productId,
            batchId: m.batchId,
            type: "OUT" as const,
            qtyChange: -m.quantity,
            reason: `Penjualan ${notaNo}`,
            refSaleId: sale.id,
            actorId: ctx.stackUserId,
          })),
        });

        for (const item of items) {
          await recalcProductQty(item.productId, tx);
        }

        await tx.auditLog.create({
          data: {
            userId: ctx.ownerId,
            actorId: ctx.stackUserId,
            action: "SALE",
            entity: "Sale",
            entityId: sale.id,
            afterJson: { notaNo, grandTotal, payMethod },
          },
        });

        return {
          saleId: sale.id,
          notaNo,
          grandTotal,
          paid,
          change,
        };
      });
    } catch (e) {
      lastError = e;
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue;
      }
      throw e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Gagal menyimpan penjualan");
}

const ReturnSchema = z.object({
  saleId: z.string().min(1),
  reason: z.string().trim().min(1, "Alasan retur wajib diisi").max(200),
});

export async function returnSale(formData: FormData) {
  const ctx = await requireStaff("KASIR");
  const parsed = ReturnSchema.safeParse({
    saleId: formData.get("saleId") ?? "",
    reason: formData.get("reason") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data retur tidak valid");
  }

  const sale = await prisma.sale.findFirst({
    where: { id: parsed.data.saleId, userId: ctx.ownerId },
    include: { items: true },
  });
  if (!sale) throw new Error("Nota tidak ditemukan");
  if (sale.isReturned) throw new Error("Nota ini sudah diretur");

  await prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      await tx.stockBatch.update({
        where: { id: item.batchId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    await tx.stockMovement.createMany({
      data: sale.items.map((item) => ({
        userId: ctx.ownerId,
        productId: item.productId,
        batchId: item.batchId,
        type: "IN" as const,
        qtyChange: item.quantity,
        reason: `Retur ${sale.notaNo}: ${parsed.data.reason}`,
        refSaleId: sale.id,
        actorId: ctx.stackUserId,
      })),
    });

    await tx.sale.update({
      where: { id: sale.id },
      data: {
        isReturned: true,
        returnedReason: parsed.data.reason,
        returnedAt: new Date(),
      },
    });

    for (const item of sale.items) {
      await recalcProductQty(item.productId, tx);
    }

    await tx.auditLog.create({
      data: {
        userId: ctx.ownerId,
        actorId: ctx.stackUserId,
        action: "RETURN",
        entity: "Sale",
        entityId: sale.id,
        beforeJson: { notaNo: sale.notaNo, isReturned: false },
        afterJson: { notaNo: sale.notaNo, isReturned: true, reason: parsed.data.reason },
      },
    });
  });

  redirect("/riwayat");
}
