"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";

type PlayerWithStats = {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  rank: number;
  wins: number;
};

async function fetchPlayersWithStats(search?: string): Promise<PlayerWithStats[]> {
  let query = supabase
    .from("player_current_rating_view")
    .select("player_id, full_name, avatar_url, rating")
    .not("rating", "is", null)
    .order("rating", { ascending: false });

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data: players, error } = await query;
  if (error) throw error;
  if (!players || players.length === 0) return [];

  const playerIds = players.map((p) => p.player_id);

  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, player_id")
    .in("player_id", playerIds);

  if (entriesError) throw entriesError;

  const playerEntryMap = new Map<string, string[]>();
  entries?.forEach((entry: any) => {
    const pid = entry.player_id;
    if (!playerEntryMap.has(pid)) {
      playerEntryMap.set(pid, []);
    }
    playerEntryMap.get(pid)!.push(entry.id);
  });

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, winner_entry_id")
    .eq("status", "finished")
    .not("winner_entry_id", "is", null);

  if (matchesError) throw matchesError;

  const playerWinsMap = new Map<string, number>();
  playerIds.forEach((pid) => {
    playerWinsMap.set(pid, 0);
  });

  matches?.forEach((match: any) => {
    const winnerEntryId = match.winner_entry_id;
    for (const [pid, entryIds] of playerEntryMap.entries()) {
      if (entryIds.includes(winnerEntryId)) {
        const currentWins = playerWinsMap.get(pid) || 0;
        playerWinsMap.set(pid, currentWins + 1);
        break;
      }
    }
  });

  const result: PlayerWithStats[] = players
    .map((p, index) => ({
      player_id: p.player_id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      rating: p.rating ?? 1000,
      rank: index + 1,
      wins: playerWinsMap.get(p.player_id) || 0,
    }))
    .sort((a, b) => b.rating - a.rating);

  return result;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

export default function PlayersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: players, isLoading } = useQuery({
    queryKey: ["players-with-stats", { search: debouncedSearch }],
    queryFn: () => fetchPlayersWithStats(debouncedSearch),
    refetchOnMount: true,
  });

  const top3 = players?.slice(0, 3) || [];
  const allPlayers = players?.slice(3) || [];

  return (
    <div className="w-full">
      {/* Header - Match mobile design */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#101622] dark:text-slate-100">
            Rankings
          </h1>
          {/* FAB - Match mobile design */}
          <button
            onClick={() => router.push("/admin/players/add")}
            className="fixed bottom-20 right-6 lg:bottom-6 lg:right-6 z-10 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Xem và quản lý players</p>
      </div>

        {/* Search Bar - Match mobile design */}
        <div className="mb-6">
          <div className="flex items-center bg-[#f6f6f8] dark:bg-slate-800 rounded-xl px-3 py-3">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 mr-2 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[#101622] dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none text-base"
            />
          </div>
        </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500 dark:text-slate-400">Đang tải...</div>
        </div>
      ) : (
        <>
          {/* TOP 3 PLAYERS - Match mobile design */}
          {top3.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-[#101622] dark:text-slate-100 uppercase tracking-wide mb-3">
                TOP 3 PLAYERS
              </h2>
              <div className="flex gap-3">
                {top3.map((player, index) => {
                  const position = index + 1;
                  const isGold = position === 1;
                  const isSilver = position === 2;
                  const badgeColor = isGold ? "#F59E0B" : isSilver ? "#9CA3AF" : "#B45309";
                  const eloColor = isGold ? "text-primary" : "text-slate-600 dark:text-slate-400";

                  return (
                    <div
                      key={player.player_id}
                      onClick={() => router.push(`/admin/players/${player.player_id}`)}
                      className={`flex-1 flex flex-col items-center bg-white dark:bg-slate-800 rounded-2xl p-4 text-center cursor-pointer min-h-[180px] ${
                        isGold ? "border-2 border-primary" : "shadow-sm"
                      }`}
                    >
                      <div className="relative mb-3">
                        {player.avatar_url ? (
                          <img
                            src={player.avatar_url}
                            alt={player.full_name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {getInitials(player.full_name)}
                            </span>
                          </div>
                        )}
                        <div
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-slate-800"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {position}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-[#101622] dark:text-slate-100 mb-1 text-center">
                        {player.full_name.length > 12
                          ? player.full_name.substring(0, 10) + "..."
                          : player.full_name}
                      </h3>
                      <p className={`text-sm font-semibold ${isGold ? "text-primary" : "text-slate-500 dark:text-slate-400"}`}>
                        {Math.round(player.rating)} ELO
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ALL PLAYERS - Match mobile design */}
          {allPlayers.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-[#101622] dark:text-slate-100 uppercase tracking-wide mb-3">
                ALL PLAYERS
              </h2>
              <div className="space-y-2">
                {allPlayers.map((player, index) => {
                  const rank = index + 4;
                  return (
                    <div
                      key={player.player_id}
                      onClick={() => router.push(`/admin/players/${player.player_id}`)}
                      className="flex items-center bg-[#f6f6f8] dark:bg-slate-700/50 rounded-xl p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-slate-600 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-bold text-[#101622] dark:text-slate-100">
                          {rank}
                        </span>
                      </div>
                      {player.avatar_url ? (
                        <img
                          src={player.avatar_url}
                          alt={player.full_name}
                          className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-base font-semibold text-primary">
                            {getInitials(player.full_name)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-[#101622] dark:text-slate-100 mb-0.5 truncate">
                          {player.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          — Rank {rank} • {player.wins} Wins
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-[#101622] dark:text-slate-100">
                          {Math.round(player.rating)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ELO</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {players?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No players found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
