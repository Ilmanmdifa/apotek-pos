"use server";

import { redirect } from "next/navigation";
import { writeAudit } from "../audit";
import { prisma } from "../prisma";
import { requireStaff } from "../roles";
import { ProductFormSchema } from "../validations/master";

function formToProductInput(formData: FormData) {
  return ProductFormSchema.safeParse({
    name: formData.get("name") ?? "",
    sku: formData.get("sku") ?? "",
    price: formData.get("price"),
    buyPrice: formData.get("buyPrice") ?? 0,
    lowStockAt: formData.get("lowStockAt") ?? undefined,
    category: formData.get("category") ?? "BEBAS",
    requiresPrescription: formData.get("requiresPrescription") ?? false,
    supplier: formData.get("supplier") ?? "",
    location: formData.get("location") ?? "",
  });
}

export async function createMasterProduct(formData: FormData) {
  const ctx = await requireStaff("APOTEKER");
  const parsed = formToProductInput(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");
  }

  if (parsed.data.sku) {
    const clash = await prisma.product.findFirst({
      where: { userId: ctx.ownerId, sku: parsed.data.sku },
      select: { id: true },
    });
    if (clash) throw new Error("SKU sudah digunakan di apotek ini");
  }

  const created = await prisma.product.create({
    data: { ...parsed.data, userId: ctx.ownerId, quantity: 0 },
  });

  await writeAudit({
    userId: ctx.ownerId,
    actorId: ctx.stackUserId,
    action: "CREATE",
    entity: "Product",
    entityId: created.id,
    after: created,
  });

  redirect("/master");
}

export async function updateMasterProduct(formData: FormData) {
  const ctx = await requireStaff("APOTEKER");
  const id = String(formData.get("id") || "");
  const parsed = formToProductInput(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");
  }

  const before = await prisma.product.findFirst({
    where: { id, userId: ctx.ownerId },
  });
  if (!before) throw new Error("Obat tidak ditemukan");

  if (parsed.data.sku) {
    const clash = await prisma.product.findFirst({
      where: { userId: ctx.ownerId, sku: parsed.data.sku, NOT: { id } },
      select: { id: true },
    });
    if (clash) throw new Error("SKU sudah digunakan di apotek ini");
  }

  const after = await prisma.product.update({
    where: { id },
    data: { ...parsed.data },
  });

  await writeAudit({
    userId: ctx.ownerId,
    actorId: ctx.stackUserId,
    action: "UPDATE",
    entity: "Product",
    entityId: id,
    before,
    after,
  });

  redirect("/master");
}

export async function deleteMasterProduct(formData: FormData) {
  const ctx = await requireStaff("APOTEKER");
  const id = String(formData.get("id") || "");

  const existing = await prisma.product.findFirst({
    where: { id, userId: ctx.ownerId },
    include: {
      _count: { select: { batches: true, saleItems: true } },
    },
  });
  if (!existing) throw new Error("Obat tidak ditemukan");
  if (existing._count.batches > 0 || existing._count.saleItems > 0) {
    throw new Error("Tidak bisa dihapus: obat sudah punya batch/riwayat jual");
  }

  await prisma.product.delete({ where: { id } });

  await writeAudit({
    userId: ctx.ownerId,
    actorId: ctx.stackUserId,
    action: "DELETE",
    entity: "Product",
    entityId: id,
    before: existing,
  });

  redirect("/master");
}
