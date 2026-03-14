import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

import { colors } from "../../../theme/colors";
import { Button } from "../../../components/ui/Button";
import { usePlayers } from "../../../lib/hooks/usePlayers";

export default function CreateTournamentStep2Screen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const kFactor = route.params?.kFactor ?? 60;
  const tournamentName = route.params?.tournamentName as string | undefined;
  const startDate = route.params?.startDate as string | undefined;
  const coverImageUrl = route.params?.coverImageUrl as string | undefined;
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const { data: players, isLoading } = usePlayers(search || undefined);

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
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
    const allSelected = selectedIds.size === players.length;
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(players.map((p: any) => p.player_id as string)));
    }
  };

  const handleContinue = () => {
    if (selectedIds.size < 2) {
      setSelectionError("Please select at least 2 players");
      return;
    }
    setSelectionError(null);

    const selectedPlayers =
      players
        ?.filter((p: any) => selectedIds.has(p.player_id as string))
        .map((p: any) => ({
          id: p.player_id as string,
          name: p.full_name as string,
          rating: (p.rating as number | null) ?? null,
          avatarUrl: (p.avatar_url as string | null) ?? null,
        })) ?? [];

    navigation.navigate("CreateTournamentStep3Singles", {
      players: selectedPlayers,
      kFactor,
      tournamentName,
      startDate,
      coverImageUrl,
    });
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
        <Text style={styles.headerTitle}>Select Players</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepperRow}>
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={styles.stepBar} />
        <View style={styles.stepBar} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search players by name..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Header row */}
        <View style={styles.playersHeaderRow}>
          <Text style={styles.title}>Available Players</Text>
          <Pressable onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>Select All</Text>
          </Pressable>
        </View>

        {/* Player items */}
        <View style={styles.playersList}>
          {isLoading ? (
            <Text style={styles.loadingText}>Đang tải danh sách players...</Text>
          ) : !players || players.length === 0 ? (
            <Text style={styles.loadingText}>Không tìm thấy player nào.</Text>
          ) : (
            players.map((player: any) => {
              const id = player.player_id as string;
              const name = player.full_name as string;
              const rating = player.rating as number | null;
              const avatarUrl = player.avatar_url as string | null;
              const selected = selectedIds.has(id);

              const initials = name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase();

              return (
                <Pressable
                  key={id}
                  style={[
                    styles.playerItem,
                    selected && styles.playerItemActive,
                  ]}
                  onPress={() => togglePlayer(id)}
                >
                  <View style={styles.playerAvatar}>
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.playerAvatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.playerAvatarText}>{initials}</Text>
                    )}
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{name}</Text>
                    <Text style={styles.playerMeta}>
                      {rating != null ? `ELO: ${rating}` : "ELO: 1000"}
                    </Text>
                  </View>
                  <View style={styles.checkboxWrapper}>
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxChecked,
                      ]}
                    >
                      {selected && (
                        <MaterialIcons
                          name="check"
                          size={16}
                          color="#ffffff"
                        />
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {selectionError && (
          <Text style={styles.errorText}>{selectionError}</Text>
        )}

        {/* Quick Add banner (simplified) */}
        <View style={styles.quickAddCard}>
          <View style={styles.quickAddIcon}>
            <MaterialIcons name="person-add" size={20} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickAddTitle}>Can't find a player?</Text>
            <Text style={styles.quickAddSubtitle}>
              Add them quickly to the tournament list.
            </Text>
          </View>
          <Pressable
            style={styles.quickAddButton}
            onPress={() => navigation.navigate("AddPlayerQuick")}
          >
            <Text style={styles.quickAddButtonText}>Quick Add</Text>
          </Pressable>
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
            onPress={handleContinue}
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
  searchWrapper: {
    marginBottom: 16,
    paddingTop: 4,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textMainLight,
  },
  playersHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  playersList: {
    gap: 12,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  playerItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "0D",
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
  },
  playerAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  playerMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkboxWrapper: {
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAddCard: {
    marginTop: 20,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.primary + "0D",
    borderWidth: 1,
    borderColor: colors.primary + "33",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickAddIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAddTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  quickAddSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickAddButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickAddButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#DC2626",
    textAlign: "center",
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
});

