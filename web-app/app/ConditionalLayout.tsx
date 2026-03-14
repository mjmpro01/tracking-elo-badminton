"use client";

import { usePathname } from "next/navigation";
import { Header } from "../components/Header";
import { ReactNode } from "react";

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 md:px-10 lg:px-20 py-6">
        <div className="max-w-[1200px] mx-auto">{children}</div>
      </main>
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15202b] py-6 md:py-8">
        <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto px-4 md:px-10 lg:px-20 items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="text-2xl text-primary">🏆</span>
            <span className="font-bold text-lg">EloTracker</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              API
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Contact
            </a>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} EloTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
