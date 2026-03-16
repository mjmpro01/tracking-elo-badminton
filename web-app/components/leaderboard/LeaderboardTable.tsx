"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

type LeaderboardRow = {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  rank: number;
  matches_played: number | null;
  win_rate: number | null;
};

async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("player_id,full_name,avatar_url,rating,rank,matches_played,win_rate")
    .order("rank", { ascending: true })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

export function LeaderboardTable({ search }: { search: string }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const prevSearchRef = useRef<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard
  });

  const filtered =
    data?.filter((row) =>
      row.full_name.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset về trang 1 khi từ khóa search thay đổi
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      setPage(1);
      prevSearchRef.current = search;
    }
  }, [search]);

  // Đảm bảo page không vượt quá totalPages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Đang tải leaderboard...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Không tải được leaderboard. Kiểm tra lại Supabase config.{" "}
        <span className="block text-xs text-red-400 mt-1">
          {(error as Error).message}
        </span>
      </p>
    );
  }

  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedRows = filtered.slice(startIndex, endIndex);

  if (!filtered || filtered.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Chưa có người chơi nào được tính Elo. Hãy tạo giải và bấm Final trước.
      </p>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#15202b]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="py-3 pl-6 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-20">
                Hạng
              </th>
              <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Người Chơi
              </th>
              <th className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                ELO
              </th>
              <th className="hidden md:table-cell py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                Tỷ Lệ Thắng
              </th>
              <th className="hidden md:table-cell py-3 pl-3 pr-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                Trận Đấu
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {paginatedRows.map((row) => (
              <tr
                key={row.player_id}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 pl-6 pr-3 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center justify-center size-8 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                    {row.rank}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Link
                    href={`/players/${row.player_id}`}
                    className="flex items-center gap-3 hover:text-primary transition-colors"
                  >
                    {row.avatar_url ? (
                      <img
                        src={row.avatar_url}
                        alt={row.full_name}
                        className="size-10 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                          {row.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {row.full_name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {Math.round(row.rating)}
                </td>
                <td className="hidden md:table-cell py-3 px-3 text-right text-slate-600 dark:text-slate-300">
                  {row.win_rate != null
                    ? `${(row.win_rate * 100).toFixed(1)}%`
                    : "—"}
                </td>
                <td className="hidden md:table-cell py-3 pl-3 pr-6 text-right text-slate-600 dark:text-slate-300">
                  {row.matches_played ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#15202b] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Hiển thị{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {total === 0 ? 0 : startIndex + 1}
          </span>{" "}
          đến{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {endIndex}
          </span>{" "}
          trong{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {total}
          </span>{" "}
          kết quả
        </p>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </button>
          <button
            className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setPage((p) => (p >= totalPages ? totalPages : p + 1))
            }
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

