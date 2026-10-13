"use client";

import { useMemo, useRef, useState } from "react";
import { checkoutSale } from "@/lib/actions/sales";
import { calcTotals } from "@/lib/kasir";
import { formatRupiah } from "@/lib/format";
import { Badge, EmptyState, Field, inputClass } from "../components/ui";
import { Struk } from "../components/struk";

export interface KasirProduct {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  requiresPrescription: boolean;
}

interface CartLine {
  productId: string;
  name: string;
  price: number;
  stock: number;
  requiresPrescription: boolean;
  qty: number;
}

interface Receipt {
  notaNo: string;
  tanggal: string;
  grandTotal: number;
  subtotal: number;
  discount: number;
  paid: number;
  change: number;
  payMethod: string;
  items: { name: string; qty: number; price: number }[];
  prescriptionNo?: string;
  doctorName?: string;
}

const PAY_LABELS: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
};

export function KasirClient({ products }: { products: KasirProduct[] }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payStatus, setPayStatus] = useState("LUNAS");
  const [paid, setPaid] = useState("");
  const [prescriptionNo, setPrescriptionNo] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, products]);

  const needsRx = cart.some((l) => l.requiresPrescription);
  const discountNum = Number(discount) || 0;
  const paidNum = Number(paid) || 0;
  const { subtotal, grandTotal } = calcTotals(
    cart.map((l) => ({ price: l.price, qty: l.qty })),
    discountNum,
    0,
  );
  const change = payStatus === "LUNAS" ? Math.max(paidNum - grandTotal, 0) : 0;

  function addToCart(p: KasirProduct) {
    setError("");
    setCart((prev) => {
      const line = prev.find((l) => l.productId === p.id);
      if (line) {
        if (line.qty + 1 > p.stock) {
          setError(`Stok ${p.name} tidak mencukupi (sisa ${p.stock})`);
          return prev;
        }
        return prev.map((l) =>
          l.productId === p.id ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      if (p.stock < 1) {
        setError(`Stok ${p.name} habis`);
        return prev;
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          requiresPrescription: p.requiresPrescription,
          qty: 1,
        },
      ];
    });
    setQuery("");
    searchRef.current?.focus();
  }

  function setQty(productId: string, qty: number) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) =>
            l.productId === productId
              ? { ...l, qty: Math.min(qty, l.stock) }
              : l,
          ),
    );
  }

  async function submit() {
    setError("");
    if (cart.length === 0) {
      setError("Keranjang kosong");
      return;
    }
    if (needsRx && (!prescriptionNo.trim() || !doctorName.trim())) {
      setError("Obat keras wajib no. resep + nama dokter");
      return;
    }
    if (payStatus === "LUNAS" && paidNum < grandTotal) {
      setError("Nominal bayar kurang dari total");
      return;
    }
    setSaving(true);
    try {
      const snapshot = cart.map((l) => ({
        name: l.name,
        qty: l.qty,
        price: l.price,
      }));
      const res = await checkoutSale({
        items: cart.map((l) => ({ productId: l.productId, qty: l.qty })),
        discount: discountNum,
        tax: 0,
        payMethod,
        payStatus,
        paid: paidNum,
        prescriptionNo: prescriptionNo.trim() || undefined,
        doctorName: doctorName.trim() || undefined,
      });
      const now = new Date();
      setReceipt({
        ...res,
        tanggal: `${now.toLocaleDateString("id-ID")} ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
        subtotal,
        discount: Math.min(discountNum, subtotal),
        payMethod,
        items: snapshot,
        prescriptionNo: prescriptionNo.trim() || undefined,
        doctorName: doctorName.trim() || undefined,
      });
      setCart([]);
      setDiscount("");
      setPaid("");
      setPrescriptionNo("");
      setDoctorName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan penjualan");
    } finally {
      setSaving(false);
    }
  }

  if (receipt) {
    return (
      <div className="print-struk max-w-md mx-auto bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <Struk
          notaNo={receipt.notaNo}
          tanggal={receipt.tanggal}
          payMethod={PAY_LABELS[receipt.payMethod] ?? receipt.payMethod}
          items={receipt.items.map((i) => ({
            ...i,
            subtotal: i.price * i.qty,
          }))}
          subtotal={receipt.subtotal}
          discount={receipt.discount}
          grandTotal={receipt.grandTotal}
          paid={receipt.paid}
          change={receipt.change}
          prescriptionNo={receipt.prescriptionNo}
          doctorName={receipt.doctorName}
        />
        <div className="no-print flex gap-2 mt-6">
          <button
            onClick={() => window.print()}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold"
          >
            Cetak (P)
          </button>
          <button
            onClick={() => setReceipt(null)}
            className="flex-1 px-4 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 font-semibold"
          >
            Transaksi Baru (N)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <Field label="Cari obat (nama / SKU / barcode)">
          <input
            ref={searchRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results.length > 0) {
                addToCart(results[0]);
              }
            }}
            placeholder="Ketik lalu Enter untuk tambah teratas..."
            className={inputClass}
          />
        </Field>
        <div className="mt-4 space-y-2">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock < 1}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-cyan-600 hover:bg-cyan-50/50 text-left disabled:opacity-50"
            >
              <span>
                <span className="font-medium text-slate-900 flex items-center gap-2">
                  {p.name}
                  {p.requiresPrescription && <Badge tone="bad">K</Badge>}
                </span>
                <span className="text-xs text-slate-500">
                  {p.sku || "-"} — stok {p.stock}
                </span>
              </span>
              <span className="font-semibold tabular-nums">
                {formatRupiah(p.price)}
              </span>
            </button>
          ))}
          {results.length === 0 && (
            <EmptyState message="Obat tidak ditemukan." />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm lg:sticky lg:top-8 self-start">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Keranjang ({cart.length})
        </h2>
        {cart.length === 0 ? (
          <EmptyState message="Keranjang kosong. Cari obat di kiri." />
        ) : (
          <div className="space-y-2 mb-4">
            {cart.map((l) => (
              <div
                key={l.productId}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50"
              >
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {l.name}
                  <span className="block text-xs text-slate-500 tabular-nums">
                    {formatRupiah(l.price)} × {l.qty} ={" "}
                    {formatRupiah(l.price * l.qty)}
                  </span>
                </span>
                <button
                  onClick={() => setQty(l.productId, l.qty - 1)}
                  className="w-8 h-8 rounded-lg bg-slate-200 font-bold"
                  aria-label="Kurangi"
                >
                  −
                </button>
                <span className="w-8 text-center tabular-nums font-semibold">
                  {l.qty}
                </span>
                <button
                  onClick={() => setQty(l.productId, l.qty + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-200 font-bold"
                  aria-label="Tambah"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Diskon (Rp)">
            <input
              type="number"
              min="0"
              value={discount}
              placeholder="0"
              onChange={(e) => setDiscount(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Metode bayar">
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className={inputClass}
            >
              <option value="CASH">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </Field>
        </div>

        {payMethod !== "CASH" && (
          <div className="mb-4">
            <Field label="Status bayar">
              <select
                value={payStatus}
                onChange={(e) => setPayStatus(e.target.value)}
                className={inputClass}
              >
                <option value="LUNAS">Lunas</option>
                <option value="PENDING">Pending (verifikasi manual)</option>
              </select>
            </Field>
          </div>
        )}

        {needsRx && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <Field label="No. resep *">
              <input
                value={prescriptionNo}
                onChange={(e) => setPrescriptionNo(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Nama dokter *">
              <input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        <div className="text-sm space-y-1 tabular-nums mb-4">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Diskon</span>
            <span>−{formatRupiah(Math.min(discountNum, subtotal))}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>{formatRupiah(grandTotal)}</span>
          </div>
        </div>

        <div className="mb-4">
          <Field label="Dibayar (Rp)">
            <input
              type="number"
              min="0"
              value={paid}
              placeholder="0"
              onChange={(e) => setPaid(e.target.value)}
              className={`${inputClass} text-lg font-bold tabular-nums`}
            />
          </Field>
          {payStatus === "LUNAS" && (
            <p className="mt-1 text-sm text-slate-600 tabular-nums">
              Kembalian:{" "}
              <span className="font-bold">{formatRupiah(change)}</span>
            </p>
          )}
        </div>

        {error && (
          <p className="mb-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={saving || cart.length === 0}
          className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-lg disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : `Bayar ${formatRupiah(grandTotal)}`}
        </button>
      </div>
    </div>
  );
}
