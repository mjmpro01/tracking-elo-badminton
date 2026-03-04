"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PlayerProfileProps = {
  playerId: string;
};

type PlayerSummary = {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  rank: number;
  matches_played: number | null;
  win_rate: number | null;
};

type TournamentResult = {
  tournament_id: string;
  tournament_name: string;
  end_date: string | null;
  position: number | null;
  delta: number;
  created_at: string;
};

type EloHistoryPoint = {
  date: string;
  rating: number;
  delta: number;
  timestamp: number;
};

type RecentTeammate = {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
};

type RecentTeamInfo = {
  tournament_id: string;
  tournament_name: string;
  team_id: string;
  teammates: RecentTeammate[];
};

type TopPartner = {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
  matches_played: number;
  win_rate: number;
};

async function fetchPlayerSummary(playerId: string): Promise<PlayerSummary | null> {
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("player_id,full_name,avatar_url,rating,rank,matches_played,win_rate")
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) throw error;
  return (data as PlayerSummary) ?? null;
}

async function fetchPlayerTournaments(playerId: string): Promise<TournamentResult[]> {
  // Get tournaments from elo_history grouped by tournament
  const { data: eloData, error: eloError } = await supabase
    .from("elo_history")
    .select("tournament_id, delta, created_at")
    .eq("player_id", playerId)
    .not("tournament_id", "is", null)
    .order("created_at", { ascending: false });

  if (eloError) throw eloError;
  if (!eloData || eloData.length === 0) return [];

  // Group by tournament and sum deltas
  const tournamentMap = new Map<string, { delta: number; created_at: string }>();
  eloData.forEach((row: any) => {
    const tid = row.tournament_id;
    if (!tournamentMap.has(tid)) {
      tournamentMap.set(tid, { delta: 0, created_at: row.created_at });
    }
    tournamentMap.get(tid)!.delta += row.delta;
  });

  // Get tournament details
  const tournamentIds = Array.from(tournamentMap.keys());
  const { data: tournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("id, name, end_date")
    .in("id", tournamentIds);

  if (tournamentsError) throw tournamentsError;

  // Get standings for this player
  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, tournament_id")
    .eq("player_id", playerId)
    .in("tournament_id", tournamentIds);

  if (entriesError) throw entriesError;

  const entryIds = entries?.map((e) => e.id) || [];
  const { data: standings, error: standingsError } = await supabase
    .from("tournament_standings")
    .select("entry_id, position")
    .in("entry_id", entryIds);

  if (standingsError) throw standingsError;

  // Map entry_id to position
  const positionMap = new Map<string, number>();
  standings?.forEach((s) => {
    positionMap.set(s.entry_id, s.position);
  });

  // Map tournament_id to entry_id
  const entryMap = new Map<string, string>();
  entries?.forEach((e) => {
    entryMap.set(e.tournament_id, e.id);
  });

  // Combine all data
  const results: TournamentResult[] = tournaments?.map((t) => {
    const eloInfo = tournamentMap.get(t.id);
    const entryId = entryMap.get(t.id);
    const position = entryId ? positionMap.get(entryId) || null : null;

    return {
      tournament_id: t.id,
      tournament_name: t.name,
      end_date: t.end_date,
      position,
      delta: eloInfo?.delta || 0,
      created_at: eloInfo?.created_at || new Date().toISOString(),
    };
  }) || [];

  return results.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Generate sample data for testing
function generateSampleEloHistory(): EloHistoryPoint[] {
  const now = new Date();
  const sampleData: EloHistoryPoint[] = [];
  let currentRating = 1000;
  
  // Generate 20 data points over the last 3 months
  for (let i = 20; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 4)); // Every 4 days
    
    // Simulate Elo changes (random between -30 and +40)
    const delta = Math.floor(Math.random() * 70) - 30;
    currentRating = Math.max(800, Math.min(1400, currentRating + delta));
    
    sampleData.push({
      date: date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      rating: currentRating,
      delta: delta,
      timestamp: date.getTime(),
    });
  }
  
  return sampleData;
}

async function fetchEloHistory(playerId: string): Promise<EloHistoryPoint[]> {
  const { data, error } = await supabase
    .from("elo_history")
    .select("rating_after, delta, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) {
    // Return sample data for testing when no real data exists
    return generateSampleEloHistory();
  }

  return data.map((row: any) => ({
    date: new Date(row.created_at).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
    }),
    rating: Number(row.rating_after),
    delta: Number(row.delta),
    timestamp: new Date(row.created_at).getTime(),
  }));
}

