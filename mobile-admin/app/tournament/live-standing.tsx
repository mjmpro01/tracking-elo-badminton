import React from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { colors } from "../../theme/colors";
import { fetchTournamentStandings, StandingRow } from "../../lib/api/standings";

type RouteParams = {
  tournamentId: string;
  tournamentName: string;
};

export default function LiveStandingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tournamentId, tournamentName } = route.params as RouteParams;

  const { data, isLoading, isError } = useQuery<StandingRow[]>({
    queryKey: ["tournament-standings", tournamentId],
    queryFn: () => fetchTournamentStandings(tournamentId),
  });

  const standings = data ?? [];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  const renderAvatar = (row: StandingRow) => {
    if (row.isDoubles && row.members && row.members.length > 1) {
      const m1 = row.members[0];
      const m2 = row.members[1];
      return (
        <View style={styles.teamAvatarStack}>
          {m1 &&
            (m1.avatarUrl ? (
              <Image
                source={{ uri: m1.avatarUrl }}
                style={[styles.teamAvatarImage, styles.teamAvatarCircleLeft]}
              />
            ) : (
              <View
                style={[styles.teamAvatarCircle, styles.teamAvatarCircleLeft]}
              >
                <Text style={styles.avatarText}>{getInitials(m1.name)}</Text>
              </View>
            ))}
          {m2 &&
            (m2.avatarUrl ? (
              <Image
                source={{ uri: m2.avatarUrl }}
                style={[styles.teamAvatarImage, styles.teamAvatarCircleRight]}
              />
            ) : (
              <View
                style={[styles.teamAvatarCircle, styles.teamAvatarCircleRight]}
              >
                <Text style={styles.avatarText}>{getInitials(m2.name)}</Text>
              </View>
            ))}
        </View>
      );
    }

    if (row.avatarUrl) {
      return (
        <Image
          source={{ uri: row.avatarUrl }}
          style={styles.playerAvatarImage}
        />
      );
    }

    return (
      <View style={styles.playerAvatarCircle}>
        <Text style={styles.avatarText}>{getInitials(row.name)}</Text>
      </View>
    );
  };

  const renderRow = (row: StandingRow, index: number) => {
    const position = row.position ?? index + 1;
    const isGold = position === 1;
    const isSilver = position === 2;
    const isBronze = position === 3;

    const baseContainerStyle = (() => {
      if (isGold)
        return [styles.card, styles.cardGold];
      if (isSilver)
        return [styles.card, styles.cardSilver];
      if (isBronze)
        return [styles.card, styles.cardBronze];
      return [styles.card, styles.cardDefault];
    })();

    return (
      <View key={row.entryId} style={baseContainerStyle}>
        <View style={styles.cardContentRow}>
          <View style={styles.positionCell}>
            {isGold || isSilver || isBronze ? (
              <MaterialIcons
                name="emoji-events"
                size={20}
                color={
                  isGold
                    ? "#F59E0B"
                    : isSilver
                    ? "#9CA3AF"
                    : "#B45309"
                }
              />
            ) : (
              <Text style={styles.positionText}>{position}</Text>
            )}
          </View>
          <View style={styles.participantCell}>
            {renderAvatar(row)}
            <View>
              <Text style={styles.participantName}>{row.name}</Text>
              {row.elo != null && (
                <Text style={styles.participantMeta}>
                  Elo {row.elo}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{row.wins + row.losses}</Text>
            <Text style={styles.statLabel}>P</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{row.wins}</Text>
            <Text style={styles.statLabel}>W</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{row.losses}</Text>
            <Text style={styles.statLabel}>L</Text>
          </View>
          <View style={styles.pointsCell}>
            <Text style={styles.pointsValue}>{row.points}</Text>
            <Text style={styles.statLabel}>Pts</Text>
          </View>
        </View>
      </View>
    );
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
        <View style={{ flex: 1, alignItems: "center", marginRight: 32 }}>
          <Text style={styles.headerTitle}>{tournamentName}</Text>
          <Text style={styles.headerSubtitle}>Live Standings</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 0.7, textAlign: "center" }]}>
          #
        </Text>
        <Text style={[styles.tableHeaderText, { flex: 3 }]}>Participant</Text>
        <Text style={[styles.tableHeaderText, { flex: 0.6, textAlign: "center" }]}>
          P
        </Text>
        <Text style={[styles.tableHeaderText, { flex: 0.6, textAlign: "center" }]}>
          W
        </Text>
        <Text style={[styles.tableHeaderText, { flex: 0.6, textAlign: "center" }]}>
          L
        </Text>
        <Text style={[styles.tableHeaderText, { flex: 0.9, textAlign: "right" }]}>
          Pts
        </Text>
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.loadingWrapper}>
          <Text style={styles.errorText}>
            Không tải được standings. Vui lòng thử lại.
          </Text>
        </View>
      ) : standings.length === 0 ? (
        <View style={styles.loadingWrapper}>
          <Text style={styles.emptyText}>Chưa có standings cho giải này.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {standings.map(renderRow)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
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
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  cardGold: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  cardSilver: {
    backgroundColor: "#E5E7EB",
    borderColor: "#9CA3AF",
  },
  cardBronze: {
    backgroundColor: "#FFEDD5",
    borderColor: "#B45309",
  },
  cardDefault: {
    backgroundColor: "#ffffff",
    borderColor: colors.borderLight,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  positionCell: {
    flex: 0.7,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  participantCell: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  participantName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  participantMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statCell: {
    flex: 0.6,
    alignItems: "center",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  pointsCell: {
    flex: 0.9,
    alignItems: "flex-end",
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMainLight,
  },
});

