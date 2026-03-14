import { supabase } from "../supabase";

export type TournamentStatus = "upcoming" | "ongoing" | "finished" | "locked";

export type Tournament = {
  id: string;
  name: string;
  cover_image_url: string | null;
  k_factor: number;
  status: TournamentStatus;
  format: string;
  start_date: string | null;
  end_date: string | null;
};

export async function fetchTournaments(params?: {
  status?: TournamentStatus;
}) {
  let query = supabase.from("tournaments").select("*").order("created_at", {
    ascending: false,
  });

  if (params?.status) {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Tournament[];
}

export async function fetchTournamentById(id: string) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function fetchOngoingTournament() {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("status", "ongoing")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Tournament | null;
}

export async function fetchLatestTournament() {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Tournament | null;
}

export async function createTournament(payload: {
  name: string;
  k_factor: number;
  format: string;
  status?: TournamentStatus;
  start_date?: string;
  end_date?: string;
}) {
  const { data, error } = await supabase
    .from("tournaments")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function registerSinglesEntries(params: {
  tournamentId: string;
  players: { id: string }[];
}) {
  if (!params.players.length) return;

  const rows = params.players.map((p, index) => ({
    tournament_id: params.tournamentId,
    player_id: p.id,
    seed: index + 1,
  }));

  const { error } = await supabase
    .from("tournament_entries")
    .insert(rows);
  if (error) throw error;
}

export async function registerDoublesEntries(params: {
  tournamentId: string;
  teams: {
    id: string;
    combinedElo: number;
    players: { id: string; name: string }[];
  }[];
}) {
  if (!params.teams.length) return;

  // 1. Tạo teams
  const teamRows = params.teams.map((team) => ({
    name: team.players.map((p) => p.name.split(" ")[0]).join(" / "),
  }));

  const { data: createdTeams, error: teamError } = await supabase
    .from("teams")
    .insert(teamRows)
    .select("id");
  if (teamError) throw teamError;

  // 2. Gán player vào team_players
  const teamPlayersRows: { team_id: string; player_id: string }[] = [];
  createdTeams.forEach((row: any, index: number) => {
    const team = params.teams[index];
    team.players.forEach((p) => {
      teamPlayersRows.push({
        team_id: row.id as string,
        player_id: p.id,
      });
    });
  });

  if (teamPlayersRows.length) {
    const { error: tpError } = await supabase
      .from("team_players")
      .insert(teamPlayersRows);
    if (tpError) throw tpError;
  }

  // 3. Tạo tournament_entries cho từng team
  const entryRows = createdTeams.map((row: any, index: number) => ({
    tournament_id: params.tournamentId,
    team_id: row.id as string,
    seed: index + 1,
  }));

  const { error: entryError } = await supabase
    .from("tournament_entries")
    .insert(entryRows);
  if (entryError) throw entryError;
}
