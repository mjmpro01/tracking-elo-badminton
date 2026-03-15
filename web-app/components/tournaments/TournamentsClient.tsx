"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

// Helper function để xử lý URL ảnh từ Supabase Storage
function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
    return null;
  }
  
  const trimmedUrl = imageUrl.trim();
  
  // Nếu đã là full URL (http:// hoặc https://), trả về nguyên
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }
  
  // Nếu là path tương đối, tạo public URL từ Supabase Storage
  // Tournament covers được lưu trong bucket "player-avatars" (theo cách mobile-admin upload)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    // Nếu path đã chứa "storage/v1/object/public", chỉ cần thêm domain
    if (trimmedUrl.startsWith("storage/v1/object/public/")) {
      return `${supabaseUrl}/${trimmedUrl}`;
    }
    // Nếu path đã chứa bucket name, thêm prefix storage
    if (trimmedUrl.startsWith("player-avatars/")) {
      return `${supabaseUrl}/storage/v1/object/public/${trimmedUrl}`;
    }
    // Nếu không, giả sử là path trong bucket "player-avatars" (có thể là tournaments/xxx.jpg)
    return `${supabaseUrl}/storage/v1/object/public/player-avatars/${trimmedUrl}`;
  }
  
  return trimmedUrl;
}

type TopPerformer = {
  name: string;
  eloDelta: number;
  avatarUrl: string | null;
  position: number;
};

type TournamentCard = {
  id: string;
  name: string;
  dateLabel: string;
  dateTimestamp: number; // For sorting
  level: "Major" | "Minor";
  teamsCount: number;
  kFactor: number;
  coverImageUrl: string | null;
  badgeVariant: "primary" | "dark";
  topPerformers: TopPerformer[];
};

