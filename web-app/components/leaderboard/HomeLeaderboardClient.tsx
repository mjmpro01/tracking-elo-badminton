"use client";

import { useState } from "react";
import Link from "next/link";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { LeaderboardTable } from "./LeaderboardTable";
import { supabase } from "../../lib/supabaseClient";

const queryClient = new QueryClient();

type LatestTournamentSummary = {
  id: string;
  name: string;
  cover_image_url: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  total_entries: number | null;
  total_matches: number | null;
  champion_name: string | null;
};

async function fetchLatestTournament(): Promise<LatestTournamentSummary | null> {
  const { data, error } = await supabase
    .from("latest_tournament_summary_view")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return (data as LatestTournamentSummary) ?? null;
}

// Format date to "Dec 15 - Dec 17, 2023" format
function formatTournamentDate(
  startDate: string | null,
  endDate: string | null
): string {
  if (!startDate && !endDate) return "—";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  if (!endDate || startDate === endDate) {
    const date = new Date(startDate!);
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  const start = formatDate(startDate!);
  const end = formatDate(endDate);
  const year = new Date(endDate).getFullYear();

  if (start.split(" ")[0] === end.split(" ")[0]) {
    // Same month: "Dec 15 - 17, 2023"
    return `${start} - ${end.split(" ")[1]}, ${year}`;
  }

  // Different months: "Dec 15 - Jan 17, 2023"
  return `${start} - ${end}, ${year}`;
}

export function HomeLeaderboardClient() {
  const [search, setSearch] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <LatestTournamentHero />
      <div className="flex flex-col gap-8">
        {/* Header + search + leaderboard */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
              Global Leaderboard
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl">
              Top ranked players based on current Elo rating. Elo is updated
              when tournaments are finalized.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex w-full md:w-80 items-stretch rounded-lg h-10 border border-slate-200 dark:border-slate-700 focus-within:border-primary/60 transition-all bg-white dark:bg-[#15202b]">
              <div className="text-slate-400 flex items-center justify-center pl-3 pr-1 text-sm">
                {/* simple text icon để tránh phụ thuộc font icon */}
                <span>🔍</span>
              </div>
              <input
                className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 text-sm px-2"
                placeholder="Search player..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>
        <LeaderboardTable search={search} />
      </div>
    </QueryClientProvider>
  );
}

function LatestTournamentHero() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["latest-tournament"],
    queryFn: fetchLatestTournament
  });

  const tournament = data ?? null;

  // Loading skeleton
  if (isLoading && !tournament) {
    return (
      <section className="@container mb-6">
        <div className="flex flex-col lg:flex-row items-stretch rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15202b]">
          <div className="w-full lg:w-1/3 bg-slate-200 dark:bg-slate-700 min-h-[200px] animate-pulse" />
          <div className="flex w-full lg:w-2/3 grow flex-col items-start justify-center gap-4 p-6 lg:p-8">
            <div className="w-full space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="@container mb-6">
      <div className="flex flex-col lg:flex-row items-stretch rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15202b]">
        <div
          className="w-full lg:w-1/3 bg-center bg-no-repeat bg-cover min-h-[200px] relative group"
          style={
            tournament?.cover_image_url
              ? { backgroundImage: `url(${tournament.cover_image_url})` }
              : { backgroundColor: "#1e293b" }
          }
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              {tournament
                ? tournament.status === "locked"
                  ? "Completed"
                  : tournament.status === "finished"
                  ? "Finished"
                  : tournament.status
                : "No events yet"}
            </span>
          </div>
        </div>
        <div className="flex w-full lg:w-2/3 grow flex-col items-start justify-center gap-4 p-6 lg:p-8">
          <div>
            <p className="text-primary text-sm font-semibold mb-1">
              Latest Major Event
            </p>
            <h1 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
              {tournament ? tournament.name : "No tournaments finalized yet"}
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="flex items-start gap-3">
              <span className="text-slate-400 mt-1 text-xl">📅</span>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Date
                </p>
                <p className="text-slate-900 dark:text-slate-200 text-base font-semibold">
                  {tournament
                    ? formatTournamentDate(
                        tournament.start_date,
                        tournament.end_date
                      )
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 mt-1 text-xl">🏅</span>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Champion
                </p>
                <p className="text-slate-900 dark:text-slate-200 text-base font-semibold">
                  {tournament?.champion_name ?? "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-slate-100 dark:bg-slate-700 my-2" />
          <div className="flex flex-wrap items-center justify-between w-full gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal max-w-lg">
              {tournament
                ? `This event featured ${tournament.total_entries ?? 0} ${
                    (tournament.total_entries ?? 0) === 1 ? "entry" : "entries"
                  } and ${tournament.total_matches ?? 0} ${
                    (tournament.total_matches ?? 0) === 1 ? "match" : "matches"
                  } recorded.`
                : "Finalized tournaments will appear here once you finish an event in the admin app."}
            </p>
            {tournament && (
              <Link
                href={`/tournaments/${tournament.id}`}
                className="flex items-center justify-center rounded-lg h-9 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium transition-colors gap-2 whitespace-nowrap"
              >
                <span>View Full Results</span>
                <span className="text-sm">→</span>
              </Link>
            )}
            {error && (
              <p className="text-xs text-red-400 w-full">
                Không tải được thông tin giải mới nhất:{" "}
                {(error as Error).message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


