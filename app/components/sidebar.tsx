"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@stackframe/stack";
import {
  Boxes,
  FileText,
  Menu,
  Package,
  Pill,
  ReceiptText,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import Link from "next/link";

const APOTEK_LINKS = [
  { name: "Kasir", href: "/kasir", icon: ShoppingCart },
  { name: "Master Obat", href: "/master", icon: Package },
  { name: "Stok", href: "/stok", icon: Boxes },
  { name: "Laporan", href: "/laporan", icon: FileText },
  { name: "Riwayat", href: "/riwayat", icon: ReceiptText },
];

const SETTINGS_LINK = { name: "Pengaturan", href: "/settings", icon: Settings };

function NavContent({
  activePath,
  onNavigate,
}: {
  activePath: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-8">
        <Pill className="w-7 h-7 text-cyan-300" />
        <span className="text-lg font-semibold">Apotek POS</span>
      </div>

      <nav className="space-y-6 flex-1">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase px-2">
            Apotek
          </div>
          {APOTEK_LINKS.map((link) => {
            const isActive =
              activePath === link.href ||
              activePath.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center space-x-2 p-2 rounded-lg ${
                  isActive
                    ? "bg-cyan-100 text-slate-900"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="space-y-1">
          <Link
            href={SETTINGS_LINK.href}
            onClick={onNavigate}
            className={`flex items-center space-x-2 p-2 rounded-lg ${
              activePath === SETTINGS_LINK.href ||
              activePath.startsWith(SETTINGS_LINK.href + "/")
                ? "bg-cyan-100 text-slate-900"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <SETTINGS_LINK.icon className="w-5 h-5" />
            <span>{SETTINGS_LINK.name}</span>
          </Link>
        </div>
      </nav>

      <div className="pt-4 border-t border-slate-700">
        <UserButton showUserInfo />
      </div>
    </div>
  );
}

export default function SideBar({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activePath = currentPath ?? pathname ?? "/";

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center gap-3 bg-slate-900 text-white px-4 h-14">
        <button
          aria-label="Buka navigasi"
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Pill className="w-5 h-5 text-cyan-300" />
        <span className="font-semibold">Apotek POS</span>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 text-white p-6 overflow-y-auto">
            <button
              aria-label="Tutup navigasi"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent
              activePath={activePath}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="hidden lg:block fixed left-0 top-0 bg-slate-900 text-white w-64 min-h-screen p-6 z-10">
        <NavContent activePath={activePath} />
      </div>
    </>
  );
}
