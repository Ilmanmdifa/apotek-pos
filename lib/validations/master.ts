import { z } from "zod";

export const CategoryEnum = z.enum(["BEBAS", "BEBAS_TERBATAS", "KERAS"]);

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const ProductFormSchema = z.object({
  name: z.string().trim().min(1, "Nama obat wajib diisi").max(100),
  sku: z.preprocess(emptyToUndefined, z.string().trim().max(50).optional()),
  price: z.coerce.number().nonnegative("Harga jual minimal 0"),
  buyPrice: z.coerce.number().nonnegative("Harga beli minimal 0").default(0),
  lowStockAt: z.coerce.number().int().min(0).optional(),
  category: CategoryEnum.default("BEBAS"),
  requiresPrescription: z.preprocess(
    (v) => v === "on" || v === true || v === "true",
    z.boolean().default(false),
  ),
  supplier: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  location: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});

export type ProductForm = z.infer<typeof ProductFormSchema>;

export const BatchFormSchema = z.object({
  productId: z.string().min(1),
  batchNo: z.string().trim().min(1, "No. batch wajib diisi").max(50),
  expiredAt: z.coerce.date({ message: "Tanggal expired tidak valid" }),
  quantity: z.coerce.number().int().min(0, "Qty minimal 0"),
  buyPrice: z.coerce.number().nonnegative().optional(),
  supplier: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});

export type BatchForm = z.infer<typeof BatchFormSchema>;
