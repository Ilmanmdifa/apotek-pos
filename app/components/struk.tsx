export interface StrukItem {
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

function rp(n: number | string | { toString(): string }): string {
  const v = Number(n?.toString() ?? 0);
  return new Intl.NumberFormat("id-ID").format(Number.isNaN(v) ? 0 : v);
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{left}</span>
      <span className="tabular-nums">{right}</span>
    </div>
  );
}

export function Struk({
  notaNo,
  tanggal,
  payMethod,
  items,
  subtotal,
  discount,
  grandTotal,
  paid,
  change,
  prescriptionNo,
  doctorName,
}: {
  notaNo: string;
  tanggal: string;
  payMethod: string;
  items: StrukItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paid: number;
  change: number;
  prescriptionNo?: string | null;
  doctorName?: string | null;
}) {
  return (
    <div className="font-mono text-black">
      <div className="text-center">
        <div className="font-bold">APOTEK POS</div>
        <div>{notaNo}</div>
        <div>
          {tanggal} — {payMethod}
        </div>
        {prescriptionNo && (
          <div>
            Resep {prescriptionNo} ({doctorName})
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-1" />

      <div>
        {items.map((i, idx) => (
          <div key={idx} className="mb-1">
            <div>{i.name}</div>
            <Row
              left={`  ${i.qty} x ${rp(i.price)}`}
              right={rp(i.subtotal)}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-1" />

      <div>
        <Row left={`Subtotal`} right={rp(subtotal)} />
        <Row left={`Diskon`} right={rp(discount)} />
        <Row left={`TOTAL`} right={rp(grandTotal)} />
        <Row left={`Bayar`} right={rp(paid)} />
        <Row left={`Kembali`} right={rp(change)} />
      </div>

      <div className="border-t border-dashed border-black my-1" />

      <div className="text-center">
        <div>Terima kasih atas kunjungan Anda</div>
        <div>Simpan struk ini sebagai bukti pembelian</div>
      </div>
    </div>
  );
}
