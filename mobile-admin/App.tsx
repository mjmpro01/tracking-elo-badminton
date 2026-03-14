import { NavigationContainer, useNavigation, useRoute } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
  Image,
} from "react-native";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "./theme/colors";
import {
  fetchLatestTournament,
  fetchTodayMatches,
  LatestTournament,
  Match as DashboardMatch,
} from "./lib/api/dashboard";
import { fetchMatchesByTournament, MatchDisplay } from "./lib/api/matches";
import { useTournaments, useTournament } from "./lib/hooks/useTournaments";
import { TournamentStatus } from "./lib/api/tournaments";
import { AuthProvider, useAuthContext } from "./providers/AuthProvider";
import { Card } from "./components/ui/Card";
import { ListItem } from "./components/ui/ListItem";
import CreateTournamentStep1Screen from "./app/tournament/create/step1";
import CreateTournamentStep2Screen from "./app/tournament/create/step2";
import CreateTournamentStep3SinglesScreen from "./app/tournament/create/step3-singles";
import CreateTournamentStep3DoublesScreen from "./app/tournament/create/step3-doubles";
import TournamentReviewDoublesScreen from "./app/tournament/create/review-doubles";
import TournamentReviewSinglesScreen from "./app/tournament/create/review-singles";
import AddPlayerQuickScreen from "./app/players/add";
import EditPlayerScreen from "./app/players/edit";
import CreateMatchScreen from "./app/matches/create";
import EditMatchScoreScreen from "./app/matches/edit-score";
import LiveStandingsScreen from "./app/tournament/live-standing";
import FinalizeRankingScreen from "./app/tournament/finalize-ranking";
import PlayersScreenTab from "./app/(tabs)/players";
import TournamentsScreenTab from "./app/(tabs)/tournaments";
import DashboardScreenTab from "./app/(tabs)/dashboard";
import SettingsScreenTab from "./app/(tabs)/settings";

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TournamentDetail: { id: string };
   CreateMatch: {
    tournamentId: string;
    format: string;
  };
  EditMatchScore: {
    matchId: string;
    tournamentId: string;
    entryAName: string;
    entryBName: string;
    scoreA?: number[] | null;
    scoreB?: number[] | null;
  };
  LiveStandings: {
    tournamentId: string;
    tournamentName: string;
  };
  FinalizeRanking: {
    tournamentId: string;
    tournamentName: string;
  };
  CreateTournamentStep1: undefined;
  CreateTournamentStep2: {
    kFactor: number;
    tournamentName: string;
    startDate: string;
  };
  CreateTournamentStep3Singles: {
    players: {
      id: string;
      name: string;
      rating: number | null;
      avatarUrl: string | null;
    }[];
    kFactor: number;
    tournamentName: string;
    startDate: string;
  };
  CreateTournamentStep3Doubles: {
    players: {
      id: string;
      name: string;
      rating: number | null;
      avatarUrl: string | null;
    }[];
    kFactor: number;
    tournamentName: string;
    startDate: string;
  };
  TournamentReviewSingles: {
    players: {
      id: string;
      name: string;
      rating: number | null;
      avatarUrl: string | null;
    }[];
    kFactor: number;
    tournamentName: string;
    startDate: string;
  };
  TournamentReviewDoubles: {
    teams: {
      id: string;
      combinedElo: number;
      players: {
        id: string;
        name: string;
        rating: number | null;
        avatarUrl: string | null;
      }[];
    }[];
    players: {
      id: string;
      name: string;
      rating: number | null;
      avatarUrl: string | null;
    }[];
    kFactor: number;
    tournamentName: string;
    startDate: string;
  };
  AddPlayerQuick: undefined;
  EditPlayer: {
    playerId: string;
  };
};

type MainTabParamList = {
  Home: undefined;
  Tournaments: undefined;
  Players: undefined;
  Settings: undefined;
};

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundLight,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "600" }}>{title}</Text>
    </View>
  );
}

