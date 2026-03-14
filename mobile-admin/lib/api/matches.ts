import { supabase } from "../supabase";

export type MatchStatus =
  | "scheduled"
  | "in_progress"
  | "finished"
  | "pending_review"
  | "cancelled";

export type Match = {
  id: string;
  tournament_id: string;
  status: MatchStatus;
  entry_a_id: string;
  entry_b_id: string;
  score_a: number[] | null;
  score_b: number[] | null;
  winner_entry_id: string | null;
  created_at?: string | null;
};

export type MatchDisplay = {
  id: string;
  status: MatchStatus;
  entryAId: string;
  entryBId: string;
  entryAName: string;
  entryBName: string;
  entryAElo: number | null;
  entryBElo: number | null;
  isDoubles: boolean;
  scoreA: number[] | null;
  scoreB: number[] | null;
  entryAAvatarUrl: string | null;
  entryBAvatarUrl: string | null;
  entryATeamMembers?: { name: string; avatarUrl: string | null }[];
  entryBTeamMembers?: { name: string; avatarUrl: string | null }[];
};

export async function fetchMatchesForToday() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .gte("created_at", `${today} 00:00:00`)
    .lte("created_at", `${today} 23:59:59`)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Match[];
}

export async function fetchPendingReviewMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Match[];
}

export async function fetchMatchById(id: string) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Match;
}

export async function fetchMatchesByTournament(
  tournamentId: string,
): Promise<MatchDisplay[]> {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });
  if (matchesError) throw matchesError;
  if (!matches || matches.length === 0) return [];

  const entryIds = Array.from(
    new Set(
      (matches as any[]).flatMap((m) => [
        m.entry_a_id as string,
        m.entry_b_id as string,
      ]),
    ),
  );

  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, player_id, team_id")
    .in("id", entryIds);
  if (entriesError) throw entriesError;

  const playerIds = Array.from(
    new Set(
      (entries ?? [])
        .map((e: any) => e.player_id as string | null)
        .filter((id): id is string => !!id),
    ),
  );
  const teamIds = Array.from(
    new Set(
      (entries ?? [])
        .map((e: any) => e.team_id as string | null)
        .filter((id): id is string => !!id),
    ),
  );

  const { data: players, error: playersError } = await supabase
    .from("player_current_rating_view")
    .select("player_id, full_name, rating, avatar_url")
    .in("player_id", playerIds);
  if (playersError) throw playersError;

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", teamIds);
  if (teamsError) throw teamsError;

  const { data: teamPlayers, error: tpError } = await supabase
    .from("team_players")
    .select("team_id, player_id, players(full_name, avatar_url)")
    .in("team_id", teamIds);
  if (tpError) throw tpError;

  const { data: teamRatings, error: trError } = await supabase
    .from("player_current_rating_view")
    .select("player_id, rating")
    .in(
      "player_id",
      Array.from(
        new Set(
          (teamPlayers ?? []).map(
            (tp: any) => tp.player_id as string | null,
          ),
        ),
      ),
    );
  if (trError) throw trError;

  const playerMap = new Map<
    string,
    { name: string; rating: number | null; avatarUrl: string | null }
  >();
  (players ?? []).forEach((p: any) => {
    playerMap.set(p.player_id as string, {
      name: p.full_name as string,
      rating: (p.rating as number | null) ?? null,
      avatarUrl: (p.avatar_url as string | null) ?? null,
    });
  });

  const teamNameMap = new Map<string, string>();
  (teams ?? []).forEach((t: any) => {
    teamNameMap.set(t.id as string, (t.name as string) ?? "Unnamed Team");
  });

  const teamRatingMap = new Map<string, number | null>();
  const ratingLookup = new Map<string, number | null>();
  (teamRatings ?? []).forEach((r: any) => {
    ratingLookup.set(
      r.player_id as string,
      (r.rating as number | null) ?? null,
    );
  });
  (teamPlayers ?? []).forEach((tp: any) => {
    const teamId = tp.team_id as string;
    const playerId = tp.player_id as string;
    const r = ratingLookup.get(playerId) ?? 1000;
    const prev = teamRatingMap.get(teamId);
    if (prev == null) {
      teamRatingMap.set(teamId, r);
    } else {
      // tạm thời lấy trung bình của 2 người
      teamRatingMap.set(teamId, Math.round((prev + r) / 2));
    }
  });

  const entryMap = new Map<
    string,
    {
      name: string;
      rating: number | null;
      isDoubles: boolean;
      avatarUrl: string | null;
      members?: { name: string; avatarUrl: string | null }[];
    }
  >();
  (entries ?? []).forEach((e: any) => {
    const id = e.id as string;
    if (e.player_id) {
      const p = playerMap.get(e.player_id as string);
      entryMap.set(id, {
        name: p?.name ?? "Unknown player",
        rating: p?.rating ?? null,
        isDoubles: false,
        avatarUrl: p?.avatarUrl ?? null,
        members: [
          {
            name: p?.name ?? "Unknown player",
            avatarUrl: p?.avatarUrl ?? null,
          },
        ],
      });
    } else if (e.team_id) {
      const name = teamNameMap.get(e.team_id as string) ?? "Unnamed Team";
      const rating = teamRatingMap.get(e.team_id as string) ?? null;
      const membersRows =
        teamPlayers?.filter((tp: any) => tp.team_id === e.team_id) ?? [];
      const members =
        membersRows.map((tp: any) => ({
          name: tp.players?.full_name ?? "Unknown player",
          avatarUrl: (tp.players?.avatar_url as string | null) ?? null,
        })) ?? [];
      entryMap.set(id, {
        name,
        rating,
        isDoubles: true,
        avatarUrl: null,
        members,
      });
    }
  });

  return (matches as any[]).map((m) => {
    const a = entryMap.get(m.entry_a_id as string);
    const b = entryMap.get(m.entry_b_id as string);
    const isDoubles = a?.isDoubles || b?.isDoubles || false;
    return {
      id: m.id as string,
      status: m.status as MatchStatus,
      entryAId: m.entry_a_id as string,
      entryBId: m.entry_b_id as string,
      entryAName: a?.name ?? "Unknown",
      entryBName: b?.name ?? "Unknown",
      entryAElo: a?.rating ?? null,
      entryBElo: b?.rating ?? null,
      isDoubles,
      scoreA: (m.score_a as number[] | null) ?? null,
      scoreB: (m.score_b as number[] | null) ?? null,
      entryAAvatarUrl: a?.avatarUrl ?? null,
      entryBAvatarUrl: b?.avatarUrl ?? null,
      entryATeamMembers: a?.members,
      entryBTeamMembers: b?.members,
    } as MatchDisplay;
  });
}

export async function createMatch(params: {
  tournamentId: string;
  entryAId: string;
  entryBId: string;
  status?: MatchStatus;
}) {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      tournament_id: params.tournamentId,
      entry_a_id: params.entryAId,
      entry_b_id: params.entryBId,
      status: params.status ?? "scheduled",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Match;
}

export async function updateMatchScore(params: {
  matchId: string;
  scoreA: number[];
  scoreB: number[];
}) {
  const { data, error } = await supabase
    .from("matches")
    .update({
      score_a: params.scoreA,
      score_b: params.scoreB,
      status: "finished",
    })
    .eq("id", params.matchId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

