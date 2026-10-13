import { AccountSettings } from "@stackframe/stack";
import SideBar from "../components/sidebar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar currentPath="/settings" />

      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">
                Manage your account settings and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <AccountSettings fullPage />
          </div>
        </div>
      </main>
    </div>
  );
}
