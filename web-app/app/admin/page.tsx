"use client";

import { useRouter } from "next/navigation";
import { useLatestTournament } from "../../lib/hooks/useAdminTournaments";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: latestTournament, isLoading } = useLatestTournament();

  return (
    <div className="w-full">
      {/* Current Tournament - Match mobile design */}
      <section className="mb-6">
        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-4">
          Giải Đấu Hiện Tại
        </h2>
        {isLoading ? (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="text-slate-500 dark:text-slate-400">Đang tải...</div>
          </div>
        ) : latestTournament ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            {latestTournament.cover_image_url ? (
              <img
                src={latestTournament.cover_image_url}
                alt={latestTournament.name}
                className="w-full aspect-[16/7] object-cover bg-slate-100 dark:bg-slate-800"
              />
            ) : (
              <div className="w-full aspect-[16/7] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-4xl">emoji_events</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {latestTournament.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-primary">
                      {latestTournament.status === "ongoing"
                        ? "Đang Diễn Ra"
                        : latestTournament.status === "finished"
                        ? "Đã Kết Thúc"
                        : latestTournament.status === "upcoming"
                        ? "Sắp Diễn Ra"
                        : "Đã Khóa"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-sm">groups</span>
                      <span>Người Chơi</span>
                    </div>
                    {latestTournament.start_date && (
                      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>
                          Bắt đầu {new Date(latestTournament.start_date).toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/admin/tournaments/${latestTournament.id}`)}
                  className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex-shrink-0"
                >
                  Quản Lý
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Không có tournament nào.</p>
          </div>
        )}
      </section>

      {/* Quick Actions - Match mobile design */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-4">
          Thao Tác Nhanh
        </h2>
        <div className="flex gap-4">
          <Link
            href="/admin/tournaments/create?new=true"
            className="flex-1 flex flex-col items-center py-2"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 text-center leading-tight">
              Tạo Giải Đấu
            </span>
          </Link>
          <Link
            href="/admin/players/add"
            className="flex-1 flex flex-col items-center py-2"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 text-center leading-tight">
              Thêm Người Chơi
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
