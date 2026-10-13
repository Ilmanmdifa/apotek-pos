import { SideSkeleton, TableShell } from "./components/skeletons";

// Skeleton global untuk halaman tabel (master, stok, laporan, riwayat):
// meniru layout akhir agar tidak ada layout shift.
// Rute dengan bentuk beda (kasir, demo) punya skeleton sendiri.
// Lihat: https://nextjs.org/docs/app/api-reference/file-conventions/loading
export default function Loading() {
  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideSkeleton />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <TableShell />
        <p className="text-center text-sm text-slate-500 mt-6 animate-pulse">
          Memuat data apotek...
        </p>
      </main>
    </div>
  );
}
