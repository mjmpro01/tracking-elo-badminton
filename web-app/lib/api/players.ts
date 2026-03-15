import { supabase } from "../supabaseClient";

export type Player = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  is_member: boolean;
  gender?: string | null;
  handedness?: string | null;
};

export type PlayerWithRating = {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number | null;
  is_member?: boolean;
};

export async function fetchPlayerById(playerId: string): Promise<PlayerWithRating & { is_member?: boolean } | null> {
  // First get from view for rating
  const { data: viewData, error: viewError } = await supabase
    .from("player_current_rating_view")
    .select("player_id, full_name, avatar_url, rating")
    .eq("player_id", playerId)
    .maybeSingle();

  if (viewError) throw viewError;
  if (!viewData) return null;

  // Then get is_member from players table
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("is_member")
    .eq("id", playerId)
    .maybeSingle();

  if (playerError) throw playerError;

  return {
    ...viewData,
    is_member: playerData?.is_member ?? true,
  } as PlayerWithRating & { is_member?: boolean };
}

export async function updatePlayer(
  playerId: string,
  payload: {
    full_name?: string;
    gender?: string;
    handedness?: string;
    is_member?: boolean;
    avatar_url?: string | null;
  }
): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .update(payload)
    .eq("id", playerId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Player;
}