async function fetchRecentTeammates(
  playerId: string
): Promise<RecentTeamInfo | null> {
  // 1. Lấy tất cả entry dạng team của player này
  const { data: teamEntries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("tournament_id, team_id")
    .eq("player_id", playerId)
    .not("team_id", "is", null);

  if (entriesError) throw entriesError;
  if (!teamEntries || teamEntries.length === 0) return null;

  const tournamentIds = Array.from(
    new Set(
      (teamEntries as any[])
        .map((e) => e.tournament_id)
        .filter((id: string | null) => !!id)
    )
  );

  if (tournamentIds.length === 0) return null;

  // 2. Lấy thông tin các giải đó để biết giải nào gần nhất
  const { data: tournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("id, name, end_date, start_date, created_at")
    .in("id", tournamentIds);

  if (tournamentsError) throw tournamentsError;
  if (!tournaments || tournaments.length === 0) return null;

  const sortedTournaments = [...(tournaments as any[])].sort((a, b) => {
    const aDate = new Date(
      a.end_date ?? a.start_date ?? a.created_at ?? new Date(0)
    ).getTime();
    const bDate = new Date(
      b.end_date ?? b.start_date ?? b.created_at ?? new Date(0)
    ).getTime();
    return bDate - aDate;
  });

  const latestTournament = sortedTournaments[0];
  const latestEntry = (teamEntries as any[]).find(
    (e) => e.tournament_id === latestTournament.id
  );

  if (!latestEntry || !latestEntry.team_id) return null;

  // 3. Lấy danh sách teammates trong team đó
  const { data: teammatesRows, error: teammatesError } = await supabase
    .from("team_players")
    .select("player_id, players(full_name, avatar_url)")
    .eq("team_id", latestEntry.team_id);

  if (teammatesError) throw teammatesError;
  if (!teammatesRows || teammatesRows.length === 0) return null;

  const teammates: RecentTeammate[] = (teammatesRows as any[])
    .filter((row) => row.player_id !== playerId)
    .map((row) => ({
      player_id: row.player_id,
      full_name: row.players?.full_name ?? "Unknown player",
      avatar_url: row.players?.avatar_url ?? null,
    }));

  if (teammates.length === 0) return null;

  return {
    tournament_id: latestTournament.id,
    tournament_name: latestTournament.name,
    team_id: latestEntry.team_id,
    teammates,
  };
}

async function fetchTopPartners(playerId: string): Promise<TopPartner[]> {
  // 1. Lấy tất cả team_ids mà player này đã tham gia
  const { data: teamPlayers, error: teamPlayersError } = await supabase
    .from("team_players")
    .select("team_id")
    .eq("player_id", playerId);

  if (teamPlayersError) throw teamPlayersError;
  if (!teamPlayers || teamPlayers.length === 0) return [];

  const teamIds = teamPlayers.map((tp: any) => tp.team_id);

  // 2. Lấy tất cả team entries của các team này
  const { data: teamEntries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, tournament_id, team_id")
    .in("team_id", teamIds);

  if (entriesError) throw entriesError;
  if (!teamEntries || teamEntries.length === 0) return [];

  const entryIds = teamEntries.map((e: any) => e.id);

  // 3. Lấy tất cả teammates từ các team đó (loại trừ chính player này)
  const { data: teammatesData, error: teammatesError } = await supabase
    .from("team_players")
    .select("team_id, player_id, players(full_name, avatar_url)")
    .in("team_id", teamIds)
    .neq("player_id", playerId);

  if (teammatesError) throw teammatesError;
  if (!teammatesData || teammatesData.length === 0) return [];

  // 4. Lấy tất cả matches của các team entries này
  // Query matches where entry_a_id or entry_b_id is in entryIds
  const { data: matchesA, error: matchesAError } = await supabase
    .from("matches")
    .select("id, entry_a_id, entry_b_id, winner_entry_id, status")
    .in("entry_a_id", entryIds)
    .eq("status", "finished");

  const { data: matchesB, error: matchesBError } = await supabase
    .from("matches")
    .select("id, entry_a_id, entry_b_id, winner_entry_id, status")
    .in("entry_b_id", entryIds)
    .eq("status", "finished");

  if (matchesAError || matchesBError) {
    throw matchesAError || matchesBError;
  }

  // Combine and deduplicate matches
  const matchesMap = new Map();
  matchesA?.forEach((m: any) => matchesMap.set(m.id, m));
  matchesB?.forEach((m: any) => matchesMap.set(m.id, m));
  const matches = Array.from(matchesMap.values());

  if (matchesError) throw matchesError;

  // 5. Tính thống kê cho mỗi partner
  const partnerStats = new Map<
    string,
    { matches: number; wins: number; name: string; avatar: string | null }
  >();

  // Map team_id -> entry_ids cho team đó
  const teamEntryMap = new Map<string, string[]>();
  teamEntries.forEach((entry: any) => {
    const teamId = entry.team_id;
    if (!teamEntryMap.has(teamId)) {
      teamEntryMap.set(teamId, []);
    }
    teamEntryMap.get(teamId)!.push(entry.id);
  });

  // Với mỗi teammate, tính số trận và win rate
  teammatesData.forEach((row: any) => {
    const partnerId = row.player_id;
    const partnerName = row.players?.full_name ?? "Unknown";
    const partnerAvatar = row.players?.avatar_url ?? null;
    const teamId = row.team_id;

    if (!partnerStats.has(partnerId)) {
      partnerStats.set(partnerId, {
        matches: 0,
        wins: 0,
        name: partnerName,
        avatar: partnerAvatar,
      });
    }

    const entryIdsForTeam = teamEntryMap.get(teamId) || [];

    // Đếm matches và wins cho team này
    if (matches && matches.length > 0) {
      matches.forEach((match: any) => {
      const isTeamEntry =
        entryIdsForTeam.includes(match.entry_a_id) ||
        entryIdsForTeam.includes(match.entry_b_id);

      if (isTeamEntry) {
        const stats = partnerStats.get(partnerId)!;
        stats.matches += 1;
        if (
          match.winner_entry_id &&
          entryIdsForTeam.includes(match.winner_entry_id)
        ) {
          stats.wins += 1;
        }
      }
      });
    }
  });

  // 6. Convert sang array và sắp xếp
  const topPartners: TopPartner[] = Array.from(partnerStats.entries())
    .map(([playerId, stats]) => ({
      player_id: playerId,
      full_name: stats.name,
      avatar_url: stats.avatar,
      matches_played: stats.matches,
      win_rate: stats.matches > 0 ? stats.wins / stats.matches : 0,
    }))
    .filter((p) => p.matches_played > 0)
    .sort((a, b) => b.matches_played - a.matches_played)
    .slice(0, 4); // Top 4

  return topPartners;
}

export function PlayerProfileClient({ playerId }: PlayerProfileProps) {
  const {
    data: player,
    isLoading: isLoadingPlayer,
    error: playerError,
  } = useQuery({
    queryKey: ["player-profile", playerId],
    queryFn: () => fetchPlayerSummary(playerId),
  });

  const {
    data: tournaments,
    isLoading: isLoadingTournaments,
  } = useQuery({
    queryKey: ["player-tournaments", playerId],
    queryFn: () => fetchPlayerTournaments(playerId),
    enabled: !!player,
  });

  const {
    data: eloHistory,
    isLoading: isLoadingEloHistory,
  } = useQuery({
    queryKey: ["player-elo-history", playerId],
    queryFn: () => fetchEloHistory(playerId),
    enabled: !!player,
  });

  const {
    data: topPartners,
    isLoading: isLoadingTopPartners,
  } = useQuery({
    queryKey: ["player-top-partners", playerId],
    queryFn: () => fetchTopPartners(playerId),
    enabled: !!player,
  });

  if (isLoadingPlayer) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (playerError) {
    return (
      <p className="text-sm text-red-500">
        Không tải được thông tin người chơi.{" "}
        <span className="block text-xs text-red-400 mt-1">
          {(playerError as Error).message}
        </span>
      </p>
    );
  }

  if (!player) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          Không tìm thấy người chơi này trong leaderboard.
        </p>
        <Link
          href="/players"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Quay lại danh sách players
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPositionBadge = (position: number | null) => {
    if (!position) return null;
    if (position === 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
          1st Place
        </span>
      );
    }
    if (position === 2) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
          2nd Place
        </span>
      );
    }
    if (position === 3) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400">
          3rd Place
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
        {position}th Place
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <div className="flex p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex w-full flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div className="flex gap-6 items-center">
            {player.avatar_url ? (
              <img
                src={player.avatar_url}
                alt={`Profile picture of ${player.full_name}`}
                className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 md:h-32 md:w-32 ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm object-cover"
              />
            ) : (
              <div className="rounded-full h-24 w-24 md:h-32 md:w-32 ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-slate-600 dark:text-slate-300">
                  {player.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col justify-center gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em]">
                  {player.full_name}
                </h1>
                {player.matches_played != null && player.matches_played > 0 && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                    Active
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">
                <span className="flex items-center gap-1">
                  <span className="text-[18px]">🌍</span>
                  Global Rank: #{player.rank}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-primary text-3xl font-bold leading-none">
                  {Math.round(player.rating)}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                  Current Elo
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-full md:w-auto gap-3 mt-4 md:mt-0">
            <Link
              href="/players"
              className="flex items-center justify-center rounded-lg h-10 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-white text-sm font-bold flex-1 md:flex-initial gap-2"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats and Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-[20px]">🏆</span>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Tournaments
                </p>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                {tournaments?.length ?? 0}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-[20px]">🎖️</span>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Best Rank
                </p>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                #{player.rank}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-[20px]">📊</span>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Win Rate
                </p>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                {player.win_rate != null
                  ? `${(player.win_rate * 100).toFixed(0)}%`
                  : "—"}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-[20px]">📈</span>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Matches
                </p>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">
                {player.matches_played ?? 0}
              </p>
            </div>
          </div>

          {/* Elo History Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Elo History
              </h3>
            </div>
            {isLoadingEloHistory ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Đang tải biểu đồ...
              </div>
            ) : eloHistory && eloHistory.length > 0 ? (
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={eloHistory}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-700"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      className="dark:stroke-slate-400"
                      tick={{ fill: "#64748b" }}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#64748b"
                      className="dark:stroke-slate-400"
                      tick={{ fill: "#64748b" }}
                      style={{ fontSize: "12px" }}
                      domain={["dataMin - 50", "dataMax + 50"]}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
                              <p className="text-slate-900 dark:text-white font-bold text-sm mb-2">
                                {label}
                              </p>
                              {payload.map((entry, index) => (
                                <p
                                  key={index}
                                  className="text-slate-600 dark:text-slate-300 text-sm"
                                  style={{ color: entry.color }}
                                >
                                  {entry.name === "rating"
                                    ? `Elo: ${Math.round(
                                        Number(entry.value)
                                      ).toLocaleString("vi-VN")}`
                                    : `Thay đổi: ${
                                        Number(entry.value) >= 0 ? "+" : ""
                                      }${Math.round(Number(entry.value))}`}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Chưa có lịch sử Elo
              </div>
            )}
          </div>

          {/* Recent Tournaments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Recent Tournaments
              </h3>
            </div>
            {isLoadingTournaments ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Đang tải...
              </div>
            ) : tournaments && tournaments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Tournament Name</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Placement</th>
                      <th className="px-6 py-4 text-right">Elo Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tournaments.map((tournament) => (
                      <tr
                        key={tournament.tournament_id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {tournament.tournament_name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {formatDate(tournament.end_date)}
                        </td>
                        <td className="px-6 py-4">
                          {getPositionBadge(tournament.position)}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${
                            tournament.delta >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-500 dark:text-red-400"
                          }`}
                        >
                          {tournament.delta >= 0 ? "+" : ""}
                          {Math.round(tournament.delta)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Chưa tham gia giải nào
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Top Partners */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Top Partners
              </h3>
            </div>
            {isLoadingTopPartners ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Đang tải...
              </div>
            ) : topPartners && topPartners.length > 0 ? (
              <div className="p-6 space-y-4">
                {topPartners.map((partner) => (
                  <Link
                    key={partner.player_id}
                    href={`/players/${partner.player_id}`}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {partner.avatar_url ? (
                      <img
                        src={partner.avatar_url}
                        alt={partner.full_name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-slate-300 dark:group-hover:ring-slate-600 transition-all"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-base font-semibold text-slate-600 dark:text-slate-200 ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-slate-300 dark:group-hover:ring-slate-600 transition-all">
                        {partner.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {partner.full_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {partner.matches_played} Matches
                        </span>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          {Math.round(partner.win_rate * 100)}% WR
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Chưa có đồng đội nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
