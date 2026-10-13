interface SaleRow {
  grandTotal: unknown;
  discount: unknown;
  payMethod: string;
  isReturned: boolean;
  createdAt: Date;
  items: { quantity: number; sellPrice: unknown; buyPrice: unknown }[];
}

const num = (v: unknown): number => Number(String(v ?? 0)) || 0;

export interface SalesSummary {
  omzet: number;
  struk: number;
  diskon: number;
  hpp: number;
  laba: number;
  retur: number;
  byMethod: Record<string, { count: number; total: number }>;
}

export function summarizeSales(sales: SaleRow[]): SalesSummary {
  const active = sales.filter((s) => !s.isReturned);
  const byMethod: SalesSummary["byMethod"] = {};
  let omzet = 0;
  let diskon = 0;
  let hpp = 0;
  for (const s of active) {
    const total = num(s.grandTotal);
    omzet += total;
    diskon += num(s.discount);
    hpp += s.items.reduce(
      (sum, i) => sum + num(i.buyPrice) * i.quantity,
      0,
    );
    const m = byMethod[s.payMethod] ?? { count: 0, total: 0 };
    m.count += 1;
    m.total += total;
    byMethod[s.payMethod] = m;
  }
  return {
    omzet,
    struk: active.length,
    diskon,
    hpp,
    laba: omzet - hpp,
    retur: sales.length - active.length,
    byMethod,
  };
}

export interface DailyPoint {
  date: string;
  label: string;
  omzet: number;
}

export function dailySeries(sales: SaleRow[]): DailyPoint[] {
  const map = new Map<string, number>();
  for (const s of sales) {
    if (s.isReturned) continue;
    const d = s.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + num(s.grandTotal));
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, omzet]) => ({
      date,
      label: date.slice(5).replace("-", "/"),
      omzet,
    }));
}

export function parseRange(
  mulai: string | undefined,
  akhir: string | undefined,
): { start: Date; end: Date } {
  const end = akhir ? new Date(akhir + "T23:59:59") : new Date();
  const start = mulai
    ? new Date(mulai + "T00:00:00")
    : new Date(end.getTime() - 13 * 86400000);
  return { start, end };
}