function DashboardScreen() {
  const navigation = useNavigation<any>();
  const {
    data: latestTournament,
    isLoading: isLoadingTournament,
    isError: isTournamentError,
  } = useQuery<LatestTournament | null>({
    queryKey: ["latestTournament"],
    queryFn: fetchLatestTournament,
  });

  const {
    data: todayMatches,
    isLoading: isLoadingMatches,
    isError: isMatchesError,
  } = useQuery<DashboardMatch[]>({
    queryKey: ["todayMatches"],
    queryFn: fetchTodayMatches,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundLight,
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceLight,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            backgroundColor: "#dbeafe",
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.textMain,
            }}
          >
            Admin Dashboard
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            Welcome back, Director
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Current Tournament */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.textMain,
              marginBottom: 12,
            }}
          >
            Current Tournament
          </Text>
          <View
            style={{
              borderRadius: 16,
              backgroundColor: colors.surfaceLight,
              borderWidth: 1,
              borderColor: colors.borderLight,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 120,
                backgroundColor: "#1f2937",
              }}
            />
            <View style={{ padding: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  {isLoadingTournament ? (
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textMuted,
                      }}
                    >
                      Loading current tournament...
                    </Text>
                  ) : isTournamentError ? (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#b91c1c",
                      }}
                    >
                      Failed to load tournament
                    </Text>
                  ) : latestTournament ? (
                    <>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: colors.textMain,
                        }}
                      >
                        {latestTournament.name}
                      </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: colors.primary,
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: colors.primary,
                      }}
                    >
                      {latestTournament.status ?? "Unknown"}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textMuted,
                      marginTop: 6,
                    }}
                  >
                    {latestTournament.total_entries ?? 0} entries ·{" "}
                    {latestTournament.start_date
                      ? `Started ${latestTournament.start_date}`
                      : "Start date TBC"}
                  </Text>
                  </>
                  ) : (
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textMuted,
                      }}
                    >
                      No finished/locked tournament yet.
                    </Text>
                  )}
                </View>
                <View>
                  <View
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#ffffff",
                      }}
                    >
                      Manage
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.textMain,
              marginBottom: 12,
            }}
          >
            Quick Actions
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {["Create Tournament", "Quick Add Player", "Enter Results"].map(
              (label) => (
                <Pressable
                key={label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceLight,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
                  onPress={
                    label === "Create Tournament"
                      ? () => navigation.navigate("Tournaments")
                      : undefined
                  }
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    backgroundColor: "#dbeafe",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    +
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    textAlign: "center",
                    color: colors.textMain,
                  }}
                >
                  {label}
                </Text>
                </Pressable>
              )
            )}
          </View>
        </View>

        {/* Today’s Matches */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.textMain,
              }}
            >
              Today&apos;s Matches
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.primary,
              }}
            >
              View all
            </Text>
          </View>

          {isLoadingMatches ? (
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
              }}
            >
              Loading today&apos;s matches...
            </Text>
          ) : isMatchesError ? (
            <Text
              style={{
                fontSize: 14,
                color: "#b91c1c",
              }}
            >
              Failed to load matches
            </Text>
          ) : todayMatches && todayMatches.length > 0 ? (
            todayMatches.map((match) => (
              <View
                key={match.id}
                style={{
                  marginBottom: 8,
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceLight,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textMain,
                    marginBottom: 4,
                  }}
                >
                  {match.court ? `Court ${match.court}` : "Court TBC"} ·{" "}
                  {match.status}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                  }}
                >
                  {match.scheduled_at
                    ? new Date(match.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Time TBC"}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
              }}
            >
              No matches scheduled for today.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TournamentsScreen() {
  type FilterValue = TournamentStatus | undefined;
  const navigation = useNavigation<any>();
  const [statusFilter, setStatusFilter] = useState<FilterValue>(undefined);

  const {
    data: tournaments,
    isLoading,
    isFetching,
    refetch,
  } = useTournaments(statusFilter);

  const handleRefresh = () => {
    refetch();
  };

  const renderStatusBadge = (status: TournamentStatus) => {
    let label = status;
    let background = "#e5e7eb";
    let textColor = colors.textSecondary;

    switch (status) {
      case "upcoming":
        label = "Upcoming";
        background = "#dbeafe";
        textColor = colors.primary;
        break;
      case "ongoing":
        label = "Ongoing";
        background = "#dcfce7";
        textColor = colors.success;
        break;
      case "finished":
        label = "Finished";
        background = "#e5e7eb";
        textColor = colors.textSecondary;
        break;
      case "locked":
        label = "Locked";
        background = "#fee2e2";
        textColor = colors.error;
        break;
    }

    return (
      <View style={[tournamentStyles.statusBadge, { backgroundColor: background }]}>
        <Text style={[tournamentStyles.statusBadgeText, { color: textColor }]}>
          {label}
        </Text>
      </View>
    );
  };

  const FILTERS: { label: string; value: FilterValue }[] = [
    { label: "All", value: undefined },
    { label: "Upcoming", value: "upcoming" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Finished", value: "finished" },
    { label: "Locked", value: "locked" },
  ];

  return (
    <View style={tournamentStyles.container}>
      <View style={tournamentStyles.headerRow}>
        <View>
          <Text style={tournamentStyles.title}>Tournaments</Text>
          <Text style={tournamentStyles.subtitle}>
            Danh sách tournaments với filter theo status.
          </Text>
        </View>
      </View>

      <Card style={tournamentStyles.filtersCard}>
        <View style={tournamentStyles.filtersHeader}>
          <Text style={tournamentStyles.filtersTitle}>Status</Text>
        </View>
        <View style={tournamentStyles.filtersChipsRow}>
          {FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;
            return (
              <Pressable
                key={filter.label}
                style={[tournamentStyles.chip, isActive && tournamentStyles.chipActive]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text
                  style={[
                    tournamentStyles.chipLabel,
                    isActive && tournamentStyles.chipLabelActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={tournamentStyles.listCard}>
        <View style={tournamentStyles.listHeaderRow}>
          <Text style={tournamentStyles.listTitle}>Danh sách tournaments</Text>
          {isFetching && !isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
        </View>

        {isLoading ? (
          <View style={tournamentStyles.loadingWrapper}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={tournamentStyles.loadingText}>Đang tải tournaments...</Text>
          </View>
        ) : (
          <FlatList
            data={tournaments ?? []}
            keyExtractor={(item) => item.id}
            refreshing={isFetching}
            onRefresh={handleRefresh}
            contentContainerStyle={
              (tournaments ?? []).length === 0
                ? tournamentStyles.emptyListContainer
                : undefined
            }
            ListEmptyComponent={
              <Text style={tournamentStyles.emptyText}>
                Không có tournament nào với bộ lọc hiện tại.
              </Text>
            }
            renderItem={({ item }) => (
              <ListItem
                title={item.name}
                subtitle={
                  item.start_date
                    ? `${item.format} · k=${item.k_factor}`
                    : item.format
                }
                left={
                  <View style={tournamentStyles.avatar}>
                    <MaterialIcons
                      name="emoji-events"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                }
                right={renderStatusBadge(item.status)}
                onPress={() =>
                  navigation.navigate("TournamentDetail", { id: item.id })
                }
              />
            )}
          />
        )}
      </Card>

      {/* Floating Add button */}
      <Pressable
        style={tournamentStyles.fab}
        onPress={() => {
          navigation.navigate("CreateTournamentStep1");
        }}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}

function TournamentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params ?? {};

  const {
    data: tournament,
    isLoading,
    isError,
    error,
  } = useTournament(id);

  const {
    data: matches,
    isLoading: isLoadingMatches,
  } = useQuery<MatchDisplay[]>({
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
    <SafeAreaView style={tournamentStyles.safeRoot}>
      <View style={tournamentStyles.container}>
      {/* Header */}
      <View style={tournamentStyles.headerRow}>
        <Pressable
          style={tournamentStyles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={colors.textMainLight}
          />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={tournamentStyles.headerTitle}>
            {tournament?.name ?? "Tournament Detail"}
          </Text>
          <Text style={tournamentStyles.headerSubtitle}>Match Management</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={tournamentStyles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={tournamentStyles.emptyText}>
            Đang tải thông tin tournament...
          </Text>
        </View>
      ) : isError || !tournament ? (
        <View style={tournamentStyles.center}>
          <Text style={tournamentStyles.emptyText}>
            {(error as any)?.message ?? "Không tải được tournament."}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={tournamentStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top actions */}
          <View style={tournamentStyles.actionsContainer}>
            <Pressable
              style={[
                tournamentStyles.primaryButton,
                isTournamentFinished && { opacity: 0.5 },
              ]}
              disabled={isTournamentFinished}
              onPress={() =>
                navigation.navigate("CreateMatch", {
                  tournamentId: tournament.id,
                  format: tournament.format,
                })
              }
            >
              <MaterialIcons name="add-circle" size={20} color="#ffffff" />
              <Text style={tournamentStyles.primaryButtonLabel}>
                Create Match
              </Text>
            </Pressable>

            <View style={tournamentStyles.secondaryButtonsRow}>
              <Pressable
                style={tournamentStyles.secondaryButton}
                onPress={() =>
                  navigation.navigate("LiveStandings", {
                    tournamentId: tournament.id,
                    tournamentName: tournament.name,
                  })
                }
              >
                <MaterialIcons
                  name="leaderboard"
                  size={18}
                  color={colors.primary}
                />
                <Text style={tournamentStyles.secondaryButtonLabel}>
                  Live Standings
                </Text>
              </Pressable>
              <Pressable
                style={tournamentStyles.secondaryButton}
                onPress={() =>
                  navigation.navigate("FinalizeRanking", {
                    tournamentId: tournament.id,
                    tournamentName: tournament.name,
                    tournamentStatus: tournament.status,
                  })
                }
              >
                <MaterialIcons
                  name="emoji-events"
                  size={18}
                  color={isTournamentFinished ? colors.textSecondary : colors.primary}
                />
                <Text style={tournamentStyles.secondaryButtonLabel}>
                  {isTournamentFinished ? "View Final Rankings" : "Finalize Rankings"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Singles matches */}
          <View style={tournamentStyles.roundSection}>
            <View style={tournamentStyles.roundHeaderRow}>
              <Text style={tournamentStyles.roundTitle}>
                SINGLES MATCHES
              </Text>
              <View style={tournamentStyles.roundStatusPill}>
                <Text style={tournamentStyles.roundStatusText}>
                  {singlesMatches.length} matches
                </Text>
              </View>
            </View>

            {isLoadingMatches ? (
              <View style={tournamentStyles.loadingWrapper}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : singlesMatches.length === 0 ? (
              <Text style={tournamentStyles.emptyText}>
                Chưa có singles match nào.
              </Text>
            ) : (
              singlesMatches.map((m) => {
                const hasScore =
                  m.scoreA &&
                  m.scoreB &&
                  m.scoreA.length === m.scoreB.length &&
                  m.scoreA.length > 0;
                const lastScoreA = hasScore
                  ? m.scoreA![m.scoreA!.length - 1]
                  : null;
                const lastScoreB = hasScore
                  ? m.scoreB![m.scoreB!.length - 1]
                  : null;
                const isFinished = m.status === "finished";
                const footerLabel = isFinished ? "Edit Result" : "Enter Score";
                const statusText =
                  m.status === "finished"
                    ? "Finished"
                    : m.status === "in_progress"
                    ? "In Progress"
                    : "Scheduled";

                return (
                  <View key={m.id} style={tournamentStyles.matchCard}>
                    <View style={tournamentStyles.matchBody}>
                      <View style={tournamentStyles.matchRow}>
                        <View style={tournamentStyles.playerInfo}>
                        {m.entryAAvatarUrl ? (
                          <Image
                            source={{ uri: m.entryAAvatarUrl }}
                            style={tournamentStyles.playerAvatarImage}
                          />
                        ) : (
                          <View style={tournamentStyles.playerAvatarCircle}>
                            <Text style={tournamentStyles.avatarText}>
                              {getInitials(m.entryAName)}
                            </Text>
                          </View>
                        )}
                          <View>
                            <Text style={tournamentStyles.playerName}>
                              {m.entryAName}{" "}
                              {m.entryAElo != null && (
                                <Text style={tournamentStyles.playerElo}>
                                  ({m.entryAElo})
                                </Text>
                              )}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={
                            hasScore
                              ? tournamentStyles.scoreText
                              : tournamentStyles.scoreTextMuted
                          }
                        >
                          {hasScore ? lastScoreA : "-"}
                        </Text>
                      </View>
                      <View style={tournamentStyles.matchRow}>
                        <View style={tournamentStyles.playerInfo}>
                          {m.entryBAvatarUrl ? (
                            <Image
                              source={{ uri: m.entryBAvatarUrl }}
                              style={tournamentStyles.playerAvatarImage}
                            />
                          ) : (
                            <View style={tournamentStyles.playerAvatarCircle}>
                              <Text style={tournamentStyles.avatarText}>
                                {getInitials(m.entryBName)}
                              </Text>
                            </View>
                          )}
                          <View>
                            <Text style={tournamentStyles.playerNameMuted}>
                              {m.entryBName}{" "}
                              {m.entryBElo != null && (
                                <Text style={tournamentStyles.playerEloMuted}>
                                  ({m.entryBElo})
                                </Text>
                              )}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={
                            hasScore
                              ? tournamentStyles.scoreText
                              : tournamentStyles.scoreTextMuted
                          }
                        >
                          {hasScore ? lastScoreB : "-"}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={tournamentStyles.matchFooter}
                      disabled={isTournamentFinished}
                      onPress={() => {
                        if (isTournamentFinished) return;
                        navigation.navigate("EditMatchScore", {
                          matchId: m.id,
                          tournamentId: tournament.id,
                          entryAName: m.entryAName,
                          entryBName: m.entryBName,
                          scoreA: m.scoreA,
                          scoreB: m.scoreB,
                        });
                      }}
                    >
                      <View style={tournamentStyles.finalBadge}>
                        <Text
                          style={[
                            tournamentStyles.finalBadgeText,
                            !isFinished && { color: colors.textSecondary },
                          ]}
                        >
                          {statusText}
                        </Text>
                      </View>
                      <Text
                        style={[
                          tournamentStyles.footerActionPrimary,
                          isTournamentFinished && { color: colors.textMuted },
                        ]}
                      >
                        {footerLabel}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>

          {/* Doubles matches */}
          <View style={tournamentStyles.roundSection}>
            <View style={tournamentStyles.roundHeaderRow}>
              <Text style={tournamentStyles.roundTitle}>
                DOUBLES MATCHES
              </Text>
              <View
                style={[
                  tournamentStyles.roundStatusPill,
                  { backgroundColor: "#dbeafe" },
                ]}
              >
                <Text
                  style={[
                    tournamentStyles.roundStatusText,
                    { color: colors.primary },
                  ]}
                >
                  {doublesMatches.length} matches
                </Text>
              </View>
            </View>

            {isLoadingMatches ? (
              <View style={tournamentStyles.loadingWrapper}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : doublesMatches.length === 0 ? (
              <Text style={tournamentStyles.emptyText}>
                Chưa có doubles match nào.
              </Text>
            ) : (
              doublesMatches.map((m) => {
                const hasScore =
                  m.scoreA &&
                  m.scoreB &&
                  m.scoreA.length === m.scoreB.length &&
                  m.scoreA.length > 0;
                const lastScoreA = hasScore
                  ? m.scoreA![m.scoreA!.length - 1]
                  : null;
                const lastScoreB = hasScore
                  ? m.scoreB![m.scoreB!.length - 1]
                  : null;
                const isFinished = m.status === "finished";
                const footerLabel = isFinished ? "Edit Result" : "Enter Score";
                const statusText =
                  m.status === "finished"
                    ? "Finished"
                    : m.status === "in_progress"
                    ? "In Progress"
                    : "Scheduled";

                const teamAMembers = m.entryATeamMembers ?? [];
                const teamBMembers = m.entryBTeamMembers ?? [];
                const teamAFirst = teamAMembers[0];
                const teamASecond = teamAMembers[1];
                const teamBFirst = teamBMembers[0];
                const teamBSecond = teamBMembers[1];

                return (
                  <View
                    key={m.id}
                    style={tournamentStyles.matchCardHighlighted}
                  >
                    <View style={tournamentStyles.matchBody}>
                      <View style={tournamentStyles.matchRow}>
                        <View style={tournamentStyles.playerInfo}>
                          <View style={tournamentStyles.teamAvatarStack}>
                            {teamAFirst ? (
                              teamAFirst.avatarUrl ? (
                                <Image
                                  source={{ uri: teamAFirst.avatarUrl }}
                                  style={[
                                    tournamentStyles.teamAvatarImage,
                                    tournamentStyles.teamAvatarCircleLeft,
                                  ]}
                                />
                              ) : (
                                <View
                                  style={[
                                    tournamentStyles.teamAvatarCircle,
                                    tournamentStyles.teamAvatarCircleLeft,
                                  ]}
                                >
                                  <Text style={tournamentStyles.avatarText}>
                                    {getInitials(teamAFirst.name)}
                                  </Text>
                                </View>
                              )
                            ) : null}
                            {teamASecond ? (
                              teamASecond.avatarUrl ? (
                                <Image
                                  source={{ uri: teamASecond.avatarUrl }}
                                  style={[
                                    tournamentStyles.teamAvatarImage,
                                    tournamentStyles.teamAvatarCircleRight,
                                  ]}
                                />
                              ) : (
                                <View
                                  style={[
                                    tournamentStyles.teamAvatarCircle,
                                    tournamentStyles.teamAvatarCircleRight,
                                  ]}
                                >
                                  <Text style={tournamentStyles.avatarText}>
                                    {getInitials(teamASecond.name)}
                                  </Text>
                                </View>
                              )
                            ) : null}
                          </View>
                          <View>
                            <Text style={tournamentStyles.playerName}>
                              {m.entryAName}{" "}
                              {m.entryAElo != null && (
                                <Text style={tournamentStyles.playerElo}>
                                  ({m.entryAElo})
                                </Text>
                              )}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={
                            hasScore
                              ? tournamentStyles.scoreText
                              : tournamentStyles.scoreTextMuted
                          }
                        >
                          {hasScore ? lastScoreA : "-"}
                        </Text>
                      </View>
                      <View style={tournamentStyles.matchRow}>
                        <View style={tournamentStyles.playerInfo}>
                          <View style={tournamentStyles.teamAvatarStack}>
                            {teamBFirst ? (
                              teamBFirst.avatarUrl ? (
                                <Image
                                  source={{ uri: teamBFirst.avatarUrl }}
                                  style={[
                                    tournamentStyles.teamAvatarImage,
                                    tournamentStyles.teamAvatarCircleLeft,
                                  ]}
                                />
                              ) : (
                                <View
                                  style={[
                                    tournamentStyles.teamAvatarCircle,
                                    tournamentStyles.teamAvatarCircleLeft,
                                  ]}
                                >
                                  <Text style={tournamentStyles.avatarText}>
                                    {getInitials(teamBFirst.name)}
                                  </Text>
                                </View>
                              )
                            ) : null}
                            {teamBSecond ? (
                              teamBSecond.avatarUrl ? (
                                <Image
                                  source={{ uri: teamBSecond.avatarUrl }}
                                  style={[
                                    tournamentStyles.teamAvatarImage,
                                    tournamentStyles.teamAvatarCircleRight,
                                  ]}
                                />
                              ) : (
                                <View
                                  style={[
                                    tournamentStyles.teamAvatarCircle,
                                    tournamentStyles.teamAvatarCircleRight,
                                  ]}
                                >
                                  <Text style={tournamentStyles.avatarText}>
                                    {getInitials(teamBSecond.name)}
                                  </Text>
                                </View>
                              )
                            ) : null}
                          </View>
                          <View>
                            <Text style={tournamentStyles.playerName}>
                              {m.entryBName}{" "}
                              {m.entryBElo != null && (
                                <Text style={tournamentStyles.playerElo}>
                                  ({m.entryBElo})
                                </Text>
                              )}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={
                            hasScore
                              ? tournamentStyles.scoreText
                              : tournamentStyles.scoreTextMuted
                          }
                        >
                          {hasScore ? lastScoreB : "-"}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={tournamentStyles.matchFooter}
                      disabled={isTournamentFinished}
                      onPress={() => {
                        if (isTournamentFinished) return;
                        navigation.navigate("EditMatchScore", {
                          matchId: m.id,
                          tournamentId: tournament.id,
                          entryAName: m.entryAName,
                          entryBName: m.entryBName,
                          scoreA: m.scoreA,
                          scoreB: m.scoreB,
                        });
                      }}
                    >
                      <View style={tournamentStyles.finalBadge}>
                        <Text
                          style={[
                            tournamentStyles.finalBadgeText,
                            !isFinished && { color: colors.textSecondary },
                          ]}
                        >
                          {statusText}
                        </Text>
                      </View>
                      <Text
                        style={[
                          tournamentStyles.footerActionPrimary,
                          isTournamentFinished && { color: colors.textMuted },
                        ]}
                      >
                        {footerLabel}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
      </View>
    </SafeAreaView>
  );
}

const tournamentStyles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  filtersCard: {
    marginBottom: 12,
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  filtersChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "#ffffff",
  },
  chipActive: {
    backgroundColor: colors.primary + "11",
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  listCard: {
    flex: 1,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  loadingWrapper: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyListContainer: {
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + "11",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryButtonsRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryButtonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  roundSection: {
    marginTop: 16,
  },
  roundHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  roundTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.textSecondary,
  },
  roundStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  roundStatusText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  matchCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
    overflow: "hidden",
  },
  matchCardHighlighted: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.primary + "33",
    marginBottom: 10,
    overflow: "hidden",
  },
  matchBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  teamAvatarStack: {
    flexDirection: "row",
    marginRight: 4,
  },
  teamAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  teamAvatarCircleLeft: {},
  teamAvatarCircleRight: {
    marginLeft: -10,
  },
  teamAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  playerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  playerNameMuted: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  playerElo: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "400",
  },
  playerEloMuted: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "400",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  scoreTextMuted: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  matchFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: "#f9fafb",
  },
  finalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  finalBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  footerActionPrimary: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  playerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  playerAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  playerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMainLight,
  },
});


function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreenTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
          title: "Home",
        }}
      />
      <Tab.Screen
        name="Tournaments"
        component={TournamentsScreenTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="emoji-events" size={size} color={color} />
          ),
          title: "Tournaments",
        }}
      />
      <Tab.Screen
        name="Players"
        component={PlayersScreenTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
          title: "Players",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreenTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
          title: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}

function AuthScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập email và password");
      return;
    }

    setError(null);

    try {
      await signIn({ email, password });
      navigation.replace("Main");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.backgroundLight,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 48,
        }}
      >
        {/* Decorative background gradients */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 256,
            backgroundColor: `${colors.primary}0D`, // primary/5
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -128,
            right: -128,
            width: 256,
            height: 256,
            borderRadius: 128,
            backgroundColor: `${colors.primary}0D`, // primary/5
            opacity: 0.5,
          }}
        />

        {/* Main Content Container */}
        <View
          style={{
            width: "100%",
            maxWidth: 440,
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Header / Logo Area */}
          <View style={{ alignItems: "center", gap: 16, textAlign: "center" }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: `${colors.primary}1A`, // primary/10
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <MaterialIcons name="admin-panel-settings" size={36} color={colors.primary} />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "700",
                  color: colors.textMain,
                  letterSpacing: -0.5,
                }}
              >
                Admin Portal
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  marginTop: 4,
                }}
              >
                Manage tournaments and ratings securely
              </Text>
            </View>
          </View>

          {/* Login Form Card */}
          <View
            style={{
              width: "100%",
              backgroundColor: colors.surfaceLight,
              borderRadius: 28,
              padding: 32,
              gap: 24,
              shadowColor: "#94a3b8",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.5,
              shadowRadius: 25,
              elevation: 12,
              borderWidth: 1,
              borderColor: `${colors.borderLight}99`, // slate-200/60
            }}
          >
            {/* Email Input */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.textMain,
                }}
              >
                Email or Username
              </Text>
              <View style={{ position: "relative" }}>
                <View
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  <MaterialIcons name="person" size={20} color={colors.textMuted} />
                </View>
                <TextInput
                  style={{
                    width: "100%",
                    paddingLeft: 40,
                    paddingRight: 16,
                    paddingVertical: 14,
                    backgroundColor: "#f8fafc80", // slate-50/50
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    borderRadius: 12,
                    fontSize: 16,
                    color: colors.textMain,
                  }}
                  placeholder="admin@tournament.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.textMain,
                  }}
                >
                  Password
                </Text>
                <Pressable>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.primary,
                    }}
                  >
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>
              <View style={{ position: "relative" }}>
                <View
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  <MaterialIcons name="lock" size={20} color={colors.textMuted} />
                </View>
                <TextInput
                  style={{
                    width: "100%",
                    paddingLeft: 40,
                    paddingRight: 48,
                    paddingVertical: 14,
                    backgroundColor: "#f8fafc80", // slate-50/50
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    borderRadius: 12,
                    fontSize: 16,
                    color: colors.textMain,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {error && (
              <View
                style={{
                  backgroundColor: "#fee2e2",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: colors.error, fontSize: 14 }}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                width: "100%",
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 12,
                marginTop: 16,
                opacity: loading ? 0.6 : pressed ? 0.95 : 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
              })}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {loading ? "Đang đăng nhập..." : "Login as Admin"}
              </Text>
              {loading ? null : (
                <MaterialIcons name="login" size={20} color="#ffffff" />
              )}
            </Pressable>
          </View>

          {/* Help / Contact */}
          <View style={{ alignItems: "center", gap: 16, marginTop: 16 }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textMuted,
                textAlign: "center",
              }}
            >
              Having trouble accessing your account?
            </Text>
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: "#f1f5f9", // slate-100
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialIcons name="support-agent" size={18} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.textSecondary,
                }}
              >
                Contact Super Admin
              </Text>
            </Pressable>
          </View>

          {/* Footer / Version */}
          <View style={{ marginTop: 32 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: colors.textMuted,
                letterSpacing: 3,
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              Tournament Manager Admin v2.4.0
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="TournamentDetail"
              component={TournamentDetailScreen}
            />
            <Stack.Screen
                name="CreateTournamentStep1"
                component={CreateTournamentStep1Screen}
              />
            <Stack.Screen
              name="CreateTournamentStep2"
              component={CreateTournamentStep2Screen}
            />
            <Stack.Screen
              name="CreateTournamentStep3Singles"
              component={CreateTournamentStep3SinglesScreen}
            />
            <Stack.Screen
              name="CreateTournamentStep3Doubles"
              component={CreateTournamentStep3DoublesScreen}
            />
            <Stack.Screen
              name="TournamentReviewDoubles"
              component={TournamentReviewDoublesScreen}
            />
            <Stack.Screen
              name="TournamentReviewSingles"
              component={TournamentReviewSinglesScreen}
            />
            <Stack.Screen name="AddPlayerQuick" component={AddPlayerQuickScreen} />
            <Stack.Screen name="EditPlayer" component={EditPlayerScreen} />
            <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
            <Stack.Screen name="EditMatchScore" component={EditMatchScoreScreen} />
            <Stack.Screen name="LiveStandings" component={LiveStandingsScreen} />
            <Stack.Screen name="FinalizeRanking" component={FinalizeRankingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

