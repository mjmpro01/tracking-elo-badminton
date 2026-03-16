"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";

type TournamentStatus = "upcoming" | "ongoing" | "finished" | "locked";

type Tournament = {
  id: string;
  name: string;
  cover_image_url: string | null;
  k_factor: number;
  status: TournamentStatus;
  format: string;
  start_date: string | null;
  end_date: string | null;
};

async function fetchTournaments(status?: TournamentStatus): Promise<Tournament[]> {
  let query = supabase.from("tournaments").select("*").order("created_at", {
    ascending: false,
  });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Tournament[];
}

const FILTERS: { label: string; value: TournamentStatus | undefined }[] = [
  { label: "Tất Cả", value: undefined },
  { label: "Sắp Diễn Ra", value: "upcoming" },
  { label: "Đang Diễn Ra", value: "ongoing" },
  { label: "Đã Kết Thúc", value: "finished" },
  { label: "Đã Khóa", value: "locked" },
];

function renderStatusBadge(status: TournamentStatus) {
  let label: string = status;
  let background = "bg-slate-100";
  let textColor = "text-slate-600";

  switch (status) {
    case "upcoming":
      label = "Sắp Diễn Ra";
      background = "bg-blue-100 dark:bg-blue-900/30";
      textColor = "text-blue-600 dark:text-blue-400";
      break;
    case "ongoing":
      label = "Đang Diễn Ra";
      background = "bg-green-100 dark:bg-green-900/30";
      textColor = "text-green-600 dark:text-green-400";
      break;
    case "finished":
      label = "Đã Kết Thúc";
      background = "bg-slate-100 dark:bg-slate-700";
      textColor = "text-slate-600 dark:text-slate-400";
      break;
    case "locked":
      label = "Đã Khóa";
      background = "bg-red-100 dark:bg-red-900/30";
      textColor = "text-red-600 dark:text-red-400";
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${background} ${textColor}`}>
      {label}
    </span>
  );
}

export default function TournamentsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | undefined>(undefined);
  const {
    data: tournaments,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["tournaments", statusFilter],
    queryFn: () => fetchTournaments(statusFilter),
  });

  return (
    <div className="w-full">
      {/* Header - Match mobile design */}
      <div className="mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Giải Đấu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý tournaments và điều hướng tới chi tiết.
          </p>
        </div>
      </div>

      {/* Filters - Match mobile design */}
      <div className="mb-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
          Trạng Thái
        </h3>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.label}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary font-semibold"
                    : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 font-normal"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tournament List - Match mobile design */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-500 dark:text-slate-400">
            Danh sách giải đấu
          </h3>
          {isFetching && !isLoading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-slate-500 dark:text-slate-400">Đang tải tournaments...</div>
          </div>
        ) : tournaments && tournaments.length > 0 ? (
          <div className="space-y-2">
            {tournaments.map((item) => {
              const hasCoverImage =
                item.cover_image_url &&
                typeof item.cover_image_url === "string" &&
                item.cover_image_url.trim().length > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => router.push(`/admin/tournaments/${item.id}`)}
                  className="flex items-center bg-white dark:bg-slate-700/50 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="mr-3 flex-shrink-0">
                    {hasCoverImage ? (
                      <img
                        src={item.cover_image_url!}
                        alt={item.name}
                        className="w-12 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">
                          emoji_events
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-0.5">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.start_date
                        ? `${item.format} · k=${item.k_factor}`
                        : item.format}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                    {renderStatusBadge(item.status)}
                    <span className="text-slate-400 text-xl">›</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Không có tournament nào với bộ lọc hiện tại.
            </p>
          </div>
        )}
      </div>

      {/* FAB - Match mobile design */}
      <button
        onClick={() => router.push("/admin/tournaments/create?new=true")}
        className="fixed bottom-20 right-6 lg:bottom-6 lg:right-6 z-10 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
        style={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
