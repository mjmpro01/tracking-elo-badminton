"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/hooks/useAuth";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut, loading } = useAuth();

  const handleLogout = async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await signOut();
      router.push("/admin/login");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-2xl">settings</span>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Cài Đặt
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý cài đặt tài khoản</p>
      </div>

      {/* Log Out Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-red-600 dark:text-red-400">logout</span>
          <span className="font-bold text-red-600 dark:text-red-400">Đăng Xuất</span>
        </button>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Version 2.4.0-stable
        </p>
      </div>
    </div>
  );
}
