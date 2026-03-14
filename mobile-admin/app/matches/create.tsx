import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { colors } from "../../theme/colors";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import { createMatch } from "../../lib/api/matches";

type RouteParams = {
  tournamentId: string;
  format: string;
};

export default function CreateMatchScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tournamentId, format } = route.params as RouteParams;
  const isDoubles = format === "doubles";
  const queryClient = useQueryClient();

  type Option = { id: string; name: string; rating: number | null };

  const [options, setOptions] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [homeId, setHomeId] = useState<string | null>(null);
  const [awayId, setAwayId] = useState<string | null>(null);
  const [homeOpen, setHomeOpen] = useState(false);
  const [awayOpen, setAwayOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Loại trừ lựa chọn phía bên kia khỏi dropdown
  const homeOptions = options;
  const awayOptions = awayOpen
    ? options.filter((opt) => opt.id !== homeId)
    : options;

  React.useEffect(() => {
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
                id: entry.id as string, // entry_id dùng cho matches.entry_a_id/b_id
                name: (player?.full_name as string) ?? "Unknown player",
                rating:
                  (player?.rating as number | null | undefined) ?? null,
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

          // Lấy Elo trung bình team từ rating players trong team_players
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
              const team = (teams ?? []).find(
                (t: any) => t.id === entry.team_id,
              );
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
                id: entry.id as string, // entry_id cho matches
                name: (team?.name as string) ?? "Unnamed Team",
                rating: avg,
              };
            }) ?? [];

          setOptions(mapped);
        }
      } catch (e: any) {
        console.error("load match options error", e);
        setOptionsError(
          e?.message ?? "Không tải được danh sách players/teams.",
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isDoubles, tournamentId]);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={colors.textMainLight}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Create Match</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>Match Details</Text>
          <Text style={styles.subtitle}>
            Configure the players for the match.
          </Text>
        </View>

        {/* Type badge theo format tournament */}
        <View style={styles.typePillWrapper}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>
              {isDoubles ? "Doubles Match" : "Singles Match"}
            </Text>
          </View>
        </View>

        {/* Home side */}
        <View style={styles.sideSection}>
          <View style={styles.sideHeaderRow}>
            <Text style={styles.sideLabel}>
              {isDoubles ? "Home Team 1" : "Home Player / Team 1"}
            </Text>
            <Text style={styles.manageRosterText}>Manage Roster</Text>
          </View>
          {/* Dropdown input */}
          <Pressable
            style={styles.dropdownInput}
            onPress={() => {
              if (loadingOptions) return;
              setHomeOpen((prev) => !prev);
              setAwayOpen(false);
            }}
          >
            <Text
              style={
                homeId ? styles.dropdownValueText : styles.dropdownPlaceholder
              }
            >
              {homeId
                ? options.find((o) => o.id === homeId)?.name
                : isDoubles
                  ? "Select team 1"
                  : "Select player 1"}
            </Text>
            <MaterialIcons
              name={homeOpen ? "expand-less" : "expand-more"}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
          {homeOpen && !loadingOptions && homeOptions.length > 0 && (
            <View style={styles.selectCard}>
              {homeOptions.map((opt) => {
                const selected = homeId === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.optionRow,
                      selected && styles.optionRowSelected,
                    ]}
                    onPress={() => {
                      setHomeId(opt.id);
                      if (awayId === opt.id) {
                        setAwayId(null);
                      }
                      setHomeOpen(false);
                    }}
                  >
                    <View style={styles.optionLeft}>
                      <View style={styles.optionAvatar} />
                      <View>
                        <Text
                          style={
                            selected
                              ? styles.optionNameSelected
                              : styles.optionName
                          }
                        >
                          {opt.name}
                        </Text>
                        <Text style={styles.optionMeta}>
                          Elo {opt.rating ?? 1000}
                        </Text>
                      </View>
                    </View>
                    {selected && (
                      <MaterialIcons
                        name="check-circle"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
          {homeOpen && loadingOptions && (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          {homeOpen && !loadingOptions && options.length === 0 && (
            <View style={styles.loadingWrapper}>
              <Text style={styles.emptyText}>
                Không có {isDoubles ? "team" : "player"} nào trong tournament.
              </Text>
            </View>
          )}
        </View>

        {/* VS badge */}
        <View style={styles.vsWrapper}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Away side */}
        <View style={styles.sideSection}>
          <View style={styles.sideHeaderRow}>
            <Text style={styles.sideLabel}>
              {isDoubles ? "Away Team 2" : "Away Player / Team 2"}
            </Text>
          </View>
          <Pressable
            style={styles.dropdownInput}
            onPress={() => {
              if (loadingOptions) return;
              setAwayOpen((prev) => !prev);
              setHomeOpen(false);
            }}
          >
            <Text
              style={
                awayId ? styles.dropdownValueText : styles.dropdownPlaceholder
              }
            >
              {awayId
                ? options.find((o) => o.id === awayId)?.name
                : isDoubles
                  ? "Select team 2"
                  : "Select player 2"}
            </Text>
            <MaterialIcons
              name={awayOpen ? "expand-less" : "expand-more"}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
          {awayOpen && !loadingOptions && awayOptions.length > 0 && (
            <View style={styles.selectCard}>
              {awayOptions.map((opt) => {
                const selected = awayId === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.optionRow,
                      selected && styles.optionRowSelected,
                    ]}
                    onPress={() => {
                      setAwayId(opt.id);
                      setAwayOpen(false);
                    }}
                  >
                    <View style={styles.optionLeft}>
                      <View style={styles.optionAvatar} />
                      <View>
                        <Text
                          style={
                            selected
                              ? styles.optionNameSelected
                              : styles.optionName
                          }
                        >
                          {opt.name}
                        </Text>
                        <Text style={styles.optionMeta}>
                          Elo {opt.rating ?? 1000}
                        </Text>
                      </View>
                    </View>
                    {selected && (
                      <MaterialIcons
                        name="check-circle"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
          {awayOpen && loadingOptions && (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          {awayOpen && !loadingOptions && options.length === 0 && (
            <View style={styles.loadingWrapper}>
              <Text style={styles.emptyText}>
                Không có {isDoubles ? "team" : "player"} nào trong tournament.
              </Text>
            </View>
          )}
        </View>

        {/* Match notes placeholder */}
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Match Notes (coming soon) – ghi chú cho trọng tài, sân, v.v.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Create Match"
          loading={submitting}
          onPress={async () => {
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
              // refresh danh sách matches của tournament khi quay lại
              queryClient.invalidateQueries({
                queryKey: ["tournament-matches", tournamentId],
              });
              navigation.goBack();
            } catch (e: any) {
              console.error("create match error", e);
              alert(e?.message ?? "Không thể tạo match. Vui lòng thử lại.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  section: {
    marginTop: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textMainLight,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  typePillWrapper: {
    marginBottom: 12,
    flexDirection: "row",
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  typePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  sideSection: {
    marginBottom: 16,
  },
  sideHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sideLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  manageRosterText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.primary,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownValueText: {
    fontSize: 14,
    color: colors.textMainLight,
    fontWeight: "600",
  },
  selectCard: {
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  optionRowSelected: {
    backgroundColor: "#e0ecff",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  optionName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  optionNameSelected: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  optionMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  loadingWrapper: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  vsWrapper: {
    alignItems: "center",
    marginVertical: 4,
  },
  vsText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  placeholderCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
});

