"use client";

import { useRouter } from "next/navigation";
import { useLatestTournament } from "../../lib/hooks/useAdminTournaments";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: latestTournament, isLoading } = useLatestTournament();

  return (
    <div className="max-w-md mx-auto bg-background-light dark:bg-background-dark">
      <section className="px-4 pt-6">
        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-4">
          Current Tournament
        </h2>
        {isLoading ? (
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
            <div className="text-slate-500 dark:text-slate-400">Đang tải...</div>
          </div>
        ) : latestTournament ? (
          <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
            {latestTournament.cover_image_url ? (
              <div
                className="w-full bg-center bg-no-repeat aspect-[16/7] bg-cover"
                style={{ backgroundImage: `url(${latestTournament.cover_image_url})` }}
              />
            ) : (
              <div className="w-full aspect-[16/7] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-4xl">🏆</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                    {latestTournament.name}
                  </h3>
                  <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    {latestTournament.status === "ongoing"
                      ? "In Progress"
                      : latestTournament.status === "finished"
                      ? "Finished"
                      : latestTournament.status === "upcoming"
                      ? "Upcoming"
                      : "Locked"}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    {latestTournament.total_entries || 0} Players
                  </p>
                  {latestTournament.start_date && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      Started{" "}
                      {new Date(latestTournament.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/admin/tournaments/${latestTournament.id}`)}
                  className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">Không có tournament nào.</p>
          </div>
        )}
      </section>

      <section className="px-4 pt-8">
        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/admin/tournaments/create"
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/50 group"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
              Create Tournament
            </span>
          </Link>
          <Link
            href="/admin/players/add"
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/50 group"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
              Quick Add Player
            </span>
          </Link>
          <Link
            href="/admin/matches"
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/50 group"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
              Enter Results
            </span>
          </Link>
        </div>
      </section>

      <section className="px-4 pt-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold">
            Pending Drafts
          </h2>
          <Link href="/admin/tournaments" className="text-primary text-sm font-semibold">
            See All
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
              <span className="material-symbols-outlined text-slate-400">draft</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Spring Qualifier 2025
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Modified 2 hours ago</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </div>
          <div className="flex items-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
              <span className="material-symbols-outlined text-slate-400">draft</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Community Blitz Cup
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Modified yesterday</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </div>
        </div>
      </section>
    </div>
  );
}
