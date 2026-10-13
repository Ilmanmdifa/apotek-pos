export interface CartLineInput {
  price: number;
  qty: number;
}

export function calcTotals(
  lines: CartLineInput[],
  discount: number,
  tax: number,
): { subtotal: number; grandTotal: number } {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const safeTax = Math.max(tax, 0);
  return { subtotal, grandTotal: subtotal - safeDiscount + safeTax };
}

export function assertPayable(args: {
  grandTotal: number;
  paid: number;
  payStatus: "LUNAS" | "PENDING";
}): number {
  if (args.payStatus === "LUNAS" && args.paid < args.grandTotal) {
    throw new Error(
      `Nominal kurang: total ${args.grandTotal}, dibayar ${args.paid}`,
    );
  }
  return args.payStatus === "LUNAS" ? args.paid - args.grandTotal : 0;
}

export function assertPrescription(
  lines: { requiresPrescription: boolean; name: string }[],
  prescriptionNo?: string,
  doctorName?: string,
): void {
  const need = lines.filter((l) => l.requiresPrescription);
  if (need.length > 0 && (!prescriptionNo || !doctorName)) {
    throw new Error(
      `Obat keras ${need[0].name} wajib no. resep + nama dokter`,
    );
  }
}
