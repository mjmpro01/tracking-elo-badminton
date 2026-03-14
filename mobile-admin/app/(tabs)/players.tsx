import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchPlayersWithStats, PlayerWithStats } from "../../lib/api/players";
import { colors } from "../../theme/colors";

export default function PlayersScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: players, isLoading } = useQuery({
    queryKey: ["players-with-stats", { search: debouncedSearch }],
    queryFn: () => fetchPlayersWithStats({ search: debouncedSearch }),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const top3 = players?.slice(0, 3) || [];
  const allPlayers = players?.slice(3) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase();
  };

  const renderTop3Card = (player: PlayerWithStats, position: number) => {
    const isGold = position === 1;
    const isSilver = position === 2;
    const isBronze = position === 3;

    const badgeColor = isGold
      ? "#F59E0B"
      : isSilver
      ? "#9CA3AF"
      : "#B45309";

    const eloColor = isGold ? colors.primary : colors.textSecondary;

    return (
      <Pressable
        key={player.player_id}
        style={[
          styles.top3Card,
          isGold && styles.top3CardGold,
          (isSilver || isBronze) && styles.top3CardDefault,
        ]}
        onPress={() =>
          navigation.navigate("EditPlayer", { playerId: player.player_id })
        }
      >
        <View style={styles.top3AvatarContainer}>
          {player.avatar_url ? (
            <Image
              source={{ uri: player.avatar_url }}
              style={styles.top3Avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.top3AvatarPlaceholder}>
              <Text style={styles.top3AvatarText}>
                {getInitials(player.full_name)}
              </Text>
            </View>
          )}
          <View style={[styles.top3Badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.top3BadgeText}>{position}</Text>
          </View>
        </View>
        <Text style={styles.top3Name} numberOfLines={1}>
          {player.full_name.length > 12
            ? player.full_name.substring(0, 10) + "..."
            : player.full_name}
        </Text>
        <Text style={[styles.top3Elo, { color: eloColor }]}>
          {Math.round(player.rating)} ELO
        </Text>
      </Pressable>
    );
  };

  const renderPlayerRow = (player: PlayerWithStats, index: number) => {
    const rank = index + 4; // Top 3 đã hiển thị riêng

    return (
      <Pressable
        key={player.player_id}
        style={styles.playerRow}
        onPress={() =>
          navigation.navigate("EditPlayer", { playerId: player.player_id })
        }
      >
        <View style={styles.rankCircle}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        {player.avatar_url ? (
          <Image
            source={{ uri: player.avatar_url }}
            style={styles.playerAvatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.playerAvatarPlaceholder}>
            <Text style={styles.playerAvatarText}>
              {getInitials(player.full_name)}
            </Text>
          </View>
        )}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.full_name}
          </Text>
          <Text style={styles.playerMeta}>
            — Rank {rank} • {player.wins} Wins
          </Text>
        </View>
        <View style={styles.playerEloContainer}>
          <Text style={styles.playerElo}>{Math.round(player.rating)}</Text>
          <Text style={styles.playerEloLabel}>ELO</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rankings</Text>
          <Pressable style={styles.filterButton}>
            <MaterialIcons name="tune" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search players..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* TOP 3 PLAYERS */}
            {top3.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TOP 3 PLAYERS</Text>
                <View style={styles.top3Container}>
                  {top3.map((player, index) =>
                    renderTop3Card(player, index + 1),
                  )}
                </View>
              </View>
            )}

            {/* ALL PLAYERS */}
            {allPlayers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ALL PLAYERS</Text>
                <View style={styles.allPlayersContainer}>
                  {allPlayers.map((player, index) =>
                    renderPlayerRow(player, index),
                  )}
                </View>
              </View>
            )}

            {players?.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No players found</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("AddPlayerQuick")}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101622",
  },
  filterButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#101622",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101622",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  top3Container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  top3Card: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    minHeight: 180,
  },
  top3CardGold: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  top3CardDefault: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  top3AvatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  top3Avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  top3AvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  top3AvatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  top3Badge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  top3BadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  top3Name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#101622",
    marginBottom: 4,
    textAlign: "center",
  },
  top3Elo: {
    fontSize: 14,
    fontWeight: "600",
  },
  allPlayersContainer: {
    gap: 8,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101622",
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101622",
    marginBottom: 2,
  },
  playerMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playerEloContainer: {
    alignItems: "flex-end",
  },
  playerElo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101622",
  },
  playerEloLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
