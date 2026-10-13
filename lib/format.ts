export function formatRupiah(
  value: number | string | { toString(): string },
): string {
  const n = Number(value?.toString() ?? 0);
  if (Number.isNaN(n)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatTanggalID(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function sisaHari(expiredAt: Date | string): number {
  const exp = expiredAt instanceof Date ? expiredAt : new Date(expiredAt);
  const now = new Date();
  return Math.ceil((exp.getTime() - now.getTime()) / 86400000);
}

export const CATEGORY_LABELS: Record<string, string> = {
  BEBAS: "Bebas",
  BEBAS_TERBATAS: "Bebas Terbatas",
  KERAS: "Keras",
};