async function fetchTournaments(): Promise<TournamentCard[]> {
  // Fetch finished/locked/upcoming tournaments
  const { data: tournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("id, name, cover_image_url, k_factor, end_date, start_date, created_at, status")
    .in("status", ["finished", "locked", "upcoming"])
    .order("end_date", { ascending: false, nullsFirst: false })
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (tournamentsError) throw tournamentsError;
  if (!tournaments || tournaments.length === 0) return [];

  const tournamentIds = tournaments.map((t) => t.id);

  // Get entry counts for each tournament
  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("tournament_id, team_id, player_id")
    .in("tournament_id", tournamentIds);

  if (entriesError) throw entriesError;

  // Count teams/players per tournament
  const entryCounts = new Map<string, number>();
  entries?.forEach((entry: any) => {
    const tid = entry.tournament_id;
    entryCounts.set(tid, (entryCounts.get(tid) || 0) + 1);
  });

  // Get top 3 performers for each tournament (only for finished/locked tournaments)
  // Upcoming tournaments may not have standings yet
  const finishedTournamentIds = tournaments
    ?.filter((t: any) => t.status === "finished" || t.status === "locked")
    .map((t: any) => t.id) || [];
  
  let standings: any[] | null = null;
  if (finishedTournamentIds.length > 0) {
    const { data: standingsData, error: standingsError } = await supabase
      .from("tournament_standings")
      .select("tournament_id, entry_id, position")
      .in("tournament_id", finishedTournamentIds)
      .in("position", [1, 2, 3])
      .order("tournament_id")
      .order("position", { ascending: true });
    
    if (standingsError) throw standingsError;
    standings = standingsData;
  }

  // Get entry details for top performers
  const entryIds = standings?.map((s) => s.entry_id) || [];
  const { data: entryDetails, error: entryDetailsError } = await supabase
    .from("tournament_entries")
    .select("id, player_id, team_id, players(full_name, avatar_url), teams(name)")
    .in("id", entryIds);

  if (entryDetailsError) throw entryDetailsError;

  // Map entry_id to details
  const entryMap = new Map();
  entryDetails?.forEach((entry: any) => {
    entryMap.set(entry.id, {
      name: entry.players?.full_name || entry.teams?.name || "Unknown",
      avatarUrl: entry.players?.avatar_url || null,
    });
  });

  // Get Elo deltas for top performers (only for player entries)
  const { data: eloHistory, error: eloHistoryError } = await supabase
    .from("elo_history")
    .select("tournament_id, player_id, delta")
    .in("tournament_id", tournamentIds);

  if (eloHistoryError) throw eloHistoryError;

  // Calculate total Elo delta per player per tournament
  const eloDeltas = new Map<string, number>();
  eloHistory?.forEach((eh: any) => {
    if (eh.player_id) {
      const key = `${eh.tournament_id}_${eh.player_id}`;
      eloDeltas.set(key, (eloDeltas.get(key) || 0) + Number(eh.delta));
    }
  });

  // Build tournament cards
  const tournamentCards: TournamentCard[] = tournaments.map((tournament: any) => {
    const tid = tournament.id;
    const topStandings = standings?.filter((s) => s.tournament_id === tid) || [];
    
    const topPerformers: TopPerformer[] = topStandings
      .sort((a, b) => a.position - b.position)
      .slice(0, 3)
      .map((standing) => {
        const entryDetail = entryMap.get(standing.entry_id);
        // Find player_id from entry
        const entry = entryDetails?.find((e: any) => e.id === standing.entry_id);
        const playerId = entry?.player_id;
        
        // Get Elo delta for this player in this tournament
        const eloKey = `${tid}_${playerId}`;
        const delta = playerId ? (eloDeltas.get(eloKey) || 0) : 0;

        return {
          name: entryDetail?.name || "Unknown",
          avatarUrl: entryDetail?.avatarUrl || null,
          eloDelta: Math.round(delta),
          position: standing.position,
        };
      });

    // Determine level based on k_factor
    const kFactor = Number(tournament.k_factor);
    const level: "Major" | "Minor" = kFactor >= 40 ? "Major" : "Minor";
    const badgeVariant: "primary" | "dark" = level === "Major" ? "primary" : "dark";

    // Format date
    const date = tournament.end_date || tournament.start_date || tournament.created_at;
    const dateTimestamp = date ? new Date(date).getTime() : 0;
    const dateLabel = date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "TBD";

    return {
      id: tournament.id,
      name: tournament.name,
      dateLabel,
      dateTimestamp,
      level,
      teamsCount: entryCounts.get(tid) || 0,
      kFactor: kFactor,
      coverImageUrl: getImageUrl(tournament.cover_image_url),
      badgeVariant,
      topPerformers,
    };
  });

  return tournamentCards;
}

function getBorderClasses(position: number) {
  switch (position) {
    case 1:
      return "border-yellow-400";
    case 2:
      return "border-slate-300";
    case 3:
      return "border-amber-600";
    default:
      return "border-slate-300";
  }
}

function getBadgeClasses(position: number) {
  switch (position) {
    case 1:
      return "bg-yellow-400 text-yellow-900";
    case 2:
      return "bg-slate-300 text-slate-800";
    case 3:
      return "bg-amber-600 text-white";
    default:
      return "bg-slate-300 text-slate-800";
  }
}

type TournamentsClientProps = {
  sortOption?: "date-desc" | "date-asc" | "name-asc" | "name-desc" | "k-factor-desc" | "k-factor-asc";
  filterOption?: "all" | "major" | "minor";
};

export function TournamentsClient({
  sortOption = "date-desc",
  filterOption = "all",
}: TournamentsClientProps) {
  const {
    data: tournaments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tournaments"],
    queryFn: fetchTournaments,
  });

  // Apply filters and sorting
  const filteredAndSorted = tournaments
    ? [...tournaments]
        .filter((tournament) => {
          if (filterOption === "all") return true;
          if (filterOption === "major") return tournament.level === "Major";
          if (filterOption === "minor") return tournament.level === "Minor";
          return true;
        })
        .sort((a, b) => {
          switch (sortOption) {
            case "date-desc":
              return b.dateTimestamp - a.dateTimestamp;
            case "date-asc":
              return a.dateTimestamp - b.dateTimestamp;
            case "name-asc":
              return a.name.localeCompare(b.name);
            case "name-desc":
              return b.name.localeCompare(a.name);
            case "k-factor-desc":
              return b.kFactor - a.kFactor;
            case "k-factor-asc":
              return a.kFactor - b.kFactor;
            default:
              return 0;
          }
        })
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500 dark:text-slate-400">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">
          Lỗi khi tải dữ liệu: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500 dark:text-slate-400">
          Chưa có giải đấu nào
        </div>
      </div>
    );
  }

  if (filteredAndSorted.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500 dark:text-slate-400">
          Không có giải đấu nào phù hợp với bộ lọc
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {filteredAndSorted.map((tournament) => (
        <article
          key={tournament.id}
          className="flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group"
        >
          <div className="md:w-72 h-48 md:h-auto bg-slate-200 relative shrink-0">
            {tournament.coverImageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${tournament.coverImageUrl}')` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800" />
            )}
            <div
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${
                tournament.badgeVariant === "primary"
                  ? "bg-primary/90 text-white"
                  : "bg-slate-800/90 text-white"
              }`}
            >
              {tournament.level}
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
                <h3 className="text-slate-900 dark:text-white text-lg sm:text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {tournament.name}
                </h3>
                <span className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                  <span className="text-[14px] sm:text-[16px]">📅</span>
                  {tournament.dateLabel}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                  <span className="text-[14px]">👥</span>
                  {tournament.teamsCount} {tournament.teamsCount === 1 ? "Entry" : "Entries"}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                  <span className="text-[14px]">📈</span>
                  K-Factor: {tournament.kFactor}
                </span>
              </div>
            </div>

            {tournament.topPerformers.length > 0 && (
              <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Top Performers
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-6">
                  {tournament.topPerformers.map((performer) => (
                    <div key={performer.name} className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`size-8 sm:size-10 rounded-full border-2 p-0.5 ${getBorderClasses(
                            performer.position
                          )}`}
                        >
                          {performer.avatarUrl ? (
                            <div
                              className="w-full h-full rounded-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url('${performer.avatarUrl}')`,
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-200">
                              {performer.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-white dark:bg-slate-900 rounded-full border border-white dark:border-slate-900">
                          <div
                            className={`size-3 sm:size-4 flex items-center justify-center rounded-full text-[9px] sm:text-[10px] font-bold ${getBadgeClasses(
                              performer.position
                            )}`}
                          >
                            {performer.position}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {performer.name}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-500">
                          {performer.eloDelta >= 0 ? "+" : ""}
                          {performer.eloDelta} Elo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 md:border-l border-t md:border-t-0 border-slate-100 dark:border-slate-800 flex items-center justify-center md:w-48 bg-slate-50 dark:bg-slate-800/50">
            <Link
              href={`/tournaments/${tournament.id}`}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:border-primary text-slate-700 dark:text-slate-200 font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all text-xs sm:text-sm group"
            >
              <span>View Details</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </article>
      ))}

      <div className="flex justify-center pt-8 pb-12">
        <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Load more tournaments
        </button>
      </div>
    </section>
  );
}
