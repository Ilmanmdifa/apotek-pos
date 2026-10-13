import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().int().min(1, "Qty minimal 1"),
});

export const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1, "Keranjang kosong"),
  discount: z.coerce.number().nonnegative("Diskon minimal 0").default(0),
  tax: z.coerce.number().nonnegative("Pajak minimal 0").default(0),
  payMethod: z.enum(["CASH", "QRIS", "TRANSFER"]),
  payStatus: z.enum(["LUNAS", "PENDING"]).default("LUNAS"),
  paid: z.coerce.number().nonnegative("Nominal bayar minimal 0"),
  prescriptionNo: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(50).optional(),
  ),
  doctorName: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100).optional(),
  ),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
