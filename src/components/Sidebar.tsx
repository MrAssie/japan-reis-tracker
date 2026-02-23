"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", jpLabel: "ダッシュボード" },
  { href: "/itinerary", label: "Itinerary", icon: "📅", jpLabel: "旅程" },
  { href: "/map", label: "Kaart", icon: "🗺️", jpLabel: "地図" },
  { href: "/places", label: "Plekken", icon: "📍", jpLabel: "場所" },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <aside className="w-64 bg-japan-dark text-white flex flex-col shrink-0">
      {/* Logo */}
      <Link href="/" className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⛩️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">Japan Reis</h1>
            <p className="text-xs text-gray-400">日本旅行</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-japan-red text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <span className="text-sm font-medium">{item.label}</span>
                <p className="text-[10px] text-gray-400">{item.jpLabel}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>Japan Reis Tracker v0.1</span>
        </div>
      </div>
    </aside>
  );
}
