"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTournamentStandings, saveFinalStandings, StandingRow } from "../../../../../lib/api/standings";
import { supabase } from "../../../../../lib/supabaseClient";

export default function FinalizeRankingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tournamentId = params.id as string;

  const { data: tournament } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("name, status")
        .eq("id", tournamentId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });

  const { data, isLoading, isError } = useQuery<StandingRow[]>({
    queryKey: ["tournament-standings-live", tournamentId],
    queryFn: () => fetchTournamentStandings(tournamentId),
    enabled: !!tournamentId,
  });

  const [rows, setRows] = useState<StandingRow[]>(() => data ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isReadOnly = tournament?.status === "finished";

  useEffect(() => {
    if (data) {
      setRows(data);
    }
  }, [data]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  const moveRow = (index: number, direction: -1 | 1) => {
    if (isReadOnly) return;
    setRows((prev) => {
      const next = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = tmp;
      return next.map((r, i) => ({ ...r, position: i + 1 }));
    });
  };

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
    const position = index + 1;
    const isDimmed = position > 4;
    const isGold = position === 1;
    const isSilver = position === 2;
    const isBronze = position === 3;

    const cardClass = isGold
      ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700"
      : isSilver
      ? "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-300 dark:border-slate-600"
      : isBronze
      ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700"
      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600";

    return (
      <div
        key={row.entryId}
        className={`rounded-2xl border p-4 ${cardClass} ${isDimmed ? "opacity-80" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 text-center">
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
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record: <span className="font-semibold">{row.wins}-{row.losses}</span>
              </p>
            </div>
          </div>
          <div className="text-right mr-4">
            <div className="mb-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">+/-</p>
              <p className={`text-sm font-bold ${
                row.scoreDifference > 0 
                  ? "text-green-600 dark:text-green-400" 
                  : row.scoreDifference < 0 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-slate-600 dark:text-slate-400"
              }`}>
                {row.scoreDifference > 0 ? "+" : ""}{row.scoreDifference}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Points</p>
              <p className="text-lg font-bold text-primary">{row.points}</p>
            </div>
          </div>
          {!isReadOnly && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveRow(index, -1)}
                disabled={index === 0}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  index === 0
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                }`}
              >
                <span className="material-symbols-outlined text-xl">arrow_upward</span>
              </button>
              <button
                onClick={() => moveRow(index, 1)}
                disabled={index === rows.length - 1}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  index === rows.length - 1
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                }`}
              >
                <span className="material-symbols-outlined text-xl">arrow_downward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const performSave = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      const payload = rows.map((r, idx) => ({ ...r, position: idx + 1 }));
      await saveFinalStandings({ tournamentId, rows: payload });
      queryClient.invalidateQueries({
        queryKey: ["tournament-standings-live", tournamentId],
      });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
      router.push(`/admin/tournaments/${tournamentId}`);
    } catch (e: any) {
      console.error("saveFinalStandings error", e);
      alert(e?.message ?? "Không thể lưu Final Rankings. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = () => {
    if (submitting || isReadOnly) return;
    if (!rows.length) {
      alert("Chưa có standings để lưu.");
      return;
    }
    setShowConfirmModal(true);
  };

  const top3 = rows.slice(0, 3);

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
            <div className="flex-1 text-center mr-8">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {tournament?.name || "Tournament"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xác Nhận Xếp Hạng
              </p>
            </div>
            <div className="w-8" />
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg mt-0.5">
              drag_indicator
            </span>
            <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">
              {isReadOnly
                ? "Giải đã kết thúc. Đây là bảng xếp hạng cuối cùng (chỉ xem)."
                : "Dùng nút mũi tên để điều chỉnh lại thứ hạng nếu cần. Thứ tự này sẽ được dùng cho tính Elo cuối giải."}
            </p>
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
        ) : rows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              Chưa có standings cho giải này.
            </p>
          </div>
        ) : (
          rows.map(renderRow)
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {rows.length} entries ranked
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Tự động sắp xếp theo Điểm
            </div>
          </div>
          {!isReadOnly && (
            <button
              onClick={handleConfirm}
              disabled={submitting || rows.length === 0}
              className="w-full bg-primary text-white rounded-full px-4 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="text-sm">Đang lưu...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">lock</span>
                  <span>Xác Nhận Xếp Hạng Cuối</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Xác nhận kết thúc giải
            </h3>
            
            {top3.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Top 3 hiện tại:
                </p>
                <div className="space-y-2">
                  {top3.map((r, idx) => (
                    <div key={r.entryId} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">{idx + 1}.</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {r.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {r.points} pts
                        </span>
                        {r.elo != null && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                            • Elo {r.elo}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Bạn chắc chắn muốn kết thúc giải và xác nhận thứ hạng cuối cùng? Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={performSave}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">lock</span>
                    <span>Xác nhận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
