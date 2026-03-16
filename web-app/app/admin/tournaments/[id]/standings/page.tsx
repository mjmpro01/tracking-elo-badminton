"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchTournamentStandings, StandingRow } from "../../../../../lib/api/standings";

export default function LiveStandingsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const { data: standings, isLoading, isError } = useQuery<StandingRow[]>({
    queryKey: ["tournament-standings", tournamentId],
    queryFn: () => fetchTournamentStandings(tournamentId),
    enabled: !!tournamentId,
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  const renderAvatar = (row: StandingRow) => {
    if (row.isDoubles && row.members && row.members.length > 1) {
      const m1 = row.members[0];
      const m2 = row.members[1];
      return (
        <div className="flex -space-x-3">
          {m1 && (
            m1.avatarUrl ? (
              <img
                src={m1.avatarUrl}
                alt={m1.name}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {getInitials(m1.name)}
                </span>
              </div>
            )
          )}
          {m2 && (
            m2.avatarUrl ? (
              <img
                src={m2.avatarUrl}
                alt={m2.name}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover -ml-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center -ml-3">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {getInitials(m2.name)}
                </span>
              </div>
            )
          )}
        </div>
      );
    }

    if (row.avatarUrl) {
      return (
        <img
          src={row.avatarUrl}
          alt={row.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
          {getInitials(row.name)}
        </span>
      </div>
    );
  };

  const renderRow = (row: StandingRow, index: number) => {
    const position = row.position ?? index + 1;
    const isGold = position === 1;
    const isSilver = position === 2;
    const isBronze = position === 3;

    // Trả lại style cũ: chỉ top 1 vàng, top 2 xám, top 3 cam
    const cardClass = isGold
      ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700"
      : isSilver
      ? "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-300 dark:border-slate-600"
      : isBronze
      ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700"
      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600";

    return (
      <div key={row.entryId} className={`rounded-2xl border p-4 ${cardClass}`}>
        {/* Desktop layout */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-8 text-center">
            {isGold || isSilver || isBronze ? (
              <span
                className={`material-symbols-outlined text-2xl ${
                  isGold
                    ? "text-yellow-600"
                    : isSilver
                    ? "text-slate-500"
                    : "text-orange-600"
                }`}
              >
                emoji_events
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {position}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-1">
            {renderAvatar(row)}
            <div className="flex-1">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {row.name}
              </p>
              {row.elo != null && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elo {row.elo}
                </p>
              )}
            </div>
          </div>
          <div className="text-center min-w-[3rem]">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {row.wins + row.losses}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">P</p>
          </div>
          <div className="text-center min-w-[3rem]">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {row.wins}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">W</p>
          </div>
          <div className="text-center min-w-[3rem]">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {row.losses}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">L</p>
          </div>
          <div className="text-center min-w-[3rem]">
            <p className={`text-sm font-bold ${
              row.scoreDifference > 0 
                ? "text-green-600 dark:text-green-400" 
                : row.scoreDifference < 0 
                ? "text-red-600 dark:text-red-400" 
                : "text-slate-600 dark:text-slate-400"
            }`}>
              {row.scoreDifference > 0 ? "+" : ""}{row.scoreDifference}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">+/-</p>
          </div>
          <div className="text-right min-w-[4rem]">
            <p className="text-base font-bold text-primary">{row.points}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pts</p>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10">
              {isGold || isSilver || isBronze ? (
                <span
                  className={`material-symbols-outlined text-xl ${
                    isGold
                      ? "text-yellow-600"
                      : isSilver
                      ? "text-slate-500"
                      : "text-orange-600"
                  }`}
                >
                  emoji_events
                </span>
              ) : (
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {position}
                </span>
              )}
            </div>
            {renderAvatar(row)}
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {row.name}
              </p>
              {row.elo != null && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elo {row.elo}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{row.points}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pts</p>
            </div>
          </div>
          <div className="flex items-center justify-around pt-2 border-t border-slate-200 dark:border-slate-600">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {row.wins + row.losses}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Played</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {row.wins}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {row.losses}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Losses</p>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${
                row.scoreDifference > 0 
                  ? "text-green-600 dark:text-green-400" 
                  : row.scoreDifference < 0 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-slate-600 dark:text-slate-400"
              }`}>
                {row.scoreDifference > 0 ? "+" : ""}{row.scoreDifference}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">+/-</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="flex-1 text-center mr-8">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Bảng Xếp Hạng
              </h1>
            </div>
            <div className="w-8" />
          </div>
        </div>
      </div>

      {/* Table header - Hidden on mobile */}
      <div className="max-w-4xl mx-auto px-4 pt-4 hidden md:block">
        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3">
          <div className="w-8 text-center">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">#</span>
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Participant
            </span>
          </div>
          <div className="text-center min-w-[3rem]">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">P</span>
          </div>
          <div className="text-center min-w-[3rem]">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">W</span>
          </div>
          <div className="text-center min-w-[3rem]">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">L</span>
          </div>
          <div className="text-center min-w-[3rem]">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">+/-</span>
          </div>
          <div className="text-right min-w-[4rem]">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pts</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-slate-500 dark:text-slate-400">Đang tải standings...</div>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              Không tải được standings. Vui lòng thử lại.
            </p>
          </div>
        ) : !standings || standings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              Chưa có standings cho giải này.
            </p>
          </div>
        ) : (
          standings.map(renderRow)
        )}
      </div>
    </div>
  );
}
