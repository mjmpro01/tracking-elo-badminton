"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../lib/supabaseClient";
import { fetchPlayerById, updatePlayer } from "../../../../lib/api/players";

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const playerId = params.id as string;

  const {
    data: playerData,
    isLoading: isLoadingPlayer,
    error: playerError,
  } = useQuery({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayerById(playerId),
    enabled: !!playerId,
  });

  const [fullName, setFullName] = useState("");
  const [isMember, setIsMember] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerData) {
      setFullName(playerData.full_name || "");
      setCurrentAvatarUrl(playerData.avatar_url);
      setIsMember(playerData.is_member ?? true);
      if (playerData.avatar_url) {
        setAvatarPreview(playerData.avatar_url);
      }
    }
  }, [playerData]);

  const canSubmit = fullName.trim().length > 0 && !loading;

  const handlePickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Vui lòng nhập tên player");
      return;
    }

    if (!playerId) {
      setError("Không tìm thấy player ID");
      return;
    }

    setLoading(true);

    try {
      let uploadedAvatarUrl: string | null = currentAvatarUrl;

      // Upload avatar if there's a new file
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split(".").pop() || "jpg";
          const filePath = `players/${Date.now()}.${fileExt}`;

          const { data: storageData, error: storageError } = await supabase.storage
            .from("player-avatars")
            .upload(filePath, avatarFile, {
              contentType: avatarFile.type,
            });

          if (storageError) {
            console.error("upload avatar error", storageError);
          } else if (storageData?.path) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (supabaseUrl) {
              uploadedAvatarUrl = `${supabaseUrl}/storage/v1/object/public/player-avatars/${storageData.path}`;
            }
          }
        } catch (err) {
          console.error("upload avatar exception", err);
        }
      }

      // Update player
      const updatedPlayer = await updatePlayer(playerId, {
        full_name: fullName.trim(),
        is_member: isMember,
        avatar_url: uploadedAvatarUrl,
      });

      // Update cache
      queryClient.setQueryData(["player", playerId], {
        player_id: updatedPlayer.id,
        full_name: updatedPlayer.full_name,
        avatar_url: updatedPlayer.avatar_url,
        rating: playerData?.rating ?? 1000,
        is_member: updatedPlayer.is_member ?? true,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["players-with-stats"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["players"], exact: false });

      router.back();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật player");
      setLoading(false);
    }
  };

  if (isLoadingPlayer) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Đang tải thông tin player...</div>
      </div>
    );
  }

  if (playerError || !playerData) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          {playerError ? `Lỗi: ${(playerError as Error).message}` : "Không tìm thấy player"}
        </div>
      </div>
    );
  }

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
              Chỉnh Sửa Hồ Sơ Người Chơi
            </h1>
            <div className="w-8" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6 mb-6">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handlePickAvatar}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer relative"
            >
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-5xl">
                    person
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-base">
                  photo_camera
                </span>
              </div>
            </label>
          </div>
          <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
            Upload Photo
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            PNG or JPG up to 5MB
          </p>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
            Thông Tin Cá Nhân
          </h3>

          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Họ và Tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
          </div>

          {/* ELO Display (Read-only) */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              ELO Hiện Tại
            </label>
            <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {Math.round(playerData.rating ?? 1000)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ELO chỉ được cập nhật thông qua kết quả giải đấu
              </p>
            </div>
          </div>
        </div>

        {/* Active Member Toggle */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-3 mb-6 flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Thành Viên Hoạt Động
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Có sẵn cho lời mời giải đấu
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isMember}
              onChange={(e) => setIsMember(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:bg-primary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-primary text-white rounded-full px-4 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
