"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LeaderboardTable } from "../leaderboard/LeaderboardTable";

const queryClient = new QueryClient();

export function PlayersPageClient() {
  const [search, setSearch] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col gap-8">
        {/* Header + search */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
              Người Chơi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl">
              Duyệt tất cả người chơi trên bảng xếp hạng, bao gồm ELO hiện tại,
              tỷ lệ thắng và số trận đấu.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex w-full md:w-80 items-stretch rounded-lg h-10 border border-slate-200 dark:border-slate-700 focus-within:border-primary/60 transition-all bg-white dark:bg-[#15202b]">
              <div className="text-slate-400 flex items-center justify-center pl-3 pr-1 text-sm">
                <span>🔍</span>
              </div>
              <input
                className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 text-sm px-2"
                placeholder="Tìm kiếm người chơi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Players table (reuse leaderboard view) */}
        <LeaderboardTable search={search} />
      </div>
    </QueryClientProvider>
  );
}

