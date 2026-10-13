export function Bar({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

export function SideSkeleton() {
  return (
    <div className="hidden lg:block fixed left-0 top-0 w-64 min-h-screen bg-slate-900 p-6">
      <Bar className="h-7 w-36 !bg-slate-700 mb-8" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bar key={i} className="h-9 w-full !bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export function TableShell() {
  return (
    <>
      <Bar className="h-8 w-56 mb-2" />
      <Bar className="h-4 w-72 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-slate-200 p-4"
          >
            <Bar className="h-3 w-20 mb-2" />
            <Bar className="h-6 w-28" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <Bar className="h-5 w-44 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bar key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}

export function KasirShell() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <Bar className="h-5 w-48 mb-4" />
        <Bar className="h-11 w-full mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <Bar className="h-5 w-36 mb-4" />
        <div className="space-y-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bar key={i} className="h-12 w-full" />
          ))}
        </div>
        <Bar className="h-6 w-full mb-4" />
        <Bar className="h-12 w-full" />
      </div>
    </div>
  );
}

export function DemoShell() {
  return (
    <>
      <Bar className="h-4 w-80 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-slate-200 p-4"
          >
            <Bar className="h-3 w-20 mb-2" />
            <Bar className="h-6 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((c) => (
          <div
            key={c}
            className="bg-white rounded-lg border border-slate-200 p-6"
          >
            <Bar className="h-5 w-44 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Bar key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
