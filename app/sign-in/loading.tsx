import { Bar } from "../components/skeletons";

export default function SignInLoading() {
  return (
    <div className="min-h-screen bg-cyan-50/50">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <Bar className="h-7 w-32" />
        <Bar className="h-5 w-36" />
      </header>
      <main className="flex flex-col items-center px-6 pt-6 pb-16">
        <div className="w-full max-w-[380px]">
          <Bar className="h-8 w-64 mx-auto mb-2" />
          <Bar className="h-4 w-56 mx-auto mb-6" />
          <div className="space-y-3">
            <Bar className="h-11 w-full" />
            <Bar className="h-11 w-full" />
            <Bar className="h-11 w-full" />
          </div>
        </div>
        <div className="w-full max-w-[380px] mt-6">
          <Bar className="h-11 w-full" />
        </div>
      </main>
    </div>
  );
}
