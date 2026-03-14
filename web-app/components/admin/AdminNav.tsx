"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Home", icon: "home" },
    { href: "/admin/tournaments", label: "Tournaments", icon: "trophy" },
    { href: "/admin/players", label: "Players", icon: "group" },
    { href: "/admin/matches", label: "Matches", icon: "sports_tennis" },
    { href: "/admin/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-20 max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive
                ? "text-primary"
                : "text-slate-400 dark:text-slate-500 hover:text-primary"
            }`}
          >
            <span
              className={`material-symbols-outlined ${
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
