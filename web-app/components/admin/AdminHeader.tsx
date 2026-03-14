"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/hooks/useAuth";

export function AdminHeader() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back, {user?.email?.split("@")[0] || "Admin"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
    </header>
  );
}
