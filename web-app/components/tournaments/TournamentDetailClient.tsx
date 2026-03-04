"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type TournamentDetailProps = {
  tournamentId: string;
};

type TournamentDetail = {
  id: string;
  name: string;
  status: string;
  end_date: string | null;
  start_date: string | null;
  created_at: string;
  description?: string;
  totalTeams: number;
  totalMatches: number;
  avgRating: number;
  champion: {
    name: string;
    entryId: string;
  } | null;
};

type Standing = {
  position: number;
  entryId: string;
  teamName: string | null;
  playerNames: string[];
  seedRating: number;
  score: number;
  expected: number;
  teamDelta: number;
};

type RatingChange = {
  playerId: string;
  playerName: string;
  playerInitials: string;
  before: number;
  delta: number;
  after: number;
};

async function fetchTournamentDetail(
  tournamentId: string
): Promise<TournamentDetail> {
  // Fetch tournament basic info
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, name, status, end_date, start_date, created_at")
    .eq("id", tournamentId)
    .single();

  if (tournamentError) throw tournamentError;
  if (!tournament) throw new Error("Tournament not found");

  // Count total teams/entries
  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, team_id, player_id")
    .eq("tournament_id", tournamentId);

  if (entriesError) throw entriesError;
  const totalTeams = entries?.length || 0;

  // Count total matches
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("status", "finished");

  if (matchesError) throw matchesError;
  const totalMatches = matches?.length || 0;

  // Calculate average rating (from seed ratings of entries)
  // Get all player entries and their ratings before tournament
  const playerEntryIds =
    entries?.filter((e) => e.player_id).map((e) => e.id) || [];
  const { data: eloBefore, error: eloBeforeError } = await supabase
    .from("elo_history")
    .select("player_id, rating_before")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true })
    .limit(1000);

  if (eloBeforeError) throw eloBeforeError;

  // Calculate average from first rating_before for each player
  const playerRatings = new Map<string, number>();
  eloBefore?.forEach((eh: any) => {
    if (!playerRatings.has(eh.player_id)) {
      playerRatings.set(eh.player_id, Number(eh.rating_before));
    }
  });

  const ratings = Array.from(playerRatings.values());
  const avgRating =
    ratings.length > 0
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : 0;

  // Get champion (position 1)
  const { data: championStanding, error: championError } = await supabase
    .from("tournament_standings")
    .select("entry_id, position")
    .eq("tournament_id", tournamentId)
    .eq("position", 1)
    .single();

  if (championError && championError.code !== "PGRST116") throw championError;

  let champion: { name: string; entryId: string } | null = null;
  if (championStanding) {
    const championEntry = entries?.find(
      (e) => e.id === championStanding.entry_id
    );
    if (championEntry) {
      if (championEntry.team_id) {
        const { data: team } = await supabase
          .from("teams")
          .select("name")
          .eq("id", championEntry.team_id)
          .single();
        champion = { name: team?.name || "Unknown", entryId: championEntry.id };
      } else if (championEntry.player_id) {
        const { data: player } = await supabase
          .from("players")
          .select("full_name")
          .eq("id", championEntry.player_id)
          .single();
        champion = {
          name: player?.full_name || "Unknown",
          entryId: championEntry.id,
        };
      }
    }
  }

  return {
    id: tournament.id,
    name: tournament.name,
    status: tournament.status,
    end_date: tournament.end_date,
    start_date: tournament.start_date,
    created_at: tournament.created_at,
    totalTeams,
    totalMatches,
    avgRating,
    champion,
  };
}

