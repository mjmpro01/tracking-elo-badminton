import { supabase } from "../supabase";

export type Player = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  is_member: boolean;
  handedness: string | null;
  gender: string | null;
  is_active: boolean;
};

export type PlayerWithStats = {
  player_id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  rank: number;
  wins: number;
};

export async function fetchPlayers(params?: { search?: string }) {
  let query = supabase
    .from("player_current_rating_view")
    .select("player_id, full_name, avatar_url, rating")
    .not("rating", "is", null) // Chỉ lấy members (có rating)
    .order("rating", { ascending: false });

  if (params?.search) {
    query = query.ilike("full_name", `%${params.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlayersWithStats(params?: {
  search?: string;
}): Promise<PlayerWithStats[]> {
  // Fetch players với rating
  const players = await fetchPlayers(params);

  if (players.length === 0) return [];

  const playerIds = players.map((p) => p.player_id);

  // Fetch tất cả tournament_entries của các players này
  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, player_id")
    .in("player_id", playerIds);

  if (entriesError) throw entriesError;

  // Map player_id -> entry_ids[]
  const playerEntryMap = new Map<string, string[]>();
  entries?.forEach((entry: any) => {
    const pid = entry.player_id;
    if (!playerEntryMap.has(pid)) {
      playerEntryMap.set(pid, []);
    }
    playerEntryMap.get(pid)!.push(entry.id);
  });

  // Fetch tất cả matches đã finished
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, winner_entry_id")
    .eq("status", "finished")
    .not("winner_entry_id", "is", null);

  if (matchesError) throw matchesError;

  // Tính wins cho mỗi player
  const playerWinsMap = new Map<string, number>();
  playerIds.forEach((pid) => {
    playerWinsMap.set(pid, 0);
  });

  matches?.forEach((match: any) => {
    const winnerEntryId = match.winner_entry_id;
    // Tìm player nào có entry này
    for (const [pid, entryIds] of playerEntryMap.entries()) {
      if (entryIds.includes(winnerEntryId)) {
        const currentWins = playerWinsMap.get(pid) || 0;
        playerWinsMap.set(pid, currentWins + 1);
        break;
      }
    }
  });

  // Combine và tính rank
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

export async function createPlayer(payload: {
  full_name: string;
  gender?: string;
  handedness?: string;
  is_member?: boolean;
  avatar_url?: string | null;
}) {
  const { data, error } = await supabase
    .from("players")
    .insert({
      full_name: payload.full_name,
      gender: payload.gender,
      handedness: payload.handedness,
      is_member: payload.is_member ?? true,
      avatar_url: payload.avatar_url ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Player;
}

export async function updatePlayer(
  playerId: string,
  payload: {
    full_name?: string;
    gender?: string;
    handedness?: string;
    is_member?: boolean;
    avatar_url?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("players")
    .update(payload)
    .eq("id", playerId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Player;
}

export async function fetchPlayerById(playerId: string) {
  const { data, error } = await supabase
    .from("player_current_rating_view")
    .select("player_id, full_name, avatar_url, rating")
    .eq("player_id", playerId)
    .single();

  if (error) throw error;
  return data;
}
