import { supabase } from "../../supabaseClient";

export type LatestTournament = {
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

export type Match = {
  id: string;
  tournament_id: string;
  status: string;
  scheduled_at: string | null;
  court: string | null;
};

export async function fetchLatestTournament() {
  const { data, error } = await supabase
    .from("latest_tournament_summary_view")
    .select("*")
    .maybeSingle<LatestTournament>();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchTodayMatches() {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0
  ).toISOString();
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  ).toISOString();

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .in("status", ["scheduled", "pending_review"])
    .gte("scheduled_at", start)
    .lte("scheduled_at", end)
    .order("scheduled_at", { ascending: true })
    .returns<Match[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}
