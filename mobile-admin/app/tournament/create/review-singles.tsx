import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { Button } from "../../../components/ui/Button";
import {
  createTournament,
  registerSinglesEntries,
} from "../../../lib/api/tournaments";

type PlayerReview = {
  id: string;
  name: string;
  rating: number | null;
  avatarUrl: string | null;
};

export default function TournamentReviewSinglesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const players: PlayerReview[] = route.params?.players ?? [];
  const kFactor: number = route.params?.kFactor ?? 60;
  const tournamentName: string =
    route.params?.tournamentName || "New Tournament";
  const startDateISO: string | undefined = route.params?.startDate;
  const coverImageUrl: string | undefined = route.params?.coverImageUrl;

  const formattedDate = startDateISO
    ? new Date(startDateISO).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "TBD";

  const sortedPlayers = [...players].sort(
    (a, b) => (b.rating ?? 1000) - (a.rating ?? 1000),
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);

      const payload: any = {
        name: tournamentName,
        k_factor: kFactor,
        cover_image_url: coverImageUrl ?? null,
        format: "singles",
        status: "upcoming",
        start_date: startDateISO ? startDateISO.slice(0, 10) : undefined,
      };

      const tournament = await createTournament(payload);

      await registerSinglesEntries({
        tournamentId: tournament.id,
        players: players.map((p) => ({ id: p.id })),
      });

      Alert.alert("Thành công", "Tournament đã được tạo.", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("Main");
          },
        },
      ]);
    } catch (error: any) {
      console.error("createTournament singles error", error);
      Alert.alert(
        "Lỗi",
        error?.message ?? "Không thể tạo tournament. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.headerRow}>
        <MaterialIcons
          name="arrow-back"
          size={24}
          color={colors.textMainLight}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Tournament Review (Singles)</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepperWrapper}>
        <View style={styles.stepperInfo}>
          <Text style={styles.stepperLabel}>Finish</Text>
          <Text style={styles.stepperCount}>4 of 4</Text>
        </View>
        <View style={styles.stepperRow}>
          <View style={[styles.stepBar, styles.stepBarActive]} />
          <View style={[styles.stepBar, styles.stepBarActive]} />
          <View style={[styles.stepBar, styles.stepBarActive]} />
          <View style={[styles.stepBar, styles.stepBarActive]} />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View>
              <Text style={styles.summaryLabel}>Tournament Name</Text>
              <Text style={styles.summaryValue}>{tournamentName}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{formattedDate}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Type</Text>
              <Text style={styles.summaryValue}>Singles</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>K-Factor</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={styles.summaryValue}>{kFactor}</Text>
                <MaterialIcons
                  name="help-outline"
                  size={14}
                  color={colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Selected participants */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Selected Participants</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {sortedPlayers.length} Players
              </Text>
            </View>
          </View>

          <View style={styles.participantsCard}>
            <View style={styles.participantsList}>
              {sortedPlayers.map((player, index) => {
                const initials = getInitials(player.name);
                const elo = player.rating ?? 1000;

                return (
                  <View key={player.id} style={styles.participantRow}>
                    <View style={styles.participantLeft}>
                      {player.avatarUrl ? (
                        <Image
                          source={{ uri: player.avatarUrl }}
                          style={styles.participantAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.participantAvatar}>
                          <Text style={styles.participantAvatarText}>
                            {initials}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text style={styles.participantName}>{player.name}</Text>
                        <Text style={styles.participantMeta}>
                          Current Rank #{index + 1}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.participantRight}>
                      <Text style={styles.participantElo}>{elo}</Text>
                      <Text style={styles.participantEloLabel}>Elo</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <Button
          title="Finish Setup"
          onPress={handleFinish}
          loading={submitting}
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  stepperWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  stepperInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  stepperCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
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
  summaryCard: {
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 12,
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMainLight,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  participantsCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  participantsList: {
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  participantLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  participantAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  participantAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMainLight,
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
  participantRight: {
    alignItems: "flex-end",
  },
  participantElo: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    fontFamily: "System",
  },
  participantEloLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});

