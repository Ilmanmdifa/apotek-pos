import { Bar, KasirShell, SideSkeleton } from "../components/skeletons";

export default function KasirLoading() {
  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideSkeleton />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <Bar className="h-8 w-32 mb-2" />
        <Bar className="h-4 w-80 mb-6" />
        <KasirShell />
      </main>
    </div>
  );
}
