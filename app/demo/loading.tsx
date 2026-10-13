import { Bar, DemoShell } from "../components/skeletons";

export default function DemoLoading() {
  return (
    <div className="min-h-screen bg-cyan-50/50">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <Bar className="h-7 w-36" />
        <Bar className="h-9 w-40" />
      </header>
      <main className="max-w-5xl mx-auto px-6 pb-16">
        <DemoShell />
      </main>
    </div>
  );
}
