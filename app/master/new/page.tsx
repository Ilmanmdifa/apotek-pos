import Link from "next/link";
import { requireStaff } from "@/lib/roles";
import SideBar from "../../components/sidebar";
import { ProductForm } from "../product-form";

export default async function NewMasterPage() {
  await requireStaff("APOTEKER");

  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideBar currentPath="/master" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Tambah Obat
          </h1>
          <p className="text-sm text-slate-600">
            Daftarkan obat baru ke master apotek.
          </p>
        </div>

        <div className="max-w-2xl bg-white rounded-lg border border-slate-200 p-6">
          <ProductForm mode="create" />
          <Link
            href="/master"
            className="inline-block mt-4 text-sm text-slate-600 hover:text-slate-900"
          >
            Kembali ke daftar
          </Link>
        </div>
      </main>
    </div>
  );
}
