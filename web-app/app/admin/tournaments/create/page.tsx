"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../lib/supabaseClient";

type PlayerSeed = {
  id: string;
  name: string;
  rating: number | null;
  avatarUrl: string | null;
};

type Team = {
  id: string;
  players: PlayerSeed[];
  combinedElo: number;
};

async function fetchPlayers(search?: string) {
  let query = supabase
    .from("player_current_rating_view")
    .select("player_id, full_name, avatar_url, rating")
    .not("rating", "is", null)
    .order("rating", { ascending: false });

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

const STORAGE_KEY = "create-tournament-state";

type TournamentState = {
  step: number;
  tournamentName: string;
  currentMonth: string;
  selectedDay: number | null;
  selectedK: number;
  coverImageUrl: string;
  coverPreview: string | null;
  search: string;
  selectedPlayerIds: string[];
  mode: "singles" | "doubles";
  singlePlayers: PlayerSeed[];
  teams: Team[];
};

export default function CreateTournamentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  
  // Step 1 data
  const [tournamentName, setTournamentName] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedK, setSelectedK] = useState<number>(60);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Step 2 data
  const [search, setSearch] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [selectionError, setSelectionError] = useState<string | null>(null);
  
  // Step 3 data
  const [mode, setMode] = useState<"singles" | "doubles">("singles");
  const [singlePlayers, setSinglePlayers] = useState<PlayerSeed[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // Save state to sessionStorage
  const saveState = () => {
    try {
      const state: TournamentState = {
        step,
        tournamentName,
        currentMonth: currentMonth.toISOString(),
        selectedDay,
        selectedK,
        coverImageUrl,
        coverPreview,
        search,
        selectedPlayerIds: Array.from(selectedPlayerIds),
        mode,
        singlePlayers,
        teams,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save state", err);
    }
  };

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (isRestored) return;
    
    // Check if we're coming from a successful tournament creation (via URL param)
    const fromSuccess = searchParams.get("new") === "true";
    if (fromSuccess) {
      // Clear old state when starting a new tournament
      sessionStorage.removeItem(STORAGE_KEY);
      setIsRestored(true);
      return;
    }
    
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: TournamentState = JSON.parse(saved);
        setStep(state.step);
        setTournamentName(state.tournamentName);
        setCurrentMonth(new Date(state.currentMonth));
        setSelectedDay(state.selectedDay);
        setSelectedK(state.selectedK);
        setCoverImageUrl(state.coverImageUrl);
        setCoverPreview(state.coverPreview);
        setSearch(state.search);
        setSelectedPlayerIds(new Set(state.selectedPlayerIds));
        setMode(state.mode);
        setSinglePlayers(state.singlePlayers || []);
        setTeams(state.teams || []);
      } catch (err) {
        console.error("Failed to restore state", err);
        // Clear corrupted state
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsRestored(true);
  }, [isRestored, searchParams]);

  // Save state whenever it changes (debounced)
  useEffect(() => {
    if (!isRestored) return;
    const timer = setTimeout(() => {
      saveState();
    }, 300);
    return () => clearTimeout(timer);
  }, [step, tournamentName, currentMonth, selectedDay, selectedK, coverImageUrl, coverPreview, search, selectedPlayerIds, mode, singlePlayers, teams, isRestored]);

  // Check if returning from quick add
  useEffect(() => {
    if (searchParams.get("return") === "tournament-create") {
      // Refresh players list
      queryClient.invalidateQueries({ queryKey: ["players"] });
    }
  }, [searchParams, queryClient]);

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["players", search],
    queryFn: () => fetchPlayers(search),
  });

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array(daysInMonth).fill(0).map((_, i) => i + 1),
  ];
  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const handleCoverUpload = async (file: File) => {
    setCoverFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setCoverUploading(true);
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `tournaments/${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("player-avatars")
        .upload(filePath, file, {
          contentType: file.type,
        });

      if (storageError) {
        console.error("upload tournament cover error", storageError);
        alert("Không thể upload ảnh tournament. Bạn vẫn có thể tiếp tục tạo giải.");
        setCoverImageUrl("");
        setCoverPreview(null);
      } else if (storageData?.path) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/player-avatars/${storageData.path}`;
          setCoverImageUrl(publicUrl);
        }
      }
    } catch (err) {
      console.error("upload tournament cover exception", err);
      alert("Có lỗi khi upload ảnh. Bạn vẫn có thể tiếp tục tạo giải.");
      setCoverImageUrl("");
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleStep1Next = async () => {
    let valid = true;
    if (!tournamentName.trim()) {
      setNameError("Tên giải đấu là bắt buộc");
      valid = false;
    } else {
      setNameError(null);
    }
    if (!selectedDay) {
      setDateError("Vui lòng chọn ngày");
      valid = false;
    } else {
      setDateError(null);
    }
    if (!valid || selectedDay == null) return;
    
    // Upload cover if there's a file but no URL yet
    if (coverFile && !coverImageUrl && !coverUploading) {
      await handleCoverUpload(coverFile);
      // Wait a bit for upload to complete
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    
    setStep(2);
  };

  const handleStep2Next = () => {
    if (selectedPlayerIds.size < 2) {
      setSelectionError("Please select at least 2 players");
      return;
    }
    setSelectionError(null);
    
    // Convert selected players to PlayerSeed format
    const selectedPlayers: PlayerSeed[] = players
      ?.filter((p: any) => selectedPlayerIds.has(p.player_id))
      .map((p: any) => ({
        id: p.player_id,
        name: p.full_name,
        rating: p.rating ?? null,
        avatarUrl: p.avatar_url ?? null,
      })) ?? [];
    
    // Sort by rating for singles
    setSinglePlayers([...selectedPlayers].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
    setStep(3);
  };

  const handleStep3Next = () => {
    if (mode === "singles") {
      if (singlePlayers.length < 2) {
        setError("Cần ít nhất 2 người chơi cho giải đơn");
        return;
      }
      router.push(`/admin/tournaments/create/review?mode=singles&players=${encodeURIComponent(JSON.stringify(singlePlayers))}&kFactor=${selectedK}&name=${encodeURIComponent(tournamentName)}&date=${selectedDay ? new Date(year, month, selectedDay).toISOString() : ""}&cover=${encodeURIComponent(coverImageUrl)}`);
    } else {
      if (teams.length < 1) {
        setError("Cần ít nhất 1 đội cho giải đôi");
        return;
      }
      router.push(`/admin/tournaments/create/review?mode=doubles&teams=${encodeURIComponent(JSON.stringify(teams))}&players=${encodeURIComponent(JSON.stringify(singlePlayers))}&kFactor=${selectedK}&name=${encodeURIComponent(tournamentName)}&date=${selectedDay ? new Date(year, month, selectedDay).toISOString() : ""}&cover=${encodeURIComponent(coverImageUrl)}`);
    }
  };

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!players?.length) return;
    const allSelected = selectedPlayerIds.size === players.length;
    setSelectedPlayerIds(allSelected ? new Set() : new Set(players.map((p: any) => p.player_id)));
  };

  const handleRemovePlayer = (id: string) => {
    setSinglePlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddToTeam = (player: PlayerSeed) => {
    const playersInTeams = new Set(teams.flatMap((t) => t.players.map((p) => p.id)));
    if (playersInTeams.has(player.id)) return;

    setTeams((prev) => {
      const indexWithOne = prev.findIndex((t) => t.players.length === 1);
      if (indexWithOne !== -1) {
        const updated = [...prev];
        const team = updated[indexWithOne];
        const newPlayers = [...team.players, player];
        const combinedElo = newPlayers.reduce((sum, p) => sum + (p.rating ?? 1000), 0);
        updated[indexWithOne] = { ...team, players: newPlayers, combinedElo };
        return updated;
      }
      return [
        ...prev,
        {
          id: `${player.id}-${Date.now()}`,
          players: [player],
          combinedElo: player.rating ?? 1000,
        },
      ];
    });
  };

  const handleAutoGenerateTeams = () => {
    const pool = [...singlePlayers].sort((a, b) => (b.rating ?? 1000) - (a.rating ?? 1000));
    const newTeams: Team[] = [];
    while (pool.length >= 2) {
      const high = pool.shift() as PlayerSeed;
      const low = pool.pop() as PlayerSeed;
      newTeams.push({
        id: `${high.id}-${low.id}`,
        players: [high, low],
        combinedElo: (high.rating ?? 1000) + (low.rating ?? 1000),
      });
    }
    setTeams(newTeams);
  };

  const handleRemovePlayerFromTeam = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.flatMap((team) => {
        if (team.id !== teamId) return [team];
        const remainingPlayers = team.players.filter((p) => p.id !== playerId);
        if (remainingPlayers.length === 0) return [];
        const combinedElo = remainingPlayers.reduce((sum, p) => sum + (p.rating ?? 1000), 0);
        return [{ ...team, players: remainingPlayers, combinedElo }];
      })
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase();
  };

  const getShortName = (player: PlayerSeed) => {
    const parts = player.name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const playersInTeams = new Set(teams.flatMap((t) => t.players.map((p) => p.id)));
  const doublesPool = singlePlayers.filter((p) => !playersInTeams.has(p.id));
  const sortedPlayersForDoubles = [...doublesPool].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-slate-900 pb-24">
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
              {step === 1 ? "Tạo Giải Đấu" : step === 2 ? "Chọn Người Chơi" : step === 3 ? (mode === "singles" ? "Thiết Lập Đơn" : "Thiết Lập Đôi") : "Xem Lại"}
            </h1>
            <div className="w-8" />
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-6">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Tournament Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Chi Tiết Giải Đấu
              </h2>
            </div>

            {/* Tournament Name */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Tên Giải Đấu
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => {
                    setTournamentName(e.target.value);
                    if (nameError && e.target.value.trim()) setNameError(null);
                  }}
                  placeholder="e.g. Summer Open 2023"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  edit
                </span>
              </div>
              {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
            </div>

            {/* Tournament Cover */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Ảnh Bìa Giải Đấu
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleCoverUpload(file);
                    }
                  }}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="block w-full h-40 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer overflow-hidden"
                >
                  {coverPreview || coverImageUrl ? (
                    <img
                      src={coverPreview || coverImageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-slate-400 text-4xl">photo</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Nhấn để tải ảnh bìa giải đấu
                      </span>
                    </>
                  )}
                </label>
                {coverUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                    <div className="text-white text-sm">Đang upload ảnh...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Date - Calendar */}
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Ngày
              </label>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  >
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-xl">
                      chevron_left
                    </span>
                  </button>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {monthLabel}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  >
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-xl">
                      chevron_right
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) =>
                    day == null ? (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ) : (
                      <button
                        key={`day-${index}`}
                        onClick={() => setSelectedDay(day)}
                        className="aspect-square flex items-center justify-center"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                            selectedDay === day
                              ? "bg-primary text-white font-semibold"
                              : "text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          {day}
                        </div>
                      </button>
                    )
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Selected date:{" "}
                  {selectedDay
                    ? `${selectedDay}/${month + 1}/${year}`
                    : "Chưa chọn ngày."}
                </p>
                {dateError && <p className="mt-1 text-xs text-red-600">{dateError}</p>}
              </div>
            </div>

            {/* K-Factor Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                  Độ Nhạy K-Factor
                </label>
                <button className="text-xs text-primary font-medium">What is this?</button>
              </div>
              <div className="flex gap-3">
                {[40, 60, 80].map((k, index) => (
                  <button
                    key={k}
                    onClick={() => setSelectedK(k)}
                    className={`flex-1 rounded-2xl border p-3 text-center transition-colors ${
                      selectedK === k
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {index === 0 ? "Friendly" : index === 1 ? "Monthly" : "Major"}
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{k}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Chọn Người Chơi */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Search bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center px-3 h-11">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 mr-1 text-xl">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm người chơi theo tên..."
                className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-base"
              />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Người Chơi Có Sẵn
              </h2>
              <button
                onClick={handleSelectAll}
                className="text-sm font-semibold text-primary"
              >
                Chọn Tất Cả
              </button>
            </div>

            {/* Player items */}
            <div className="space-y-3">
              {playersLoading ? (
                <div className="text-center py-8 text-slate-500">Đang tải danh sách players...</div>
              ) : !players || players.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Không tìm thấy player nào.</div>
              ) : (
                players.map((player: any) => {
                  const selected = selectedPlayerIds.has(player.player_id);
                  const initials = getInitials(player.full_name);
                  return (
                    <button
                      key={player.player_id}
                      onClick={() => togglePlayer(player.player_id)}
                      className={`w-full flex items-center p-3 rounded-2xl border transition-colors ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 flex-shrink-0">
                        {player.avatar_url ? (
                          <img
                            src={player.avatar_url}
                            alt={player.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {initials}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {player.full_name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {player.rating != null ? `ELO: ${Math.round(player.rating)}` : "ELO: 1000"}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selected
                            ? "bg-primary border-primary"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {selected && (
                          <span className="material-symbols-outlined text-white text-base">
                            check
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectionError && (
              <p className="text-center text-xs text-red-600">{selectionError}</p>
            )}

            {/* Quick Add banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xl">person_add</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Không tìm thấy người chơi?
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thêm họ nhanh vào danh sách giải đấu.
                </p>
              </div>
              <button
                onClick={() => {
                  saveState();
                  router.push("/admin/players/add?return=tournament-create");
                }}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-primary"
              >
                Thêm Nhanh
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Thiết Lập Đơn/Đôi */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Tournament type toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                Loại Giải Đấu
              </label>
              <div className="flex bg-slate-200 dark:bg-slate-700 rounded-2xl p-1">
                <button
                  onClick={() => setMode("singles")}
                  className={`flex-1 h-8.5 rounded-xl flex items-center justify-center transition-all ${
                    mode === "singles"
                      ? "bg-white dark:bg-slate-800 shadow-sm"
                      : ""
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      mode === "singles" ? "text-primary" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Đơn
                  </span>
                </button>
                <button
                  onClick={() => setMode("doubles")}
                  className={`flex-1 h-8.5 rounded-xl flex items-center justify-center transition-all ${
                    mode === "doubles"
                      ? "bg-white dark:bg-slate-800 shadow-sm"
                      : ""
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      mode === "doubles" ? "text-primary" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Đôi
                  </span>
                </button>
              </div>
            </div>

            {mode === "singles" ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Player Seeding
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Review individual player seeds for this singles event.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {singlePlayers.map((player, index) => {
                    const initials = getInitials(player.name);
                    return (
                      <div
                        key={player.id}
                        className="flex items-center p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                      >
                        <span className="w-7 text-center text-sm font-bold text-primary mr-2">
                          #{index + 1}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center mr-2.5">
                          {player.avatarUrl ? (
                            <img
                              src={player.avatarUrl}
                              alt={player.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {initials}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {player.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Elo {player.rating ?? 1000}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-xl">
                            drag_indicator
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Participant Setup
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Confirm player entries or configure doubles pairings for the event.
                  </p>
                </div>

                <button
                  onClick={handleAutoGenerateTeams}
                  className="w-full bg-primary text-white rounded-xl px-4 py-3 font-semibold hover:bg-primary/90 transition-colors"
                >
                  Tự Động Tạo Đội Cân Bằng
                </button>
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Uses combined Elo ratings to create fair matchups
                </p>

                {teams.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Teams Created ({teams.length})
                      </h3>
                      <span className="text-sm font-semibold text-primary">Tap + to add players</span>
                    </div>
                    <div className="space-y-3">
                      {teams.map((team) => {
                        const [p1, p2] = team.players;
                        const label =
                          team.players.length === 2
                            ? `${getShortName(p1)} x ${getShortName(p2)}`
                            : getShortName(p1);
                        return (
                          <div
                            key={team.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase">
                                {label}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Combined Elo:{" "}
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {team.combinedElo}
                                </span>
                              </span>
                            </div>
                            {team.players.map((p) => {
                              const initials = getInitials(p.name);
                              return (
                                <div key={p.id} className="flex items-center gap-2 mb-1.5">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    {p.avatarUrl ? (
                                      <img
                                        src={p.avatarUrl}
                                        alt={p.name}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {initials}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                      {p.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Elo {p.rating ?? 1000}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePlayerFromTeam(team.id, p.id)}
                                    className="p-1"
                                  >
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">
                                      close
                                    </span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Người Chơi Chưa Phân Đội ({sortedPlayersForDoubles.length})
                  </h3>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-2">
                    {sortedPlayersForDoubles.map((player) => {
                      const initials = getInitials(player.name);
                      return (
                        <div key={player.id} className="flex items-center py-1.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {initials}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {player.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Elo {player.rating ?? 1000}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToTeam(player)}
                            className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 text-lg">
                              add
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer actions - Match mobile design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-slate-500 text-white rounded-full px-4 py-3 font-semibold hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={coverUploading}
            >
              Quay Lại
            </button>
          ) : (
            <div className="flex-1" />
          )}
          <button
            onClick={async () => {
              if (step === 1) await handleStep1Next();
              else if (step === 2) handleStep2Next();
              else if (step === 3) handleStep3Next();
            }}
            disabled={coverUploading}
            className="flex-1 bg-primary text-white rounded-full px-4 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {coverUploading ? "Đang tải lên..." : step === 3 ? "Tiếp Tục" : "Bước Tiếp"}
          </button>
        </div>
      </div>
    </div>
  );
}
