"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../lib/hooks/useAuth";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { AdminNav } from "../../components/admin/AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-slate-600 dark:text-slate-400">Đang tải...</div>
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <AdminHeader />
      <main className="pb-24">{children}</main>
      <AdminNav />
    </div>
  );
}
