"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../../../lib/supabaseClient";
import { createMatch } from "../../../../../../lib/api/matches";

type Option = { id: string; name: string; rating: number | null };

export default function CreateMatchPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tournamentId = params.id as string;

  const { data: tournament } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("format")
        .eq("id", tournamentId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });

  const isDoubles = tournament?.format === "doubles";

  const [options, setOptions] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [awayId, setAwayId] = useState<string | null>(null);
  const [homeOpen, setHomeOpen] = useState(false);
  const [awayOpen, setAwayOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const homeOptions = options;
  const awayOptions = awayOpen ? options.filter((opt) => opt.id !== homeId) : options;

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError(null);

        if (!isDoubles) {
          // Singles: lấy player entries của tournament
          const { data: entries, error: entriesError } = await supabase
            .from("tournament_entries")
            .select("id, player_id")
            .eq("tournament_id", tournamentId)
            .not("player_id", "is", null);
          if (entriesError) throw entriesError;

          const playerIds = Array.from(
            new Set(
              (entries ?? [])
                .map((e: any) => e.player_id as string | null)
                .filter((id): id is string => !!id),
            ),
          );

          if (!playerIds.length) {
            setOptions([]);
            return;
          }

          const { data: players, error: playersError } = await supabase
            .from("player_current_rating_view")
            .select("player_id, full_name, rating")
            .in("player_id", playerIds);
          if (playersError) throw playersError;

          const mapped: Option[] =
            entries?.map((entry: any) => {
              const player = (players ?? []).find(
                (p: any) => p.player_id === entry.player_id,
              );
              return {
                id: entry.id as string,
                name: (player?.full_name as string) ?? "Unknown player",
                rating: (player?.rating as number | null | undefined) ?? null,
              };
            }) ?? [];

          setOptions(mapped);
        } else {
          // Doubles: lấy teams entries của tournament
          const { data: entries, error: entriesError } = await supabase
            .from("tournament_entries")
            .select("id, team_id")
            .eq("tournament_id", tournamentId)
            .not("team_id", "is", null);
          if (entriesError) throw entriesError;

          const teamIds = Array.from(
            new Set(
              (entries ?? [])
                .map((e: any) => e.team_id as string | null)
                .filter((id): id is string => !!id),
            ),
          );

          if (!teamIds.length) {
            setOptions([]);
            return;
          }

          const { data: teams, error: teamsError } = await supabase
            .from("teams")
            .select("id, name")
            .in("id", teamIds);
          if (teamsError) throw teamsError;

          const { data: teamPlayers, error: tpError } = await supabase
            .from("team_players")
            .select("team_id, player_id")
            .in("team_id", teamIds);
          if (tpError) throw tpError;

          const playerIds = Array.from(
            new Set(
              (teamPlayers ?? [])
                .map((tp: any) => tp.player_id as string | null)
                .filter((id): id is string => !!id),
            ),
          );

          const { data: ratings, error: ratingsError } = await supabase
            .from("player_current_rating_view")
            .select("player_id, rating")
            .in("player_id", playerIds);
          if (ratingsError) throw ratingsError;

          const ratingMap = new Map<string, number | null>();
          (ratings ?? []).forEach((r: any) => {
            ratingMap.set(r.player_id as string, (r.rating as number | null) ?? null);
          });

          const mapped: Option[] =
            entries?.map((entry: any) => {
              const team = (teams ?? []).find((t: any) => t.id === entry.team_id);
              const members =
                teamPlayers?.filter(
                  (tp: any) => tp.team_id === entry.team_id,
                ) ?? [];
              const memberRatings = members
                .map((m: any) => ratingMap.get(m.player_id as string) ?? 1000)
                .filter((v) => typeof v === "number") as number[];
              const avg =
                memberRatings.length > 0
                  ? Math.round(
                      memberRatings.reduce((sum, v) => sum + v, 0) /
                        memberRatings.length,
                    )
                  : null;

              return {
                id: entry.id as string,
                name: (team?.name as string) ?? "Unnamed Team",
                rating: avg,
              };
            }) ?? [];

          setOptions(mapped);
        }
      } catch (e: any) {
        console.error("load match options error", e);
        setOptionsError(e?.message ?? "Không tải được danh sách players/teams.");
      } finally {
        setLoadingOptions(false);
      }
    };

    if (tournamentId && tournament) {
      loadOptions();
    }
  }, [isDoubles, tournamentId, tournament]);

  const handleCreate = async () => {
    if (submitting) return;
    if (!homeId || !awayId) {
      alert("Vui lòng chọn đủ 2 phía Home và Away.");
      return;
    }
    if (homeId === awayId) {
      alert("Home và Away phải là 2 entry khác nhau.");
      return;
    }
    try {
      setSubmitting(true);
      await createMatch({
        tournamentId,
        entryAId: homeId,
        entryBId: awayId,
      });
      queryClient.invalidateQueries({
        queryKey: ["tournament-matches", tournamentId],
      });
      router.push(`/admin/tournaments/${tournamentId}`);
    } catch (e: any) {
      console.error("create match error", e);
      alert(e?.message ?? "Không thể tạo match. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-slate-900 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 text-xl">
                arrow_back
              </span>
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tạo Trận Đấu
            </h1>
            <div className="w-8" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Chi Tiết Trận Đấu
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cấu hình người chơi cho trận đấu.
          </p>
        </div>

        {/* Type badge */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
            {isDoubles ? "Trận Đôi" : "Trận Đơn"}
          </span>
        </div>

        {/* Home side */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {isDoubles ? "Đội Nhà 1" : "Người Chơi / Đội Nhà 1"}
            </label>
            <span className="text-xs text-primary">Quản Lý Danh Sách</span>
          </div>
          <button
            onClick={() => {
              if (loadingOptions) return;
              setHomeOpen((prev) => !prev);
              setAwayOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className={homeId ? "text-sm font-semibold text-slate-900 dark:text-slate-100" : "text-sm text-slate-500 dark:text-slate-400"}>
              {homeId
                ? options.find((o) => o.id === homeId)?.name
                : isDoubles
                  ? "Chọn đội 1"
                  : "Chọn người chơi 1"}
            </span>
            <span className="material-symbols-outlined text-slate-500 text-lg">
              {homeOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
          {homeOpen && !loadingOptions && homeOptions.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
              {homeOptions.map((opt) => {
                const selected = homeId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setHomeId(opt.id);
                      if (awayId === opt.id) {
                        setAwayId(null);
                      }
                      setHomeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-600 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors ${
                      selected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600" />
                      <div>
                        <p className={`text-sm font-semibold ${selected ? "text-primary" : "text-slate-900 dark:text-slate-100"}`}>
                          {opt.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Elo {opt.rating ?? 1000}
                        </p>
                      </div>
                    </div>
                    {selected && (
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {homeOpen && loadingOptions && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              Đang tải...
            </div>
          )}
          {homeOpen && !loadingOptions && options.length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              Không có {isDoubles ? "team" : "player"} nào trong tournament.
            </div>
          )}
        </div>

        {/* VS badge */}
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400">
            VS
          </span>
        </div>

        {/* Away side */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {isDoubles ? "Đội Khách 2" : "Người Chơi / Đội Khách 2"}
          </label>
          <button
            onClick={() => {
              if (loadingOptions) return;
              setAwayOpen((prev) => !prev);
              setHomeOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className={awayId ? "text-sm font-semibold text-slate-900 dark:text-slate-100" : "text-sm text-slate-500 dark:text-slate-400"}>
              {awayId
                ? options.find((o) => o.id === awayId)?.name
                : isDoubles
                  ? "Chọn đội 2"
                  : "Chọn người chơi 2"}
            </span>
            <span className="material-symbols-outlined text-slate-500 text-lg">
              {awayOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
          {awayOpen && !loadingOptions && awayOptions.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
              {awayOptions.map((opt) => {
                const selected = awayId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAwayId(opt.id);
                      setAwayOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-600 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors ${
                      selected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600" />
                      <div>
                        <p className={`text-sm font-semibold ${selected ? "text-primary" : "text-slate-900 dark:text-slate-100"}`}>
                          {opt.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Elo {opt.rating ?? 1000}
                        </p>
                      </div>
                    </div>
                    {selected && (
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {awayOpen && loadingOptions && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              Đang tải...
            </div>
          )}
          {awayOpen && !loadingOptions && options.length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              Không có {isDoubles ? "team" : "player"} nào trong tournament.
            </div>
          )}
        </div>

        {/* Match notes placeholder */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Match Notes (coming soon) – ghi chú cho trọng tài, sân, v.v.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full bg-primary text-white rounded-full px-4 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang tạo trận đấu..." : "Tạo Trận Đấu"}
          </button>
        </div>
      </div>
    </div>
  );
}
