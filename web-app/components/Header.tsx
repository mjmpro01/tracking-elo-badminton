"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15202b] px-6 md:px-10 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-3 text-slate-900 dark:text-white">
        <div className="size-8 flex items-center justify-center rounded-full text-primary">
          <span className="text-2xl">🏆</span>
        </div>
        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
          EloTracker
        </h2>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link
          className={
            pathname === "/"
              ? "text-slate-900 dark:text-white font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          }
          href="/"
        >
          Leaderboard
        </Link>
        <Link
          className={
            pathname === "/tournaments"
              ? "text-primary font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          }
          href="/tournaments"
        >
          Tournaments
        </Link>
        <Link
          className={
            pathname?.startsWith("/players")
              ? "text-slate-900 dark:text-white font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          }
          href="/players"
        >
          Players
        </Link>
        <Link
          className={
            pathname === "/rules"
              ? "text-primary font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          }
          href="/rules"
        >
          Rules
        </Link>
      </nav>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={toggleMenu}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMenu}
          />
          <nav className="fixed top-[73px] left-0 right-0 bg-white dark:bg-[#15202b] border-b border-slate-200 dark:border-slate-800 shadow-lg z-50 md:hidden">
            <div className="flex flex-col py-4">
              <Link
                className={
                  pathname === "/"
                    ? "px-6 py-3 text-slate-900 dark:text-white font-bold bg-slate-50 dark:bg-slate-800/50"
                    : "px-6 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors"
                }
                href="/"
                onClick={closeMenu}
              >
                Leaderboard
              </Link>
              <Link
                className={
                  pathname === "/tournaments"
                    ? "px-6 py-3 text-primary font-bold bg-slate-50 dark:bg-slate-800/50"
                    : "px-6 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors"
                }
                href="/tournaments"
                onClick={closeMenu}
              >
                Tournaments
              </Link>
              <Link
                className={
                  pathname?.startsWith("/players")
                    ? "px-6 py-3 text-slate-900 dark:text-white font-bold bg-slate-50 dark:bg-slate-800/50"
                    : "px-6 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors"
                }
                href="/players"
                onClick={closeMenu}
              >
                Players
              </Link>
              <Link
                className={
                  pathname === "/rules"
                    ? "px-6 py-3 text-primary font-bold bg-slate-50 dark:bg-slate-800/50"
                    : "px-6 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-primary transition-colors"
                }
                href="/rules"
                onClick={closeMenu}
              >
                Rules
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