async function fetchStandings(tournamentId: string): Promise<Standing[]> {
  // Get standings
  const { data: standings, error: standingsError } = await supabase
    .from("tournament_standings")
    .select("entry_id, position, wins, losses, points")
    .eq("tournament_id", tournamentId)
    .order("position", { ascending: true })
    .limit(32);

  if (standingsError) throw standingsError;
  if (!standings || standings.length === 0) return [];

  const entryIds = standings.map((s) => s.entry_id);

  // Get entry details
  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, team_id, player_id, seed")
    .in("id", entryIds);

  if (entriesError) throw entriesError;

  // Get team names
  const teamIds = entries
    ?.filter((e) => e.team_id)
    .map((e) => e.team_id)
    .filter((id): id is string => id !== null) || [];
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", teamIds);

  if (teamsError) throw teamsError;

  // Get player names for teams
  const { data: teamPlayers, error: teamPlayersError } = await supabase
    .from("team_players")
    .select("team_id, player_id, players(full_name)")
    .in("team_id", teamIds);

  if (teamPlayersError) throw teamPlayersError;

  // Get player entries
  const playerEntryIds = entries
    ?.filter((e) => e.player_id)
    .map((e) => e.id) || [];
  const { data: playerEntries, error: playerEntriesError } = await supabase
    .from("tournament_entries")
    .select("id, player_id, players(full_name)")
    .in("id", playerEntryIds);

  if (playerEntriesError) throw playerEntriesError;

  // Calculate team deltas from elo_history
  const { data: eloHistory, error: eloHistoryError } = await supabase
    .from("elo_history")
    .select("player_id, delta")
    .eq("tournament_id", tournamentId);

  if (eloHistoryError) throw eloHistoryError;

  // Group deltas by entry (for teams, sum all player deltas)
  const entryDeltas = new Map<string, number>();
  entries?.forEach((entry) => {
    if (entry.team_id) {
      // Sum deltas for all players in team
      const teamPlayerIds =
        teamPlayers
          ?.filter((tp: any) => tp.team_id === entry.team_id)
          .map((tp: any) => tp.player_id) || [];
      const teamDelta = eloHistory
        ?.filter((eh: any) => teamPlayerIds.includes(eh.player_id))
        .reduce((sum: number, eh: any) => sum + Number(eh.delta), 0) || 0;
      entryDeltas.set(entry.id, Math.round(teamDelta));
    } else if (entry.player_id) {
      const playerDelta =
        eloHistory
          ?.filter((eh: any) => eh.player_id === entry.player_id)
          .reduce((sum: number, eh: any) => sum + Number(eh.delta), 0) || 0;
      entryDeltas.set(entry.id, Math.round(playerDelta));
    }
  });

  // Build standings array
  const result: Standing[] = standings.map((standing) => {
    const entry = entries?.find((e) => e.id === standing.entry_id);
    if (!entry) {
      return {
        position: standing.position || 0,
        entryId: standing.entry_id,
        teamName: null,
        playerNames: [],
        seedRating: 0,
        score: standing.points || 0,
        expected: 0,
        teamDelta: 0,
      };
    }

    let teamName: string | null = null;
    let playerNames: string[] = [];

    if (entry.team_id) {
      const team = teams?.find((t) => t.id === entry.team_id);
      teamName = team?.name || null;
      const players =
        teamPlayers
          ?.filter((tp: any) => tp.team_id === entry.team_id)
          .map((tp: any) => tp.players?.full_name || "Unknown") || [];
      playerNames = players;
    } else if (entry.player_id) {
      const playerEntry = playerEntries?.find(
        (pe: any) => pe.id === entry.id
      );
      const playerName = (playerEntry as any)?.players?.full_name || "Unknown";
      playerNames = [playerName];
      teamName = playerName; // For display purposes
    }

    // Get seed rating (from elo_history rating_before)
    const seedRating =
      entry.player_id && eloHistory
        ? eloHistory
            .filter((eh: any) => eh.player_id === entry.player_id)
            .map((eh: any) => Number(eh.rating_before))[0] || 0
        : 0;

    // Calculate expected score (simplified - could be more complex)
    const expected = standing.wins + standing.losses > 0
      ? Number((standing.wins / (standing.wins + standing.losses)).toFixed(1))
      : 0;

    return {
      position: standing.position || 0,
      entryId: standing.entry_id,
      teamName,
      playerNames,
      seedRating: Math.round(seedRating),
      score: standing.points || 0,
      expected,
      teamDelta: entryDeltas.get(entry.id) || 0,
    };
  });

  return result;
}

