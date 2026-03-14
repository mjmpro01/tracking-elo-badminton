import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

import { colors } from "../../../theme/colors";
import { Button } from "../../../components/ui/Button";
import { useState } from "react";

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

export default function CreateTournamentStep3SinglesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const playersFromStep2: PlayerSeed[] = route.params?.players ?? [];
  const kFactor: number = route.params?.kFactor ?? 60;
  const tournamentName: string | undefined = route.params?.tournamentName;
  const startDate: string | undefined = route.params?.startDate;
  const coverImageUrl: string | undefined = route.params?.coverImageUrl;

  const [mode, setMode] = useState<"singles" | "doubles">("singles");

  const [singlePlayers, setSinglePlayers] = useState<PlayerSeed[]>(
    [...playersFromStep2].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    ),
  );

  const [teams, setTeams] = useState<Team[]>([]);

  const seededPlayers = singlePlayers;

  const handleRemovePlayer = (id: string) => {
    setSinglePlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemovePlayerFromTeam = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.flatMap((team) => {
        if (team.id !== teamId) return [team];

        const remainingPlayers = team.players.filter((p) => p.id !== playerId);
        if (remainingPlayers.length === 0) {
          // Xoá luôn team nếu không còn ai
          return [];
        }

        const combinedElo = remainingPlayers.reduce(
          (sum, p) => sum + (p.rating ?? 1000),
          0,
        );

        return [
          {
            ...team,
            players: remainingPlayers,
            combinedElo,
          },
        ];
      }),
    );
  };

  const goToReview = () => {
    if (mode === "singles") {
      navigation.navigate("TournamentReviewSingles", {
        players: seededPlayers,
        kFactor,
        tournamentName,
        startDate,
        coverImageUrl,
      });
    } else {
      navigation.navigate("TournamentReviewDoubles", {
        teams,
        players: singlePlayers,
        kFactor,
        tournamentName,
        startDate,
        coverImageUrl,
      });
    }
  };

  // Pool dùng cho mode Doubles cũng lấy từ state hiện tại,
  // nên khi xoá player ở Singles thì Doubles không còn thấy player đó nữa.
  const playersInTeams = new Set(
    teams.flatMap((t) => t.players.map((p) => p.id)),
  );
  const doublesPool = singlePlayers.filter(
    (p) => !playersInTeams.has(p.id),
  );

  const sortedPlayersForDoubles = [...doublesPool].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  );

  const getShortName = (player?: PlayerSeed) => {
    if (!player) return "";
    const parts = player.name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${first} ${lastInitial}.`;
  };

  const handleAddToTeam = (player: PlayerSeed) => {
    // Bỏ qua nếu player đã nằm trong team
    if (playersInTeams.has(player.id)) return;

    setTeams((prev) => {
      // Tìm team đang có 1 người để ghép thêm player này vào
      const indexWithOne = prev.findIndex((t) => t.players.length === 1);
      if (indexWithOne !== -1) {
        const updated = [...prev];
        const team = updated[indexWithOne];
        const newPlayers = [...team.players, player];
        const combinedElo = newPlayers.reduce(
          (sum, p) => sum + (p.rating ?? 1000),
          0,
        );
        updated[indexWithOne] = {
          ...team,
          players: newPlayers,
          combinedElo,
        };
        return updated;
      }

      // Nếu chưa có team "dang dở" nào, tạo team mới với 1 player
      const combinedElo = player.rating ?? 1000;
      return [
        ...prev,
        {
          id: `${player.id}-${Date.now()}`,
          players: [player],
          combinedElo,
        },
      ];
    });
  };

  const handleAutoGenerateTeams = () => {
    const pool = [...singlePlayers].sort(
      (a, b) => (b.rating ?? 1000) - (a.rating ?? 1000),
    );

    const newTeams: Team[] = [];

    while (pool.length >= 2) {
      const high = pool.shift() as PlayerSeed;
      const low = pool.pop() as PlayerSeed;
      const combinedElo = (high.rating ?? 1000) + (low.rating ?? 1000);
      newTeams.push({
        id: `${high.id}-${low.id}`,
        players: [high, low],
        combinedElo,
      });
    }

    setTeams(newTeams);
  };

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
        <Text style={styles.headerTitle}>Singles Setup</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepperRow}>
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={styles.stepBar} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Tournament type toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tournament Type</Text>
            <View style={styles.typeToggle}>
              <Pressable
                style={[
                  styles.typePill,
                  mode === "singles" && styles.typePillActive,
                ]}
                onPress={() => setMode("singles")}
              >
                <Text
                  style={[
                    styles.typePillText,
                    mode === "singles" && styles.typePillTextActive,
                  ]}
                >
                  Singles
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typePill,
                  mode === "doubles" && styles.typePillActive,
                ]}
                onPress={() => setMode("doubles")}
              >
                <Text
                  style={[
                    styles.typePillText,
                    mode === "doubles" && styles.typePillTextActive,
                  ]}
                >
                  Doubles
                </Text>
              </Pressable>
            </View>
          </View>

          {mode === "singles" ? (
            <>
              {/* Title + description */}
              <View style={styles.section}>
                <Text style={styles.title}>Player Seeding</Text>
                <Text style={styles.subtitle}>
                  Review individual player seeds for this singles event.
                </Text>
              </View>

              {/* Seeded players từ Step 2 với swipe-to-delete */}
              <View style={styles.seedingList}>
                {seededPlayers.map((player, index) => {
                  const initials = player.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <Swipeable
                      key={player.id}
                      renderRightActions={() => (
                        <Pressable
                          style={styles.deleteAction}
                          onPress={() => handleRemovePlayer(player.id)}
                        >
                          <MaterialIcons
                            name="delete"
                            size={20}
                            color="#ffffff"
                          />
                        </Pressable>
                      )}
                    >
                      <View style={styles.seedingItem}>
                        <Text style={styles.seedBadge}>#{index + 1}</Text>
                        <View style={styles.avatar}>
                          {player.avatarUrl ? (
                            <Image
                              source={{ uri: player.avatarUrl }}
                              style={styles.avatarImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.avatarText}>{initials}</Text>
                          )}
                        </View>
                        <View style={styles.playerInfo}>
                          <Text style={styles.playerName}>{player.name}</Text>
                          <Text style={styles.playerRating}>
                            Elo {player.rating ?? 1000}
                          </Text>
                        </View>
                        <MaterialIcons
                          name="drag-indicator"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </View>
                    </Swipeable>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              {/* Doubles description */}
              <View style={styles.section}>
                <Text style={styles.title}>Participant Setup</Text>
                <Text style={styles.subtitle}>
                  Confirm player entries or configure doubles pairings for the
                  event.
                </Text>
              </View>

              {/* Auto-generate balanced teams */}
              <View style={styles.section}>
                <Button
                  title="Auto-generate Balanced Teams"
                  onPress={handleAutoGenerateTeams}
                />
                <Text style={styles.helperText}>
                  Uses combined Elo ratings to create fair matchups
                </Text>
              </View>

              {/* Teams list */}
              {teams.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.teamsHeaderRow}>
                    <Text style={styles.teamsTitle}>
                      Teams Created ({teams.length})
                    </Text>
                    <Text style={styles.addManuallyText}>Tap + to add players</Text>
                  </View>
                  {teams.map((team) => {
                    const [p1, p2] = team.players;
                    const label =
                      team.players.length === 2
                        ? `${getShortName(p1)} x ${getShortName(p2)}`
                        : getShortName(p1);

                    return (
                    <View key={team.id} style={styles.teamCard}>
                      <View style={styles.teamCardHeader}>
                        <Text style={styles.teamSeedBadge}>
                          {label}
                        </Text>
                        <Text style={styles.combinedEloLabel}>
                          Combined Elo:{" "}
                          <Text style={styles.combinedEloValue}>
                            {team.combinedElo}
                          </Text>
                        </Text>
                      </View>
                      {team.players.map((p) => {
                        const initials = p.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((x) => x[0])
                          .join("")
                          .toUpperCase();

                        return (
                          <View key={p.id} style={styles.teamPlayerRow}>
                            <View style={styles.teamAvatar}>
                              {p.avatarUrl ? (
                                <Image
                                  source={{ uri: p.avatarUrl }}
                                  style={styles.teamAvatarImage}
                                  resizeMode="cover"
                                />
                              ) : (
                                <Text style={styles.teamAvatarText}>
                                  {initials}
                                </Text>
                              )}
                            </View>
                            <View style={styles.teamPlayerInfo}>
                              <Text style={styles.teamPlayerName}>{p.name}</Text>
                              <Text style={styles.teamPlayerRating}>
                                Elo {p.rating ?? 1000}
                              </Text>
                            </View>
                            <Pressable
                              style={styles.teamRemoveButton}
                              onPress={() =>
                                handleRemovePlayerFromTeam(team.id, p.id)
                              }
                            >
                              <MaterialIcons
                                name="close"
                                size={16}
                                color={colors.textSecondary}
                              />
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                    );
                  })}
                </View>
              )}

              {/* Unassigned players list dùng chung data Step 2 */}
              <View style={styles.section}>
                <Text style={styles.unassignedTitle}>
                  Unassigned Players ({sortedPlayersForDoubles.length})
                </Text>
                <View style={styles.unassignedCard}>
                  {sortedPlayersForDoubles.map((player) => {
                    const initials = player.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase();

                    return (
                      <View key={player.id} style={styles.unassignedRow}>
                        <View
                          style={[
                            styles.unassignedAvatar,
                            styles.unassignedAvatarPurple,
                          ]}
                        >
                          <Text style={styles.unassignedAvatarText}>
                            {initials}
                          </Text>
                        </View>
                        <View style={styles.unassignedInfo}>
                          <Text style={styles.unassignedName}>
                            {player.name}
                          </Text>
                          <Text style={styles.unassignedRating}>
                            Elo {player.rating ?? 1000}
                          </Text>
                        </View>
                        <Pressable
                          style={styles.unassignedAddButton}
                          onPress={() => handleAddToTeam(player)}
                        >
                          <MaterialIcons
                            name="add"
                            size={18}
                            color={colors.textMainLight}
                          />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <View style={[styles.footerButton, styles.footerBackButton]}>
            <Button
              title="Back"
              onPress={() => navigation.goBack()}
              variant="ghost"
            />
          </View>
          <Button
            title="Continue"
            onPress={goToReview}
            style={styles.footerButton}
          />
        </View>
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
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderLight,
  },
  stepBarActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textMainLight,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeToggle: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    padding: 3,
  },
  typePill: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  typePillActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  typePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  typePillTextActive: {
    color: colors.primary,
  },
  seedingList: {
    gap: 10,
  },
  seedingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  seedBadge: {
    width: 28,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  playerRating: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  unassignedTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  unassignedCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
  },
  unassignedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  unassignedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  unassignedAvatarPurple: {
    backgroundColor: "#EDE9FE",
  },
  unassignedAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  unassignedInfo: {
    flex: 1,
  },
  unassignedName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMainLight,
  },
  unassignedRating: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unassignedAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  teamsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  teamsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  addManuallyText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  teamCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  teamCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  teamSeedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  combinedEloLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  combinedEloValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  teamPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  teamAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  teamAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  teamPlayerInfo: {
    flex: 1,
  },
  teamPlayerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  teamPlayerRating: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  teamRemoveButton: {
    padding: 4,
    marginLeft: 4,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  footerBackButton: {
    backgroundColor: "#6B7280",
    borderRadius: 999,
    overflow: "hidden",
  },
  deleteAction: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginLeft: 8,
    paddingHorizontal: 16,
  },
});

