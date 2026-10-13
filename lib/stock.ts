import type { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

type Db = PrismaClient | Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function recalcProductQty(productId: string, db: Db = prisma) {
  const agg = await (db as PrismaClient).stockBatch.aggregate({
    where: { productId },
    _sum: { quantity: true },
  });
  await (db as PrismaClient).product.update({
    where: { id: productId },
    data: { quantity: agg._sum.quantity ?? 0 },
  });
}

export interface FefoBatch {
  id: string;
  quantity: number;
  expiredAt: Date | string;
}

export interface FefoAllocation {
  batchId: string;
  take: number;
}

export function allocateFEFO(
  batches: FefoBatch[],
  qty: number,
): FefoAllocation[] | null {
  const sorted = [...batches].sort(
    (a, b) => new Date(a.expiredAt).getTime() - new Date(b.expiredAt).getTime(),
  );
  let need = qty;
  const out: FefoAllocation[] = [];
  for (const b of sorted) {
    if (need <= 0) break;
    const take = Math.min(b.quantity, need);
    if (take > 0) {
      out.push({ batchId: b.id, take });
      need -= take;
    }
  }
  return need > 0 ? null : out;
}