async function fetchRatingChanges(
  tournamentId: string
): Promise<{
  gainers: RatingChange[];
  drops: RatingChange[];
}> {
  // Get all elo_history for this tournament
  const { data: eloHistory, error: eloHistoryError } = await supabase
    .from("elo_history")
    .select("player_id, rating_before, rating_after, delta")
    .eq("tournament_id", tournamentId);

  if (eloHistoryError) throw eloHistoryError;
  if (!eloHistory || eloHistory.length === 0) {
    return { gainers: [], drops: [] };
  }

  // Group by player and calculate totals
  const playerChanges = new Map<
    string,
    { before: number; delta: number; after: number }
  >();

  eloHistory.forEach((eh: any) => {
    const playerId = eh.player_id;
    if (!playerChanges.has(playerId)) {
      playerChanges.set(playerId, {
        before: Number(eh.rating_before),
        delta: 0,
        after: Number(eh.rating_after),
      });
    }
    const change = playerChanges.get(playerId)!;
    change.delta += Number(eh.delta);
    change.after = Number(eh.rating_after); // Keep latest
  });

  // Get player names
  const playerIds = Array.from(playerChanges.keys());
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, full_name")
    .in("id", playerIds);

  if (playersError) throw playersError;

  // Build rating changes array
  const changes: RatingChange[] = Array.from(playerChanges.entries()).map(
    ([playerId, change]) => {
      const player = players?.find((p) => p.id === playerId);
      const name = player?.full_name || "Unknown";
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        playerId,
        playerName: name,
        playerInitials: initials,
        before: Math.round(change.before),
        delta: Math.round(change.delta),
        after: Math.round(change.after),
      };
    }
  );

  // Sort and get top 3 gainers and drops
  const gainers = changes
    .filter((c) => c.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);

  const drops = changes
    .filter((c) => c.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3);

  return { gainers, drops };
}

