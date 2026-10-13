import { createMasterProduct, updateMasterProduct } from "@/lib/actions/master";
import { Badge, Field, SubmitButton, inputClass } from "../components/ui";

interface Initial {
  id?: string;
  name?: string;
  sku?: string | null;
  price?: string | number;
  buyPrice?: string | number;
  lowStockAt?: number | null;
  category?: string;
  requiresPrescription?: boolean;
  supplier?: string | null;
  location?: string | null;
}

export function ProductForm({
  initial,
  mode,
}: {
  initial?: Initial;
  mode: "create" | "edit";
}) {
  return (
    <form
      action={mode === "create" ? createMasterProduct : updateMasterProduct}
      className="space-y-6"
    >
      {mode === "edit" && (
        <input type="hidden" name="id" value={initial?.id ?? ""} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nama obat *">
          <input
            type="text"
            name="name"
            required
            maxLength={100}
            defaultValue={initial?.name ?? ""}
            placeholder="cth: Amlodipine 5mg 100s"
            className={inputClass}
          />
        </Field>
        <Field label="SKU / Barcode" hint="Unik per apotek, boleh kosong">
          <input
            type="text"
            name="sku"
            maxLength={50}
            defaultValue={initial?.sku ?? ""}
            placeholder="cth: AML-5-100"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field label="Harga jual (Rp) *">
          <input
            type="number"
            name="price"
            required
            min="0"
            step="0.01"
            defaultValue={initial?.price?.toString() ?? ""}
            placeholder="0"
            className={inputClass}
          />
        </Field>
        <Field label="Harga beli (Rp)">
          <input
            type="number"
            name="buyPrice"
            min="0"
            step="0.01"
            defaultValue={initial?.buyPrice?.toString() ?? ""}
            placeholder="0"
            className={inputClass}
          />
        </Field>
        <Field label="Ambang menipis">
          <input
            type="number"
            name="lowStockAt"
            min="0"
            step="1"
            defaultValue={initial?.lowStockAt?.toString() ?? ""}
            placeholder="cth: 10"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Kategori *">
          <select
            name="category"
            defaultValue={initial?.category ?? "BEBAS"}
            className={inputClass}
          >
            <option value="BEBAS">Bebas</option>
            <option value="BEBAS_TERBATAS">Bebas Terbatas</option>
            <option value="KERAS">Keras</option>
          </select>
        </Field>
        <Field label="Jenis">
          <label className="flex items-center gap-2 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="requiresPrescription"
              defaultChecked={initial?.requiresPrescription ?? false}
              className="w-4 h-4"
            />
            Wajib resep dokter
            <Badge tone="bad">K</Badge>
          </label>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Supplier">
          <input
            type="text"
            name="supplier"
            maxLength={100}
            defaultValue={initial?.supplier ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Lokasi / Rak">
          <input
            type="text"
            name="location"
            maxLength={100}
            defaultValue={initial?.location ?? ""}
            placeholder="cth: Rak A-2"
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton className="bg-cyan-700 text-white hover:bg-cyan-800">
        {mode === "create" ? "Simpan Obat" : "Simpan Perubahan"}
      </SubmitButton>
    </form>
  );
}
