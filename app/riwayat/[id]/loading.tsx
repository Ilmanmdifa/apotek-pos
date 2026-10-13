import { Bar, SideSkeleton } from "../../components/skeletons";

export default function NotaLoading() {
  return (
    <div className="min-h-screen bg-cyan-50/50">
      <SideSkeleton />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-slate-200 p-6">
          <Bar className="h-5 w-32 mx-auto mb-2" />
          <Bar className="h-4 w-40 mx-auto mb-4" />
          <div className="space-y-2 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bar key={i} className="h-8 w-full" />
            ))}
          </div>
          <Bar className="h-4 w-full mb-4" />
          <div className="flex gap-2">
            <Bar className="h-10 flex-1" />
            <Bar className="h-10 flex-1" />
          </div>
        </div>
      </main>
    </div>
  );
}