export function TournamentDetailClient({
  tournamentId,
}: TournamentDetailProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: tournament,
    isLoading: tournamentLoading,
    error: tournamentError,
  } = useQuery({
    queryKey: ["tournament-detail", tournamentId],
    queryFn: () => fetchTournamentDetail(tournamentId),
  });

  const {
    data: standings,
    isLoading: standingsLoading,
    error: standingsError,
  } = useQuery({
    queryKey: ["tournament-standings", tournamentId],
    queryFn: () => fetchStandings(tournamentId),
    enabled: !!tournament,
  });

  const {
    data: ratingChanges,
    isLoading: ratingChangesLoading,
    error: ratingChangesError,
  } = useQuery({
    queryKey: ["tournament-rating-changes", tournamentId],
    queryFn: () => fetchRatingChanges(tournamentId),
    enabled: !!tournament,
  });

  // Reset to page 1 when standings change
  useEffect(() => {
    setCurrentPage(1);
  }, [standings]);

  if (tournamentLoading || standingsLoading || ratingChangesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500 dark:text-slate-400">Đang tải...</div>
      </div>
    );
  }

  if (tournamentError || standingsError || ratingChangesError) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">
          Lỗi khi tải dữ liệu:{" "}
          {(tournamentError || standingsError || ratingChangesError)?.message}
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500 dark:text-slate-400">
          Không tìm thấy giải đấu
        </div>
      </div>
    );
  }

  const date = tournament.end_date || tournament.start_date || tournament.created_at;
  const dateLabel = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  const statusLabel =
    tournament.status === "finished" || tournament.status === "locked"
      ? "FINALIZED"
      : tournament.status.toUpperCase();

  const isFinalized =
    tournament.status === "finished" || tournament.status === "locked";

  // Pagination calculations
  const totalStandings = standings?.length || 0;
  const totalPages = Math.ceil(totalStandings / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStandings = standings?.slice(startIndex, endIndex) || [];

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-slate-500 dark:text-slate-400">
        <ol className="flex items-center space-x-2">
          <li>
            <Link className="hover:text-primary" href="/tournaments">
              Tournaments
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li className="text-slate-900 dark:text-white font-medium">
            {tournament.name}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                isFinalized
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20"
                  : "bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 ring-slate-600/20"
              }`}
            >
              {statusLabel}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              {dateLabel}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            {tournament.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl">
            Tournament details and standings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 min-w-max">
          <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
          <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition-opacity">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Results
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <span className="text-lg">👥</span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Teams
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white pl-[52px]">
            {tournament.totalTeams}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Matches
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white pl-[52px]">
            {tournament.totalMatches}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Avg Rating
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white pl-[52px]">
            {tournament.avgRating}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-primary/20">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <span className="text-lg">🏆</span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Champion
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white pl-[52px]">
            {tournament.champion?.name || "TBD"}
          </p>
        </div>
      </div>

      {/* Standings Table */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Team Standings
          </h2>
          <div className="flex gap-2">
            <button
              className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
              title="Filter"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
            <button
              className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16">
                    Rank
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[200px]">
                    Team / Members
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Seed Rating
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Score (S)
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Expected (E)
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Team Delta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedStandings.length > 0 ? (
                  paginatedStandings.map((standing) => (
                    <tr
                      key={standing.entryId}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div
                          className={`flex items-center justify-center size-8 rounded-full font-bold text-sm ${
                            standing.position === 1
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {standing.position}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {standing.teamName || standing.playerNames[0] || "Unknown"}
                          </span>
                          {standing.playerNames.length > 0 && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {standing.playerNames.join(" & ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-600 dark:text-slate-300">
                        {standing.seedRating}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-900 dark:text-white">
                        {standing.score}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 dark:text-slate-400">
                        {standing.expected}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {standing.teamDelta > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                              />
                            </svg>
                            {standing.teamDelta}
                          </span>
                        ) : standing.teamDelta < 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-900/30 px-2 py-1 text-sm font-medium text-rose-700 dark:text-rose-400">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                            {Math.abs(standing.teamDelta)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                            0
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 px-6 text-center text-slate-500 dark:text-slate-400"
                    >
                      Chưa có standings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {startIndex + 1} to {Math.min(endIndex, totalStandings)} of{" "}
                {totalStandings} teams
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Previous page"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsisBefore && (
                            <span className="px-2 text-slate-500 dark:text-slate-400">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => goToPage(page)}
                            className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-primary text-white"
                                : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Next page"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Gainers and Drops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            Top Rating Gainers
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Player
              </span>
              <div className="flex gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="w-16 text-right">Before</span>
                <span className="w-16 text-right">Delta</span>
                <span className="w-16 text-right">After</span>
              </div>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {ratingChanges?.gainers && ratingChanges.gainers.length > 0 ? (
                ratingChanges.gainers.map((gainer) => (
                  <li
                    key={gainer.playerId}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {gainer.playerInitials}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {gainer.playerName}
                      </span>
                    </div>
                    <div className="flex gap-8 text-sm">
                      <span className="w-16 text-right text-slate-500">
                        {gainer.before}
                      </span>
                      <span className="w-16 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        +{gainer.delta}
                      </span>
                      <span className="w-16 text-right font-bold text-slate-900 dark:text-white">
                        {gainer.after}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-slate-500 dark:text-slate-400">
                  No data available
                </li>
              )}
            </ul>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
            Biggest Rating Drops
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Player
              </span>
              <div className="flex gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="w-16 text-right">Before</span>
                <span className="w-16 text-right">Delta</span>
                <span className="w-16 text-right">After</span>
              </div>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {ratingChanges?.drops && ratingChanges.drops.length > 0 ? (
                ratingChanges.drops.map((drop) => (
                  <li
                    key={drop.playerId}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xs">
                        {drop.playerInitials}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {drop.playerName}
                      </span>
                    </div>
                    <div className="flex gap-8 text-sm">
                      <span className="w-16 text-right text-slate-500">
                        {drop.before}
                      </span>
                      <span className="w-16 text-right font-medium text-rose-600 dark:text-rose-400">
                        {drop.delta}
                      </span>
                      <span className="w-16 text-right font-bold text-slate-900 dark:text-white">
                        {drop.after}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-slate-500 dark:text-slate-400">
                  No data available
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
