"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../../lib/supabaseClient";
import { fetchMatchesByTournament, MatchDisplay } from "../../../../lib/api/matches";
import Link from "next/link";

type Tournament = {
  id: string;
  name: string;
  cover_image_url: string | null;
  k_factor: number;
  status: string;
  format: string;
  start_date: string | null;
  end_date: string | null;
};

async function fetchTournament(id: string): Promise<Tournament> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Tournament;
}

function renderStatusBadge(status: string) {
  let label = status;
  let background = "bg-slate-100";
  let textColor = "text-slate-600";

  switch (status) {
    case "upcoming":
      label = "Upcoming";
      background = "bg-blue-100 dark:bg-blue-900/30";
      textColor = "text-blue-600 dark:text-blue-400";
      break;
    case "ongoing":
      label = "Ongoing";
      background = "bg-green-100 dark:bg-green-900/30";
      textColor = "text-green-600 dark:text-green-400";
      break;
    case "finished":
      label = "Finished";
      background = "bg-slate-100 dark:bg-slate-700";
      textColor = "text-slate-600 dark:text-slate-400";
      break;
    case "locked":
      label = "Locked";
      background = "bg-red-100 dark:bg-red-900/30";
      textColor = "text-red-600 dark:text-red-400";
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${background} ${textColor}`}>
      {label}
    </span>
  );
}

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: tournament, isLoading, isError, error } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => fetchTournament(id),
    enabled: !!id,
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery<MatchDisplay[]>({
    queryKey: ["tournament-matches", id],
    queryFn: () => fetchMatchesByTournament(id),
    enabled: !!id,
  });

  const singlesMatches = (matches ?? []).filter((m) => !m.isDoubles);
  const doublesMatches = (matches ?? []).filter((m) => m.isDoubles);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  const isTournamentFinished = tournament?.status === "finished";

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-slate-900">
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
              Tournament Detail
            </h1>
            <div className="w-8" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-12 text-center">
            <div className="text-slate-500 dark:text-slate-400">Đang tải thông tin tournament...</div>
          </div>
        ) : isError || !tournament ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-12 text-center">
            <p className="text-red-600 dark:text-red-400">
              Không tải được tournament. {error instanceof Error ? error.message : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cover Image */}
            {tournament.cover_image_url ? (
              <img
                src={tournament.cover_image_url}
                alt={tournament.name}
                className="w-full aspect-video object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full aspect-video bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🏆</span>
              </div>
            )}

            {/* Tournament Info Card - Highlighted */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent rounded-2xl border-2 border-primary/30 dark:border-primary/40 p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {tournament.name}
                    </h2>
                    {renderStatusBadge(tournament.status)}
                  </div>
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary text-lg">category</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Format
                        </span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {tournament.format}
                      </p>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          K-Factor
                        </span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        k = {tournament.k_factor}
                      </p>
                    </div>

                    {tournament.start_date && (
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-lg">play_arrow</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Start Date
                          </span>
                        </div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {new Date(tournament.start_date).toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}

                    {tournament.end_date && (
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-lg">stop</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            End Date
                          </span>
                        </div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {new Date(tournament.end_date).toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Primary Action */}
              <Link
                href={`/admin/tournaments/${id}/matches/create`}
                className={`block bg-primary text-white rounded-2xl p-4 hover:bg-primary/90 transition-colors ${
                  tournament.status === "finished" ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">add_circle</span>
                  <span className="text-base font-semibold">Tạo Trận Đấu</span>
                </div>
              </Link>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/tournaments/${id}/standings`}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">leaderboard</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Bảng Xếp Hạng
                    </span>
                  </div>
                </Link>

                <Link
                  href={`/admin/tournaments/${id}/finalize`}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-xl ${
                      tournament.status === "finished" ? "text-slate-500" : "text-primary"
                    }`}>
                      emoji_events
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {tournament.status === "finished" ? "Xem Xếp Hạng Cuối" : "Xác Nhận Xếp Hạng"}
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Matches List */}
            <div className="space-y-6">
              {/* Singles Matches */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Trận Đơn
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {singlesMatches.length} trận
                  </span>
                </div>
                {isLoadingMatches ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Đang tải trận đấu...
                  </div>
                ) : singlesMatches.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Chưa có trận đơn nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {singlesMatches.map((m) => {
                      const hasScore = m.scoreA && m.scoreB && m.scoreA.length === m.scoreB.length && m.scoreA.length > 0;
                      const lastScoreA = hasScore ? m.scoreA![m.scoreA!.length - 1] : null;
                      const lastScoreB = hasScore ? m.scoreB![m.scoreB!.length - 1] : null;
                      const isFinished = m.status === "finished";
                      const footerLabel = isFinished ? "Chỉnh Sửa Kết Quả" : "Nhập Điểm";
                      const statusText = m.status === "finished" ? "Đã Kết Thúc" : m.status === "in_progress" ? "Đang Diễn Ra" : "Đã Lên Lịch";

                      return (
                        <div key={m.id} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {m.entryAAvatarUrl ? (
                                  <img src={m.entryAAvatarUrl} alt={m.entryAName} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                      {getInitials(m.entryAName)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {m.entryAName}
                                    {m.entryAElo != null && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        ({m.entryAElo})
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-base font-bold ${hasScore ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                                {hasScore ? lastScoreA : "-"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {m.entryBAvatarUrl ? (
                                  <img src={m.entryBAvatarUrl} alt={m.entryBName} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                      {getInitials(m.entryBName)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {m.entryBName}
                                    {m.entryBElo != null && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        ({m.entryBElo})
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-base font-bold ${hasScore ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                                {hasScore ? lastScoreB : "-"}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/admin/tournaments/${id}/matches/${m.id}/edit`}
                            className={`block border-t border-slate-200 dark:border-slate-600 p-3 flex items-center justify-between ${
                              isTournamentFinished ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              isFinished ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            }`}>
                              {statusText}
                            </span>
                            <span className={`text-sm font-semibold ${
                              isTournamentFinished ? "text-slate-400" : "text-primary"
                            }`}>
                              {footerLabel}
                            </span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Doubles Matches */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Trận Đôi
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-700 dark:text-blue-400">
                    {doublesMatches.length} trận
                  </span>
                </div>
                {isLoadingMatches ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Đang tải trận đấu...
                  </div>
                ) : doublesMatches.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Chưa có trận đôi nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doublesMatches.map((m) => {
                      const hasScore = m.scoreA && m.scoreB && m.scoreA.length === m.scoreB.length && m.scoreA.length > 0;
                      const lastScoreA = hasScore ? m.scoreA![m.scoreA!.length - 1] : null;
                      const lastScoreB = hasScore ? m.scoreB![m.scoreB!.length - 1] : null;
                      const isFinished = m.status === "finished";
                      const footerLabel = isFinished ? "Chỉnh Sửa Kết Quả" : "Nhập Điểm";
                      const statusText = m.status === "finished" ? "Đã Kết Thúc" : m.status === "in_progress" ? "Đang Diễn Ra" : "Đã Lên Lịch";

                      return (
                        <div key={m.id} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {m.entryATeamMembers && m.entryATeamMembers.length > 1 ? (
                                  <div className="flex -space-x-2">
                                    {m.entryATeamMembers.map((member, idx) => (
                                      member.avatarUrl ? (
                                        <img key={idx} src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
                                      ) : (
                                        <div key={idx} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            {getInitials(member.name)}
                                          </span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                      {getInitials(m.entryAName)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {m.entryAName}
                                    {m.entryAElo != null && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        ({m.entryAElo})
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-base font-bold ${hasScore ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                                {hasScore ? lastScoreA : "-"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {m.entryBTeamMembers && m.entryBTeamMembers.length > 1 ? (
                                  <div className="flex -space-x-2">
                                    {m.entryBTeamMembers.map((member, idx) => (
                                      member.avatarUrl ? (
                                        <img key={idx} src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
                                      ) : (
                                        <div key={idx} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            {getInitials(member.name)}
                                          </span>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                      {getInitials(m.entryBName)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {m.entryBName}
                                    {m.entryBElo != null && (
                                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        ({m.entryBElo})
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-base font-bold ${hasScore ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                                {hasScore ? lastScoreB : "-"}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/admin/tournaments/${id}/matches/${m.id}/edit`}
                            className={`block border-t border-slate-200 dark:border-slate-600 p-3 flex items-center justify-between ${
                              isTournamentFinished ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              isFinished ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            }`}>
                              {statusText}
                            </span>
                            <span className={`text-sm font-semibold ${
                              isTournamentFinished ? "text-slate-400" : "text-primary"
                            }`}>
                              {footerLabel}
                            </span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
