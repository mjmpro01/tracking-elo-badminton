"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/tournaments", label: "Tournaments", icon: "emoji_events" },
    { href: "/admin/players", label: "Players", icon: "people" },
    { href: "/admin/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-around items-center z-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "text-primary bg-primary/10"
                : "text-slate-400 dark:text-slate-500 hover:text-primary"
            }`}
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                isActive ? "font-variation-settings: 'FILL' 1" : ""
              }`}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
