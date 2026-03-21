import { supabase } from "../supabaseClient";

export type StandingRow = {
  position: number;
  entryId: string;
  name: string;
  wins: number;
  losses: number;
  points: number;
  scoreDifference: number; // Tổng điểm thắng - Tổng điểm thua
  elo: number | null;
  isDoubles: boolean;
  avatarUrl: string | null;
  members?: { name: string; avatarUrl: string | null }[];
};

export async function fetchTournamentStandings(
  tournamentId: string,
): Promise<StandingRow[]> {
  // 1. Lấy tất cả entries của tournament (player hoặc team)
  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, player_id, team_id")
    .eq("tournament_id", tournamentId);
  if (entriesError) throw entriesError;
  if (!entries || entries.length === 0) return [];

  const entryIds = entries.map((e: any) => e.id as string);

  // Nếu tournament đã finished/locked thì dùng thứ tự đã lưu trong `tournament_standings.position`,
  // tránh việc sort lại theo Points/Elo làm lệch rank so với thao tác trên UI.
  const { data: tournamentInfo, error: tournamentInfoError } = await supabase
    .from("tournaments")
    .select("status")
    .eq("id", tournamentId)
    .single();
  if (tournamentInfoError) throw tournamentInfoError;

  const tournamentStatus = tournamentInfo?.status as string | null;
  const shouldUseStoredStandings =
    tournamentStatus === "finished" || tournamentStatus === "locked";

  // 2. Chuẩn bị data cho player/team (tên, Elo, avatar, members)
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

  // 3. Thông tin player hiện tại (tên + Elo + avatar)
  const { data: players, error: playersError } = await supabase
    .from("player_current_rating_view")
    .select("player_id, full_name, rating, avatar_url")
    .in("player_id", playerIds);
  if (playersError) throw playersError;

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

  // 4. Thông tin team + members để stack avatar
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

  const ratingLookup = new Map<string, number | null>();
  (teamRatings ?? []).forEach((r: any) => {
    ratingLookup.set(
      r.player_id as string,
      (r.rating as number | null) ?? null,
    );
  });

  const teamRatingMap = new Map<string, number | null>();
  (teamPlayers ?? []).forEach((tp: any) => {
    const teamId = tp.team_id as string;
    const playerId = tp.player_id as string;
    const r = ratingLookup.get(playerId) ?? 1000;
    const prev = teamRatingMap.get(teamId);
    if (prev == null) {
      teamRatingMap.set(teamId, r);
    } else {
      teamRatingMap.set(teamId, Math.round((prev + r) / 2));
    }
  });

  // 5. Build map entry -> thông tin hiển thị
  const entryMap = new Map<
    string,
    {
      name: string;
      elo: number | null;
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
        elo: p?.rating ?? null,
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
      const team = (teams ?? []).find((t: any) => t.id === e.team_id);
      const name = (team?.name as string) ?? "Unnamed Team";
      const elo = teamRatingMap.get(e.team_id as string) ?? null;
      const membersRows =
        teamPlayers?.filter((tp: any) => tp.team_id === e.team_id) ?? [];
      const members =
        membersRows.map((tp: any) => ({
          name: tp.players?.full_name ?? "Unknown player",
          avatarUrl: (tp.players?.avatar_url as string | null) ?? null,
        })) ?? [];
      entryMap.set(id, {
        name,
        elo,
        isDoubles: true,
        avatarUrl: null,
        members,
      });
    }
  });

  // 3. Lấy tất cả matches của tournament để tự tính W/L/Pts
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("entry_a_id, entry_b_id, score_a, score_b, status")
    .eq("tournament_id", tournamentId);
  if (matchesError) throw matchesError;

  type Stat = { wins: number; losses: number; points: number; scoreDifference: number };
  const statMap = new Map<string, Stat>();
  entryIds.forEach((id) => {
    statMap.set(id, { wins: 0, losses: 0, points: 0, scoreDifference: 0 });
  });

  const decideWinner = (scoreA: number[], scoreB: number[]): 0 | 1 | 2 => {
    if (!scoreA.length || scoreA.length !== scoreB.length) return 0;
    let setsA = 0;
    let setsB = 0;
    for (let i = 0; i < scoreA.length; i++) {
      if (scoreA[i] > scoreB[i]) setsA++;
      else if (scoreB[i] > scoreA[i]) setsB++;
    }
    if (setsA > setsB) return 1;
    if (setsB > setsA) return 2;
    const totalA = scoreA.reduce((s, v) => s + v, 0);
    const totalB = scoreB.reduce((s, v) => s + v, 0);
    if (totalA > totalB) return 1;
    if (totalB > totalA) return 2;
    return 0;
  };

  (matches ?? []).forEach((m: any) => {
    const entryAId = m.entry_a_id as string;
    const entryBId = m.entry_b_id as string;
    const scoreA = (m.score_a as number[] | null) ?? null;
    const scoreB = (m.score_b as number[] | null) ?? null;
    if (!scoreA || !scoreB) return;
    const winner = decideWinner(scoreA, scoreB);
    if (winner === 0) return;

    const aStat = statMap.get(entryAId);
    const bStat = statMap.get(entryBId);
    if (!aStat || !bStat) return;

    // Tính tổng điểm cho mỗi bên
    const totalA = scoreA.reduce((sum: number, s: number) => sum + s, 0);
    const totalB = scoreB.reduce((sum: number, s: number) => sum + s, 0);

    if (winner === 1) {
      aStat.wins += 1;
      bStat.losses += 1;
      // Entry A thắng: thêm điểm thắng, trừ điểm thua
      aStat.scoreDifference += totalA - totalB;
      // Entry B thua: trừ điểm thắng, thêm điểm thua (âm)
      bStat.scoreDifference += totalB - totalA;
    } else if (winner === 2) {
      bStat.wins += 1;
      aStat.losses += 1;
      // Entry B thắng
      bStat.scoreDifference += totalB - totalA;
      // Entry A thua
      aStat.scoreDifference += totalA - totalB;
    }
  });

  // Điểm = W * 3
  statMap.forEach((stat) => {
    stat.points = stat.wins * 3;
  });

  // 4. Ghép entryMap + statMap rồi sort:
  // - Nếu finished/locked: sort theo `tournament_standings.position` đã được bạn confirm.
  // - Nếu ongoing: sort theo Points desc, Elo desc (auto).
  let storedStandings: Array<{
    entry_id: string;
    position: number;
    wins: number;
    losses: number;
    points: number;
  }> = [];

  if (shouldUseStoredStandings) {
    const { data, error: storedStandingsError } = await supabase
      .from("tournament_standings")
      .select("entry_id, position, wins, losses, points")
      .eq("tournament_id", tournamentId)
      .order("position", { ascending: true });

    if (storedStandingsError) throw storedStandingsError;
    storedStandings = (data ?? []) as any;
  }

  const hasStoredStandings = storedStandings.length > 0;
  const storedStandingsMap = new Map<string, (typeof storedStandings)[number]>(
    storedStandings.map((r) => [r.entry_id, r]),
  );

  const rows: StandingRow[] = entryIds.map((id) => {
    const entry = entryMap.get(id);
    const stat = statMap.get(id) ?? {
      wins: 0,
      losses: 0,
      points: 0,
      scoreDifference: 0,
    };
    const stored = storedStandingsMap.get(id);

    return {
      position: stored?.position ?? (hasStoredStandings ? Number.MAX_SAFE_INTEGER : 0),
      entryId: id,
      name: entry?.name ?? "Unknown",
      // Nếu có stored standings thì lấy wins/losses/points theo đúng dữ liệu đã lưu.
      wins: stored?.wins ?? stat.wins,
      losses: stored?.losses ?? stat.losses,
      points: stored?.points ?? stat.points,
      scoreDifference: stat.scoreDifference,
      elo: entry?.elo ?? null,
      isDoubles: entry?.isDoubles ?? false,
      avatarUrl: entry?.avatarUrl ?? null,
      members: entry?.members,
    };
  });

  if (hasStoredStandings) {
    rows.sort((a, b) => a.position - b.position);
    // Chuẩn hoá position thành 1..N theo thứ tự đã sort để tránh bị hổng/gấp khúc.
    rows.forEach((r, idx) => {
      r.position = idx + 1;
    });
    return rows;
  }

  // ongoing: sort auto theo Points desc, Elo desc
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const eloA = a.elo ?? 0;
    const eloB = b.elo ?? 0;
    return eloB - eloA;
  });

  rows.forEach((r, idx) => {
    r.position = idx + 1;
  });

  return rows;
}

export async function saveFinalStandings(params: {
  tournamentId: string;
  rows: StandingRow[];
}) {
  const { tournamentId, rows } = params;
  if (!rows.length) return;

  // Xoá standings cũ của tournament (nếu có)
  const { error: deleteError } = await supabase
    .from("tournament_standings")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deleteError) throw deleteError;

  // Insert standings mới theo thứ tự hiện tại
  const payload = rows.map((r) => ({
    tournament_id: tournamentId,
    entry_id: r.entryId,
    position: r.position,
    wins: r.wins,
    losses: r.losses,
    points: r.points,
  }));

  const { error: insertError } = await supabase
    .from("tournament_standings")
    .insert(payload);
  if (insertError) throw insertError;

  // Cập nhật trạng thái giải
  const { error: updateError } = await supabase
    .from("tournaments")
    .update({ status: "finished" })
    .eq("id", tournamentId);
  if (updateError) throw updateError;

  // Áp dụng Elo theo xếp hạng cuối cùng (top 3 cộng, còn lại trừ) dùng k_factor của giải
  const { error: eloError } = await supabase.rpc(
    "apply_final_rank_elo",
    { p_tournament_id: tournamentId },
  );
  if (eloError) throw eloError;
}
