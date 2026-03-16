"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateMatchScore, fetchMatchesByTournament, MatchDisplay } from "../../../../../../../lib/api/matches";

export default function EditMatchScorePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tournamentId = params.id as string;
  const matchId = params.matchId as string;

  const { data: matches } = useQuery<MatchDisplay[]>({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: () => fetchMatchesByTournament(tournamentId),
    enabled: !!tournamentId,
  });

  const match = matches?.find((m) => m.id === matchId);

  const initialScoreA = match?.scoreA && match.scoreA.length > 0 ? match.scoreA.join(",") : "";
  const initialScoreB = match?.scoreB && match.scoreB.length > 0 ? match.scoreB.join(",") : "";

  const [scoreA, setScoreA] = useState(initialScoreA);
  const [scoreB, setScoreB] = useState(initialScoreB);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (match) {
      setScoreA(match.scoreA && match.scoreA.length > 0 ? match.scoreA.join(",") : "");
      setScoreB(match.scoreB && match.scoreB.length > 0 ? match.scoreB.join(",") : "");
    }
  }, [match]);

  const entryAName = match?.entryAName ?? "Player A";
  const entryBName = match?.entryBName ?? "Player B";

  const parseScores = (value: string): number[] => {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n));
  };

  const handleSave = async () => {
    if (submitting) return;
    const sA = parseScores(scoreA);
    const sB = parseScores(scoreB);
    if (sA.length === 0 || sB.length === 0 || sA.length !== sB.length) {
      alert(
        "Dữ liệu chưa hợp lệ. Nhập điểm dạng ví dụ: 21,18,15 cho cả hai bên và số set phải bằng nhau.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await updateMatchScore({
        matchId,
        scoreA: sA,
        scoreB: sB,
      });
      queryClient.invalidateQueries({
        queryKey: ["tournament-matches", tournamentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["latestTournament"],
      });
      router.push(`/admin/tournaments/${tournamentId}`);
    } catch (e: any) {
      console.error("updateMatchScore error", e);
      alert(e?.message ?? "Không thể lưu kết quả. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Nhập Điểm
            </h1>
            <div className="w-8" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Trận Đấu
          </label>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {entryAName} <span className="text-slate-500 dark:text-slate-400 font-normal">vs</span> {entryBName}
          </h2>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 block">
            Điểm (phân cách bằng dấu phẩy)
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Ví dụ: 21,18 hoặc 21,18,15 – mỗi số là điểm của một set.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 block">
                {entryAName}
              </label>
              <input
                type="text"
                placeholder="21,18,15"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 block">
                {entryBName}
              </label>
              <input
                type="text"
                placeholder="18,21,12"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleSave}
            disabled={submitting}
            className="w-full bg-primary text-white rounded-full px-4 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang lưu..." : "Lưu Kết Quả"}
          </button>
        </div>
      </div>
    </div>
  );
}
