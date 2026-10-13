"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAudit } from "../audit";
import { prisma } from "../prisma";
import { requireStaff } from "../roles";
import { recalcProductQty } from "../stock";
import { BatchFormSchema } from "../validations/master";

export async function addBatch(formData: FormData) {
  const ctx = await requireStaff("APOTEKER");
  const parsed = BatchFormSchema.safeParse({
    productId: formData.get("productId") ?? "",
    batchNo: formData.get("batchNo") ?? "",
    expiredAt: formData.get("expiredAt"),
    quantity: formData.get("quantity"),
    buyPrice: formData.get("buyPrice") ?? undefined,
    supplier: formData.get("supplier") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data batch tidak valid");
  }

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, userId: ctx.ownerId },
  });
  if (!product) throw new Error("Obat tidak ditemukan");

  const clash = await prisma.stockBatch.findUnique({
    where: {
      productId_batchNo: { productId: product.id, batchNo: parsed.data.batchNo },
    },
    select: { id: true },
  });
  if (clash) throw new Error("No. batch sudah dipakai untuk obat ini");

  const batch = await prisma.stockBatch.create({
    data: {
      userId: ctx.ownerId,
      productId: product.id,
      batchNo: parsed.data.batchNo,
      expiredAt: parsed.data.expiredAt,
      quantity: parsed.data.quantity,
      buyPrice: parsed.data.buyPrice,
      supplier: parsed.data.supplier,
    },
  });

  await prisma.stockMovement.create({
    data: {
      userId: ctx.ownerId,
      productId: product.id,
      batchId: batch.id,
      type: "IN",
      qtyChange: parsed.data.quantity,
      reason: `Pembelian batch ${parsed.data.batchNo}`,
      actorId: ctx.stackUserId,
    },
  });

  await recalcProductQty(product.id);

  await writeAudit({
    userId: ctx.ownerId,
    actorId: ctx.stackUserId,
    action: "BATCH_IN",
    entity: "StockBatch",
    entityId: batch.id,
    after: batch,
  });

  redirect(`/master/${product.id}/batches`);
}

const AdjustSchema = z.object({
  batchId: z.string().min(1),
  newQty: z.coerce.number().int().min(0, "Qty hasil opname minimal 0"),
  reason: z.string().trim().min(1, "Alasan wajib diisi").max(200),
});

export async function adjustBatch(formData: FormData) {
  const ctx = await requireStaff("APOTEKER");
  const parsed = AdjustSchema.safeParse({
    batchId: formData.get("batchId") ?? "",
    newQty: formData.get("newQty"),
    reason: formData.get("reason") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data opname tidak valid");
  }

  const batch = await prisma.stockBatch.findFirst({
    where: { id: parsed.data.batchId, userId: ctx.ownerId },
  });
  if (!batch) throw new Error("Batch tidak ditemukan");

  const diff = parsed.data.newQty - batch.quantity;

  const updated = await prisma.stockBatch.update({
    where: { id: batch.id },
    data: { quantity: parsed.data.newQty },
  });

  if (diff !== 0) {
    await prisma.stockMovement.create({
      data: {
        userId: ctx.ownerId,
        productId: batch.productId,
        batchId: batch.id,
        type: "ADJUST",
        qtyChange: diff,
        reason: `Opname: ${parsed.data.reason}`,
        actorId: ctx.stackUserId,
      },
    });
  }

  await recalcProductQty(batch.productId);

  await writeAudit({
    userId: ctx.ownerId,
    actorId: ctx.stackUserId,
    action: "BATCH_ADJUST",
    entity: "StockBatch",
    entityId: batch.id,
    before: batch,
    after: updated,
  });

  redirect(`/master/${batch.productId}/batches`);
}
