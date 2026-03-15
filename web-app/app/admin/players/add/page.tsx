"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../lib/supabaseClient";

export default function AddPlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const returnTo = searchParams.get("return");
  const [fullName, setFullName] = useState("");
  const [initialElo, setInitialElo] = useState("");
  const [isMember, setIsMember] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setLoading(true);

    try {
      let uploadedAvatarUrl: string | null = null;

      // Upload avatar if there's a file
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

      // Create player
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          full_name: fullName.trim(),
          is_member: isMember,
          avatar_url: uploadedAvatarUrl,
        })
        .select("*")
        .single();

      if (playerError) throw playerError;

      // Set initial rating if provided
      if (initialElo.trim()) {
        const rating = Number(initialElo.trim());
        if (!Number.isNaN(rating) && rating > 0) {
          const { error: ratingError } = await supabase.rpc("set_initial_rating", {
            p_player_id: player.id,
            p_rating: rating,
          });
          if (ratingError) {
            console.error("set_initial_rating error", ratingError);
          }
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["players-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });

      if (returnTo === "tournament-create") {
        router.push("/admin/tournaments/create");
      } else {
        router.back();
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tạo player");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (returnTo === "tournament-create") {
                  router.push("/admin/tournaments/create");
                } else {
                  router.back();
                }
              }}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 text-xl">
                arrow_back
              </span>
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Create Player Profile
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
            Personal Information
          </h3>

          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Initial ELO
            </label>
            <input
              type="number"
              value={initialElo}
              onChange={(e) => setInitialElo(e.target.value)}
              placeholder="1200"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
          </div>
        </div>

        {/* Active Member Toggle */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-3 mb-6 flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Active Member
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Available for tournament invitations
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
            {loading ? "Creating..." : "Create Player Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
