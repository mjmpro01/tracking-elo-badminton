"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";

type PlayerReview = {
  id: string;
  name: string;
  rating: number | null;
  avatarUrl: string | null;
};

type TeamReview = {
  id: string;
  combinedElo: number;
  players: PlayerReview[];
};

export default function TournamentReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = searchParams.get("mode") as "singles" | "doubles" | null;
  const players: PlayerReview[] = searchParams.get("players")
    ? JSON.parse(decodeURIComponent(searchParams.get("players")!))
    : [];
  const teams: TeamReview[] = searchParams.get("teams")
    ? JSON.parse(decodeURIComponent(searchParams.get("teams")!))
    : [];
  const kFactorParam = searchParams.get("kFactor");
  const parsedKFactor = kFactorParam == null ? NaN : Number(kFactorParam);
  const kFactor = Number.isFinite(parsedKFactor) ? parsedKFactor : 60;
  const tournamentName = searchParams.get("name") || "New Tournament";
  const startDateISO = searchParams.get("date") || undefined;
  const coverImageUrl = searchParams.get("cover") || undefined;

  const formattedDate = startDateISO
    ? new Date(startDateISO).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "TBD";

  const sortedPlayers = [...players].sort((a, b) => (b.rating ?? 1000) - (a.rating ?? 1000));
  const sortedTeams = [...teams].sort((a, b) => b.combinedElo - a.combinedElo);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  const handleFinish = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        name: tournamentName,
        k_factor: kFactor,
        cover_image_url: coverImageUrl ?? null,
        format: mode === "singles" ? "singles" : "doubles",
        status: "upcoming",
        start_date: startDateISO ? startDateISO.slice(0, 10) : undefined,
      };

      const { data: tournament, error: tournamentError } = await supabase
        .from("tournaments")
        .insert(payload)
        .select("*")
        .single();

      if (tournamentError) throw tournamentError;

      if (mode === "singles") {
        const entries = sortedPlayers.map((p, index) => ({
          tournament_id: tournament.id,
          player_id: p.id,
          seed: index + 1,
        }));

        const { error: entriesError } = await supabase
          .from("tournament_entries")
          .insert(entries);

        if (entriesError) throw entriesError;
      } else {
        // Create teams
        const teamRows = sortedTeams.map((team) => ({
          name: team.players.map((p) => p.name.split(" ")[0]).join(" / "),
        }));

        const { data: createdTeams, error: teamError } = await supabase
          .from("teams")
          .insert(teamRows)
          .select("id");

        if (teamError) throw teamError;

        // Add players to teams
        const teamPlayersRows: { team_id: string; player_id: string }[] = [];
        createdTeams.forEach((row: any, index: number) => {
          const team = sortedTeams[index];
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

        // Create entries
        const entryRows = createdTeams.map((row: any, index: number) => ({
          tournament_id: tournament.id,
          team_id: row.id as string,
          seed: index + 1,
        }));

        const { error: entryError } = await supabase
          .from("tournament_entries")
          .insert(entryRows);
        if (entryError) throw entryError;
      }

      // Clear sessionStorage after successful creation
      sessionStorage.removeItem("create-tournament-state");

      router.push(`/admin/tournaments/${tournament.id}`);
    } catch (err: any) {
      console.error("createTournament error", err);
      setError(err.message || "Không thể tạo tournament. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Dữ liệu giải đấu không hợp lệ</p>
      </div>
    );
  }

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
              Xem Lại Giải Đấu ({mode === "singles" ? "Đơn" : "Đôi"})
            </h1>
            <div className="w-8" />
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="max-w-4xl mx-auto px-4 pt-2 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-primary">Hoàn Thành</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">4 of 4</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 h-1 rounded-full bg-primary" />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Summary card */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Tên Giải Đấu
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {tournamentName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Ngày
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {formattedDate}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Loại
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                {mode}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                K-Factor
              </p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{kFactor}</p>
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">
                  help_outline
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Người Chơi Đã Chọn
            </h2>
            <div className="px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {mode === "singles" ? `${sortedPlayers.length} Người Chơi` : `${sortedTeams.length} Đội`}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden">
            {mode === "singles" ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedPlayers.map((player, index) => {
                  const initials = getInitials(player.name);
                  const elo = player.rating ?? 1000;
                  return (
                    <div key={player.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2.5">
                        {player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {initials}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {player.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Current Rank #{index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{elo}</p>
                        <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Elo</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedTeams.map((team, index) => {
                  const [p1, p2] = team.players;
                  const label = team.players
                    .map((p) => p.name.split(" ")[0])
                    .join(" / ");
                  const teamElo = team.combinedElo ?? 0;
                  return (
                    <div key={team.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex -space-x-3">
                          {p1 && (
                            p1.avatarUrl ? (
                              <img
                                src={p1.avatarUrl}
                                alt={p1.name}
                                className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  {getInitials(p1.name)}
                                </span>
                              </div>
                            )
                          )}
                          {p2 && (
                            p2.avatarUrl ? (
                              <img
                                src={p2.avatarUrl}
                                alt={p2.name}
                                className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 object-cover -ml-3"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center -ml-3">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  {getInitials(p2.name)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Combined Rank #{index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{teamElo}</p>
                        <p className="text-xs uppercase text-slate-500 dark:text-slate-400">ELO Đội</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="w-full bg-primary text-white rounded-full px-4 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang tạo giải đấu..." : "Xác Nhận Giải Đấu"}
          </button>
        </div>
      </div>
    </div>
  );
}
